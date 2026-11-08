import subprocess
import json
import secrets
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

CHARSET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"

def generate_random_password(length=12):
    return "".join(secrets.choice(CHARSET) for _ in range(length))

def run_supabase_sql(sql):
    tmp_sql_path = "/tmp/run_customer_migration.sql"
    with open(tmp_sql_path, "w", encoding="utf-8") as f:
        f.write(sql)
    
    cmd = ["npx", "supabase", "db", "query", "--remote", "--yes", "-f", tmp_sql_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("SQL Error:", res.stderr or res.stdout)
        raise RuntimeError("SQL execution failed")
    return res.stdout

def main():
    # 1. 既存のセラピスト一覧をエクセルから読み出す
    print("Reading existing therapists from セラピスト_アカウント一覧.xlsx...")
    wb_old = openpyxl.load_workbook("セラピスト_アカウント一覧.xlsx")
    ws_therapist_old = wb_old["セラピスト一覧"]
    
    therapist_data = []
    # 4行目以降（ヘッダーは4行目、データは5行目から）
    for r in list(ws_therapist_old.iter_rows(values_only=True))[4:]:
        therapist_data.append({
            "no": r[0],
            "name": r[1],
            "email": r[2],
            "password": r[3],
            "specialities": r[4],
            "phone": r[5],
            "postal_code": r[6],
            "address": r[7],
            "visit": r[8],
            "store": r[9],
            "status": r[10]
        })
    print(f"Loaded {len(therapist_data)} therapists.")

    # 2. scripts/seed/mockData.ts から顧客ダミープロファイル（30件）を取得
    print("Extracting customer profiles from mockData.ts...")
    with open("scripts/seed/mockData.ts", "r", encoding="utf-8") as f:
        content = f.read()
    
    start_idx = content.find("initialProfiles: Profile[] = [")
    end_idx = content.find("export const initialServices:", start_idx)
    raw_profiles = content[start_idx:end_idx]
    
    # 簡易パース: 各オブジェクトを取り出す
    import re
    id_matches = list(re.finditer(r'{\s*"id":\s*"([^"]+)",\s*"role":\s*"customer",\s*"name":\s*"([^"]+)",\s*"email":\s*"([^"]+)",\s*"phone":\s*"([^"]+)",[^}]*"address":\s*"([^"]+)",\s*"postal_code":\s*"([^"]+)"', content))
    
    customers = []
    for m in id_matches[:30]:
        c_id, c_name, c_email, c_phone, c_addr, c_postal = m.groups()
        pwd = generate_random_password(12)
        customers.append({
            "id": c_id,
            "name": c_name,
            "email": c_email,
            "password": pwd,
            "phone": c_phone,
            "address": c_addr,
            "postal_code": c_postal
        })
    print(f"Extracted {len(customers)} customer profiles.")

    # 3. Supabase DB への登録 SQL を構築
    # - 既存ユーザー（admin, therapists）の raw_app_meta_data に role を設定
    # - 顧客 30件を auth.users, auth.identities, public.profiles に挿入
    print("Inserting customer accounts and setting role metadata in Supabase...")
    
    sql_statements = [
        """
        -- 管理者の raw_app_meta_data に role = 'admin' を確実に設定
        UPDATE auth.users
        SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
            raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
        WHERE email = 'kotsuka@creativesd.net';

        -- セラピストの raw_app_meta_data に role = 'therapist' を確実に設定
        UPDATE auth.users
        SET raw_app_meta_data = raw_app_meta_data || '{"role": "therapist"}'::jsonb,
            raw_user_meta_data = raw_user_meta_data || '{"role": "therapist"}'::jsonb
        WHERE email <> 'kotsuka@creativesd.net';
        """
    ]

    for c in customers:
        stmt = f"""
        DO $$
        DECLARE
          v_id uuid := '{c["id"]}'::uuid;
        BEGIN
          -- 念のため既存レコードを削除
          DELETE FROM public.profiles WHERE id = v_id;
          DELETE FROM auth.users WHERE id = v_id OR email = '{c["email"]}';

          -- auth.users に挿入（role = customer をメタデータにも格納）
          INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
          ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_id,
            'authenticated',
            'authenticated',
            '{c["email"]}',
            extensions.crypt('{c["password"]}', extensions.gen_salt('bf')),
            now(),
            '{{"provider":"email","providers":["email"],"role":"customer"}}'::jsonb,
            '{{"name":"{c["name"]}","role":"customer"}}'::jsonb,
            now(),
            now(),
            '', '', '', ''
          );

          -- auth.identities に挿入
          INSERT INTO auth.identities (
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
          ) VALUES (
            v_id::text,
            v_id,
            jsonb_build_object('sub', v_id::text, 'email', '{c["email"]}', 'email_verified', true),
            'email',
            now(),
            now(),
            now()
          );

          -- public.profiles を更新（トリガーで作成されている場合は上書き）
          INSERT INTO public.profiles (
            id,
            role,
            name,
            email,
            phone,
            address,
            postal_code,
            created_at,
            updated_at
          ) VALUES (
            v_id,
            'customer',
            '{c["name"]}',
            '{c["email"]}',
            '{c["phone"]}',
            '{c["address"]}',
            '{c["postal_code"]}',
            now(),
            now()
          )
          ON CONFLICT (id) DO UPDATE
          SET role = 'customer',
              name = EXCLUDED.name,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone,
              address = EXCLUDED.address,
              postal_code = EXCLUDED.postal_code,
              updated_at = now();
        END $$;
        """
        sql_statements.append(stmt)

    full_sql = "\n".join(sql_statements)
    run_supabase_sql(full_sql)
    print("Database updated successfully.")

    # 4. 新しい統合エクセルワークブックを作成
    print("Generating comprehensive Excel file with 3 sheets...")
    wb = openpyxl.Workbook()
    # デフォルトシートを削除して新規作成
    wb.remove(wb.active)

    font_family = "Segoe UI"
    title_font = Font(name=font_family, size=15, bold=True, color="1E293B")
    subtitle_font = Font(name=font_family, size=9, color="64748B")
    header_font = Font(name=font_family, size=10, bold=True, color="FFFFFF")
    data_font = Font(name=font_family, size=10, color="0F172A")
    pwd_font = Font(name="Consolas", size=10, bold=True, color="047857")

    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )
    alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

    # ================= Sheet 1: 管理者アカウント =================
    ws_admin = wb.create_sheet(title="管理者アカウント")
    ws_admin.views.sheetView[0].showGridLines = True
    admin_header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid") # Dark Slate

    ws_admin.merge_cells("A1:E1")
    ws_admin["A1"] = "CareHub プラットフォーム 管理者アカウント"
    ws_admin["A1"].font = title_font
    ws_admin["A1"].alignment = Alignment(vertical="center")
    ws_admin.row_dimensions[1].height = 32

    ws_admin.merge_cells("A2:E2")
    ws_admin["A2"] = "最高権限（role: 'admin'）| 全機能管理・セラピスト審査・プラットフォーム設定"
    ws_admin["A2"].font = subtitle_font
    ws_admin["A2"].alignment = Alignment(vertical="center")
    ws_admin.row_dimensions[2].height = 20
    ws_admin.row_dimensions[3].height = 10

    admin_headers = ["区分", "組織・担当名", "ログインID (メールアドレス)", "ログインパスワード", "権限ロール"]
    ws_admin.row_dimensions[4].height = 28
    for col_idx, h in enumerate(admin_headers, 1):
        cell = ws_admin.cell(row=4, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = admin_header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    admin_row = [
        "プラットフォーム運営本部",
        "愛媛プラットフォーム運営本部",
        "kotsuka@creativesd.net",
        "v37qxvMhofHf6Bhxf8LM",
        "admin (最高管理者)"
    ]
    ws_admin.row_dimensions[5].height = 26
    for col_idx, val in enumerate(admin_row, 1):
        cell = ws_admin.cell(row=5, column=col_idx, value=val)
        cell.font = data_font
        cell.border = thin_border
        if col_idx == 4:
            cell.font = Font(name="Consolas", size=10, bold=True, color="B45309")
            cell.alignment = Alignment(horizontal="left", vertical="center")
            cell.number_format = "@"
        elif col_idx in [1, 5]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="left", vertical="center")

    for col_idx, width in {1: 26, 2: 28, 3: 32, 4: 26, 5: 22}.items():
        ws_admin.column_dimensions[get_column_letter(col_idx)].width = width

    # ================= Sheet 2: セラピスト一覧 =================
    ws_therapist = wb.create_sheet(title="セラピスト一覧")
    ws_therapist.views.sheetView[0].showGridLines = True
    therapist_header_fill = PatternFill(start_color="065F46", end_color="065F46", fill_type="solid") # Emerald

    ws_therapist.merge_cells("A1:K1")
    ws_therapist["A1"] = "CareHub セラピスト アカウント一覧"
    ws_therapist["A1"].font = title_font
    ws_therapist["A1"].alignment = Alignment(vertical="center")
    ws_therapist.row_dimensions[1].height = 32

    ws_therapist.merge_cells("A2:K2")
    ws_therapist["A2"] = f"対象セラピスト: {len(therapist_data)}名 | 権限: therapist | 各自固有の初期ログインパスワード"
    ws_therapist["A2"].font = subtitle_font
    ws_therapist["A2"].alignment = Alignment(vertical="center")
    ws_therapist.row_dimensions[2].height = 20
    ws_therapist.row_dimensions[3].height = 10

    th_headers = ["No.", "氏名", "メールアドレス (ログインID)", "初期パスワード", "主な専門分野", "電話番号", "郵便番号", "住所", "出張対応", "店舗対応", "審査状況"]
    ws_therapist.row_dimensions[4].height = 28
    for col_idx, h in enumerate(th_headers, 1):
        cell = ws_therapist.cell(row=4, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = therapist_header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    for row_idx, r in enumerate(therapist_data, 5):
        ws_therapist.row_dimensions[row_idx].height = 22
        is_even = (row_idx % 2 == 0)
        row_vals = [r["no"], r["name"], r["email"], r["password"], r["specialities"], r["phone"], r["postal_code"], r["address"], r["visit"], r["store"], r["status"]]
        for col_idx, val in enumerate(row_vals, 1):
            cell = ws_therapist.cell(row=row_idx, column=col_idx, value=val)
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

    for col_idx, width in {1: 6, 2: 24, 3: 32, 4: 18, 5: 36, 6: 16, 7: 12, 8: 36, 9: 10, 10: 10, 11: 12}.items():
        ws_therapist.column_dimensions[get_column_letter(col_idx)].width = width
    ws_therapist.freeze_panes = "A5"

    # ================= Sheet 3: 顧客（お客様）一覧 =================
    ws_customer = wb.create_sheet(title="顧客（お客様）一覧")
    ws_customer.views.sheetView[0].showGridLines = True
    customer_header_fill = PatternFill(start_color="1D4ED8", end_color="1D4ED8", fill_type="solid") # Blue

    ws_customer.merge_cells("A1:G1")
    ws_customer["A1"] = "CareHub 顧客（お客様） アカウント一覧"
    ws_customer["A1"].font = title_font
    ws_customer["A1"].alignment = Alignment(vertical="center")
    ws_customer.row_dimensions[1].height = 32

    ws_customer.merge_cells("A2:G2")
    ws_customer["A2"] = f"検証用顧客アカウント: {len(customers)}名 | 権限: customer | 初期ログインパスワード設定済み"
    ws_customer["A2"].font = subtitle_font
    ws_customer["A2"].alignment = Alignment(vertical="center")
    ws_customer.row_dimensions[2].height = 20
    ws_customer.row_dimensions[3].height = 10

    cu_headers = ["No.", "氏名", "メールアドレス (ログインID)", "初期パスワード", "電話番号", "郵便番号", "住所"]
    ws_customer.row_dimensions[4].height = 28
    for col_idx, h in enumerate(cu_headers, 1):
        cell = ws_customer.cell(row=4, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = customer_header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    for row_idx, r in enumerate(customers, 5):
        ws_customer.row_dimensions[row_idx].height = 22
        is_even = (row_idx % 2 == 0)
        row_vals = [row_idx - 4, r["name"], r["email"], r["password"], r["phone"], r["postal_code"], r["address"]]
        for col_idx, val in enumerate(row_vals, 1):
            cell = ws_customer.cell(row=row_idx, column=col_idx, value=val)
            cell.font = data_font
            cell.border = thin_border
            if is_even:
                cell.fill = alt_fill
            if col_idx == 1:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in [5, 6]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.number_format = "@"
            elif col_idx == 4:
                cell.font = Font(name="Consolas", size=10, bold=True, color="1D4ED8")
                cell.alignment = Alignment(horizontal="left", vertical="center")
                cell.number_format = "@"
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    for col_idx, width in {1: 6, 2: 20, 3: 32, 4: 18, 5: 18, 6: 12, 7: 42}.items():
        ws_customer.column_dimensions[get_column_letter(col_idx)].width = width
    ws_customer.freeze_panes = "A5"

    # ファイル保存（両方のファイル名で保存）
    path1 = os.path.abspath("セラピスト_アカウント一覧.xlsx")
    path2 = os.path.abspath("アカウント一覧.xlsx")
    wb.save(path1)
    wb.save(path2)
    print(f"Saved: {path1}")
    print(f"Saved: {path2}")

if __name__ == "__main__":
    main()
