// 일본어 원어민 발음(TTS) 유틸리티 — 딜레이 없이 즉각 재생되도록 최적화

let cachedJpVoice = null;

function findJapaneseVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedJpVoice) return cachedJpVoice;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 자연스러운 일본어 음성 우선 선택 (Google 日本語, Microsoft Nanami/Haruka, Kyoko 등)
  cachedJpVoice =
    voices.find(v => v.lang === 'ja-JP' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Nanami'))) ||
    voices.find(v => v.lang === 'ja-JP') ||
    voices.find(v => v.lang.startsWith('ja')) ||
    null;

  return cachedJpVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedJpVoice = null;
    findJapaneseVoice();
  };
}

export function speakJapanese(text, slow = false) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;

  try {
    // 빠른 반복 학습 시 이전 음성이 밀리지 않도록 즉시 취소 후 재생
    window.speechSynthesis.cancel();

    // 괄호나 불필요한 기호 제거 후 발음
    const cleanText = text.replace(/\(.*?\)/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = slow ? 0.65 : 0.92;
    utterance.pitch = 1.0;

    const voice = findJapaneseVoice();
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('TTS 재생 실패:', err);
  }
}
