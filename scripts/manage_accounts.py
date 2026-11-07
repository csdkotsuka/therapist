import subprocess
import json
import secrets
import string
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# 1. 紛らわしい文字を除いた読みやすい英数字12文字のパスワード生成
# (0, O, 1, l, I を除外)
CHARSET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"

def generate_random_password(length=12):
    return "".join(secrets.choice(CHARSET) for _ in range(length))

def run_supabase_sql(sql):
    tmp_sql_path = "/tmp/run_migration.sql"
    with open(tmp_sql_path, "w", encoding="utf-8") as f:
        f.write(sql)
    
    cmd = ["npx", "supabase", "db", "query", "--remote", "--yes", "-f", tmp_sql_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("SQL Error:", res.stderr or res.stdout)
        raise RuntimeError("SQL execution failed")
    return res.stdout

def main():
    print("Fetching active therapists from remote database...")
    cmd = ['npx', 'supabase', 'db', 'query', '--remote', '--read-only', '''
    SELECT 
      p.id,
      p.name,
      p.email,
      p.phone,
      p.postal_code,
      p.address,
      array_to_string(tp.specialities, ', ') as specialities,
      tp.is_visit_based,
      tp.is_store_based,
      tp.is_approved
    FROM public.profiles p
    JOIN public.therapist_profiles tp ON p.id = tp.user_id
    WHERE p.role = 'therapist' AND p.email NOT LIKE 'legacy_%'
    ORDER BY p.name;
    ''']
    res = subprocess.run(cmd, capture_output=True, text=True)
    json_str = res.stdout[res.stdout.index('{'):]
    therapists = json.loads(json_str)['rows']
    print(f"Retrieved {len(therapists)} active therapists.")

    # 各セラピストに個別パスワードを付与
    therapist_records = []
    for t in therapists:
        pwd = generate_random_password(12)
        therapist_records.append({**t, "password": pwd})

    # 2. DB のパスワードを一括更新 (VALUES 構文による一括UPDATE)
    print("Updating passwords in remote Supabase Auth...")
    values_list = []
    for r in therapist_records:
        values_list.append(f"('{r['id']}'::uuid, '{r['password']}')")
    
    # チャンクごとに更新 (念のため50件ずつ)
    chunk_size = 50
    for i in range(0, len(values_list), chunk_size):
        chunk = values_list[i:i+chunk_size]
        values_sql = ",\n    ".join(chunk)
        sql = f"""
        UPDATE auth.users u
        SET encrypted_password = extensions.crypt(t.pass, extensions.gen_salt('bf')),
            updated_at = now()
        FROM (VALUES 
            {values_sql}
        ) as t(id, pass)
        WHERE u.id = t.id;
        """
        run_supabase_sql(sql)
        print(f"Updated passwords chunk {i+1} ~ {min(i+chunk_size, len(values_list))}")

    # 3. ダミーアカウントの削除
    print("Deleting dummy accounts (dummy customers, dummy admins, legacy records)...")
    cleanup_sql = """
    -- 1. 口コミ削除（ダミー顧客）
    DELETE FROM public.reviews 
    WHERE customer_id IN (
      SELECT id FROM auth.users 
      WHERE email <> 'kotsuka@creativesd.net' 
        AND (id NOT IN (SELECT user_id FROM public.therapist_profiles) OR email LIKE 'legacy_%')
    );

    -- 2. 予約削除（ダミー顧客）
    DELETE FROM public.bookings 
    WHERE customer_id IN (
      SELECT id FROM auth.users 
      WHERE email <> 'kotsuka@creativesd.net' 
        AND (id NOT IN (SELECT user_id FROM public.therapist_profiles) OR email LIKE 'legacy_%')
    );

    -- 3. 旧プロフィール削除（念のため）
    DELETE FROM public.profiles
    WHERE email <> 'kotsuka@creativesd.net' 
      AND (role <> 'therapist' OR email LIKE 'legacy_%');

    -- 4. auth.users 削除（ダミー管理者、ダミー顧客、legacy_*）
    DELETE FROM auth.users 
    WHERE email <> 'kotsuka@creativesd.net' 
      AND (id NOT IN (SELECT user_id FROM public.therapist_profiles) OR email LIKE 'legacy_%');
    """
    run_supabase_sql(cleanup_sql)
    print("Dummy accounts cleaned up successfully.")

    # 4. エクセルファイルを作成
    print("Generating Excel file...")
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "セラピスト一覧"
    ws.views.sheetView[0].showGridLines = True

    # スタイル定義
    font_family = "Segoe UI"
    title_font = Font(name=font_family, size=16, bold=True, color="1E293B")
    subtitle_font = Font(name=font_family, size=9, color="64748B")
    header_font = Font(name=font_family, size=10, bold=True, color="FFFFFF")
    data_font = Font(name=font_family, size=10, color="0F172A")
    pwd_font = Font(name="Consolas", size=10, bold=True, color="047857")
    
    header_fill = PatternFill(start_color="065F46", end_color="065F46", fill_type="solid")
    alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='E2E8F0'),
        bottom=Side(style='thin', color='E2E8F0')
    )

    # タイトル行
    ws.merge_cells("A1:K1")
    ws["A1"] = "CareHub セラピスト アカウント一覧"
    ws["A1"].font = title_font
    ws["A1"].alignment = Alignment(vertical="center")
    ws.row_dimensions[1].height = 32

    ws.merge_cells("A2:K2")
    ws["A2"] = f"出力日時: 2026年11月8日 | 対象アカウント数: {len(therapist_records)}名 | 各セラピスト固有の初期パスワードを設定済み"
    ws["A2"].font = subtitle_font
    ws["A2"].alignment = Alignment(vertical="center")
    ws.row_dimensions[2].height = 20

    # 空行
    ws.row_dimensions[3].height = 10

    # ヘッダー
    headers = [
        "No.",
        "氏名",
        "メールアドレス (ログインID)",
        "初期パスワード",
        "主な専門分野",
        "電話番号",
        "郵便番号",
        "住所",
        "出張対応",
        "店舗対応",
        "審査状況"
    ]
    
    ws.row_dimensions[4].height = 28
    for col_idx, header_text in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col_idx, value=header_text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border

    # データ行
    for row_idx, r in enumerate(therapist_records, 5):
        ws.row_dimensions[row_idx].height = 22
        
        visit_str = "○" if r.get('is_visit_based') else "—"
        store_str = "○" if r.get('is_store_based') else "—"
        status_str = "承認済み" if r.get('is_approved') else "審査中"

        row_values = [
            row_idx - 4,
            r.get('name') or '',
            r.get('email') or '',
            r.get('password') or '',
            r.get('specialities') or '',
            r.get('phone') or '',
            r.get('postal_code') or '',
            r.get('address') or '',
            visit_str,
            store_str,
            status_str
        ]

        is_even = (row_idx % 2 == 0)

        for col_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = data_font
            cell.border = thin_border

            if is_even:
                cell.fill = alt_fill

            # 列ごとのアライメント
            if col_idx in [1, 9, 10, 11]:  # No., 出張, 店舗, 審査
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in [6, 7]:  # 電話, 郵便番号
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.number_format = "@"
            elif col_idx == 4:  # パスワード
                cell.font = pwd_font
                cell.alignment = Alignment(horizontal="left", vertical="center")
                cell.number_format = "@"
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # 列幅の自動調整
    col_widths = {
        1: 6,   # No.
        2: 24,  # 氏名
        3: 32,  # メールアドレス
        4: 18,  # パスワード
        5: 36,  # 専門分野
        6: 16,  # 電話番号
        7: 12,  # 郵便番号
        8: 36,  # 住所
        9: 10,  # 出張
        10: 10, # 店舗
        11: 12, # 審査
    }
    for col_idx, width in col_widths.items():
        col_letter = get_column_letter(col_idx)
        ws.column_dimensions[col_letter].width = width

    # ウィンドウ枠の固定 (ヘッダー行がスクロールしても固定)
    ws.freeze_panes = "A5"

    output_path = os.path.abspath("セラピスト_アカウント一覧.xlsx")
    wb.save(output_path)
    print(f"Excel file successfully generated at: {output_path}")

if __name__ == "__main__":
    main()
