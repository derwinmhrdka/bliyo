import type { Metadata, Viewport } from 'next';
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
  applicationName: 'Bliyo',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Bliyo',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0e3d23',
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
