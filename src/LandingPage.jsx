import React from 'react';

const features = [
  {
    icon: '🎹',
    title: '가상 피아노',
    desc: '건반을 직접 눌러 코드를 입력하거나, 추천 카드로 빠르게 선택하세요.',
  },
  {
    icon: '🎵',
    title: '장르별 추천',
    desc: 'Pop, Jazz, Rock, Blues의 전이 확률 그래프로 다음 코드를 제안합니다.',
  },
  {
    icon: '📁',
    title: '작업 저장',
    desc: '진행을 이름 붙여 저장하고, 폴더로 묶어 언제든 다시 열어보세요.',
  },
];

function LandingPage({ onEnter }) {
  return (
    <div className="landing">
      <div className="landing-inner">
        <header className="landing-header">
          <span className="landing-wordmark">ChordFlow</span>
          <button className="landing-header-btn" onClick={onEnter}>시작하기 →</button>
        </header>

        <section className="landing-hero">
          <div className="landing-eyebrow">chord progression tool</div>
          <h1 className="landing-title">
            코드 진행을<br />더 쉽게.
          </h1>
          <p className="landing-subtitle">
            장르와 키를 고르고, 피아노를 치면<br />
            다음 코드를 바로 추천해드립니다.
          </p>
          <button className="landing-cta" onClick={onEnter}>
            무료로 시작하기
          </button>
        </section>

        <section className="landing-features">
          {features.map(f => (
            <div className="landing-feat-card" key={f.title}>
              <div className="landing-feat-icon">{f.icon}</div>
              <div className="landing-feat-title">{f.title}</div>
              <div className="landing-feat-desc">{f.desc}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
