import React from 'react';

// 지브리풍 검은 고양이(쿠로네코) 마스코트 SVG 컴포넌트 (표정 변화 지원)
export default function NekoMascot({ mood = 'normal', size = 'md', className = '' }) {
  const sizeClass =
    size === 'sm' ? 'w-9 h-9' :
    size === 'lg' ? 'w-16 h-16' :
    'w-11 h-11';

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 select-none shadow-xs ${className}`}
      style={{ backgroundColor: '#2D4A3E', border: '2.5px solid #E5A93C' }}
    >
      <svg viewBox="0 0 48 48" className="w-full h-full p-1">
        {/* 양쪽 귀 */}
        <polygon points="10,24 8,9 20,17" fill="#1B201E" />
        <polygon points="11.5,21 10,12 18,17" fill="#E5989B" />
        <polygon points="38,24 40,9 28,17" fill="#1B201E" />
        <polygon points="36.5,21 38,12 30,17" fill="#E5989B" />

        {/* 얼굴 몸통 */}
        <ellipse cx="24" cy="27" rx="15" ry="13" fill="#1B201E" />

        {/* 머리 위 나뭇잎 장식 (지브리 여름 감성) */}
        <path d="M24 14 C24 9, 31 8, 30 13 C28 15, 25 15, 24 14 Z" fill="#84CC16" />
        <path d="M24 14 L22 11" stroke="#65A30D" strokeWidth="1.5" strokeLinecap="round" />

        {/* 표정별 눈 */}
        {mood === 'happy' ? (
          <>
            <path d="M15 26 Q18 22 21 26" stroke="#FDE047" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M27 26 Q30 22 33 26" stroke="#FDE047" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : mood === 'oops' ? (
          <>
            <circle cx="18" cy="26" r="4" fill="#FDE047" />
            <circle cx="30" cy="26" r="4" fill="#FDE047" />
            <circle cx="18" cy="26" r="1.2" fill="#111" />
            <circle cx="30" cy="26" r="1.2" fill="#111" />
          </>
        ) : (
          <>
            <circle cx="18" cy="26" r="3.6" fill="#FDE047" />
            <circle cx="30" cy="26" r="3.6" fill="#FDE047" />
            <circle cx="18.3" cy="26" r="1.5" fill="#111" />
            <circle cx="30.3" cy="26" r="1.5" fill="#111" />
            <circle cx="19.3" cy="24.8" r="0.7" fill="#FFF" />
            <circle cx="31.3" cy="24.8" r="0.7" fill="#FFF" />
          </>
        )}

        {/* 분홍 코와 입 */}
        <ellipse cx="24" cy="29.5" rx="2" ry="1.3" fill="#FDA4AF" />
        {mood === 'oops' ? (
          <circle cx="24" cy="33" r="1.8" fill="#FDA4AF" />
        ) : (
          <path d="M21 32 Q22.5 33.8 24 32 Q25.5 33.8 27 32" stroke="#FDA4AF" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        )}

        {/* 수염 */}
        <line x1="6" y1="27" x2="12" y2="28" stroke="#D6C7B2" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="31" x2="12" y2="30.5" stroke="#D6C7B2" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="42" y1="27" x2="36" y2="28" stroke="#D6C7B2" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="42" y1="31" x2="36" y2="30.5" stroke="#D6C7B2" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
