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
import SchoolMascot from './components/SchoolMascot';

// 버전 1: 지브리 여름방학 그림일기 컴포넌트 (원본 그대로 유지)
import KanaTableView from './components/KanaTableView';
import SpeedQuizView from './components/SpeedQuizView';
import VocabFlashcardView from './components/VocabFlashcardView';
import PatternBuilderView from './components/PatternBuilderView';

// 버전 2: 청량 학원물 방과후 일본어부 컴포넌트
import SchoolKanaTableView from './components/school/SchoolKanaTableView';
import SchoolSpeedQuizView from './components/school/SchoolSpeedQuizView';
import SchoolVocabView from './components/school/SchoolVocabView';
import SchoolPatternView from './components/school/SchoolPatternView';

const GHIBLI_TABS = [
  { id: 'table', label: '1. 오십음도 원고지', icon: BookOpen, badge: '기초 글자' },
  { id: 'quiz', label: '2. 칠판 스피드 퀴즈', icon: Zap, badge: '0.2초 반복' },
  { id: 'vocab', label: '3. 여름방학 단어장', icon: Layers, badge: '필수 55단어' },
  { id: 'pattern', label: '4. 조각 문장 조립', icon: MessageSquare, badge: '실전 회화' }
];

const SCHOOL_TABS = [
  { id: 'table', label: 'STEP 01. 오십음도 미션', icon: BookOpen, badge: 'KANA' },
  { id: 'quiz', label: 'STEP 02. 스피드 배틀', icon: Zap, badge: '0.2s DRILL' },
  { id: 'vocab', label: 'STEP 03. 필수 단어장', icon: Layers, badge: '55 WORDS' },
  { id: 'pattern', label: 'STEP 04. 실전 대사 조립', icon: MessageSquare, badge: 'TALK' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('table');
  const [studyState, setStudyState] = useState(() => loadStudyState());
  const [customQuizScope, setCustomQuizScope] = useState(null);

  const currentTheme = studyState.settings.theme || 'ghibli'; // 'ghibli' | 'school'

  const handleSelectTheme = (themeKey) => {
    setStudyState(prev => updateSettings(prev, { theme: themeKey }));
  };

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

  const handleRecordQuizResult = (charId, isCorrect, currentStreak) => {
    setStudyState(prev => recordKanaResult(prev, charId, isCorrect, currentStreak));
  };

  const handleUpdateVocab = (vocabId, status) => {
    setStudyState(prev => updateVocabStatus(prev, vocabId, status));
  };

  const handleStartRowQuiz = (charIds, label) => {
    setCustomQuizScope({ ids: charIds, label });
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSlowAudio = () => {
    setStudyState(prev => updateSettings(prev, { slowAudio: !prev.settings.slowAudio }));
  };

  const handleReset = () => {
    if (window.confirm('모든 암기 기록과 오답 데이터를 처음부터 초기화할까요?')) {
      setStudyState(resetAllProgress());
    }
  };

  // 최상단 버전 전환 스위치 바 (두 테마 공통)
  const renderVersionSwitcher = () => (
    <div
      className="w-full py-1.5 px-4 text-xs font-extrabold flex items-center justify-center sm:justify-between flex-wrap gap-2"
      style={
        currentTheme === 'ghibli'
          ? { backgroundColor: '#2D4A3E', color: '#FEFCE8', borderBottom: '2px solid #A67B5B' }
          : { background: 'linear-gradient(90deg, #0F172A, #1E3A8A)', color: '#FFFFFF', borderBottom: '2px solid #38BDF8' }
      }
    >
      <span className="hidden sm:inline-block opacity-90">
        🎨 원하는 감성으로 언제든 모드를 바꿔보세요 (학습 기록은 그대로 연동됩니다!)
      </span>
      <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
        <button
          onClick={() => handleSelectTheme('ghibli')}
          className="px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1"
          style={
            currentTheme === 'ghibli'
              ? { backgroundColor: '#F59E0B', color: '#FFFFFF', boxShadow: '0 2px 0 #B45309' }
              : { backgroundColor: 'rgba(255,255,255,0.12)', color: '#CBD5E1' }
          }
        >
          🌿 버전 1: 여름방학 그림일기
        </button>
        <button
          onClick={() => handleSelectTheme('school')}
          className="px-3 py-1 rounded-full text-xs font-black transition cursor-pointer flex items-center gap-1"
          style={
            currentTheme === 'school'
              ? { backgroundColor: '#38BDF8', color: '#0F172A', boxShadow: '0 2px 0 #0284C7' }
              : { backgroundColor: 'rgba(255,255,255,0.12)', color: '#D1FAE5' }
          }
        >
          ⚡ 버전 2: 청량 학원물 일본어부
        </button>
      </div>
    </div>
  );

  // =========================================================
  // 버전 1: 지브리풍 여름방학 그림일기 렌더링 (기존 완벽 보존)
  // =========================================================
  if (currentTheme === 'ghibli') {
    return (
      <div className="min-h-screen flex flex-col theme-ghibli-bg">
        {renderVersionSwitcher()}

        <header
          className="sticky top-0 z-30 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(246, 240, 225, 0.94)', borderBottom: '2px dashed #C7B69E' }}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
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

            <div className="flex items-center gap-2 flex-wrap">
              {weakKanaCount > 0 && (
                <button
                  onClick={() => {
                    const weakIds = KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0).map(k => k.id);
                    handleStartRowQuiz(weakIds, `헷갈린 글자 (${weakIds.length}개)`);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1.5px solid #F87171' }}
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

          <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto pb-2.5 pt-1">
            {GHIBLI_TABS.map(tab => {
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

  // =========================================================
  // 버전 2: 청량 학원물 애니 (블루아카풍 방과후 일본어부) 렌더링
  // =========================================================
  return (
    <div className="min-h-screen flex flex-col theme-school-bg">
      {renderVersionSwitcher()}

      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.92)', borderBottom: '2px solid #7DD3FC' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SchoolMascot mood={seionMasteredCount > 10 ? 'happy' : 'normal'} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded font-black text-xs text-white skew-badge"
                  style={{ background: 'linear-gradient(90deg, #0284C7, #38BDF8)' }}
                >
                  <span>CLUB // 일본어부</span>
                </span>
                <h1 className="font-black text-base sm:text-lg leading-tight" style={{ color: '#0369A1' }}>
                  유이 선배의 방과후 초고속 트레이닝!
                </h1>
              </div>
              <p className="text-xs font-extrabold mt-0.5 text-slate-500">
                오십음도 CLEAR: ★ <strong style={{ color: '#0284C7' }}>{seionMasteredCount}/46</strong> · 단어 미션: ⚡ <strong style={{ color: '#0284C7' }}>{vocabMasteredCount}/55</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {weakKanaCount > 0 && (
              <button
                onClick={() => {
                  const weakIds = KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0).map(k => k.id);
                  handleStartRowQuiz(weakIds, `약점 타겟 (${weakIds.length}개)`);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-black text-white flex items-center gap-1.5 transition cursor-pointer skew-badge"
                style={{ backgroundColor: '#F43F5E', boxShadow: '0 2px 0 #BE123C' }}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>약점 타겟 {weakKanaCount}개 격파</span>
              </button>
            )}

            <button
              onClick={handleToggleSlowAudio}
              className="px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition cursor-pointer skew-badge"
              style={
                studyState.settings.slowAudio
                  ? { backgroundColor: '#FEF08A', color: '#854D0E', border: '1.5px solid #FACC15' }
                  : { backgroundColor: '#F0F9FF', color: '#0284C7', border: '1.5px solid #BAE6FD' }
              }
            >
              <span>{studyState.settings.slowAudio ? 'VOICE: SLOW (0.7x)' : 'VOICE: NORMAL (1.0x)'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-lg transition cursor-pointer hover:bg-sky-50 text-slate-400 hover:text-rose-500"
              title="학습 데이터 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto pb-2.5 pt-1">
          {SCHOOL_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer skew-badge"
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(90deg, #0284C7, #0369A1)',
                        color: '#FFFFFF',
                        boxShadow: '0 3px 0 #0C4A6E'
                      }
                    : {
                        backgroundColor: '#F0F9FF',
                        color: '#0369A1',
                        border: '1.5px solid #BAE6FD'
                      }
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded font-black hidden md:inline-block"
                  style={
                    isActive
                      ? { backgroundColor: '#FEF08A', color: '#0F172A' }
                      : { backgroundColor: '#E0F2FE', color: '#0284C7' }
                  }
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'table' && (
          <SchoolKanaTableView
            studyState={studyState}
            onToggleMastered={handleToggleMastered}
            onStartRowQuiz={handleStartRowQuiz}
          />
        )}
        {activeTab === 'quiz' && (
          <SchoolSpeedQuizView
            studyState={studyState}
            onRecordResult={handleRecordQuizResult}
            customScope={customQuizScope}
            onClearCustomScope={() => setCustomQuizScope(null)}
          />
        )}
        {activeTab === 'vocab' && (
          <SchoolVocabView
            studyState={studyState}
            onUpdateVocab={handleUpdateVocab}
          />
        )}
        {activeTab === 'pattern' && (
          <SchoolPatternView
            studyState={studyState}
          />
        )}
      </main>
    </div>
  );
}
