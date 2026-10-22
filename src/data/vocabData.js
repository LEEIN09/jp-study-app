// 완전 입문자를 위한 단계별 단어장 (한자 부담 없이 히라가나/가타카나 읽기 연습 + 필수 어휘 동시 마스터)

export const VOCAB_CATEGORIES = [
  {
    id: 'step1',
    title: 'Step 1. 아~나행 초간단 단어',
    subtitle: '방금 외운 히라가나 앞부분(あ~な행)만으로 바로 읽을 수 있는 짧은 단어',
    badge: '입문 첫걸음'
  },
  {
    id: 'step2',
    title: 'Step 2. 필수 일상 히라가나 단어',
    subtitle: '가장 많이 쓰이는 동사·형용사·명사 (한자 표기 병기)',
    badge: '초빈출 핵심'
  },
  {
    id: 'step3',
    title: 'Step 3. 여행·실생활 가타카나',
    subtitle: '일본 식당·편의점·호텔에서 무조건 마주치는 가타카나 외래어',
    badge: '가타카나 정복'
  },
  {
    id: 'step4',
    title: 'Step 4. 숫자·시간·위치 필수어',
    subtitle: '가격 물어보기, 인원수 말하기, 길 찾기에 꼭 필요한 단어',
    badge: '생존 필수'
  }
];

export const VOCAB_DATA = [
  // Step 1: 아~나행 중심의 읽기 연습용 기초 단어
  { id: 'v1', category: 'step1', kana: 'あい', kanji: '愛', kr: '아이', meaning: '사랑', tip: 'あ(아) + い(이)' },
  { id: 'v2', category: 'step1', kana: 'うえ', kanji: '上', kr: '우에', meaning: '위', tip: 'う(우) + え(에)' },
  { id: 'v3', category: 'step1', kana: 'あお', kanji: '青', kr: '아오', meaning: '파랑(파란색)', tip: 'あ(아) + お(오)' },
  { id: 'v4', category: 'step1', kana: 'いえ', kanji: '家', kr: '이에', meaning: '집', tip: 'い(이) + え(에)' },
  { id: 'v5', category: 'step1', kana: 'えき', kanji: '駅', kr: '에키', meaning: '역(기차·지하철)', tip: 'え(에) + き(키)' },
  { id: 'v6', category: 'step1', kana: 'كأ', kanaFix: 'かお', kanji: '顔', kr: '카오', meaning: '얼굴', tip: 'か(카) + お(오)' },
  { id: 'v7', category: 'step1', kana: 'かさ', kanji: '傘', kr: '카사', meaning: '우산', tip: 'か(카) + さ(사)' },
  { id: 'v8', category: 'step1', kana: 'くち', kanji: '口', kr: '쿠치', meaning: '입', tip: 'く(쿠) + ち(치)' },
  { id: 'v9', category: 'step1', kana: '스시', kanaFix: 'すし', kanji: '寿司', kr: '스시', meaning: '초밥', tip: 'す(스) + し(시)' },
  { id: 'v10', category: 'step1', kana: 'いぬ', kanji: '犬', kr: '이누', meaning: '개(강아지)', tip: 'い(이) + ぬ(누)' },
  { id: 'v11', category: 'step1', kana: 'ねこ', kanji: '猫', kr: '네코', meaning: '고양이', tip: 'ね(네) + こ(코)' },
  { id: 'v12', category: 'step1', kana: 'なつ', kanji: '夏', kr: '나츠', meaning: '여름', tip: 'な(나) + つ(츠)' },
  { id: 'v13', category: 'step1', kana: 'にく', kanji: '肉', kr: '니쿠', meaning: '고기', tip: 'に(니) + く(쿠)' },
  { id: 'v14', category: 'step1', kana: 'さかな', kanji: '魚', kr: '사카나', meaning: '생선·물고기', tip: 'さ(사) + か(카) + な(나)' },
  { id: 'v15', category: 'step1', kana: 'あさ', kanji: '朝', kr: '아사', meaning: '아침', tip: 'あ(아) + さ(사)' },

  // Step 2: 일상 필수 히라가나 어휘
  { id: 'v16', category: 'step2', kana: 'みず', kanji: '水', kr: '미즈', meaning: '물 (식당에서는 おみず)', tip: 'み(미) + ず(즈: す에 탁점)' },
  { id: 'v17', category: 'step2', kana: 'ごはん', kanji: 'ご飯', kr: '고항', meaning: '밥 / 식사', tip: 'ご(고) + は(하) + ん(응)' },
  { id: 'v18', category: 'step2', kana: 'たべる', kanji: '食べる', kr: '타베루', meaning: '먹다', tip: 'た(타) + べ(베) + る(루)' },
  { id: 'v19', category: 'step2', kana: 'のむ', kanji: '飲む', kr: '노무', meaning: '마시다', tip: 'の(노) + む(무)' },
  { id: 'v20', category: 'step2', kana: 'いく', kanji: '行く', kr: '이쿠', meaning: '가다', tip: 'い(이) + く(쿠)' },
  { id: 'v21', category: 'step2', kana: 'くる', kanji: '来る', kr: '쿠루', meaning: '오다', tip: 'く(쿠) + る(루)' },
  { id: 'v22', category: 'step2', kana: 'みる', kanji: '見る', kr: '미루', meaning: '보다', tip: 'み(미) + る(루)' },
  { id: 'v23', category: 'step2', kana: 'かう', kanji: '買う', kr: '카우', meaning: '사다(구매하다)', tip: 'か(카) + う(우)' },
  { id: 'v24', category: 'step2', kana: 'おいしい', kanji: '美味しい', kr: '오이시이', meaning: '맛있다', tip: 'お + い + し + い (길게 이~)' },
  { id: 'v25', category: 'step2', kana: 'たかい', kanji: '高い', kr: '타카이', meaning: '비싸다 / 높다', tip: 'た(타) + か(카) + い(이)' },
  { id: 'v26', category: 'step2', kana: 'やすい', kanji: '安い', kr: '야스이', meaning: '싸다(저렴하다)', tip: 'や(야) + す(스) + い(이)' },
  { id: 'v27', category: 'step2', kana: 'すき', kanji: '好き', kr: '스키', meaning: '좋아함', tip: 'す(스) + き(키) (발음은 스키에 가까움)' },
  { id: 'v28', category: 'step2', kana: 'わたし', kanji: '私', kr: '와타시', meaning: '나 / 저', tip: 'わ(와) + た(타) + し(시)' },
  { id: 'v29', category: 'step2', kana: 'ともだち', kanji: '友達', kr: '토모다치', meaning: '친구', tip: 'と(토)+も(모)+だ(다)+ち(치)' },
  { id: 'v30', category: 'step2', kana: 'にほん', kanji: '日本', kr: '니혼', meaning: '일본', tip: 'に(니) + ほ(호) + ん(응)' },
  { id: 'v31', category: 'step2', kana: 'かんこく', kanji: '韓国', kr: '캉코쿠', meaning: '한국', tip: 'か(카)+ん(응)+こ(코)+く(쿠)' },

  // Step 3: 여행·실생활 가타카나 필수 외래어
  { id: 'v32', category: 'step3', kana: 'コーヒー', kanji: 'Coffee', kr: '코-히-', meaning: '커피', tip: 'ー(장음 부호)는 앞 모음을 길게 늘여 읽어요!' },
  { id: 'v33', category: 'step3', kana: 'ビール', kanji: 'Beer', kr: '비-루', meaning: '맥주', tip: 'ビ(비) + ー(장음) + ル(루)' },
  { id: 'v34', category: 'step3', kana: 'メニュー', kanji: 'Menu', kr: '메뉴-', meaning: '메뉴판', tip: 'メ(메) + 뉴(ニュ) + ー' },
  { id: 'v35', category: 'step3', kana: 'トイレ', kanji: 'Toilet', kr: '토이레', meaning: '화장실', tip: 'ト(토) + イ(이) + レ(레)' },
  { id: 'v36', category: 'step3', kana: 'ホテル', kanji: 'Hotel', kr: '호테루', meaning: '호텔', tip: 'ホ(호) + テ(테) + ル(루)' },
  { id: 'v37', category: 'step3', kana: 'コンビニ', kanji: 'Convenience', kr: '콤비니', meaning: '편의점', tip: 'コ(코) + ン(응) + ビ(비) + ニ(니)' },
  { id: 'v38', category: 'step3', kana: 'タクシー', kanji: 'Taxi', kr: '타쿠시-', meaning: '택시', tip: 'タ(타) + ク(쿠) + シ(시) + ー' },
  { id: 'v39', category: 'step3', kana: 'バス', kanji: 'Bus', kr: '바스', meaning: '버스', tip: 'バ(바) + ス(스)' },
  { id: 'v40', category: 'step3', kana: 'ラーメン', kanji: 'Ramen', kr: '라-멘', meaning: '라멘', tip: 'ラ(라) + ー + メ(메) + ン(응)' },
  { id: 'v41', category: 'step3', kana: 'パン', kanji: 'Pain', kr: '팡', meaning: '빵', tip: 'パ(파: 반탁음) + ン(응)' },
  { id: 'v42', category: 'step3', kana: '선물/카드', kanaFix: 'カード', kanji: 'Card', kr: '카-도', meaning: '카드 (신용/교통카드)', tip: 'カ(카) + ー + ド(도)' },
  { id: 'v43', category: 'step3', kana: '스마트폰', kanaFix: 'スマホ', kanji: 'Smartphone', kr: '스마호', meaning: '스마트폰', tip: 'ス(스) + マ(마) + ホ(호)' },

  // Step 4: 숫자·시간·위치 필수 단어
  { id: 'v44', category: 'step4', kana: 'ここ', kanji: '此処', kr: '코코', meaning: '여기 (이곳)', tip: '코코(여기) / 소코(거기) / 아소코(저기) / 도코(어디)' },
  { id: 'v45', category: 'step4', kana: 'どこ', kanji: '何処', kr: '도코', meaning: '어디', tip: 'ど(도) + こ(코)' },
  { id: 'v46', category: 'step4', kana: 'これ', kanji: '此れ', kr: '코레', meaning: '이것 (이거)', tip: '코레(이것) / 소레(그것) / 아레(저것) / 도레(어느 것)' },
  { id: 'v47', category: 'step4', kana: 'いくら', kanji: '幾ら', kr: '이쿠라', meaning: '얼마 (가격)', tip: 'い(이) + く(쿠) + ら(라)' },
  { id: 'v48', category: 'step4', kana: 'いま', kanji: '今', kr: '이마', meaning: '지금', tip: 'い(이) + ま(마)' },
  { id: 'v49', category: 'step4', kana: 'きょう', kanji: '今日', kr: '쿄우', meaning: '오늘', tip: 'き+ょ(작은 요) = 쿄(きょ) + う(장음)' },
  { id: 'v50', category: 'step4', kana: 'あした', kanji: '明日', kr: '아시타', meaning: '내일', tip: 'あ(아) + し(시) + た(타)' },
  { id: 'v51', category: 'step4', kana: 'きのう', kanji: '昨日', kr: '키노우', meaning: '어제', tip: 'き(키) + の(노) + う(우)' },
  { id: 'v52', category: 'step4', kana: 'ひとつ', kanji: '一つ', kr: '히토츠', meaning: '한 개 (1개)', tip: '물건 셀 때 1개 = 히토츠, 2개 = 후타츠, 3개 = 밋츠' },
  { id: 'v53', category: 'step4', kana: 'ふたつ', kanji: '二つ', kr: '후타츠', meaning: '두 개 (2개)', tip: 'ふ(후) + た(타) + つ(츠)' },
  { id: 'v54', category: 'step4', kana: 'ひとり', kanji: '一人', kr: '히토리', meaning: '한 명 (혼자)', tip: '식당에서 "히토리데스(1명입니다)"로 바로 사용!' },
  { id: 'v55', category: 'step4', kana: 'ふたり', kanji: '二人', kr: '후타리', meaning: '두 명 (둘이서)', tip: '식당에서 "후타리데스(2명입니다)"로 바로 사용!' }
].map(item => ({
  ...item,
  kana: item.kanaFix || item.kana
}));
