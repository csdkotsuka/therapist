import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Carea Go - ON-DEMAND WELLNESS | 出張・店舗ヘルスケア＆ボディケア',
  description: '理学療法士、エステ、整体、カイロなどのプロによる出張＆店舗訪問オンデマンド予約・決済プラットフォーム',
  icons: {
    icon: '/branding/favicon-carea-go.png',
    apple: '/branding/favicon-carea-go.png',
  },
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
