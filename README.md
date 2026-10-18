# CareHub (出張・店舗対応ヘルスケア＆ボディケアプラットフォーム)

ヘルスケア版 Uber Eats をコンセプトとした、理学療法士、エステティシャン、整体師、カイロプラクターなどのプロ施術者と顧客をマッチングするオンデマンド予約・決済プラットフォームです。

---

## 🌟 主な機能と特徴

### 1. マルチテナント・ロール設計
- **顧客 (Customer)**:
  - 出張 (訪問) / 店舗訪問の柔軟な切り替え
  - 現在地シミュレーション（渋谷、新宿、六本木、銀座など）とPostGIS空間クエリによる近隣セラピスト検索
  - 施術メニュー・希望日時スロットの選択
  - Stripe Connect による事前承認（仮売上オーソリ）決済UI
  - **出張時のリアルタイムGPS追跡シミュレーター** (Uber風マップ＆到着予定時間カウントダウン)
  - 施術完了後の星評価（★1〜5）＆レビュー投稿
- **セラピスト (Therapist)**:
  - 新規予約リクエストのリアルタイム受信と「承認」または「辞退」
  - 出張時の「現在地GPS送信」機能（顧客追跡画面への即時ブロードキャスト）
  - 受付可能曜日・時間帯シフトおよび出張対応半径 (km) 設定
  - 施術メニュー（料金・所要時間）の登録・公開管理
  - Stripe Connect Express による売上・純手取り明細の確認
- **管理者 (Admin)**:
  - 全予約トランザクションのリアルタイム監視・強制キャンセル対応
  - セラピストの審査・承認トグル管理
  - プラットフォーム手数料率（Take Rate: 例 20%）のリアルタイム設定
  - レビューモデレーション（不適切レビューの非表示化）
  - 全体KPI（流通総額 GMV、手数料収益、予約数、アクティブセラピスト数）の可視化

---

## 🛠 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript
- **アイコン**: Lucide React
- **アニメーション**: Canvas Confetti
- **バックエンド / データベース**: Supabase (PostgreSQL 15+, PostGIS 空間演算, Row Level Security, RPC)
- **決済連携**: Stripe Connect (Express)
- **位置情報**: PostGIS `geography(Point, 4326)` & Haversine 距離算出

---

## 📁 ディレクトリ構成

```
therapist/
├── supabase/
│   ├── schema.sql      # Supabase用 テーブル定義, PostGIS拡張, RLSポリシー, RPC関数
│   └── seed.sql        # 初期テスト用ダミーデータ (管理者, セラピスト, 顧客, メニュー, 予約, レビュー)
├── src/
│   ├── app/
│   │   ├── layout.tsx  # グローバルレイアウト & AppProvider
│   │   ├── page.tsx    # ロール別画面切り替え & クイックスイッチャー
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx  # ナビゲーション & ロール切替ドロップダウン
│   │   ├── customer/   # 顧客向けUI (検索, 地図, 予約モーダル, GPS追跡, レビュー)
│   │   ├── therapist/  # セラピスト向けUI (リクエスト承認, シフト, メニュー, 売上)
│   │   └── admin/      # 管理者向けUI (KPI, 全予約監視, セラピスト審査, 手数料設定)
│   ├── context/
│   │   └── AppContext.tsx # 状態管理 (localStorage永続化 & Supabaseハイブリッド対応)
│   ├── lib/
│   │   ├── geo.ts      # 距離計算 (Haversine), 移動時間予測, フォーマッター
│   │   ├── mockData.ts # 初期シードモックデータ
│   │   └── supabase.ts # Supabase クライアント
│   └── types/
│       └── index.ts    # TypeScript 型定義 (Profile, Booking, Service, etc.)
└── .env.example        # 環境変数テンプレート
```

---

## 🚀 クイックスタート

### 1. 依存関係のインストール & 開発サーバー起動

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。
画面上部の**「ロールを切り替える」ボタン**（顧客 / セラピスト / 管理者）で、各ロールのUIと動作をワンクリックで切り替えて体験できます。

---

## 🗄️ Supabase データベースのセットアップ

実際の Supabase プロジェクトにスキーマを適用する場合：

1. [Supabase](https://supabase.com) で新規プロジェクトを作成
2. **Database** > **Extensions** で `postgis` を有効化（または `schema.sql` 実行で自動有効化）
3. **SQL Editor** を開き、[`supabase/schema.sql`](file:///Users/kotsuka/Documents/systemDev/therapist/supabase/schema.sql) の内容を実行
4. 続けて [`supabase/seed.sql`](file:///Users/kotsuka/Documents/systemDev/therapist/supabase/seed.sql) を実行して初期データを投入
5. `.env.local` ファイルを作成し、プロジェクトのURLとキーを設定：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
