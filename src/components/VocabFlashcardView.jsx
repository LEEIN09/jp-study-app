import React, { useState, useMemo, useEffect } from 'react';
import { Volume2, Eye, EyeOff, CheckCircle2, RotateCcw, Layers, List, Sparkles, ArrowRight } from 'lucide-react';
import { VOCAB_CATEGORIES, VOCAB_DATA } from '../data/vocabData';
import { speakJapanese } from '../utils/tts';

export default function VocabFlashcardView({ studyState, onUpdateVocab }) {
  const [selectedCategory, setSelectedCategory] = useState('step1');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'
  const [filterUnmastered, setFilterUnmastered] = useState(false);

  // 플래시카드 상태
  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // 리스트 모드에서 뜻/발음 가리기 상태
  const [hideAnswerInList, setHideAnswerInList] = useState(false);
  const [revealedIds, setRevealedIds] = useState({});

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

  // 플래시카드 키보드 단축키 지원
  useEffect(() => {
    if (viewMode !== 'card') return;
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isRevealed) {
          handleReveal();
        } else {
          handleRateCard('mastered');
        }
      } else if (e.key === '1' && isRevealed) {
        handleRateCard('learning');
      } else if (e.key === '2' && isRevealed) {
        handleRateCard('mastered');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewMode, isRevealed, currentWord, categoryWords.length]);

  const toggleListReveal = (id, kana) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
    speakJapanese(kana, studyState.settings.slowAudio);
  };

  return (
    <div className="space-y-6">
      {/* 단계별 카테고리 탭 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {VOCAB_CATEGORIES.map(cat => {
          const total = VOCAB_DATA.filter(v => v.category === cat.id).length;
          const done = VOCAB_DATA.filter(v => v.category === cat.id && studyState.vocabStatus[v.id] === 'mastered').length;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-indigo-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cat.badge}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">{done}/{total} 완료</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1.5">{cat.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 컨트롤 바 (플래시카드 vs 리스트 뷰) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              viewMode === 'card' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            스피드 암기 카드 (SRS)
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            전체 단어표 & 읽기 테스트
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'list' && (
            <button
              onClick={() => {
                setHideAnswerInList(!hideAnswerInList);
                setRevealedIds({});
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                hideAnswerInList
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {hideAnswerInList ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {hideAnswerInList ? '발음·뜻 모두 보이기' : '발음·뜻 가리고 읽기 연습'}
            </button>
          )}

          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-100 px-3 py-1.5 rounded-xl">
            <input
              type="checkbox"
              checked={filterUnmastered}
              onChange={(e) => setFilterUnmastered(e.target.checked)}
              className="rounded text-indigo-600"
            />
            안 외운 단어만 보기
          </label>
        </div>
      </div>

      {/* 1. 플래시카드 모드 */}
      {viewMode === 'card' && currentWord && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-slate-200 text-center space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>카드 {cardIndex + 1} / {categoryWords.length}</span>
              <button
                onClick={() => speakJapanese(currentWord.kana, studyState.settings.slowAudio)}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> 발음 듣기
              </button>
            </div>

            {/* 단어 본문 (히라가나/가타카나 크게 표시) */}
            <div className="py-6">
              <div className="text-5xl sm:text-7xl font-black text-slate-900 tracking-wide">
                {currentWord.kana}
              </div>
              <p className="text-xs text-slate-400 mt-3 font-medium">
                먼저 머릿속으로 글자를 소리 내어 읽어본 뒤 정답을 확인하세요!
              </p>
            </div>

            {/* 정답 확인 전 vs 후 */}
            {!isRevealed ? (
              <button
                onClick={handleReveal}
                className="w-full max-w-md mx-auto py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                발음 & 뜻 확인하기 (Space) <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto space-y-2">
                  <div className="text-2xl font-extrabold text-indigo-600">
                    [{currentWord.kr}] — <span className="text-slate-900">{currentWord.meaning}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    한자/원어 표기: <span className="text-slate-700 font-bold">{currentWord.kanji}</span>
                  </div>
                  <div className="text-xs text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block font-semibold">
                    🧩 글자 쪼개기: {currentWord.tip}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => handleRateCard('learning')}
                    className="py-3.5 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    1. 아직 헷갈림 (반복)
                  </button>
                  <button
                    onClick={() => handleRateCard('mastered')}
                    className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    2. 완벽히 읽음 (통과)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. 리스트 & 읽기 테스트 모드 */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoryWords.map(item => {
            const isMastered = studyState.vocabStatus[item.id] === 'mastered';
            const showAnswer = !hideAnswerInList || revealedIds[item.id];

            return (
              <div
                key={item.id}
                onClick={() => toggleListReveal(item.id, item.kana)}
                className={`p-4 rounded-2xl border bg-white transition flex items-center justify-between gap-3 cursor-pointer ${
                  isMastered ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-black text-slate-900">{item.kana}</span>
                    {showAnswer ? (
                      <>
                        <span className="text-sm font-bold text-indigo-600">[{item.kr}]</span>
                        <span className="text-base font-extrabold text-slate-800">{item.meaning}</span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                        클릭해서 발음·뜻 확인
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    🧩 {item.tip} · <span className="text-slate-400">한자/원어: {item.kanji}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => speakJapanese(item.kana, studyState.settings.slowAudio)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 transition cursor-pointer"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateVocab(item.id, isMastered ? 'learning' : 'mastered')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      isMastered
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isMastered ? '외움' : '체크'}
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
