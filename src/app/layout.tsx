import type { Metadata } from 'next';
import { connection } from 'next/server';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'CareKuru - ON-DEMAND WELLNESS | 出張・店舗ヘルスケア＆ボディケア',
  description: '理学療法士、エステ、整体、カイロなどのプロによる出張＆店舗訪問オンデマンド予約・決済プラットフォーム「CareKuru」',
  // ファビコンは src/app/icon.png・apple-icon.png（ファイル規約）で自動設定される
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CSP の nonce はリクエストごとに変わるため、全ページを動的レンダリングにする
  // （静的に事前生成したページには nonce が付かず、スクリプトがブロックされる）
  await connection();

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
