const BASE = '';

/* ─── DATA ─── */
export const REVISTAS = [
  {
    id: 1,
    slug: 'vomito',
    titulo: 'Vómito',
    subtitulo: 'Primera edición',
    fecha: 'Septiembre 2025',
    images: { mobile: { basePath: `${BASE}/revistas/vomito`, count: 27, w: 2526, h: 1786 } },
    disponible: true,
    tilt: 'card-tilt-neg',
  },
  {
    id: 2,
    slug: 'expres-n1',
    titulo: 'Exprés N°1',
    subtitulo: 'Todo lo que alguien quiso eliminar alguna vez',
    fecha: 'Diciembre 2025',
    images: { mobile: { basePath: `${BASE}/revistas/expres1`, count: 17, w: 2527, h: 1787 } },
    disponible: true,
    tilt: 'card-tilt-pos',
  },
  {
    id: 3,
    slug: 'el-dedo-en-la-llaga',
    titulo: 'El dedo en la llaga',
    subtitulo: 'Segunda edición',
    fecha: 'Marzo 2026',
    images: {
      mobile: { basePath: `${BASE}/revistas/dedo-mobile`, count: 48, w: 1263, h: 1786 },
      desktop: { basePath: `${BASE}/revistas/dedo-desktop`, count: 24, w: 2526, h: 1786 },
    },
    disponible: true,
    releaseDate: new Date('2026-03-21T03:00:00Z'),
    tilt: 'card-tilt-neg',
  },
  {
    id: 4,
    slug: 'expres-n2',
    titulo: 'Exprés N°2',
    subtitulo: '¿Dónde estamos en el mundo de los píxeles?',
    fecha: 'Junio 2026',
    images: { mobile: { basePath: `${BASE}/revistas/expres-n2`, count: 24, w: 2160, h: 3840 } },
    disponible: true,
    tilt: 'card-tilt-pos',
  },
  {
    id: 5,
    slug: 'la-calle',
    titulo: 'La calle',
    subtitulo: 'Tercera edición',
    fecha: 'Agosto 2026',
    images: {
      mobile: { basePath: `${BASE}/revistas/lacalle-mobile`, count: 37, w: 2160, h: 3840 },
      desktop: { basePath: `${BASE}/revistas/lacalle-desktop`, count: 22, w: 2526, h: 1786 },
    },
    disponible: true,
    releaseDate: new Date('2026-08-19T23:00:00Z'),
    isNew: true,
    tilt: 'card-tilt-neg',
  },
];

export const PROXIMAS = [
  {
    id: 6,
    subtitulo: 'Próxima edición',
    titulo: '???',
    tilt: 'card-tilt-pos',
  },
];

export const titleClass = (titulo) =>
  `card-title ${titulo.length >= 17 ? 'card-title--long' : 'card-title--medium'}`;
