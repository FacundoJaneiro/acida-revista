'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ARTICULOS } from '../articulos-data';
import { REVISTAS } from '../revistas-data';

const norm = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function snippet(texto, query) {
  const t = texto || '';
  const i = norm(t).indexOf(norm(query));
  if (i === -1) return t.slice(0, 220).trim() + '…';
  const start = Math.max(0, i - 60);
  const end = Math.min(t.length, i + query.length + 160);
  return `${start > 0 ? '…' : ''}${t.slice(start, end).trim()}…`;
}

function highlight(text, query) {
  if (!query) return text;
  const i = norm(text).indexOf(norm(query));
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

function edicionLink(articulo) {
  const revista = REVISTAS.find((r) => r.slug === articulo.edicionSlug);
  const params = new URLSearchParams();
  if (articulo.paginaMobile) params.set('pm', articulo.paginaMobile);
  if (articulo.paginaDesktop) params.set('pd', articulo.paginaDesktop);
  if (articulo.paginaMobileFin) params.set('pmFin', articulo.paginaMobileFin);
  if (articulo.paginaDesktopFin) params.set('pdFin', articulo.paginaDesktopFin);
  const qs = params.toString();
  return {
    href: `/ediciones/${articulo.edicionSlug}${qs ? `?${qs}` : ''}`,
    tituloEdicion: revista ? revista.titulo : articulo.edicionSlug,
  };
}

export default function Buscador({ query, onQueryChange }) {
  const [expandedId, setExpandedId] = useState(null);

  const resultados = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    const nq = norm(q);
    return ARTICULOS.filter(
      (a) => norm(a.titulo).includes(nq) || norm(a.autor).includes(nq) || norm(a.texto).includes(nq)
    ).slice(0, 30);
  }, [query]);

  return (
    <section id="buscador" className="buscador textura-grano">
      <div className="buscador-blob-bg" aria-hidden="true" />
      <img src="/fondo-titulo.svg" alt="" className="buscador-sticker" aria-hidden="true" />
      <div className="buscador-inner">
        <span className="buscador-kicker reveal">Encontrá lo que buscás</span>
        <h2 className="buscador-title reveal">BUSCADOR</h2>
        <p className="buscador-subtitle reveal">Buscá por título, autor o contenido de un artículo</p>

        <div className="buscador-input-wrap reveal">
          <input
            type="text"
            className="buscador-input"
            placeholder="Buscar artículo, autor…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Buscar artículos"
          />
        </div>

        {query.trim().length >= 2 && (
          <div className="buscador-resultados">
            {resultados.length === 0 ? (
              <p className="buscador-empty">No encontramos artículos para "{query}".</p>
            ) : (
              resultados.map((a) => {
                const { href, tituloEdicion } = edicionLink(a);
                const open = expandedId === a.id;
                return (
                  <div key={a.id} className={`buscador-row${open ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      className="buscador-row-head"
                      onClick={() => setExpandedId(open ? null : a.id)}
                      aria-expanded={open}
                    >
                      <span className="buscador-row-main">
                        <span className="buscador-row-titulo">{highlight(a.titulo, query)}</span>
                        <span className="buscador-row-meta">
                          <span className="buscador-row-autor">{a.autor}</span>
                          <span className="buscador-row-tag">{tituloEdicion}</span>
                        </span>
                      </span>
                      <span className="buscador-row-arrow" aria-hidden="true">＋</span>
                    </button>

                    <div className="buscador-row-body">
                      <div className="buscador-row-body-inner">
                        <span className="buscador-row-seccion">{a.seccion}</span>
                        <p className="buscador-row-snippet">{snippet(a.texto, query)}</p>
                        <Link href={href} className="buscador-row-link">Leer artículo →</Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
