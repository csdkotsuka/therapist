# CareKuru 商用化に向けた改修計画（セキュリティ・構造監査）

監査日: 2026-11-01 / 対象コミット: `098921d`

---

## 進捗（2026-11-05 更新・ブランチ `feature/supabase-auth-data`）

| 項目 | 状態 |
|---|---|
| C1〜C3 偽ログイン・管理者の自動切替・LINE の URL 偽装 | ✅ Supabase Auth に置き換えた。サーバー側 layout で役割を確認し、LINE は state / nonce / ID トークンを検証する |
| C4・C5 profiles の RLS 無効・権限昇格 | ✅ migration 004（RLS 再設計、role 等の保護トリガー）。**2026-11-05 本番 DB に適用済み**。本番で権限テスト 15 項目を実行し全項目 OK |
| C6・C7 偽決済・クライアント側の金額計算 | ✅ 金額は DB RPC で計算。決済は `payment_mode=dummy` の間だけ RPC 経由でダミー確定（Stripe 本接続は Phase 3） |
| C8 ブラウザへの個人情報保存 | ✅ localStorage を全廃し、旧データも起動時に削除 |
| C9 デバッグ API | ✅ 削除 |
| C10 社内資料の公開 | ➖ 事業内容の確認用に意図的に公開しているため対応不要（オーナー判断） |
| H1〜H5, H7〜H11 | ✅ 対応済み（公開 VIEW、チャット・レビュー条件、位置情報 RPC、リダイレクト検証、/api/routes の認証、Firebase 削除、proxy、デモ機能の削除） |
| H6 Leaflet の HTML エスケープ | ✅ `src/lib/escapeHtml.ts` を追加。アバター URL は http(s) のみ許可 |
| M1・M2 決済の冪等性 | ⏳ Phase 3（Stripe 本接続）で対応 |
| M5 LINE 環境変数の別名 | ✅ 正式名だけを読むよう統一 |
| M6 セキュリティヘッダー | ✅ CSP は `src/proxy.ts` で nonce 方式（リクエストごとに生成）。そのため全ページを動的レンダリングにした |
| M8 スキーマ管理 | 🔶 003 を削除し、適用順を README に明記。Supabase CLI を devDependency に追加（v3.0.0）し、本番にリンク。001・002・004・005 を履歴に登録済みなので、今後は `npx supabase db push` で差分だけ適用できる。`schema.sql` が migration の外にある点は未整理 |
| DB 診断（supabase db advisors） | 🔶 search_path 固定・トリガー関数の実行権限は migration 005 で対応（2026-11-05 本番適用済み）。残る指摘は意図どおり（理由は 005 のコメント）。漏えいパスワード検査はダッシュボードで有効化が必要 |
| Phase 4（巨大コンポーネントの分割） | ⏳ 未着手 |
| Phase 5（テスト・CI・監視） | 🔶 DB の RLS 検証は PGlite で手動実行済み（35 項目）。CI への組み込みは未対応 |

---

## 0. 結論

現状は **「ブラウザ内で完結するデモ（プロトタイプ）」に、本物の Supabase / Stripe 連携が部分的に後付けされた構造** になっています。
個々のバグを直すだけでは商用運用には耐えられません。次の 3 点を作り直す必要があります。

1. **認証**: ログイン処理がパスワードも身元も確認していません。`switchUser()` で他人に切り替えているだけです。
2. **データ層**: 全データをブラウザに読み込み、localStorage に保存しています。書き込みもクライアントから DB へ直接行っています。
3. **DB 権限（RLS）**: profiles の RLS が無効で、誰でも自分を `admin` にできます。

一方で、セラピスト審査まわり（`api/admin/verification-decision`、`api/stripe/*`、審査 RPC、Storage ポリシー）は設計が良く、このまま土台として使えます。

---

## 1. 発見事項

### 🔴 Critical（公開中なら即日対応）

| # | 問題 | 場所 | 影響 |
|---|---|---|---|
| C1 | **ログインが偽物**。入力を無視して固定のデモアカウントへ `switchUser` するだけ | `src/components/auth/LoginForm.tsx:105-124, 231-321` | 誰でも管理者・セラピストになれる |
| C2 | **`/admin` を開くと自動で管理者に切り替わる** | `src/app/admin/[section]/AdminSectionClient.tsx:27-34` | 認可がまったくない |
| C3 | **LINE ログインを URL で偽装できる**。`/login?line_auth_success=1&line_uid=X&role=admin` でログイン扱いになる。OAuth の `state` も検証していない | `api/auth/line/callback/route.ts:16-26,70-78`, `LoginForm.tsx:68-86` | なりすまし、ログイン CSRF |
| C4 | **profiles の RLS が無効** | `supabase/migrations/003_auth_providers_and_passkeys.sql:38` | anon キーだけで全員の氏名・電話・住所・緯度経度・メールを読み書きできる |
| C5 | **権限昇格**。RLS を有効にしても、`profiles_update_policy` で本人が自分の `role` を `admin` に書き換えられる。`is_admin()` はこの列を参照しているため、審査書類（資格証・保険証票）や審査ログも芋づる式に見える | `supabase/schema.sql:155-157`, `001_…sql:13-22` | DB 全体の乗っ取り |
| C6 | **決済が偽物**。800ms 待った後、クライアントが予約を `confirmed` にしている | `src/components/customer/PaymentModal.tsx:44-55` | 支払いなしで予約が確定する |
| C7 | **金額と手数料をクライアントで計算して INSERT している**。RLS 上も顧客は `total_amount` や `status` を自由に UPDATE できる | `AppContext.tsx:620-660`, `BookingModal.tsx:178`, `schema.sql:190-204` | 料金改ざん、手数料逃れ |
| C8 | **全ユーザーの個人情報をブラウザに保存している**（下記 §2） | `AppContext.tsx:497-516` | PII の漏えい。個人情報保護法上の問題 |
| C9 | **デバッグ API が公開されている**。環境変数のキー名一覧と秘密情報の長さを返す | `src/app/api/auth/line/debug/route.ts` | 攻撃の足がかりになる |
| C10 | **社内資料が公開 URL にある**。議題、手数料と粗利の計画、収益予測、ピッチデッキの pptx | `src/app/guide/admin/*`, `public/CareKuru_PitchDeck_16x9.pptx` | 機密漏えい |

### 🟠 High

- **H1 公開読み取りの範囲が広すぎる**: `therapist_profiles` と `services` は `select using (true)` です。そのため `stripe_account_id`、`identity_verified_name`、`payment_status` などの内部列まで公開されています。公開してよい列だけを持つ VIEW に分ける必要があります。
- **H2 チャットの宛先を検証していない**: `chat_messages` の INSERT が予約の当事者かどうかを確認していません。任意のユーザーに送れます。
- **H3 レビューの条件を検証していない**: レビュー INSERT が「本人の完了済み予約か」を確認していません。
- **H4 位置情報の書き込み権限がない**: セラピストの位置情報を顧客側からも書けます（`LiveTrackingModal.tsx:117-135` のシミュレートボタン）。さらに `TherapistView.tsx:237-246` で本物の GPS にランダム値を上書きしています。
- **H5 オープンリダイレクト**: `?redirect=` を検証していません（`login/page.tsx:16`, `LoginForm.tsx:173,312`、LINE の `state` 経由も同様）。
- **H6 HTML インジェクション**: Leaflet マーカーで `avatar_url` と住所を生 HTML に埋め込んでいます（`RealLeafletMap.tsx:96,124`）。
- **H7 地図 API プロキシが無認証**: `/api/routes` は誰でも Google Routes API を叩けるため、課金を悪用されます。キーも `NEXT_PUBLIC_` なのでブラウザに露出しています。
- **H8 Supabase と Firebase の二重登録**: 同じ顧客の個人情報を両方に送っています（`register/page.tsx:202-233`）。Firestore のルールは管理外です。パスワード未入力時は `'password123'` が使われます（`lib/supabase.ts:65`）。
- **H9 依存パッケージの脆弱性**: `npm audit` で High が 4 件あり、すべて firebase 経由です。
- **H10 ページの保護がない**: `proxy.ts`（旧 middleware）がなく、すべてのページがクライアント側の判定だけで表示されています。
- **H11 デモ機能が本番に残っている**: クイックお試しログイン、偽の Passkey（`setTimeout` だけ）、管理者の「なりすまし」（`AdminView.tsx:1620` ほか）、審査書類の偽アップロード（`AdminView.tsx:1020-1043`）、決済フォームのテストカード事前入力が残っています。

### 🟡 Medium

- **M1 審査手数料の二重決済**: `api/stripe/review-fee` に冪等キーがなく、連打すると Checkout セッションが複数作られます。
- **M2 Webhook の重複処理**: Webhook がイベント ID を記録していません。今は冪等な UPDATE だけですが、予約決済を追加する前に重複排除テーブルが必要です。
- **M3 リダイレクト先が Host ヘッダー依存**: `NEXT_PUBLIC_SITE_URL` が未設定だと、リダイレクト先を Host ヘッダーから組み立てます（`supabaseAdmin.ts:54-58`）。本番では必須にします。
- **M4 DB エラーがそのまま見える**: RPC のエラーメッセージを画面にそのまま返しています（`verification-decision/route.ts:26`）。
- **M5 環境変数名の総当たり**: LINE の設定値を 6 通りの名前で探しています（`lib/server/lineServer.ts`）。設定ミスを隠すので、1 つに固定します。
- **M6 セキュリティヘッダーがない**: CSP、HSTS、X-Frame-Options などを設定していません（`next.config.ts` が空）。
- **M7 レート制限がない**: ログインや API にレート制限がありません。
- **M8 スキーマ管理が二重**: `schema.sql` と `migrations/` で定義が分かれています。どちらが正なのか不明です。
- **M9 未使用テーブル**: `passkey_credentials` の RLS が無効のまま残っています（未使用なら削除）。

---

## 2. ブラウザに残っているデータ

| 保存先 | キー / 内容 | 問題 |
|---|---|---|
| localStorage | `STORAGE_KEY`（AppContext）: **全ユーザー**のプロフィール（電話・住所・緯度経度）、全予約、全チャット、審査ログ、オンボーディング情報、現在のユーザー ID | 他人の PII が手元に残る。ログアウトしても消えない（`logout` は `isLoggedIn=false` にするだけ）。改ざんした値がそのまま UI に反映される |
| localStorage | `carehub_registered_customers`: 登録した顧客の氏名・メール・電話・住所・座標が追記され続ける | 共用 PC で PII が蓄積する |
| localStorage | `carehub_custom_branding` | ブランド設定を端末ごとに上書きできる（サーバー設定にすべき） |
| localStorage | Supabase Auth のセッション（supabase-js の既定動作） | XSS でトークンを盗まれる。`@supabase/ssr` の httpOnly Cookie へ移す |
| IndexedDB | Firebase Auth のセッション | Firebase の削除と同時に消える |
| URL / 履歴 | LINE の `line_uid`・表示名・アイコン URL | 履歴やアクセスログに残る |

**方針**: ブラウザに置くのは UI の設定（表示モードなど）と httpOnly のセッション Cookie だけにします。業務データはすべて、必要なときに必要な分だけサーバーから取得します。

---

## 3. 無駄なコードと遠回りな実装

- **未使用コード**:
  - `src/components/customer/InteractiveMap.tsx`（どこからも import されていない）
  - `src/lib/firebase.ts` と firebase 依存
  - `src/app/api/auth/line/debug`
  - `/signup`（`/register` へのリダイレクトだけ）
  - `/guide/admin/presentation`（リダイレクトだけ）
- **バンドルから外すもの**:
  - `src/lib/mockData.ts`（8,150 行）。クライアントの JS に丸ごと入っている
  - `generateEhime.js`、`supabase/seed_*.sql`、ルートと `public/` に重複している pptx、`provided_data/`。リポジトリ管理か、少なくとも本番デプロイの対象から外す
- **重複**:
  - `/privacy` と `/guide/privacy`、`/terms` と `/guide/terms`
  - `RealLeafletMap` と `TrackingLeafletMap` の初期化処理（共通フックにまとめる）
  - 登録処理が `LoginForm`（モック）と `/register`（本物）の 2 系統ある
- **巨大ファイル**: `AdminView` 2,326 行、`TherapistView` 2,706 行、`AppContext` 1,720 行、`CustomerView` 1,523 行。
- **遠回りな実装**:
  - DB のデータに mockData を毎回マージして表示している（`AppContext.tsx:254-330`）
  - `useEffect` と `switchUser` でロールを強制している（`page.tsx`, `AdminSectionClient`）
  - `useEffect` と `window.location.replace` でリダイレクトしている（サーバーの `redirect()` で済む）
  - `Header.tsx:101-111` で古いタグラインを毎回描画時に置換している
  - ブランド切り替えの UI が残っている（名称は確定済みなので定数でよい）
- **静的解析**: ESLint で 313 件（エラー 40）。`tsc` は通っています。テストは 1 本もありません。

---

## 4. 改修計画

> 規模の目安: S = 1 日以内 / M = 2〜5 日 / L = 1〜2 週間

### Phase 0: 応急処置（本番公開中なら当日。S × 複数）

1. `api/auth/line/debug` を削除する。
2. `src/app/guide/admin/*` と `public/*.pptx`、`public/presentation/` を削除するか、デプロイ対象から外す。
3. DB に緊急パッチを当てる:
   - `profiles` の RLS を有効化する。
   - `role` と `is_admin` 列の変更を、本人に対して禁止するトリガーを追加する（`protect_therapist_verification_columns` と同じ方式）。
   - `profiles` の SELECT を「本人と管理者のみ」に絞る。
4. LoginForm のクイックお試し、偽 Passkey、URL パラメータでの LINE ログイン、`AdminSectionClient` の自動管理者切り替えを無効化する。
   - これを入れると本物のログイン手段がなくなります。Phase 1 の完了までは「メンテナンス中 / クローズドβ」として公開を止めるのが安全です。
5. 管理画面のアクセス手段とデータ漏えいの痕跡を確認する。漏えいの疑いがあれば、Supabase の anon / service キーをローテーションする。

### Phase 1: 認証基盤の作り直し（L）

- 認証は **Supabase Auth に一本化**し、Firebase は削除する。
- `@supabase/ssr` で **httpOnly Cookie セッション**にする。`src/proxy.ts` で `/admin/*` と `/therapist/*` を保護し、Server Component（layout）でもロールを確認する。
  - Next 16 の書き方は `node_modules/next/dist/docs/` を確認すること。
- LINE ログインは次の流れにする。
  1. `state` と `nonce` を httpOnly Cookie に保存し、コールバックで照合する。
  2. `id_token` を LINE の verify API で検証する。
  3. サーバーで Supabase のユーザーと紐付け、セッションを発行する。
  4. URL には身元情報を一切載せない。
  - ロールはクライアントから受け取らない（新規登録は常に customer。セラピストは別の申請フローにする）。
- 管理者は MFA を必須にする（Supabase の TOTP、または本物の WebAuthn）。
- `representativeUsers`、`switchUser`、Header のモード切り替え、管理者のなりすましを削除する。サポート目的で必要なら、監査ログ付きでサーバー側に実装し直す。
- `redirect` パラメータは `/` で始まり `//` で始まらないパスだけ許可する。

### Phase 2: データ層と RLS の作り直し（L）

- **AppContext を解体する**:
  - 読み取りは Server Component か、ドメインごとのフックにして、必要な範囲だけページングで取得する。
  - 書き込みは Server Action / Route Handler / RPC に限定する。
  - localStorage での永続化と mockData のマージは全廃し、ログアウト時にクライアントの状態を破棄する。
- **RLS を再設計し、マイグレーションに一元化する**（`schema.sql` は migrations からの生成物として扱う）:
  - `profiles`: 本人と管理者だけが見られるようにする。公開用のセラピスト情報は `public_therapists` VIEW（公開してよい列だけ）に分ける。
  - `bookings`: クライアントからの直接 INSERT と UPDATE を禁止する。
    - `create_booking(service_id, scheduled_at, …)` RPC が価格と手数料を DB 側で計算する。
    - 状態遷移は `transition_booking(id, to)` RPC が、状態とロールのルールを検査してから行う。
  - `therapist_location`: 予約を担当するセラピストのみ書き込めるようにする（別テーブルか RPC。Realtime 配信もここから）。
  - `chat_messages`: 予約の当事者どうしの間だけで送受信できるようにする。
  - `reviews`: 本人の `completed` 予約に 1 件だけ書けるようにする。
  - `platform_settings`: 書き込みは管理者の RPC 経由のみとし、変更を監査ログに残す。
- Supabase の型生成（`supabase gen types`）を入れて、`any` をなくす。

### Phase 3: 決済（L）

- 予約決済は Stripe の PaymentIntent（`capture_method=manual` でオーソリし、施術完了時にキャプチャ）と Connect の `application_fee_amount` / `transfer_data` で組む。
- 予約の確定は **Webhook でだけ** 行う。`stripe_events` テーブルでイベント ID の重複を排除する。
- キャンセル料、返金、チャージバックのポリシーを決め、RPC と Webhook に実装する。
- 審査手数料の Checkout に冪等キーを付ける（M1）。

### Phase 4: 整理とリファクタリング（M〜L）

- §3 の未使用コード・重複・バンドル対象外ファイルを削除し、統合する。
- 巨大コンポーネントを機能ごとに分割する（`features/admin/*`, `features/therapist/*`, `features/customer/*`）。
- Leaflet マーカーの HTML エスケープを修正する（H6）。`dangerouslySetInnerHTML` の SVG は静的ファイルの `<img>` に置き換える。
- `/api/routes` を認証付きにしてレート制限をかけ、キーはサーバー専用の環境変数にする（H7）。
- LINE の環境変数名を 1 つに固定する（M5）。ESLint のエラーを 0 にする。

### Phase 5: 商用運用の基盤（M、Phase 1〜4 と並行可）

- **セキュリティ**:
  - `next.config.ts` に CSP、HSTS、X-Frame-Options、Referrer-Policy を設定する。
  - 社内向けページには `robots` で noindex を付ける。
  - ログインと API にレート制限をかける（Cloudflare の設定か Upstash など）。
- **環境**: 開発、ステージング、本番で Supabase と Stripe のプロジェクトを分ける。本番にシードデータを入れない。
- **品質**:
  - テストを整備する。RLS は pgTAP か Supabase のテストで「他人のデータに触れないこと」を検証し、決済と認証の主要導線は E2E（Playwright）でカバーする。
  - GitHub Actions で lint、型チェック、テスト、`npm audit` を回す。
- **監視**: エラー監視（Sentry など）を入れる。ログに個人情報を出さないルールを決める。管理操作の監査ログを残す。
- **法務とデータ**:
  - 退会時のデータ削除フローを作る。
  - 保存期間を決める（位置情報やチャットの自動削除など）。
  - プライバシーポリシーの記載を実装と一致させる。
  - バックアップと PITR を有効化する。

---

## 5. 推奨する進め方

- Phase 0 → Phase 1 → Phase 2 の順に進めます。
  - Phase 1 と Phase 2 は密接に関係するので、**新しい認証とデータ層をブランチで作り、画面を 1 つずつ移していく**のが現実的です。
  - 顧客の検索・予約から移し、次にセラピスト画面、最後に管理画面の順にします。
- 決済（Phase 3）は Phase 2 の予約 RPC ができてから着手します。
- 既存の審査フロー（`verification-decision` / `stripe/*` / 審査 RPC / Storage ポリシー）は、新しい基盤の上でもそのまま使えます。
