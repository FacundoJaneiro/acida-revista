'use client';

import { useEffect, useRef, useState } from 'react';

const BASE = '';

/* ─── DATA ─── */
const REVISTAS = [
  {
    id: 1,
    titulo: 'Vómito',
    subtitulo: 'Primera edición',
    fecha: 'Septiembre 2025',
    images: { mobile: { basePath: `${BASE}/revistas/vomito`, count: 27 } },
    disponible: true,
    tilt: 'card-tilt-neg',
  },
  {
    id: 2,
    titulo: 'Exprés N°1',
    subtitulo: 'Todo lo que alguien quiso eliminar alguna vez',
    fecha: 'Diciembre 2025',
    images: { mobile: { basePath: `${BASE}/revistas/expres1`, count: 17 } },
    disponible: true,
    tilt: 'card-tilt-pos',
  },
  {
    id: 3,
    titulo: 'El dedo en la llaga',
    subtitulo: 'Segunda edición',
    fecha: 'Marzo 2026',
    images: {
      mobile: { basePath: `${BASE}/revistas/dedo-mobile`, count: 48 },
      desktop: { basePath: `${BASE}/revistas/dedo-desktop`, count: 24 },
    },
    disponible: true,
    releaseDate: new Date('2026-03-21T03:00:00Z'),
    tilt: 'card-tilt-neg',
  },
  {
    id: 4,
    titulo: 'Exprés N°2',
    subtitulo: '¿Dónde estamos en el mundo de los píxeles?',
    fecha: 'Junio 2026',
    images: { mobile: { basePath: `${BASE}/revistas/expres-n2`, count: 24 } },
    disponible: true,
    tilt: 'card-tilt-pos',
  },
  {
    id: 5,
    titulo: 'La calle',
    subtitulo: 'Tercera edición',
    fecha: 'Agosto 2026',
    images: {
      mobile: { basePath: `${BASE}/revistas/lacalle-mobile`, count: 36 },
      desktop: { basePath: `${BASE}/revistas/lacalle-desktop`, count: 22 },
    },
    disponible: true,
    releaseDate: new Date('2026-08-19T23:00:00Z'),
    isNew: true,
    tilt: 'card-tilt-neg',
  },
];

const PROXIMAS = [
  {
    id: 6,
    subtitulo: 'Próxima edición',
    titulo: '???',
    tilt: 'card-tilt-pos',
  },
];

const titleClass = (titulo) =>
  `card-title ${titulo.length >= 17 ? 'card-title--long' : 'card-title--medium'}`;

const MARQUEE_A = ['ÁCIDA', 'SOSTENER LA PALABRA', 'ESCRITURA COLECTIVA', 'BUENOS AIRES', 'URGENCIA', 'APUESTA', 'RIESGO'];
const MARQUEE_B = ['VÓMITO', 'PRIMERA EDICIÓN', 'SEPTIEMBRE 2025', 'ENSAYO', 'CRÓNICA', 'POESÍA', 'DIÁLOGO'];

/* ─── STARBURST SVG ─── */
function Starburst({ className, count = 40, len = 150 }) {
  const lines = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const rad = (angle * Math.PI) / 180;
    return (
      <line
        key={i}
        x1="0"
        y1="0"
        x2={parseFloat((Math.cos(rad) * len).toFixed(4))}
        y2={parseFloat((Math.sin(rad) * len).toFixed(4))}
        stroke="currentColor"
        strokeWidth="0.5"
      />
    );
  });
  return (
    <svg
      className={className}
      viewBox="-75 -75 150 150"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {lines}
    </svg>
  );
}

/* ─── MARQUEE ─── */
function Marquee({ items, reverse = false, variant = 'dark' }) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee marquee--${variant}${reverse ? ' marquee--reverse' : ''}`}>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── IMAGE VIEWER (edición como imágenes, no PDF) ─── */
function ImageViewer({ revista, onClose }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const usingDesktop = !isMobile && !!revista.images.desktop;
  const { basePath, count } = usingDesktop ? revista.images.desktop : revista.images.mobile;
  const scrollRef = useRef(null);
  const pageRefs = useRef([]);
  const [current, setCurrent] = useState(1);

  const [flip, setFlip] = useState(null); // { target, direction } | null
  const [flipActive, setFlipActive] = useState(false);

  const startFlip = (direction) => {
    if (flip) return;
    const target = direction === 'next' ? current + 1 : current - 1;
    if (target < 1 || target > count) return;
    setFlip({ target, direction });
  };
  const goPrev = () => startFlip('prev');
  const goNext = () => startFlip('next');

  useEffect(() => {
    if (!flip) { setFlipActive(false); return; }
    const raf = requestAnimationFrame(() => setFlipActive(true));
    return () => cancelAnimationFrame(raf);
  }, [flip]);

  const finishFlip = () => {
    if (!flip) return;
    setCurrent(flip.target);
    setFlip(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (!isMobile && e.key === 'ArrowLeft') goPrev();
      if (!isMobile && e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, isMobile, count, flip, current]);

  useEffect(() => {
    if (!isMobile) return;
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setCurrent(Number(visible.target.dataset.page));
        }
      },
      { root, threshold: 0.5 }
    );
    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count, isMobile]);

  const pages = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{revista.titulo} <em>{revista.subtitulo}</em></span>
          <div className="modal-header-right">
            <span className="viewer-counter">{current} / {count}</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {isMobile ? (
          <div className="viewer-scroll" ref={scrollRef}>
            {pages.map((n) => (
              <div
                className="viewer-page"
                key={n}
                data-page={n}
                ref={(el) => { pageRefs.current[n - 1] = el; }}
              >
                <img
                  src={`${basePath}/page-${String(n).padStart(2, '0')}.webp`}
                  alt={`${revista.titulo} — página ${n}`}
                  loading={n <= 2 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`viewer-scroll viewer-scroll--paged${usingDesktop ? ' viewer-scroll--wide' : ''}`}>
            <div
              className="viewer-flip-stage"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                (e.clientX - rect.left < rect.width / 2) ? goPrev() : goNext();
              }}
            >
              <div className="viewer-flip-page viewer-flip-page--base">
                <img
                  src={`${basePath}/page-${String(flip ? flip.target : current).padStart(2, '0')}.webp`}
                  alt={`${revista.titulo} — página ${flip ? flip.target : current}`}
                  draggable={false}
                />
              </div>
              {flip && (
                <div
                  className={`viewer-flip-page viewer-flip-page--overlay viewer-flip-page--${flip.direction}${flipActive ? ' is-active' : ''}`}
                  onTransitionEnd={finishFlip}
                >
                  <img
                    src={`${basePath}/page-${String(current).padStart(2, '0')}.webp`}
                    alt={`${revista.titulo} — página ${current}`}
                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── COUNTDOWN CARD ─── */
function CountdownCard({ revista, index, onOpen }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = revista.releaseDate - new Date();
      if (diff <= 0) { setExpired(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [revista.releaseDate]);

  if (expired) return (
    <div className={revista.tilt}>
      <div
        className="revista-card reveal"
        style={{ transitionDelay: `${index * 0.12}s` }}
        onClick={() => onOpen(revista)}
      >
        <div className="card-edition">{revista.subtitulo}</div>
        <div className={titleClass(revista.titulo)}>{revista.titulo}</div>
        <div className="card-fecha">{revista.fecha}</div>
        <div className="card-cta">Leer →</div>
      </div>
    </div>
  );

  return (
    <div className={revista.tilt}>
      <div className="revista-card revista-card--countdown reveal" style={{ transitionDelay: `${index * 0.12}s` }}>
        <div className="card-edition">{revista.subtitulo}</div>
        <div className={titleClass(revista.titulo)}>{revista.titulo}</div>
        <div className="card-pronto" style={{ color: 'rgba(255,248,236,0.6)' }}>Próximamente</div>
        <div className="card-countdown">
          {timeLeft ? `${timeLeft.h}:${timeLeft.m}:${timeLeft.s}` : '--:--:--'}
        </div>
        <div className="card-fecha">{revista.fecha}</div>
      </div>
    </div>
  );
}

/* ─── PAGE ─── */
export default function Home() {
  const navRef = useRef(null);
  const heroRef = useRef(null);
  const [modalRevista, setModalRevista] = useState(null);

  const handleRevista = (r) => {
    setModalRevista(r);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    /* Scroll reveal */
    const els = document.querySelectorAll('.reveal, .reveal-left');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));

    /* Nav style on scroll */
    const onScroll = () => {
      navRef.current?.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Mouse parallax on floating words */
    const onMouseMove = (e) => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      hero.querySelectorAll('.float-wrap').forEach((el) => {
        const depth = parseFloat(el.dataset.depth || '1');
        el.style.transform = `translate(${nx * depth * 28}px, ${ny * depth * 20}px)`;
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <>
      {/* ═══ NAV ═══ */}
      <nav ref={navRef} className="nav">
        <a href="#inicio" className="nav-logo">
          <img src={`${BASE}/navbar.png`} alt="ÁCIDA" className="nav-logo-img" />
        </a>
        <div className="nav-links">
          <a href="#quienes-somos">Quiénes somos</a>
          <a href="#ediciones">Ediciones</a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section id="inicio" className="hero" ref={heroRef}>
        <Starburst className="hero-starburst" count={40} len={150} />
        <Starburst className="hero-starburst-2" count={24} len={120} />

        {/* Pulse rings behind logo */}
        <div className="hero-pulse-ring" aria-hidden="true" />
        <div className="hero-pulse-ring hero-pulse-ring--2" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-logo-wrap">
            <div className="logo-text-img-wrap">
              <img
                src={`${BASE}/acida-titulo.svg`}
                alt="ÁCIDA"
                className="logo-text-img"
              />
            </div>
            <img
              src={`${BASE}/fondo-titulo.svg`}
              alt="ÁCIDA Revista"
              className="hero-logo-img"
            />
          </div>

          <p className="hero-edition">Revista digital · Buenos Aires</p>
          <p className="hero-tagline">Refundarse en los viejos métodos colectivos</p>

          <a
            href="https://www.instagram.com/acidarevista"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-ig"
          >
            @acidarevista
          </a>
        </div>

        {/* scroll hint */}
        <a href="#quienes-somos" className="hero-scroll">
          <div className="hero-scroll-line" />
          <span className="hero-scroll-label">scroll</span>
        </a>

      </section>

      {/* ═══ QUIÉNES SOMOS ═══ */}
      <section id="quienes-somos" className="quienes">
        <div className="quienes-blob-sm" aria-hidden="true" />
        <div className="quienes-vertical" aria-hidden="true">ESCRITURA COLECTIVA · ESCRITURA COLECTIVA · ESCRITURA COLECTIVA</div>
        <div className="quienes-slash" aria-hidden="true" />
        <div className="quienes-slash-2" aria-hidden="true" />
        <div className="quienes-interference" aria-hidden="true" />
        <img src={`${BASE}/elemento.png`} className="quienes-elemento" aria-hidden="true" />
        <img src={`${BASE}/acido-naranja.png`} className="quienes-acido" alt="" />

        <div className="quienes-inner">
          <h2 className="quienes-title reveal">
            <span className="quienes-title-line1">QUIÉNES</span>
            <span className="quienes-title-line2">SOMOS</span>
          </h2>

          <div className="quienes-grid">
            <div className="quienes-col reveal-left">
              <p>
                <strong>Ácida</strong> es un medio digital nacido del encuentro
                entre estudiantes de distintas carreras, atravesados por una misma
                urgencia:{' '}
                <strong>sostener la palabra</strong>, una que no se pliegue ni
                a la lógica de lo viral ni a la producción en serie de clicks.
              </p>
              <p>
                Lo entendemos como un espacio para arriesgar. No buscamos imponer
                certezas ni vestirnos de solemnidad. Preferimos ensayar, probar
                formas nuevas de decir. Porque creemos que el sentido no está dado,
                sino que se construye en colectivo, entre contradicciones, preguntas
                y apuestas.
              </p>
            </div>

            <div
              className="quienes-col reveal"
              style={{ transitionDelay: '0.2s' }}
            >
              <p>
                No nos interesa la neutralidad ni los discursos tibios. Tomamos
                posición, pero sin caer en celos ideológicos ni repetir fórmulas.
                Nos mueve la intuición de que todavía se pueden construir nuevos
                relatos posibles.
              </p>
              <p>
                Ácida es una apuesta por la escritura colectiva, por el texto que
                se transforma mientras lo pensamos, mientras lo discutimos,
                mientras lo prestamos. No buscamos imponernos como referencia,
                sino ser parte de una conversación más grande.
              </p>
              <p>
                <strong>Esperamos que les incomode.</strong>
              </p>
            </div>
          </div>

          <img src={`${BASE}/elemento.png`} className="quienes-elemento-mobile" aria-hidden="true" />

          <p className="quienes-highlight reveal" style={{ transitionDelay: '0.15s' }}>
            Acá van a encontrar artículos, reseñas, fotos, dibujos, cuentos,
            ensayos y otras cosas que se nos dé la gana publicar.
          </p>
        </div>

      </section>

      {/* ═══ REPOSITORIO ═══ */}
      <section id="ediciones" className="repositorio">
        <div className="repositorio-blob-bg" aria-hidden="true" />

        <div className="repositorio-inner">
          <h2 className="repositorio-title reveal">EDICIONES</h2>
          <p className="repositorio-subtitle reveal">Todas las ediciones</p>

          <div className="repositorio-grid">
            {/* Available editions */}

            {[...REVISTAS].reverse().map((r, i) => {
              if (r.releaseDate && new Date() < r.releaseDate) {
                return <CountdownCard key={r.id} revista={r} index={i} onOpen={handleRevista} />;
              }
              return (
                <div key={r.id} className={r.tilt}>
                  {r.isNew && <span className="card-badge">NUEVA</span>}
                  <div
                    className="revista-card reveal"
                    style={{ transitionDelay: `${i * 0.12}s` }}
                    onClick={() => handleRevista(r)}
                  >
                    <div className="card-edition">{r.subtitulo}</div>
                    <div className={titleClass(r.titulo)}>{r.titulo}</div>
                    <div className="card-fecha">{r.fecha}</div>
                    <div className="card-cta">Leer →</div>
                  </div>
                </div>
              );
            })}

            {/* Coming soon */}
            {PROXIMAS.map((r, i) => (
              <div key={r.id} className={r.tilt}>
                <div
                  className="revista-card revista-card--pronto reveal"
                  style={{ transitionDelay: `${(REVISTAS.length + i) * 0.12}s` }}
                >
                  <div className="card-edition">{r.subtitulo}</div>
                  <div className="card-title card-title--long">{r.titulo}</div>
                  <div className="card-fecha">&nbsp;</div>
                  <div className="card-cta">Próximamente</div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://substack.com/@acidarevista"
            target="_blank"
            rel="noopener noreferrer"
            className="substack-cta reveal"
          >
            <span className="substack-cta-title">Todos los artículos</span>
            <span className="substack-cta-sub">SUBSTACK</span>
          </a>
        </div>
      </section>

      {/* ═══ VISOR DE EDICIÓN ═══ */}
      {modalRevista && (
        <ImageViewer revista={modalRevista} onClose={() => setModalRevista(null)} />
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <img src={`${BASE}/footer.png`} alt="ÁCIDA" className="footer-logo-img" />
        <div className="footer-right">
          <div className="footer-links">
            <a href="#inicio">Inicio</a>
            <a href="#quienes-somos">Quiénes somos</a>
            <a href="#ediciones">Ediciones</a>
            <a href="https://www.instagram.com/acidarevista" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
          <span className="footer-text">
            Diseño y desarrollo web · Facundo Janeiro y Julieta Estévez
          </span>
          <span className="footer-text">
            Ciudad Autónoma de Buenos Aires · 2025
          </span>
        </div>
      </footer>
    </>
  );
}
