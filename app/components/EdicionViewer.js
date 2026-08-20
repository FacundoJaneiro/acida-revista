'use client';

import { useRouter } from 'next/navigation';
import ImageViewer from './ImageViewer';

export default function EdicionViewer({ revista }) {
  const router = useRouter();
  const close = () => router.push('/');

  const yaDisponible = !revista.releaseDate || new Date() >= revista.releaseDate;

  if (!yaDisponible) {
    return (
      <div className="modal-overlay" onClick={close}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{revista.titulo} <em>{revista.subtitulo}</em></span>
            <div className="modal-header-right">
              <button className="modal-close" onClick={close}>✕</button>
            </div>
          </div>
          <div className="edicion-pronto">
            <p>Todavía no está disponible.</p>
            <a href="/">Volver al inicio</a>
          </div>
        </div>
      </div>
    );
  }

  return <ImageViewer revista={revista} onClose={close} />;
}
