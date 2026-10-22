import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Zap,
  Layers,
  MessageSquare,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { KANA_DATA } from './data/kanaData';
import { VOCAB_DATA } from './data/vocabData';
import {
  loadStudyState,
  saveStudyState,
  recordKanaResult,
  updateVocabStatus,
  updateSettings,
  resetAllProgress
} from './utils/storage';
import NekoMascot from './components/NekoMascot';
import KanaTableView from './components/KanaTableView';
import SpeedQuizView from './components/SpeedQuizView';
import VocabFlashcardView from './components/VocabFlashcardView';
import PatternBuilderView from './components/PatternBuilderView';

const NAV_TABS = [
  { id: 'table', label: '1. 오십음도 원고지', icon: BookOpen, badge: '기초 글자' },
  { id: 'quiz', label: '2. 칠판 스피드 퀴즈', icon: Zap, badge: '0.2초 반복' },
  { id: 'vocab', label: '3. 여름방학 단어장', icon: Layers, badge: '필수 55단어' },
  { id: 'pattern', label: '4. 조각 문장 조립', icon: MessageSquare, badge: '실전 회화' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('table');
  const [studyState, setStudyState] = useState(() => loadStudyState());
  const [customQuizScope, setCustomQuizScope] = useState(null);

  // 청음 46자 중 암기 완료 개수 (도토리 수)
  const seionMasteredCount = useMemo(() => {
    return KANA_DATA.filter(k => k.type === 'seion' && studyState.kanaStats[k.id]?.mastered).length;
  }, [studyState.kanaStats]);

  // 약점(오답 가중치 > 0) 글자 개수
  const weakKanaCount = useMemo(() => {
    return KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0).length;
  }, [studyState.kanaStats]);

  // 암기 완료한 단어 수
  const vocabMasteredCount = useMemo(() => {
    return VOCAB_DATA.filter(v => studyState.vocabStatus[v.id] === 'mastered').length;
  }, [studyState.vocabStatus]);

  // 수동으로 글자 외움 토글
  const handleToggleMastered = (charId) => {
    const prev = studyState.kanaStats[charId] || { correct: 0, wrong: 0, streak: 0, mastered: false };
    const nextState = {
      ...studyState,
      kanaStats: {
        ...studyState.kanaStats,
        [charId]: {
          ...prev,
          mastered: !prev.mastered,
          wrong: !prev.mastered ? 0 : prev.wrong
        }
      }
    };
    saveStudyState(nextState);
    setStudyState(nextState);
  };

  // 퀴즈 결과 기록
  const handleRecordQuizResult = (charId, isCorrect, currentStreak) => {
    setStudyState(prev => recordKanaResult(prev, charId, isCorrect, currentStreak));
  };

  // 단어 학습 상태 변경
  const handleUpdateVocab = (vocabId, status) => {
    setStudyState(prev => updateVocabStatus(prev, vocabId, status));
  };

  // 오십음도 표에서 특정 행/비교 쌍만 바로 퀴즈로 시작
  const handleStartRowQuiz = (charIds, label) => {
    setCustomQuizScope({ ids: charIds, label });
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSlowAudio = () => {
    setStudyState(prev => updateSettings(prev, { slowAudio: !prev.settings.slowAudio }));
  };

  const handleReset = () => {
    if (window.confirm('모은 도토리와 일기장 학습 기록을 처음부터 다시 시작할까요?')) {
      setStudyState(resetAllProgress());
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-[#3A322C]">
      {/* 상단 고정 스케치북 헤더 */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(246, 240, 225, 0.94)', borderBottom: '2px dashed #C7B69E' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* 마스코트 & 타이틀 */}
          <div className="flex items-center gap-3">
            <NekoMascot mood={seionMasteredCount > 10 ? 'happy' : 'normal'} size="md" />
            <div>
              <h1 className="font-black text-base sm:text-lg leading-tight flex items-center gap-2" style={{ color: '#2D4A3E' }}>
                냐옹 선생님의 여름방학 일본어 일기 🌿
                <span
                  className="text-xs font-extrabold px-2.5 py-0.5 rounded-full hidden sm:inline-block"
                  style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }}
                >
                  왕초보 전용
                </span>
              </h1>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#7D6E5D' }}>
                오늘 모은 도토리: 🌰 <strong style={{ color: '#B45309' }}>{seionMasteredCount}/46개</strong> · 외운 단어 잎사귀: 🍃 <strong style={{ color: '#2D4A3E' }}>{vocabMasteredCount}/55개</strong>
              </p>
            </div>
          </div>

          {/* 우측 약점 바로가기 & 발음 속도 스위치 */}
          <div className="flex items-center gap-2 flex-wrap">
            {weakKanaCount > 0 && (
              <button
                onClick={() => {
                  const weakIds = KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0).map(k => k.id);
                  handleStartRowQuiz(weakIds, `헷갈린 글자 (${weakIds.length}개)`);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1.5px solid #F87171' }}
                title="클릭하면 틀렸던 글자만 칠판 퀴즈로 복습합니다"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                🐾 헷갈린 글자 {weakKanaCount}개 복습
              </button>
            )}

            <button
              onClick={handleToggleSlowAudio}
              className="px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition cursor-pointer"
              style={
                studyState.settings.slowAudio
                  ? { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
                  : { backgroundColor: '#FFFDF8', color: '#5C4E41', border: '1.5px solid #C7B69E' }
              }
              title="원어민 발음 속도 전환"
            >
              <span>{studyState.settings.slowAudio ? '🐢 느린 발음 (0.7x)' : '🐇 기본 발음 (1.0x)'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-full transition cursor-pointer hover:bg-[#E8DEC8]"
              style={{ color: '#8C7A6B' }}
              title="일기장 기록 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4단계 메인 다이어리 탭 */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto pb-2.5 pt-1">
          {NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer"
                style={
                  isActive
                    ? {
                        backgroundColor: '#2D4A3E',
                        color: '#FFFBEB',
                        border: '2px solid #1E352B',
                        boxShadow: '0 2px 0 #1E352B'
                      }
                    : {
                        backgroundColor: '#E8DEC8',
                        color: '#5C4E41',
                        border: '2px solid #D5C7B2'
                      }
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold hidden md:inline-block"
                  style={
                    isActive
                      ? { backgroundColor: '#E5A93C', color: '#1F2421' }
                      : { backgroundColor: '#F6F0E1', color: '#7D6E5D' }
                  }
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 메인 일기장 컨텐츠 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'table' && (
          <KanaTableView
            studyState={studyState}
            onToggleMastered={handleToggleMastered}
            onStartRowQuiz={handleStartRowQuiz}
          />
        )}

        {activeTab === 'quiz' && (
          <SpeedQuizView
            studyState={studyState}
            onRecordResult={handleRecordQuizResult}
            customScope={customQuizScope}
            onClearCustomScope={() => setCustomQuizScope(null)}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabFlashcardView
            studyState={studyState}
            onUpdateVocab={handleUpdateVocab}
          />
        )}

        {activeTab === 'pattern' && (
          <PatternBuilderView
            studyState={studyState}
          />
        )}
      </main>
    </div>
  );
}
