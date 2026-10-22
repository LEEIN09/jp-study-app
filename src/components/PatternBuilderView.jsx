import React, { useState } from 'react';
import { Volume2, MessageSquare, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { PATTERN_DATA, SURVIVAL_PHRASES } from '../data/patternData';
import { speakJapanese } from '../utils/tts';

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
      {/* 상단 패턴 선택 탭 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {PATTERN_DATA.map((pat, idx) => {
          const isSelected = pat.id === selectedPatternId;
          return (
            <button
              key={pat.id}
              onClick={() => handleSelectPattern(pat.id)}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-800'
              }`}
            >
              <div className={`text-[11px] font-bold ${isSelected ? 'text-indigo-200' : 'text-indigo-600'}`}>
                핵심 패턴 {idx + 1}
              </div>
              <div className="font-extrabold text-sm mt-0.5 leading-snug">{pat.title}</div>
              <div className={`text-xs mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                {pat.meaning.split('(')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* 패턴 갈아끼우기 인터랙티브 스테이지 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
              단어만 갈아끼우면 바로 문장이 됩니다
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">{activePattern.title} — {activePattern.meaning}</h2>
          </div>
          <button
            onClick={() => speakJapanese(assembledJp, studyState.settings.slowAudio)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> 완성 문장 발음 듣기
          </button>
        </div>

        {/* 조립된 문장 디스플레이 */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white text-center space-y-3">
          <div className="text-3xl sm:text-5xl font-black tracking-wide">
            <span className="text-amber-400 underline decoration-amber-400/50 underline-offset-8">
              {currentSlot.word}
            </span>
            <span>{activePattern.templateJp.replace('{word}', '')}</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-indigo-300">
            [{assembledKr}]
          </div>
          <div className="text-base sm:text-lg font-extrabold text-white bg-white/10 inline-block px-4 py-1.5 rounded-xl">
            “{assembledMeaning}”
          </div>
        </div>

        {/* 끼워 넣을 단어 버튼들 */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            아래 단어를 클릭해 문장에 끼워 넣어 보세요 (클릭 시 즉시 발음 재생):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {activePattern.slots.map((slot, idx) => {
              const active = idx === slotIndex;
              return (
                <button
                  key={slot.word}
                  onClick={() => handleSelectSlot(idx)}
                  className={`p-3 rounded-xl border-2 text-center transition cursor-pointer ${
                    active
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-indigo-300 text-slate-700'
                  }`}
                >
                  <div className="text-xl font-black">{slot.word}</div>
                  <div className="text-xs font-bold text-indigo-600 mt-0.5">{slot.kr}</div>
                  <div className="text-xs text-slate-500 font-semibold">{slot.meaning}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 원포인트 초간단 문법 팁 */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium flex items-start gap-2.5">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>입문자 핵심 포인트:</strong> {activePattern.grammarPoint}
          </div>
        </div>
      </div>

      {/* 하단: 무조건 쓰이는 생존 회화 6선 */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          패턴과 함께 외우면 끝나는 필수 생존 한마디 6선
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SURVIVAL_PHRASES.map(phrase => (
            <div
              key={phrase.id}
              onClick={() => speakJapanese(phrase.jp, studyState.settings.slowAudio)}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm flex items-center justify-between gap-3 cursor-pointer transition"
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl font-black text-slate-900">{phrase.jp}</span>
                  <span className="text-xs font-bold text-indigo-600">[{phrase.kr}]</span>
                </div>
                <div className="text-sm font-extrabold text-slate-800">{phrase.meaning}</div>
                <div className="text-xs text-slate-500">{phrase.usage}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(phrase.jp, studyState.settings.slowAudio);
                }}
                className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 shrink-0 cursor-pointer"
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
