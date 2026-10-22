// 완전 입문자가 가장 많이 막히는 '특수음(요음·촉음·장음)' 및 '숫자·가격·개수·인원수(함정 발음)' 특훈 데이터

export const SPECIAL_RULES = [
  {
    id: 'yoon',
    badge: '규칙 1 · 요음 (작은 ゃ·ゅ·ょ)',
    title: '“키(き) + 작은 야(ゃ) = 캬(きゃ)!”',
    desc: 'い단 글자(き, し, ち, に, ひ, み, り) 뒤에 작게 쓴 ゃ(야), ゅ(유), ょ(요)가 붙으면 두 글자를 합쳐서 한 번에 발음합니다.',
    pairs: [
      { wrongLook: 'きや (큰 야)', wrongKr: '키야 (2박자)', rightLook: 'きゃ (작은 야)', rightKr: '캬 (1박자)', wordJp: 'きゃく', wordKr: '캬쿠', wordMeaning: '손님' },
      { wrongLook: 'しゆ (큰 유)', wrongKr: '시유 (2박자)', rightLook: 'しゅ (작은 유)', rightKr: '슈 (1박자)', wordJp: 'しゅみ', wordKr: '슈미', wordMeaning: '취미' },
      { wrongLook: 'ちよ (큰 요)', wrongKr: '치요 (2박자)', rightLook: 'ちょ (작은 요)', rightKr: '쵸 (1박자)', wordJp: 'ちょっと', wordKr: '촙토', wordMeaning: '잠깐·조금' },
      { wrongLook: 'きよう (큰 요)', wrongKr: '키요우 (3박자)', rightLook: 'きょう (작은 요)', rightKr: '쿄- (오늘)', wordJp: 'きょう', wordKr: '쿄-', wordMeaning: '오늘' }
    ]
  },
  {
    id: 'sokuon',
    badge: '규칙 2 · 촉음 (작은 っ)',
    title: '“작은 츠(っ / ッ)는 한 박자 쉬며 받침(ㅅ·ㄱ·ㅂ)으로!”',
    desc: '글자 크기가 절반인 작은 っ(히라가나) / ッ(가타카나)는 "츠"라고 읽지 않고, 앞 글자에 받침을 넣어 잠깐 숨을 멈췄다가 다음 글자를 발음합니다.',
    pairs: [
      { wrongLook: 'きて', wrongKr: '키테 (와줘)', rightLook: 'きって', rightKr: '킷테 (우표)', wordJp: 'きって', wordKr: '킷테', wordMeaning: '우표' },
      { wrongLook: 'さか', wrongKr: '사카 (언덕)', rightLook: 'さっか', rightKr: '삭카 (작가)', wordJp: 'さっか', wordKr: '삭카', wordMeaning: '작가' },
      { wrongLook: '이치 (1)', wrongKr: 'いち', rightLook: 'いっかい', rightKr: '잇카이 (1층/1회)', wordJp: 'いっぷん', wordKr: '입푼', wordMeaning: '1분' },
      { wrongLook: '코푸', wrongKr: '코푸', rightLook: 'コップ', rightKr: '콥푸 (컵)', wordJp: 'コップ', wordKr: '콥푸', wordMeaning: '컵(유리잔)' }
    ]
  },
  {
    id: 'choon',
    badge: '규칙 3 · 장음 (길게 끌기)',
    title: '“소리를 두 배로 길게 늘이면 뜻이 완전히 달라져요!”',
    desc: '가타카나에서는 막대기(ー)로, 히라가나에서는 모음(あ·い·う)을 붙여서 앞 소리를 길게(~) 늘여 읽습니다.',
    pairs: [
      { wrongLook: 'おばさん', wrongKr: '오바상 (아주머니)', rightLook: 'おばあさん', rightKr: '오바-상 (할머니)', wordJp: 'おばあさん', wordKr: '오바-상', wordMeaning: '할머니' },
      { wrongLook: 'おじさん', wrongKr: '오지상 (아저씨)', rightLook: 'おじいさん', rightKr: '오지-상 (할아버지)', wordJp: 'おじいさん', wordKr: '오지-상', wordMeaning: '할아버지' },
      { wrongLook: 'ゆき', wrongKr: '유키 (눈 Snow)', rightLook: 'ゆうき', rightKr: '유-키 (용기)', wordJp: 'ゆうき', wordKr: '유-키', wordMeaning: '용기' },
      { wrongLook: '빌딩 vs 맥주', wrongKr: 'ビル (비루 = 빌딩)', rightLook: 'ビール', rightKr: '비-루 (맥주!)', wordJp: 'ビール', wordKr: '비-루', wordMeaning: '맥주' }
    ]
  }
];

export const YOON_CHART = [
  { id: 'kya', jp: 'きゃ / きゅ / きょ', kr: '캬 / 큐 / 쿄', example: 'きょう (쿄- · 오늘)' },
  { id: 'sha', jp: 'しゃ / しゅ / しょ', kr: '샤 / 슈 / 쇼', example: 'しゃしん (샤신 · 사진)' },
  { id: 'cha', jp: 'ちゃ / ちゅ / ちょ', kr: '챠 / 츄 / 쵸', example: 'おちゃ (오챠 · 녹차)' },
  { id: 'nya', jp: 'にゃ / にゅ / にょ', kr: '냐 / 뉴 / 뇨', example: 'ぎゅうにゅう (규-뉴- · 우유)' },
  { id: 'hya', jp: 'ひゃ / ひゅ / ひょ', kr: '햐 / 휴 / 효', example: 'ひゃく (햐쿠 · 100)' },
  { id: 'mya', jp: 'みゃ / みゅ / みょ', kr: '먀 / 뮤 / 묘', example: 'みょうじ (묘-지 · 성씨)' },
  { id: 'rya', jp: 'りゃ / りゅ / りょ', kr: '랴 / 류 / 료', example: 'りょこう (료코- · 여행)' },
  { id: 'gya', jp: 'ぎゃ / ぎゅ / ぎょ', kr: '갸 / 규 / 교', example: 'ぎょうざ (교-자 · 만두)' },
  { id: 'ja', jp: 'じゃ / じゅ / じょ', kr: '쟈 / 쥬 / 죠', example: 'だいじょうぶ (다이죠-부 · 괜찮음)' },
  { id: 'bya', jp: 'びゃ / びゅ / びょ', kr: '뱌 / 뷰 / 뵤', example: 'びょういん (뵤-인 · 병원)' },
  { id: 'pya', jp: 'ぴゃ / ぴゅ / ぴょ', kr: '퍄 / 퓨 / 표', example: 'ろっぴゃく (롭퍄쿠 · 600)' }
];

export const NUMBER_SECTIONS = [
  {
    id: 'basic_1_10',
    title: '1단계: 기본 숫자 1 ~ 10',
    subtitle: '4(욘/시), 7(나나/시치), 9(큐-/쿠)는 두 가지 발음이 있어요!',
    items: [
      { id: 'n1', display: '1', jp: 'いち', kr: '이치', meaning: '숫자 1', isTrap: false },
      { id: 'n2', display: '2', jp: 'に', kr: '니', meaning: '숫자 2', isTrap: false },
      { id: 'n3', display: '3', jp: 'さん', kr: '산', meaning: '숫자 3', isTrap: false },
      { id: 'n4', display: '4', jp: 'よん (し)', kr: '욘 (시)', meaning: '숫자 4', isTrap: true, tip: '보통 よん(욘)을 많이 쓰지만 4월(しがち), 4시(よじ)에선 바뀜!' },
      { id: 'n5', display: '5', jp: 'ご', kr: '고', meaning: '숫자 5', isTrap: false },
      { id: 'n6', display: '6', jp: 'ろく', kr: '로쿠', meaning: '숫자 6', isTrap: false },
      { id: 'n7', display: '7', jp: 'なな (しち)', kr: '나나 (시치)', meaning: '숫자 7', isTrap: true, tip: '보통 なな(나나), 7시(しちじ)·7월(しちがつ)에서는 시치!' },
      { id: 'n8', display: '8', jp: 'はち', kr: '하치', meaning: '숫자 8', isTrap: false },
      { id: 'n9', display: '9', jp: 'きゅう (く)', kr: '큐- (쿠)', meaning: '숫자 9', isTrap: true, tip: '9시(くじ · 쿠지), 9월(くがつ · 쿠가츠)에서는 쿠!' },
      { id: 'n10', display: '10', jp: 'じゅう', kr: '쥬-', meaning: '숫자 10', isTrap: false }
    ]
  },
  {
    id: 'price_yen',
    title: '2단계: 쇼핑·식당 가격 읽기 (백·천·만 엔)',
    subtitle: '⚠️ 300, 600, 800, 3000, 8000은 발음이 변하는 단골 시험/실전 함정입니다!',
    items: [
      { id: 'p100', display: '¥100', jp: 'ひゃくえん', kr: '햐쿠엔', meaning: '100엔', isTrap: false },
      { id: 'p200', display: '¥200', jp: 'にひゃくえん', kr: '니햐쿠엔', meaning: '200엔', isTrap: false },
      { id: 'p300', display: '¥300', jp: 'さんびゃくえん', kr: '산뱌쿠엔', meaning: '300엔', isTrap: true, tip: '★함정! 산햐쿠(X) → 탁점이 붙어 산뱌쿠(さんびゃく)!' },
      { id: 'p400', display: '¥400', jp: 'よんひゃくえん', kr: '욘햐쿠엔', meaning: '400엔', isTrap: false },
      { id: 'p500', display: '¥500', jp: 'ごひゃくえん', kr: '고햐쿠엔', meaning: '500엔', isTrap: false },
      { id: 'p600', display: '¥600', jp: 'ろっぴゃくえん', kr: '롭퍄쿠엔', meaning: '600엔', isTrap: true, tip: '★함정! 로쿠햐쿠(X) → 촉음+반탁음으로 롭퍄쿠(ろっぴゃく)!' },
      { id: 'p800', display: '¥800', jp: 'はっぴゃくえん', kr: '합퍄쿠엔', meaning: '800엔', isTrap: true, tip: '★함정! 하치햐쿠(X) → 촉음+반탁음으로 합퍄쿠(はっぴゃく)!' },
      { id: 'p1000', display: '¥1,000', jp: 'せんえん', kr: '센엔', meaning: '1,000엔', isTrap: false },
      { id: 'p3000', display: '¥3,000', jp: 'さんぜんえん', kr: '산젠엔', meaning: '3,000엔', isTrap: true, tip: '★함정! 산센(X) → 탁점이 붙어 산젠(さんぜん)!' },
      { id: 'p8000', display: '¥8,000', jp: 'はっせんえん', kr: '핫센엔', meaning: '8,000엔', isTrap: true, tip: '★함정! 하치센(X) → 작은 っ가 들어가 핫센(はっせん)!' },
      { id: 'p10000', display: '¥10,000', jp: 'いちまんえん', kr: '이치만엔', meaning: '10,000엔', isTrap: true, tip: '천(せん)은 그냥 센이지만, 만(まん)은 꼭 앞에 いち(1)를 붙여 이치만엔!' }
    ]
  },
  {
    id: 'counters_people_time',
    title: '3단계: 식당 인원수 · 물건 개수 · 시간 함정',
    subtitle: '식당 들어갈 때 손가락 펴며 바로 쓰는 표현과 개수 세기',
    items: [
      { id: 'c_p1', display: '1명', jp: 'ひとり', kr: '히토리', meaning: '한 명(혼자)', isTrap: true, tip: '이치닌(X) → 무조건 히토리(ひとり)!' },
      { id: 'c_p2', display: '2명', jp: 'ふたり', kr: '후타리', meaning: '두 명', isTrap: true, tip: '니닌(X) → 무조건 후타리(ふたり)!' },
      { id: 'c_p3', display: '3명', jp: 'さんにん', kr: '산닌', meaning: '세 명', isTrap: false, tip: '3명부터는 숫자 + 닌(にん) 규칙대로!' },
      { id: 'c_p4', display: '4명', jp: 'よにん', kr: '요닌', meaning: '네 명', isTrap: true, tip: '★함정! 욘닌(X) → ん이 빠져서 요닌(よにん)!' },
      { id: 'c_o1', display: '1개', jp: 'ひとつ', kr: '히토츠', meaning: '한 개', isTrap: false },
      { id: 'c_o2', display: '2개', jp: 'ふたつ', kr: '후타츠', meaning: '두 개', isTrap: false },
      { id: 'c_o3', display: '3개', jp: 'みっつ', kr: '밋츠', meaning: '세 개', isTrap: true, tip: '작은 っ가 들어가 밋츠(みっつ)!' },
      { id: 'c_o4', display: '4개', jp: 'よっつ', kr: '욧츠', meaning: '네 개', isTrap: false },
      { id: 'c_t4', display: '4시', jp: 'よじ', kr: '요지', meaning: '4시', isTrap: true, tip: '욘지(X), 시지(X) → 무조건 요지(よじ)!' },
      { id: 'c_t9', display: '9시', jp: 'くじ', kr: '쿠지', meaning: '9시', isTrap: true, tip: '큐-지(X) → 9시는 무조건 쿠지(くじ)!' }
    ]
  }
];
