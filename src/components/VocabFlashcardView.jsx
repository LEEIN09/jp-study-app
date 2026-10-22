import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  Layers,
  List,
  ArrowRight,
  Zap,
  Keyboard,
  MousePointerClick,
  AlertCircle
} from 'lucide-react';
import { VOCAB_CATEGORIES, VOCAB_DATA } from '../data/vocabData';
import { speakJapanese } from '../utils/tts';
import NekoMascot from './NekoMascot';

// 단어 주관식 타이핑 정답 판정 (한국어 발음 또는 뜻 모두 허용!)
function isVocabTypingCorrect(inputRaw, wordItem) {
  const input = (inputRaw || '').trim().replace(/\s+/g, '');
  if (!input) return false;

  const cleanKr = wordItem.kr.replace(/[-~\s]/g, '');
  const rawKr = wordItem.kr.replace(/\s+/g, '');

  // 뜻에서 괄호나 슬래시로 나뉜 핵심 키워드 추출
  const meaningParts = wordItem.meaning
    .replace(/\(.*?\)/g, '')
    .split(/[\/·,]/)
    .map(s => s.trim().replace(/\s+/g, ''))
    .filter(Boolean);

  const accepted = new Set([cleanKr, rawKr, wordItem.kana, ...meaningParts]);
  return accepted.has(input);
}

export default function VocabFlashcardView({ studyState, onUpdateVocab }) {
  const [selectedCategory, setSelectedCategory] = useState('step1');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'quiz' | 'list'
  const [filterUnmastered, setFilterUnmastered] = useState(false);

  // 플래시카드 상태
  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // 리스트 모드 상태
  const [hideAnswerInList, setHideAnswerInList] = useState(false);
  const [revealedIds, setRevealedIds] = useState({});

  // 단어 스피드 퀴즈 상태
  const [quizAnswerType, setQuizAnswerType] = useState('choice'); // 'choice' | 'typing'
  const [quizDirection, setQuizDirection] = useState('jp-to-kr'); // 'jp-to-kr' | 'kr-to-jp'
  const [vocabQ, setVocabQ] = useState(null);
  const [selectedOptIdx, setSelectedOptIdx] = useState(null);
  const [vocabTypingInput, setVocabTypingInput] = useState('');
  const [vocabTypingFlash, setVocabTypingFlash] = useState(false);
  const [isQuizFeedback, setIsQuizFeedback] = useState(false);
  const [quizLastWrong, setQuizLastWrong] = useState(false);
  const [quizStreak, setQuizStreak] = useState(0);

  const vocabInputRef = useRef(null);

  const categoryWords = useMemo(() => {
    const base = VOCAB_DATA.filter(v => v.category === selectedCategory);
    if (filterUnmastered) {
      const filtered = base.filter(v => studyState.vocabStatus[v.id] !== 'mastered');
      return filtered.length > 0 ? filtered : base;
    }
    return base;
  }, [selectedCategory, filterUnmastered, studyState.vocabStatus]);

  useEffect(() => {
    setCardIndex(0);
    setIsRevealed(false);
  }, [selectedCategory, filterUnmastered]);

  const currentWord = categoryWords[cardIndex] || categoryWords[0];

  // 단어 스피드 퀴즈 문제 생성
  const generateVocabQuestion = useCallback((prevId = null) => {
    if (!categoryWords || categoryWords.length === 0) return;

    const pool = categoryWords.length > 1
      ? categoryWords.filter(w => w.id !== prevId)
      : categoryWords;

    // 아직 안 외운 단어 가중치 부여
    const weighted = pool.map(w => ({
      word: w,
      weight: studyState.vocabStatus[w.id] === 'mastered' ? 0.5 : 2.5
    }));
    const totalW = weighted.reduce((a, b) => a + b.weight, 0);
    let r = Math.random() * totalW;
    let target = weighted[0].word;
    for (const item of weighted) {
      r -= item.weight;
      if (r <= 0) {
        target = item.word;
        break;
      }
    }

    // 오답 보기 3개 추출 (같은 카테고리 우선)
    const distractorPool = VOCAB_DATA.filter(w => w.id !== target.id);
    const sameCatDistractors = distractorPool
      .filter(w => w.category === target.category)
      .sort(() => Math.random() - 0.5);

    const chosenDistractors = sameCatDistractors.slice(0, 3);
    while (chosenDistractors.length < 3) {
      const pick = distractorPool[Math.floor(Math.random() * distractorPool.length)];
      if (!chosenDistractors.some(d => d.id === pick.id)) {
        chosenDistractors.push(pick);
      }
    }

    const options = [target, ...chosenDistractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.findIndex(o => o.id === target.id);

    setVocabQ({ target, options, correctIndex });
    setSelectedOptIdx(null);
    setVocabTypingInput('');
    setVocabTypingFlash(false);
    setIsQuizFeedback(false);
    setQuizLastWrong(false);

    if (quizDirection === 'jp-to-kr') {
      speakJapanese(target.kana, studyState.settings.slowAudio);
    }

    setTimeout(() => {
      if (vocabInputRef.current) vocabInputRef.current.focus();
    }, 30);
  }, [categoryWords, quizDirection, studyState.vocabStatus, studyState.settings.slowAudio]);

  useEffect(() => {
    if (viewMode === 'quiz') {
      generateVocabQuestion(null);
    }
  }, [viewMode, selectedCategory, filterUnmastered, quizDirection, quizAnswerType]);

  const handleSelectVocabOption = useCallback((idx) => {
    if (!vocabQ || isQuizFeedback) return;

    setSelectedOptIdx(idx);
    setIsQuizFeedback(true);

    const isCorrect = idx === vocabQ.correctIndex;
    setQuizStreak(s => (isCorrect ? s + 1 : 0));
    speakJapanese(vocabQ.target.kana, studyState.settings.slowAudio);

    if (isCorrect) {
      onUpdateVocab(vocabQ.target.id, 'mastered');
      setTimeout(() => {
        generateVocabQuestion(vocabQ.target.id);
      }, 240);
    } else {
      onUpdateVocab(vocabQ.target.id, 'learning');
      setQuizLastWrong(true);
    }
  }, [vocabQ, isQuizFeedback, onUpdateVocab, generateVocabQuestion, studyState.settings.slowAudio]);

  const handleVocabTypingSubmit = (e) => {
    e.preventDefault();
    if (!vocabQ) return;

    if (quizLastWrong) {
      generateVocabQuestion(vocabQ.target.id);
      return;
    }

    if (isQuizFeedback || !vocabTypingInput.trim()) return;

    setIsQuizFeedback(true);
    const isCorrect = isVocabTypingCorrect(vocabTypingInput, vocabQ.target);
    setQuizStreak(s => (isCorrect ? s + 1 : 0));
    speakJapanese(vocabQ.target.kana, studyState.settings.slowAudio);

    if (isCorrect) {
      setVocabTypingFlash(true);
      onUpdateVocab(vocabQ.target.id, 'mastered');
      setTimeout(() => {
        generateVocabQuestion(vocabQ.target.id);
      }, 250);
    } else {
      onUpdateVocab(vocabQ.target.id, 'learning');
      setQuizLastWrong(true);
    }
  };

  const handleReveal = () => {
    if (!currentWord) return;
    setIsRevealed(true);
    speakJapanese(currentWord.kana, studyState.settings.slowAudio);
  };

  const handleRateCard = (status) => {
    if (!currentWord) return;
    onUpdateVocab(currentWord.id, status);
    setIsRevealed(false);
    setCardIndex(prev => (prev + 1) % categoryWords.length);
  };

  // 키보드 단축키 (카드 모드 & 단어 퀴즈 모드)
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;

      if (viewMode === 'card') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!isRevealed) handleReveal();
          else handleRateCard('mastered');
        } else if (e.key === '1' && isRevealed) {
          handleRateCard('learning');
        } else if (e.key === '2' && isRevealed) {
          handleRateCard('mastered');
        }
      } else if (viewMode === 'quiz') {
        if (quizAnswerType === 'choice' && ['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
          const idx = parseInt(e.key, 10) - 1;
          if (!isQuizFeedback) handleSelectVocabOption(idx);
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (quizLastWrong && vocabQ) {
            generateVocabQuestion(vocabQ.target.id);
          } else if (vocabQ) {
            speakJapanese(vocabQ.target.kana, studyState.settings.slowAudio);
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    viewMode,
    isRevealed,
    currentWord,
    categoryWords.length,
    quizAnswerType,
    isQuizFeedback,
    quizLastWrong,
    vocabQ,
    handleSelectVocabOption,
    generateVocabQuestion,
    studyState.settings.slowAudio
  ]);

  const toggleListReveal = (id, kana) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
    speakJapanese(kana, studyState.settings.slowAudio);
  };

  return (
    <div className="space-y-6">
      {/* 단계별 단어장 책갈피 탭 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {VOCAB_CATEGORIES.map(cat => {
          const total = VOCAB_DATA.filter(v => v.category === cat.id).length;
          const done = VOCAB_DATA.filter(v => v.category === cat.id && studyState.vocabStatus[v.id] === 'mastered').length;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between"
              style={
                isActive
                  ? {
                      backgroundColor: '#FEF9C3',
                      border: '2.5px solid #D97706',
                      boxShadow: '0 4px 0 #D97706'
                    }
                  : {
                      backgroundColor: '#FFFDF8',
                      border: '2px solid #D5C7B2',
                      boxShadow: '0 3px 0 #DFD3C0'
                    }
              }
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="text-xs font-extrabold px-2.5 py-0.5 rounded-full"
                    style={
                      isActive
                        ? { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                        : { backgroundColor: '#E8DEC8', color: '#5C4E41' }
                    }
                  >
                    🍃 {cat.badge}
                  </span>
                  <span className="text-xs font-black" style={{ color: '#2D4A3E' }}>
                    {done}/{total} 완료
                  </span>
                </div>
                <h3 className="font-black text-sm mt-1.5" style={{ color: '#2D4A3E' }}>{cat.title}</h3>
                <p className="text-xs mt-1 line-clamp-2 font-semibold" style={{ color: '#7D6E5D' }}>{cat.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 컨트롤 바 (카드 / 스피드 퀴즈 / 단어 공책) */}
      <div className="ghibli-paper rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('card')}
            className="px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition"
            style={
              viewMode === 'card'
                ? { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
            }
          >
            <Layers className="w-3.5 h-3.5" />
            1. 한 장씩 암기 카드
          </button>
          <button
            onClick={() => setViewMode('quiz')}
            className="px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition"
            style={
              viewMode === 'quiz'
                ? { backgroundColor: '#D97706', color: '#FFFFFF', boxShadow: '0 2px 0 #92400E' }
                : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
            }
          >
            <Zap className="w-3.5 h-3.5" />
            2. ⚡ 단어 칠판 스피드 퀴즈
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition"
            style={
              viewMode === 'list'
                ? { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
            }
          >
            <List className="w-3.5 h-3.5" />
            3. 전체 단어 공책
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'list' && (
            <button
              onClick={() => {
                setHideAnswerInList(!hideAnswerInList);
                setRevealedIds({});
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition"
              style={
                hideAnswerInList
                  ? { backgroundColor: '#D97706', color: '#FFFFFF' }
                  : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
              }
            >
              {hideAnswerInList ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {hideAnswerInList ? '발음·뜻 모두 보이기' : '발음·뜻 가리고 읽기 연습'}
            </button>
          )}

          <label
            className="flex items-center gap-1.5 text-xs font-extrabold cursor-pointer select-none px-3.5 py-1.5 rounded-full"
            style={{ backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }}
          >
            <input
              type="checkbox"
              checked={filterUnmastered}
              onChange={(e) => setFilterUnmastered(e.target.checked)}
              className="rounded"
            />
            안 외운 단어만 보기
          </label>
        </div>
      </div>

      {/* =========================================================
          모드 1: 한 장씩 넘겨보는 플래시카드
      ========================================================= */}
      {viewMode === 'card' && currentWord && (
        <div className="max-w-2xl mx-auto">
          <div className="ghibli-paper rounded-3xl p-6 sm:p-10 text-center space-y-6">
            <div className="flex items-center justify-between text-xs font-extrabold" style={{ color: '#8C7A6B' }}>
              <span className="flex items-center gap-2">
                <NekoMascot mood={isRevealed ? 'happy' : 'normal'} size="sm" />
                <span>단어 카드 {cardIndex + 1} / {categoryWords.length}</span>
              </span>
              <button
                onClick={() => speakJapanese(currentWord.kana, studyState.settings.slowAudio)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full cursor-pointer font-extrabold"
                style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
              >
                <Volume2 className="w-4 h-4" /> 발음 듣기
              </button>
            </div>

            <div className="ghibli-chalkboard rounded-2xl py-8 px-4">
              <div className="text-5xl sm:text-7xl font-black tracking-wide text-white">
                {currentWord.kana}
              </div>
              <p className="text-xs mt-3 font-bold" style={{ color: '#FDE68A' }}>
                🐾 먼저 히라가나/가타카나를 소리 내어 읽어본 뒤 정답을 펼쳐보세요!
              </p>
            </div>

            {!isRevealed ? (
              <button
                onClick={handleReveal}
                className="w-full max-w-md mx-auto py-4 rounded-2xl font-black text-base transition cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #D97706', boxShadow: '0 4px 0 #B45309' }}
              >
                발음 & 뜻 펼쳐보기 (Space) <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                <div
                  className="p-5 rounded-2xl max-w-lg mx-auto space-y-2"
                  style={{ backgroundColor: '#FAF6EE', border: '2px dashed #C7B69E' }}
                >
                  <div className="text-2xl font-black" style={{ color: '#B45309' }}>
                    [{currentWord.kr}] — <span style={{ color: '#2D4A3E' }}>{currentWord.meaning}</span>
                  </div>
                  <div className="text-xs font-bold" style={{ color: '#7D6E5D' }}>
                    한자/원어 표기: <span className="font-black" style={{ color: '#3A322C' }}>{currentWord.kanji}</span>
                  </div>
                  <div
                    className="text-xs px-3.5 py-1.5 rounded-full inline-block font-extrabold"
                    style={{ backgroundColor: '#ECFCCB', border: '1.5px solid #84CC16', color: '#365314' }}
                  >
                    🧩 한 글자씩 쪼개 읽기: {currentWord.tip}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => handleRateCard('learning')}
                    className="py-3.5 px-4 rounded-2xl font-black text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '2px solid #F59E0B' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    1. 한 번 더 볼래요
                  </button>
                  <button
                    onClick={() => handleRateCard('mastered')}
                    className="py-3.5 px-4 rounded-2xl font-black text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8', border: '2px solid #1B2E26' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    2. 완벽히 읽었어요! 💮
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          모드 2: 단어 칠판 스피드 퀴즈 (4지선다 & 주관식 타이핑)
      ========================================================= */}
      {viewMode === 'quiz' && vocabQ && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* 퀴즈 세부 옵션 바 */}
          <div className="ghibli-paper rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setQuizAnswerType('choice')}
                className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer transition"
                style={
                  quizAnswerType === 'choice'
                    ? { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                    : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
                }
              >
                <MousePointerClick className="w-3.5 h-3.5" />
                4지선다 스피드
              </button>
              <button
                onClick={() => {
                  setQuizAnswerType('typing');
                  setQuizDirection('jp-to-kr');
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer transition"
                style={
                  quizAnswerType === 'typing'
                    ? { backgroundColor: '#D97706', color: '#FFFFFF' }
                    : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
                }
              >
                <Keyboard className="w-3.5 h-3.5" />
                ⌨️ 발음/뜻 직접 타이핑
              </button>
            </div>

            {quizAnswerType === 'choice' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setQuizDirection('jp-to-kr')}
                  className="px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer"
                  style={
                    quizDirection === 'jp-to-kr'
                      ? { backgroundColor: '#B45309', color: '#FFFBEB' }
                      : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
                  }
                >
                  일본어 → 뜻·발음
                </button>
                <button
                  onClick={() => setQuizDirection('kr-to-jp')}
                  className="px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer"
                  style={
                    quizDirection === 'kr-to-jp'
                      ? { backgroundColor: '#B45309', color: '#FFFBEB' }
                      : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
                  }
                >
                  한국어 뜻 → 일본어
                </button>
              </div>
            )}

            <span
              className="px-3 py-1 rounded-full text-xs font-black"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }}
            >
              🍃 연속 {quizStreak}단어 성공!
            </span>
          </div>

          {/* 단어 칠판 보드 */}
          <div className="ghibli-chalkboard rounded-3xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-between text-xs font-bold mb-2" style={{ color: '#FDE68A' }}>
              <div className="flex items-center gap-2">
                <NekoMascot mood={quizLastWrong ? 'oops' : quizStreak >= 4 ? 'happy' : 'normal'} size="sm" />
                <span>
                  {quizAnswerType === 'typing'
                    ? '⌨️ 일본어 단어를 읽고 한국어 발음(예: 네코)이나 뜻(예: 고양이)을 쳐보세요!'
                    : '🖍️ 맞힌 단어는 자동으로 완료(💮) 도장이 찍힌다옹!'}
                </span>
              </div>
              <button
                onClick={() => speakJapanese(vocabQ.target.kana, studyState.settings.slowAudio)}
                className="flex items-center gap-1 font-extrabold px-3 py-1.5 rounded-full cursor-pointer transition"
                style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#FEF08A', border: '1.5px dashed rgba(255,255,255,0.4)' }}
              >
                <Volume2 className="w-3.5 h-3.5" /> 발음 듣기
              </button>
            </div>

            <div className="my-6">
              <div
                className="text-5xl sm:text-7xl font-black tracking-wide text-white select-none"
                style={{ textShadow: '0 3px 0 rgba(0,0,0,0.22)' }}
              >
                {quizDirection === 'jp-to-kr' || quizAnswerType === 'typing'
                  ? vocabQ.target.kana
                  : vocabQ.target.meaning}
              </div>
              <p className="text-xs sm:text-sm font-bold mt-3" style={{ color: '#A7F3D0' }}>
                {quizAnswerType === 'typing'
                  ? `힌트(한자/원어): ${vocabQ.target.kanji} — 발음 또는 뜻을 입력 후 Enter!`
                  : quizDirection === 'jp-to-kr'
                  ? '이 단어의 올바른 발음과 뜻은 무엇일까요?'
                  : `[${vocabQ.target.kr}] 발음의 일본어 표기를 골라보세요!`}
              </p>
            </div>

            {quizAnswerType === 'choice' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {vocabQ.options.map((opt, idx) => {
                  const label =
                    quizDirection === 'jp-to-kr'
                      ? `[${opt.kr}] ${opt.meaning}`
                      : `${opt.kana} (${opt.kr})`;

                  let inlineStyle = {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '2px dashed rgba(255, 255, 255, 0.45)',
                    color: '#FEFCE8'
                  };

                  if (isQuizFeedback) {
                    if (idx === vocabQ.correctIndex) {
                      inlineStyle = {
                        backgroundColor: '#F59E0B',
                        border: '2px solid #FEF08A',
                        color: '#FFFFFF',
                        transform: 'scale(1.02)'
                      };
                    } else if (idx === selectedOptIdx) {
                      inlineStyle = {
                        backgroundColor: '#DC2626',
                        border: '2px solid #FCA5A5',
                        color: '#FFFFFF'
                      };
                    } else {
                      inlineStyle = {
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '2px dashed rgba(255, 255, 255, 0.18)',
                        color: 'rgba(255, 255, 255, 0.4)'
                      };
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectVocabOption(idx)}
                      disabled={isQuizFeedback}
                      className="py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg transition-all cursor-pointer flex items-center justify-between hover:bg-white/20"
                      style={inlineStyle}
                    >
                      <span
                        className="text-xs font-extrabold px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'rgba(0,0,0,0.25)', color: '#FEF08A' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="mx-auto px-2 truncate">{label}</span>
                      <span className="w-5 text-sm shrink-0">{isQuizFeedback && idx === vocabQ.correctIndex ? '💮' : ''}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={handleVocabTypingSubmit} className="max-w-md mx-auto space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={vocabInputRef}
                    type="text"
                    value={vocabTypingInput}
                    onChange={(e) => setVocabTypingInput(e.target.value)}
                    placeholder="발음(예: 네코) 또는 뜻(예: 고양이)"
                    autoFocus
                    className="flex-1 px-5 py-4 rounded-2xl text-center text-lg font-black outline-none transition"
                    style={
                      vocabTypingFlash
                        ? { backgroundColor: '#DCFCE7', color: '#166534', border: '3px solid #22C55E' }
                        : quizLastWrong
                        ? { backgroundColor: '#FEE2E2', color: '#991B1B', border: '3px solid #EF4444' }
                        : { backgroundColor: '#FFFDF8', color: '#2D4A3E', border: '3px solid #F59E0B' }
                    }
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 rounded-2xl font-black text-base cursor-pointer transition shrink-0"
                    style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #FEF08A' }}
                  >
                    {quizLastWrong ? '다음 →' : '확인'}
                  </button>
                </div>
                {vocabTypingFlash && (
                  <div className="text-sm font-black flex items-center justify-center gap-1" style={{ color: '#FEF08A' }}>
                    <CheckCircle2 className="w-4 h-4" /> 정답이다옹! 💮 [{vocabQ.target.kr}] {vocabQ.target.meaning}
                  </div>
                )}
              </form>
            )}

            {/* 오답 시 단어 글자 쪼개기 노트 */}
            {quizLastWrong && (
              <div
                className="mt-6 p-4 rounded-2xl text-left max-w-xl mx-auto animate-fadeIn"
                style={{ backgroundColor: '#FFFDF8', color: '#3A322C', border: '3px solid #F59E0B' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-sm" style={{ color: '#B45309' }}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      정답: {vocabQ.target.kana} [{vocabQ.target.kr}] — “{vocabQ.target.meaning}”
                    </div>
                    <p className="text-xs sm:text-sm font-bold pl-5" style={{ color: '#2D4A3E' }}>
                      🧩 <strong>글자 쪼개 읽기:</strong> {vocabQ.target.tip} (한자/원어: {vocabQ.target.kanji})
                    </p>
                  </div>
                  <button
                    onClick={() => generateVocabQuestion(vocabQ.target.id)}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer"
                    style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
                  >
                    다음 단어 (Enter) →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          모드 3: 단어 공책 리스트 모드
      ========================================================= */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoryWords.map(item => {
            const isMastered = studyState.vocabStatus[item.id] === 'mastered';
            const showAnswer = !hideAnswerInList || revealedIds[item.id];

            return (
              <div
                key={item.id}
                onClick={() => toggleListReveal(item.id, item.kana)}
                className="p-4 rounded-2xl transition flex items-center justify-between gap-3 cursor-pointer"
                style={
                  isMastered
                    ? { backgroundColor: '#F0FDF4', border: '2px solid #86EFAC' }
                    : { backgroundColor: '#FFFDF8', border: '2px solid #D5C7B2' }
                }
              >
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-2xl font-black" style={{ color: '#2D4A3E' }}>{item.kana}</span>
                    {showAnswer ? (
                      <>
                        <span className="text-sm font-extrabold" style={{ color: '#B45309' }}>[{item.kr}]</span>
                        <span className="text-base font-black" style={{ color: '#3A322C' }}>{item.meaning}</span>
                      </>
                    ) : (
                      <span
                        className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}
                      >
                        🐾 눌러서 발음·뜻 확인
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold" style={{ color: '#7D6E5D' }}>
                    🧩 {item.tip} · <span>표기: {item.kanji}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => speakJapanese(item.kana, studyState.settings.slowAudio)}
                    className="p-2.5 rounded-xl transition cursor-pointer"
                    style={{ backgroundColor: '#FAF6EE', color: '#2D4A3E', border: '1.5px solid #C7B69E' }}
                    title="발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateVocab(item.id, isMastered ? 'learning' : 'mastered')}
                    className="px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1"
                    style={
                      isMastered
                        ? { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                        : { backgroundColor: '#E8DEC8', color: '#5C4E41' }
                    }
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isMastered ? '💮 완료' : '도장'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
