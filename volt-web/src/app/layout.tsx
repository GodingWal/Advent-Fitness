import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/query';

export const metadata: Metadata = {
  title: { default: 'VOLT — Move with intent', template: '%s · VOLT' },
  description: 'Unified fitness tracking and gym access. Move with intent.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="volt-skip" href="#main">Skip to content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
