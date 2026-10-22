import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Volume2, AlertTriangle, Zap, BookOpen, Calculator, Keyboard, MousePointerClick, CheckCircle2, AlertCircle } from 'lucide-react';
import { SPECIAL_RULES, YOON_CHART, NUMBER_SECTIONS } from '../data/numberSpecialData';
import { speakJapanese } from '../utils/tts';
import { playCorrectSfx, playWrongSfx } from '../utils/sfx';
import NekoMascot from './NekoMascot';

export default function NumberSpecialView({ studyState }) {
  const [subTab, setSubTab] = useState('numbers'); // 'numbers' | 'special' | 'quiz'
  const [onlyTraps, setOnlyTraps] = useState(false);

  // 스피드 퀴즈 상태
  const [quizAnswerType, setQuizAnswerType] = useState('choice'); // 'choice' | 'typing'
  const [quizScope, setQuizScope] = useState('all'); // 'all' | 'traps' | 'special'
  const [currentQ, setCurrentQ] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [typingInput, setTypingInput] = useState('');
  const [typingFlash, setTypingFlash] = useState(false);
  const [isFeedback, setIsFeedback] = useState(false);
  const [lastWrong, setLastWrong] = useState(false);
  const [streak, setStreak] = useState(0);

  const inputRef = useRef(null);
  const sfxEnabled = studyState.settings.soundFx !== false;

  // 퀴즈용 전체 문제 풀 생성
  const fullQuizPool = useMemo(() => {
    const list = [];
    NUMBER_SECTIONS.forEach(sec => {
      sec.items.forEach(item => {
        list.push({
          id: item.id,
          prompt: item.display,
          subPrompt: `${item.meaning} — 일본어로 어떻게 읽을까요?`,
          jp: item.jp.split('(')[0].trim(),
          kr: item.kr.split('(')[0].trim(),
          isTrap: item.isTrap,
          tip: item.tip || `${item.display} = ${item.jp} (${item.kr})`,
          category: 'number'
        });
      });
    });

    SPECIAL_RULES.forEach(rule => {
      rule.pairs.forEach((p, idx) => {
        list.push({
          id: `${rule.id}_${idx}`,
          prompt: p.wordJp,
          subPrompt: `뜻: "${p.wordMeaning}" — 올바른 발음은?`,
          jp: p.wordJp,
          kr: p.wordKr,
          isTrap: true,
          tip: `${p.wrongLook}(${p.wrongKr}) vs ${p.rightLook}(${p.rightKr}) 구분 주의!`,
          category: 'special'
        });
      });
    });

    return list;
  }, []);

  const activeQuizPool = useMemo(() => {
    if (quizScope === 'traps') return fullQuizPool.filter(q => q.isTrap);
    if (quizScope === 'special') return fullQuizPool.filter(q => q.category === 'special');
    return fullQuizPool;
  }, [fullQuizPool, quizScope]);

  const generateQuestion = useCallback((prevId = null) => {
    if (!activeQuizPool.length) return;
    const candidates = activeQuizPool.length > 1
      ? activeQuizPool.filter(q => q.id !== prevId)
      : activeQuizPool;

    const target = candidates[Math.floor(Math.random() * candidates.length)];

    const distractorPool = fullQuizPool.filter(
      q => q.id !== target.id && q.kr !== target.kr
    );
    const distractors = distractorPool.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.findIndex(o => o.id === target.id);

    setCurrentQ({ target, options, correctIndex });
    setSelectedIdx(null);
    setTypingInput('');
    setTypingFlash(false);
    setIsFeedback(false);
    setLastWrong(false);

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 30);
  }, [activeQuizPool, fullQuizPool]);

  useEffect(() => {
    if (subTab === 'quiz') {
      generateQuestion(null);
    }
  }, [subTab, quizScope, quizAnswerType, generateQuestion]);

  const handleSelectOption = useCallback((idx) => {
    if (!currentQ || isFeedback) return;
    setSelectedIdx(idx);
    setIsFeedback(true);

    const isCorrect = idx === currentQ.correctIndex;
    const nextStreak = isCorrect ? streak + 1 : 0;
    setStreak(nextStreak);

    if (isCorrect) {
      playCorrectSfx(sfxEnabled, nextStreak);
    } else {
      playWrongSfx(sfxEnabled);
    }
    speakJapanese(currentQ.target.jp, studyState.settings.slowAudio);

    if (isCorrect) {
      setTimeout(() => {
        generateQuestion(currentQ.target.id);
      }, 250);
    } else {
      setLastWrong(true);
    }
  }, [currentQ, isFeedback, streak, sfxEnabled, studyState.settings.slowAudio, generateQuestion]);

  const handleTypingSubmit = (e) => {
    e.preventDefault();
    if (!currentQ) return;

    if (lastWrong) {
      generateQuestion(currentQ.target.id);
      return;
    }
    if (isFeedback || !typingInput.trim()) return;

    const cleanInput = typingInput.trim().replace(/[-~\s]/g, '');
    const cleanKr = currentQ.target.kr.replace(/[-~\s]/g, '');
    const cleanJp = currentQ.target.jp.replace(/[-~\s]/g, '');

    const isCorrect = cleanInput === cleanKr || cleanInput === cleanJp || typingInput.trim() === currentQ.target.kr;
    setIsFeedback(true);
    const nextStreak = isCorrect ? streak + 1 : 0;
    setStreak(nextStreak);

    if (isCorrect) {
      playCorrectSfx(sfxEnabled, nextStreak);
      setTypingFlash(true);
      speakJapanese(currentQ.target.jp, studyState.settings.slowAudio);
      setTimeout(() => {
        generateQuestion(currentQ.target.id);
      }, 260);
    } else {
      playWrongSfx(sfxEnabled);
      speakJapanese(currentQ.target.jp, studyState.settings.slowAudio);
      setLastWrong(true);
    }
  };

  // 단축키 지원
  useEffect(() => {
    if (subTab !== 'quiz') return;
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (quizAnswerType === 'choice' && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        if (!isFeedback) handleSelectOption(idx);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (lastWrong && currentQ) {
          generateQuestion(currentQ.target.id);
        } else if (currentQ) {
          speakJapanese(currentQ.target.jp, studyState.settings.slowAudio);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [subTab, quizAnswerType, isFeedback, lastWrong, currentQ, handleSelectOption, generateQuestion, studyState.settings.slowAudio]);

  return (
    <div className="space-y-6">
      {/* 상단 3대 서브탭 바 */}
      <div className="ghibli-paper rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('numbers')}
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition"
            style={
              subTab === 'numbers'
                ? { backgroundColor: '#2D4A3E', color: '#FEFCE8', boxShadow: '0 2px 0 #1B2E26' }
                : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
            }
          >
            <Calculator className="w-4 h-4" />
            1. 숫자·가격(¥)·인원수 특훈표
          </button>

          <button
            onClick={() => setSubTab('special')}
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition"
            style={
              subTab === 'special'
                ? { backgroundColor: '#2D4A3E', color: '#FEFCE8', boxShadow: '0 2px 0 #1B2E26' }
                : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
            }
          >
            <BookOpen className="w-4 h-4" />
            2. 작은 글자(요음·촉음·장음) 비법
          </button>

          <button
            onClick={() => setSubTab('quiz')}
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition"
            style={
              subTab === 'quiz'
                ? { backgroundColor: '#D97706', color: '#FFFFFF', boxShadow: '0 2px 0 #92400E' }
                : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
            }
          >
            <Zap className="w-4 h-4" />
            3. ⚡ 숫자·함정발음 칠판 퀴즈
          </button>
        </div>

        {subTab === 'numbers' && (
          <label
            className="flex items-center gap-1.5 text-xs font-extrabold cursor-pointer select-none px-3.5 py-1.5 rounded-full"
            style={
              onlyTraps
                ? { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1.5px solid #F87171' }
                : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
            }
          >
            <input
              type="checkbox"
              checked={onlyTraps}
              onChange={(e) => setOnlyTraps(e.target.checked)}
              className="rounded"
            />
            ⚠️ 발음이 바뀌는 '함정 숫자'만 모아보기
          </label>
        )}
      </div>

      {/* =========================================================
          서브탭 1: 숫자·가격(¥)·인원수 도표
      ========================================================= */}
      {subTab === 'numbers' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap"
            style={{ backgroundColor: '#ECFCCB', border: '2px solid #84CC16', color: '#365314' }}
          >
            <div className="flex items-center gap-3">
              <NekoMascot mood="happy" size="sm" />
              <div>
                <h3 className="font-black text-sm sm:text-base">
                  🐾 냐옹 선생님의 숫자·가격(¥) 함정 피하기 특훈!
                </h3>
                <p className="text-xs font-bold mt-0.5">
                  일본어는 <strong>300(산뱌쿠), 600(롭퍄쿠), 800(합퍄쿠), 1명(히토리), 2명(후타리)</strong>처럼 발음이 살짝 변하는 숫자만 외우면 여행 계산은 100% 끝이다옹!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setQuizScope('traps');
                setSubTab('quiz');
              }}
              className="px-4 py-2 rounded-full text-xs font-black cursor-pointer shrink-0"
              style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
            >
              ⚠️ 함정 숫자만 바로 시험 보기 →
            </button>
          </div>

          {NUMBER_SECTIONS.map(sec => {
            const visibleItems = onlyTraps ? sec.items.filter(i => i.isTrap) : sec.items;
            if (visibleItems.length === 0) return null;

            return (
              <div key={sec.id} className="ghibli-paper rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="font-black text-base" style={{ color: '#2D4A3E' }}>🌱 {sec.title}</h3>
                  <p className="text-xs font-bold mt-0.5" style={{ color: '#7D6E5D' }}>{sec.subtitle}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {visibleItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => speakJapanese(item.jp.split('(')[0], studyState.settings.slowAudio)}
                      className="p-3.5 rounded-2xl text-left transition cursor-pointer flex flex-col justify-between relative genko-cell hover:translate-y-[-1px]"
                      style={
                        item.isTrap
                          ? { backgroundColor: '#FEF9C3', border: '2px solid #D97706', boxShadow: '0 3px 0 #D97706' }
                          : { backgroundColor: '#FAF6EE', border: '1.5px dashed #C7B69E' }
                      }
                    >
                      <div className="flex items-start justify-between w-full">
                        <span
                          className="text-xl sm:text-2xl font-black px-2 py-0.5 rounded-lg"
                          style={
                            item.isTrap
                              ? { backgroundColor: '#D97706', color: '#FFFFFF' }
                              : { backgroundColor: '#E8DEC8', color: '#2D4A3E' }
                          }
                        >
                          {item.display}
                        </span>
                        <div className="flex items-center gap-1">
                          {item.isTrap && (
                            <span
                              className="text-[11px] font-black px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                            >
                              ⚠️함정
                            </span>
                          )}
                          <Volume2 className="w-4 h-4" style={{ color: '#7D6E5D' }} />
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <div className="text-lg font-black" style={{ color: '#2D4A3E' }}>{item.jp}</div>
                        <div className="text-xs font-extrabold" style={{ color: '#B45309' }}>[{item.kr}]</div>
                      </div>

                      {item.tip && (
                        <div
                          className="mt-2 pt-1.5 text-[11px] font-bold leading-snug"
                          style={{ borderTop: '1px dashed #D5C7B2', color: '#78350F' }}
                        >
                          💡 {item.tip}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          서브탭 2: 작은 글자(요음·촉음·장음) 원리 & 비교
      ========================================================= */}
      {subTab === 'special' && (
        <div className="space-y-6">
          {SPECIAL_RULES.map(rule => (
            <div key={rule.id} className="ghibli-paper rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3" style={{ borderBottom: '1.5px dashed #D5C7B2' }}>
                <div>
                  <span
                    className="text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }}
                  >
                    ✨ {rule.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-black mt-1.5" style={{ color: '#2D4A3E' }}>
                    {rule.title}
                  </h3>
                  <p className="text-xs font-bold mt-0.5" style={{ color: '#5C4E41' }}>{rule.desc}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rule.pairs.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => speakJapanese(p.wordJp, studyState.settings.slowAudio)}
                    className="p-4 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3"
                    style={{ backgroundColor: '#FAF6EE', border: '2px solid #D5C7B2' }}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold" style={{ color: '#8C7A6B' }}>
                        <span className="line-through">{p.wrongLook} ({p.wrongKr})</span>
                        <span>→</span>
                        <span className="font-black px-2 py-0.5 rounded" style={{ backgroundColor: '#FEF9C3', color: '#B45309' }}>
                          ⭕ {p.rightLook} ({p.rightKr})
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black" style={{ color: '#2D4A3E' }}>{p.wordJp}</span>
                        <span className="text-sm font-extrabold" style={{ color: '#B45309' }}>[{p.wordKr}]</span>
                        <span className="text-sm font-black" style={{ color: '#3A322C' }}>— {p.wordMeaning}</span>
                      </div>
                    </div>
                    <button
                      className="p-3 rounded-xl shrink-0 cursor-pointer"
                      style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 요음 한눈에 보기 차트 */}
          <div className="ghibli-paper rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-black text-base" style={{ color: '#2D4A3E' }}>
                📖 필수 요음(ゃ·ゅ·ょ 조합) 한눈에 듣기 표
              </h3>
              <p className="text-xs font-bold mt-0.5" style={{ color: '#7D6E5D' }}>
                카드를 누르면 대표 단어의 원어민 발음을 들을 수 있어요!
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {YOON_CHART.map(row => (
                <button
                  key={row.id}
                  onClick={() => speakJapanese(row.example.split('(')[0], studyState.settings.slowAudio)}
                  className="p-3.5 rounded-2xl text-left cursor-pointer transition flex items-center justify-between"
                  style={{ backgroundColor: '#FAF6EE', border: '1.5px dashed #C7B69E' }}
                >
                  <div>
                    <div className="text-lg font-black" style={{ color: '#2D4A3E' }}>{row.jp}</div>
                    <div className="text-xs font-extrabold" style={{ color: '#B45309' }}>[{row.kr}]</div>
                    <div className="text-xs font-bold mt-1" style={{ color: '#5C4E41' }}>예: {row.example}</div>
                  </div>
                  <Volume2 className="w-4 h-4 shrink-0" style={{ color: '#8C7A6B' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          서브탭 3: 계산대 숫자·특수음 칠판 스피드 퀴즈
      ========================================================= */}
      {subTab === 'quiz' && currentQ && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="ghibli-paper rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-extrabold mr-1" style={{ color: '#8C7A6B' }}>범위:</span>
              {[
                { id: 'all', label: '전체 (숫자+가격+특수음)' },
                { id: 'traps', label: '⚠️ 함정 발음만 집중' },
                { id: 'special', label: '✨ 요음·촉음·장음 단어만' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setQuizScope(s.id)}
                  className="px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer transition"
                  style={
                    quizScope === s.id
                      ? { backgroundColor: '#B45309', color: '#FFFBEB' }
                      : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>

            <span
              className="px-3 py-1 rounded-full text-xs font-black"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }}
            >
              🌰 연속 {streak}문제 성공!
            </span>
          </div>

          <div className="ghibli-chalkboard rounded-3xl p-6 sm:p-8 text-center">
            {/* 칠판 내부 상단: 객관식 vs 주관식 타이핑 전환 스위치 */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5 pb-4" style={{ borderBottom: '1.5px dashed rgba(255,255,255,0.22)' }}>
              <button
                onClick={() => setQuizAnswerType('choice')}
                className="px-5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer"
                style={
                  quizAnswerType === 'choice'
                    ? { backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #FEF08A', boxShadow: '0 3px 0 #B45309' }
                    : { backgroundColor: 'rgba(255,255,255,0.1)', color: '#FEFCE8', border: '1.5px dashed rgba(255,255,255,0.35)' }
                }
              >
                <MousePointerClick className="w-4 h-4" />
                👆 4지선다 스피드 객관식
              </button>
              <button
                onClick={() => setQuizAnswerType('typing')}
                className="px-5 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer"
                style={
                  quizAnswerType === 'typing'
                    ? { backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #FEF08A', boxShadow: '0 3px 0 #B45309' }
                    : { backgroundColor: 'rgba(255,255,255,0.1)', color: '#FEFCE8', border: '1.5px dashed rgba(255,255,255,0.35)' }
                }
              >
                <Keyboard className="w-4 h-4" />
                ⌨️ 주관식 발음 직접 타이핑
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-bold mb-2" style={{ color: '#FDE68A' }}>
              <div className="flex items-center gap-2">
                <NekoMascot mood={lastWrong ? 'oops' : streak >= 3 ? 'happy' : 'normal'} size="sm" />
                <span>🖍️ 300엔(산뱌쿠), 600엔(롭퍄쿠), 800엔(합퍄쿠) 함정에 속지 마라옹!</span>
              </div>
              <button
                onClick={() => speakJapanese(currentQ.target.jp, studyState.settings.slowAudio)}
                className="flex items-center gap-1 font-extrabold px-3 py-1.5 rounded-full cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.14)', color: '#FEF08A', border: '1.5px dashed rgba(255,255,255,0.4)' }}
              >
                <Volume2 className="w-3.5 h-3.5" /> 발음 듣기
              </button>
            </div>

            <div className="my-6">
              <div className="text-5xl sm:text-7xl font-black text-white tracking-wide">
                {currentQ.target.prompt}
              </div>
              <p className="text-xs sm:text-sm font-bold mt-3" style={{ color: '#A7F3D0' }}>
                {currentQ.target.subPrompt}
              </p>
            </div>

            {quizAnswerType === 'choice' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {currentQ.options.map((opt, idx) => {
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
                        {opt.jp} <span className="text-xs opacity-90">({opt.kr})</span>
                      </span>
                      <span className="w-5 text-sm">{isFeedback && idx === currentQ.correctIndex ? '⭕' : ''}</span>
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
                    placeholder="한국어 발음 입력 (예: 산뱌쿠엔, 히토리)"
                    autoFocus
                    className="flex-1 px-5 py-4 rounded-2xl text-center text-lg font-black outline-none transition"
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
                    <CheckCircle2 className="w-4 h-4" /> 정답이다옹! ⭕ {currentQ.target.jp} ({currentQ.target.kr})
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
                      정답: {currentQ.target.jp} [{currentQ.target.kr}]
                    </div>
                    <p className="text-xs sm:text-sm font-bold pl-5" style={{ color: '#2D4A3E' }}>
                      💡 {currentQ.target.tip}
                    </p>
                  </div>
                  <button
                    onClick={() => generateQuestion(currentQ.target.id)}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer"
                    style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
                  >
                    다음 (Enter) →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
