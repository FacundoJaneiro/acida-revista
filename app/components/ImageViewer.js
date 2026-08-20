'use client';

import { useEffect, useRef, useState } from 'react';

export default function ImageViewer({ revista, onClose }) {
  const [isMobile, setIsMobile] = useState(null);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const usingDesktop = isMobile === false && !!revista.images.desktop;
  const { basePath, count, w, h } = usingDesktop ? revista.images.desktop : revista.images.mobile;
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
      if (isMobile === false && e.key === 'ArrowLeft') goPrev();
      if (isMobile === false && e.key === 'ArrowRight') goNext();
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

        {isMobile === null ? (
          <div className="viewer-scroll" />
        ) : isMobile ? (
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
                  width={w}
                  height={h}
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
                  width={w}
                  height={h}
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
                    width={w}
                    height={h}
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
