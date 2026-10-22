import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Volume2, MessageSquare, Zap, Layers, Keyboard, MousePointerClick, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PATTERN_DATA, SURVIVAL_PHRASES } from '../data/patternData';
import { speakJapanese } from '../utils/tts';
import NekoMascot from './NekoMascot';

export default function PatternBuilderView({ studyState }) {
  const [mode, setMode] = useState('builder'); // 'builder' | 'quiz'
  const [selectedPatternId, setSelectedPatternId] = useState(PATTERN_DATA[0].id);
  const [slotIndex, setSlotIndex] = useState(0);

  // 회화 스피드 퀴즈 상태
  const [quizAnswerType, setQuizAnswerType] = useState('choice'); // 'choice' | 'typing'
  const [patternQ, setPatternQ] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [typingInput, setTypingInput] = useState('');
  const [typingFlash, setTypingFlash] = useState(false);
  const [isFeedback, setIsFeedback] = useState(false);
  const [lastWrong, setLastWrong] = useState(false);
  const [streak, setStreak] = useState(0);

  const inputRef = useRef(null);

  const activePattern = PATTERN_DATA.find(p => p.id === selectedPatternId) || PATTERN_DATA[0];
  const currentSlot = activePattern.slots[slotIndex] || activePattern.slots[0];

  const assembledJp = activePattern.templateJp.replace('{word}', currentSlot.word);
  const assembledKr = activePattern.templateKr.replace('{kr}', currentSlot.kr);
  const assembledMeaning = activePattern.templateMeaning.replaceAll('{meaning}', currentSlot.meaning);

  // 모든 패턴 조합 + 생존 회화 문장 풀 생성
  const allSentencePool = useMemo(() => {
    const list = [];
    PATTERN_DATA.forEach(pat => {
      const tailJp = pat.templateJp.replace('{word}', '').trim();
      const tailKr = pat.templateKr.replace('{kr}', '').trim();
      pat.slots.forEach(slot => {
        list.push({
          id: `${pat.id}_${slot.word}`,
          fullJp: pat.templateJp.replace('{word}', slot.word),
          fullKr: pat.templateKr.replace('{kr}', slot.kr),
          meaning: pat.templateMeaning.replaceAll('{meaning}', slot.meaning),
          wordJp: slot.word,
          wordKr: slot.kr,
          wordMeaning: slot.meaning,
          tailJp,
          tailKr,
          grammarPoint: pat.grammarPoint
        });
      });
    });
    return list;
  }, []);

  const generatePatternQuiz = useCallback((prevId = null) => {
    const candidates = allSentencePool.filter(s => s.id !== prevId);
    const target = candidates[Math.floor(Math.random() * candidates.length)] || allSentencePool[0];

    // 50% 확률로 앞 단어(명사) 빈칸 vs 뒷 패턴(술어) 빈칸 출제
    const blankType = Math.random() < 0.55 ? 'word' : 'tail';

    let options = [];
    if (blankType === 'word') {
      const otherWords = [];
      allSentencePool.forEach(s => {
        if (s.wordJp !== target.wordJp && !otherWords.some(w => w.jp === s.wordJp)) {
          otherWords.push({ jp: s.wordJp, kr: s.wordKr, meaning: s.wordMeaning });
        }
      });
      const distractors = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
      options = [
        { jp: target.wordJp, kr: target.wordKr, meaning: target.wordMeaning, isCorrect: true },
        ...distractors.map(d => ({ ...d, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);
    } else {
      const allTails = [
        { jp: 'ください', kr: '쿠다사이', meaning: '~주세요' },
        { jp: 'は どこですか？', kr: '와 도코데스카?', meaning: '~은 어디인가요?' },
        { jp: 'は いくらですか？', kr: '와 이쿠라데스카?', meaning: '~은 얼마인가요?' },
        { jp: 'です', kr: '데스', meaning: '~입니다/해요' },
        { jp: 'が すきです', kr: '가 스키데스', meaning: '~을 좋아해요' }
      ];
      const distractors = allTails
        .filter(t => t.jp !== target.tailJp)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      options = [
        { jp: target.tailJp, kr: target.tailKr, meaning: '', isCorrect: true },
        ...distractors.map(d => ({ ...d, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);
    }

    const correctIndex = options.findIndex(o => o.isCorrect);

    setPatternQ({
      target,
      blankType,
      options,
      correctIndex
    });
    setSelectedOpt(null);
    setTypingInput('');
    setTypingFlash(false);
    setIsFeedback(false);
    setLastWrong(false);

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 30);
  }, [allSentencePool]);

  useEffect(() => {
    if (mode === 'quiz') {
      generatePatternQuiz(null);
    }
  }, [mode, quizAnswerType]);

  const handleSelectQuizOption = useCallback((idx) => {
    if (!patternQ || isFeedback) return;
    setSelectedOpt(idx);
    setIsFeedback(true);

    const isCorrect = idx === patternQ.correctIndex;
    setStreak(s => (isCorrect ? s + 1 : 0));
    speakJapanese(patternQ.target.fullJp, studyState.settings.slowAudio);

    if (isCorrect) {
      setTimeout(() => {
        generatePatternQuiz(patternQ.target.id);
      }, 260);
    } else {
      setLastWrong(true);
    }
  }, [patternQ, isFeedback, generatePatternQuiz, studyState.settings.slowAudio]);

  const handleTypingSubmit = (e) => {
    e.preventDefault();
    if (!patternQ) return;

    if (lastWrong) {
      generatePatternQuiz(patternQ.target.id);
      return;
    }

    if (isFeedback || !typingInput.trim()) return;

    const cleanInput = typingInput.trim().replace(/[?\s~-]/g, '');
    const expectedOption = patternQ.options[patternQ.correctIndex];
    const cleanKr = expectedOption.kr.replace(/[?\s~-]/g, '');
    const cleanJp = expectedOption.jp.replace(/[？?\s]/g, '');

    const isCorrect = cleanInput === cleanKr || cleanInput === cleanJp;
    setIsFeedback(true);
    setStreak(s => (isCorrect ? s + 1 : 0));
    speakJapanese(patternQ.target.fullJp, studyState.settings.slowAudio);

    if (isCorrect) {
      setTypingFlash(true);
      setTimeout(() => {
        generatePatternQuiz(patternQ.target.id);
      }, 260);
    } else {
      setLastWrong(true);
    }
  };

  // 단축키 지원
  useEffect(() => {
    if (mode !== 'quiz') return;
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (quizAnswerType === 'choice' && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        if (!isFeedback) handleSelectQuizOption(idx);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (lastWrong && patternQ) {
          generatePatternQuiz(patternQ.target.id);
        } else if (patternQ) {
          speakJapanese(patternQ.target.fullJp, studyState.settings.slowAudio);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, quizAnswerType, isFeedback, lastWrong, patternQ, handleSelectQuizOption, generatePatternQuiz, studyState.settings.slowAudio]);

  const handleSelectPattern = (pid) => {
    setSelectedPatternId(pid);
    setSlotIndex(0);
    const pat = PATTERN_DATA.find(p => p.id === pid);
    if (pat && pat.slots[0]) {
      const jp = pat.templateJp.replace('{word}', pat.slots[0].word);
      speakJapanese(jp, studyState.settings.slowAudio);
    }
  };

  const handleSelectSlot = (idx) => {
    setSlotIndex(idx);
    const slot = activePattern.slots[idx];
    if (slot) {
      const jp = activePattern.templateJp.replace('{word}', slot.word);
      speakJapanese(jp, studyState.settings.slowAudio);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 모드 전환 바 (조립 연습 vs 실전 회화 빈칸 퀴즈) */}
      <div className="ghibli-paper rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('builder')}
            className="px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition"
            style={
              mode === 'builder'
                ? { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
            }
          >
            <Layers className="w-3.5 h-3.5" />
            1. 조각 문장 갈아끼우기
          </button>
          <button
            onClick={() => setMode('quiz')}
            className="px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition"
            style={
              mode === 'quiz'
                ? { backgroundColor: '#D97706', color: '#FFFFFF', boxShadow: '0 2px 0 #92400E' }
                : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
            }
          >
            <Zap className="w-3.5 h-3.5" />
            2. ⚡ 실전 회화 빈칸 퀴즈
          </button>
        </div>

        {mode === 'quiz' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuizAnswerType('choice')}
              className="px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer"
              style={
                quizAnswerType === 'choice'
                  ? { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                  : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
              }
            >
              <MousePointerClick className="w-3.5 h-3.5" /> 4지선다
            </button>
            <button
              onClick={() => setQuizAnswerType('typing')}
              className="px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer"
              style={
                quizAnswerType === 'typing'
                  ? { backgroundColor: '#B45309', color: '#FFFBEB' }
                  : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
              }
            >
              <Keyboard className="w-3.5 h-3.5" /> ⌨️ 직접 타이핑
            </button>
            <span
              className="px-3 py-1 rounded-full text-xs font-black"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }}
            >
              🌻 연속 {streak}문장 성공!
            </span>
          </div>
        )}
      </div>

      {/* =========================================================
          모드 1: 조각 문장 갈아끼우기 스테이지
      ========================================================= */}
      {mode === 'builder' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {PATTERN_DATA.map((pat, idx) => {
              const isSelected = pat.id === selectedPatternId;
              return (
                <button
                  key={pat.id}
                  onClick={() => handleSelectPattern(pat.id)}
                  className="p-3.5 rounded-2xl text-left transition cursor-pointer"
                  style={
                    isSelected
                      ? {
                          backgroundColor: '#2D4A3E',
                          color: '#FEFCE8',
                          border: '2.5px solid #A67B5B',
                          boxShadow: '0 4px 0 #8A6245'
                        }
                      : {
                          backgroundColor: '#FFFDF8',
                          color: '#3A322C',
                          border: '2px solid #D5C7B2'
                        }
                  }
                >
                  <div
                    className="text-xs font-extrabold"
                    style={{ color: isSelected ? '#FDE68A' : '#B45309' }}
                  >
                    🌿 만능 패턴 {idx + 1}
                  </div>
                  <div className="font-black text-sm mt-0.5 leading-snug">{pat.title}</div>
                  <div
                    className="text-xs font-semibold mt-1"
                    style={{ color: isSelected ? '#D1FAE5' : '#7D6E5D' }}
                  >
                    {pat.meaning.split('(')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="ghibli-paper rounded-3xl p-6 sm:p-8 space-y-6">
            <div
              className="flex flex-wrap items-center justify-between gap-3 pb-4"
              style={{ borderBottom: '2px dashed #D5C7B2' }}
            >
              <div className="flex items-center gap-3">
                <NekoMascot mood="happy" size="sm" />
                <div>
                  <span className="text-xs font-extrabold" style={{ color: '#B45309' }}>
                    🐾 노란 분필 단어만 쏙쏙 바꿔 끼우면 바로 말이 된다옹!
                  </span>
                  <h2 className="text-lg sm:text-xl font-black mt-0.5" style={{ color: '#2D4A3E' }}>
                    {activePattern.title} — {activePattern.meaning}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => speakJapanese(assembledJp, studyState.settings.slowAudio)}
                className="px-4 py-2.5 rounded-full text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #D97706' }}
              >
                <Volume2 className="w-4 h-4" /> 문장 발음 듣기
              </button>
            </div>

            <div className="ghibli-chalkboard rounded-2xl p-6 sm:p-8 text-center space-y-3">
              <div className="text-3xl sm:text-5xl font-black tracking-wide">
                <span
                  className="underline decoration-dashed underline-offset-8"
                  style={{ color: '#FDE047' }}
                >
                  {currentSlot.word}
                </span>
                <span className="text-white">{activePattern.templateJp.replace('{word}', '')}</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold" style={{ color: '#A7F3D0' }}>
                [{assembledKr}]
              </div>
              <div
                className="text-base sm:text-lg font-black inline-block px-5 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#FEFCE8', border: '1.5px dashed rgba(255,255,255,0.4)' }}
              >
                “{assembledMeaning}”
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-extrabold" style={{ color: '#5C4E41' }}>
                🌰 아래 단어 카드를 눌러 칠판 문장에 끼워 넣어 보세요 (누르면 바로 읽어줍니다):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {activePattern.slots.map((slot, idx) => {
                  const active = idx === slotIndex;
                  return (
                    <button
                      key={slot.word}
                      onClick={() => handleSelectSlot(idx)}
                      className="p-3 rounded-2xl text-center transition cursor-pointer genko-cell"
                      style={
                        active
                          ? {
                              backgroundColor: '#FEF9C3',
                              border: '2.5px solid #D97706',
                              boxShadow: '0 3px 0 #D97706'
                            }
                          : {
                              backgroundColor: '#FAF6EE',
                              border: '1.5px dashed #C7B69E'
                            }
                      }
                    >
                      <div className="text-xl font-black" style={{ color: '#2D4A3E' }}>{slot.word}</div>
                      <div className="text-xs font-extrabold mt-0.5" style={{ color: '#B45309' }}>{slot.kr}</div>
                      <div className="text-xs font-bold" style={{ color: '#7D6E5D' }}>{slot.meaning}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3"
              style={{ backgroundColor: '#ECFCCB', border: '2px solid #84CC16', color: '#365314' }}
            >
              <span className="text-lg shrink-0">🐾</span>
              <div>
                <strong>냐옹 선생님의 한 줄 비법:</strong> {activePattern.grammarPoint}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          모드 2: 실전 회화 빈칸 칠판 퀴즈
      ========================================================= */}
      {mode === 'quiz' && patternQ && (
        <div className="max-w-3xl mx-auto">
          <div className="ghibli-chalkboard rounded-3xl p-6 sm:p-8 text-center space-y-6">
            <div className="flex items-center justify-between text-xs font-bold" style={{ color: '#FDE68A' }}>
              <div className="flex items-center gap-2">
                <NekoMascot mood={lastWrong ? 'oops' : streak >= 3 ? 'happy' : 'normal'} size="sm" />
                <span>🖍️ 우리말 뜻에 맞게 칠판의 빈칸 [ ? ]에 들어갈 일본어 조각을 골라보세요!</span>
              </div>
              <button
                onClick={() => speakJapanese(patternQ.target.fullJp, studyState.settings.slowAudio)}
                className="flex items-center gap-1 font-extrabold px-3 py-1.5 rounded-full cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#FEF08A', border: '1.5px dashed rgba(255,255,255,0.4)' }}
              >
                <Volume2 className="w-3.5 h-3.5" /> 문장 듣기
              </button>
            </div>

            {/* 문제 상황 & 빈칸 문장 */}
            <div className="space-y-3 py-3">
              <div
                className="inline-block px-4 py-1.5 rounded-full text-sm sm:text-base font-black"
                style={{ backgroundColor: '#FEF08A', color: '#78350F' }}
              >
                상황: “{patternQ.target.meaning}”
              </div>

              <div className="text-3xl sm:text-5xl font-black tracking-wide text-white pt-2">
                {patternQ.blankType === 'word' ? (
                  <>
                    <span
                      className="px-4 py-1 rounded-xl mx-1"
                      style={{ backgroundColor: 'rgba(253, 224, 71, 0.2)', border: '2px dashed #FDE047', color: '#FDE047' }}
                    >
                      {isFeedback ? patternQ.target.wordJp : '  ?  '}
                    </span>
                    <span>{patternQ.target.tailJp}</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#FDE047' }}>{patternQ.target.wordJp}</span>{' '}
                    <span
                      className="px-4 py-1 rounded-xl mx-1"
                      style={{ backgroundColor: 'rgba(253, 224, 71, 0.2)', border: '2px dashed #FDE047', color: '#FDE047' }}
                    >
                      {isFeedback ? patternQ.target.tailJp : '  ?  '}
                    </span>
                  </>
                )}
              </div>
            </div>

            {quizAnswerType === 'choice' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {patternQ.options.map((opt, idx) => {
                  let inlineStyle = {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '2px dashed rgba(255, 255, 255, 0.45)',
                    color: '#FEFCE8'
                  };

                  if (isFeedback) {
                    if (idx === patternQ.correctIndex) {
                      inlineStyle = {
                        backgroundColor: '#F59E0B',
                        border: '2px solid #FEF08A',
                        color: '#FFFFFF',
                        transform: 'scale(1.02)'
                      };
                    } else if (idx === selectedOpt) {
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
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      disabled={isFeedback}
                      className="py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg transition-all cursor-pointer flex items-center justify-between hover:bg-white/20"
                      style={inlineStyle}
                    >
                      <span
                        className="text-xs font-extrabold px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: 'rgba(0,0,0,0.25)', color: '#FEF08A' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="mx-auto px-2">
                        {opt.jp} <span className="text-xs opacity-85">({opt.kr})</span>
                      </span>
                      <span className="w-5 text-sm">{isFeedback && idx === patternQ.correctIndex ? '⭕' : ''}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={handleTypingSubmit} className="max-w-md mx-auto space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={typingInput}
                    onChange={(e) => setTypingInput(e.target.value)}
                    placeholder="빈칸의 한국어 발음 입력 (예: 쿠다사이, 미즈)"
                    autoFocus
                    className="flex-1 px-5 py-4 rounded-2xl text-center text-base sm:text-lg font-black outline-none transition"
                    style={
                      typingFlash
                        ? { backgroundColor: '#DCFCE7', color: '#166534', border: '3px solid #22C55E' }
                        : lastWrong
                        ? { backgroundColor: '#FEE2E2', color: '#991B1B', border: '3px solid #EF4444' }
                        : { backgroundColor: '#FFFDF8', color: '#2D4A3E', border: '3px solid #F59E0B' }
                    }
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 rounded-2xl font-black text-base cursor-pointer transition shrink-0"
                    style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #FEF08A' }}
                  >
                    {lastWrong ? '다음 →' : '확인'}
                  </button>
                </div>
                {typingFlash && (
                  <div className="text-sm font-black flex items-center justify-center gap-1" style={{ color: '#FEF08A' }}>
                    <CheckCircle2 className="w-4 h-4" /> 완벽해요! ⭕ {patternQ.target.fullJp} ({patternQ.target.fullKr})
                  </div>
                )}
              </form>
            )}

            {lastWrong && (
              <div
                className="mt-6 p-4 rounded-2xl text-left max-w-xl mx-auto animate-fadeIn"
                style={{ backgroundColor: '#FFFDF8', color: '#3A322C', border: '3px solid #F59E0B' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-sm" style={{ color: '#B45309' }}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      완성 문장: {patternQ.target.fullJp} [{patternQ.target.fullKr}]
                    </div>
                    <p className="text-xs sm:text-sm font-bold pl-5" style={{ color: '#2D4A3E' }}>
                      🐾 {patternQ.target.grammarPoint}
                    </p>
                  </div>
                  <button
                    onClick={() => generatePatternQuiz(patternQ.target.id)}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer"
                    style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
                  >
                    다음 문장 (Enter) →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단: 무조건 쓰이는 생존 회화 6선 */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base font-black flex items-center gap-2" style={{ color: '#2D4A3E' }}>
          <MessageSquare className="w-5 h-5" style={{ color: '#B45309' }} />
          🌻 일본 여행·일상에서 가장 많이 쓰는 마법의 한마디 6선
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SURVIVAL_PHRASES.map(phrase => (
            <div
              key={phrase.id}
              onClick={() => speakJapanese(phrase.jp, studyState.settings.slowAudio)}
              className="ghibli-paper p-4 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition hover:translate-y-[-1px]"
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl font-black" style={{ color: '#2D4A3E' }}>{phrase.jp}</span>
                  <span className="text-xs font-extrabold" style={{ color: '#B45309' }}>[{phrase.kr}]</span>
                </div>
                <div className="text-sm font-black" style={{ color: '#3A322C' }}>{phrase.meaning}</div>
                <div className="text-xs font-semibold" style={{ color: '#7D6E5D' }}>{phrase.usage}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(phrase.jp, studyState.settings.slowAudio);
                }}
                className="p-3 rounded-xl shrink-0 cursor-pointer"
                style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
