// 로컬 스토리지 기반 학습 진도·오답 가중치 관리 (로그인 없이 즉각 저장 및 약점 추적)

const STORAGE_KEY = 'jp_fast_master_v1';

const defaultState = {
  // 글자별 학습 기록: { [charId]: { correct: 0, wrong: 0, streak: 0, mastered: false } }
  kanaStats: {},
  // 단어별 학습 상태: { [vocabId]: 'new' | 'learning' | 'mastered' }
  vocabStatus: {},
  // 누적 학습 통계
  summary: {
    totalSolved: 0,
    totalCorrect: 0,
    bestStreak: 0
  },
  // 환경 설정
  settings: {
    autoSpeak: true,
    slowAudio: false,
    instantNext: true // 정답 시 딜레이 최소화 자동 넘김
  }
};

export function loadStudyState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      summary: { ...defaultState.summary, ...(parsed.summary || {}) },
      settings: { ...defaultState.settings, ...(parsed.settings || {}) }
    };
  } catch {
    return defaultState;
  }
}

export function saveStudyState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('학습 상태 저장 실패:', err);
  }
}

export function recordKanaResult(state, charId, isCorrect, currentStreak) {
  const prev = state.kanaStats[charId] || { correct: 0, wrong: 0, streak: 0, mastered: false };
  const nextStreak = isCorrect ? prev.streak + 1 : 0;
  const nextWrong = isCorrect ? Math.max(0, prev.wrong - 0.5) : prev.wrong + 2; // 틀리면 가중치 대폭 상승, 맞추면 서서히 감소
  const mastered = isCorrect && (prev.correct + 1 >= 3 && nextStreak >= 2);

  const nextState = {
    ...state,
    kanaStats: {
      ...state.kanaStats,
      [charId]: {
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: nextWrong,
        totalWrongCount: (prev.totalWrongCount || 0) + (isCorrect ? 0 : 1),
        streak: nextStreak,
        mastered: isCorrect ? (mastered || prev.mastered) : false
      }
    },
    summary: {
      totalSolved: state.summary.totalSolved + 1,
      totalCorrect: state.summary.totalCorrect + (isCorrect ? 1 : 0),
      bestStreak: Math.max(state.summary.bestStreak, currentStreak)
    }
  };

  saveStudyState(nextState);
  return nextState;
}

export function updateVocabStatus(state, vocabId, status) {
  const nextState = {
    ...state,
    vocabStatus: {
      ...state.vocabStatus,
      [vocabId]: status
    }
  };
  saveStudyState(nextState);
  return nextState;
}

export function updateSettings(state, patch) {
  const nextState = {
    ...state,
    settings: {
      ...state.settings,
      ...patch
    }
  };
  saveStudyState(nextState);
  return nextState;
}

export function resetAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return defaultState;
}
