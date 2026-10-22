// Gemini 무료 API 연동 + 키가 없을 때도 작동하는 하이브리드 시나리오 엔진

const API_KEY_STORAGE = 'jp_master_gemini_api_key_v1';

export function loadGeminiApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function saveGeminiApiKey(key) {
  try {
    if (!key) localStorage.removeItem(API_KEY_STORAGE);
    else localStorage.setItem(API_KEY_STORAGE, key.trim());
  } catch {
    // 무시
  }
}

// 키 없이도 100% 무료로 즐길 수 있는 내장 인터랙티브 상황극 시나리오 4선
export const ROLEPLAY_SCENARIOS = [
  {
    id: 'ramen',
    title: '🍜 도쿄 라멘집에서 주문하기',
    place: '이치란 라멘 카운터석',
    mission: '직원에게 "한 명입니다"라고 말하고, "라멘이랑 맥주 주세요"라고 주문해 보세요!',
    npcName: '라멘집 점원 냐옹',
    turns: [
      {
        npcJp: 'いらっしゃいませ！ なんめいさまですか？',
        npcKr: '이랏샤이마세! 난메이사마데스카?',
        npcMeaning: '어서 오세요! 몇 분이신가요?',
        hint: '“한 명입니다(히토리데스 / ひとりです)” 또는 “두 명입니다(후타리데스 / ふたりです)”라고 말해 보세요!',
        expectedKeywords: ['ひとり', 'ふたり', '히토리', '후타리', '一人', '二人', 'さんにん', '산닌']
      },
      {
        npcJp: 'こちらへ どうぞ！ ごちゅうもんは なにに しますか？',
        npcKr: '코치라에 도-조! 고츄-몬와 나니니 시마스카?',
        npcMeaning: '이쪽으로 오세요! 주문은 무엇으로 하시겠어요?',
        hint: '“[명사] + 쿠다사이(ください)” 패턴을 써서 “라멘 주세요(라-멘 쿠다사이)” 또는 “물 주세요(미즈 쿠다사이)”라고 해보세요!',
        expectedKeywords: ['ください', '쿠다사이', 'ラーメン', '라멘', '라-멘', 'ビール', '비루', '미즈', 'みず']
      },
      {
        npcJp: 'かしこまりました！ すぐ おもちしますね！',
        npcKr: '카시코마리마시타! 스구 오모치시마스네!',
        npcMeaning: '알겠습니다! 금방 가져다 드릴게요!',
        hint: '마지막으로 정중하게 “감사합니다(아리가토- 고자이마스 / ありがとうございます)”라고 인사해 보세요!',
        expectedKeywords: ['ありがとう', '아리가토', '아리가또', '고자이마스']
      }
    ]
  },
  {
    id: 'konbini',
    title: '🏪 일본 편의점 계산대',
    place: '세븐일레븐 계산대',
    mission: '커피의 가격을 물어보고, 비닐봉투는 괜찮다고 거절한 뒤 카드로 계산해 보세요!',
    npcName: '편의점 점원 냐옹',
    turns: [
      {
        npcJp: 'いらっしゃいませ！',
        npcKr: '이랏샤이마세!',
        npcMeaning: '어서 오세요! (물건을 들고 계산대로 갔습니다)',
        hint: '“이것은 얼마인가요? (코레와 이쿠라데스카? / これは いくらですか？)”라고 물어보세요!',
        expectedKeywords: ['いくら', '이쿠라', 'これ', '코레']
      },
      {
        npcJp: 'にひゃくえん(200円)です！ レジぶくろは ごりようですか？',
        npcKr: '니햐쿠엔데스! 레지부쿠로와 고리요-데스카?',
        npcMeaning: '200엔입니다! 비닐봉투는 필요하신가요?',
        hint: '편의점 마법의 거절 표현! “괜찮습니다 (다이죠-부데스 / だいじょうぶです)”라고 답해보세요!',
        expectedKeywords: ['だいじょうぶ', '다이죠부', '다이죠-부', 'いいえ', '이이에', '大丈夫']
      },
      {
        npcJp: 'はい！ おشいはらいは いかがなさいますか？',
        npcKr: '하이! 오시하라이와 이카가나사이마스카?',
        npcMeaning: '네! 결제는 어떻게 하시겠어요?',
        hint: '“카드 주세요/부탁해요 (카-도 쿠다사이 / 카-도 오네가이시마스)”라고 말해 보세요!',
        expectedKeywords: ['カード', '카도', '카-도', 'おねがい', '오네가이', 'ください', '쿠다사이']
      }
    ]
  },
  {
    id: 'station',
    title: '🚉 길에서 역·화장실 물어보기',
    place: '신주쿠 거리',
    mission: '지나가는 역무원에게 말을 걸고 화장실이나 역이 어디인지 물어보세요!',
    npcName: '친절한 역무원 냐옹',
    turns: [
      {
        npcJp: 'はい、なにか おこまりですか？',
        npcKr: '하이, 나니카 오코마리데스카?',
        npcMeaning: '네, 무슨 곤란한 일 있으신가요?',
        hint: '먼저 “저기요/실례합니다 (스미마셍 / すみません)” 또는 바로 “화장실은 어디인가요? (토이레와 도코데스카?)”라고 물어보세요!',
        expectedKeywords: ['すみません', '스미마셍', '스미마센', 'どこ', '도코', 'トイレ', '토이레', 'えき', '에키']
      },
      {
        npcJp: 'ああ、トイレですね！ あそこにありますよ。',
        npcKr: '아아, 토이레데스네! 아소코니 아리마스요.',
        npcMeaning: '아, 화장실이군요! 저기에 있습니다.',
        hint: '친절하게 알려준 역무원에게 “감사합니다 (아리가토- 고자이마스)”라고 인사해 보세요!',
        expectedKeywords: ['ありがとう', '아리가토', '아리가또']
      }
    ]
  }
];

let cachedWorkingModel = null;

async function getCandidateModels(apiKey) {
  const defaultFallbacks = [
    'gemini-flash-latest',
    'gemini-3-flash-preview',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest'
  ];

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`;
    const res = await fetch(listUrl);
    if (!res.ok) return defaultFallbacks;
    const data = await res.json();
    const available = (data.models || [])
      .filter(m =>
        Array.isArray(m.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes('generateContent') &&
        m.name &&
        m.name.includes('gemini') &&
        !m.name.includes('tts') &&
        !m.name.includes('image') &&
        !m.name.includes('embedding') &&
        !m.name.includes('vision') &&
        !m.name.includes('robotics') &&
        !m.name.includes('computer-use')
      )
      .map(m => m.name.replace(/^models\//, ''));

    if (available.length === 0) return defaultFallbacks;

    // 우선순위 정렬: flash 계열 최신 모델 우선
    const preferredOrder = [
      'gemini-flash-latest',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.5-pro',
      'gemini-pro-latest'
    ];

    available.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const aFlash = a.includes('flash') ? 0 : 1;
      const bFlash = b.includes('flash') ? 0 : 1;
      return aFlash - bFlash;
    });

    return available;
  } catch {
    return defaultFallbacks;
  }
}

function extractJsonObject(rawText) {
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('JSON 응답 파싱 실패');
  }
}

async function callGeminiJson(apiKey, promptText) {
  const cleanKey = (apiKey || '').trim();
  const candidates = await getCandidateModels(cleanKey);
  const modelsToTry = cachedWorkingModel
    ? [cachedWorkingModel, ...candidates.filter(m => m !== cachedWorkingModel)]
    : candidates;

  let lastErrorText = '';
  let lastStatus = 0;

  for (const modelName of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(cleanKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      })
    });

    if (res.ok) {
      cachedWorkingModel = modelName;
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return extractJsonObject(rawText);
    }

    lastStatus = res.status;
    lastErrorText = await res.text();

    // 400 (API_KEY_INVALID) 또는 403 (권한 오류)이고 모델 문제가 아니면 즉시 중단
    if (
      (res.status === 400 || res.status === 403) &&
      lastErrorText.includes('API_KEY_INVALID')
    ) {
      throw new Error('유효하지 않은 API 키입니다. 복사한 키 앞뒤 공백이나 오타를 확인해 주세요.');
    }
    // 404(모델 지원 종료/비활성)나 429/503 등은 다음 사용 가능한 모델로 자동 전환 시도!
  }

  throw new Error(`AI 모델 호출 실패 (${lastStatus}): ${lastErrorText.slice(0, 120)}`);
}

// 1. Gemini AI 자유 상황극 응답 생성
export async function generateAiRoleplayTurn(apiKey, scenario, history, userInput, theme = 'ghibli') {
  const historyStr = history
    .map(h => `${h.role === 'npc' ? '점원' : '학습자'}: ${h.jp || h.text}`)
    .join('\n');

  const isSchool = theme === 'school';
  const personaDesc = isSchool
    ? "일본어 완전 입문자를 가르치는 청량하고 다정한 고등학교 일본어부 선배('유이 선배')입니다."
    : "일본어 완전 입문자를 가르치는 친절하고 귀여운 고양이 선생님('냐옹 점원')입니다.";
  const toneDesc = isSchool ? "상큼하고 다정한 선배 말투 (~야!, ~해 봐!)" : "친근한 ~다옹! 말투";

  const prompt = `
당신은 ${personaDesc}
현재 상황극 배경: "${scenario.title}" (${scenario.place})
지금까지의 대화:
${historyStr}

방금 입문자(학습자)가 한 말(한국어 발음 또는 일본어): "${userInput}"

다음 JSON 형식으로만 응답하세요:
{
  "understoodAs": "학습자가 말하려 한 일본어 문장 (히라가나/가타카나 표기 및 한국어 발음)",
  "coachTip": "학습자의 표현에 대한 칭찬 한 줄 또는 더 자연스러운 왕초보 표현 교정 팁 (${toneDesc})",
  "npcJp": "점원으로서 이어서 할 짧고 쉬운 일본어 대답 (한자 쓰지 말고 히라가나/가타카나 위주로)",
  "npcKr": "npcJp의 한국어 발음 표기",
  "npcMeaning": "npcJp의 한국어 뜻",
  "nextHint": "학습자가 다음에 대답해 볼 만한 추천 표현 힌트 (일본어 + 한국어 발음)"
}
`;

  return await callGeminiJson(apiKey, prompt);
}

// 2. 왕초보 1초 질문함
export async function askAiBeginnerQuestion(apiKey, question, theme = 'ghibli') {
  const isSchool = theme === 'school';
  const personaDesc = isSchool
    ? "일본어 왕초보(완전 입문자) 전용 청량한 고등학교 일본어부 '유이 선배'입니다."
    : "일본어 왕초보(완전 입문자) 전용 과외 선생님 '냐옹 선생님'입니다.";
  const toneDesc = isSchool ? "~야!, ~거든! 같은 다정한 선배 말투" : "~다옹! 말투";

  const prompt = `
당신은 ${personaDesc}
학습자의 질문: "${question}"

어려운 문법 용어(예: 연용형, 조사, 활용 등)를 최소화하고, 초등학생도 10초 만에 이해할 수 있게 아래 JSON 형식으로 핵심만 답변하세요:
{
  "summary": "한 줄 핵심 결론 (${toneDesc})",
  "explanation": "쉬운 비유를 든 2~3문장 설명",
  "examples": [
    { "jp": "예시 일본어(히라가나/가타카나)", "kr": "한국어 발음", "meaning": "한국어 뜻" },
    { "jp": "예시 일본어2", "kr": "한국어 발음2", "meaning": "한국어 뜻2" }
  ]
}
`;
  return await callGeminiJson(apiKey, prompt);
}

// 3. 내 약점 글자 포함 맞춤형 단어 생성기
export async function generateWeakKanaCustomWords(apiKey, weakCharsList) {
  const charsStr = weakCharsList.map(c => `${c.hira}/${c.kata}(${c.kr})`).join(', ');
  const prompt = `
일본어 입문자가 현재 자주 틀리는 글자 목록입니다: [${charsStr}]
이 글자들이 골고루 포함된 아주 쉽고 실용적인 초급 일본어 단어 4개를 만들어 주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "words": [
    {
      "kana": "히라가나 또는 가타카나 표기",
      "kr": "한국어 발음",
      "meaning": "한국어 뜻",
      "breakdown": "글자 하나씩 쪼개서 읽는 팁 (예: ね(네) + こ(코))"
    }
  ]
}
`;
  return await callGeminiJson(apiKey, prompt);
}
