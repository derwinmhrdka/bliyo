import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { SplashScreen } from '@/components/splash-screen';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'Bliyo',
  description: 'Belanja hemat, komisi mengalir',
  icons: { icon: '/brand/bliyo-mark.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <SplashScreen />
        {children}
        <div id="bliyo-portal" />
      </body>
    </html>
  );
}
