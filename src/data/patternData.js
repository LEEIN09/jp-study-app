// 복잡한 문법 용어 없이 단어를 끼워 넣어 바로 말하는 '패턴 갈아끼우기' 데이터

export const PATTERN_DATA = [
  {
    id: 'p1',
    title: '[명사] + ください (쿠다사이)',
    meaning: '~을/를 주세요 (주문·요청 만능 패턴)',
    grammarPoint: '명사 뒤에 ください(쿠다사이)만 붙이면 식당·카페·편의점에서 원하는 것을 정중하게 달라고 할 수 있습니다.',
    templateJp: '{word} ください',
    templateKr: '{kr} 쿠다사이',
    templateMeaning: '{meaning} 주세요',
    slots: [
      { word: 'みず', kr: '미즈', meaning: '물' },
      { word: 'これ', kr: '코레', meaning: '이것(이거)' },
      { word: 'メニュー', kr: '메뉴-', meaning: '메뉴판' },
      { word: 'コーヒー', kr: '코-히-', meaning: '커피' },
      { word: 'ビール', kr: '비-루', meaning: '맥주' },
      { word: 'ひとつ', kr: '히토츠', meaning: '한 개' }
    ]
  },
  {
    id: 'p2',
    title: '[장소/명사] + は どこですか？',
    meaning: '~은/는 어디인가요? (길 찾기 만능 패턴)',
    grammarPoint: '주의! 조사 は는 글자로는 "하"라고 쓰지만, "~은/는"으로 쓰일 때는 무조건 "와"로 발음합니다! (どこですか = 도코데스카)',
    templateJp: '{word}は どこですか？',
    templateKr: '{kr}와 도코데스카?',
    templateMeaning: '{meaning}은(는) 어디인가요?',
    slots: [
      { word: 'トイレ', kr: '토이레', meaning: '화장실' },
      { word: 'えき', kr: '에키', meaning: '역(지하철·기차)' },
      { word: 'コンビニ', kr: '콤비니', meaning: '편의점' },
      { word: 'ホテル', kr: '호테루', meaning: '호텔' },
      { word: 'バス', kr: '바스', meaning: '버스 타는 곳' }
    ]
  },
  {
    id: 'p3',
    title: '[명사] + は いくらですか？',
    meaning: '~은/는 얼마인가요? (쇼핑·계산 필수 패턴)',
    grammarPoint: 'いくら(이쿠라 = 얼마) + ですか(데스카 = 입니까?). 물건을 가리키며 "코레와 이쿠라데스카?"만 외워도 쇼핑 끝!',
    templateJp: '{word}は いくらですか？',
    templateKr: '{kr}와 이쿠라데스카?',
    templateMeaning: '{meaning}은(는) 얼마인가요?',
    slots: [
      { word: 'これ', kr: '코레', meaning: '이것' },
      { word: 'それ', kr: '소레', meaning: '그것' },
      { word: 'ぜんぶ', kr: '젠부', meaning: '전부(다 해서)' },
      { word: 'ラーメン', kr: '라-멘', meaning: '라멘' }
    ]
  },
  {
    id: 'p4',
    title: '[상태/명사] + です (데스)',
    meaning: '~입니다 / ~해요 (내 상태·의사 표현)',
    grammarPoint: '단어 뒤에 です(데스)만 붙이면 정중한 존댓말("~입니다 / ~해요") 문장이 완성됩니다.',
    templateJp: '{word}です',
    templateKr: '{kr}데스',
    templateMeaning: '{meaning}입니다 / {meaning}해요',
    slots: [
      { word: 'ひとり', kr: '히토리', meaning: '한 명(혼자)' },
      { word: 'ふたり', kr: '후타리', meaning: '두 명' },
      { word: 'おいしい', kr: '오이시이', meaning: '맛있는 상태(맛있어요)' },
      { word: 'だいじょうぶ', kr: '다이죠-부', meaning: '괜찮음(괜찮아요)' },
      { word: 'かんこくじん', kr: '캉코쿠진', meaning: '한국 사람' }
    ]
  },
  {
    id: 'p5',
    title: '[음식/교통] + が すきです',
    meaning: '~을/를 좋아합니다 (일상 대화 기본)',
    grammarPoint: '일본어에서 "좋아하다(すき)" 앞에는 조사 를(を) 대신 가(が)를 씁니다! (~가 스키데스)',
    templateJp: '{word}が すきです',
    templateKr: '{kr}가 스키데스',
    templateMeaning: '{meaning}을(를) 좋아해요',
    slots: [
      { word: 'すし', kr: '스시', meaning: '초밥' },
      { word: 'ねこ', kr: '네코', meaning: '고양이' },
      { word: 'にほん', kr: '니혼', meaning: '일본' },
      { word: 'コーヒー', kr: '코-히-', meaning: '커피' }
    ]
  }
];

export const SURVIVAL_PHRASES = [
  { id: 's1', jp: 'すみません', kr: '스미마셍', meaning: '저기요(부를 때) / 죄송합니다 / 실례합니다', usage: '식당에서 직원 부를 때, 길 물어보기 전 첫마디 1순위!' },
  { id: 's2', jp: 'ありがとうございます', kr: '아리가토- 고자이마스', meaning: '감사합니다', usage: '언제 어디서나 쓰는 정중한 감사 인사' },
  { id: 's3', jp: 'おねがいします', kr: '오네가이시마스', meaning: '부탁합니다', usage: '계산할 때 카드 내밀며 "카-도데 오네가이시마스(카드로 부탁해요)"' },
  { id: 's4', jp: 'だいじょうぶです', kr: '다이죠-부데스', meaning: '괜찮습니다 (거절할 때도 사용!)', usage: '편의점에서 봉투/영수증 필요하냐고 물어볼 때 정중히 거절하는 마법의 말' },
  { id: 's5', jp: 'おかいけい おねがいします', kr: '오카이케이 오네가이시마스', meaning: '계산 부탁드립니다', usage: '식사 마치고 자리에서 계산서 달라고 할 때' },
  { id: 's6', jp: 'はい / いいえ', kr: '하이 / 이이에', meaning: '네 / 아니오', usage: '가장 기본적인 긍정과 부정 대답' }
];
