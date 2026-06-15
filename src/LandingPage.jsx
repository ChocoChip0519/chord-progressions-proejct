import React, { useEffect, useState, useCallback } from 'react';

const steps = [
  {
    num: 1,
    title: '장르와 키를 설정하세요',
    desc: <>Pop, Jazz, Rock, Blues 중 장르를 고르고 키와 BPM을 설정합니다.<br />키를 모르면 비워둬도 자동으로 추론해 드려요.</>,
  },
  {
    num: 2,
    title: '피아노로 코드를 눌러보세요',
    desc: <>가상 피아노에서 음을 직접 누르거나, 코드 모드에서 루트음만 눌러도 코드가 완성됩니다.<br />Space로 진행에 추가하세요.</>,
  },
  {
    num: 3,
    title: '다음 코드를 추천받으세요',
    desc: <>입력한 진행을 분석해 어울리는 코드 4개를 자동 추천합니다.<br />추천 카드를 클릭하면 바로 미리 들어볼 수 있어요.</>,
  },
  {
    num: 4,
    title: '완성된 진행을 저장하세요',
    desc: 'Ctrl+S 또는 저장 버튼으로 프로젝트에 저장합니다. 대시보드에서 언제든 불러올 수 있어요.',
  },
];

const features = [
  {
    icon: '🎹',
    title: '가상 피아노',
    desc: '건반을 직접 눌러 코드를 입력하거나, 추천 카드로 빠르게 선택하세요.',
    tooltip: '키보드 단축키로도 연주할 수 있어요',
  },
  {
    icon: '🎵',
    title: '장르별 추천',
    desc: 'Pop, Jazz, Rock, Blues의 전이 확률 그래프로 다음 코드를 제안합니다.',
    tooltip: '전이 확률 그래프 기반 · 4개 장르 지원',
  },
  {
    icon: '📁',
    title: '작업 저장',
    desc: '진행을 이름 붙여 저장하고, 폴더로 묶어 언제든 다시 열어보세요.',
    tooltip: '폴더로 분류 · 브라우저에 자동 저장',
  },
];

function LandingPage({ onEnter }) {
  const [videoOpen, setVideoOpen] = useState(false);

  const closeVideo = useCallback(() => setVideoOpen(false), []);

  useEffect(() => {
    if (!videoOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeVideo(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [videoOpen, closeVideo]);

  useEffect(() => {
    const els = document.querySelectorAll('.landing-step');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      <div className="landing-inner">
        <header className="landing-header">
          <span className="landing-wordmark">ChordFlow</span>
        </header>

        <section className="landing-hero">
          <div className="landing-hero-text">
            <div className="landing-eyebrow">chord progression tool</div>
            <h1 className="landing-title">
              코드 진행을<br />더 쉽게.
            </h1>
            <p className="landing-subtitle">
              장르와 키를 고르고, 피아노를 치면<br />
              다음 코드를 바로 추천해드립니다.
            </p>
            <button className="landing-cta" onClick={onEnter}>
              시작하기
            </button>
          </div>
          <div className="landing-hero-visual">
            <div className="landing-video-thumb" onClick={() => setVideoOpen(true)}>
              <video
                className="landing-demo-video"
                src="/demo.mov"
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="landing-video-play">
                <div>
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                    <polygon points="5,3 17,10 5,17" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features">
          {features.map(f => (
            <div className="landing-feat-card" key={f.title} data-tooltip={f.tooltip}>
              <div className="landing-feat-icon">{f.icon}</div>
              <div className="landing-feat-title">{f.title}</div>
              <div className="landing-feat-desc">{f.desc}</div>
            </div>
          ))}
        </section>

        <section className="landing-tutorial">
          <p className="landing-tutorial-label">how it works</p>
          <h2 className="landing-tutorial-title">이렇게 사용해요</h2>
          <div className="landing-steps">
            {steps.map((s, i) => (
              <div className="landing-step" key={s.num} style={{ transitionDelay: `${i * 0.13}s` }}>
                <div className="landing-step-left">
                  <div className="landing-step-num">{s.num}</div>
                  {i < steps.length - 1 && <div className="landing-step-line" />}
                </div>
                <div className="landing-step-body">
                  <div className="landing-step-title">{s.title}</div>
                  <div className="landing-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {videoOpen && (
        <div className="video-modal-backdrop" onClick={closeVideo}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="video-modal-close" onClick={closeVideo}>✕</button>
            <video
              className="video-modal-player"
              src="/demo.mov"
              autoPlay
              loop
              muted
              playsInline
              controls
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
