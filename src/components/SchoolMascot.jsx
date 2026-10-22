import React from 'react';

// 청량 학원물(블루아카풍) 방과후 일본어부 마스코트 '유이 선배' 아바타 SVG (표정 변화 지원)
export default function SchoolMascot({ mood = 'normal', size = 'md', className = '' }) {
  const sizeClass =
    size === 'sm' ? 'w-9 h-9' :
    size === 'lg' ? 'w-16 h-16' :
    'w-11 h-11';

  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center shrink-0 select-none relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
        border: '2px solid #0369A1',
        boxShadow: '0 2px 0 #0369A1'
      }}
    >
      <svg viewBox="0 0 48 48" className="w-full h-full">
        {/* 머리 위 헤일로(청량 학원물 상징) */}
        <ellipse
          cx="24"
          cy="6.5"
          rx="11"
          ry="2.5"
          fill="none"
          stroke="#FEF08A"
          strokeWidth="2"
        />

        {/* 뒷머리 (밝은 은발/하늘색 단발) */}
        <path d="M10 22 C9 12, 39 12, 38 22 L40 38 L8 38 Z" fill="#E0F2FE" />

        {/* 세일러 카라 교복 */}
        <path d="M12 39 L36 39 L40 48 L8 48 Z" fill="#1E3A8A" />
        <path d="M18 39 L24 45 L30 39" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        <polygon points="24,43 21,47 27,47" fill="#F43F5E" />

        {/* 얼굴 피부 */}
        <ellipse cx="24" cy="27" rx="11.5" ry="10.5" fill="#FFF1E6" />

        {/* 볼터치 */}
        <ellipse cx="16.5" cy="29.5" rx="2.4" ry="1.3" fill="#FDA4AF" opacity="0.75" />
        <ellipse cx="31.5" cy="29.5" rx="2.4" ry="1.3" fill="#FDA4AF" opacity="0.75" />

        {/* 표정별 눈 (아쿠아 블루 눈동자) */}
        {mood === 'happy' ? (
          <>
            <path d="M16 26 Q19 22.5 21.5 26" stroke="#0369A1" strokeWidth="2.3" fill="none" strokeLinecap="round" />
            <path d="M26.5 26 Q29 22.5 32 26" stroke="#0369A1" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          </>
        ) : mood === 'oops' ? (
          <>
            <circle cx="19" cy="26.5" r="2.8" fill="#0284C7" />
            <circle cx="29" cy="26.5" r="2.8" fill="#0284C7" />
            <circle cx="19.7" cy="25.7" r="1" fill="#FFFFFF" />
            <circle cx="29.7" cy="25.7" r="1" fill="#FFFFFF" />
          </>
        ) : (
          <>
            <ellipse cx="19" cy="26.5" rx="2.5" ry="3" fill="#0369A1" />
            <ellipse cx="29" cy="26.5" rx="2.5" ry="3" fill="#0369A1" />
            <circle cx="19" cy="27.2" r="1.5" fill="#38BDF8" />
            <circle cx="29" cy="27.2" r="1.5" fill="#38BDF8" />
            <circle cx="19.8" cy="25.5" r="0.9" fill="#FFFFFF" />
            <circle cx="29.8" cy="25.5" r="0.9" fill="#FFFFFF" />
          </>
        )}

        {/* 입 */}
        {mood === 'oops' ? (
          <ellipse cx="24" cy="32.2" rx="1.6" ry="2" fill="#F43F5E" />
        ) : (
          <path d="M21.5 31.8 Q24 34.2 26.5 31.8" stroke="#E11D48" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        )}

        {/* 앞머리 & 헤어핀 */}
        <path d="M11 22 C13 13, 35 13, 37 22 C33 18, 29 23, 24 19 C19 23, 15 18, 11 22 Z" fill="#BAE6FD" />
        <rect x="31" y="19" width="4.5" height="2" rx="1" transform="rotate(-15 31 19)" fill="#F43F5E" />
      </svg>
    </div>
  );
}
