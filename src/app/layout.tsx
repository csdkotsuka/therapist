import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Care KURU（ケアクル） - ON-DEMAND WELLNESS | 出張・店舗ヘルスケア＆ボディケア',
  description: '理学療法士、エステ、整体、カイロなどのプロによる出張＆店舗訪問オンデマンド予約・決済プラットフォーム「Care KURU（ケアクル）」',
  icons: {
    icon: '/branding/icon_carearia_symbol.png',
    apple: '/branding/icon_carearia_symbol.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full bg-slate-50 dark:bg-black antialiased">
      <body className="min-h-full flex flex-col font-sans text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-black">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
