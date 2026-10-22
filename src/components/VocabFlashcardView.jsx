import React, { useState, useMemo, useEffect } from 'react';
import { Volume2, Eye, EyeOff, CheckCircle2, RotateCcw, Layers, List, ArrowRight } from 'lucide-react';
import { VOCAB_CATEGORIES, VOCAB_DATA } from '../data/vocabData';
import { speakJapanese } from '../utils/tts';
import NekoMascot from './NekoMascot';

export default function VocabFlashcardView({ studyState, onUpdateVocab }) {
  const [selectedCategory, setSelectedCategory] = useState('step1');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'
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

      {/* 컨트롤 바 */}
      <div className="ghibli-paper rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
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
            한 장씩 넘겨보기 카드
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
            단어 공책 펼쳐보기
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

      {/* 1. 플래시카드 모드 */}
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

            {/* 단어 칠판 박스 */}
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

      {/* 2. 단어 공책 리스트 모드 */}
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
