// 브라우저 내장 무료 음성 인식 (Web Speech API - SpeechRecognition) 유틸리티

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startJapaneseSpeechRecognition({ onResult, onError, onEnd }) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError('현재 브라우저에서는 음성 인식을 지원하지 않습니다. (크롬, 엣지, 사파리 권장)');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    const transcripts = [];
    for (let i = 0; i < event.results[0].length; i++) {
      transcripts.push(event.results[0][i].transcript.trim());
    }
    if (onResult) onResult(transcripts[0] || '', transcripts);
  };

  recognition.onerror = (event) => {
    if (onError) {
      if (event.error === 'not-allowed') {
        onError('마이크 권한이 차단되어 있어요! 주소창 옆 마이크 권한을 허용해 주세요.');
      } else if (event.error === 'no-speech') {
        onError('목소리가 들리지 않았어요. 마이크에 대고 다시 말씀해 보세요!');
      } else {
        onError(`음성 인식 오류: ${event.error}`);
      }
    }
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    if (onError) onError('음성 인식을 시작할 수 없습니다.');
    return null;
  }
}

// 음성 인식 결과(한자 변환 포함)가 목표 일본어 단어/문장과 일치하는지 유연하게 판정
export function checkSpeechMatch(transcripts, targetKana, targetKanji = '') {
  const clean = (str) =>
    (str || '')
      .replace(/[。、！？!?\s.,~ー-]/g, '')
      .trim();

  const expectedKana = clean(targetKana);
  const expectedKanji = clean(targetKanji);

  // 자주 한자로 변환되는 기본 어휘 매핑 보정
  const kanjiToKanaMap = {
    '水': 'みず',
    'お水': 'おみず',
    '猫': 'ねこ',
    '犬': 'いぬ',
    '寿司': 'すし',
    '駅': 'えき',
    '傘': 'かさ',
    '肉': 'にく',
    '魚': 'さかな',
    'ご飯': 'ごはん',
    '食べる': 'たべる',
    '飲む': 'のむ',
    '行く': 'いく',
    '見る': 'みる',
    '美味しい': 'おいしい',
    '高い': 'たかい',
    '安い': 'やすい',
    '私': 'わたし',
    '友達': 'ともだち',
    '日本': 'にほん',
    '韓国': 'かんこく',
    '今日': 'きょう',
    '明日': 'あした',
    '昨日': 'きのう',
    '一人': 'ひとり',
    '二人': 'ふたり',
    '一つ': 'ひとつ',
    '二つ': 'ふたつ',
    '三百円': 'さんびゃくえん',
    '六百円': 'ろっぴゃくえん',
    '八百円': 'はっぴゃくえん',
    'ください': 'ください',
    '下さい': 'ください',
    'どこですか': 'どこですか',
    'いくらですか': 'いくらですか',
    'すみません': 'すみません',
    'ありがとうございます': 'ありがとうございます',
    '大丈夫です': 'だいじょうぶです',
    'お願いします': 'おねがいします'
  };

  for (const raw of transcripts) {
    let norm = clean(raw);
    if (!norm) continue;

    if (norm === expectedKana || (expectedKanji && norm === expectedKanji)) {
      return true;
    }

    // 문장 내 한자 치환 후 비교
    let converted = norm;
    Object.entries(kanjiToKanaMap).forEach(([k, v]) => {
      converted = converted.replaceAll(k, v);
    });

    if (
      converted === expectedKana ||
      converted.includes(expectedKana) ||
      expectedKana.includes(converted)
    ) {
      return true;
    }
  }

  return false;
}
