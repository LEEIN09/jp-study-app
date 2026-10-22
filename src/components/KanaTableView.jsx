import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Sparkles, AlertTriangle, CheckCircle2, Eraser, PenTool, ArrowRight } from 'lucide-react';
import { KANA_DATA, KANA_ROWS, CONFUSING_PAIRS } from '../data/kanaData';
import { speakJapanese } from '../utils/tts';

export default function KanaTableView({ studyState, onToggleMastered, onStartRowQuiz }) {
  const [scriptMode, setScriptMode] = useState('both'); // 'hira' | 'kata' | 'both'
  const [selectedRow, setSelectedRow] = useState('all'); // 'all' | 'confusing' | rowId
  const [activeChar, setActiveChar] = useState(KANA_DATA[0]);
  const [showCanvas, setShowCanvas] = useState(false);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const handleSelectChar = (charItem) => {
    setActiveChar(charItem);
    speakJapanese(charItem.hira, studyState.settings.slowAudio);
    if (showCanvas) {
      clearCanvas();
    }
  };

  // 쓰기 연습 캔버스 초기화
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    clearCanvas();
  }, [activeChar, showCanvas]);

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    isDrawingRef.current = true;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => {
    isDrawingRef.current = false;
  };

  const filteredRows = selectedRow === 'all'
    ? KANA_ROWS
    : KANA_ROWS.filter(r => r.id === selectedRow);

  return (
    <div className="space-y-6">
      {/* 상단 컨트롤 바 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">표기 모드</span>
          {[
            { id: 'both', label: '히라 + 가타 동시' },
            { id: 'hira', label: '히라가나 집중' },
            { id: 'kata', label: '가타카나 집중' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setScriptMode(mode.id)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                scriptMode === mode.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* 행 필터 & 헷갈리는 글자 모아보기 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRow('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
              selectedRow === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 오십음도
          </button>
          <button
            onClick={() => setSelectedRow('confusing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              selectedRow === 'confusing'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            헷갈리는 글자 비교
          </button>
          <select
            value={selectedRow !== 'all' && selectedRow !== 'confusing' ? selectedRow : ''}
            onChange={(e) => setSelectedRow(e.target.value || 'all')}
            className="bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 outline-none"
          >
            <option value="">특정 행만 보기...</option>
            {KANA_ROWS.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 메인 레이아웃: 좌측 표 / 우측 상세 암기 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 오십음도 그리드 또는 헷갈리는 글자 비교 */}
        <div className="lg:col-span-7 space-y-5">
          {selectedRow === 'confusing' ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <h3 className="font-bold text-amber-900 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  입문자가 가장 많이 틀리는 쌍 완벽 비교
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  비슷하게 생긴 글자들을 나란히 놓고 차이점만 기억하면 오답률이 80% 이상 줄어듭니다. 글자를 눌러 발음을 들어보세요!
                </p>
              </div>

              {CONFUSING_PAIRS.map(pair => {
                const chars = pair.chars.map(cid => KANA_DATA.find(k => k.id === cid)).filter(Boolean);
                return (
                  <div key={pair.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{pair.title}</span>
                      <button
                        onClick={() => onStartRowQuiz(pair.chars, pair.title)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg cursor-pointer"
                      >
                        이 글자들만 퀴즈 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {chars.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectChar(c)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                            activeChar?.id === c.id
                              ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 hover:border-indigo-300 bg-slate-50/60'
                          }`}
                        >
                          <div>
                            <div className="text-2xl font-bold text-slate-900">
                              {c.hira} <span className="text-lg text-slate-400 font-normal">{c.kata}</span>
                            </div>
                            <div className="text-xs font-bold text-indigo-600 mt-0.5">{c.kr} ({c.romaji})</div>
                          </div>
                          <Volume2 className="w-4 h-4 text-slate-400" />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded-xl font-medium">
                      💡 <strong>구분 팁:</strong> {pair.tip}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            filteredRows.map(row => {
              const rowChars = KANA_DATA.filter(k => k.row === row.id);
              return (
                <div key={row.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{row.label}</h3>
                      <p className="text-xs text-slate-500">{row.desc}</p>
                    </div>
                    <button
                      onClick={() => onStartRowQuiz(rowChars.map(c => c.id), row.label)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      이 행만 집중 퀴즈 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {rowChars.map(char => {
                      const stat = studyState.kanaStats[char.id];
                      const isMastered = stat?.mastered;
                      const isWeak = (stat?.wrong || 0) >= 2;
                      const isSelected = activeChar?.id === char.id;

                      return (
                        <button
                          key={char.id}
                          onClick={() => handleSelectChar(char)}
                          className={`relative group p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[76px] ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-sm'
                              : isWeak
                              ? 'border-rose-300 bg-rose-50/40 hover:border-rose-400'
                              : isMastered
                              ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
                              : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-white'
                          }`}
                        >
                          {/* 우측 상단 상태 점 */}
                          {isWeak && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" title="자주 틀리는 글자" />
                          )}
                          {!isWeak && isMastered && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" title="암기 완료" />
                          )}

                          <div className="flex items-baseline justify-center gap-1">
                            {(scriptMode === 'both' || scriptMode === 'hira') && (
                              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                                {char.hira}
                              </span>
                            )}
                            {(scriptMode === 'both' || scriptMode === 'kata') && (
                              <span className={`${scriptMode === 'kata' ? 'text-2xl sm:text-3xl font-extrabold text-slate-900' : 'text-base sm:text-lg font-bold text-slate-400'} leading-none`}>
                                {char.kata}
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 text-xs font-bold text-indigo-600">
                            {char.kr.split('(')[0]} <span className="text-[11px] font-normal text-slate-400">{char.romaji}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 우측: 선택한 글자 상세 암기법 + 따라쓰기 캔버스 (스크롤 고정) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          {activeChar && (
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 space-y-5">
              {/* 글자 헤더 & 발음 버튼 */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-col">
                    <div className="text-4xl font-black text-indigo-950 leading-none">{activeChar.hira}</div>
                    <div className="text-xs font-bold text-indigo-500 mt-1">히라가나</div>
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-col">
                    <div className="text-4xl font-black text-slate-800 leading-none">{activeChar.kata}</div>
                    <div className="text-xs font-bold text-slate-500 mt-1">가타카나</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-slate-900">{activeChar.kr}</div>
                    <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">[{activeChar.romaji}]</div>
                  </div>
                </div>

                <button
                  onClick={() => speakJapanese(activeChar.hira, studyState.settings.slowAudio)}
                  className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="원어민 발음 듣기"
                >
                  <Volume2 className="w-4 h-4" />
                  발음 듣기
                </button>
              </div>

              {/* 연상 암기법 */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    히라가나 ({activeChar.hira}) 1초 연상법
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {activeChar.mnemonicHira}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                    가타카나 ({activeChar.kata}) 1초 연상법
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {activeChar.mnemonicKata}
                  </p>
                </div>

                {activeChar.confusingWith && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      헷갈리는 글자 주의!
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      {activeChar.confusingWith}
                    </p>
                  </div>
                )}
              </div>

              {/* 대표 예시 단어 */}
              {activeChar.example && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 text-white">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">대표 기초 단어</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-bold">{activeChar.example.jp}</span>
                      <span className="text-sm text-indigo-200">[{activeChar.example.kr}]</span>
                      <span className="text-sm font-semibold text-white">— {activeChar.example.meaning}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => speakJapanese(activeChar.example.jp, studyState.settings.slowAudio)}
                    className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="단어 발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 직접 써보기 토글 & 미니 캔버스 */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setShowCanvas(!showCanvas)}
                    className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    {showCanvas ? '손글씨 연습장 닫기' : '직접 마우스/터치로 따라 써보기'}
                  </button>
                  {showCanvas && (
                    <button
                      onClick={clearCanvas}
                      className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Eraser className="w-3.5 h-3.5" /> 지우기
                    </button>
                  )}
                </div>

                {showCanvas && (
                  <div className="relative w-full h-40 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden select-none flex items-center justify-center">
                    {/* 배경 가이드 글자 */}
                    <div className="pointer-events-none text-8xl font-black text-slate-200/80 select-none tracking-widest">
                      {activeChar.hira} {activeChar.kata}
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={160}
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={endDraw}
                      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                    />
                  </div>
                )}
              </div>

              {/* 암기 완료 수동 체크 버튼 */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">
                  퀴즈에서 3회 이상 연속 정답 시 자동으로 암기 완료 표시됩니다.
                </span>
                <button
                  onClick={() => onToggleMastered(activeChar.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    studyState.kanaStats[activeChar.id]?.mastered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {studyState.kanaStats[activeChar.id]?.mastered ? '암기 완료됨' : '외웠어요 체크'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
