const fs = require('fs');
const crypto = require('crypto');

// 愛媛県 15市町のデータ（中心座標と代表的な町名）
const CITIES = [
  {
    name: '松山市',
    lat: 33.8392,
    lng: 132.7656,
    postal: '790-0003',
    towns: ['三番町', '大街道', '道後湯之町', '千舟町', '一番町', '湊町', '花園町', '平和通', '持田町', '古川北', '南江戸', '朝生田町', '和泉南', '石井', '久米', '空港通', '本町', '勝山町'],
    therapistCount: 13,
    customerCount: 39,
  },
  {
    name: '今治市',
    lat: 34.0660,
    lng: 132.9976,
    postal: '794-0015',
    towns: ['常盤町', '旭町', '南大門町', '別宮町', '波止浜', '片山', '中日吉町', '美須賀町', '馬越町'],
    therapistCount: 4,
    customerCount: 12,
  },
  {
    name: '新居浜市',
    lat: 33.9602,
    lng: 133.2831,
    postal: '792-0025',
    towns: ['昭和町', '坂井町', '繁本町', '一宮町', '中須賀町', '新須賀町', '磯浦町', '久保田町'],
    therapistCount: 3,
    customerCount: 9,
  },
  {
    name: '西条市',
    lat: 33.9182,
    lng: 133.1818,
    postal: '793-0030',
    towns: ['大町', '神拝', '栄町', '福武', '氷見', '新田', '喜多川', '小松町新屋敷'],
    therapistCount: 3,
    customerCount: 8,
  },
  {
    name: '四国中央市',
    lat: 33.9806,
    lng: 133.5806,
    postal: '799-0405',
    towns: ['三島中央', '川之江町', '金生町', '中之庄町', '土居町入野', '妻鳥町'],
    therapistCount: 2,
    customerCount: 6,
  },
  {
    name: '宇和島市',
    lat: 33.2263,
    lng: 132.5658,
    postal: '798-0034',
    towns: ['中央町', '錦町', '恵美須町', '寿町', '和霊町', '丸之内', '鶴島町'],
    therapistCount: 2,
    customerCount: 5,
  },
  {
    name: '大洲市',
    lat: 33.5074,
    lng: 132.5447,
    postal: '795-0054',
    towns: ['中村', '東大洲', '大洲', '若宮', '長浜町'],
    therapistCount: 1,
    customerCount: 3,
  },
  {
    name: '八幡浜市',
    lat: 33.4589,
    lng: 132.4243,
    postal: '796-0071',
    towns: ['新町', '江戸先', '昭和通', '天神通', '保内町川之石'],
    therapistCount: 1,
    customerCount: 3,
  },
  {
    name: '東温市',
    lat: 33.7909,
    lng: 132.8719,
    postal: '791-0211',
    towns: ['見奈良', '志津川', '横河原', '田窪', '北方'],
    therapistCount: 1,
    customerCount: 3,
  },
  {
    name: '伊予市',
    lat: 33.7577,
    lng: 132.7039,
    postal: '799-3113',
    towns: ['米湊', '下吾川', '湊', '双海町上灘'],
    therapistCount: 1,
    customerCount: 3,
  },
  {
    name: '松前町',
    lat: 33.7972,
    lng: 132.7142,
    postal: '791-3120',
    towns: ['筒井', '北黒田', '昌農内', '恵久美'],
    therapistCount: 1,
    customerCount: 3,
  },
  {
    name: '西予市',
    lat: 33.3644,
    lng: 132.5117,
    postal: '797-0015',
    towns: ['宇和町卯之町', '野村町', '城川町', '三瓶町朝立'],
    therapistCount: 1,
    customerCount: 2,
  },
  {
    name: '砥部町',
    lat: 33.7547,
    lng: 132.7947,
    postal: '791-2101',
    towns: ['宮内', '大南', '重光', '原町'],
    therapistCount: 1,
    customerCount: 2,
  },
  {
    name: '内子町',
    lat: 33.5350,
    lng: 132.6517,
    postal: '795-0301',
    towns: ['内子', '平岡', '五十崎', '城廻'],
    therapistCount: 1,
    customerCount: 1,
  },
  {
    name: '愛南町',
    lat: 32.9644,
    lng: 132.5647,
    postal: '798-4110',
    towns: ['城辺甲', '御荘平城', '一本松', '船越'],
    therapistCount: 1,
    customerCount: 1,
  },
];

const SURNAMES = [
  '越智', '村上', '渡部', '高橋', '井上', '伊藤', '山本', '中村', '菅', '藤原',
  '白石', '佐々木', '松本', '池内', '門田', '河野', '近藤', '石川', '矢野', '岡田',
  '兵頭', '宮本', '森', '大野', '玉井', '長谷川', '吉井', '毛利', '重松', '竹内',
  '清家', '赤松', '宇都宮', '山内', '三好', '渡辺', '佐藤', '鈴木', '田中', '小林',
  '加藤', '吉田', '山田', '山口', '斎藤', '松田', '木村', '林', '清水', '阿部'
];

const MALE_NAMES = [
  '健一', '大輔', '拓也', '翔太', '直樹', '俊介', '裕樹', '剛', '達也', '和也',
  '修平', '亮太', '哲也', '慎太郎', '龍之介', '康平', '雄大', '正人', '健太郎', '聡',
  '陽介', '真司', '祐介', '貴大', '圭介', '大樹', '航平', '悠人', '颯太', '陸'
];

const FEMALE_NAMES = [
  '麻美', '花子', '美咲', '彩乃', '優子', '葵', '美穂', '結衣', '陽子', '真由美',
  '恵美', '香織', '千春', '里奈', 'さくら', '奈々', '瞳', '愛', '明美', '朋子',
  '佳奈', '詩織', '七海', '美月', '陽菜', '琴音', '莉央', '芽依', '真央', '茜'
];

const THERAPIST_SPECIALTIES = [
  {
    bio: '理学療法士として愛媛県内の総合病院・リハビリセンターで12年の経験。解剖学に基づいた痛みの原因特定と根本アプローチを行います。',
    specs: ['理学療法', '腰痛・肩こり改善', '筋膜リリース', 'リハビリ支援'],
    categories: ['physical_therapy', 'chiropractic'],
  },
  {
    bio: '愛媛の豊かな自然に育まれた柑橘アロマやフランス産オーガニック精油を用いたリンパトリートメント。深い安らぎと巡りを整えます。',
    specs: ['アロマセラピー', 'リンパドレナージュ', '小顔ヘッドスパ', '自律神経調整'],
    categories: ['aroma', 'beauty'],
  },
  {
    bio: 'カイロプラクティック・骨盤矯正専門。ボキボキしない優しい手技で骨格と筋肉のバランスをリセットします。デスクワーク疲労に特化。',
    specs: ['カイロプラクティック', '骨盤矯正', '猫背・姿勢改善', '産後ケア'],
    categories: ['chiropractic', 'massage'],
  },
  {
    bio: '本場タイ政府公認スクール修了。「2人で行うヨガ」とも呼ばれるタイ古式マッサージで全身をゆっくり伸ばし、深層のコリを解放します。',
    specs: ['タイ古式マッサージ', '全身パートナーストレッチ', '可動域拡大', '疲労回復'],
    categories: ['massage', 'physical_therapy'],
  },
  {
    bio: '20年のキャリアを持つベテラン整体師。指圧と推拿（すいな）を組み合わせた深層筋肉ほぐしで、長年取れない頑固な凝りを解消します。',
    specs: ['本格もみほぐし', '深層筋アプローチ', '肩甲骨はがし', '足つぼ・リフレ'],
    categories: ['massage', 'chiropractic'],
  },
  {
    bio: '鍼灸師・あん摩マッサージ指圧師の国家資格保持。経絡とツボを的確に捉え、冷え性や不眠、慢性頭痛など身体の内側から整えます。',
    specs: ['経絡マッサージ', 'ツボ刺激', '眼精疲労ヘッドスパ', '冷え・むくみ改善'],
    categories: ['massage', 'physical_therapy'],
  },
];

const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
];
const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFloat(min, max, decimals = 4) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// RFC 4122 v4 UUID 生成
function genUUID() {
  return crypto.randomUUID();
}

console.log('Generating RFC 4122 v4 UUID-based Ehime dataset & Supabase SQL seed...');

// 1. 管理者（Admin）
const adminId = genUUID();
const profiles = [
  {
    id: adminId,
    role: 'admin',
    name: '愛媛プラットフォーム運営本部',
    email: 'admin@carehub.ehime.jp',
    phone: '089-912-2111',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    address: '愛媛県松山市一番町4丁目4-2 松山センタービル5F',
    postal_code: '790-0001',
    lat: 33.8415,
    lng: 132.7661,
  }
];

const therapistProfiles = {};
const services = [];
const therapistList = [];

let thSeq = 1;

// 2. セラピスト生成（36名）
CITIES.forEach((city) => {
  for (let i = 0; i < city.therapistCount; i++) {
    const isMale = Math.random() > 0.5;
    const surname = getRandomItem(SURNAMES);
    const firstName = getRandomItem(isMale ? MALE_NAMES : FEMALE_NAMES);
    const fullName = `${surname} ${firstName}`;
    const therapistId = genUUID();
    const avatar = getRandomItem(isMale ? MALE_AVATARS : FEMALE_AVATARS);
    const town = getRandomItem(city.towns);
    const block = `${getRandomInt(1, 5)}-${getRandomInt(1, 25)}`;
    const address = `愛媛県${city.name}${town}${block}`;
    
    const latOffset = getRandomFloat(-0.015, 0.015, 6);
    const lngOffset = getRandomFloat(-0.018, 0.018, 6);
    const lat = parseFloat((city.lat + latOffset).toFixed(6));
    const lng = parseFloat((city.lng + lngOffset).toFixed(6));

    const specProfile = getRandomItem(THERAPIST_SPECIALTIES);
    const isStore = Math.random() > 0.3;
    const isVisit = Math.random() > 0.15; // ほとんどが出張対応

    const profileObj = {
      id: therapistId,
      role: 'therapist',
      name: fullName,
      email: `therapist.${thSeq}@carehub.ehime.jp`,
      phone: `089-${getRandomInt(900, 999)}-${getRandomInt(1000, 9999)}`,
      avatar_url: avatar,
      address,
      postal_code: city.postal,
      lat,
      lng,
    };

    profiles.push(profileObj);
    therapistList.push(profileObj);

    const tpObj = {
      user_id: therapistId,
      bio: specProfile.bio,
      specialities: specProfile.specs,
      is_store_based: isStore || !isVisit,
      is_visit_based: isVisit,
      address,
      lat,
      lng,
      visit_radius_km: getRandomInt(10, 30),
      rating_avg: getRandomFloat(4.70, 5.0, 2),
      reviews_count: getRandomInt(8, 48),
      is_approved: true,
      stripe_account_id: `acct_ehime_${therapistId.replace(/-/g, '').slice(0, 16)}`,
    };

    therapistProfiles[therapistId] = tpObj;

    // メニュー（サービス）を2〜3件生成
    const serviceTemplates = [
      { title: `【一番人気】全身根本改善・${specProfile.specs[0]} 60分`, desc: `${city.name}エリアの出張・ご来店対応。不調の原因部位を丁寧にアセスメントし施術します。`, price: 6500, dur: 60, cat: specProfile.categories[0] },
      { title: `極上贅沢ボディケア＆${specProfile.specs[1]} 90分`, desc: `全身を余すところなくじっくりケア。日頃のお疲れや頑固な凝りをしっかりリセット。`, price: 9500, dur: 90, cat: specProfile.categories[0] },
      { title: `短時間集中クイックケア 45分`, desc: `お仕事の合間や育児のスキマ時間に。首肩や腰など重点部位を集中ケア。`, price: 4800, dur: 45, cat: specProfile.categories[1] || specProfile.categories[0] },
    ];

    const numSrv = getRandomInt(2, 3);
    for (let s = 0; s < numSrv; s++) {
      const srvTpl = serviceTemplates[s];
      services.push({
        id: genUUID(),
        therapist_id: therapistId,
        title: srvTpl.title,
        description: srvTpl.desc,
        price: srvTpl.price,
        duration_minutes: srvTpl.dur,
        category: srvTpl.cat,
        is_active: true,
      });
    }

    thSeq++;
  }
});

// 3. 顧客生成（100名）
const customers = [];
let custSeq = 1;

CITIES.forEach((city) => {
  for (let i = 0; i < city.customerCount; i++) {
    const isMale = Math.random() > 0.5;
    const surname = getRandomItem(SURNAMES);
    const firstName = getRandomItem(isMale ? MALE_NAMES : FEMALE_NAMES);
    const fullName = `${surname} ${firstName}`;
    const customerId = genUUID();
    const avatar = getRandomItem(isMale ? MALE_AVATARS : FEMALE_AVATARS);
    const town = getRandomItem(city.towns);
    const block = `${getRandomInt(1, 8)}-${getRandomInt(1, 30)}`;
    const mansion = Math.random() > 0.4 ? ` メゾン${city.name}${getRandomInt(101, 705)}号室` : '';
    const address = `愛媛県${city.name}${town}${block}${mansion}`;

    const latOffset = getRandomFloat(-0.02, 0.02, 6);
    const lngOffset = getRandomFloat(-0.025, 0.025, 6);
    const lat = parseFloat((city.lat + latOffset).toFixed(6));
    const lng = parseFloat((city.lng + lngOffset).toFixed(6));

    const custObj = {
      id: customerId,
      role: 'customer',
      name: fullName,
      email: `customer.${custSeq}@example.com`,
      phone: `080-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
      avatar_url: avatar,
      address,
      postal_code: city.postal,
      lat,
      lng,
    };

    profiles.push(custObj);
    customers.push(custObj);
    custSeq++;
  }
});

// 4. 予約（Bookings）とレビュー（Reviews）の生成
const bookings = [];
const reviews = [];

// (1) 出張中でリアルタイムマップ追跡可能な予約（confirmed）4件
for (let i = 0; i < 4; i++) {
  const cust = customers[i];
  const th = therapistList[i];
  const thProfile = therapistProfiles[th.id];
  const srv = services.find(s => s.therapist_id === th.id) || services[0];
  
  const currLat = parseFloat((cust.lat + (th.lat - cust.lat) * 0.4).toFixed(6));
  const currLng = parseFloat((cust.lng + (th.lng - cust.lng) * 0.4).toFixed(6));
  
  const total = srv.price;
  const fee = Math.floor(total * 0.2);
  const earn = total - fee;

  bookings.push({
    id: genUUID(),
    customer_id: cust.id,
    therapist_id: th.id,
    service_id: srv.id,
    booking_type: 'visit',
    scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString(),
    status: 'confirmed',
    total_amount: total,
    platform_fee: fee,
    therapist_earnings: earn,
    lat: cust.lat,
    lng: cust.lng,
    visit_address: cust.address,
    customer_notes: '現在在宅しております。駐車スペースは玄関前に1台分あります。',
    therapist_current_lat: currLat,
    therapist_current_lng: currLng,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  });
}

// (2) 申請中（pending）の予約 5件
for (let i = 4; i < 9; i++) {
  const cust = customers[i];
  const th = getRandomItem(therapistList);
  const srv = services.find(s => s.therapist_id === th.id) || services[0];
  const total = srv.price;
  const fee = Math.floor(total * 0.2);
  const earn = total - fee;

  bookings.push({
    id: genUUID(),
    customer_id: cust.id,
    therapist_id: th.id,
    service_id: srv.id,
    booking_type: 'visit',
    scheduled_at: new Date(Date.now() + 86400000 * getRandomInt(1, 3)).toISOString(),
    status: 'pending',
    total_amount: total,
    platform_fee: fee,
    therapist_earnings: earn,
    lat: cust.lat,
    lng: cust.lng,
    visit_address: cust.address,
    customer_notes: '肩甲骨まわりが非常に重いです。強めの指圧を希望します。',
    created_at: new Date(Date.now() - 3600000 * getRandomInt(1, 10)).toISOString(),
  });
}

// (3) 完了済み（completed）の予約 16件 & レビュー
const REVIEW_COMMENTS = [
  '出張で自宅まで来ていただけるのが本当にありがたいです。技術も素晴らしく、終わった瞬間に身体が軽くなりました！',
  'とても丁寧なカウンセリングと施術でした。愛媛でこんなハイレベルな出張ケアを受けられるのは最高です。',
  '腰痛がひどくて歩くのも辛かったのですが、施術後はスッキリ立てるようになりました。また定期的に依頼します。',
  '清潔感のあるリネンとアロマの心地よい香りで、自宅が一流スパのようになりました。大満足です！',
  '力加減が絶妙で、凝り固まった肩がほぐれました。セルフケアのストレッチ法も教えていただき感謝しています。',
  '予約から到着までとてもスムーズでした。マップで現在地がリアルタイムにわかるのも安心感があります。',
];

for (let i = 9; i < 25; i++) {
  const cust = getRandomItem(customers);
  const th = getRandomItem(therapistList);
  const thProfile = therapistProfiles[th.id];
  const srv = services.find(s => s.therapist_id === th.id) || services[0];
  const total = srv.price;
  const fee = Math.floor(total * 0.2);
  const earn = total - fee;

  const bId = genUUID();
  const isStore = Math.random() > 0.6;
  const scheduledTime = new Date(Date.now() - 86400000 * getRandomInt(2, 20)).toISOString();

  bookings.push({
    id: bId,
    customer_id: cust.id,
    therapist_id: th.id,
    service_id: srv.id,
    booking_type: isStore ? 'store' : 'visit',
    scheduled_at: scheduledTime,
    status: 'completed',
    total_amount: total,
    platform_fee: fee,
    therapist_earnings: earn,
    lat: isStore ? th.lat : cust.lat,
    lng: isStore ? th.lng : cust.lng,
    visit_address: isStore ? th.address : cust.address,
    customer_notes: 'いつもお世話になっております。',
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  });

  reviews.push({
    id: genUUID(),
    booking_id: bId,
    customer_id: cust.id,
    therapist_id: th.id,
    rating: getRandomInt(4, 5),
    comment: getRandomItem(REVIEW_COMMENTS),
    created_at: new Date(Date.now() - 86400000 * getRandomInt(1, 19)).toISOString(),
  });
}

// ==========================================
// A. TypeScript コード（src/lib/mockData.ts）の出力
// ==========================================
const outputCode = `// 愛媛県シミュレーションデータセット（愛媛県15市町・人口比率ベース・RFC 4122 v4 UUID準拠）
// セラピスト: ${therapistList.length}名, 顧客: ${customers.length}名, 運営本部: 1名
import { Profile, TherapistProfile, Service, Booking, Review } from '@/types';

export const initialProfiles: Profile[] = ${JSON.stringify(profiles, null, 2)};

export const initialTherapistProfiles: Record<string, TherapistProfile> = ${JSON.stringify(therapistProfiles, null, 2)};

export const initialServices: Service[] = ${JSON.stringify(services, null, 2)};

export const initialBookings: Booking[] = ${JSON.stringify(bookings, null, 2)};

export const initialReviews: Review[] = ${JSON.stringify(reviews, null, 2)};
`;

fs.writeFileSync('src/lib/mockData.ts', outputCode, 'utf8');
console.log('Generated src/lib/mockData.ts with valid UUIDv4');

// ==========================================
// B. Supabase SQL シードスクリプト（supabase/seed_ehime.sql）の出力
// ==========================================
function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escArr(arr) {
  if (!arr || arr.length === 0) return "'{}'::text[]";
  const elements = arr.map(item => `"${String(item).replace(/"/g, '\\"')}"`).join(',');
  return `'${elements}'::text[]`;
}

let sql = `-- ========================================================
-- 愛媛県シミュレーション初期データ (Seed Data - RFC 4122 v4 UUID 完全対応)
-- セラピスト: 36名 (県内人口比) / 顧客: 100名 / 運営本部: 1名
-- ========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 既存のダミーデータをクリーンアップ（必要に応じて有効化）
-- TRUNCATE TABLE public.reviews, public.bookings, public.services, public.therapist_profiles, public.profiles CASCADE;

-- ========================================================
-- 1. auth.users (Supabase 認証ユーザーの投入)
-- パスワードは共通で 'TestUser2026!'
-- ========================================================
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
  updated_at
)
VALUES
`;

const authRows = profiles.map(p => {
  return `  ('00000000-0000-0000-0000-000000000000', '${p.id}', 'authenticated', 'authenticated', ${esc(p.email)}, crypt('TestUser2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', ${esc(JSON.stringify({ name: p.name, role: p.role }))}, now(), now())`;
});

sql += authRows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';

// 2. public.profiles
sql += `-- ========================================================
-- 2. public.profiles (ユーザープロファイル)
-- ========================================================
INSERT INTO public.profiles (id, role, name, email, phone, avatar_url, address, postal_code, lat, lng)
VALUES
`;

const profileRows = profiles.map(p => {
  return `  ('${p.id}', '${p.role}', ${esc(p.name)}, ${esc(p.email)}, ${esc(p.phone)}, ${esc(p.avatar_url)}, ${esc(p.address)}, ${esc(p.postal_code)}, ${p.lat}, ${p.lng})`;
});

sql += profileRows.join(',\n') + `
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  avatar_url = EXCLUDED.avatar_url,
  address = EXCLUDED.address,
  postal_code = EXCLUDED.postal_code,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng;

`;

// 3. public.therapist_profiles
sql += `-- ========================================================
-- 3. public.therapist_profiles (セラピスト詳細情報 & PostGIS 位置情報)
-- ========================================================
INSERT INTO public.therapist_profiles (
  user_id, bio, specialities, is_store_based, is_visit_based,
  address, location, visit_radius_km, rating_avg, reviews_count,
  is_approved, stripe_account_id
)
VALUES
`;

const tpRows = Object.values(therapistProfiles).map(tp => {
  const locGeom = `ST_SetSRID(ST_MakePoint(${tp.lng}, ${tp.lat}), 4326)::geography`;
  return `  ('${tp.user_id}', ${esc(tp.bio)}, ${escArr(tp.specialities)}, ${tp.is_store_based}, ${tp.is_visit_based}, ${esc(tp.address)}, ${locGeom}, ${tp.visit_radius_km}, ${tp.rating_avg}, ${tp.reviews_count}, ${tp.is_approved}, ${esc(tp.stripe_account_id)})`;
});

sql += tpRows.join(',\n') + `
ON CONFLICT (user_id) DO UPDATE SET
  bio = EXCLUDED.bio,
  specialities = EXCLUDED.specialities,
  is_store_based = EXCLUDED.is_store_based,
  is_visit_based = EXCLUDED.is_visit_based,
  address = EXCLUDED.address,
  location = EXCLUDED.location,
  visit_radius_km = EXCLUDED.visit_radius_km,
  rating_avg = EXCLUDED.rating_avg,
  reviews_count = EXCLUDED.reviews_count,
  is_approved = EXCLUDED.is_approved;

`;

// 4. public.services
sql += `-- ========================================================
-- 4. public.services (施術メニュー)
-- ========================================================
INSERT INTO public.services (id, therapist_id, title, description, price, duration_minutes, category, is_active)
VALUES
`;

const srvRows = services.map(s => {
  return `  ('${s.id}', '${s.therapist_id}', ${esc(s.title)}, ${esc(s.description)}, ${s.price}, ${s.duration_minutes}, ${esc(s.category)}, ${s.is_active})`;
});

sql += srvRows.join(',\n') + `
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration_minutes = EXCLUDED.duration_minutes,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;

`;

// 5. public.bookings
sql += `-- ========================================================
-- 5. public.bookings (予約・出張トラッキング)
-- ========================================================
INSERT INTO public.bookings (
  id, customer_id, therapist_id, service_id, booking_type, scheduled_at,
  status, total_amount, platform_fee, therapist_earnings, location,
  visit_address, customer_notes, therapist_current_lat, therapist_current_lng, created_at
)
VALUES
`;

const bkRows = bookings.map(b => {
  const locGeom = `ST_SetSRID(ST_MakePoint(${b.lng}, ${b.lat}), 4326)::geography`;
  const tLat = b.therapist_current_lat !== undefined ? b.therapist_current_lat : 'NULL';
  const tLng = b.therapist_current_lng !== undefined ? b.therapist_current_lng : 'NULL';
  return `  ('${b.id}', '${b.customer_id}', '${b.therapist_id}', '${b.service_id}', '${b.booking_type}', '${b.scheduled_at}', '${b.status}', ${b.total_amount}, ${b.platform_fee}, ${b.therapist_earnings}, ${locGeom}, ${esc(b.visit_address)}, ${esc(b.customer_notes)}, ${tLat}, ${tLng}, '${b.created_at}')`;
});

sql += bkRows.join(',\n') + `
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  therapist_current_lat = EXCLUDED.therapist_current_lat,
  therapist_current_lng = EXCLUDED.therapist_current_lng;

`;

// 6. public.reviews
sql += `-- ========================================================
-- 6. public.reviews (口コミ・レビュー)
-- ========================================================
INSERT INTO public.reviews (id, booking_id, customer_id, therapist_id, rating, comment, created_at)
VALUES
`;

const revRows = reviews.map(r => {
  return `  ('${r.id}', '${r.booking_id}', '${r.customer_id}', '${r.therapist_id}', ${r.rating}, ${esc(r.comment)}, '${r.created_at}')`;
});

sql += revRows.join(',\n') + `
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment;

`;

// 7. public.platform_settings
sql += `-- ========================================================
-- 7. public.platform_settings (手数料設定)
-- ========================================================
INSERT INTO public.platform_settings (key, value)
VALUES
  ('fee_rate', '{"percentage": 20}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value;
`;

fs.writeFileSync('supabase/seed_ehime.sql', sql, 'utf8');
console.log('Generated supabase/seed_ehime.sql');

console.log(`\n=== SUMMARY ===`);
console.log(`Profiles: ${profiles.length} (Therapists: ${therapistList.length}, Customers: ${customers.length}, Admin: 1)`);
console.log(`Services: ${services.length}`);
console.log(`Bookings: ${bookings.length}`);
console.log(`Reviews: ${reviews.length}`);
