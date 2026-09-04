'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { REVISTAS, PROXIMAS, titleClass } from './revistas-data';
import Buscador from './components/Buscador';

const BASE = '';

const MARQUEE_A = ['ÁCIDA', 'SOSTENER LA PALABRA', 'ESCRITURA COLECTIVA', 'BUENOS AIRES', 'URGENCIA', 'APUESTA', 'RIESGO'];
const MARQUEE_B = ['VÓMITO', 'PRIMERA EDICIÓN', 'SEPTIEMBRE 2025', 'ENSAYO', 'CRÓNICA', 'POESÍA', 'DIÁLOGO'];

const NUEVA_EDICION = REVISTAS.find((r) => r.isNew) || REVISTAS[REVISTAS.length - 1];

const ACCENT_MAP = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };

/* Renders text set in the Acidic display font: the font has no accented
   glyphs, so accented vowels are drawn as the base letter plus a small
   apostrophe-like mark placed above it. */
function acidicVisual(str) {
  return [...str].map((ch, i) => {
    const base = ACCENT_MAP[ch];
    if (!base) return ch;
    return (
      <span className="tilde-wrap" key={i}>
        {base}
        <span className="tilde-mark" aria-hidden="true">’</span>
      </span>
    );
  });
}

function acidicText(str) {
  return (
    <>
      <span aria-hidden="true">{acidicVisual(str)}</span>
      <span className="sr-only">{str}</span>
    </>
  );
}

/* Same as acidicText, but tracks each letter individually — some tight,
   some blown wide open — for the torn-poster title treatment. */
function trackedText(str, gaps) {
  return (
    <>
      <span aria-hidden="true">
        {[...str].map((ch, i) => {
          const base = ACCENT_MAP[ch];
          const style = { display: 'inline-block', marginRight: `${gaps[i] || 0}em` };
          if (!base) return <span key={i} style={style}>{ch}</span>;
          return (
            <span key={i} className="tilde-wrap" style={style}>
              {base}
              <span className="tilde-mark" aria-hidden="true">’</span>
            </span>
          );
        })}
      </span>
      <span className="sr-only">{str}</span>
    </>
  );
}

const EDICIONES_TRACKING = [0.02, 0.18, 0.30, 0.34, 0.46, 0.28, 0.34, 0.05, 0];

const CARD_SCRIM = 'linear-gradient(to top, rgba(8,8,16,0.94) 0%, rgba(8,8,16,0.82) 38%, rgba(8,8,16,0.25) 64%, rgba(8,8,16,0) 88%)';
const coverStyle = (slug) => ({ backgroundImage: `${CARD_SCRIM}, url(${BASE}/covers/${slug}.webp)` });

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

/* ─── COUNTDOWN CARD ─── */
function CountdownCard({ revista, index }) {
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
      <Link
        href={`/ediciones/${revista.slug}`}
        className="revista-card reveal"
        style={{ transitionDelay: `${index * 0.12}s`, ...coverStyle(revista.slug) }}
      >
        <div className="card-edition">{revista.subtitulo}</div>
        <div className={titleClass(revista.titulo)}>{acidicText(revista.titulo)}</div>
        <div className="card-fecha">{revista.fecha}</div>
        <div className="card-cta">Leer →</div>
      </Link>
    </div>
  );

  return (
    <div className={revista.tilt}>
      <div className="revista-card revista-card--countdown reveal" style={{ transitionDelay: `${index * 0.12}s`, ...coverStyle(revista.slug) }}>
        <div className="card-edition">{revista.subtitulo}</div>
        <div className={titleClass(revista.titulo)}>{acidicText(revista.titulo)}</div>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const drawerSearchRef = useRef(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) setSearchOpen(false);
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) drawerSearchRef.current?.focus();
  }, [searchOpen]);

  const goToBuscador = () => {
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById('buscador')?.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  };

  return (
    <>
      {/* ═══ NAV ═══ */}
      <nav ref={navRef} className="nav">
        <a href="#inicio" className="nav-logo">
          <img src={`${BASE}/navbar.png`} alt="ÁCIDA" className="nav-logo-img" />
        </a>
        <button
          className={`nav-menu-btn${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`nav-drawer${menuOpen ? ' is-open' : ''}`}>
        <div className="nav-drawer-overlay" onClick={() => setMenuOpen(false)} />
        <div className="nav-drawer-panel textura-grano">
          <form
            className={`nav-drawer-search${searchOpen ? ' is-open' : ''}`}
            onSubmit={(e) => { e.preventDefault(); goToBuscador(); }}
          >
            <button
              type="button"
              className="nav-drawer-search-btn"
              aria-label="Buscar"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Buscar</span>
            </button>
            <input
              ref={drawerSearchRef}
              type="text"
              className="nav-drawer-search-input"
              placeholder="Buscar artículo, autor…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="nav-drawer-divider" />

          <Link
            href={`/ediciones/${NUEVA_EDICION.slug}`}
            className="nav-drawer-featured"
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-drawer-featured-tag">Nueva edición</span>
            {NUEVA_EDICION.titulo}
          </Link>

          <div className="nav-drawer-divider" />

          <a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a>
          <a href="#quienes-somos" onClick={() => setMenuOpen(false)}>Quiénes somos</a>
          <a href="#ediciones" onClick={() => setMenuOpen(false)}>Ediciones</a>
          <a
            href="https://www.instagram.com/acidarevista"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            Instagram
          </a>
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <section id="inicio" className="hero" ref={heroRef}>
        <Starburst className="hero-starburst" count={40} len={150} />
        <Starburst className="hero-starburst-2" count={24} len={120} />

        <div className="hero-content">
          <div className="hero-logo-wrap">
            <div className="logo-text-img-wrap">
              <img
                src={`${BASE}/acida-titulo.svg`}
                alt="ÁCIDA"
                className="logo-text-img"
              />
            </div>
            <div
              className="hero-logo-img"
              role="img"
              aria-label="ÁCIDA Revista"
            />
          </div>

          <p className="hero-tagline">Refundarse en los <span className="marcador">viejos métodos colectivos</span></p>

          <Link href={`/ediciones/${NUEVA_EDICION.slug}`} className="hero-cta">
            Leer {NUEVA_EDICION.titulo} →
          </Link>

          <a
            href="https://www.instagram.com/acidarevista"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-ig"
          >
            @acidarevista
          </a>
        </div>

        <div className="torn-divider torn-divider--quienes" aria-hidden="true" />
      </section>

      {/* ═══ QUIÉNES SOMOS ═══ */}
      <section id="quienes-somos" className="quienes">
        <div className="quienes-inner">
          <span className="quienes-kicker reveal">MEDIO DIGITAL · BUENOS AIRES</span>

          <div className="quienes-layout">
            <div className="quienes-left reveal-left">
              <h2 className="quienes-title-new">
                <span aria-hidden="true">
                  <span className="glitch-layer glitch-back">{acidicVisual('QUIÉNES')}<br />{acidicVisual('SOMOS')}</span>
                  <span className="glitch-layer glitch-front">{acidicVisual('QUIÉNES')}<br />{acidicVisual('SOMOS')}</span>
                </span>
                <span className="sr-only">QUIÉNES SOMOS</span>
              </h2>
              <img src={`${BASE}/elemento.png`} className="quienes-elemento-new" aria-hidden="true" />
            </div>

            <div className="quienes-right reveal" style={{ transitionDelay: '0.15s' }}>
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
                sino ser parte de una conversación más grande.{' '}
                <strong>Esperamos que les incomode.</strong>
              </p>

              <p className="quienes-highlight">
                Acá van a encontrar <span className="marcador">artículos, reseñas, fotos, dibujos, cuentos, ensayos</span> y otras cosas que se nos dé la gana publicar.
              </p>

              <div className="quienes-ig">
                <a
                  href="https://www.instagram.com/acidarevista"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @acidarevista
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="torn-divider torn-divider--ediciones" aria-hidden="true" />
      </section>

      {/* ═══ REPOSITORIO ═══ */}
      <section id="ediciones" className="repositorio">
        <div className="repositorio-blob-bg" aria-hidden="true" />
        <img src={`${BASE}/tipo%20acido%20azul.png`} className="repositorio-mascota" aria-hidden="true" />

        <div className="repositorio-inner">
          <h2 className="repositorio-title reveal">{trackedText('EDICIONES', EDICIONES_TRACKING)}</h2>
          <p className="repositorio-subtitle reveal">Todas las ediciones</p>

          <div className="repositorio-grid">
            {/* Available editions */}

            {[...REVISTAS].reverse().map((r, i) => {
              if (r.releaseDate && new Date() < r.releaseDate) {
                return <CountdownCard key={r.id} revista={r} index={i} />;
              }
              return (
                <div key={r.id} className={r.tilt}>
                  {r.isNew && <span className="card-badge">NUEVA</span>}
                  <Link
                    href={`/ediciones/${r.slug}`}
                    className="revista-card reveal"
                    style={{ transitionDelay: `${i * 0.12}s`, ...coverStyle(r.slug) }}
                  >
                    <div className="card-edition">{r.subtitulo}</div>
                    <div className={titleClass(r.titulo)}>{acidicText(r.titulo)}</div>
                    <div className="card-fecha">{r.fecha}</div>
                    <div className="card-cta">Leer →</div>
                  </Link>
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
            <span className="substack-cta-sub">SUSCRIBITE EN SUBSTACK</span>
          </a>
        </div>

        <div className="torn-divider torn-divider--buscador" aria-hidden="true" />
      </section>

      <Buscador query={searchQuery} onQueryChange={setSearchQuery} />

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
