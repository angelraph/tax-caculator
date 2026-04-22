import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nigeria Tax Calculator 2026 — NTA/NTAA',
  description:
    'Free, accurate Nigerian income tax calculator based on the 2026 Nigeria Tax Act (NTA) and Nigerian Tax Administration Act (NTAA). Calculate PIT, VAT, and penalties instantly.',
  keywords: ['Nigeria tax', 'income tax calculator', 'NTA 2026', 'FIRS', 'PIT Nigeria', 'VAT Nigeria'],
  openGraph: {
    title: 'Nigeria Tax Calculator 2026',
    description: 'Instantly calculate your 2026 income tax, VAT, and penalties under the new Nigerian Tax Act.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
