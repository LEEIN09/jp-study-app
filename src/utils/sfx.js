// 외부 오디오 파일 없이 Web Audio API로 구현한 포근한 실로폰/차임 효과음 (SFX)

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playCorrectSfx(enabled = true, streak = 1) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // 연속 정답에 따라 살짝 밝아지는 펜타토닉 차임벨 (도-미 / 레-파# 등)
    const baseFreq = 523.25 * Math.pow(1.03, Math.min(streak, 10)); // C5 기준

    [1, 1.25].forEach((ratio, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * ratio, now + idx * 0.065);

      gain.gain.setValueAtTime(0.001, now + idx * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.16, now + idx * 0.065 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.24);
    });
  } catch {
    // 무시
  }
}

export function playWrongSfx(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [220, 185].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.001, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.09 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.2);
    });
  } catch {
    // 무시
  }
}
