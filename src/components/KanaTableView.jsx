import React, { useState, useRef, useEffect } from 'react';
import { Volume2, AlertTriangle, CheckCircle2, Eraser, PenTool, ArrowRight } from 'lucide-react';
import { KANA_DATA, KANA_ROWS, CONFUSING_PAIRS } from '../data/kanaData';
import { speakJapanese } from '../utils/tts';
import NekoMascot from './NekoMascot';

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
    const clientY = e.touches ? e.touches[0].clientY : e.touches ? e.touches[0].clientY : e.clientY;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#2D4A3E';
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
      {/* 상단 공책 컨트롤 바 */}
      <div className="ghibli-paper rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8DEC8', color: '#5C4E41' }}>
            ✏️ 글자 보기
          </span>
          {[
            { id: 'both', label: '히라 + 가타 한눈에' },
            { id: 'hira', label: '히라가나 공책' },
            { id: 'kata', label: '가타카나 공책' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setScriptMode(mode.id)}
              className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
              style={
                scriptMode === mode.id
                  ? { backgroundColor: '#2D4A3E', color: '#FFFBEB', boxShadow: '0 2px 0 #1B2E26' }
                  : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
              }
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* 행 필터 & 헷갈리는 쌍 보기 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRow('all')}
            className="px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap cursor-pointer transition"
            style={
              selectedRow === 'all'
                ? { backgroundColor: '#B45309', color: '#FFFBEB' }
                : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
            }
          >
            📖 전체 원고지
          </button>
          <button
            onClick={() => setSelectedRow('confusing')}
            className="px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap cursor-pointer transition flex items-center gap-1"
            style={
              selectedRow === 'confusing'
                ? { backgroundColor: '#D97706', color: '#FFFFFF' }
                : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
            }
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            쌍둥이 글자 비교
          </button>
          <select
            value={selectedRow !== 'all' && selectedRow !== 'confusing' ? selectedRow : ''}
            onChange={(e) => setSelectedRow(e.target.value || 'all')}
            className="text-xs font-extrabold rounded-full px-3 py-1.5 outline-none cursor-pointer"
            style={{ backgroundColor: '#FAF6EE', color: '#3A322C', border: '1.5px solid #C7B69E' }}
          >
            <option value="">단원별 골라보기...</option>
            {KANA_ROWS.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 메인 레이아웃: 좌측 원고지 공책 / 우측 냐옹 선생님 칠판 노트 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 좌측: 오십음도 원고지 */}
        <div className="lg:col-span-7 space-y-5">
          {selectedRow === 'confusing' ? (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ backgroundColor: '#FEF3C7', border: '2px solid #F59E0B', color: '#78350F' }}
              >
                <NekoMascot mood="oops" size="sm" />
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    🐾 냐옹 선생님의 '쌍둥이 글자' 구분 노트!
                  </h3>
                  <p className="text-xs mt-0.5 font-semibold">
                    비슷하게 생긴 글자들을 나란히 놓고 다른 점 딱 하나만 찾으면 절대 안 헷갈린다옹!
                  </p>
                </div>
              </div>

              {CONFUSING_PAIRS.map(pair => {
                const chars = pair.chars.map(cid => KANA_DATA.find(k => k.id === cid)).filter(Boolean);
                return (
                  <div key={pair.id} className="ghibli-paper rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm" style={{ color: '#2D4A3E' }}>🌱 {pair.title}</span>
                      <button
                        onClick={() => onStartRowQuiz(pair.chars, pair.title)}
                        className="text-xs font-extrabold flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer transition"
                        style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
                      >
                        칠판 퀴즈로 연습 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {chars.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectChar(c)}
                          className="p-3 rounded-xl text-left transition cursor-pointer flex items-center justify-between genko-cell"
                          style={
                            activeChar?.id === c.id
                              ? { backgroundColor: '#FEF9C3', border: '2px solid #D97706' }
                              : { backgroundColor: '#FAF6EE', border: '1.5px dashed #C7B69E' }
                          }
                        >
                          <div>
                            <div className="text-2xl font-black" style={{ color: '#2D4A3E' }}>
                              {c.hira} <span className="text-lg font-bold" style={{ color: '#8C7A6B' }}>{c.kata}</span>
                            </div>
                            <div className="text-xs font-extrabold mt-0.5" style={{ color: '#B45309' }}>
                              {c.kr} ({c.romaji})
                            </div>
                          </div>
                          <Volume2 className="w-4 h-4" style={{ color: '#8C7A6B' }} />
                        </button>
                      ))}
                    </div>
                    <p
                      className="text-xs px-3.5 py-2.5 rounded-xl font-bold"
                      style={{ backgroundColor: '#ECFCCB', border: '1.5px solid #84CC16', color: '#365314' }}
                    >
                      🐾 <strong>냐옹이 구분법:</strong> {pair.tip}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            filteredRows.map(row => {
              const rowChars = KANA_DATA.filter(k => k.row === row.id);
              const rowMastered = rowChars.filter(c => studyState.kanaStats[c.id]?.mastered).length;
              return (
                <div key={row.id} className="ghibli-paper rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px dashed #E2D6C3' }}>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-black px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }}
                      >
                        🌱 {row.label}
                      </span>
                      <span className="text-xs font-bold" style={{ color: '#7D6E5D' }}>
                        {row.desc}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {rowMastered === rowChars.length && (
                        <span className="text-xs font-black" style={{ color: '#B45309' }}>참 잘했어요 💮</span>
                      )}
                      <button
                        onClick={() => onStartRowQuiz(rowChars.map(c => c.id), row.label)}
                        className="px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 transition cursor-pointer"
                        style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
                      >
                        이 단원 퀴즈 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 원고지 5칸 배열 */}
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
                          className="relative p-2.5 sm:p-3 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[80px] genko-cell"
                          style={
                            isSelected
                              ? {
                                  backgroundColor: '#FEF9C3',
                                  border: '2.5px solid #D97706',
                                  boxShadow: '0 3px 0 #D97706'
                                }
                              : isWeak
                              ? {
                                  backgroundColor: '#FEF2F2',
                                  border: '2px solid #F87171'
                                }
                              : isMastered
                              ? {
                                  backgroundColor: '#F0FDF4',
                                  border: '2px solid #4ADE80'
                                }
                              : {
                                  backgroundColor: '#FAF6EE',
                                  border: '1.5px dashed #C7B69E'
                                }
                          }
                        >
                          {/* 우측 상단 도토리/발자국 스티커 */}
                          {isWeak && (
                            <span className="absolute top-1 right-1 text-xs" title="자주 틀리는 글자">🐾</span>
                          )}
                          {!isWeak && isMastered && (
                            <span className="absolute top-1 right-1 text-xs" title="외운 글자">🌰</span>
                          )}

                          <div className="flex items-baseline justify-center gap-1">
                            {(scriptMode === 'both' || scriptMode === 'hira') && (
                              <span className="text-2xl sm:text-3xl font-black leading-none" style={{ color: '#2D4A3E' }}>
                                {char.hira}
                              </span>
                            )}
                            {(scriptMode === 'both' || scriptMode === 'kata') && (
                              <span
                                className={`${scriptMode === 'kata' ? 'text-2xl sm:text-3xl font-black' : 'text-base sm:text-lg font-bold'} leading-none`}
                                style={{ color: scriptMode === 'kata' ? '#2D4A3E' : '#8C7A6B' }}
                              >
                                {char.kata}
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 text-xs font-extrabold" style={{ color: '#B45309' }}>
                            {char.kr.split('(')[0]} <span className="text-xs font-semibold" style={{ color: '#8C7A6B' }}>({char.romaji})</span>
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

        {/* 우측: 교실 칠판 + 냐옹 선생님 암기 일기장 */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          {activeChar && (
            <div className="ghibli-paper rounded-3xl p-5 space-y-4">
              {/* 칠판 스타일 글자 헤더 */}
              <div className="ghibli-chalkboard rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1.5px dashed rgba(255,255,255,0.35)' }}>
                    <div className="text-4xl font-black text-white leading-none">{activeChar.hira}</div>
                    <div className="text-xs font-bold mt-1" style={{ color: '#FDE68A' }}>히라가나</div>
                  </div>
                  <div className="text-center px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1.5px dashed rgba(255,255,255,0.25)' }}>
                    <div className="text-4xl font-black text-white leading-none">{activeChar.kata}</div>
                    <div className="text-xs font-bold mt-1" style={{ color: '#A7F3D0' }}>가타카나</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black" style={{ color: '#FEF08A' }}>{activeChar.kr}</div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D1FAE5' }}>
                      발음: [{activeChar.romaji}]
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => speakJapanese(activeChar.hira, studyState.settings.slowAudio)}
                  className="px-3.5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                  style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', border: '1.5px solid #FEF08A' }}
                  title="원어민 발음 듣기"
                >
                  <Volume2 className="w-4 h-4" />
                  소리 듣기
                </button>
              </div>

              {/* 냐옹 선생님 연상 암기 말풍선 */}
              <div className="space-y-2.5">
                <div
                  className="p-3.5 rounded-2xl flex items-start gap-3"
                  style={{ backgroundColor: '#ECFCCB', border: '2px solid #84CC16', color: '#365314' }}
                >
                  <NekoMascot mood="happy" size="sm" />
                  <div className="space-y-1">
                    <div className="text-xs font-black" style={{ color: '#3F6212' }}>
                      🐾 히라가나 [{activeChar.hira}] 1초 그림 연상법
                    </div>
                    <p className="text-xs sm:text-sm font-bold leading-relaxed">
                      {activeChar.mnemonicHira}
                    </p>
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-2xl"
                  style={{ backgroundColor: '#FAF6EE', border: '1.5px dashed #C7B69E', color: '#4A3F35' }}
                >
                  <div className="text-xs font-black mb-1" style={{ color: '#7D6E5D' }}>
                    ✏️ 가타카나 [{activeChar.kata}] 1초 그림 연상법
                  </div>
                  <p className="text-xs sm:text-sm font-bold leading-relaxed">
                    {activeChar.mnemonicKata}
                  </p>
                </div>

                {activeChar.confusingWith && (
                  <div
                    className="p-3.5 rounded-2xl"
                    style={{ backgroundColor: '#FEF3C7', border: '1.5px solid #F59E0B', color: '#78350F' }}
                  >
                    <div className="text-xs font-black flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      쌍둥이 글자 주의보!
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
                  style={{ backgroundColor: '#F4ECE1', border: '1.5px solid #D5C7B2' }}
                >
                  <div>
                    <span className="text-xs font-extrabold" style={{ color: '#8C7A6B' }}>🌱 함께 배우는 기초 단어</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-black" style={{ color: '#2D4A3E' }}>{activeChar.example.jp}</span>
                      <span className="text-xs font-extrabold" style={{ color: '#B45309' }}>[{activeChar.example.kr}]</span>
                      <span className="text-sm font-extrabold" style={{ color: '#3A322C' }}>— {activeChar.example.meaning}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => speakJapanese(activeChar.example.jp, studyState.settings.slowAudio)}
                    className="p-2.5 rounded-xl transition cursor-pointer"
                    style={{ backgroundColor: '#2D4A3E', color: '#FEFCE8' }}
                    title="단어 발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 원고지 손글씨 연습장 */}
              <div className="pt-2" style={{ borderTop: '1.5px dashed #E2D6C3' }}>
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setShowCanvas(!showCanvas)}
                    className="text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    style={{ color: '#2D4A3E' }}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    {showCanvas ? '연습장 접기' : '🖍️ 원고지에 직접 따라 써보기'}
                  </button>
                  {showCanvas && (
                    <button
                      onClick={clearCanvas}
                      className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                      style={{ color: '#B45309' }}
                    >
                      <Eraser className="w-3.5 h-3.5" /> 지우개
                    </button>
                  )}
                </div>

                {showCanvas && (
                  <div
                    className="relative w-full h-40 rounded-2xl overflow-hidden select-none flex items-center justify-center genko-cell"
                    style={{ backgroundColor: '#FAF6EE', border: '2px dashed #A67B5B' }}
                  >
                    <div className="pointer-events-none text-8xl font-black select-none tracking-widest" style={{ color: 'rgba(199, 182, 158, 0.42)' }}>
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

              {/* 도토리 암기 도장 버튼 */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold" style={{ color: '#8C7A6B' }}>
                  칠판 퀴즈에서 3번 맞히면 자동으로 도토리(🌰)가 찍혀요!
                </span>
                <button
                  onClick={() => onToggleMastered(activeChar.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition"
                  style={
                    studyState.kanaStats[activeChar.id]?.mastered
                      ? { backgroundColor: '#DCFCE7', color: '#166534', border: '1.5px solid #4ADE80' }
                      : { backgroundColor: '#E8DEC8', color: '#5C4E41', border: '1.5px solid #C7B69E' }
                  }
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {studyState.kanaStats[activeChar.id]?.mastered ? '🌰 도토리 획득 완료!' : '외웠어요 도장 찍기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
