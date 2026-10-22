import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2, AlertCircle, Keyboard } from 'lucide-react';
import { KANA_DATA, CONFUSING_PAIRS } from '../../data/kanaData';
import { speakJapanese } from '../../utils/tts';
import SchoolMascot from '../SchoolMascot';

const QUIZ_MODES = [
  { id: 'hira-to-kr', label: '히라가나 → 발음' },
  { id: 'kata-to-kr', label: '가타카나 → 발음' },
  { id: 'kr-to-kana', label: '보이스 → 글자 타겟' },
  { id: 'hira-to-kata', label: '히라 ↔ 가타 매칭' }
];

const SCOPES = [
  { id: 'first-half', label: 'STAGE 1 (あ~な행 25자)' },
  { id: 'second-half', label: 'STAGE 2 (は~ん 21자)' },
  { id: 'all-seion', label: 'ALL SEION (청음 46자)' },
  { id: 'dakuon', label: 'EXTRA (탁음·반탁음)' },
  { id: 'weak-only', label: '🔥 약점 타겟 집중전' }
];

export default function SchoolSpeedQuizView({ studyState, onRecordResult, customScope, onClearCustomScope }) {
  const [quizMode, setQuizMode] = useState('hira-to-kr');
  const [scope, setScope] = useState(customScope ? 'custom' : 'first-half');
  const [streak, setStreak] = useState(0);
  const [sessionSolved, setSessionSolved] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const [currentQ, setCurrentQ] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isFeedback, setIsFeedback] = useState(false);
  const [lastWasWrong, setLastWasWrong] = useState(false);

  useEffect(() => {
    if (customScope && customScope.ids?.length > 0) {
      setScope('custom');
    }
  }, [customScope]);

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
    setIsFeedback(false);
    setLastWasWrong(false);

    if (quizMode === 'kr-to-kana' || studyState.settings.autoSpeak) {
      speakJapanese(target.hira, studyState.settings.slowAudio);
    }
  }, [activePool, quizMode, studyState.kanaStats, studyState.settings.autoSpeak, studyState.settings.slowAudio]);

  useEffect(() => {
    generateQuestion(null);
  }, [scope, quizMode]);

  const handleSelectOption = useCallback((idx) => {
    if (!currentQ || isFeedback) return;

    setSelectedIdx(idx);
    setIsFeedback(true);

    const isCorrect = idx === currentQ.correctIndex;
    const nextStreak = isCorrect ? streak + 1 : 0;

    setStreak(nextStreak);
    setSessionSolved(s => s + 1);
    if (isCorrect) setSessionCorrect(c => c + 1);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
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
  }, [handleSelectOption, isFeedback, lastWasWrong, currentQ, generateQuestion, studyState.settings.slowAudio]);

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
    quizMode === 'hira-to-kr' ? 'TARGET HIRAGANA — 알맞은 발음을 선택하세요!' :
    quizMode === 'kata-to-kr' ? 'TARGET KATAKANA — 알맞은 발음을 선택하세요!' :
    quizMode === 'hira-to-kata' ? 'TARGET MATCH — 짝이 되는 가타카나를 고르세요!' :
    `SOUND [${currentQ.target.romaji.toUpperCase()}] — 알맞은 글자를 고르세요!`;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* 상단 스테이지 컨트롤 바 */}
      <div
        className="rounded-2xl p-4 bg-white space-y-3"
        style={{ border: '2px solid #BAE6FD', boxShadow: '0 4px 0 #BAE6FD' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {QUIZ_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setQuizMode(m.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer skew-badge"
                style={
                  quizMode === m.id
                    ? { backgroundColor: '#0284C7', color: '#FFFFFF', boxShadow: '0 2px 0 #0369A1' }
                    : { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
                }
              >
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-black">
            <span
              className="px-3 py-1 rounded-md text-white skew-badge"
              style={{ backgroundColor: '#F43F5E' }}
            >
              <span>⚡ {streak} COMBO!</span>
            </span>
            <span className="text-slate-500">
              ACC {sessionSolved > 0 ? Math.round((sessionCorrect / sessionSolved) * 100) : 100}% ({sessionCorrect}/{sessionSolved})
            </span>
          </div>
        </div>

        {/* 스테이지 범위 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2" style={{ borderTop: '1.5px solid #E0F2FE' }}>
          <span className="text-xs font-black text-sky-600 mr-1">MISSION:</span>
          {customScope && (
            <button
              onClick={() => setScope('custom')}
              className="px-3 py-1 rounded-md text-xs font-black cursor-pointer skew-badge"
              style={
                scope === 'custom'
                  ? { backgroundColor: '#0F172A', color: '#FFFFFF' }
                  : { backgroundColor: '#E0F2FE', color: '#0369A1' }
              }
            >
              <span>🎯 {customScope.label}</span>
            </button>
          )}
          {SCOPES.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setScope(s.id);
                if (onClearCustomScope) onClearCustomScope();
              }}
              className="px-3 py-1 rounded-md text-xs font-black transition cursor-pointer skew-badge"
              style={
                scope === s.id
                  ? { backgroundColor: '#0F172A', color: '#FFFFFF' }
                  : s.id === 'weak-only' && weakCount > 0
                  ? { backgroundColor: '#FFE4E6', color: '#BE123C', border: '1.5px solid #FDA4AF' }
                  : { backgroundColor: '#F1F5F9', color: '#475569' }
              }
            >
              <span>{s.label} {s.id === 'weak-only' ? `(${weakCount})` : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 메인 청량 아레나 스피드 퀴즈 보드 */}
      <div
        className="rounded-3xl p-6 sm:p-8 bg-white text-center relative overflow-hidden"
        style={{ border: '2.5px solid #38BDF8', boxShadow: '0 6px 0 #38BDF8' }}
      >
        <div className="flex items-center justify-between text-xs font-black mb-2">
          <div className="flex items-center gap-2" style={{ color: '#0284C7' }}>
            <SchoolMascot mood={lastWasWrong ? 'oops' : streak >= 5 ? 'happy' : 'normal'} size="sm" />
            <span>⚡ SPEED STAGE // 정답 시 0.2초 만에 다음 타겟으로 전환!</span>
          </div>
          <button
            onClick={() => speakJapanese(currentQ.target.hira, studyState.settings.slowAudio)}
            className="flex items-center gap-1 font-black px-3 py-1.5 rounded-lg cursor-pointer transition skew-badge"
            style={{ backgroundColor: '#E0F2FE', color: '#0284C7', border: '1.5px solid #7DD3FC' }}
          >
            <Volume2 className="w-3.5 h-3.5" /> <span>VOICE (Space)</span>
          </button>
        </div>

        {/* 중앙 타겟 문자 */}
        <div
          className="my-6 py-6 rounded-2xl"
          style={{ background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)', border: '2px solid #BAE6FD' }}
        >
          <div className="text-7xl sm:text-8xl font-black tracking-tight select-none" style={{ color: '#0F172A' }}>
            {promptMain}
          </div>
          <p className="text-xs sm:text-sm font-black mt-3" style={{ color: '#0284C7' }}>{promptSub}</p>
        </div>

        {/* 4지선다 버튼 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
          {currentQ.options.map((opt, idx) => {
            const optionLabel =
              quizMode === 'hira-to-kr' || quizMode === 'kata-to-kr'
                ? `${opt.kr.split('(')[0]} (${opt.romaji})`
                : quizMode === 'hira-to-kata'
                ? opt.kata
                : `${opt.hira} (${opt.kata})`;

            let inlineStyle = {
              backgroundColor: '#F8FAFC',
              border: '2px solid #CBD5E1',
              borderBottom: '4px solid #94A3B8',
              color: '#0F172A'
            };

            if (isFeedback) {
              if (idx === currentQ.correctIndex) {
                inlineStyle = {
                  backgroundColor: '#0284C7',
                  border: '2px solid #0369A1',
                  borderBottom: '4px solid #0C4A6E',
                  color: '#FFFFFF',
                  transform: 'scale(1.02)'
                };
              } else if (idx === selectedIdx) {
                inlineStyle = {
                  backgroundColor: '#F43F5E',
                  border: '2px solid #E11D48',
                  borderBottom: '4px solid #9F1239',
                  color: '#FFFFFF'
                };
              } else {
                inlineStyle = {
                  backgroundColor: '#F1F5F9',
                  border: '2px solid #E2E8F0',
                  color: '#94A3B8',
                  opacity: 0.6
                };
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(idx)}
                disabled={isFeedback}
                className="relative py-4 px-5 rounded-2xl font-black text-xl sm:text-2xl transition-all cursor-pointer flex items-center justify-between"
                style={inlineStyle}
              >
                <span
                  className="text-xs font-black px-2 py-0.5 rounded skew-badge"
                  style={
                    isFeedback && (idx === currentQ.correctIndex || idx === selectedIdx)
                      ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#FFFFFF' }
                      : { backgroundColor: '#E0F2FE', color: '#0284C7' }
                  }
                >
                  <span>0{idx + 1}</span>
                </span>
                <span className="mx-auto">{optionLabel}</span>
                <span className="w-5 text-sm">{isFeedback && idx === currentQ.correctIndex ? '♪' : ''}</span>
              </button>
            );
          })}
        </div>

        {/* 오답 시 유이 선배의 코칭 대사창 */}
        {lastWasWrong && (
          <div
            className="mt-6 p-4 rounded-2xl text-left max-w-xl mx-auto animate-fadeIn"
            style={{ backgroundColor: '#F0F9FF', borderLeft: '5px solid #F43F5E', border: '2px solid #7DD3FC' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-black text-sm" style={{ color: '#E11D48' }}>
                  <span className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: '#F43F5E' }}>
                    유이 선배
                  </span>
                  <span>정답은 [{currentQ.target.hira} / {currentQ.target.kata}] — “{currentQ.target.kr}” ({currentQ.target.romaji}) 야!</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed pl-1">
                  💡 <strong>선배의 팁:</strong> “{quizMode === 'kata-to-kr' || quizMode === 'hira-to-kata' ? currentQ.target.mnemonicKata : currentQ.target.mnemonicHira}”
                </p>
                {currentQ.target.confusingWith && (
                  <p
                    className="text-xs px-3 py-1.5 rounded-lg font-bold mt-1"
                    style={{ backgroundColor: '#FFE4E6', color: '#9F1239' }}
                  >
                    ⚠️ {currentQ.target.confusingWith}
                  </p>
                )}
              </div>
              <button
                onClick={() => generateQuestion(currentQ.target.id)}
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-black text-white cursor-pointer skew-badge"
                style={{ backgroundColor: '#0284C7' }}
              >
                <span>NEXT (Space) →</span>
              </button>
            </div>
          </div>
        )}

        <div
          className="mt-6 pt-3 flex items-center justify-center gap-4 text-xs font-bold text-slate-400"
          style={{ borderTop: '1.5px solid #E0F2FE' }}
        >
          <span className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-sky-500" />
            키보드 숫자키 <strong>1 ~ 4</strong>로 즉시 타겟 선택 · <strong>Space</strong>로 발음 재생 / 다음 스테이지
          </span>
        </div>
      </div>
    </div>
  );
}
