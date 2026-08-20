import { notFound } from 'next/navigation';
import { REVISTAS } from '../../revistas-data';
import EdicionViewer from '../../components/EdicionViewer';

export async function generateStaticParams() {
  return REVISTAS.map((r) => ({ slug: r.slug }));
}

function findRevista(slug) {
  return REVISTAS.find((r) => r.slug === slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const revista = findRevista(slug);
  if (!revista) return {};

  const coverSet = revista.images.mobile || revista.images.desktop;
  const cover = `${coverSet.basePath}/page-01.webp`;
  const title = `${revista.titulo} — ÁCIDA`;

  return {
    title,
    description: revista.subtitulo,
    openGraph: {
      title,
      description: revista.subtitulo,
      images: [{ url: cover }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: revista.subtitulo,
      images: [cover],
    },
  };
}

export default async function EdicionPage({ params }) {
  const { slug } = await params;
  const revista = findRevista(slug);
  if (!revista) notFound();

  return <EdicionViewer revista={revista} />;
}
