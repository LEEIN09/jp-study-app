import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Volume2, AlertCircle, Keyboard, MousePointerClick, CheckCircle2 } from 'lucide-react';
import { KANA_DATA, CONFUSING_PAIRS } from '../data/kanaData';
import { speakJapanese } from '../utils/tts';
import { playCorrectSfx, playWrongSfx } from '../utils/sfx';
import NekoMascot from './NekoMascot';

const QUIZ_MODES = [
  { id: 'hira-to-kr', label: '히라가나 → 발음' },
  { id: 'kata-to-kr', label: '가타카나 → 발음' },
  { id: 'kr-to-kana', label: '소리 듣고 → 글자 찾기' },
  { id: 'hira-to-kata', label: '히라가나 ↔ 가타카나 짝꿍' }
];

const SCOPES = [
  { id: 'first-half', label: '🌱 앞부분 (あ~な행 25자)' },
  { id: 'second-half', label: '🌿 뒷부분 (は~ん 21자)' },
  { id: 'all-seion', label: '🌳 청음 전체 (46자)' },
  { id: 'dakuon', label: '✨ 탁음·반탁음' },
  { id: 'weak-only', label: '🐾 헷갈린 글자만 복습' }
];

// 주관식 타이핑 정답 판정 도우미 (한국어 발음 및 로마자 표기 유연하게 허용)
function isTypingAnswerCorrect(inputRaw, targetChar) {
  const input = (inputRaw || '').trim().toLowerCase();
  if (!input) return false;

  const cleanKr = targetChar.kr.split('(')[0].trim();
  const romaji = targetChar.romaji.toLowerCase();

  const accepted = new Set([cleanKr, romaji, targetChar.hira, targetChar.kata]);

  // 입문자가 자주 쓰는 로마자/한글 이표기 허용
  const aliases = {
    shi: ['si', '시'],
    chi: ['ti', '치'],
    tsu: ['tu', '츠', '쓰'],
    fu: ['hu', '후', '푸'],
    wo: ['o', '오', '워'],
    n: ['nn', '응', 'ㄴ', 'ㅇ', 'ㅁ'],
    ji: ['zi', 'di', '지'],
    zu: ['du', '즈'],
    syo: ['sho'],
    tyo: ['cho']
  };

  if (aliases[romaji]) {
    aliases[romaji].forEach(a => accepted.add(a));
  }

  return accepted.has(input);
}

export default function SpeedQuizView({ studyState, onRecordResult, customScope, onClearCustomScope }) {
  const [answerType, setAnswerType] = useState('choice'); // 'choice' (4지선다) | 'typing' (주관식 타이핑)
  const [quizMode, setQuizMode] = useState('hira-to-kr');
  const [scope, setScope] = useState(customScope ? 'custom' : 'first-half');
  const [streak, setStreak] = useState(0);
  const [sessionSolved, setSessionSolved] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const [currentQ, setCurrentQ] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [typingInput, setTypingInput] = useState('');
  const [typingCorrectFlash, setTypingCorrectFlash] = useState(false);
  const [isFeedback, setIsFeedback] = useState(false);
  const [lastWasWrong, setLastWasWrong] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (customScope && customScope.ids?.length > 0) {
      setScope('custom');
    }
  }, [customScope]);

  // 주관식 타이핑 모드일 때는 히라가나/가타카나 보고 발음 치기에 최적화
  useEffect(() => {
    if (answerType === 'typing' && (quizMode === 'kr-to-kana' || quizMode === 'hira-to-kata')) {
      setQuizMode('hira-to-kr');
    }
  }, [answerType, quizMode]);

  const activePool = useMemo(() => {
    if (scope === 'custom' && customScope?.ids?.length > 0) {
      return KANA_DATA.filter(k => customScope.ids.includes(k.id));
    }
    if (scope === 'first-half') {
      return KANA_DATA.filter(k => ['a', 'ka', 'sa', 'ta', 'na'].includes(k.row));
    }
    if (scope === 'second-half') {
      return KANA_DATA.filter(k => ['ha', 'ma', 'ya', 'ra', 'wa'].includes(k.row));
    }
    if (scope === 'all-seion') {
      return KANA_DATA.filter(k => k.type === 'seion');
    }
    if (scope === 'dakuon') {
      return KANA_DATA.filter(k => k.type === 'dakuon');
    }
    if (scope === 'weak-only') {
      const weakList = KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0);
      return weakList.length >= 4
        ? weakList
        : KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0 || !studyState.kanaStats[k.id]?.mastered).slice(0, 15);
    }
    return KANA_DATA.filter(k => k.type === 'seion');
  }, [scope, customScope, studyState.kanaStats]);

  const generateQuestion = useCallback((prevCharId = null) => {
    if (!activePool || activePool.length === 0) return;

    const candidates = activePool.length > 1
      ? activePool.filter(c => c.id !== prevCharId)
      : activePool;

    const weighted = candidates.map(c => {
      const st = studyState.kanaStats[c.id];
      const wrongWeight = (st?.wrong || 0) * 3.5;
      const unmasteredBonus = st?.mastered ? 0.4 : 2.0;
      return { char: c, weight: 1 + wrongWeight + unmasteredBonus };
    });

    const totalWeight = weighted.reduce((acc, item) => acc + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let target = weighted[0].char;
    for (const item of weighted) {
      rand -= item.weight;
      if (rand <= 0) {
        target = item.char;
        break;
      }
    }

    const pairMatch = CONFUSING_PAIRS.find(p => p.chars.includes(target.id));
    const distractorIds = new Set();

    if (pairMatch) {
      pairMatch.chars.forEach(cid => {
        if (cid !== target.id) distractorIds.add(cid);
      });
    }

    const sameRow = KANA_DATA.filter(k => k.row === target.row && k.id !== target.id);
    sameRow.sort(() => Math.random() - 0.5).slice(0, 2).forEach(k => distractorIds.add(k.id));

    const distractorPool = KANA_DATA.filter(k => k.id !== target.id);
    const chosenDistractors = [];

    for (const id of distractorIds) {
      if (chosenDistractors.length < 3) {
        const found = KANA_DATA.find(k => k.id === id);
        if (found) chosenDistractors.push(found);
      }
    }

    while (chosenDistractors.length < 3) {
      const randomPick = distractorPool[Math.floor(Math.random() * distractorPool.length)];
      if (!chosenDistractors.some(d => d.id === randomPick.id)) {
        chosenDistractors.push(randomPick);
      }
    }

    const options = [target, ...chosenDistractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.findIndex(o => o.id === target.id);

    setCurrentQ({ target, options, correctIndex });
    setSelectedIdx(null);
    setTypingInput('');
    setTypingCorrectFlash(false);
    setIsFeedback(false);
    setLastWasWrong(false);

    if (quizMode === 'kr-to-kana' || (answerType === 'choice' && studyState.settings.autoSpeak)) {
      speakJapanese(target.hira, studyState.settings.slowAudio);
    }

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 30);
  }, [activePool, quizMode, answerType, studyState.kanaStats, studyState.settings.autoSpeak, studyState.settings.slowAudio]);

  useEffect(() => {
    generateQuestion(null);
  }, [scope, quizMode, answerType]);

  const handleSelectOption = useCallback((idx) => {
    if (!currentQ || isFeedback) return;

    setSelectedIdx(idx);
    setIsFeedback(true);

    const isCorrect = idx === currentQ.correctIndex;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const sfxEnabled = studyState.settings.soundFx !== false;

    setStreak(nextStreak);
    setSessionSolved(s => s + 1);
    if (isCorrect) {
      setSessionCorrect(c => c + 1);
      playCorrectSfx(sfxEnabled, nextStreak);
    } else {
      playWrongSfx(sfxEnabled);
    }

    onRecordResult(currentQ.target.id, isCorrect, nextStreak);
    speakJapanese(currentQ.target.hira, studyState.settings.slowAudio);

    if (isCorrect) {
      setTimeout(() => {
        generateQuestion(currentQ.target.id);
      }, 220);
    } else {
      setLastWasWrong(true);
    }
  }, [currentQ, isFeedback, streak, onRecordResult, generateQuestion, studyState.settings.slowAudio]);

  // 주관식 타이핑 제출 처리
  const handleTypingSubmit = (e) => {
    e.preventDefault();
    if (!currentQ) return;

    // 이미 오답 피드백 상태일 때 Enter를 치면 다음 문제로 이동
    if (lastWasWrong) {
      generateQuestion(currentQ.target.id);
      return;
    }

    if (isFeedback || !typingInput.trim()) return;

    setIsFeedback(true);
    const isCorrect = isTypingAnswerCorrect(typingInput, currentQ.target);
    const nextStreak = isCorrect ? streak + 1 : 0;
    const sfxEnabled = studyState.settings.soundFx !== false;

    setStreak(nextStreak);
    setSessionSolved(s => s + 1);
    if (isCorrect) {
      setSessionCorrect(c => c + 1);
      playCorrectSfx(sfxEnabled, nextStreak);
    } else {
      playWrongSfx(sfxEnabled);
    }

    onRecordResult(currentQ.target.id, isCorrect, nextStreak);
    speakJapanese(currentQ.target.hira, studyState.settings.slowAudio);

    if (isCorrect) {
      setTypingCorrectFlash(true);
      setTimeout(() => {
        generateQuestion(currentQ.target.id);
      }, 220);
    } else {
      setLastWasWrong(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;

      if (answerType === 'choice' && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        if (!isFeedback) {
          handleSelectOption(idx);
        }
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (lastWasWrong && currentQ) {
          generateQuestion(currentQ.target.id);
        } else if (currentQ) {
          speakJapanese(currentQ.target.hira, studyState.settings.slowAudio);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answerType, handleSelectOption, isFeedback, lastWasWrong, currentQ, generateQuestion, studyState.settings.slowAudio]);

  const weakCount = useMemo(
    () => KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0).length,
    [studyState.kanaStats]
  );

  if (!currentQ) return null;

  const promptMain =
    quizMode === 'hira-to-kr' ? currentQ.target.hira :
    quizMode === 'kata-to-kr' ? currentQ.target.kata :
    quizMode === 'hira-to-kata' ? currentQ.target.hira :
    currentQ.target.kr.split('(')[0];

  const promptSub =
    answerType === 'typing'
      ? '글자의 한국어 발음(예: 아) 또는 로마자(예: a)를 입력하고 Enter를 누르세요!'
      : quizMode === 'hira-to-kr' ? '칠판에 적힌 히라가나의 발음은 무엇일까요?' :
        quizMode === 'kata-to-kr' ? '칠판에 적힌 가타카나의 발음은 무엇일까요?' :
        quizMode === 'hira-to-kata' ? '짝꿍이 되는 가타카나를 골라보세요!' :
        `[${currentQ.target.romaji}] 소리가 나는 글자를 골라보세요!`;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* 상단 학습장 설정 패널 */}
      <div className="ghibli-paper rounded-2xl p-4 space-y-3">
        {/* 1층: 4지선다 객관식 vs 주관식 타이핑 전환 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5" style={{ borderBottom: '1.5px dashed #E2D6C3' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold" style={{ color: '#8C7A6B' }}>훈련 방식:</span>
            <button
              onClick={() => setAnswerType('choice')}
              className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
              style={
                answerType === 'choice'
                  ? { backgroundColor: '#2D4A3E', color: '#FEFCE8', boxShadow: '0 2px 0 #1B2E26' }
                  : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
              }
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              4지선다 스피드 객관식
            </button>
            <button
              onClick={() => setAnswerType('typing')}
              className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
              style={
                answerType === 'typing'
                  ? { backgroundColor: '#D97706', color: '#FFFFFF', boxShadow: '0 2px 0 #92400E' }
                  : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
              }
            >
              <Keyboard className="w-3.5 h-3.5" />
              ⌨️ 주관식 직접 타이핑 (완벽 암기용)
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-extrabold">
            <span
              className="px-3 py-1 rounded-full flex items-center gap-1"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }}
            >
              🌰 연속 {streak}개 성공!
            </span>
            <span style={{ color: '#7D6E5D' }}>
              정답률 {sessionSolved > 0 ? Math.round((sessionCorrect / sessionSolved) * 100) : 100}% ({sessionCorrect}/{sessionSolved})
            </span>
          </div>
        </div>

        {/* 2층: 문제 방향 선택 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-extrabold mr-1" style={{ color: '#8C7A6B' }}>유형:</span>
          {(answerType === 'typing' ? QUIZ_MODES.slice(0, 2) : QUIZ_MODES).map(m => (
            <button
              key={m.id}
              onClick={() => setQuizMode(m.id)}
              className="px-3 py-1 rounded-full text-xs font-extrabold transition cursor-pointer"
              style={
                quizMode === m.id
                  ? { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                  : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
              }
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* 3층: 출제 단원 선택 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2" style={{ borderTop: '1.5px dashed #E2D6C3' }}>
          <span className="text-xs font-extrabold mr-1" style={{ color: '#8C7A6B' }}>범위:</span>
          {customScope && (
            <button
              onClick={() => setScope('custom')}
              className="px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer"
              style={
                scope === 'custom'
                  ? { backgroundColor: '#B45309', color: '#FFFBEB' }
                  : { backgroundColor: '#FEF3C7', color: '#92400E' }
              }
            >
              🎯 {customScope.label}
            </button>
          )}
          {SCOPES.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setScope(s.id);
                if (onClearCustomScope) onClearCustomScope();
              }}
              className="px-3 py-1 rounded-full text-xs font-extrabold transition cursor-pointer"
              style={
                scope === s.id
                  ? { backgroundColor: '#B45309', color: '#FFFBEB' }
                  : s.id === 'weak-only' && weakCount > 0
                  ? { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1.5px solid #F87171' }
                  : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
              }
            >
              {s.label} {s.id === 'weak-only' ? `(${weakCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 교실 초록 칠판 스피드 퀴즈 보드 */}
      <div className="ghibli-chalkboard rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* 칠판 내부 상단: 객관식 vs 주관식 타이핑 큼직한 전환 스위치 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5 pb-4" style={{ borderBottom: '1.5px dashed rgba(255,255,255,0.22)' }}>
          <button
            onClick={() => setAnswerType('choice')}
            className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer"
            style={
              answerType === 'choice'
                ? { backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #FEF08A', boxShadow: '0 3px 0 #B45309' }
                : { backgroundColor: 'rgba(255,255,255,0.1)', color: '#FEFCE8', border: '1.5px dashed rgba(255,255,255,0.35)' }
            }
          >
            <MousePointerClick className="w-4 h-4" />
            👆 4지선다 객관식 모드
          </button>
          <button
            onClick={() => setAnswerType('typing')}
            className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer"
            style={
              answerType === 'typing'
                ? { backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #FEF08A', boxShadow: '0 3px 0 #B45309' }
                : { backgroundColor: 'rgba(255,255,255,0.1)', color: '#FEFCE8', border: '1.5px dashed rgba(255,255,255,0.35)' }
            }
          >
            <Keyboard className="w-4 h-4" />
            ⌨️ 주관식 직접 타이핑 모드
          </button>
        </div>

        {/* 칠판 상단 바 */}
        <div className="flex items-center justify-between text-xs font-bold mb-2" style={{ color: '#FDE68A' }}>
          <div className="flex items-center gap-2">
            <NekoMascot mood={lastWasWrong ? 'oops' : streak >= 5 ? 'happy' : 'normal'} size="sm" />
            <span>
              {answerType === 'typing'
                ? '⌨️ 보기 없이 스스로 발음을 떠올려 직접 쳐보는 진짜 실력 테스트다옹!'
                : '🖍️ 정답을 맞히면 0.2초 만에 다음 문제로 넘어간다옹!'}
            </span>
          </div>
          <button
            onClick={() => speakJapanese(currentQ.target.hira, studyState.settings.slowAudio)}
            className="flex items-center gap-1 font-extrabold px-3 py-1.5 rounded-full cursor-pointer transition"
            style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#FEF08A', border: '1.5px dashed rgba(255,255,255,0.4)' }}
          >
            <Volume2 className="w-3.5 h-3.5" /> 소리 듣기
          </button>
        </div>

        {/* 칠판 중앙 분필 글자 */}
        <div className="my-6">
          <div
            className="text-7xl sm:text-8xl font-black tracking-tight select-none"
            style={{ color: '#FFFFFF', textShadow: '0 3px 0 rgba(0,0,0,0.22)' }}
          >
            {promptMain}
          </div>
          <p className="text-xs sm:text-sm font-bold mt-3" style={{ color: '#A7F3D0' }}>{promptSub}</p>
        </div>

        {/* A. 4지선다 분필 버튼 모드 */}
        {answerType === 'choice' ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
            {currentQ.options.map((opt, idx) => {
              const optionLabel =
                quizMode === 'hira-to-kr' || quizMode === 'kata-to-kr'
                  ? `${opt.kr.split('(')[0]} (${opt.romaji})`
                  : quizMode === 'hira-to-kata'
                  ? opt.kata
                  : `${opt.hira} (${opt.kata})`;

              let inlineStyle = {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '2px dashed rgba(255, 255, 255, 0.45)',
                color: '#FEFCE8'
              };

              if (isFeedback) {
                if (idx === currentQ.correctIndex) {
                  inlineStyle = {
                    backgroundColor: '#F59E0B',
                    border: '2px solid #FEF08A',
                    color: '#FFFFFF',
                    transform: 'scale(1.02)'
                  };
                } else if (idx === selectedIdx) {
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
                  onClick={() => handleSelectOption(idx)}
                  disabled={isFeedback}
                  className="relative py-4 px-5 rounded-2xl font-black text-xl sm:text-2xl transition-all cursor-pointer flex items-center justify-between hover:bg-white/20"
                  style={inlineStyle}
                >
                  <span
                    className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(0,0,0,0.25)', color: '#FEF08A' }}
                  >
                    {idx + 1}
                  </span>
                  <span className="mx-auto">{optionLabel}</span>
                  <span className="w-5 text-sm">{isFeedback && idx === currentQ.correctIndex ? '⭕' : ''}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* B. 주관식 스피드 타이핑 입력창 모드 */
          <form onSubmit={handleTypingSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                placeholder="발음 입력 (예: 아 또는 a)"
                autoFocus
                className="flex-1 px-5 py-4 rounded-2xl text-center text-xl font-black outline-none transition"
                style={
                  typingCorrectFlash
                    ? { backgroundColor: '#DCFCE7', color: '#166534', border: '3px solid #22C55E' }
                    : lastWasWrong
                    ? { backgroundColor: '#FEE2E2', color: '#991B1B', border: '3px solid #EF4444' }
                    : { backgroundColor: '#FFFDF8', color: '#2D4A3E', border: '3px solid #F59E0B' }
                }
              />
              <button
                type="submit"
                className="px-6 py-4 rounded-2xl font-black text-base cursor-pointer transition shrink-0"
                style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #FEF08A' }}
              >
                {lastWasWrong ? '다음 →' : '확인'}
              </button>
            </div>
            {typingCorrectFlash && (
              <div className="text-sm font-black flex items-center justify-center gap-1" style={{ color: '#FEF08A' }}>
                <CheckCircle2 className="w-4 h-4" /> 정답이다옹! ⭕ ({currentQ.target.kr} · {currentQ.target.romaji})
              </div>
            )}
          </form>
        )}

        {/* 오답 시 뜨는 냐옹 선생님의 연상 암기 노트 */}
        {lastWasWrong && (
          <div
            className="mt-6 p-4 rounded-2xl text-left max-w-xl mx-auto animate-fadeIn"
            style={{ backgroundColor: '#FFFDF8', color: '#3A322C', border: '3px solid #F59E0B' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-black text-sm" style={{ color: '#B45309' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  앗! 정답은 [{currentQ.target.hira} / {currentQ.target.kata}] — “{currentQ.target.kr}” ({currentQ.target.romaji}) 이다옹!
                </div>
                <p className="text-xs sm:text-sm font-bold leading-relaxed pl-5" style={{ color: '#2D4A3E' }}>
                  🐾 <strong>냐옹이 비법:</strong> {quizMode === 'kata-to-kr' || quizMode === 'hira-to-kata' ? currentQ.target.mnemonicKata : currentQ.target.mnemonicHira}
                </p>
                {currentQ.target.confusingWith && (
                  <p
                    className="text-xs px-3 py-1.5 rounded-xl font-bold ml-5 mt-1"
                    style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                  >
                    ⚠️ {currentQ.target.confusingWith}
                  </p>
                )}
              </div>
              <button
                onClick={() => generateQuestion(currentQ.target.id)}
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-black shadow-xs cursor-pointer"
                style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
              >
                외웠어요! 다음 (Enter) →
              </button>
            </div>
          </div>
        )}

        {/* 칠판 하단 분필 받침대 안내 */}
        <div
          className="mt-6 pt-3 flex items-center justify-center gap-4 text-xs font-bold"
          style={{ borderTop: '1.5px dashed rgba(255,255,255,0.2)', color: 'rgba(254, 252, 232, 0.7)' }}
        >
          <span className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5" />
            {answerType === 'choice'
              ? '키보드 숫자키 1 ~ 4로 초고속 선택 · Space로 발음 듣기 / 다음 문제'
              : '한국어(예: 아, 시, 츠) 또는 로마자(예: a, shi, tsu) 모두 정답으로 인정됩니다!'}
          </span>
        </div>
      </div>
    </div>
  );
}
