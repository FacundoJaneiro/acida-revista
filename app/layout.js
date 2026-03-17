import { Bebas_Neue, Space_Grotesk } from 'next/font/google';
import './globals.css';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const space = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'Ácida — Revista',
  description:
    'Un medio digital nacido del encuentro entre estudiantes. Sostener la palabra.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${bebas.variable} ${space.variable}`}>
      <body>{children}</body>
    </html>
  );
}
