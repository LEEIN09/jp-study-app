// 완전 입문자를 위한 오십음도(청음, 탁음/반탁음) 데이터 및 연상 암기법, 헷갈리는 글자 팁

export const KANA_ROWS = [
  { id: 'a', label: 'あ행 (아행)', desc: '모음 5글자 — 모든 일본어 발음의 기본!' },
  { id: 'ka', label: 'か행 (카행)', desc: 'k 자음 + 모음 (카, 키, 쿠, 케, 코)' },
  { id: 'sa', label: 'さ행 (사행)', desc: 's 자음 + 모음 (사, 시, 스, 세, 소)' },
  { id: 'ta', label: 'た행 (타행)', desc: 't 자음 + 모음 (타, 치, 츠, 테, 토)' },
  { id: 'na', label: 'な행 (나행)', desc: 'n 자음 + 모음 (나, 니, 누, 네, 노)' },
  { id: 'ha', label: 'は행 (하행)', desc: 'h 자음 + 모음 (하, 히, 후, 헤, 호)' },
  { id: 'ma', label: 'ま행 (마행)', desc: 'm 자음 + 모음 (마, 미, 무, 메, 모)' },
  { id: 'ya', label: 'や행 (야행)', desc: 'y 반모음 3글자 (야, 유, 요)' },
  { id: 'ra', label: 'ら행 (라행)', desc: 'r/l 자음 + 모음 (라, 리, 루, 레, 로)' },
  { id: 'wa', label: 'わ행 (와행/응)', desc: '와(わ), 오(を), 받침 응(ん)' },
  { id: 'dakuon', label: '탁음·반탁음', desc: '점 두 개(゛)와 동그라미(゜)로 바뀌는 소리' },
];

export const KANA_DATA = [
  // あ행
  {
    id: 'a', row: 'a', type: 'seion',
    hira: 'あ', kata: 'ア', romaji: 'a', kr: '아',
    mnemonicHira: '안(安)자의 초서체. 십자가(+) 아래 동그라미가 "아!" 하고 입 벌린 모양',
    mnemonicKata: '아이스크림 콘 모양 또는 한글 "아"의 윗부분을 비스듬히 쓴 모양',
    confusingWith: 'お(오)와 모양이 비슷해요! 오른쪽 위에 점이 없으면 あ(아), 점이 있으면 お(오)입니다.',
    example: { jp: 'あい', kr: '아이', meaning: '사랑' }
  },
  {
    id: 'i', row: 'a', type: 'seion',
    hira: 'い', kata: 'イ', romaji: 'i', kr: '이',
    mnemonicHira: '한글 "이"를 옆으로 나란히 세워 쓴 모양 (왼쪽이 길고 오른쪽이 짧음)',
    mnemonicKata: '사람 인(人) 변(亻) 모양. "이" 사람이 할 때의 이!',
    confusingWith: 'り(리)와 헷갈리기 쉬워요. い(이)는 좌우로 넓고 왼쪽 획이 길며, り(리)는 위아래로 길고 오른쪽 획이 깁니다.',
    example: { jp: 'いぬ', kr: '이누', meaning: '개(강아지)' }
  },
  {
    id: 'u', row: 'a', type: 'seion',
    hira: 'う', kata: 'ウ', romaji: 'u', kr: '우',
    mnemonicHira: '등을 구부리고 "우~" 하고 우는 사람의 옆모습',
    mnemonicKata: '우산(ウ) 모양. 한국어의 "우"보다 입술을 앞으로 내밀지 않고 평평하게 발음해요.',
    confusingWith: '가타카나 ウ(우)와 ワ(와) 주의! 위에 짧은 세로획이 있으면 ウ(우), 없으면 ワ(와).',
    example: { jp: 'うえ', kr: '우에', meaning: '위' }
  },
  {
    id: 'e', row: 'a', type: 'seion',
    hira: 'え', kata: 'エ', romaji: 'e', kr: '에',
    mnemonicHira: '신나게 달리는 사람 모양 ("에~하고 달리다")',
    mnemonicKata: '영문 I 또는 엘리베이터(エ) 문 모양, 장인 공(工) 자 그대로!',
    confusingWith: 'ん(응)과 비슷하지만 え(え)는 위에 짧은 점(획)이 먼저 들어갑니다.',
    example: { jp: 'えき', kr: '에키', meaning: '역(기차·지하철역)' }
  },
  {
    id: 'o', row: 'a', type: 'seion',
    hira: 'お', kata: 'オ', romaji: 'o', kr: '오',
    mnemonicHira: '골프공을 쳐서 홀컵에 넣고 "오~!" 감탄하는 모양 (오른쪽 위에 공(점)이 떠 있음)',
    mnemonicKata: '재주 재(才) 모양. "오! 재주가 좋네"',
    confusingWith: 'あ(아)와 비교 필수: 오른쪽 위에 점이 찍혀 있고 한 번에 이어서 동그랗게 돌리면 お(오)!',
    example: { jp: 'おちゃ', kr: '오챠', meaning: '차(녹차)' }
  },

  // か행
  {
    id: 'ka', row: 'ka', type: 'seion',
    hira: 'か', kata: 'カ', romaji: 'ka', kr: '카',
    mnemonicHira: '힘 력(力) 옆에 점을 찍어 "카~!" 하고 힘쓰는 모양',
    mnemonicKata: '히라가나 か에서 오른쪽 점만 뺀 힘 력(力) 모양 그대로!',
    confusingWith: null,
    example: { jp: 'かさ', kr: '카사', meaning: '우산' }
  },
  {
    id: 'ki', row: 'ka', type: 'seion',
    hira: 'き', kata: 'キ', romaji: 'ki', kr: '키',
    mnemonicHira: '열쇠(Key = 키) 모양! 가로줄이 두 개이고 아래가 둥근 손잡이',
    mnemonicKata: '히라가나 き에서 아랫배 동그라미만 뺀 윗부분!',
    confusingWith: 'さ(사)와 비교! 가로줄이 2개면 き(키), 가로줄이 1개면 さ(사)입니다.',
    example: { jp: 'きのう', kr: '키노우', meaning: '어제' }
  },
  {
    id: 'ku', row: 'ka', type: 'seion',
    hira: 'く', kata: 'ク', romaji: 'ku', kr: '쿠',
    mnemonicHira: '새의 부리가 꺾인 모양. 비둘기가 "쿠~ 쿠~" 우는 모습',
    mnemonicKata: '숫자 7이나 한글 "크/쿠"의 ㄱ자 꺾임과 비슷함',
    confusingWith: '가타카나 ク(쿠), ケ(케), タ(타) 비교! 가운데 점이 있으면 タ(타), 없으면 ク(쿠).',
    example: { jp: 'くち', kr: '쿠치', meaning: '입' }
  },
  {
    id: 'ke', row: 'ka', type: 'seion',
    hira: 'け', kata: 'ケ', romaji: 'ke', kr: '케',
    mnemonicHira: '대나무 통이나 나무통(케그) 모양. 왼쪽 세로줄 + 오른쪽 십자(十)가 살짝 휜 형태',
    mnemonicKata: '한글 "케"를 빠르게 흘려 쓴 모양과 닮음',
    confusingWith: 'は(하), ほ(호)처럼 왼쪽에 세로획이 있지만 오른쪽에 매듭(동그라미)이 없어요.',
    example: { jp: 'けさ', kr: '케사', meaning: '오늘 아침' }
  },
  {
    id: 'ko', row: 'ka', type: 'seion',
    hira: 'こ', kata: 'コ', romaji: 'ko', kr: '코',
    mnemonicHira: '위아래 입술 모양 또는 콧구멍 두 개("코")를 위아래로 그린 모양',
    mnemonicKata: '한글 "ㄷ"을 좌우 반전한 모양. "코"너(Corner)의 각진 모서리!',
    confusingWith: '가타카나 コ(코)와 ユ(유): 아랫줄이 오른쪽으로 삐져나오면 ユ(유), 네모나게 끝나면 コ(코).',
    example: { jp: 'ここ', kr: '코코', meaning: '여기' }
  },

  // さ행
  {
    id: 'sa', row: 'sa', type: 'seion',
    hira: 'さ', kata: 'サ', romaji: 'sa', kr: '사',
    mnemonicHira: '사과(さ) 한 알! 가로줄이 1개(き는 2개)',
    mnemonicKata: '풀 초(艹) 머리 모양. "사"슴뿔 모양',
    confusingWith: 'き(키)는 가로줄 2개, さ(사)는 가로줄 1개! ち(치)와 좌우 방향이 반대입니다.',
    example: { jp: 'さかな', kr: '사카나', meaning: '생선·물고기' }
  },
  {
    id: 'shi', row: 'sa', type: 'seion',
    hira: 'し', kata: 'シ', romaji: 'shi', kr: '시',
    mnemonicHira: '낚싯바늘 또는 지팡이 끝 모양. 음료수 빨대("시~원하다")',
    mnemonicKata: '점 두 개가 가로로 나란히 찍히고 아래에서 위로 쓸어올리는 미소(Smile = 시) 모양',
    confusingWith: '★최다 오답: 가타카나 シ(시) vs ツ(츠)! シ는 점이 가로(왼쪽)로 찍히고 아래→위로 올림, ツ는 점이 세로(위쪽)로 찍히고 위→아래로 내림.',
    example: { jp: 'しお', kr: '시오', meaning: '소금' }
  },
  {
    id: 'su', row: 'sa', type: 'seion',
    hira: 'す', kata: 'ス', romaji: 'su', kr: '스',
    mnemonicHira: '스프링(스)처럼 가운데가 한 바퀴 꼬여서 내려오는 모양',
    mnemonicKata: '스키(ス)를 타고 슬로프를 내려가는 다리 모양',
    confusingWith: null,
    example: { jp: 'すし', kr: '스시', meaning: '초밥' }
  },
  {
    id: 'se', row: 'sa', type: 'seion',
    hira: 'せ', kata: 'セ', romaji: 'se', kr: '세',
    mnemonicHira: '인간 세(世) 자를 간략하게 줄여 쓴 모양 ("세"상)',
    mnemonicKata: '히라가나 せ에서 왼쪽 세로획을 뺀 모양',
    confusingWith: null,
    example: { jp: 'せんせい', kr: '센세이', meaning: '선생님' }
  },
  {
    id: 'so', row: 'sa', type: 'seion',
    hira: 'そ', kata: 'ソ', romaji: 'so', kr: '소',
    mnemonicHira: '재봉틀로 지그재그(Z+C) 바느질하는 모습 ("소"잉 머신)',
    mnemonicKata: '위에서 점 하나 찍고 위→아래로 긋는 모양',
    confusingWith: '★최다 오답: 가타카나 ソ(소) vs ン(응)! ソ는 위에서 아래로 긋고, ン은 옆에서 찍고 아래→위로 올립니다.',
    example: { jp: 'そら', kr: '소라', meaning: '하늘' }
  },

  // た행
  {
    id: 'ta', row: 'ta', type: 'seion',
    hira: 'た', kata: 'タ', romaji: 'ta', kr: '타',
    mnemonicHira: '영어 "t" + "a(こ)"가 합쳐져서 ta(타)!',
    mnemonicKata: '저녁 석(夕) 자 그대로! "타"임(저녁 시간)',
    confusingWith: 'に(니)와 비교: 왼쪽이 십자(+)로 교차하면 た(타), 그냥 세로줄이면 に(니).',
    example: { jp: 'たべる', kr: '타베루', meaning: '먹다' }
  },
  {
    id: 'chi', row: 'ta', type: 'seion',
    hira: 'ち', kata: 'チ', romaji: 'chi', kr: '치',
    mnemonicHira: '숫자 5 모양. "치"즈 5장!',
    mnemonicKata: '일천 천(千) 자 모양. "치"즈 천 개!',
    confusingWith: 'さ(사)와 좌우가 반대입니다! 숫자 5처럼 오른쪽으로 배가 나오면 ち(치), 왼쪽으로 꺾이면 さ(사).',
    example: { jp: 'ちず', kr: '치즈', meaning: '지도' }
  },
  {
    id: 'tsu', row: 'ta', type: 'seion',
    hira: 'つ', kata: 'ツ', romaji: 'tsu', kr: '츠',
    mnemonicHira: '쓰나미(츠나미) 파도가 덮치는 둥근 모양',
    mnemonicKata: '위에서 세로로 점 두 개 찍고 위→아래로 내리는 모양',
    confusingWith: '작게 쓴 っ/ッ(촉음)는 받침(ㅅ/ㄱ/ㅂ)처럼 앞뒤 음을 잠깐 멈추는 역할(예: きっぷ 킵푸)을 합니다.',
    example: { jp: 'つくえ', kr: '츠쿠에', meaning: '책상' }
  },
  {
    id: 'te', row: 'ta', type: 'seion',
    hira: 'て', kata: 'テ', romaji: 'te', kr: 'て(테)',
    mnemonicHira: '영어 대문자 T를 옆으로 굴려 쓴 모양 ("테"니스)',
    mnemonicKata: '우편 마크(〒) 또는 테이블(テ) 모양',
    confusingWith: null,
    example: { jp: 'てがみ', kr: '테가미', meaning: '편지' }
  },
  {
    id: 'to', row: 'ta', type: 'seion',
    hira: 'と', kata: 'ト', romaji: 'to', kr: '토',
    mnemonicHira: '토끼(と)의 긴 귀 하나가 솟아 있는 모양',
    mnemonicKata: '점 복(卜) 자 모양. 한글 "ㅏ" 모양으로 "토"끼 귀!',
    confusingWith: null,
    example: { jp: 'とけい', kr: '토케이', meaning: '시계' }
  },

  // な행
  {
    id: 'na', row: 'na', type: 'seion',
    hira: 'な', kata: 'ナ', romaji: 'na', kr: '나',
    mnemonicHira: '십자(+) 옆에 점 찍고 아래 매듭! "나"비 매듭 모양',
    mnemonicKata: '십자(+)에서 아랫부분이 왼쪽으로 살짝 휘어진 모양',
    confusingWith: 'た(타)와 왼쪽 십자(+)는 같지만 오른쪽이 매듭(な)인지 코(た)인지로 구분해요.',
    example: { jp: 'なつ', kr: '나츠', meaning: '여름' }
  },
  {
    id: 'ni', row: 'na', type: 'seion',
    hira: 'に', kata: 'ニ', romaji: 'ni', kr: '니',
    mnemonicHira: '사람의 무릎(Knee = 니) 옆모습',
    mnemonicKata: '한자 두 이(二)! 일본어로 숫자 2가 바로 "니(に/ニ)"입니다.',
    confusingWith: null,
    example: { jp: 'にく', kr: '니쿠', meaning: '고기' }
  },
  {
    id: 'nu', row: 'na', type: 'seion',
    hira: 'ぬ', kata: 'ヌ', romaji: 'nu', kr: '누',
    mnemonicHira: '젓가락으로 국수(Noodle = 누들) 면발을 돌돌 말아 올린 모양 (끝에 고리가 있음)',
    mnemonicKata: '또 우(又) 자 모양. "누"구 또 왔어?',
    confusingWith: 'め(메)와 쌍둥이! 끝에 돼지꼬리 매듭이 있으면 ぬ(누), 매듭 없이 뻗으면 め(메).',
    example: { jp: 'ぬの', kr: '누노', meaning: '천·옷감' }
  },
  {
    id: 'ne', row: 'na', type: 'seion',
    hira: 'ね', kata: 'ネ', romaji: 'ne', kr: '네',
    mnemonicHira: '고양이(ねこ)가 꼬리를 돌돌 말고 앉아 있는 모습',
    mnemonicKata: '보일 시(示) 변(礻) 모양. "네"트워크 안테나 모양',
    confusingWith: 'れ(레), わ(와)와 3형제! 왼쪽 기둥은 같고, 오른쪽 끝이 매듭이면 ね(네), 밖으로 뻗으면 れ(레), 둥글게 안으로 말리면 わ(와).',
    example: { jp: 'ねこ', kr: '네코', meaning: '고양이' }
  },
  {
    id: 'no', row: 'na', type: 'seion',
    hira: 'の', kata: 'ノ', romaji: 'no', kr: '노',
    mnemonicHira: '금지 표지판(NO = 노) 모양! 일본 간판에서 "~의(の)"로 가장 많이 보이는 글자',
    mnemonicKata: '노(ノ)를 젓는 짝대기 하나 모양',
    confusingWith: null,
    example: { jp: 'のみもの', kr: '노미모노', meaning: '음료(마실 것)' }
  },

  // は행
  {
    id: 'ha', row: 'ha', type: 'seion',
    hira: 'は', kata: 'ハ', romaji: 'ha', kr: '하',
    mnemonicHira: '왼쪽 기둥 + 오른쪽 십자 매듭. "하하하" 웃는 모양 (조사로 쓰일 땐 "와"로 발음!)',
    mnemonicKata: '여덟 팔(八) 자 모양. "하"늘에서 내려오는 빗줄기 두 개',
    confusingWith: 'ほ(호)와 비교: 오른쪽 가로줄이 1개면 は(하), 2개(모자 씀)면 ほ(호).',
    example: { jp: 'はな', kr: '하나', meaning: '꽃 / 코' }
  },
  {
    id: 'hi', row: 'ha', type: 'seion',
    hira: 'ひ', kata: 'ヒ', romaji: 'hi', kr: '히',
    mnemonicHira: '입꼬리를 올리며 "히히히" 웃는 입 모양 또는 코주부 모양',
    mnemonicKata: '비수 비(匕) 자 모양. 한글 "히"를 옆으로 쓴 느낌',
    confusingWith: null,
    example: { jp: 'ひと', kr: '히토', meaning: '사람' }
  },
  {
    id: 'fu', row: 'ha', type: 'seion',
    hira: 'ふ', kata: 'フ', romaji: 'fu', kr: '후',
    mnemonicHira: '후지산(ふじさん) 봉우리 모양! 뜨거운 걸 "후~" 불 때의 입술 소리',
    mnemonicKata: '한글 "ㄱ"에서 모서리가 둥근 모양 ("후"크선장의 갈고리)',
    confusingWith: null,
    example: { jp: 'ふゆ', kr: '후유', meaning: '겨울' }
  },
  {
    id: 'he', row: 'ha', type: 'seion',
    hira: 'へ', kata: 'ヘ', romaji: 'he', kr: '헤',
    mnemonicHira: '산등성이 모양(^). 히라가나와 가타카나가 완전히 똑같아서 거저먹는 글자! ("헤헤 신난다")',
    mnemonicKata: '히라가나 へ와 100% 동일합니다!',
    confusingWith: null,
    example: { jp: 'へや', kr: '헤야', meaning: '방' }
  },
  {
    id: 'ho', row: 'ha', type: 'seion',
    hira: 'ほ', kata: 'ホ', romaji: 'ho', kr: '호',
    mnemonicHira: 'は(하) 위에 모자(가로줄 하나 더)를 씌운 모양. 산타가 "호호호" 웃는 모습',
    mnemonicKata: '나무 목(木) 자 모양. "호"텔(ホテル)의 첫 글자!',
    confusingWith: 'は(하)는 오른쪽 가로줄 1개, ほ(호)는 가로줄 2개(윗줄 밖으로 삐져나오지 않게 쓰기).',
    example: { jp: 'ほん', kr: '혼', meaning: '책' }
  },

  // ま행
  {
    id: 'ma', row: 'ma', type: 'seion',
    hira: 'ま', kata: 'マ', romaji: 'ma', kr: '마',
    mnemonicHira: '가로줄 2개에 아래 매듭. "마"스크 쓴 모습',
    mnemonicKata: '한글 "마"를 빨리 쓰다가 아랫부분이 삼각형으로 줄어든 모양',
    confusingWith: 'ほ(호)에서 왼쪽 세로기둥을 빼면 ま(마)가 됩니다!',
    example: { jp: 'まど', kr: '마도', meaning: '창문' }
  },
  {
    id: 'mi', row: 'ma', type: 'seion',
    hira: 'み', kata: 'ミ', romaji: 'mi', kr: '미',
    mnemonicHira: '음악 기호나 숫자 21을 이어 쓴 모양. 도레"미"!',
    mnemonicKata: '석 삼(三)을 비스듬히 그은 모양. 고양이 수염 3개!',
    confusingWith: null,
    example: { jp: 'みず', kr: '미즈', meaning: '물' }
  },
  {
    id: 'mu', row: 'ma', type: 'seion',
    hira: 'む', kata: 'ム', romaji: 'mu', kr: '무',
    mnemonicHira: '소(Moo = 무~)의 뿔과 코뚜레 동그라미 모양',
    mnemonicKata: '사사 사(厶) 자 그대로! 한글 "ㅁ(무)"을 삼각형으로 쓴 모양',
    confusingWith: 'す(스)는 아래로 뻗어 내려가고, む(무)는 오른쪽 위로 감아 돌린 뒤 점을 찍습니다.',
    example: { jp: 'むし', kr: '무시', meaning: '벌레' }
  },
  {
    id: 'me', row: 'ma', type: 'seion',
    hira: 'め', kata: 'メ', romaji: 'me', kr: 'め(메)',
    mnemonicHira: '프레첼 과자 모양. 일본어로 め(메)는 "눈(Eye)"이라는 뜻!',
    mnemonicKata: '칼자국 X자 모양 ("메"스)',
    confusingWith: 'ぬ(누)와 비교: 끝에 돼지꼬리 고리가 없으면 め(메), 있으면 ぬ(누).',
    example: { jp: 'めがね', kr: '메가네', meaning: '안경' }
  },
  {
    id: 'mo', row: 'ma', type: 'seion',
    hira: 'も', kata: 'モ', romaji: 'mo', kr: '모',
    mnemonicHira: '낚싯바늘(し)에 미끼 두 개를 꿰어 "모"아놓은 모양',
    mnemonicKata: '히라가나 も를 각지게 편 모양 (털 모 毛 자에서 유래)',
    confusingWith: null,
    example: { jp: 'もも', kr: '모모', meaning: '복숭아' }
  },

  // や행
  {
    id: 'ya', row: 'ya', type: 'seion',
    hira: 'や', kata: 'ヤ', romaji: 'ya', kr: '야',
    mnemonicHira: '야크(소)의 머리와 뿔 모양 ("야!")',
    mnemonicKata: '히라가나 や에서 위에 점만 뺀 각진 모양',
    confusingWith: null,
    example: { jp: 'やま', kr: '야마', meaning: '산' }
  },
  {
    id: 'yu', row: 'ya', type: 'seion',
    hira: 'ゆ', kata: 'ユ', romaji: 'yu', kr: '유',
    mnemonicHira: '일본 온천(유=湯) 간판에 항상 그려진 글자! 물고기가 헤엄치는 모양',
    mnemonicKata: '숫자 1(一) 위에 ㄱ을 얹은 모양 ("유"일의 1)',
    confusingWith: null,
    example: { jp: 'ゆき', kr: '유키', meaning: '눈(Snow)' }
  },
  {
    id: 'yo', row: 'ya', type: 'seion',
    hira: 'よ', kata: 'ヨ', romaji: 'yo', kr: '요',
    mnemonicHira: '요요(Yo-yo) 장난감이 줄에 매달린 모양',
    mnemonicKata: '영문 E를 좌우 반전한 모양 ("요"가 매트 3단 접기)',
    confusingWith: null,
    example: { jp: 'よる', kr: '요루', meaning: '밤(Night)' }
  },

  // ら행
  {
    id: 'ra', row: 'ra', type: 'seion',
    hira: 'ら', kata: 'ラ', romaji: 'ra', kr: '라',
    mnemonicHira: '숫자 5(ち)에서 가로줄이 위에 동동 떠 있는 모양 ("라"디오 안테나)',
    mnemonicKata: '후(フ) 위에 뚜껑이 하나 더 있는 모양 ("라"멘 그릇 뚜껑)',
    confusingWith: 'ち(치)는 가로줄이 관통하고, ら(라)는 위에 점이 따로 떨어져 있어요.',
    example: { jp: 'らいねん', kr: '라이넨', meaning: '내년' }
  },
  {
    id: 'ri', row: 'ra', type: 'seion',
    hira: 'り', kata: 'リ', romaji: 'ri', kr: '리',
    mnemonicHira: '갈대(Reed = 리드) 두 줄기가 바람에 나부끼는 모양 (오른쪽이 길게 내려옴)',
    mnemonicKata: '히라가나 り와 거의 똑같음!',
    confusingWith: 'い(이)는 왼쪽이 길고 통통함, り(리)는 오른쪽이 길고 홀쭉함.',
    example: { jp: 'りんご', kr: '링고', meaning: '사과' }
  },
  {
    id: 'ru', row: 'ra', type: 'seion',
    hira: 'る', kata: 'ル', romaji: 'ru', kr: '루',
    mnemonicHira: '숫자 3 끝에 루비(보석) 고리가 달린 모양 ("루"비)',
    mnemonicKata: '어어진 사람 인(儿) 모양. "루"트 두 갈래 길',
    confusingWith: 'ろ(로)와 쌍둥이! 끝에 동그라미 고리가 있으면 る(루), 없으면 ろ(로).',
    example: { jp: 'るす', kr: '루스', meaning: '부재중' }
  },
  {
    id: 're', row: 'ra', type: 'seion',
    hira: 'れ', kata: 'レ', romaji: 're', kr: '레',
    mnemonicHira: '기둥 옆에서 밖으로 시원하게 뻗어 나가는 모양 ("레"일)',
    mnemonicKata: '체크 표시(✓) 또는 "레"몬 조각 모양 (루 ル의 오른쪽 조각)',
    confusingWith: 'ね(네)는 끝에 매듭, わ(와)는 둥글게 안으로, れ(레)는 밖으로 삐침!',
    example: { jp: 'れきし', kr: '레키시', meaning: '역사' }
  },
  {
    id: 'ro', row: 'ra', type: 'seion',
    hira: 'ろ', kata: 'ロ', romaji: 'ro', kr: '로',
    mnemonicHira: '숫자 3 모양 그대로! 끝에 고리가 없이 깔끔한 도"로"',
    mnemonicKata: '한글 "ㅁ" 또는 입 구(口) 모양. "로"봇의 네모난 얼굴!',
    confusingWith: 'る(루)는 끝에 동그라미 고리 있음, ろ(로)는 고리 없음.',
    example: { jp: 'ろく', kr: '로쿠', meaning: '숫자 6' }
  },

  // わ행 & ん
  {
    id: 'wa', row: 'wa', type: 'seion',
    hira: 'わ', kata: 'ワ', romaji: 'wa', kr: 'わ(와)',
    mnemonicHira: '기둥 옆에 둥근 배가 볼록 나온 모양 ("와~ 배부르다")',
    mnemonicKata: '우(ウ)에서 꼭대기 점만 뺀 모양 ("와"인잔)',
    confusingWith: null,
    example: { jp: 'わたし', kr: '와타시', meaning: '나·저' }
  },
  {
    id: 'wo', row: 'wa', type: 'seion',
    hira: 'を', kata: 'ヲ', romaji: 'wo', kr: '오(을/를)',
    mnemonicHira: '발음은 お(오)와 같지만, 오직 문장에서 목적격 조사("~을/를")로만 쓰이는 특수 글자!',
    mnemonicKata: '가타카나 ヲ는 현대 일본어에서 거의 쓰이지 않아요 (후 후 위에 가로줄 2개).',
    confusingWith: null,
    example: { jp: 'みずを', kr: '미즈오', meaning: '물을' }
  },
  {
    id: 'n', row: 'wa', type: 'seion',
    hira: 'ん', kata: 'ン', romaji: 'n', kr: '응(받침 ㄴ/ㅇ/ㅁ)',
    mnemonicHira: '영어 소문자 n을 길게 늘여 쓴 모양! 홀로 쓰이지 않고 항상 앞 글자 밑에 받침(ㄴ, ㅇ, ㅁ)으로 들어갑니다.',
    mnemonicKata: '점 하나 찍고 아래에서 위로 미소 짓듯 올리는 모양 (원어민 눈 모양 ^_^)',
    confusingWith: '가타카나 ン(응) vs ソ(소): ン은 옆에 점 찍고 아래→위로 올림!',
    example: { jp: 'にほん', kr: '니혼', meaning: '일본' }
  },

  // 탁음·반탁음 핵심 대표 글자들 (퀴즈 및 학습용)
  {
    id: 'ga', row: 'dakuon', type: 'dakuon',
    hira: 'が', kata: 'ガ', romaji: 'ga', kr: '가',
    mnemonicHira: 'か(카) + 탁점(゛) = が(가)! 카→가, 키→기, 쿠→구, 케→게, 코→고',
    mnemonicKata: 'カ(카) + 탁점(゛) = ガ(가)',
    confusingWith: null,
    example: { jp: 'がっこう', kr: '각코우', meaning: '학교' }
  },
  {
    id: 'gi', row: 'dakuon', type: 'dakuon',
    hira: 'ぎ', kata: 'ギ', romaji: 'gi', kr: '기',
    mnemonicHira: 'き(키) + 탁점(゛) = ぎ(기)',
    mnemonicKata: 'キ(키) + 탁점(゛) = ギ(기)',
    confusingWith: null,
    example: { jp: 'ぎんこう', kr: '긴코우', meaning: '은행' }
  },
  {
    id: 'gu', row: 'dakuon', type: 'dakuon',
    hira: 'ぐ', kata: 'グ', romaji: 'gu', kr: '구',
    mnemonicHira: 'く(쿠) + 탁점(゛) = ぐ(구)',
    mnemonicKata: 'ク(쿠) + 탁점(゛) = グ(구)',
    confusingWith: null,
    example: { jp: 'かぐ', kr: '카구', meaning: '가구' }
  },
  {
    id: 'ge', row: 'dakuon', type: 'dakuon',
    hira: 'げ', kata: 'ゲ', romaji: 'ge', kr: '게',
    mnemonicHira: 'け(케) + 탁점(゛) = げ(게)',
    mnemonicKata: 'ケ(케) + 탁점(゛) = ゲ(게)',
    confusingWith: null,
    example: { jp: 'げんき', kr: '겡키', meaning: '건강·기운' }
  },
  {
    id: 'go', row: 'dakuon', type: 'dakuon',
    hira: 'ご', kata: 'ゴ', romaji: 'go', kr: '고',
    mnemonicHira: 'こ(코) + 탁점(゛) = ご(고)',
    mnemonicKata: 'コ(코) + 탁점(゛) = ゴ(고)',
    confusingWith: null,
    example: { jp: 'ごはん', kr: '고항', meaning: '밥·식사' }
  },
  {
    id: 'za', row: 'dakuon', type: 'dakuon',
    hira: 'ざ', kata: 'ザ', romaji: 'za', kr: '자',
    mnemonicHira: 'さ(사) + 탁점(゛) = ざ(자)! 사행에 점이 붙으면 Z(자, 지, 즈, 제, 조) 발음',
    mnemonicKata: 'サ(사) + 탁점(゛) = ザ(자)',
    confusingWith: null,
    example: { jp: 'ざっし', kr: '잣시', meaning: '잡지' }
  },
  {
    id: 'ji', row: 'dakuon', type: 'dakuon',
    hira: 'じ', kata: 'ジ', romaji: 'ji', kr: '지',
    mnemonicHira: 'し(시) + 탁점(゛) = じ(지)',
    mnemonicKata: 'シ(시) + 탁점(゛) = ジ(지)',
    confusingWith: null,
    example: { jp: 'じかん', kr: '지캉', meaning: '시간' }
  },
  {
    id: 'zu', row: 'dakuon', type: 'dakuon',
    hira: 'ず', kata: 'ズ', romaji: 'zu', kr: '즈',
    mnemonicHira: 'す(스) + 탁점(゛) = ず(즈)',
    mnemonicKata: 'ス(스) + 탁점(゛) = ズ(즈)',
    confusingWith: null,
    example: { jp: 'みず', kr: '미즈', meaning: '물' }
  },
  {
    id: 'ze', row: 'dakuon', type: 'dakuon',
    hira: 'ぜ', kata: 'ゼ', romaji: 'ze', kr: '제',
    mnemonicHira: 'せ(세) + 탁점(゛) = ぜ(제)',
    mnemonicKata: 'セ(세) + 탁점(゛) = ゼ(제)',
    confusingWith: null,
    example: { jp: 'ぜんぶ', kr: '젠부', meaning: '전부' }
  },
  {
    id: 'zo', row: 'dakuon', type: 'dakuon',
    hira: 'ぞ', kata: 'ゾ', romaji: 'zo', kr: '조',
    mnemonicHira: 'そ(소) + 탁점(゛) = ぞ(조)',
    mnemonicKata: 'ソ(소) + 탁점(゛) = ゾ(조)',
    confusingWith: null,
    example: { jp: 'かぞく', kr: '카조쿠', meaning: '가족' }
  },
  {
    id: 'da', row: 'dakuon', type: 'dakuon',
    hira: 'だ', kata: 'ダ', romaji: 'da', kr: '다',
    mnemonicHira: 'た(타) + 탁점(゛) = だ(다)! 타행에 점이 붙으면 D(다, 지, 즈, 데, 도) 발음',
    mnemonicKata: 'タ(타) + 탁점(゛) = ダ(다)',
    confusingWith: null,
    example: { jp: 'だいがく', kr: '다이가쿠', meaning: '대학교' }
  },
  {
    id: 'de', row: 'dakuon', type: 'dakuon',
    hira: 'で', kata: 'デ', romaji: 'de', kr: '데',
    mnemonicHira: 'て(테) + 탁점(゛) = で(데)',
    mnemonicKata: 'テ(테) + 탁점(゛) = デ(데)',
    confusingWith: null,
    example: { jp: 'でんしゃ', kr: '덴샤', meaning: '전철' }
  },
  {
    id: 'do', row: 'dakuon', type: 'dakuon',
    hira: 'ど', kata: 'ド', romaji: 'do', kr: '도',
    mnemonicHira: 'と(토) + 탁점(゛) = ど(도)',
    mnemonicKata: 'ト(토) + 탁점(゛) = ド(도)',
    confusingWith: null,
    example: { jp: 'どこ', kr: '도코', meaning: '어디' }
  },
  {
    id: 'ba', row: 'dakuon', type: 'dakuon',
    hira: 'ば', kata: 'バ', romaji: 'ba', kr: '바',
    mnemonicHira: 'は(하) + 탁점(゛) = ば(바)! 하행에 점 두 개가 붙으면 B(바, 비, 부, 베, 보) 발음',
    mnemonicKata: 'ハ(하) + 탁점(゛) = バ(바)',
    confusingWith: null,
    example: { jp: 'かばん', kr: '카방', meaning: '가방' }
  },
  {
    id: 'bi', row: 'dakuon', type: 'dakuon',
    hira: 'び', kata: 'ビ', romaji: 'bi', kr: '비',
    mnemonicHira: 'ひ(히) + 탁점(゛) = び(비)',
    mnemonicKata: 'ヒ(히) + 탁점(゛) = ビ(비)',
    confusingWith: null,
    example: { jp: 'ビール', kr: '비-루', meaning: '맥주' }
  },
  {
    id: 'bu', row: 'dakuon', type: 'dakuon',
    hira: 'ぶ', kata: 'ブ', romaji: 'bu', kr: '부',
    mnemonicHira: 'ふ(후) + 탁점(゛) = ぶ(부)',
    mnemonicKata: 'フ(후) + 탁점(゛) = ブ(부)',
    confusingWith: null,
    example: { jp: 'ぶた', kr: '부타', meaning: '돼지' }
  },
  {
    id: 'be', row: 'dakuon', type: 'dakuon',
    hira: 'べ', kata: 'ベ', romaji: 'be', kr: '베',
    mnemonicHira: 'へ(헤) + 탁점(゛) = べ(베)',
    mnemonicKata: 'ヘ(헤) + 탁점(゛) = ベ(베)',
    confusingWith: null,
    example: { jp: 'べんきょう', kr: '벵쿄우', meaning: '공부' }
  },
  {
    id: 'bo', row: 'dakuon', type: 'dakuon',
    hira: 'ぼ', kata: 'ボ', romaji: 'bo', kr: '보',
    mnemonicHira: 'ほ(호) + 탁점(゛) = ぼ(보)',
    mnemonicKata: 'ホ(호) + 탁점(゛) = ボ(보)',
    confusingWith: null,
    example: { jp: 'ぼうし', kr: '보우시', meaning: '모자' }
  },
  {
    id: 'pa', row: 'dakuon', type: 'dakuon',
    hira: 'ぱ', kata: 'パ', romaji: 'pa', kr: '파',
    mnemonicHira: 'は(하) + 동그라미 반탁점(゜) = ぱ(파)! 하행에만 붙으며 P(파, 피, 푸, 페, 포) 발음',
    mnemonicKata: 'ハ(하) + 반탁점(゜) = パ(파)',
    confusingWith: null,
    example: { jp: 'パン', kr: '팡', meaning: '빵' }
  },
  {
    id: 'pi', row: 'dakuon', type: 'dakuon',
    hira: 'ぴ', kata: 'ピ', romaji: 'pi', kr: '피',
    mnemonicHira: 'ひ(히) + 반탁점(゜) = ぴ(피)',
    mnemonicKata: 'ヒ(히) + 반탁점(゜) = ピ(피)',
    confusingWith: null,
    example: { jp: 'えんぴつ', kr: '엠피츠', meaning: '연필' }
  },
  {
    id: 'pu', row: 'dakuon', type: 'dakuon',
    hira: 'ぷ', kata: 'プ', romaji: 'pu', kr: '푸',
    mnemonicHira: 'ふ(후) + 반탁점(゜) = ぷ(푸)',
    mnemonicKata: 'フ(후) + 반탁점(゜) = プ(푸)',
    confusingWith: null,
    example: { jp: 'てんぷら', kr: '템푸라', meaning: '튀김' }
  },
  {
    id: 'pe', row: 'dakuon', type: 'dakuon',
    hira: 'ぺ', kata: 'ペ', romaji: 'pe', kr: '페',
    mnemonicHira: 'へ(헤) + 반탁점(゜) = ぺ(페)',
    mnemonicKata: 'ヘ(헤) + 반탁점(゜) = ペ(페)',
    confusingWith: null,
    example: { jp: 'ペン', kr: '펭', meaning: '펜' }
  },
  {
    id: 'po', row: 'dakuon', type: 'dakuon',
    hira: 'ぽ', kata: 'ポ', romaji: 'po', kr: '포',
    mnemonicHira: 'ほ(호) + 반탁점(゜) = ぽ(포)',
    mnemonicKata: 'ホ(호) + 반탁점(゜) = ポ(포)',
    confusingWith: null,
    example: { jp: 'さんぽ', kr: '삼포', meaning: '산책' }
  }
];

// 입문자가 가장 많이 헷갈리는 글자 쌍 모음 (비교 카드 & 집중 드릴용)
export const CONFUSING_PAIRS = [
  {
    id: 'pair-a-o',
    title: 'あ (아) vs お (오)',
    chars: ['a', 'o'],
    tip: '오른쪽 위에 점(공)이 떠 있으면 お(오), 점 없이 십자가에 동그라미면 あ(아)!'
  },
  {
    id: 'pair-ki-sa-chi',
    title: 'き (키) vs さ (사) vs ち (치)',
    chars: ['ki', 'sa', 'chi'],
    tip: '가로줄 2개 = き(키), 가로줄 1개 + 왼쪽 꺾임 = さ(사), 숫자 5처럼 오른쪽 배 = ち(치)!'
  },
  {
    id: 'pair-nu-me',
    title: 'ぬ (누) vs め (메)',
    chars: ['nu', 'me'],
    tip: '끝에 국수 면발처럼 동그란 매듭이 있으면 ぬ(누), 매듭 없이 뻗으면 め(메)!'
  },
  {
    id: 'pair-ru-ro',
    title: 'る (루) vs ろ (로)',
    chars: ['ru', 'ro'],
    tip: '숫자 3 끝에 루비(보석) 고리가 있으면 る(루), 고리 없이 깔끔하면 ろ(로)!'
  },
  {
    id: 'pair-ne-re-wa',
    title: 'ね (네) vs れ (레) vs わ (와)',
    chars: ['ne', 're', 'wa'],
    tip: '왼쪽 기둥은 동일! 끝이 매듭 = ね(네), 밖으로 뻗음 = れ(레), 둥글게 안으로 = わ(와)!'
  },
  {
    id: 'pair-ha-ho-ma',
    title: 'は (하) vs ほ (호) vs ま (마)',
    chars: ['ha', 'ho', 'ma'],
    tip: '기둥+가로1줄 = は(하), 기둥+가로2줄(모자) = ほ(호), 기둥 없이 가로2줄 = ま(마)!'
  },
  {
    id: 'pair-kata-shi-tsu',
    title: 'シ (시) vs ツ (츠) · ソ (소) vs ン (응)',
    chars: ['shi', 'tsu', 'so', 'n'],
    tip: '가타카나 끝판왕! シ/ン은 옆으로 점 찍고 아래→위로 올림, ツ/ソ는 위에서 점 찍고 위→아래로 내림!'
  }
];
