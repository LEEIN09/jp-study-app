import React, { useState, useRef, useEffect } from 'react';
import { Volume2, AlertTriangle, CheckCircle2, Eraser, PenTool, ArrowRight } from 'lucide-react';
import { KANA_DATA, KANA_ROWS, CONFUSING_PAIRS } from '../../data/kanaData';
import { speakJapanese } from '../../utils/tts';
import SchoolMascot from '../SchoolMascot';

export default function SchoolKanaTableView({ studyState, onToggleMastered, onStartRowQuiz }) {
  const [scriptMode, setScriptMode] = useState('both');
  const [selectedRow, setSelectedRow] = useState('all');
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
    ctx.strokeStyle = '#0284C7';
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
      {/* 상단 부활동 미션 컨트롤 바 */}
      <div
        className="rounded-2xl p-4 bg-white/95 flex flex-wrap items-center justify-between gap-4"
        style={{ border: '2px solid #BAE6FD', boxShadow: '0 4px 0 #BAE6FD' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-black px-2.5 py-1 rounded-md text-white skew-badge"
            style={{ background: 'linear-gradient(90deg, #0284C7, #38BDF8)' }}
          >
            <span>VIEW MODE</span>
          </span>
          {[
            { id: 'both', label: '히라 + 가타 동시' },
            { id: 'hira', label: '히라가나 미션' },
            { id: 'kata', label: '가타카나 미션' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setScriptMode(mode.id)}
              className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer skew-badge"
              style={
                scriptMode === mode.id
                  ? { backgroundColor: '#0284C7', color: '#FFFFFF', boxShadow: '0 2px 0 #0369A1' }
                  : { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
              }
            >
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* 행 필터 & 헷갈리는 쌍 보기 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRow('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap cursor-pointer transition skew-badge"
            style={
              selectedRow === 'all'
                ? { backgroundColor: '#0F172A', color: '#FFFFFF' }
                : { backgroundColor: '#F1F5F9', color: '#475569', border: '1.5px solid #CBD5E1' }
            }
          >
            <span>◆ ALL STAGE</span>
          </button>
          <button
            onClick={() => setSelectedRow('confusing')}
            className="px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap cursor-pointer transition flex items-center gap-1 skew-badge"
            style={
              selectedRow === 'confusing'
                ? { backgroundColor: '#F43F5E', color: '#FFFFFF' }
                : { backgroundColor: '#FFE4E6', color: '#BE123C', border: '1.5px solid #FDA4AF' }
            }
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>라이벌 글자 비교</span>
          </button>
          <select
            value={selectedRow !== 'all' && selectedRow !== 'confusing' ? selectedRow : ''}
            onChange={(e) => setSelectedRow(e.target.value || 'all')}
            className="text-xs font-black rounded-lg px-3 py-1.5 outline-none cursor-pointer"
            style={{ backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #7DD3FC' }}
          >
            <option value="">스테이지 선택...</option>
            {KANA_ROWS.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 오십음도 스테이지 그리드 */}
        <div className="lg:col-span-7 space-y-5">
          {selectedRow === 'confusing' ? (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-4 flex items-center gap-3 bg-white"
                style={{ border: '2px solid #FDA4AF', boxShadow: '0 4px 0 #FECDD3' }}
              >
                <SchoolMascot mood="oops" size="sm" />
                <div>
                  <h3 className="font-black text-sm sm:text-base" style={{ color: '#BE123C' }}>
                    ⚡ 유이 선배의 '헷갈리는 글자' 특별 보충수업!
                  </h3>
                  <p className="text-xs mt-0.5 font-bold text-slate-600">
                    “비슷하게 생긴 라이벌 글자들이야! 차이점 하나만 확실히 기억하면 절대 안 틀려~!”
                  </p>
                </div>
              </div>

              {CONFUSING_PAIRS.map(pair => {
                const chars = pair.chars.map(cid => KANA_DATA.find(k => k.id === cid)).filter(Boolean);
                return (
                  <div
                    key={pair.id}
                    className="rounded-2xl p-4 bg-white space-y-3"
                    style={{ border: '2px solid #BAE6FD', boxShadow: '0 4px 0 #BAE6FD' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm" style={{ color: '#0284C7' }}>◆ {pair.title}</span>
                      <button
                        onClick={() => onStartRowQuiz(pair.chars, pair.title)}
                        className="text-xs font-black flex items-center gap-1 px-3 py-1 rounded-md text-white cursor-pointer transition skew-badge"
                        style={{ backgroundColor: '#0284C7' }}
                      >
                        <span>스피드전 돌입</span> <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {chars.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectChar(c)}
                          className="p-3 rounded-xl text-left transition cursor-pointer flex items-center justify-between"
                          style={
                            activeChar?.id === c.id
                              ? { background: 'linear-gradient(180deg, #E0F2FE, #BAE6FD)', border: '2px solid #0284C7' }
                              : { backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0' }
                          }
                        >
                          <div>
                            <div className="text-2xl font-black" style={{ color: '#0369A1' }}>
                              {c.hira} <span className="text-lg font-bold text-slate-400">{c.kata}</span>
                            </div>
                            <div className="text-xs font-extrabold mt-0.5" style={{ color: '#0284C7' }}>
                              {c.kr} ({c.romaji})
                            </div>
                          </div>
                          <Volume2 className="w-4 h-4 text-sky-500" />
                        </button>
                      ))}
                    </div>
                    <div
                      className="text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-2"
                      style={{ backgroundColor: '#F0F9FF', borderLeft: '4px solid #0284C7', color: '#1E293B' }}
                    >
                      <span className="px-2 py-0.5 rounded font-black text-white text-xs shrink-0" style={{ backgroundColor: '#F43F5E' }}>
                        유이 선배
                      </span>
                      <span>“{pair.tip}”</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            filteredRows.map(row => {
              const rowChars = KANA_DATA.filter(k => k.row === row.id);
              const rowMastered = rowChars.filter(c => studyState.kanaStats[c.id]?.mastered).length;
              return (
                <div
                  key={row.id}
                  className="rounded-2xl p-4 bg-white/95"
                  style={{ border: '2px solid #BAE6FD', boxShadow: '0 4px 0 #BAE6FD' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #E0F2FE' }}>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-black px-2.5 py-1 rounded-md text-white skew-badge"
                        style={{ backgroundColor: '#0284C7' }}
                      >
                        <span>◆ {row.label}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {row.desc}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {rowMastered === rowChars.length && (
                        <span
                          className="text-xs font-black px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor: '#FEF08A', color: '#854D0E' }}
                        >
                          ★ ALL CLEAR!
                        </span>
                      )}
                      <button
                        onClick={() => onStartRowQuiz(rowChars.map(c => c.id), row.label)}
                        className="px-3 py-1 rounded-md text-xs font-black flex items-center gap-1 transition cursor-pointer skew-badge"
                        style={{ backgroundColor: '#F0F9FF', color: '#0284C7', border: '1.5px solid #7DD3FC' }}
                      >
                        <span>스피드전</span> <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                          className="relative p-2.5 sm:p-3 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[80px]"
                          style={
                            isSelected
                              ? {
                                  background: 'linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 100%)',
                                  border: '2px solid #0284C7',
                                  boxShadow: '0 3px 0 #0284C7'
                                }
                              : isWeak
                              ? {
                                  backgroundColor: '#FFF1F2',
                                  border: '2px solid #FB7185'
                                }
                              : isMastered
                              ? {
                                  backgroundColor: '#F0FDF4',
                                  border: '2px solid #38BDF8'
                                }
                              : {
                                  backgroundColor: '#F8FAFC',
                                  border: '1.5px solid #E2E8F0'
                                }
                          }
                        >
                          {isWeak && (
                            <span
                              className="absolute top-1 right-1 text-[10px] font-black px-1 rounded text-white"
                              style={{ backgroundColor: '#F43F5E' }}
                            >
                              !
                            </span>
                          )}
                          {!isWeak && isMastered && (
                            <span
                              className="absolute top-1 right-1 text-xs font-black"
                              style={{ color: '#F59E0B' }}
                            >
                              ★
                            </span>
                          )}

                          <div className="flex items-baseline justify-center gap-1">
                            {(scriptMode === 'both' || scriptMode === 'hira') && (
                              <span
                                className="text-2xl sm:text-3xl font-black leading-none"
                                style={{ color: isSelected ? '#0369A1' : '#0F172A' }}
                              >
                                {char.hira}
                              </span>
                            )}
                            {(scriptMode === 'both' || scriptMode === 'kata') && (
                              <span
                                className={`${scriptMode === 'kata' ? 'text-2xl sm:text-3xl font-black' : 'text-base sm:text-lg font-bold'} leading-none`}
                                style={{ color: scriptMode === 'kata' ? '#0369A1' : '#94A3B8' }}
                              >
                                {char.kata}
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 text-xs font-extrabold" style={{ color: '#0284C7' }}>
                            {char.kr.split('(')[0]} <span className="text-xs font-semibold text-slate-400">· {char.romaji.toUpperCase()}</span>
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

        {/* 우측: 유이 선배의 캐릭터 브리핑 카드 */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          {activeChar && (
            <div
              className="rounded-3xl p-5 bg-white space-y-4"
              style={{ border: '2px solid #38BDF8', boxShadow: '0 6px 0 #7DD3FC' }}
            >
              {/* 상단 브리핑 헤더 */}
              <div
                className="rounded-2xl p-4 flex items-center justify-between text-white"
                style={{ background: 'linear-gradient(135deg, #0369A1 0%, #0284C7 55%, #38BDF8 100%)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center px-3 py-2 rounded-xl bg-white/15 border border-white/30">
                    <div className="text-4xl font-black text-white leading-none">{activeChar.hira}</div>
                    <div className="text-xs font-extrabold mt-1 text-sky-100">HIRAGANA</div>
                  </div>
                  <div className="text-center px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                    <div className="text-4xl font-black text-white leading-none">{activeChar.kata}</div>
                    <div className="text-xs font-extrabold mt-1 text-sky-100">KATAKANA</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-yellow-200">{activeChar.kr}</div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-sky-100">
                      SOUND // [{activeChar.romaji.toUpperCase()}]
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => speakJapanese(activeChar.hira, studyState.settings.slowAudio)}
                  className="px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition shadow-sm skew-badge"
                  style={{ backgroundColor: '#F43F5E', color: '#FFFFFF' }}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>VOICE</span>
                </button>
              </div>

              {/* 유이 선배 대사창 스타일 연상 암기법 */}
              <div className="space-y-2.5">
                <div
                  className="p-3.5 rounded-xl flex items-start gap-3"
                  style={{ backgroundColor: '#F0F9FF', borderLeft: '4px solid #0284C7' }}
                >
                  <SchoolMascot mood="happy" size="sm" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="px-2 py-0.5 rounded font-black text-white text-xs"
                        style={{ backgroundColor: '#F43F5E' }}
                      >
                        유이 선배
                      </span>
                      <span className="text-xs font-black" style={{ color: '#0369A1' }}>
                        히라가나 [{activeChar.hira}] 1초 암기 팁!
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                      “{activeChar.mnemonicHira}”
                    </p>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-xl"
                  style={{ backgroundColor: '#F8FAFC', borderLeft: '4px solid #94A3B8' }}
                >
                  <div className="text-xs font-black text-slate-500 mb-1">
                    ◆ 가타카나 [{activeChar.kata}] 1초 암기 팁
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                    {activeChar.mnemonicKata}
                  </p>
                </div>

                {activeChar.confusingWith && (
                  <div
                    className="p-3.5 rounded-xl"
                    style={{ backgroundColor: '#FFF1F2', borderLeft: '4px solid #F43F5E', color: '#9F1239' }}
                  >
                    <div className="text-xs font-black flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      라이벌 글자 주의!
                    </div>
                    <p className="text-xs font-bold leading-relaxed">
                      {activeChar.confusingWith}
                    </p>
                  </div>
                )}
              </div>

              {/* 대표 예시 단어 */}
              {activeChar.example && (
                <div
                  className="flex items-center justify-between p-3.5 rounded-2xl"
                  style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
                >
                  <div>
                    <span className="text-xs font-black" style={{ color: '#38BDF8' }}>⚡ MISSION WORD</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-black text-white">{activeChar.example.jp}</span>
                      <span className="text-xs font-extrabold" style={{ color: '#7DD3FC' }}>[{activeChar.example.kr}]</span>
                      <span className="text-sm font-extrabold text-yellow-300">— {activeChar.example.meaning}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => speakJapanese(activeChar.example.jp, studyState.settings.slowAudio)}
                    className="p-2.5 rounded-xl transition cursor-pointer"
                    style={{ backgroundColor: '#0284C7', color: '#FFFFFF' }}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 트레이닝 드로잉 패드 */}
              <div className="pt-2" style={{ borderTop: '1.5px solid #E0F2FE' }}>
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setShowCanvas(!showCanvas)}
                    className="text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    style={{ color: '#0284C7' }}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    {showCanvas ? '트레이닝 패드 닫기' : '✍️ 터치/마우스로 직접 써보기'}
                  </button>
                  {showCanvas && (
                    <button
                      onClick={clearCanvas}
                      className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                      style={{ color: '#F43F5E' }}
                    >
                      <Eraser className="w-3.5 h-3.5" /> CLEAR
                    </button>
                  )}
                </div>

                {showCanvas && (
                  <div
                    className="relative w-full h-40 rounded-2xl overflow-hidden select-none flex items-center justify-center"
                    style={{ backgroundColor: '#F0F9FF', border: '2px dashed #38BDF8' }}
                  >
                    <div className="pointer-events-none text-8xl font-black select-none tracking-widest" style={{ color: 'rgba(56, 189, 248, 0.22)' }}>
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

              {/* CLEAR 스탬프 버튼 */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-400">
                  스피드전에서 3연속 정답 시 자동 CLEAR!
                </span>
                <button
                  onClick={() => onToggleMastered(activeChar.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition skew-badge"
                  style={
                    studyState.kanaStats[activeChar.id]?.mastered
                      ? { backgroundColor: '#FEF08A', color: '#854D0E', border: '1.5px solid #FACC15' }
                      : { backgroundColor: '#F1F5F9', color: '#475569', border: '1.5px solid #CBD5E1' }
                  }
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{studyState.kanaStats[activeChar.id]?.mastered ? '★ CLEAR 완료!' : 'CLEAR 체크'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
