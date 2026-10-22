import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Volume2, MessageSquare, Zap, Layers, Keyboard, MousePointerClick } from 'lucide-react';
import { PATTERN_DATA, SURVIVAL_PHRASES } from '../../data/patternData';
import { speakJapanese } from '../../utils/tts';
import { playCorrectSfx, playWrongSfx } from '../../utils/sfx';
import SchoolMascot from '../SchoolMascot';

export default function SchoolPatternView({ studyState }) {
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
  const sfxEnabled = studyState.settings.soundFx !== false;

  const activePattern = PATTERN_DATA.find(p => p.id === selectedPatternId) || PATTERN_DATA[0];
  const currentSlot = activePattern.slots[slotIndex] || activePattern.slots[0];

  const assembledJp = activePattern.templateJp.replace('{word}', currentSlot.word);
  const assembledKr = activePattern.templateKr.replace('{kr}', currentSlot.kr);
  const assembledMeaning = activePattern.templateMeaning.replaceAll('{meaning}', currentSlot.meaning);

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
  }, [mode, quizAnswerType, generatePatternQuiz]);

  const handleSelectQuizOption = useCallback((idx) => {
    if (!patternQ || isFeedback) return;
    setSelectedOpt(idx);
    setIsFeedback(true);

    const isCorrect = idx === patternQ.correctIndex;
    const nextStreak = isCorrect ? streak + 1 : 0;
    setStreak(nextStreak);
    speakJapanese(patternQ.target.fullJp, studyState.settings.slowAudio);

    if (isCorrect) {
      playCorrectSfx(sfxEnabled, nextStreak);
      setTimeout(() => {
        generatePatternQuiz(patternQ.target.id);
      }, 260);
    } else {
      playWrongSfx(sfxEnabled);
      setLastWrong(true);
    }
  }, [patternQ, isFeedback, streak, sfxEnabled, generatePatternQuiz, studyState.settings.slowAudio]);

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
    const nextStreak = isCorrect ? streak + 1 : 0;
    setStreak(nextStreak);
    speakJapanese(patternQ.target.fullJp, studyState.settings.slowAudio);

    if (isCorrect) {
      playCorrectSfx(sfxEnabled, nextStreak);
      setTypingFlash(true);
      setTimeout(() => {
        generatePatternQuiz(patternQ.target.id);
      }, 260);
    } else {
      playWrongSfx(sfxEnabled);
      setLastWrong(true);
    }
  };

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
      {/* 상단 모드 전환 바 */}
      <div
        className="rounded-2xl p-4 bg-white flex flex-wrap items-center justify-between gap-3"
        style={{ border: '2px solid #BAE6FD', boxShadow: '0 4px 0 #BAE6FD' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('builder')}
            className="px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition skew-badge"
            style={
              mode === 'builder'
                ? { backgroundColor: '#0284C7', color: '#FFFFFF' }
                : { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
            }
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. 파츠 대사 조립기</span>
          </button>
          <button
            onClick={() => setMode('quiz')}
            className="px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition skew-badge"
            style={
              mode === 'quiz'
                ? { backgroundColor: '#F43F5E', color: '#FFFFFF' }
                : { backgroundColor: '#FFE4E6', color: '#BE123C', border: '1.5px solid #FDA4AF' }
            }
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. ⚡ 실전 대사 빈칸 배틀</span>
          </button>
        </div>

        {mode === 'quiz' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuizAnswerType('choice')}
              className="px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer skew-badge"
              style={
                quizAnswerType === 'choice'
                  ? { backgroundColor: '#0284C7', color: '#FFFFFF' }
                  : { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
              }
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>🔢 4지선다</span>
            </button>
            <button
              onClick={() => setQuizAnswerType('typing')}
              className="px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer skew-badge"
              style={
                quizAnswerType === 'typing'
                  ? { backgroundColor: '#F43F5E', color: '#FFFFFF' }
                  : { backgroundColor: '#FFE4E6', color: '#BE123C', border: '1.5px solid #FDA4AF' }
              }
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>⌨️ 주관식 직접 타이핑</span>
            </button>
            <span className="px-3 py-1 rounded-md text-xs font-black text-white skew-badge" style={{ backgroundColor: '#F43F5E' }}>
              <span>⚡ {streak} COMBO!</span>
            </span>
          </div>
        )}
      </div>

      {mode === 'builder' ? (
        <div className="space-y-8">
          {/* 상단 5대 패턴 스테이지 탭 */}
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
                          background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                          color: '#FFFFFF',
                          border: '2px solid #0369A1',
                          boxShadow: '0 4px 0 #0369A1'
                        }
                      : {
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          border: '2px solid #BAE6FD',
                          boxShadow: '0 3px 0 #BAE6FD'
                        }
                  }
                >
                  <div
                    className="text-xs font-black"
                    style={{ color: isSelected ? '#FEF08A' : '#0284C7' }}
                  >
                    ◆ PATTERN 0{idx + 1}
                  </div>
                  <div className="font-black text-sm mt-0.5 leading-snug">{pat.title}</div>
                  <div
                    className="text-xs font-bold mt-1"
                    style={{ color: isSelected ? '#E0F2FE' : '#64748B' }}
                  >
                    {pat.meaning.split('(')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 패턴 갈아끼우기 스테이지 */}
          <div
            className="rounded-3xl p-6 sm:p-8 bg-white space-y-6"
            style={{ border: '2.5px solid #38BDF8', boxShadow: '0 6px 0 #38BDF8' }}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-3 pb-4"
              style={{ borderBottom: '2px solid #E0F2FE' }}
            >
              <div className="flex items-center gap-3">
                <SchoolMascot mood="happy" size="sm" />
                <div>
                  <span className="text-xs font-black" style={{ color: '#F43F5E' }}>
                    ⚡ 파츠(단어)만 교체하면 실전 대사가 바로 완성!
                  </span>
                  <h2 className="text-lg sm:text-xl font-black mt-0.5 text-slate-900">
                    {activePattern.title} — {activePattern.meaning}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => speakJapanese(assembledJp, studyState.settings.slowAudio)}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition cursor-pointer skew-badge"
                style={{ backgroundColor: '#F43F5E' }}
              >
                <Volume2 className="w-4 h-4" /> <span>VOICE PLAY</span>
              </button>
            </div>

            {/* 조립된 문장 디스플레이 */}
            <div
              className="rounded-2xl p-6 sm:p-8 text-center space-y-3 text-white"
              style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)', border: '2px solid #38BDF8' }}
            >
              <div className="text-3xl sm:text-5xl font-black tracking-wide">
                <span
                  className="underline decoration-wavy underline-offset-8"
                  style={{ color: '#38BDF8' }}
                >
                  {currentSlot.word}
                </span>
                <span className="text-white">{activePattern.templateJp.replace('{word}', '')}</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold" style={{ color: '#7DD3FC' }}>
                [{assembledKr}]
              </div>
              <div
                className="text-base sm:text-lg font-black inline-block px-5 py-1.5 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#FEF08A', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                “{assembledMeaning}”
              </div>
            </div>

            {/* 끼워 넣을 단어 파츠 버튼 */}
            <div className="space-y-2.5">
              <div className="text-xs font-black" style={{ color: '#0284C7' }}>
                ◆ 아래 단어 파츠를 클릭해 대사에 장착해 보세요 (클릭 시 보이스 재생):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {activePattern.slots.map((slot, idx) => {
                  const active = idx === slotIndex;
                  return (
                    <button
                      key={slot.word}
                      onClick={() => handleSelectSlot(idx)}
                      className="p-3 rounded-2xl text-center transition cursor-pointer"
                      style={
                        active
                          ? {
                              background: 'linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 100%)',
                              border: '2px solid #0284C7',
                              boxShadow: '0 3px 0 #0284C7'
                            }
                          : {
                              backgroundColor: '#F8FAFC',
                              border: '1.5px solid #E2E8F0'
                            }
                      }
                    >
                      <div className="text-xl font-black text-slate-900">{slot.word}</div>
                      <div className="text-xs font-extrabold mt-0.5" style={{ color: '#0284C7' }}>{slot.kr}</div>
                      <div className="text-xs font-bold text-slate-500">{slot.meaning}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 유이 선배 대사창 문법 팁 */}
            <div
              className="p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3"
              style={{ backgroundColor: '#F0F9FF', borderLeft: '4px solid #0284C7', color: '#1E293B' }}
            >
              <span
                className="px-2 py-0.5 rounded font-black text-white text-xs shrink-0"
                style={{ backgroundColor: '#F43F5E' }}
              >
                유이 선배
              </span>
              <div>
                <strong>원포인트 조언:</strong> “{activePattern.grammarPoint}”
              </div>
            </div>
          </div>

          {/* 하단: 필수 생존 대사 6선 */}
          <div className="space-y-3">
            <h3 className="text-base font-black flex items-center gap-2" style={{ color: '#0369A1' }}>
              <MessageSquare className="w-5 h-5" style={{ color: '#0284C7' }} />
              ⚡ 실전에서 바로 통하는 필수 서바이벌 대사 6선
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SURVIVAL_PHRASES.map(phrase => (
                <div
                  key={phrase.id}
                  onClick={() => speakJapanese(phrase.jp, studyState.settings.slowAudio)}
                  className="p-4 rounded-2xl bg-white flex items-center justify-between gap-3 cursor-pointer transition hover:translate-y-[-1px]"
                  style={{ border: '2px solid #BAE6FD', boxShadow: '0 4px 0 #BAE6FD' }}
                >
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xl font-black text-slate-900">{phrase.jp}</span>
                      <span className="text-xs font-extrabold" style={{ color: '#0284C7' }}>[{phrase.kr}]</span>
                    </div>
                    <div className="text-sm font-black text-slate-800">{phrase.meaning}</div>
                    <div className="text-xs font-bold text-slate-500">{phrase.usage}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(phrase.jp, studyState.settings.slowAudio);
                    }}
                    className="p-3 rounded-xl shrink-0 cursor-pointer text-white"
                    style={{ backgroundColor: '#0284C7' }}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 실전 대사 빈칸 퀴즈 */
        patternQ && (
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-3xl p-6 sm:p-8 bg-white text-center space-y-6"
              style={{ border: '2.5px solid #38BDF8', boxShadow: '0 6px 0 #38BDF8' }}
            >
              <div className="flex items-center justify-between text-xs font-black" style={{ color: '#0284C7' }}>
                <span className="flex items-center gap-2">
                  <SchoolMascot mood={lastWrong ? 'oops' : 'happy'} size="sm" />
                  <span>⚡ 빈칸에 들어갈 알맞은 일본어 조각을 완성하세요!</span>
                </span>
                <button
                  onClick={() => speakJapanese(patternQ.target.fullJp, studyState.settings.slowAudio)}
                  className="px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer skew-badge"
                  style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}
                >
                  <Volume2 className="w-3.5 h-3.5" /> <span>VOICE</span>
                </button>
              </div>

              <div
                className="rounded-2xl p-6 space-y-3"
                style={{ background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)', border: '2px solid #BAE6FD' }}
              >
                <div className="text-base sm:text-lg font-black" style={{ color: '#F43F5E' }}>
                  뜻: “{patternQ.target.meaning}”
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900">
                  {patternQ.blankType === 'word' ? (
                    <>
                      <span className="px-3 py-1 rounded-xl border-2 border-dashed border-sky-500 text-sky-600 bg-white">
                        [ ? ]
                      </span>{' '}
                      {patternQ.target.tailJp}
                    </>
                  ) : (
                    <>
                      {patternQ.target.wordJp}{' '}
                      <span className="px-3 py-1 rounded-xl border-2 border-dashed border-sky-500 text-sky-600 bg-white">
                        [ ? ]
                      </span>
                    </>
                  )}
                </div>
              </div>

              {quizAnswerType === 'choice' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {patternQ.options.map((opt, idx) => {
                    let st = {
                      backgroundColor: '#F8FAFC',
                      border: '2px solid #CBD5E1',
                      borderBottom: '4px solid #94A3B8',
                      color: '#0F172A'
                    };
                    if (isFeedback) {
                      if (idx === patternQ.correctIndex) {
                        st = { backgroundColor: '#0284C7', border: '2px solid #0369A1', color: '#FFFFFF' };
                      } else if (idx === selectedOpt) {
                        st = { backgroundColor: '#F43F5E', border: '2px solid #E11D48', color: '#FFFFFF' };
                      }
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectQuizOption(idx)}
                        disabled={isFeedback}
                        className="p-4 rounded-2xl font-black text-left cursor-pointer transition flex items-center justify-between"
                        style={st}
                      >
                        <div>
                          <div className="text-lg">{opt.jp}</div>
                          <div className="text-xs opacity-90">[{opt.kr}]</div>
                        </div>
                        <span className="text-xs font-black opacity-60">0{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <form onSubmit={handleTypingSubmit} className="max-w-md mx-auto space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={typingInput}
                      onChange={(e) => setTypingInput(e.target.value)}
                      placeholder="빈칸의 한국어 발음(예: 쿠다사이, 미즈) 입력!"
                      className="flex-1 px-4 py-3.5 rounded-2xl text-center text-base font-black outline-none"
                      style={
                        typingFlash
                          ? { backgroundColor: '#DCFCE7', color: '#166534', border: '2.5px solid #22C55E' }
                          : lastWrong
                          ? { backgroundColor: '#FFE4E6', color: '#BE123C', border: '2.5px solid #F43F5E' }
                          : { backgroundColor: '#F8FAFC', color: '#0F172A', border: '2.5px solid #38BDF8' }
                      }
                    />
                    <button
                      type="submit"
                      className="px-5 py-3.5 rounded-2xl font-black text-sm text-white cursor-pointer shrink-0 skew-badge"
                      style={{ backgroundColor: '#0284C7' }}
                    >
                      <span>{lastWrong ? 'NEXT ↵' : 'ENTER ↵'}</span>
                    </button>
                  </div>
                </form>
              )}

              {lastWrong && (
                <div
                  className="p-4 rounded-2xl text-left flex items-center justify-between gap-3 animate-fadeIn"
                  style={{ backgroundColor: '#FFF1F2', border: '2px solid #FDA4AF', color: '#9F1239' }}
                >
                  <div className="text-xs sm:text-sm font-black">
                    정답 문장: {patternQ.target.fullJp} [{patternQ.target.fullKr}]
                  </div>
                  <button
                    onClick={() => generatePatternQuiz(patternQ.target.id)}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white cursor-pointer shrink-0"
                    style={{ backgroundColor: '#F43F5E' }}
                  >
                    다음 →
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
