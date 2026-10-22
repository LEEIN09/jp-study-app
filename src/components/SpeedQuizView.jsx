import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2, Flame, RotateCcw, Zap, AlertCircle, CheckCircle2, Sparkles, Keyboard } from 'lucide-react';
import { KANA_DATA, CONFUSING_PAIRS } from '../data/kanaData';
import { speakJapanese } from '../utils/tts';

const QUIZ_MODES = [
  { id: 'hira-to-kr', label: '히라가나 → 발음', desc: '글자 보고 한국어 발음 고르기' },
  { id: 'kata-to-kr', label: '가타카나 → 발음', desc: '가타카나 보고 발음 고르기' },
  { id: 'kr-to-kana', label: '발음/소리 → 글자', desc: '발음 듣고 알맞은 글자 고르기' },
  { id: 'hira-to-kata', label: '히라가나 ↔ 가타카나', desc: '같은 소리의 가타카나 매칭' }
];

const SCOPES = [
  { id: 'first-half', label: '입문 전반 (あ~な행 25자)' },
  { id: 'second-half', label: '입문 후반 (は~ん 21자)' },
  { id: 'all-seion', label: '청음 전체 (46자)' },
  { id: 'dakuon', label: '탁음·반탁음' },
  { id: 'weak-only', label: '🔥 오답·약점 글자만' }
];

export default function SpeedQuizView({ studyState, onRecordResult, customScope, onClearCustomScope }) {
  const [quizMode, setQuizMode] = useState('hira-to-kr');
  const [scope, setScope] = useState(customScope ? 'custom' : 'first-half');
  const [streak, setStreak] = useState(0);
  const [sessionSolved, setSessionSolved] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const [currentQ, setCurrentQ] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isFeedback, setIsFeedback] = useState(false);
  const [lastWasWrong, setLastWasWrong] = useState(false);

  // customScope가 외부(오십음도 탭)에서 들어오면 즉시 반영
  useEffect(() => {
    if (customScope && customScope.ids?.length > 0) {
      setScope('custom');
    }
  }, [customScope]);

  // 현재 출제 대상 풀 계산
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
      return weakList.length >= 4 ? weakList : KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0 || !studyState.kanaStats[k.id]?.mastered).slice(0, 15);
    }
    return KANA_DATA.filter(k => k.type === 'seion');
  }, [scope, customScope, studyState.kanaStats]);

  // 가중치 기반 다음 문제 생성 (오답률 높은 글자 우선 출제 + 헷갈리는 글자 오답 보기 배치)
  const generateQuestion = useCallback((prevCharId = null) => {
    if (!activePool || activePool.length === 0) return;

    const candidates = activePool.length > 1
      ? activePool.filter(c => c.id !== prevCharId)
      : activePool;

    // 가중치 부여: 기본 1 + (틀린 가중치 * 3) + (미마스터 시 +1.5)
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

    // 오답 보기(3개) 선정: 헷갈리는 쌍에 속해 있으면 우선 포함시켜 변별력 강화!
    const pairMatch = CONFUSING_PAIRS.find(p => p.chars.includes(target.id));
    const distractorIds = new Set();

    if (pairMatch) {
      pairMatch.chars.forEach(cid => {
        if (cid !== target.id) distractorIds.add(cid);
      });
    }

    // 같은 행 글자들도 일부 후보로 추가
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

    // 소리 듣고 맞추기 모드이거나 자동 발음 설정 시 발음 재생
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
      // 정답이면 군더더기 없이 220ms 만에 즉시 다음 문제로 전환!
      setTimeout(() => {
        generateQuestion(currentQ.target.id);
      }, 220);
    } else {
      // 오답이면 연상 암기법을 확인하고 넘어가도록 대기
      setLastWasWrong(true);
    }
  }, [currentQ, isFeedback, streak, onRecordResult, generateQuestion, studyState.settings.slowAudio]);

  // 키보드 단축키 (1, 2, 3, 4 및 Space/Enter) 지원
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

  // 문제 프롬프트 표시 텍스트 결정
  const promptMain =
    quizMode === 'hira-to-kr' ? currentQ.target.hira :
    quizMode === 'kata-to-kr' ? currentQ.target.kata :
    quizMode === 'hira-to-kata' ? currentQ.target.hira :
    currentQ.target.kr.split('(')[0];

  const promptSub =
    quizMode === 'hira-to-kr' ? '이 히라가나의 발음은?' :
    quizMode === 'kata-to-kr' ? '이 가타카나의 발음은?' :
    quizMode === 'hira-to-kata' ? '짝이 되는 가타카나는?' :
    `[${currentQ.target.romaji}] 소리에 해당하는 글자는?`;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* 상단 모드 및 범위 선택 바 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {QUIZ_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setQuizMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  quizMode === m.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              연속 {streak}연타
            </span>
            <span className="text-slate-500">
              정답률 {sessionSolved > 0 ? Math.round((sessionCorrect / sessionSolved) * 100) : 100}% ({sessionCorrect}/{sessionSolved})
            </span>
          </div>
        </div>

        {/* 출제 범위 선택 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1">출제 범위:</span>
          {customScope && (
            <button
              onClick={() => setScope('custom')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${
                scope === 'custom'
                  ? 'bg-indigo-900 text-white'
                  : 'bg-indigo-50 text-indigo-700'
              }`}
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
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === s.id
                  ? 'bg-slate-900 text-white'
                  : s.id === 'weak-only' && weakCount > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label} {s.id === 'weak-only' ? `(${weakCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 스피드 퀴즈 카드 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 text-center relative overflow-hidden">
        {/* 상단 힌트 & 발음 다시 듣기 */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            정답 시 0.2초 만에 다음 문제로 넘어갑니다
          </span>
          <button
            onClick={() => speakJapanese(currentQ.target.hira, studyState.settings.slowAudio)}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" /> 발음 듣기 (Space)
          </button>
        </div>

        {/* 문제 글자 영역 */}
        <div className="my-6">
          <div className="text-7xl sm:text-8xl font-black text-slate-900 tracking-tight select-none">
            {promptMain}
          </div>
          <p className="text-sm font-semibold text-slate-500 mt-3">{promptSub}</p>
        </div>

        {/* 4지선다 버튼 (키보드 1~4 매핑) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
          {currentQ.options.map((opt, idx) => {
            const optionLabel =
              quizMode === 'hira-to-kr' || quizMode === 'kata-to-kr'
                ? `${opt.kr.split('(')[0]} (${opt.romaji})`
                : quizMode === 'hira-to-kata'
                ? opt.kata
                : `${opt.hira} (${opt.kata})`;

            let btnStyle = 'border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-800';
            if (isFeedback) {
              if (idx === currentQ.correctIndex) {
                btnStyle = 'border-emerald-500 bg-emerald-500 text-white shadow-md scale-[1.02]';
              } else if (idx === selectedIdx) {
                btnStyle = 'border-rose-500 bg-rose-500 text-white';
              } else {
                btnStyle = 'border-slate-200 bg-slate-100 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(idx)}
                disabled={isFeedback}
                className={`relative py-4 px-5 rounded-2xl border-2 font-extrabold text-xl sm:text-2xl transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
              >
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  isFeedback && (idx === currentQ.correctIndex || idx === selectedIdx)
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-500'
                }`}>
                  {idx + 1}
                </span>
                <span className="mx-auto">{optionLabel}</span>
                <span className="w-5" />
              </button>
            );
          })}
        </div>

        {/* 오답 시 즉시 뜨는 연상 암기 코칭 박스 */}
        {lastWasWrong && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left max-w-xl mx-auto animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  정답은 [{currentQ.target.hira} / {currentQ.target.kata}] — "{currentQ.target.kr}" ({currentQ.target.romaji}) 입니다!
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed pl-5">
                  💡 <strong>암기 팁:</strong> {quizMode === 'kata-to-kr' || quizMode === 'hira-to-kata' ? currentQ.target.mnemonicKata : currentQ.target.mnemonicHira}
                </p>
                {currentQ.target.confusingWith && (
                  <p className="text-xs text-amber-900 bg-amber-100/80 px-2.5 py-1.5 rounded-lg font-medium ml-5 mt-1">
                    ⚠️ {currentQ.target.confusingWith}
                  </p>
                )}
              </div>
              <button
                onClick={() => generateQuestion(currentQ.target.id)}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm cursor-pointer"
              >
                확인·다음 (Space) →
              </button>
            </div>
          </div>
        )}

        {/* 하단 단축키 안내 */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Keyboard className="w-3.5 h-3.5" />
            PC 단축키: 숫자키 <strong>1 ~ 4</strong>로 즉시 선택, <strong>Space</strong>로 발음 듣기 / 다음 문제
          </span>
        </div>
      </div>
    </div>
  );
}
