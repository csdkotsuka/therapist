import subprocess
import json
import secrets
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

CHARSET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"

def gen_pwd():
    return "".join(secrets.choice(CHARSET) for _ in range(12))

def run_supabase_sql(sql):
    tmp_path = "/tmp/run_specialists.sql"
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(sql)
    cmd = ["npx", "supabase", "db", "query", "--remote", "--yes", "-f", tmp_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("SQL Error:", res.stderr or res.stdout)
        raise RuntimeError("SQL execution failed")
    return res.stdout

# 9名の新専門職（美容師、ネイリスト、着付師）
NEW_SPECIALISTS = [
    # --- 美容師 (Hairdresser) ---
    {
        "name": "佐々木 唯",
        "email": "hair.sasaki@carehub.jp",
        "phone": "089-941-8821",
        "postal_code": "790-0011",
        "address": "愛媛県松山市千舟町4丁目3-2",
        "specialities": ["出張美容", "訪問ヘアカット", "似合わせカット", "ヘッドスパ"],
        "category": "hair_salon",
        "bio": "美容師歴12年・管理美容師免許保持。サロンワークを経て出張美容をスタート。ご自宅にいながら美容室クオリティのカットとスタイリングをお届けします。",
        "is_visit": True,
        "is_store": False,
        "lat": 33.8375,
        "lng": 132.7665,
        "courses": [
            ("【短時間】前髪・眉カット＆ポイントメンテナンス", 30, 3500, "前髪の調整、枝毛カット、眉スタイリングのクイックお直しコース。"),
            ("【標準】出張デザインカット＆スタイリング", 60, 6800, "カウンセリングに基づいた似合わせカットと頭皮ケア、ブロー仕上げの基本コース。"),
            ("【贅沢】プレミアムカット＆深層スキャルプヘッドスパ", 90, 11000, "似合わせカットに極上スキャルプスパをプラスした、サロン以上の贅沢リフレッシュコース。")
        ],
        "options": [
            ("【オプション】高浸透補修トリートメント", 15, 2500, "ダメージ毛に栄養を補給しツヤとしなやかさを取り戻す集中トリートメント。"),
            ("【オプション】スキャルプ頭皮クレンジング泥パック", 15, 1800, "毛穴の皮脂汚れやにおいを除去し頭皮環境を健やかに整えます。"),
            ("【オプション】アイブロウ・眉スタイリングカット", 10, 1000, "お顔立ちに合わせて眉の形を美しく整えます。")
        ]
    },
    {
        "name": "松本 拓海",
        "email": "hair.matsumoto@carehub.jp",
        "phone": "089-932-5544",
        "postal_code": "790-0004",
        "address": "愛媛県松山市大街道2丁目5-1",
        "specialities": ["出張美容", "メンズカット", "頭皮ケア", "シニアカット"],
        "category": "hair_salon",
        "bio": "表参道・松山市内サロンを経て独立。丁寧なカウンセリングとスピーディーで清潔な施術が好評です。シニアの方やお子様の出張カットも安心してお任せください。",
        "is_visit": True,
        "is_store": True,
        "lat": 33.8402,
        "lng": 132.7712,
        "courses": [
            ("【短時間】クイックヘアカット＆襟足シェービング", 35, 4000, "短時間で清潔感のあるスタイルに整える身だしなみカットコース。"),
            ("【標準】デザインカット＆薬用頭皮マッサージ", 60, 6500, "骨格補正カットと頭皮血行促進マッサージでリフレッシュする人気コース。"),
            ("【贅沢】フルコースカット＆炭酸スキャルプSPA", 85, 9800, "カットに本格炭酸ヘッドスパと眉ケアを組み合わせたトータルリフレッシュ。")
        ],
        "options": [
            ("【オプション】炭酸頭皮ミストスパ", 15, 2000, "高濃度炭酸で頭皮の血行を一気に促し眼精疲労もすっきり。"),
            ("【オプション】コテ巻き・アイロンアレンジ仕上げ", 15, 1500, "おでかけや記念日に合わせた華やかな巻き髪スタイリング。")
        ]
    },
    {
        "name": "近藤 優香",
        "email": "hair.kondo@carehub.jp",
        "phone": "089-948-1129",
        "postal_code": "790-0003",
        "address": "愛媛県松山市三番町3丁目4-15",
        "specialities": ["出張美容", "ヘアメイク", "ブライダル", "出張ブロー"],
        "category": "hair_salon",
        "bio": "ブライダルヘアメイク・サロン経験豊富。結婚式、前撮り、記念日、同窓会など、特別な日のお出かけヘアセット＆メイクをお伺いして仕上げます。",
        "is_visit": True,
        "is_store": False,
        "lat": 33.8389,
        "lng": 132.7698,
        "courses": [
            ("【短時間】お出かけハーフアップ・コテ巻きアレンジ", 35, 4500, "普段のおでかけや食事会に合わせたナチュラル華やかヘアアレンジ。"),
            ("【標準】パーティー・フォーマル出張ヘアセット", 60, 7500, "和装・ドレスに合わせた崩れにくく上品なフルアップ・編み込みヘアセット。"),
            ("【贅沢】記念日フルヘアセット＆パーソナルメイクアップ", 90, 13000, "プロ用コスメによるフルメイクとヘアセットで特別な1日を演出。")
        ],
        "options": [
            ("【オプション】和装ヘア髪飾りレンタル・コーディネート", 10, 1500, "お着物に合わせた上品な髪飾りをご用意しセットいたします。"),
            ("【オプション】ポイントアイメイク＆つけまつげ仕上げ", 15, 2000, "目元の印象を華やかに引き立てる特別ポイントメイク。")
        ]
    },

    # --- ネイリスト (Nailist) ---
    {
        "name": "福田 葵",
        "email": "nail.fukuda@carehub.jp",
        "phone": "089-998-3310",
        "postal_code": "790-0842",
        "address": "愛媛県松山市道後湯之町14-8",
        "specialities": ["出張ネイル", "ジェルネイル", "美爪ケア", "オフィスネイル"],
        "category": "nail",
        "bio": "JNECネイリスト検定1級・衛生管理士。爪を削らないパラジェルを使用し、爪の健康を守りながら美しく上品な指先をお作りします。",
        "is_visit": True,
        "is_store": True,
        "lat": 33.8512,
        "lng": 132.7865,
        "courses": [
            ("【短時間】ハンドネイルケア・甘皮処理＆爪磨き", 40, 4200, "爪の形整え、丁寧な甘皮ウォーターケア、表面シャイナー磨きで清潔な艶爪へ。"),
            ("【標準】出張ワンカラージェルネイル（丁寧ケア込）", 70, 7500, "お好きなカラー1色を均一に美しく塗布。自爪を削らないベースジェル使用。"),
            ("【贅沢】デザインジェルネイル＆ハンドスクラブSPA", 100, 12000, "季節のトレンドアート2〜4本と角質ケアスクラブ、高保湿パックのフルコース。")
        ],
        "options": [
            ("【オプション】パラフィンパック深層保湿", 15, 1800, "温かいロウのパックで手肌の乾燥やくすみを集中ケアし驚きの透明感へ。"),
            ("【オプション】亀裂補強・リペア (1本)", 10, 800, "割れた爪やヒビをシルクで補強し長さを保ちます。"),
            ("【オプション】ストーン・パーツ追加 (2本)", 10, 1000, "指先に輝きをプラスする上品なストーン・スタッズアート。")
        ]
    },
    {
        "name": "石川 舞",
        "email": "nail.ishikawa@carehub.jp",
        "phone": "089-943-7722",
        "postal_code": "790-0805",
        "address": "愛媛県松山市勝山町1丁目2-8",
        "specialities": ["出張ネイル", "自爪育成", "グラデーション", "手肌エイジングケア"],
        "category": "nail",
        "bio": "ネイル歴9年。爪にコンプレックスのある方や深爪・薄爪でお悩みの方に寄り添い、健康で美しい縦長爪へと導きます。",
        "is_visit": True,
        "is_store": False,
        "lat": 33.8421,
        "lng": 132.7754,
        "courses": [
            ("【短時間】自爪育成ナチュラルケア＆オイル浸透", 35, 3800, "爪のピンクの部分を伸ばすための甘皮ケアと高保湿トリートメント。"),
            ("【標準】美フォルムカラーグラデーションジェル", 65, 7200, "手肌が綺麗に見える上品なカラーグラデーション。丁寧な甘皮処理付き。"),
            ("【贅沢】美爪ジェルネイル＆手肌エイジングSPAコース", 95, 10500, "グラデーションネイル＋美容液マッサージ＋エイジングケアパックの極上セット。")
        ],
        "options": [
            ("【オプション】フット親指巻き爪テーピング＆保護ケア", 15, 2000, "痛む巻き爪を専用シートとテープで優しくケア。"),
            ("【オプション】高保湿オーガニックハンドマッサージ", 15, 1500, "手首から指先までのリンパを流し、むくみと疲れを和らげます。")
        ]
    },
    {
        "name": "渡辺 志保",
        "email": "nail.watanabe@carehub.jp",
        "phone": "089-958-6611",
        "postal_code": "791-2113",
        "address": "愛媛県伊予郡砥部町重光238",
        "specialities": ["出張フットケア", "巻き爪補正", "フットジェル", "シニア爪切り"],
        "category": "nail",
        "bio": "足爪補正士・ドイツ式フットケア専門。ご高齢で爪切りが難しい方や巻き爪で靴が履けない方のための出張訪問フットケアを行っています。",
        "is_visit": True,
        "is_store": False,
        "lat": 33.7845,
        "lng": 132.7932,
        "courses": [
            ("【短時間】専門フット爪切り＆足指甘皮クレンジング", 35, 4500, "肥厚爪や変形爪も専用器具で安全に整える出張シニア向けフットケア。"),
            ("【標準】巻き爪補正＆足裏タコ・角質ケアコース", 60, 8000, "痛みのない巻き爪プレート装着と、足裏の頑固なタコ・魚の目を滑らかにケア。"),
            ("【贅沢】出張フットジェルネイル＆角質SPAフルコース", 90, 11500, "足先がパッと華やぐフットジェルと、足裏全体の徹底角質除去SPA。")
        ],
        "options": [
            ("【オプション】足裏スクラブ角質除去", 20, 2500, "専用やすりとスクラブでかかとをふっくらつるつるに仕上げます。"),
            ("【オプション】ひざ下リフレクソロジーマッサージ", 15, 2000, "ふくらはぎから足裏のツボを刺激し足の重だるさを解消。")
        ]
    },

    # --- 着付師 (Kimono Dresser) ---
    {
        "name": "森本 喜代美",
        "email": "kitsuke.morimoto@carehub.jp",
        "phone": "089-921-9988",
        "postal_code": "790-0837",
        "address": "愛媛県松山市道後多幸町6-3",
        "specialities": ["出張着付け", "訪問着", "留袖", "花嫁着付"],
        "category": "dressing",
        "bio": "着付け教授歴25年。結婚式参列、叙勲、お茶会、入学卒業式など、格式高い着物を「一日中苦しくなく、着崩れない」美しい立ち姿にお着せします。",
        "is_visit": True,
        "is_store": True,
        "lat": 33.8534,
        "lng": 132.7841,
        "courses": [
            ("【短時間】出張浴衣・カジュアル小紋おでかけ着付け", 40, 5000, "道後散策や花火大会、お茶会おでかけに手際よく美しく仕上げる着付け。"),
            ("【標準】出張訪問着・留袖・色無地フォーマル着付け", 60, 8500, "結婚式や式典・お宮参りにふさわしい、品格と動きやすさを兼ね備えたプロの技。"),
            ("【贅沢】出張振袖・式典プレミアム着付け＆帯飾りアレンジ", 90, 13500, "成人式や結納にふさわしい、豪華な創作帯結びと細部まで完璧な振袖着付け。")
        ],
        "options": [
            ("【オプション】帯アレンジ創作結び（三重仮紐使用）", 15, 1500, "華やかで目を惹く立体的な帯結びにアレンジいたします。"),
            ("【オプション】お着物事前点検・半衿付け代行", 15, 2000, "前もって小物や長襦袢の点検、半衿の縫い付けを丁寧に仕上げます。")
        ]
    },
    {
        "name": "山田 静江",
        "email": "kitsuke.yamada@carehub.jp",
        "phone": "089-933-2211",
        "postal_code": "790-0807",
        "address": "愛媛県松山市平和通3丁目1-12",
        "specialities": ["出張着付け", "七五三", "卒業袴", "振袖"],
        "category": "dressing",
        "bio": "着付け師範・美容師免許。お子様がぐずらず短時間で仕上がる七五三着付けや、卒業式の袴着付けで年間100件以上を担当しています。",
        "is_visit": True,
        "is_store": False,
        "lat": 33.8445,
        "lng": 132.7689,
        "courses": [
            ("【短時間】お子様七五三（被布・三歳）出張着付け", 30, 4800, "じっとしていられない小さなお子様でも手早く楽に着られる優しい着付け。"),
            ("【標準】七五三（五歳袴・七歳四つ身）／卒業式袴着付け", 55, 7500, "元気いっぱい動いても崩れにくく、お写真映えする凛とした仕上がり。"),
            ("【贅沢】親子ペア出張着付け（お子様＋お母様訪問着）", 90, 14000, "七五三やお宮参りで母子揃ってお着物をお召しになるお得なセットコース。")
        ],
        "options": [
            ("【オプション】和装かんたんヘアセット（アップヘア）", 20, 3000, "着物に似合うすっきりとしたまとめ髪をスピーディーにセット。"),
            ("【オプション】ポイント和装メイク", 15, 2500, "お着物に映える上品な眉・リップ・チークのポイントメイク。")
        ]
    },
    {
        "name": "小川 友香",
        "email": "kitsuke.ogawa@carehub.jp",
        "phone": "0898-31-7700",
        "postal_code": "794-0015",
        "address": "愛媛県今治市常盤町2丁目6-5",
        "specialities": ["出張着付け", "浴衣", "アンティーク着物", "普段着着物"],
        "category": "dressing",
        "bio": "モダンでおしゃれな着物コーディネートが得意な着付師。日常に着物を楽しみたい方からイベント参加まで、心地よく寄り添います。",
        "is_visit": True,
        "is_store": True,
        "lat": 34.0621,
        "lng": 132.9985,
        "courses": [
            ("【短時間】出張浴衣着付け＆半幅帯リボンアレンジ", 35, 4500, "夏のイベントや花火大会に崩れず涼しげな浴衣スタイリング。"),
            ("【標準】普段着・アンティーク着物おでかけ着付け", 55, 6800, "紬や小紋、ウール着物などカジュアル着物を着こなすお気軽出張着付け。"),
            ("【贅沢】お出かけフル着付け＆和装ヘアメイクセット", 85, 11500, "着付けにヘアセットとポイントメイクを合わせたトータル和装変身コース。")
        ],
        "options": [
            ("【オプション】帯締め・帯揚げアレンジプラス", 10, 1000, "レースやブローチを使った今どきモダンな帯周りアレンジ。"),
            ("【オプション】着崩れお直しレクチャー・歩き方講座", 15, 1200, "お食事やお手洗いでの着崩れ対処法と美しい所作を伝授。")
        ]
    }
]

def main():
    print("1. Adding 9 new specialists (Hairdressers, Nailists, Kimono Dressers)...")
    sql_parts = []
    
    new_therapist_excel_rows = []

    for sp in NEW_SPECIALISTS:
        u_id = subprocess.run(["python3", "-c", "import uuid; print(uuid.uuid4())"], capture_output=True, text=True).stdout.strip()
        pwd = gen_pwd()
        sp["id"] = u_id
        sp["password"] = pwd

        # SQL to insert user, profile, therapist_profile
        specs_array = "{" + ",".join([f'"{s}"' for s in sp["specialities"]]) + "}"
        sql_parts.append(f"""
        DO $$
        DECLARE
          v_id uuid := '{u_id}'::uuid;
        BEGIN
          DELETE FROM public.therapist_profiles WHERE user_id = v_id;
          DELETE FROM public.profiles WHERE id = v_id;
          DELETE FROM auth.users WHERE id = v_id OR email = '{sp["email"]}';

          INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_token, recovery_token, email_change_token_new, email_change
          ) VALUES (
            '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
            '{sp["email"]}', extensions.crypt('{pwd}', extensions.gen_salt('bf')), now(),
            '{{"provider":"email","providers":["email"],"role":"therapist"}}'::jsonb,
            '{{"name":"{sp["name"]}","role":"therapist"}}'::jsonb,
            now(), now(), '', '', '', ''
          );

          INSERT INTO auth.identities (
            provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
          ) VALUES (
            v_id::text, v_id, jsonb_build_object('sub', v_id::text, 'email', '{sp["email"]}', 'email_verified', true),
            'email', now(), now(), now()
          );

          INSERT INTO public.profiles (
            id, role, name, email, phone, address, postal_code, created_at, updated_at
          ) VALUES (
            v_id, 'therapist', '{sp["name"]}', '{sp["email"]}', '{sp["phone"]}',
            '{sp["address"]}', '{sp["postal_code"]}', now(), now()
          )
          ON CONFLICT (id) DO UPDATE SET role = 'therapist', name = EXCLUDED.name, email = EXCLUDED.email;

          INSERT INTO public.therapist_profiles (
            user_id, bio, specialities, is_visit_based, is_store_based, address,
            lat, lng, rating_avg, reviews_count, is_approved, is_identity_verified, is_certified,
            created_at, updated_at
          ) VALUES (
            v_id, '{sp["bio"]}', '{specs_array}', {str(sp["is_visit"]).lower()}, {str(sp["is_store"]).lower()},
            '{sp["address"]}', {sp["lat"]}, {sp["lng"]}, 4.95, 18, true, true, true,
            now(), now()
          )
          ON CONFLICT (user_id) DO UPDATE SET is_approved = true, bio = EXCLUDED.bio, specialities = EXCLUDED.specialities;
        END $$;
        """)

        # Add courses (3 variations: 短時間, 標準, 贅沢)
        for c_title, c_dur, c_price, c_desc in sp["courses"]:
            c_id = subprocess.run(["python3", "-c", "import uuid; print(uuid.uuid4())"], capture_output=True, text=True).stdout.strip()
            sql_parts.append(f"""
            INSERT INTO public.services (id, therapist_id, title, description, price, duration_minutes, category, is_active, is_option, created_at, updated_at)
            VALUES ('{c_id}', '{u_id}', '{c_title}', '{c_desc}', {c_price}, {c_dur}, '{sp["category"]}', true, false, now(), now());
            """)

        # Add options (is_option = true)
        for o_title, o_dur, o_price, o_desc in sp["options"]:
            o_id = subprocess.run(["python3", "-c", "import uuid; print(uuid.uuid4())"], capture_output=True, text=True).stdout.strip()
            sql_parts.append(f"""
            INSERT INTO public.services (id, therapist_id, title, description, price, duration_minutes, category, is_active, is_option, created_at, updated_at)
            VALUES ('{o_id}', '{u_id}', '{o_title}', '{o_desc}', {o_price}, {o_dur}, '{sp["category"]}', true, true, now(), now());
            """)

        new_therapist_excel_rows.append({
            "name": sp["name"],
            "email": sp["email"],
            "password": pwd,
            "specialities": ", ".join(sp["specialities"]),
            "phone": sp["phone"],
            "postal_code": sp["postal_code"],
            "address": sp["address"],
            "visit": "○" if sp["is_visit"] else "—",
            "store": "○" if sp["is_store"] else "—",
            "status": "承認済み"
        })

    run_supabase_sql("\n".join(sql_parts))
    print(f"Added {len(NEW_SPECIALISTS)} new specialist profiles and their courses/options.")

    # 2. 既存セラピストのコース時間バリエーション（短時間・中時間・長時間）とオプションを追加
    print("2. Expanding existing therapists with short/medium/long courses and options...")
    
    # 既存セラピストと既存サービスを取得
    cmd = ['npx', 'supabase', 'db', 'query', '--remote', '--read-only', '''
    SELECT 
      p.id,
      p.name,
      tp.specialities[1] as main_spec,
      s.id as base_service_id,
      s.title as base_title,
      s.description as base_desc,
      s.price as base_price,
      s.duration_minutes as base_dur,
      s.category as base_cat
    FROM public.profiles p
    JOIN public.therapist_profiles tp ON p.id = tp.user_id
    LEFT JOIN LATERAL (
      SELECT * FROM public.services WHERE therapist_id = p.id AND (is_option IS FALSE OR is_option IS NULL) LIMIT 1
    ) s ON true
    WHERE p.role = 'therapist' 
      AND p.email NOT IN ('hair.sasaki@carehub.jp', 'hair.matsumoto@carehub.jp', 'hair.kondo@carehub.jp',
                          'nail.fukuda@carehub.jp', 'nail.ishikawa@carehub.jp', 'nail.watanabe@carehub.jp',
                          'kitsuke.morimoto@carehub.jp', 'kitsuke.yamada@carehub.jp', 'kitsuke.ogawa@carehub.jp');
    ''']
    res = subprocess.run(cmd, capture_output=True, text=True)
    th_rows = json.loads(res.stdout[res.stdout.index('{'):])['rows']
    print(f"Expanding courses for {len(th_rows)} existing therapists...")

    expand_sql = []
    
    for r in th_rows:
        t_id = r["id"]
        main_spec = r["main_spec"] or "ボディケア"
        base_cat = r["base_cat"] or "massage"
        base_price = r["base_price"] or 6500

        # 短時間コース (35分)
        short_price = int(base_price * 0.65 / 100) * 100
        short_title = f"【短時間・クイック】{main_spec} 集中ケア (35分)"
        short_desc = f"お忙しい方や気になる部位を集中的にケアする35分ショートコースです。"
        
        # 中時間・標準コース (60分)
        med_price = base_price
        med_title = f"【標準・全身】{main_spec} スタンダード (60分)"
        med_desc = r["base_desc"] or f"全身のバランスを丁寧に整える一番人気の60分基本コースです。"
        
        # 長時間・贅沢コース (90分)
        long_price = int(base_price * 1.45 / 100) * 100
        long_title = f"【長時間・贅沢】{main_spec} プレミアム深層フルコース (90分)"
        long_desc = f"頭から足先まで時間をかけて深層のコリや疲労を徹底的に解放する贅沢90分コースです。"

        # 共通オプション
        opt1_title = "【オプション】施術時間延長 (+15分)"
        opt1_price = 1800
        opt1_desc = "気になる部位へのアプローチを15分じっくり延長いたします。"

        opt2_title = "【オプション】快眠ドライヘッドスパ集中ケア (+15分)"
        opt2_price = 2200
        opt2_desc = "頭皮の筋膜をほぐし、眼精疲労と脳の緊張を深部から和らげます。"

        opt3_title = "【オプション】極上オーガニックオイル変更・部位追加 (+10分)"
        opt3_price = 1500
        opt3_desc = "高品質な天然精油を使用し、香りと保湿効果を高めます。"

        # SQL
        expand_sql.append(f"""
        -- 既存サービスを一旦クリア（コースとオプションを整然と再編成）
        DELETE FROM public.services WHERE therapist_id = '{t_id}';

        -- 3コース
        INSERT INTO public.services (therapist_id, title, description, price, duration_minutes, category, is_active, is_option, created_at, updated_at)
        VALUES 
          ('{t_id}', '{short_title}', '{short_desc}', {short_price}, 35, '{base_cat}', true, false, now(), now()),
          ('{t_id}', '{med_title}', '{med_desc}', {med_price}, 60, '{base_cat}', true, false, now(), now()),
          ('{t_id}', '{long_title}', '{long_desc}', {long_price}, 90, '{base_cat}', true, false, now(), now());

        -- 3オプション
        INSERT INTO public.services (therapist_id, title, description, price, duration_minutes, category, is_active, is_option, created_at, updated_at)
        VALUES 
          ('{t_id}', '{opt1_title}', '{opt1_desc}', {opt1_price}, 15, '{base_cat}', true, true, now(), now()),
          ('{t_id}', '{opt2_title}', '{opt2_desc}', {opt2_price}, 15, '{base_cat}', true, true, now(), now()),
          ('{t_id}', '{opt3_title}', '{opt3_desc}', {opt3_price}, 10, '{base_cat}', true, true, now(), now());
        """)

    # チャンク実行
    chunk_size = 25
    for i in range(0, len(expand_sql), chunk_size):
        chunk = expand_sql[i:i+chunk_size]
        run_supabase_sql("\n".join(chunk))
        print(f"Updated therapists chunk {i+1} ~ {min(i+chunk_size, len(expand_sql))}")

    # 3. エクセルファイル（アカウント一覧.xlsx）に9名の新セラピストを追加
    print("3. Updating Excel file with new specialist therapists...")
    for fn in ["アカウント一覧.xlsx", "セラピスト_アカウント一覧.xlsx"]:
        wb = openpyxl.load_workbook(fn)
        ws = wb["セラピスト一覧"]
        
        # 既存行数
        last_row = ws.max_row
        
        font_family = "Segoe UI"
        data_font = Font(name=font_family, size=10, color="0F172A")
        pwd_font = Font(name="Consolas", size=10, bold=True, color="047857")
        alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
        thin_border = Border(
            left=Side(style='thin', color='E2E8F0'),
            right=Side(style='thin', color='E2E8F0'),
            top=Side(style='thin', color='E2E8F0'),
            bottom=Side(style='thin', color='E2E8F0')
        )

        for idx, sp in enumerate(new_therapist_excel_rows, 1):
            cur_row = last_row + idx
            ws.row_dimensions[cur_row].height = 22
            is_even = (cur_row % 2 == 0)

            no_val = cur_row - 4
            row_vals = [
                no_val, sp["name"], sp["email"], sp["password"], sp["specialities"],
                sp["phone"], sp["postal_code"], sp["address"], sp["visit"], sp["store"], sp["status"]
            ]

            for col_idx, val in enumerate(row_vals, 1):
                cell = ws.cell(row=cur_row, column=col_idx, value=val)
                cell.font = data_font
                cell.border = thin_border
                if is_even:
                    cell.fill = alt_fill
                if col_idx in [1, 9, 10, 11]:
                    cell.alignment = Alignment(horizontal="center", vertical="center")
                elif col_idx in [6, 7]:
                    cell.alignment = Alignment(horizontal="center", vertical="center")
                    cell.number_format = "@"
                elif col_idx == 4:
                    cell.font = pwd_font
                    cell.alignment = Alignment(horizontal="left", vertical="center")
                    cell.number_format = "@"
                else:
                    cell.alignment = Alignment(horizontal="left", vertical="center")

        wb.save(fn)
        print(f"Saved {fn}")

    print("All tasks in seed_specialists_and_options.py completed successfully!")

if __name__ == "__main__":
    main()
