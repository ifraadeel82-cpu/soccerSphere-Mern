import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  const [wcMatches, setWcMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [visibleCards, setVisibleCards] = useState([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const [countedStats, setCountedStats] = useState({
    matches: 0,
    teams: 0,
    fans: 0,
    venues: 0,
  });

  // PALETTE (from your spec)
  const C = {
    primaryBg: '#520E0D',
    mainAccent: '#A31400',
    secondaryAccent: '#B46E5A',
    darkNavy: '#141B2B',
    cta: '#08679D',
    ctaHover: '#0083B4',
    lightText: '#B0AEAF',
    mainText: '#FFFFFF',
  };

  // Fetch data
  useEffect(() => {
    axios
      .get('/api/worldcup/matches/upcoming')
      .then(r => setWcMatches(r.data.slice(0, 3)))
      .catch(() => {});
    axios
      .get('/api/worldcup/players/top-scorers')
      .then(r => setTopScorers(r.data.slice(0, 5)))
      .catch(() => {});
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handleMouse = e => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Scroll + stats trigger
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (statsRef.current && !statsVisible) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          setStatsVisible(true);
          animateCounters();
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsVisible]);

  // IntersectionObserver for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-reveal-idx') || '0', 10);
            setTimeout(() => {
              setVisibleCards(prev => {
                if (prev.includes(idx)) return prev;
                return [...prev, idx];
              });
            }, (idx % 10) * 80);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal-card').forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [wcMatches, topScorers]);

  // Counters
  const animateCounters = () => {
    const targets = { matches: 48, teams: 32, fans: 5000000, venues: 16 };
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCountedStats({
        matches: Math.floor(targets.matches * ease),
        teams: Math.floor(targets.teams * ease),
        fans: Math.floor(targets.fans * ease),
        venues: Math.floor(targets.venues * ease),
      });
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
  };

  // Canvas: stadium light rays / subtle particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,
      r: Math.random() * 2 + 0.6,
      baseAlpha: Math.random() * 0.6 + 0.2,
      alpha: 0,
      speed: Math.random() * 0.015 + 0.005,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#FFFFFF' : '#B0AEAF',
    }));

    let animId;
    let t = 0;

    const animate = () => {
      t += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // angled light beams like stadium lights
      const beamGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height * 0.6);
      beamGradient.addColorStop(0, 'rgba(255,255,255,0.06)');
      beamGradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = beamGradient;
      ctx.save();
      ctx.translate(canvas.width * 0.1, -canvas.height * 0.1);
      ctx.rotate(-0.2);
      ctx.fillRect(0, 0, canvas.width * 0.6, canvas.height * 0.7);
      ctx.restore();

      ctx.save();
      ctx.translate(canvas.width * 0.7, -canvas.height * 0.15);
      ctx.rotate(0.2);
      ctx.fillRect(0, 0, canvas.width * 0.6, canvas.height * 0.7);
      ctx.restore();

      // particles as crowd glints
      particles.forEach(p => {
        p.alpha = p.baseAlpha * (0.5 + 0.5 * Math.sin(t * p.speed * 60 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    const resize = () => setSize();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const fmt = d =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const features = [
    {
      icon: '◇',
      title: 'Matchday Hub',
      desc: 'Fixtures, live scores, tables and form in one FC-style grid.',
    },
    {
      icon: '⇄',
      title: 'Transfer Center',
      desc: 'Track ins, outs and rumors with dynamic arrows and tags.',
    },
    {
      icon: '▽',
      title: 'Tactics Board',
      desc: 'Draw out shapes, lines and roles like a real manager.',
    },
    {
      icon: '◎',
      title: 'Squad Radar',
      desc: 'View player roles, chemistry and fatigue with glanceable UI.',
    },
    {
      icon: '★',
      title: 'Star Tracker',
      desc: 'Top scorers, assists and xG leaders updated in real-time.',
    },
    {
      icon: '⚙',
      title: 'Dual Portal',
      desc: 'Fans book, admins manage – one codebase, two experiences.',
    },
  ];

  return (
    <div
      style={{
        background: `radial-gradient(circle at 0% 0%, #A31400 0%, #520E0D 35%, #141B2B 100%)`,
        minHeight: '100vh',
        overflowX: 'hidden',
        color: C.mainText,
      }}
    >
      {/* CANVAS: lights */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.9,
        }}
      />

      {/* NAV */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          height: 70,
          background: 'rgba(20,27,43,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: `linear-gradient(135deg,${C.mainAccent},${C.secondaryAccent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              boxShadow: '0 0 18px rgba(0,0,0,0.6)',
            }}
          >
            ⚽
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: 20 }}>
              Soccer
              <span
                style={{
                  color: C.mainAccent,
                  marginLeft: 4,
                }}
              >
                Sphere
              </span>
            </span>
            <span
              style={{
                fontSize: 11,
                color: C.lightText,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              World Cup 2026 · Match Control
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: C.lightText }}>Fan · Admin · Staff</span>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              border: `1px solid rgba(255,255,255,0.18)`,
              color: C.lightText,
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: C.cta,
              border: 'none',
              color: '#FFFFFF',
              padding: '9px 22px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              boxShadow: '0 10px 26px rgba(0,0,0,0.7)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = C.ctaHover;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = C.cta;
            }}
          >
            Get Access
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1.1fr)',
          alignItems: 'center',
          paddingTop: 90,
          paddingInline: 40,
          gap: 20,
        }}
      >
        {/* Pitch background layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            overflow: 'hidden',
            opacity: 0.65,
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1400 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#520E0D" />
                <stop offset="50%" stopColor="#141B2B" />
                <stop offset="100%" stopColor="#02040A" />
              </linearGradient>
            </defs>
            <rect width="1400" height="800" fill="url(#heroGrad)" />

            {/* stadium tiers */}
            <path d="M0,260 Q700,140 1400,260" fill="none" stroke="#3C1720" strokeWidth="2" />
            <path d="M0,300 Q700,175 1400,300" fill="none" stroke="#30101A" strokeWidth="1.4" />
            <path d="M0,340 Q700,210 1400,340" fill="none" stroke="#230B13" strokeWidth="1" />

            {/* pitch rectangle */}
            <rect x="200" y="480" width="1000" height="240" fill="#071219" />
            {/* stripes */}
            {Array.from({ length: 7 }).map((_, i) => (
              <rect
                key={i}
                x={200 + i * (1000 / 7)}
                y="480"
                width={1000 / 14}
                height="240"
                fill={i % 2 === 0 ? '#071B24' : '#091F2A'}
                opacity="0.85"
              />
            ))}
            {/* center line */}
            <line x1="700" y1="480" x2="700" y2="720" stroke="#2A3C4E" strokeWidth="2.2" />
            {/* circle */}
            <ellipse
              cx="700"
              cy="600"
              rx="130"
              ry="55"
              fill="none"
              stroke="#2A3C4E"
              strokeWidth="2"
            />
            {/* penalty boxes */}
            <rect
              x="200"
              y="520"
              width="200"
              height="120"
              fill="none"
              stroke="#2A3C4E"
              strokeWidth="1.5"
            />
            <rect
              x="1000"
              y="520"
              width="200"
              height="120"
              fill="none"
              stroke="#2A3C4E"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* glowing circles + formation lines (top of hero) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {/* soft glowing circles */}
          <div
            style={{
              position: 'absolute',
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 65%)',
              top: `${20 + mousePos.y * 10}%`,
              left: `${12 + mousePos.x * 10}%`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(8,103,157,0.36), transparent 70%)',
              top: '16%',
              right: '18%',
            }}
          />

          {/* tactical lines */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1400 800"
            style={{ position: 'absolute', inset: 0 }}
          >
            <polyline
              points="260,500 360,430 540,410"
              fill="none"
              stroke="rgba(176,174,175,0.7)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            <polyline
              points="1160,500 1040,430 860,410"
              fill="none"
              stroke="rgba(176,174,175,0.7)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            {/* small nodes */}
            {[{ x: 360, y: 430 }, { x: 540, y: 410 }, { x: 1040, y: 430 }, { x: 860, y: 410 }].map(
              (n, idx) => (
                <circle
                  key={idx}
                  cx={n.x}
                  cy={n.y}
                  r="4"
                  fill="#FFFFFF"
                  opacity="0.8"
                />
              )
            )}
          </svg>
        </div>

        {/* LEFT: Text hero */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            maxWidth: 540,
            paddingRight: 16,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              padding: '5px 12px',
              background: 'rgba(20,27,43,0.8)',
              border: '1px solid rgba(255,255,255,0.14)',
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#00FF70',
                boxShadow: '0 0 8px #00FF70',
              }}
            />
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: C.lightText,
              }}
            >
              WORLD CUP 2026 LIVE DASHBOARD
            </span>
          </div>

          <h1
  style={{
    fontSize: 'clamp(40px,5.6vw,68px)',
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: '-0.06em',
    marginBottom: 10,
  }}
>
  Own the{' '}
  <span
    style={{
      color: C.mainAccent,
    }}
  >
    World Cup
  </span>{' '}
  from your dashboard.
</h1>

          <p
            style={{
              fontSize: 15,
              color: C.lightText,
              lineHeight: 1.8,
              marginBottom: 24,
            }}
          >
            SoccerSphere turns fixtures, transfers and tactics into a clean, FC‑style
            interface. Switch between fan bookings and admin tools without leaving the
            pitch.
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 26, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: C.cta,
                border: 'none',
                color: '#FFFFFF',
                padding: '13px 28px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                boxShadow: '0 10px 26px rgba(0,0,0,0.7)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = C.ctaHover;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = C.cta;
              }}
            >
              Open Match Hub
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'rgba(20,27,43,0.9)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: C.lightText,
                padding: '12px 24px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Admin Console</span>
              <span style={{ fontSize: 16 }}>↗</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.mainAccent }}>+48</div>
              <div
                style={{
                  fontSize: 11,
                  color: C.lightText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                }}
              >
                matches synced
              </div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#00FF70' }}>+32</div>
              <div
                style={{
                  fontSize: 11,
                  color: C.lightText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                }}
              >
                teams onboarded
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: EA FC style hero widgets */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 460,
              height: 360,
            }}
          >
            {/* background frame */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 24,
                background: 'rgba(20,27,43,0.92)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 28px 40px rgba(0,0,0,0.7)',
              }}
            />

            {/* pitch mini overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 18,
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.08)',
                background:
                  'radial-gradient(circle at 20% 0%, rgba(178,110,90,0.18), transparent 55%), #0C1520',
              }}
            />

            {/* tactical mini pitch lines */}
            <svg
              viewBox="0 0 420 320"
              style={{
                position: 'absolute',
                inset: 18,
                borderRadius: 20,
              }}
            >
              <rect
                x="40"
                y="60"
                width="340"
                height="200"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                rx="18"
              />
              {/* center line */}
              <line
                x1="210"
                y1="60"
                x2="210"
                y2="260"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              {/* circle */}
              <circle
                cx="210"
                cy="160"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />

              {/* formation dots */}
              {[{ x: 110, y: 110 }, { x: 180, y: 90 }, { x: 240, y: 90 }, { x: 310, y: 110 }].map(
                (p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="10"
                      fill="rgba(8,103,157,0.2)"
                      stroke="#08679D"
                      strokeWidth="1.2"
                    />
                    <text
                      x={p.x}
                      y={p.y + 3}
                      fontSize="7"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont' }}
                    >
                      CAM
                    </text>
                  </g>
                )
              )}

              {/* arrow run */}
              <polyline
                points="140,210 180,180 240,150 280,130"
                fill="none"
                stroke="#A31400"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon points="280,130 274,141 286,138" fill="#A31400" />
            </svg>

            {/* floating player card 1 */}
            <div
              style={{
                position: 'absolute',
                top: 26,
                left: -24,
                width: 155,
                borderRadius: 18,
                padding: 12,
                background: 'linear-gradient(145deg,#141B2B,#520E0D)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800 }}>91</span>
                <span style={{ fontSize: 10, color: C.lightText }}>ST</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Elite Striker</div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 10,
                  color: C.lightText,
                }}
              >
                <span>Pace 94</span>
                <span>Shot 93</span>
              </div>
            </div>

            {/* floating player card 2 */}
            <div
              style={{
                position: 'absolute',
                bottom: 26,
                right: -18,
                width: 155,
                borderRadius: 18,
                padding: 12,
                background: 'linear-gradient(145deg,#141B2B,#B46E5A)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800 }}>88</span>
                <span style={{ fontSize: 10, color: C.lightText }}>CM</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Engine Midfield</div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 10,
                  color: C.lightText,
                }}
              >
                <span>Pass 90</span>
                <span>Def 84</span>
              </div>
            </div>

            {/* transfer arrows chip */}
            <div
              style={{
                position: 'absolute',
                top: '45%',
                right: '50%',
                transform: 'translateX(50%)',
                padding: '6px 10px',
                borderRadius: 999,
                background: 'rgba(20,27,43,0.9)',
                border: '1px solid rgba(255,255,255,0.24)',
                fontSize: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ color: '#00FF70', fontSize: 12 }}>⇄</span>
              <span style={{ color: C.lightText }}>Transfer Window Open</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div
        ref={statsRef}
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(20,27,43,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '20px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
          }}
        >
          {[
            { num: countedStats.matches, suffix: '', label: 'Matches' },
            { num: countedStats.teams, suffix: '', label: 'Nations' },
            {
              num:
                countedStats.fans > 1000000
                  ? (countedStats.fans / 1000000).toFixed(1)
                  : countedStats.fans,
              suffix: countedStats.fans >= 1000000 ? 'M+' : '+',
              label: 'Fans',
            },
            { num: countedStats.venues, suffix: '', label: 'Venues' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                paddingInline: 16,
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: i === 2 ? '#00FF70' : C.mainAccent,
                  letterSpacing: '-0.04em',
                }}
              >
                {s.num}
                {s.suffix}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.lightText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  marginTop: 3,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPCOMING MATCHES */}
      {wcMatches.length > 0 && (
        <section
          style={{
            padding: '60px 40px 30px',
            maxWidth: 1100,
            margin: '0 auto',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div
                style={{
                  width: 4,
                  height: 24,
                  borderRadius: 999,
                  background: `linear-gradient(180deg,${C.mainAccent},${C.cta})`,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: C.mainAccent,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  fontWeight: 700,
                }}
              >
                Next fixtures
              </span>
            </div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: '-0.03em',
              }}
            >
              Upcoming World Cup 2026
            </h2>
            <p style={{ color: C.lightText, fontSize: 13, marginTop: 4 }}>
              Designed like a game menu, wired to your real data.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
              gap: 18,
            }}
          >
            {wcMatches.map((m, idx) => (
              <div
                key={m._id || idx}
                data-reveal-idx={idx}
                className="reveal-card"
                style={{
                  background: 'rgba(20,27,43,0.96)',
                  borderRadius: 18,
                  border: '1px solid rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                  transform: visibleCards.includes(idx)
                    ? 'translateY(0) scale(1)'
                    : 'translateY(30px) scale(0.97)',
                  opacity: visibleCards.includes(idx) ? 1 : 0,
                  transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    height: 3,
                    background: `linear-gradient(90deg,${C.mainAccent},${C.cta})`,
                  }}
                />
                <div style={{ padding: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        background: 'rgba(82,14,13,0.65)',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      World Cup · 2026
                    </span>
                    <span style={{ fontSize: 11, color: C.lightText }}>{fmt(m.matchDate)}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>🏳️</div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>
                        {m.homeTeam?.name || 'Home'}
                      </div>
                      <div style={{ fontSize: 11, color: C.lightText }}>
                        {m.homeTeam?.country || 'Country'}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.lightText,
                        paddingInline: 10,
                        textTransform: 'uppercase',
                      }}
                    >
                      vs
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>🏳️</div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>
                        {m.awayTeam?.name || 'Away'}
                      </div>
                      <div style={{ fontSize: 11, color: C.lightText }}>
                        {m.awayTeam?.country || 'Country'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 11,
                      color: C.lightText,
                    }}
                  >
                    <span>{m.venue?.name || 'World Cup Stadium'}</span>
                    <span style={{ color: '#00FF70', fontWeight: 600 }}>Tickets active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FEATURES GRID */}
      <section
        style={{
          padding: '30px 40px 80px',
          maxWidth: 1100,
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 4,
                height: 24,
                borderRadius: 999,
                background: `linear-gradient(180deg,${C.cta},${C.mainAccent})`,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: C.cta,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                fontWeight: 700,
              }}
            >
              Built like a game
            </span>
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: '-0.03em',
            }}
          >
            A football OS that feels like EA FC, not a spreadsheet.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
            gap: 18,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(20,27,43,0.96)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.12)',
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    background: 'rgba(176,174,175,0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  {f.icon}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{f.title}</span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: C.lightText,
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;