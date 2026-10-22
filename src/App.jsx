import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Zap,
  Layers,
  MessageSquare,
  Volume2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Gauge
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
import KanaTableView from './components/KanaTableView';
import SpeedQuizView from './components/SpeedQuizView';
import VocabFlashcardView from './components/VocabFlashcardView';
import PatternBuilderView from './components/PatternBuilderView';

const NAV_TABS = [
  { id: 'table', label: '1. 오십음도 & 연상법', icon: BookOpen, badge: '기초 글자' },
  { id: 'quiz', label: '2. 초고속 반복 퀴즈', icon: Zap, badge: '드릴 암기' },
  { id: 'vocab', label: '3. 초급 단어 & 읽기', icon: Layers, badge: '단어 55선' },
  { id: 'pattern', label: '4. 패턴 갈아끼우기', icon: MessageSquare, badge: '실전 회화' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('table');
  const [studyState, setStudyState] = useState(() => loadStudyState());
  const [customQuizScope, setCustomQuizScope] = useState(null);

  // 청음 46자 중 암기 완료 개수
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
    if (window.confirm('모든 암기 기록과 오답 데이터를 초기화하시겠습니까?')) {
      setStudyState(resetAllProgress());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 상단 고정 헤더 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* 로고 & 타이틀 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
              あ
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg text-slate-900 leading-tight flex items-center gap-2">
                일본어 초고속 입문 마스터
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  고효율 훈련형
                </span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                오십음도 연상 암기 → 0.2초 스피드 드릴 → 초급 단어 읽기 → 만능 문장 조립
              </p>
            </div>
          </div>

          {/* 우측 학습 진도 요약 & 오디오 속도 토글 */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="flex items-center gap-1 text-slate-700" title="청음 46자 암기 현황">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                오십음도 <strong className="text-indigo-600">{seionMasteredCount}/46</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-slate-700" title="필수 초급 단어 55개 암기 현황">
                단어 <strong className="text-indigo-600">{vocabMasteredCount}/55</strong>
              </span>
            </div>

            {weakKanaCount > 0 && (
              <button
                onClick={() => {
                  const weakIds = KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0).map(k => k.id);
                  handleStartRowQuiz(weakIds, `오답 약점 글자 (${weakIds.length}개)`);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center gap-1 transition cursor-pointer"
                title="클릭 시 내가 틀린 약점 글자만 바로 시험 봅니다"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                약점 {weakKanaCount}개 집중격파
              </button>
            )}

            <button
              onClick={handleToggleSlowAudio}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition cursor-pointer ${
                studyState.settings.slowAudio
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="원어민 발음 속도 조절"
            >
              <Gauge className="w-3.5 h-3.5" />
              {studyState.settings.slowAudio ? '발음: 느리게(0.7x)' : '발음: 정속(1.0x)'}
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
              title="학습 기록 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4단계 메인 탭 네비게이션 */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto pb-2 pt-1">
          {NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold hidden md:inline-block ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
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
