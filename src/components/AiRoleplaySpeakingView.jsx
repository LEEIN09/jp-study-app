import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Send,
  Sparkles,
  Key,
  RotateCcw,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { VOCAB_DATA } from '../data/vocabData';
import { SURVIVAL_PHRASES } from '../data/patternData';
import { KANA_DATA } from '../data/kanaData';
import { speakJapanese } from '../utils/tts';
import { playCorrectSfx, playWrongSfx } from '../utils/sfx';
import {
  startJapaneseSpeechRecognition,
  checkSpeechMatch
} from '../utils/speechRecognition';
import {
  loadGeminiApiKey,
  saveGeminiApiKey,
  ROLEPLAY_SCENARIOS,
  generateAiRoleplayTurn,
  askAiBeginnerQuestion,
  generateWeakKanaCustomWords
} from '../utils/geminiClient';
import NekoMascot from './NekoMascot';
import SchoolMascot from './SchoolMascot';

const PRESET_FAQS = [
  {
    q: '왜 は(하)는 글자가 하인데 "~은/는"일 때 "와"로 읽어요?',
    summary: '문장에서 주인공을 가리키는 조사("~은/는")로 쓰일 때만 옛날 발음 흔적 때문에 [와]로 읽어요!',
    explanation: '단어 안에서 쓰일 때(예: はな 하나=꽃)는 원래대로 "하"라고 읽지만, 문장에서 "나는(わたしは 와타시와)", "이것은(これは 코레와)"처럼 "~은/는" 뜻으로 붙을 때만 특별히 "와"로 소리 냅니다.',
    examples: [
      { jp: 'わたしは', kr: '와타시와', meaning: '나는 / 저는' },
      { jp: 'トイレは どこですか', kr: '토이레와 도코데스카', meaning: '화장실은 어디인가요?' }
    ]
  },
  {
    q: '스미마셍(すみません)이랑 고멘나사이(ごめんなさい)는 뭐가 달라요?',
    summary: '스미마셍은 "저기요 / 실례합니다 / 가벼운 사과" 만능 표현이고, 고멘나사이는 진짜 잘못했을 때만 쓰는 사과예요!',
    explanation: '식당에서 직원을 부를 때나 길에서 모르는 사람에게 말을 걸 때, 혹은 살짝 부딪혔을 때는 무조건 "스미마셍"을 씁니다. "고멘나사이"는 친구나 가족에게 진심으로 미안하다고 사과할 때 주로 씁니다.',
    examples: [
      { jp: 'すみません、みず ください', kr: '스미마셍, 미즈 쿠다사이', meaning: '저기요, 물 주세요' },
      { jp: 'おくれて ごめんなさい', kr: '오쿠레테 고멘나사이', meaning: '늦어서 미안해요' }
    ]
  },
  {
    q: 'ください(쿠다사이)와 おねがいします(오네가이시마스)는 언제 구분해요?',
    summary: '눈에 보이는 물건을 달라고 할 땐 "쿠다사이", 서비스나 부탁을 할 땐 "오네가이시마스"를 써요!',
    explanation: '물, 커피, 메뉴판처럼 손에 쥐여주는 물건 뒤에는 둘 다 쓸 수 있지만 "쿠다사이"가 가장 직관적입니다. 반면 택시에서 행선지를 말하거나 계산(오카이케이), 체크인을 부탁할 땐 "오네가이시마스"를 씁니다.',
    examples: [
      { jp: 'コーヒー ください', kr: '코-히- 쿠다사이', meaning: '커피 주세요 (물건)' },
      { jp: 'おかいけい おねがいします', kr: '오카이케이 오네가이시마스', meaning: '계산 부탁드립니다 (서비스)' }
    ]
  }
];

export default function AiRoleplaySpeakingView({ studyState }) {
  const [subTab, setSubTab] = useState('roleplay'); // 'roleplay' | 'speaking' | 'aitutor'
  const [apiKey, setApiKey] = useState(() => loadGeminiApiKey());
  const [keyInput, setKeyInput] = useState(() => loadGeminiApiKey());
  const [showKeyBox, setShowKeyBox] = useState(false);

  const sfxEnabled = studyState.settings.soundFx !== false;
  const currentTheme = studyState.settings.theme || 'ghibli';
  const isSchool = currentTheme === 'school';

  // =========================================================
  // 1. 실전 3턴 상황극 상태
  // =========================================================
  const [scenarioId, setScenarioId] = useState(ROLEPLAY_SCENARIOS[0].id);
  const [turnIndex, setTurnIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [userReply, setUserReply] = useState('');
  const [isListeningRoleplay, setIsListeningRoleplay] = useState(false);
  const [roleplayCleared, setRoleplayCleared] = useState(false);
  const [useAiRoleplay, setUseAiRoleplay] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const currentScenario = ROLEPLAY_SCENARIOS.find(s => s.id === scenarioId) || ROLEPLAY_SCENARIOS[0];

  // 시나리오 시작/초기화
  const initScenario = (scen) => {
    const firstTurn = scen.turns[0];
    setTurnIndex(0);
    setRoleplayCleared(false);
    setUserReply('');
    setChatHistory([
      {
        role: 'npc',
        jp: firstTurn.npcJp,
        kr: firstTurn.npcKr,
        meaning: firstTurn.npcMeaning,
        hint: firstTurn.hint
      }
    ]);
    speakJapanese(firstTurn.npcJp, studyState.settings.slowAudio);
  };

  useEffect(() => {
    initScenario(currentScenario);
  }, [scenarioId]);

  const handleSendRoleplay = async (inputText) => {
    const text = (inputText ?? userReply).trim();
    if (!text || aiLoading) return;

    const newHistory = [...chatHistory, { role: 'user', text }];
    setChatHistory(newHistory);
    setUserReply('');

    // A. Gemini AI 자유 대화 모드가 켜져 있고 API 키가 있을 때
    if (useAiRoleplay && apiKey) {
      setAiLoading(true);
      try {
        const aiRes = await generateAiRoleplayTurn(apiKey, currentScenario, newHistory, text, currentTheme);
        playCorrectSfx(sfxEnabled, 2);
        setChatHistory(prev => [
          ...prev,
          {
            role: 'npc',
            jp: aiRes.npcJp,
            kr: aiRes.npcKr,
            meaning: aiRes.npcMeaning,
            coachTip: `${isSchool ? '⚡' : '🐾'} ${aiRes.understoodAs ? `[${aiRes.understoodAs}] ` : ''}${aiRes.coachTip}`,
            hint: aiRes.nextHint
          }
        ]);
        speakJapanese(aiRes.npcJp, studyState.settings.slowAudio);
      } catch (err) {
        alert(err.message);
      } finally {
        setAiLoading(false);
      }
      return;
    }

    // B. 키 없이도 100% 작동하는 기본 스마트 시나리오 판정
    const activeTurn = currentScenario.turns[turnIndex];
    if (!activeTurn) return;

    const norm = text.replace(/[\s~?!.-]/g, '');
    const matched = activeTurn.expectedKeywords.some(kw => norm.includes(kw.replace(/[\s-]/g, '')));

    if (matched) {
      playCorrectSfx(sfxEnabled, turnIndex + 2);
      const nextIdx = turnIndex + 1;
      if (nextIdx < currentScenario.turns.length) {
        const nextTurn = currentScenario.turns[nextIdx];
        setTurnIndex(nextIdx);
        setChatHistory(prev => [
          ...prev,
          {
            role: 'npc',
            jp: nextTurn.npcJp,
            kr: nextTurn.npcKr,
            meaning: nextTurn.npcMeaning,
            coachTip: isSchool
              ? '★ 완벽하게 통했어! 다음 질문을 이어갈게!'
              : '💮 완벽하게 통했어요! 점원이 다음 질문을 이어갑니다.',
            hint: nextTurn.hint
          }
        ]);
        speakJapanese(nextTurn.npcJp, studyState.settings.slowAudio);
      } else {
        setRoleplayCleared(true);
        const endJp = 'ありがとうございました！ また おこしくださいませ！';
        setChatHistory(prev => [
          ...prev,
          {
            role: 'npc',
            jp: endJp,
            kr: '아리가토- 고자이마시타! 마타 오코시쿠다사이마세!',
            meaning: '감사합니다! 또 오세요!',
            coachTip: '🎉 미션 완벽 클리어! 혼자서도 일본 식당·편의점 주문을 해냈어요!'
          }
        ]);
        speakJapanese(endJp, studyState.settings.slowAudio);
      }
    } else {
      playWrongSfx(sfxEnabled);
      setChatHistory(prev => [
        ...prev,
        {
          role: 'npc',
          jp: 'えっ？ すみません、もういちど おねがいします！',
          kr: '엣? 스미마셍, 모-이치도 오네가이시마스!',
          meaning: '네? 죄송합니다, 한 번만 다시 말씀해 주세요!',
          coachTip: `${isSchool ? '⚡ 선배의 힌트' : '🐾 힌트'}를 참고해서 다시 말해 볼까요? → ${activeTurn.hint}`,
          hint: activeTurn.hint
        }
      ]);
      speakJapanese('すみません、もういちど おねがいします', studyState.settings.slowAudio);
    }
  };

  const handleMicRoleplay = () => {
    if (isListeningRoleplay) return;
    setIsListeningRoleplay(true);
    startJapaneseSpeechRecognition({
      onResult: (best) => {
        setIsListeningRoleplay(false);
        if (best) {
          setUserReply(best);
          handleSendRoleplay(best);
        }
      },
      onError: (msg) => {
        setIsListeningRoleplay(false);
        alert(msg);
      },
      onEnd: () => setIsListeningRoleplay(false)
    });
  };

  // =========================================================
  // 2. 마이크 발음(스피킹) 특훈 상태 (키 불필요 · 100% 무료)
  // =========================================================
  const speakingPool = useMemo(() => {
    const phrases = SURVIVAL_PHRASES.filter(p => !p.jp.includes('/')).map(p => ({
      id: p.id,
      kana: p.jp.replace(/\s+/g, ''),
      displayJp: p.jp,
      kanji: '',
      kr: p.kr,
      meaning: p.meaning,
      type: '필수 생존 한마디'
    }));
    const words = VOCAB_DATA.slice(0, 20).map(w => ({
      id: w.id,
      kana: w.kana,
      displayJp: w.kana,
      kanji: w.kanji,
      kr: w.kr,
      meaning: w.meaning,
      type: '초급 핵심 단어'
    }));
    return [...phrases, ...words];
  }, []);

  const [speakIdx, setSpeakIdx] = useState(0);
  const [isListeningSpeak, setIsListeningSpeak] = useState(false);
  const [spokenResult, setSpokenResult] = useState(null); // { transcript, isMatch }

  const currentSpeakItem = speakingPool[speakIdx] || speakingPool[0];

  const handleStartSpeakTest = () => {
    if (isListeningSpeak) return;
    setSpokenResult(null);
    setIsListeningSpeak(true);

    startJapaneseSpeechRecognition({
      onResult: (best, allList) => {
        setIsListeningSpeak(false);
        const matched = checkSpeechMatch(allList, currentSpeakItem.kana, currentSpeakItem.kanji);
        setSpokenResult({ transcript: best, isMatch: matched });
        if (matched) {
          playCorrectSfx(sfxEnabled, 3);
        } else {
          playWrongSfx(sfxEnabled);
        }
      },
      onError: (msg) => {
        setIsListeningSpeak(false);
        alert(msg);
      },
      onEnd: () => setIsListeningSpeak(false)
    });
  };

  // =========================================================
  // 3. AI 과외 선생님 (1초 질문함 & 내 약점 단어 생성)
  // =========================================================
  const [questionInput, setQuestionInput] = useState('');
  const [qaAnswer, setQaAnswer] = useState(PRESET_FAQS[0]);
  const [qaLoading, setQaLoading] = useState(false);

  const [customWeakWords, setCustomWeakWords] = useState([]);
  const [weakGenLoading, setWeakGenLoading] = useState(false);

  const weakCharsList = useMemo(() => {
    const list = KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0);
    return list.length > 0 ? list.slice(0, 5) : KANA_DATA.filter(k => ['nu', 'me', 'ru', 'ro', 'tsu'].includes(k.id));
  }, [studyState.kanaStats]);

  const handleSaveKey = () => {
    saveGeminiApiKey(keyInput);
    setApiKey(keyInput.trim());
    setShowKeyBox(false);
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    if (!apiKey) {
      setShowKeyBox(true);
      return;
    }
    setQaLoading(true);
    try {
      const res = await askAiBeginnerQuestion(apiKey, questionInput.trim(), currentTheme);
      setQaAnswer({
        q: questionInput.trim(),
        ...res
      });
      playCorrectSfx(sfxEnabled, 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setQaLoading(false);
    }
  };

  const handleGenerateWeakWords = async () => {
    if (!apiKey) {
      setShowKeyBox(true);
      return;
    }
    setWeakGenLoading(true);
    try {
      const res = await generateWeakKanaCustomWords(apiKey, weakCharsList);
      setCustomWeakWords(res.words || []);
      playCorrectSfx(sfxEnabled, 2);
    } catch (err) {
      alert(err.message);
    } finally {
      setWeakGenLoading(false);
    }
  };

  const npcDisplayName = isSchool
    ? currentScenario.npcName.replace('냐옹', '(유이 선배 대역)')
    : currentScenario.npcName;

  return (
    <div className="space-y-6">
      {/* 상단 서브탭 & 무료 AI 키 연결 버튼 */}
      <div
        className={`rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 ${isSchool ? 'bg-white' : 'ghibli-paper'}`}
        style={isSchool ? { border: '2px solid #BAE6FD', boxShadow: '0 4px 0 #BAE6FD' } : {}}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('roleplay')}
            className={`px-4 py-2 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition ${isSchool ? 'rounded-lg skew-badge' : 'rounded-full'}`}
            style={
              subTab === 'roleplay'
                ? isSchool
                  ? { backgroundColor: '#0284C7', color: '#FFFFFF', boxShadow: '0 2px 0 #0369A1' }
                  : { backgroundColor: '#2D4A3E', color: '#FEFCE8', boxShadow: '0 2px 0 #1B2E26' }
                : isSchool
                ? { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
                : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
            }
          >
            <MessageSquare className="w-4 h-4" />
            <span>1. 🎭 실전 3턴 상황극 (주문·길찾기)</span>
          </button>

          <button
            onClick={() => setSubTab('speaking')}
            className={`px-4 py-2 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition ${isSchool ? 'rounded-lg skew-badge' : 'rounded-full'}`}
            style={
              subTab === 'speaking'
                ? isSchool
                  ? { backgroundColor: '#F43F5E', color: '#FFFFFF', boxShadow: '0 2px 0 #BE123C' }
                  : { backgroundColor: '#D97706', color: '#FFFFFF', boxShadow: '0 2px 0 #92400E' }
                : isSchool
                ? { backgroundColor: '#FFE4E6', color: '#BE123C', border: '1.5px solid #FDA4AF' }
                : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
            }
          >
            <Mic className="w-4 h-4" />
            <span>2. 🎙️ 마이크 발음 테스트 (무료)</span>
          </button>

          <button
            onClick={() => setSubTab('aitutor')}
            className={`px-4 py-2 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition ${isSchool ? 'rounded-lg skew-badge' : 'rounded-full'}`}
            style={
              subTab === 'aitutor'
                ? isSchool
                  ? { backgroundColor: '#0284C7', color: '#FFFFFF', boxShadow: '0 2px 0 #0369A1' }
                  : { backgroundColor: '#2D4A3E', color: '#FEFCE8', boxShadow: '0 2px 0 #1B2E26' }
                : isSchool
                ? { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
                : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #D5C7B2' }
            }
          >
            <Sparkles className="w-4 h-4" />
            <span>3. 🤖 1초 질문함 & 약점 단어 생성</span>
          </button>
        </div>

        <button
          onClick={() => setShowKeyBox(!showKeyBox)}
          className={`px-3.5 py-1.5 text-xs font-black flex items-center gap-1.5 cursor-pointer transition ${isSchool ? 'rounded-lg skew-badge' : 'rounded-full'}`}
          style={
            apiKey
              ? { backgroundColor: '#DCFCE7', color: '#166534', border: '1.5px solid #4ADE80' }
              : isSchool
              ? { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #7DD3FC' }
              : { backgroundColor: '#FAF6EE', color: '#7D6E5D', border: '1.5px dashed #C7B69E' }
          }
        >
          <Key className="w-3.5 h-3.5" />
          <span>{apiKey ? '🟢 Gemini 무료 AI 연결됨' : '🔑 Gemini 무료 AI 키 설정 (선택)'}</span>
        </button>
      </div>

      {/* Gemini 무료 API 키 입력 패널 (토글) */}
      {showKeyBox && (
        <div
          className="rounded-2xl p-5 space-y-3 animate-fadeIn"
          style={
            isSchool
              ? { backgroundColor: '#FFFFFF', border: '2.5px solid #38BDF8', boxShadow: '0 4px 0 #BAE6FD' }
              : { backgroundColor: '#FFFDF8', border: '2.5px solid #F59E0B' }
          }
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-black text-sm sm:text-base" style={{ color: isSchool ? '#0369A1' : '#2D4A3E' }}>
                🔑 Google Gemini 무료 API 키 연결 (내 브라우저에만 안전하게 저장됨)
              </h3>
              <p className="text-xs font-bold mt-1" style={{ color: isSchool ? '#475569' : '#5C4E41' }}>
                구글 AI Studio에서 <strong>카드 등록 없이 100% 무료</strong>로 발급받을 수 있습니다. 키를 입력하지 않아도 기본 상황극과 마이크 발음 테스트는 전부 무료로 작동합니다!
              </p>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shrink-0"
              style={
                isSchool
                  ? { backgroundColor: '#E0F2FE', color: '#0284C7', border: '1.5px solid #7DD3FC' }
                  : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #F59E0B' }
              }
            >
              무료 키 발급받기 <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy... 로 시작하는 무료 Gemini API 키 붙여넣기"
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-mono outline-none"
              style={
                isSchool
                  ? { backgroundColor: '#F8FAFC', border: '1.5px solid #BAE6FD', color: '#0F172A' }
                  : { backgroundColor: '#FAF6EE', border: '1.5px solid #C7B69E', color: '#2D4A3E' }
              }
            />
            <button
              onClick={handleSaveKey}
              className="px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer"
              style={
                isSchool
                  ? { backgroundColor: '#0284C7', color: '#FFFFFF' }
                  : { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
              }
            >
              저장하기
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          서브탭 1: 실전 3턴 상황극 (라멘집·편의점·역무원)
      ========================================================= */}
      {subTab === 'roleplay' && (
        <div className="space-y-5">
          {/* 시나리오 선택 버튼 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ROLEPLAY_SCENARIOS.map(scen => {
              const active = scen.id === scenarioId;
              return (
                <button
                  key={scen.id}
                  onClick={() => setScenarioId(scen.id)}
                  className="p-4 rounded-2xl text-left cursor-pointer transition bg-white"
                  style={
                    active
                      ? isSchool
                        ? { background: 'linear-gradient(180deg, #E0F2FE 0%, #FFFFFF 100%)', border: '2.5px solid #0284C7', boxShadow: '0 4px 0 #0284C7' }
                        : { backgroundColor: '#FEF9C3', border: '2.5px solid #D97706', boxShadow: '0 4px 0 #D97706' }
                      : isSchool
                      ? { backgroundColor: '#FFFFFF', border: '2px solid #BAE6FD', boxShadow: '0 3px 0 #BAE6FD' }
                      : { backgroundColor: '#FFFDF8', border: '2px solid #D5C7B2' }
                  }
                >
                  <div className="font-black text-sm" style={{ color: isSchool ? '#0369A1' : '#2D4A3E' }}>{scen.title}</div>
                  <div className="text-xs font-bold mt-1" style={{ color: isSchool ? '#64748B' : '#7D6E5D' }}>{scen.mission}</div>
                </button>
              );
            })}
          </div>

          {/* 대화 스테이지 */}
          <div
            className={`rounded-3xl p-5 sm:p-6 space-y-4 ${isSchool ? 'bg-white' : 'ghibli-paper'}`}
            style={isSchool ? { border: '2.5px solid #38BDF8', boxShadow: '0 6px 0 #38BDF8' } : {}}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-2 pb-3"
              style={{ borderBottom: isSchool ? '1.5px solid #E0F2FE' : '1.5px dashed #D5C7B2' }}
            >
              <div>
                <span className="text-xs font-extrabold" style={{ color: isSchool ? '#F43F5E' : '#B45309' }}>
                  📍 장소: {currentScenario.place}
                </span>
                <h3 className="text-base sm:text-lg font-black" style={{ color: isSchool ? '#0F172A' : '#2D4A3E' }}>
                  {currentScenario.mission}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {apiKey && (
                  <label
                    className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full cursor-pointer"
                    style={
                      isSchool
                        ? { backgroundColor: '#E0F2FE', color: '#0369A1', border: '1.5px solid #38BDF8' }
                        : { backgroundColor: '#ECFCCB', color: '#365314', border: '1.5px solid #84CC16' }
                    }
                  >
                    <input
                      type="checkbox"
                      checked={useAiRoleplay}
                      onChange={(e) => setUseAiRoleplay(e.target.checked)}
                    />
                    🤖 Gemini 자유 대화 모드
                  </label>
                )}
                <button
                  onClick={() => initScenario(currentScenario)}
                  className="px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                  style={
                    isSchool
                      ? { backgroundColor: '#F8FAFC', color: '#475569', border: '1.5px solid #CBD5E1' }
                      : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #C7B69E' }
                  }
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 처음부터 다시
                </button>
              </div>
            </div>

            {/* 대화 말풍선 목록 */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className="space-y-2 animate-fadeIn">
                  {msg.role === 'npc' ? (
                    <div className="flex items-start gap-3">
                      {isSchool ? (
                        <SchoolMascot mood={roleplayCleared ? 'happy' : 'normal'} size="sm" />
                      ) : (
                        <NekoMascot mood={roleplayCleared ? 'happy' : 'normal'} size="sm" />
                      )}
                      <div className="space-y-1.5 max-w-xl">
                        {msg.coachTip && (
                          <div
                            className="text-xs font-black px-3 py-1.5 rounded-xl inline-block"
                            style={
                              isSchool
                                ? { backgroundColor: '#E0F2FE', color: '#0369A1', border: '1.5px solid #38BDF8' }
                                : { backgroundColor: '#ECFCCB', color: '#365314', border: '1.5px solid #84CC16' }
                            }
                          >
                            {msg.coachTip}
                          </div>
                        )}
                        <div
                          className="p-4 rounded-2xl space-y-1"
                          style={
                            isSchool
                              ? { background: 'linear-gradient(135deg, #0F172A, #0369A1)', color: '#FFFFFF', border: '2px solid #38BDF8' }
                              : { backgroundColor: '#2D4A3E', color: '#FEFCE8', border: '2px solid #A67B5B' }
                          }
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-extrabold" style={{ color: '#FEF08A' }}>
                              {npcDisplayName}
                            </span>
                            <button
                              onClick={() => speakJapanese(msg.jp, studyState.settings.slowAudio)}
                              className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer"
                              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FEF08A' }}
                            >
                              <Volume2 className="w-3 h-3" /> 발음 듣기
                            </button>
                          </div>
                          <div className="text-lg sm:text-xl font-black text-white">{msg.jp}</div>
                          <div className="text-xs font-bold" style={{ color: isSchool ? '#7DD3FC' : '#A7F3D0' }}>[{msg.kr}]</div>
                          <div className="text-xs font-semibold opacity-90">“{msg.meaning}”</div>
                        </div>
                        {msg.hint && !roleplayCleared && idx === chatHistory.length - 1 && (
                          <div
                            className="text-xs font-bold px-3.5 py-2 rounded-xl"
                            style={
                              isSchool
                                ? { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #7DD3FC' }
                                : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px dashed #F59E0B' }
                            }
                          >
                            💡 <strong>대답 힌트:</strong> {msg.hint}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div
                        className="px-4 py-2.5 rounded-2xl text-sm font-black max-w-md"
                        style={
                          isSchool
                            ? { backgroundColor: '#E0F2FE', color: '#0F172A', border: '2px solid #0284C7' }
                            : { backgroundColor: '#FEF9C3', color: '#2D4A3E', border: '2px solid #D97706' }
                        }
                      >
                        🗣️ 나: “{msg.text}”
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 하단 마이크 & 텍스트 입력창 */}
            {!roleplayCleared && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendRoleplay();
                }}
                className="flex flex-wrap items-center gap-2 pt-2"
                style={{ borderTop: isSchool ? '1.5px solid #E0F2FE' : '1.5px dashed #D5C7B2' }}
              >
                <button
                  type="button"
                  onClick={handleMicRoleplay}
                  className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer transition shrink-0"
                  style={
                    isListeningRoleplay
                      ? { backgroundColor: '#DC2626', color: '#FFFFFF' }
                      : isSchool
                      ? { backgroundColor: '#0284C7', color: '#FFFFFF' }
                      : { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                  }
                >
                  {isListeningRoleplay ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                  {isListeningRoleplay ? '듣고 있어요...' : '🎙️ 마이크로 말하기'}
                </button>

                <input
                  type="text"
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  placeholder="한국어 발음(예: 히토리데스, 라멘 쿠다사이) 또는 일본어로 입력!"
                  className="flex-1 min-w-[200px] px-4 py-3 rounded-2xl text-xs sm:text-sm font-black outline-none"
                  style={
                    isSchool
                      ? { backgroundColor: '#F8FAFC', border: '2px solid #BAE6FD', color: '#0F172A' }
                      : { backgroundColor: '#FAF6EE', border: '2px solid #C7B69E', color: '#2D4A3E' }
                  }
                />

                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shrink-0"
                  style={
                    isSchool
                      ? { backgroundColor: '#F43F5E', color: '#FFFFFF', boxShadow: '0 2px 0 #BE123C' }
                      : { backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #D97706' }
                  }
                >
                  <Send className="w-4 h-4" />
                  {aiLoading ? '생각 중...' : '말하기'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          서브탭 2: 마이크 발음(스피킹) 테스트 (100% 무료 내장 음성인식)
      ========================================================= */}
      {subTab === 'speaking' && currentSpeakItem && (
        <div className="max-w-2xl mx-auto">
          <div
            className={`rounded-3xl p-6 sm:p-8 text-center space-y-6 ${isSchool ? 'bg-white' : 'ghibli-chalkboard'}`}
            style={isSchool ? { border: '2.5px solid #38BDF8', boxShadow: '0 6px 0 #38BDF8' } : {}}
          >
            <div
              className="flex items-center justify-between text-xs font-bold"
              style={{ color: isSchool ? '#0284C7' : '#FDE68A' }}
            >
              <span className="flex items-center gap-2">
                {isSchool ? (
                  <SchoolMascot mood={spokenResult?.isMatch ? 'happy' : 'normal'} size="sm" />
                ) : (
                  <NekoMascot mood={spokenResult?.isMatch ? 'happy' : 'normal'} size="sm" />
                )}
                <span>
                  🎙️ API 키 없이도 100% 무료로 작동하는 원어민 발음 판정기{isSchool ? '야!' : '다옹!'} ({speakIdx + 1}/{speakingPool.length})
                </span>
              </span>
              <button
                onClick={() => speakJapanese(currentSpeakItem.displayJp, studyState.settings.slowAudio)}
                className="px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer"
                style={
                  isSchool
                    ? { backgroundColor: '#E0F2FE', color: '#0284C7', border: '1.5px solid #7DD3FC' }
                    : { backgroundColor: 'rgba(255,255,255,0.15)', color: '#FEF08A', border: '1.5px dashed rgba(255,255,255,0.4)' }
                }
              >
                <Volume2 className="w-3.5 h-3.5" /> 원어민 발음 먼저 듣기
              </button>
            </div>

            <div
              className={`space-y-2 py-6 rounded-2xl ${isSchool ? 'px-4' : ''}`}
              style={isSchool ? { background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)', border: '2px solid #BAE6FD' } : {}}
            >
              <span
                className="text-xs font-black px-3 py-1 rounded-full"
                style={
                  isSchool
                    ? { backgroundColor: '#0284C7', color: '#FFFFFF' }
                    : { backgroundColor: 'rgba(255,255,255,0.12)', color: '#A7F3D0' }
                }
              >
                {currentSpeakItem.type}
              </span>
              <div
                className="text-4xl sm:text-6xl font-black tracking-wide pt-2"
                style={{ color: isSchool ? '#0F172A' : '#FFFFFF' }}
              >
                {currentSpeakItem.displayJp}
              </div>
              <div
                className="text-lg sm:text-xl font-extrabold"
                style={{ color: isSchool ? '#0284C7' : '#FEF08A' }}
              >
                [{currentSpeakItem.kr}]
              </div>
              <div
                className="text-sm font-bold"
                style={{ color: isSchool ? '#475569' : 'rgba(255,255,255,0.9)' }}
              >
                뜻: “{currentSpeakItem.meaning}”
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleStartSpeakTest}
                className="px-6 py-4 rounded-2xl font-black text-base flex items-center gap-2 cursor-pointer transition shadow-md"
                style={
                  isListeningSpeak
                    ? { backgroundColor: '#DC2626', color: '#FFFFFF', border: '2px solid #FCA5A5' }
                    : isSchool
                    ? { backgroundColor: '#F43F5E', color: '#FFFFFF', boxShadow: '0 4px 0 #BE123C' }
                    : { backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #FEF08A' }
                }
              >
                {isListeningSpeak ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                {isListeningSpeak ? '지금 소리 내어 읽어주세요...' : '🎙️ 마이크 누르고 소리 내어 읽기'}
              </button>

              <button
                onClick={() => {
                  setSpokenResult(null);
                  setSpeakIdx(prev => (prev + 1) % speakingPool.length);
                }}
                className="px-4 py-4 rounded-2xl font-black text-xs sm:text-sm cursor-pointer"
                style={
                  isSchool
                    ? { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
                    : { backgroundColor: 'rgba(255,255,255,0.14)', color: '#FEFCE8', border: '1.5px dashed rgba(255,255,255,0.4)' }
                }
              >
                다음 문장 →
              </button>
            </div>

            {spokenResult && (
              <div
                className="p-4 rounded-2xl max-w-md mx-auto animate-fadeIn"
                style={
                  spokenResult.isMatch
                    ? { backgroundColor: '#DCFCE7', color: '#166534', border: '3px solid #22C55E' }
                    : { backgroundColor: '#FEF3C7', color: '#92400E', border: '3px solid #F59E0B' }
                }
              >
                <div className="font-black text-sm">
                  {spokenResult.isMatch
                    ? isSchool
                      ? '★ 완벽해! 원어민처럼 발음이 정확해!'
                      : '💮 참 잘했어요! 원어민처럼 발음이 정확해요!'
                    : isSchool
                    ? '⚡ 조금 다르게 들렸어! 천천히 또박또박 다시 읽어볼까?'
                    : '🐾 조금 다르게 들렸어요! 천천히 또박또박 다시 읽어볼까요?'}
                </div>
                <div className="text-xs font-bold mt-1">
                  인식된 내 발음: <strong>“{spokenResult.transcript || '(인식 안 됨)'}”</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          서브탭 3: AI 과외 선생님 (1초 질문함 + 내 약점 단어 생성)
      ========================================================= */}
      {subTab === 'aitutor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측: 왕초보 1초 질문함 */}
          <div
            className={`lg:col-span-7 rounded-3xl p-5 sm:p-6 space-y-4 ${isSchool ? 'bg-white' : 'ghibli-paper'}`}
            style={isSchool ? { border: '2.5px solid #38BDF8', boxShadow: '0 6px 0 #38BDF8' } : {}}
          >
            <div className="flex items-center gap-2.5">
              {isSchool ? <SchoolMascot mood="happy" size="sm" /> : <NekoMascot mood="happy" size="sm" />}
              <div>
                <h3 className="font-black text-base" style={{ color: isSchool ? '#0369A1' : '#2D4A3E' }}>
                  {isSchool ? '⚡ 유이 선배의 왕초보 1초 질문함' : '🐾 “이건 왜 이래요?” 왕초보 1초 질문함'}
                </h3>
                <p className="text-xs font-bold" style={{ color: isSchool ? '#64748B' : '#7D6E5D' }}>
                  어려운 문법 용어 없이 3줄로 명쾌하게 알려줄게! 아래 단골 질문을 누르거나 직접 물어보세요.
                </p>
              </div>
            </div>

            {/* 단골 질문 3선 (키 없이도 즉시 확인 가능!) */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_FAQS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setQaAnswer(item)}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-left cursor-pointer transition"
                  style={
                    qaAnswer?.q === item.q
                      ? isSchool
                        ? { backgroundColor: '#0284C7', color: '#FFFFFF' }
                        : { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                      : isSchool
                      ? { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
                      : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px dashed #C7B69E' }
                  }
                >
                  Q{idx + 1}. {item.q}
                </button>
              ))}
            </div>

            {/* 직접 질문 입력창 (Gemini AI 연동) */}
            <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="궁금한 일본어 표현이나 차이점을 자유롭게 물어보세요!"
                className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold outline-none"
                style={
                  isSchool
                    ? { backgroundColor: '#F8FAFC', border: '2px solid #BAE6FD', color: '#0F172A' }
                    : { backgroundColor: '#FAF6EE', border: '2px solid #C7B69E', color: '#2D4A3E' }
                }
              />
              <button
                type="submit"
                disabled={qaLoading}
                className="px-4 py-3 rounded-2xl text-xs font-black cursor-pointer shrink-0"
                style={
                  isSchool
                    ? { backgroundColor: '#F43F5E', color: '#FFFFFF', boxShadow: '0 2px 0 #BE123C' }
                    : { backgroundColor: '#F59E0B', color: '#FFFFFF', border: '2px solid #D97706' }
                }
              >
                {qaLoading ? '답변 중...' : '질문하기'}
              </button>
            </form>

            {/* 답변 카드 */}
            {qaAnswer && (
              <div
                className="p-5 rounded-2xl space-y-3 animate-fadeIn"
                style={
                  isSchool
                    ? { backgroundColor: '#F0F9FF', border: '2px solid #38BDF8', color: '#0F172A' }
                    : { backgroundColor: '#ECFCCB', border: '2px solid #84CC16', color: '#365314' }
                }
              >
                <div className="font-black text-sm sm:text-base" style={{ color: isSchool ? '#0369A1' : '#1A2E05' }}>
                  💡 {qaAnswer.summary}
                </div>
                <p className="text-xs sm:text-sm font-bold leading-relaxed">
                  {qaAnswer.explanation}
                </p>
                {qaAnswer.examples?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {qaAnswer.examples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => speakJapanese(ex.jp, studyState.settings.slowAudio)}
                        className="p-3 rounded-xl text-left flex items-center justify-between cursor-pointer"
                        style={
                          isSchool
                            ? { backgroundColor: '#FFFFFF', border: '1.5px solid #7DD3FC', color: '#0F172A' }
                            : { backgroundColor: '#FFFDF8', border: '1.5px solid #84CC16', color: '#2D4A3E' }
                        }
                      >
                        <div>
                          <div className="font-black text-sm">{ex.jp}</div>
                          <div className="text-xs font-extrabold" style={{ color: isSchool ? '#0284C7' : '#B45309' }}>
                            [{ex.kr}] — {ex.meaning}
                          </div>
                        </div>
                        <Volume2 className="w-4 h-4 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 우측: 내 약점 글자 조합 무한 단어 생성기 */}
          <div
            className={`lg:col-span-5 rounded-3xl p-5 sm:p-6 space-y-4 ${isSchool ? 'bg-white' : 'ghibli-paper'}`}
            style={isSchool ? { border: '2.5px solid #38BDF8', boxShadow: '0 6px 0 #38BDF8' } : {}}
          >
            <div>
              <span
                className="text-xs font-black px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
              >
                🎯 맞춤형 AI 단어장
              </span>
              <h3 className="font-black text-base mt-2" style={{ color: isSchool ? '#0369A1' : '#2D4A3E' }}>
                내가 헷갈리는 글자만 쏙쏙 넣은 단어 생성기
              </h3>
              <p className="text-xs font-bold mt-1" style={{ color: isSchool ? '#64748B' : '#7D6E5D' }}>
                타겟 글자: {weakCharsList.map(c => `${c.hira}(${c.kr})`).join(', ')}
              </p>
            </div>

            <button
              onClick={handleGenerateWeakWords}
              disabled={weakGenLoading}
              className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer transition"
              style={
                isSchool
                  ? { background: 'linear-gradient(90deg, #0284C7, #0369A1)', color: '#FFFFFF', boxShadow: '0 3px 0 #0C4A6E' }
                  : { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
              }
            >
              <Sparkles className="w-4 h-4" />
              {weakGenLoading
                ? isSchool
                  ? '유이 선배가 단어를 고르고 있어...'
                  : '냐옹 선생님이 단어를 고르고 있어요...'
                : '🪄 내 약점 글자로 새 연습 단어 4개 만들기'}
            </button>

            {customWeakWords.length > 0 && (
              <div className="space-y-2.5 animate-fadeIn">
                {customWeakWords.map((w, idx) => (
                  <div
                    key={idx}
                    onClick={() => speakJapanese(w.kana, studyState.settings.slowAudio)}
                    className="p-3.5 rounded-2xl flex items-center justify-between gap-2 cursor-pointer"
                    style={
                      isSchool
                        ? { backgroundColor: '#F0F9FF', border: '1.5px solid #BAE6FD' }
                        : { backgroundColor: '#FAF6EE', border: '1.5px dashed #C7B69E' }
                    }
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black" style={{ color: isSchool ? '#0F172A' : '#2D4A3E' }}>{w.kana}</span>
                        <span className="text-xs font-extrabold" style={{ color: isSchool ? '#0284C7' : '#B45309' }}>[{w.kr}]</span>
                        <span className="text-sm font-black" style={{ color: isSchool ? '#334155' : '#3A322C' }}>{w.meaning}</span>
                      </div>
                      <div className="text-xs font-bold mt-0.5" style={{ color: isSchool ? '#64748B' : '#7D6E5D' }}>
                        🧩 {w.breakdown}
                      </div>
                    </div>
                    <Volume2 className="w-4 h-4 shrink-0" style={{ color: isSchool ? '#0284C7' : '#2D4A3E' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
