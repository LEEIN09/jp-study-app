import React, { useState, useMemo, useEffect } from 'react';
import { Volume2, Eye, EyeOff, CheckCircle2, RotateCcw, Layers, List, ArrowRight } from 'lucide-react';
import { VOCAB_CATEGORIES, VOCAB_DATA } from '../../data/vocabData';
import { speakJapanese } from '../../utils/tts';
import SchoolMascot from '../SchoolMascot';

export default function SchoolVocabView({ studyState, onUpdateVocab }) {
  const [selectedCategory, setSelectedCategory] = useState('step1');
  const [viewMode, setViewMode] = useState('card');
  const [filterUnmastered, setFilterUnmastered] = useState(false);

  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

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
      {/* 상단 스테이지 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {VOCAB_CATEGORIES.map(cat => {
          const total = VOCAB_DATA.filter(v => v.category === cat.id).length;
          const done = VOCAB_DATA.filter(v => v.category === cat.id && studyState.vocabStatus[v.id] === 'mastered').length;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between bg-white"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(180deg, #E0F2FE 0%, #FFFFFF 100%)',
                      border: '2px solid #0284C7',
                      boxShadow: '0 4px 0 #0284C7'
                    }
                  : {
                      border: '2px solid #BAE6FD',
                      boxShadow: '0 4px 0 #BAE6FD'
                    }
              }
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded text-white skew-badge"
                    style={{ backgroundColor: isActive ? '#F43F5E' : '#0284C7' }}
                  >
                    <span>{cat.badge}</span>
                  </span>
                  <span className="text-xs font-black" style={{ color: '#0284C7' }}>
                    ★ {done}/{total}
                  </span>
                </div>
                <h3 className="font-black text-sm mt-1.5 text-slate-900">{cat.title}</h3>
                <p className="text-xs mt-1 line-clamp-2 font-bold text-slate-500">{cat.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 컨트롤 바 */}
      <div
        className="rounded-2xl p-4 bg-white flex flex-wrap items-center justify-between gap-3"
        style={{ border: '2px solid #BAE6FD', boxShadow: '0 4px 0 #BAE6FD' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('card')}
            className="px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition skew-badge"
            style={
              viewMode === 'card'
                ? { backgroundColor: '#0284C7', color: '#FFFFFF' }
                : { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
            }
          >
            <Layers className="w-3.5 h-3.5" />
            <span>플래시 트레이닝</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition skew-badge"
            style={
              viewMode === 'list'
                ? { backgroundColor: '#0284C7', color: '#FFFFFF' }
                : { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
            }
          >
            <List className="w-3.5 h-3.5" />
            <span>전체 단어 데이터</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'list' && (
            <button
              onClick={() => {
                setHideAnswerInList(!hideAnswerInList);
                setRevealedIds({});
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition skew-badge"
              style={
                hideAnswerInList
                  ? { backgroundColor: '#F43F5E', color: '#FFFFFF' }
                  : { backgroundColor: '#FFE4E6', color: '#BE123C', border: '1.5px solid #FDA4AF' }
              }
            >
              {hideAnswerInList ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{hideAnswerInList ? '발음·뜻 보이기' : '블라인드 테스트 모드'}</span>
            </button>
          )}

          <label
            className="flex items-center gap-1.5 text-xs font-black cursor-pointer select-none px-3.5 py-1.5 rounded-lg"
            style={{ backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }}
          >
            <input
              type="checkbox"
              checked={filterUnmastered}
              onChange={(e) => setFilterUnmastered(e.target.checked)}
              className="rounded"
            />
            미클리어 단어만
          </label>
        </div>
      </div>

      {/* 플래시카드 모드 */}
      {viewMode === 'card' && currentWord && (
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-3xl p-6 sm:p-10 bg-white text-center space-y-6"
            style={{ border: '2.5px solid #38BDF8', boxShadow: '0 6px 0 #38BDF8' }}
          >
            <div className="flex items-center justify-between text-xs font-black" style={{ color: '#0284C7' }}>
              <span className="flex items-center gap-2">
                <SchoolMascot mood={isRevealed ? 'happy' : 'normal'} size="sm" />
                <span>CARD MISSION // {cardIndex + 1} OF {categoryWords.length}</span>
              </span>
              <button
                onClick={() => speakJapanese(currentWord.kana, studyState.settings.slowAudio)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg cursor-pointer font-black text-white skew-badge"
                style={{ backgroundColor: '#0284C7' }}
              >
                <Volume2 className="w-4 h-4" /> <span>VOICE</span>
              </button>
            </div>

            <div
              className="rounded-2xl py-8 px-4"
              style={{ background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)', border: '2px solid #BAE6FD' }}
            >
              <div className="text-5xl sm:text-7xl font-black tracking-wide text-slate-900">
                {currentWord.kana}
              </div>
              <p className="text-xs mt-3 font-black" style={{ color: '#0284C7' }}>
                ⚡ 유이 선배: “먼저 소리 내어 읽어본 다음 카드를 오픈해 봐!”
              </p>
            </div>

            {!isRevealed ? (
              <button
                onClick={handleReveal}
                className="w-full max-w-md mx-auto py-4 rounded-2xl font-black text-base text-white transition cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: '#0284C7', borderBottom: '4px solid #0369A1' }}
              >
                OPEN ANSWER (Space) <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                <div
                  className="p-5 rounded-2xl max-w-lg mx-auto space-y-2"
                  style={{ backgroundColor: '#F8FAFC', borderLeft: '4px solid #0284C7', border: '2px solid #BAE6FD' }}
                >
                  <div className="text-2xl font-black" style={{ color: '#0284C7' }}>
                    [{currentWord.kr}] — <span className="text-slate-900">{currentWord.meaning}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    한자/원어 표기: <span className="font-black text-slate-800">{currentWord.kanji}</span>
                  </div>
                  <div
                    className="text-xs px-3.5 py-1.5 rounded-lg inline-block font-black"
                    style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}
                  >
                    🧩 글자 분해: {currentWord.tip}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => handleRateCard('learning')}
                    className="py-3.5 px-4 rounded-2xl font-black text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: '#FFE4E6', color: '#BE123C', borderBottom: '3px solid #FDA4AF' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    1. RETRY (다시 보기)
                  </button>
                  <button
                    onClick={() => handleRateCard('mastered')}
                    className="py-3.5 px-4 rounded-2xl font-black text-sm text-white transition cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: '#0284C7', borderBottom: '3px solid #0369A1' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    2. CLEAR! ★
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 리스트 모드 */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoryWords.map(item => {
            const isMastered = studyState.vocabStatus[item.id] === 'mastered';
            const showAnswer = !hideAnswerInList || revealedIds[item.id];

            return (
              <div
                key={item.id}
                onClick={() => toggleListReveal(item.id, item.kana)}
                className="p-4 rounded-2xl transition flex items-center justify-between gap-3 cursor-pointer bg-white"
                style={
                  isMastered
                    ? { border: '2px solid #38BDF8', boxShadow: '0 3px 0 #BAE6FD' }
                    : { border: '2px solid #E2E8F0', boxShadow: '0 3px 0 #E2E8F0' }
                }
              >
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-2xl font-black text-slate-900">{item.kana}</span>
                    {showAnswer ? (
                      <>
                        <span className="text-sm font-extrabold" style={{ color: '#0284C7' }}>[{item.kr}]</span>
                        <span className="text-base font-black text-slate-800">{item.meaning}</span>
                      </>
                    ) : (
                      <span
                        className="text-xs font-black px-2.5 py-1 rounded-md text-white skew-badge"
                        style={{ backgroundColor: '#F43F5E' }}
                      >
                        <span>클릭하여 확인</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    🧩 {item.tip} · <span>표기: {item.kanji}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => speakJapanese(item.kana, studyState.settings.slowAudio)}
                    className="p-2.5 rounded-xl transition cursor-pointer"
                    style={{ backgroundColor: '#F0F9FF', color: '#0284C7', border: '1.5px solid #BAE6FD' }}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateVocab(item.id, isMastered ? 'learning' : 'mastered')}
                    className="px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 skew-badge"
                    style={
                      isMastered
                        ? { backgroundColor: '#FEF08A', color: '#854D0E' }
                        : { backgroundColor: '#F1F5F9', color: '#475569' }
                    }
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isMastered ? '★ CLEAR' : 'CHECK'}</span>
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
