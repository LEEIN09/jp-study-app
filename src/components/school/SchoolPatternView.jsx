import React, { useState } from 'react';
import { Volume2, MessageSquare } from 'lucide-react';
import { PATTERN_DATA, SURVIVAL_PHRASES } from '../../data/patternData';
import { speakJapanese } from '../../utils/tts';
import SchoolMascot from '../SchoolMascot';

export default function SchoolPatternView({ studyState }) {
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
  );
}
