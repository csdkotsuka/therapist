import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'CareHub - 出張・店舗対応ヘルスケア＆ボディケアプラットフォーム',
  description: '理学療法士、エステ、整体、カイロなどのプロによる出張＆店舗訪問オンデマンド予約・決済プラットフォーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col font-sans text-slate-800">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
