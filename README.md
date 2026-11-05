# Care KURU（ケアクル） - 出張・店舗対応ヘルスケア＆ボディケアプラットフォーム

ヘルスケア版 Uber Eats をコンセプトとした、理学療法士、エステティシャン、整体師、カイロプラクターなどのプロ施術者と顧客をマッチングするオンデマンド予約・決済プラットフォームです。

---

## 🌟 主な機能と特徴

### 1. マルチテナント・ロール設計
- **顧客 (Customer)**:
  - 出張 (訪問) / 店舗訪問の柔軟な切り替え
  - 現在地（GPS・登録住所・主要駅プリセット）からの近隣セラピスト検索
  - 施術メニュー・希望日時スロットの選択
  - Stripe Connect による事前承認（仮売上オーソリ）決済UI
  - **出張時のリアルタイム位置追跡**（担当セラピストの端末の GPS を Supabase Realtime で配信）
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
│   ├── schema.sql                  # テーブル定義・PostGIS・基本 RLS
│   ├── migrations/                 # 001 審査 / 002 予約ステータス / 004 認証・RLS・業務 RPC / 005 診断対応
│   └── seed/demo_seed.sql          # デモ用ダミーデータ（自動生成。本番では使わない）
├── scripts/seed/
│   ├── mockData.ts                 # ダミーデータの正本（アプリには含めない）
│   └── generate_seed_sql.mjs       # mockData.ts → demo_seed.sql を生成
├── src/
│   ├── proxy.ts                    # 認証 Cookie の更新・要ログインページのリダイレクト
│   ├── app/
│   │   ├── admin/layout.tsx        # 管理者のみ（サーバー側で role を確認）
│   │   ├── therapist/layout.tsx    # セラピスト本人と管理者のみ
│   │   ├── auth/callback/          # OAuth・メール確認・LINE ログインのセッション確立
│   │   └── api/                    # LINE ログイン / Stripe / 審査承認 / 経路計算
│   ├── components/                 # 顧客・セラピスト・管理者の各画面
│   ├── context/AppContext.tsx      # Supabase からの読み込みと更新（ブラウザには保存しない）
│   └── lib/                        # Supabase クライアント・LINE・地図・審査ロジック
└── .env.example                    # 環境変数テンプレート
```

---

## 🔐 セキュリティ設計の要点

- **認証**: Supabase Auth（メール＋パスワード / Google / LINE）。セッションは Cookie に保存され、サーバーと共有されます。
- **画面のアクセス制御**: `/admin` と `/therapist` はサーバー側の `layout.tsx` で `profiles.role` を確認してから表示します。
- **データの権限**: すべて RLS で制御します。個人情報（電話・住所など）は本人・取引相手・管理者だけが見られます。未ログインの利用者には公開用 VIEW（`public_profiles` / `public_therapist_profiles`）だけを返します。
- **金額・状態遷移**: 予約金額と手数料は DB の `create_booking` RPC がメニューから計算します。ステータス変更は `update_booking_status` で、役割ごとに許可された遷移だけを受け付けます。
- **権限昇格の防止**: `role`、審査フラグ、評価値などはトリガーで保護しており、本人が書き換えることはできません。
- **ブラウザ保存**: 業務データは localStorage 等に保存しません。旧バージョンが保存したデータは起動時に削除します。

---

## 🚀 セットアップ

### 1. Supabase（SQL Editor で順番に実行）

1. `supabase/schema.sql`
2. `supabase/migrations/001_therapist_verification.sql`
3. `supabase/migrations/002_add_awaiting_payment_status.sql`
4. `supabase/migrations/004_production_auth_and_rls.sql`
5. `supabase/migrations/005_advisor_hardening.sql`
6. （デモ環境のみ）`supabase/seed/demo_seed.sql`：先頭の `demo_password`（デモアカウント共通）と `admin_password`（管理者 kotsuka@creativesd.net 用）を書き換えてから実行してください。管理者のアカウントが既にある場合は、パスワードを変えずに管理者へ昇格だけを行います。

管理者は画面から登録できません。追加するときは、既存ユーザーを SQL で昇格させます。

```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

ダミーデータを変更したときは、`scripts/seed/mockData.ts` を編集してから `node scripts/seed/generate_seed_sql.mjs` で SQL を再生成します。

### 2. Supabase Auth の設定（ダッシュボード）

- **URL Configuration**: Site URL を本番 URL に設定し、Redirect URLs に `https://<ドメイン>/auth/callback`（開発時は `http://localhost:3000/auth/callback`）を追加します。
- **Email Templates → Confirm signup**: リンクを次のように変更します。メールを別のブラウザやメールアプリで開いても登録が完了するようになります。
  ```
  {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/
  ```
- **Providers → Google**（使う場合）: Google Cloud の OAuth クライアント ID とシークレットを設定します。
- **LINE Developers**: LINE Login チャネルのコールバック URL に `https://<ドメイン>/api/auth/line/callback` を登録します。

### 3. 環境変数

`.env.example` を `.env.local` にコピーして値を設定します。LINE ログインと審査の承認には `SUPABASE_SERVICE_ROLE_KEY` が必要です。

### 4. 起動

```bash
npm install
npm run dev
```

### 決済モード

`platform_settings` の `payment_mode` で切り替えます。

- `{"mode":"dummy"}`（初期値）: 実際の請求は発生せず、ボタン操作で決済済みになります。
- `{"mode":"stripe"}`: Stripe Checkout / Connect と Webhook を使います。**正式リリース前に必ず切り替えてください。**
