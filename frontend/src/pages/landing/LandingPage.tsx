import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Landing.css';

/* 기능 카드 데이터 (StudyMate 실제 기능 기반) */
const FEATURES = [
  {
    icon: '📚',
    title: '그룹 생성/관리',
    desc: '원하는 주제로 스터디 그룹을 만들고, 정보와 멤버를 손쉽게 관리하세요.',
  },
  {
    icon: '🙋',
    title: '멤버 모집·승인',
    desc: '가입 신청을 받고 승인하며, 그룹에 꼭 맞는 멤버를 모아보세요.',
  },
  {
    icon: '🗓️',
    title: '일정 공유',
    desc: '모임 일정을 함께 보고 조율해 모두가 같은 흐름으로 움직여요.',
  },
  {
    icon: '✅',
    title: '출석 체크',
    desc: '모임 참석 여부를 기록해 꾸준함을 눈으로 확인하세요.',
  },
  {
    icon: '💬',
    title: '게시판·댓글',
    desc: '자료와 공지를 나누고 댓글로 자유롭게 소통하세요.',
  },
  {
    icon: '📝',
    title: '할일(Todo)',
    desc: '그룹 목표를 작은 할일로 쪼개 함께 하나씩 완성해요.',
  },
];

const STEPS = [
  {
    num: '01',
    title: '그룹 만들기 또는 찾기',
    desc: '관심 주제로 새 그룹을 열거나, 마음에 드는 스터디를 찾아 합류하세요.',
  },
  {
    num: '02',
    title: '멤버와 일정 맞추기',
    desc: '멤버를 모으고 모임 일정을 조율해 함께할 준비를 끝내요.',
  },
  {
    num: '03',
    title: '함께 공부하고 기록하기',
    desc: '출석과 할일, 게시판으로 매 순간의 성장을 기록하세요.',
  },
];

function LandingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false); // 히어로 진입 애니메이션 트리거
  const [scrolled, setScrolled] = useState(false);

  /* ---------- 로딩 카운터 (0 → 100, 1.5초) ---------- */
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(progress * 100));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // 100 도달 후 0.4초 뒤 페이드아웃
        window.setTimeout(() => {
          setLoading(false);
          setLoaded(true);
        }, 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- 네브바 스크롤 그림자 ---------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---------- 스크롤 등장(reveal) IntersectionObserver ---------- */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.lp-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------- 앵커 부드러운 스크롤 ---------- */
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`lp-root${loaded ? ' is-loaded' : ''}`}>
      {/* 섹션 1: 로딩 화면 */}
      <div className={`lp-loader${loading ? '' : ' is-hidden'}`}>
        <div className="lp-loader__logo accent-gradient">StudyMate</div>
        <div className="lp-loader__count">{count}</div>
        <div className="lp-loader__bar">
          <div
            className="lp-loader__bar-fill"
            style={{ transform: `scaleX(${count / 100})` }}
          />
        </div>
      </div>

      {/* 섹션 2: 네브바 */}
      <nav className={`lp-nav${scrolled ? ' is-scrolled' : ''}`}>
        <a
          className="lp-nav__logo accent-gradient"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          StudyMate
        </a>
        <div className="lp-nav__menu">
          <button className="lp-nav__link" onClick={() => scrollTo('features')}>
            기능
          </button>
          <button className="lp-nav__link" onClick={() => scrollTo('howto')}>
            사용법
          </button>
        </div>
        <Link to="/signup" className="lp-nav__cta">
          시작하기
        </Link>
      </nav>

      {/* 섹션 3: 히어로 */}
      <header className="lp-hero">
        <div className="lp-hero__inner">
          <span className="lp-eyebrow">함께 공부하면 더 멀리 갑니다</span>
          <h1 className="lp-hero__title">
            스터디, 혼자 말고{' '}
            <span className="accent-gradient">같이.</span>
          </h1>
          <p className="lp-hero__desc">
            스터디 그룹을 만들고, 멤버를 모으고, 일정과 할일을 한 곳에서
            관리하세요.
          </p>
          <div className="lp-hero__actions">
            {!user && (
              <Link to="/signup" className="lp-btn lp-btn--primary">
                회원가입하기
              </Link>
            )}
            <Link to="/groups" className="lp-btn lp-btn--ghost">
              둘러보기
            </Link>
          </div>
        </div>

        {/* 서비스 UI 미리보기 목업 (float) */}
        <div className="lp-hero__preview">
          <div className="lp-mock">
            <div className="lp-mock__bar">
              <span className="lp-mock__dot" />
              <span className="lp-mock__dot" />
              <span className="lp-mock__dot" />
              <span className="lp-mock__tab">StudyMate · 내 스터디</span>
            </div>
            <div className="lp-mock__body">
              <div className="lp-mock__card">
                <h4>알고리즘 스터디</h4>
                <p>이번 주 진행률 72%</p>
                <div className="lp-mock__progress">
                  <span style={{ width: '72%' }} />
                </div>
              </div>
              <div className="lp-mock__card">
                <h4>다가오는 일정</h4>
                <p>토 14:00 · 정기 모임</p>
                <div className="lp-mock__chips">
                  <span className="lp-mock__chip">출석 6</span>
                  <span className="lp-mock__chip">할일 4</span>
                </div>
              </div>
              <div className="lp-mock__card">
                <h4>새 게시글</h4>
                <p>자료 공유 · 댓글 3</p>
                <div className="lp-mock__chips">
                  <span className="lp-mock__chip">공지</span>
                  <span className="lp-mock__chip">자료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 섹션 4: 기능 소개 */}
      <section id="features" className="lp-section lp-features">
        <div className="lp-container">
          <div className="lp-head lp-reveal">
            <span className="lp-head__eyebrow">기능</span>
            <h2 className="lp-head__title">필요한 건 다 있어요</h2>
            <p className="lp-head__sub">
              스터디를 시작하고 끝까지 이어가는 데 필요한 도구를 한 곳에 모았어요.
            </p>
          </div>
          <div className="lp-feature-grid">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className="lp-feature lp-reveal"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="lp-feature__icon">{f.icon}</div>
                <h3 className="lp-feature__title">{f.title}</h3>
                <p className="lp-feature__desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 섹션 5: 사용 방법 */}
      <section id="howto" className="lp-section lp-howto">
        <div className="lp-container">
          <div className="lp-head lp-reveal">
            <span className="lp-head__eyebrow">사용법</span>
            <h2 className="lp-head__title">3단계면 충분해요</h2>
            <p className="lp-head__sub">
              복잡한 설정 없이, 세 단계만 거치면 바로 함께 공부할 수 있어요.
            </p>
          </div>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="lp-step lp-reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <span className="lp-step__num accent-gradient">{s.num}</span>
                <h3 className="lp-step__title">{s.title}</h3>
                <p className="lp-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 섹션 7: 최종 CTA */}
      <section className="lp-cta">
        <div className="lp-cta__band lp-reveal">
          <h2 className="lp-cta__title">지금 바로 스터디를 시작하세요.</h2>
          {user ? (
            <Link to="/groups" className="lp-cta__btn">
              스터디 둘러보기
            </Link>
          ) : (
            <Link to="/signup" className="lp-cta__btn">
              회원가입하기
            </Link>
          )}
        </div>
      </section>

      {/* 섹션 8: 푸터 */}
      <footer className="lp-footer">
        <div className="lp-footer__top">
          <div className="lp-footer__brand">
            <div className="lp-footer__logo accent-gradient">StudyMate</div>
            <p className="lp-footer__tagline">
              혼자보다 같이. 스터디 그룹을 만들고 함께 성장하는 가장 쉬운 방법.
            </p>
          </div>
          <div className="lp-footer__links">
            <div className="lp-footer__col">
              <h5>둘러보기</h5>
              <a onClick={() => scrollTo('features')}>기능</a>
              <a onClick={() => scrollTo('howto')}>사용법</a>
            </div>
            <div className="lp-footer__col">
              <h5>바로가기</h5>
              <Link to="/groups">스터디 그룹</Link>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </div>
          </div>
        </div>
        <div className="lp-footer__bottom">
          <span>© 2026 StudyMate. All rights reserved.</span>
          <span className="lp-footer__status">서비스 운영 중</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
