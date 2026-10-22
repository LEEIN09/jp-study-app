import React, { useState, useMemo } from 'react';
import { Compass, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { KANA_DATA } from '../data/kanaData';
import { VOCAB_DATA } from '../data/vocabData';

export default function CurriculumBar({
  studyState,
  onNavigateTab,
  onStartCustomQuiz
}) {
  const [expanded, setExpanded] = useState(false);
  const isSchool = studyState.settings.theme === 'school';

  // 7단계 관문(체크포인트) 달성도 계산 (날짜 개념 없이 내 페이스대로!)
  const checkpoints = useMemo(() => {
    const isKanaDone = (rows) => {
      const target = KANA_DATA.filter(k => rows.includes(k.row));
      const done = target.filter(k => studyState.kanaStats[k.id]?.mastered).length;
      return { done, total: target.length, cleared: done >= Math.ceil(target.length * 0.8) };
    };

    const isVocabDone = (cat) => {
      const target = VOCAB_DATA.filter(v => v.category === cat);
      const done = target.filter(v => studyState.vocabStatus[v.id] === 'mastered').length;
      return { done, total: target.length, cleared: done >= Math.ceil(target.length * 0.7) };
    };

    const c1 = isKanaDone(['a', 'ka', 'sa']);
    const c2Kana = isKanaDone(['ta', 'na']);
    const c2Vocab = isVocabDone('step1');
    const c3 = isKanaDone(['ha', 'ma', 'ya', 'ra', 'wa']);
    const c4Kana = isKanaDone(['dakuon']);
    const c4Vocab = isVocabDone('step2');
    const c5 = isVocabDone('step3');
    const c6 = isVocabDone('step4');

    return [
      {
        step: 1,
        title: '관문 1. 모음·카·사행 15글자',
        desc: '일본어 발음의 뿌리가 되는 첫 15글자 익히기',
        progressText: `${c1.done}/${c1.total}자`,
        cleared: c1.cleared,
        actionLabel: '글자 표 보기',
        onGo: () => onNavigateTab('table'),
        onPassQuiz: () => {
          const ids = KANA_DATA.filter(k => ['a', 'ka', 'sa'].includes(k.row)).map(k => k.id);
          onStartCustomQuiz(ids, '관문 1 패스 시험 (あ~さ행)');
        }
      },
      {
        step: 2,
        title: '관문 2. 타·나행 + 첫 단어 15개 읽기',
        desc: '앞부분 25글자만으로 실제 일본어 단어를 소리 내어 읽어보기',
        progressText: `단어 ${c2Vocab.done}/${c2Vocab.total}`,
        cleared: c2Kana.cleared && c2Vocab.cleared,
        actionLabel: 'Step 1 단어 읽기',
        onGo: () => onNavigateTab('vocab'),
        onPassQuiz: () => {
          const ids = KANA_DATA.filter(k => ['ta', 'na'].includes(k.row)).map(k => k.id);
          onStartCustomQuiz(ids, '관문 2 패스 시험 (た~な행)');
        }
      },
      {
        step: 3,
        title: '관문 3. 하~와행 21글자 (청음 완주)',
        desc: '나머지 21글자를 익혀 기본 오십음도 46글자 완성하기',
        progressText: `${c3.done}/${c3.total}자`,
        cleared: c3.cleared,
        actionLabel: '뒷부분 퀴즈 풀기',
        onGo: () => {
          const ids = KANA_DATA.filter(k => ['ha', 'ma', 'ya', 'ra', 'wa'].includes(k.row)).map(k => k.id);
          onStartCustomQuiz(ids, '관문 3 (は~ん 21자)');
        },
        onPassQuiz: null
      },
      {
        step: 4,
        title: '관문 4. 탁음·반탁음 & 일상 필수 단어',
        desc: '점 두 개(゛) 발음 원리와 가장 많이 쓰는 일상 어휘 익히기',
        progressText: `단어 ${c4Vocab.done}/${c4Vocab.total}`,
        cleared: c4Kana.cleared && c4Vocab.cleared,
        actionLabel: '일상 단어장 이동',
        onGo: () => onNavigateTab('vocab'),
        onPassQuiz: () => {
          const ids = KANA_DATA.filter(k => k.row === 'dakuon').map(k => k.id);
          onStartCustomQuiz(ids, '관문 4 탁음·반탁음 시험');
        }
      },
      {
        step: 5,
        title: '관문 5. 여행·편의점 가타카나 단어',
        desc: '커피·맥주·화장실·호텔 등 실전 가타카나 간판 읽기',
        progressText: `${c5.done}/${c5.total}단어`,
        cleared: c5.cleared,
        actionLabel: '가타카나 단어장',
        onGo: () => onNavigateTab('vocab'),
        onPassQuiz: null
      },
      {
        step: 6,
        title: '관문 6. 숫자·가격(¥)·특수음 함정 탈출',
        desc: '300엔·600엔·800엔 함정 발음과 작은 글자(요음·촉음) 정복',
        progressText: `위치·숫자 ${c6.done}/${c6.total}`,
        cleared: c6.cleared,
        actionLabel: '숫자·특수음 특훈',
        onGo: () => onNavigateTab('number'),
        onPassQuiz: null
      },
      {
        step: 7,
        title: isSchool ? '관문 7. 만능 패턴 & 유이 선배 상황극' : '관문 7. 만능 패턴 & 냐옹 점원 상황극',
        desc: '배운 단어를 문장에 끼워 넣고 마이크로 직접 주문해 보기!',
        progressText: '실전 회화',
        cleared: false,
        actionLabel: '스피킹·상황극 돌입',
        onGo: () => onNavigateTab('ai'),
        onPassQuiz: null
      }
    ];
  }, [studyState.kanaStats, studyState.vocabStatus, onNavigateTab, onStartCustomQuiz, isSchool]);

  // 현재 사용자 상태에 맞는 '지금 할 일 1순위' 자동 계산
  const nextRecommendation = useMemo(() => {
    const weakList = KANA_DATA.filter(k => (studyState.kanaStats[k.id]?.wrong || 0) > 0);
    if (weakList.length >= 3) {
      return {
        badge: isSchool ? '⚡ 약점 타겟 1순위' : '🐾 약점 복습 1순위',
        text: `헷갈렸던 글자 ${weakList.length}개가 남아있어요! 1분만 투자해서 먼저 격파해 볼까요?`,
        buttonText: '헷갈린 글자 복습 퀴즈',
        onClick: () => onStartCustomQuiz(weakList.map(k => k.id), `헷갈린 글자 (${weakList.length}개)`)
      };
    }

    const firstUnfinished = checkpoints.find(c => !c.cleared) || checkpoints[checkpoints.length - 1];
    return {
      badge: `🧭 맞춤 추천 · ${firstUnfinished.title.split('.')[0]}`,
      text: `${firstUnfinished.title.split('.')[1]?.trim()} — ${firstUnfinished.desc}`,
      buttonText: firstUnfinished.actionLabel,
      onClick: firstUnfinished.onGo
    };
  }, [studyState.kanaStats, checkpoints, onStartCustomQuiz, isSchool]);

  const clearedCount = checkpoints.filter(c => c.cleared).length;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4">
      <div
        className="rounded-2xl p-3.5 sm:p-4 transition-all"
        style={
          isSchool
            ? { backgroundColor: '#FFFFFF', border: '2px solid #7DD3FC', boxShadow: '0 4px 0 #BAE6FD' }
            : { backgroundColor: '#FFFDF8', border: '2px solid #D5C7B2', boxShadow: '0 3px 0 #DFD3C0' }
        }
      >
        {/* 상단 1줄: 지금 할 일 1순위 자동 브리핑 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`text-xs font-black px-2.5 py-1 flex items-center gap-1 ${isSchool ? 'rounded-md skew-badge' : 'rounded-full'}`}
              style={
                isSchool
                  ? { background: 'linear-gradient(90deg, #0284C7, #38BDF8)', color: '#FFFFFF' }
                  : { backgroundColor: '#ECFCCB', color: '#365314', border: '1.5px solid #84CC16' }
              }
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{nextRecommendation.badge}</span>
            </span>
            <span
              className="text-xs sm:text-sm font-extrabold"
              style={{ color: isSchool ? '#0F172A' : '#2D4A3E' }}
            >
              {nextRecommendation.text}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={nextRecommendation.onClick}
              className={`px-3.5 py-1.5 text-xs font-black flex items-center gap-1 cursor-pointer transition ${isSchool ? 'rounded-lg skew-badge' : 'rounded-full'}`}
              style={
                isSchool
                  ? { backgroundColor: '#F43F5E', color: '#FFFFFF', boxShadow: '0 2px 0 #BE123C' }
                  : { backgroundColor: '#F59E0B', color: '#FFFFFF', border: '1.5px solid #D97706' }
              }
            >
              <span>{nextRecommendation.buttonText}</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              className={`px-3 py-1.5 text-xs font-extrabold flex items-center gap-1 cursor-pointer transition ${isSchool ? 'rounded-lg skew-badge' : 'rounded-full'}`}
              style={
                isSchool
                  ? { backgroundColor: '#F0F9FF', color: '#0369A1', border: '1.5px solid #BAE6FD' }
                  : { backgroundColor: '#FAF6EE', color: '#5C4E41', border: '1.5px solid #C7B69E' }
              }
            >
              <span>전체 7관문 지도 ({clearedCount}/7)</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 펼쳤을 때: 날짜 부담 없는 7단계 체크포인트 코스 지도 */}
        {expanded && (
          <div
            className="mt-4 pt-4 space-y-3 animate-fadeIn"
            style={{ borderTop: isSchool ? '1.5px solid #E0F2FE' : '1.5px dashed #D5C7B2' }}
          >
            <div
              className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold"
              style={{ color: isSchool ? '#475569' : '#7D6E5D' }}
            >
              <span>
                {isSchool ? '⚡' : '🌱'} <strong>‘1일차·2일차’ 날짜 제한이 없습니다!</strong> 하루에 3관문을 깨든, 일주일에 1관문을 깨든 내 속도에 맞춰 진행하세요.
              </span>
              <span style={{ color: isSchool ? '#0284C7' : '#B45309' }}>
                이미 아는 단계는 [⚡패스시험]으로 바로 건너뛸 수 있어요!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {checkpoints.map(cp => (
                <div
                  key={cp.step}
                  className="p-3.5 rounded-2xl flex flex-col justify-between gap-2.5"
                  style={
                    cp.cleared
                      ? isSchool
                        ? { backgroundColor: '#F0F9FF', border: '2px solid #38BDF8' }
                        : { backgroundColor: '#F0FDF4', border: '2px solid #86EFAC' }
                      : isSchool
                      ? { backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1' }
                      : { backgroundColor: '#FAF6EE', border: '1.5px dashed #C7B69E' }
                  }
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-black">
                      <span
                        style={{
                          color: cp.cleared
                            ? isSchool ? '#0284C7' : '#166534'
                            : isSchool ? '#F43F5E' : '#B45309'
                        }}
                      >
                        {cp.cleared ? (isSchool ? '★ CLEAR!' : '💮 통과 완료') : `STEP 0${cp.step}`}
                      </span>
                      <span className="text-[11px] font-bold" style={{ color: isSchool ? '#64748B' : '#7D6E5D' }}>
                        {cp.progressText}
                      </span>
                    </div>
                    <div className="font-black text-xs sm:text-sm mt-1" style={{ color: isSchool ? '#0F172A' : '#2D4A3E' }}>
                      {cp.title}
                    </div>
                    <p className="text-xs font-semibold mt-0.5 leading-snug" style={{ color: isSchool ? '#475569' : '#5C4E41' }}>
                      {cp.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        cp.onGo();
                        setExpanded(false);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black cursor-pointer text-center"
                      style={
                        isSchool
                          ? { backgroundColor: '#0284C7', color: '#FFFFFF' }
                          : { backgroundColor: '#2D4A3E', color: '#FEFCE8' }
                      }
                    >
                      {cp.actionLabel}
                    </button>
                    {cp.onPassQuiz && !cp.cleared && (
                      <button
                        onClick={() => {
                          cp.onPassQuiz();
                          setExpanded(false);
                        }}
                        className="py-1.5 px-2.5 rounded-xl text-xs font-extrabold cursor-pointer"
                        style={
                          isSchool
                            ? { backgroundColor: '#FEF08A', color: '#854D0E', border: '1px solid #FACC15' }
                            : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }
                        }
                        title="이미 아는 내용이라면 바로 시험을 봐서 통과하세요"
                      >
                        ⚡패스시험
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
