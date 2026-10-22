import React, { useState } from 'react';
import { Volume2, MessageSquare } from 'lucide-react';
import { PATTERN_DATA, SURVIVAL_PHRASES } from '../data/patternData';
import { speakJapanese } from '../utils/tts';
import NekoMascot from './NekoMascot';

export default function PatternBuilderView({ studyState }) {
  const [selectedPatternId, setSelectedPatternId] = useState(PATTERN_DATA[0].id);
  const [slotIndex, setSlotIndex] = useState(0);

  const activePattern = PATTERN_DATA.find(p => p.id === selectedPatternId) || PATTERN_DATA[0];
  const currentSlot = activePattern.slots[slotIndex] || activePattern.slots[0];

  const assembledJp = activePattern.templateJp.replace('{word}', currentSlot.word);
  const assembledKr = activePattern.templateKr.replace('{kr}', currentSlot.kr);
  const assembledMeaning = activePattern.templateMeaning.replaceAll('{meaning}', currentSlot.meaning);

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
    <div className="space-y-8">
      {/* 상단 5대 만능 패턴 탭 */}
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

      {/* 패턴 갈아끼우기 칠판 스테이지 */}
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

        {/* 조립된 문장 초록 칠판 */}
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

        {/* 끼워 넣을 단어 조각 버튼들 */}
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

        {/* 냐옹 선생님 문법 팁 */}
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

      {/* 하단: 무조건 쓰이는 생존 회화 6선 */}
      <div className="space-y-3">
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
