'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  geocodeAddress,
  getCurrentGpsPosition,
  reverseGeocode,
  getFallbackCoordinates,
  PREFECTURE_COORDINATES,
} from '@/lib/geo';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  Building,
  Home,
  Sliders,
  Plus,
  X,
  Sparkles,
  Clock,
  Car,
  Compass,
  Copy,
  Gift,
  Tag,
  Percent,
} from 'lucide-react';

const COMMON_SPECIALTIES = [
  '理学療法',
  '腰痛・肩こり改善',
  '筋膜リリース',
  'リハビリ支援',
  'アロマセラピー',
  'リンパドレナージュ',
  '小顔ヘッドスパ',
  '自律神経調整',
  'カイロプラクティック',
  '骨盤矯正',
  '猫背・姿勢改善',
  '産後ケア',
  'タイ古式マッサージ',
  '全身パートナーストレッチ',
  '本格もみほぐし',
  '深層筋アプローチ',
  '肩甲骨はがし',
  '足つぼ・リフレ',
  '鍼灸・経絡マッサージ',
  '眼精疲労ケア',
];

const COMMON_FACILITIES = [
  '完全個室',
  '着替え無料貸出',
  '専用駐車場あり',
  '駅近（徒歩5分以内）',
  'シャワー完備',
  '女性専用フロア',
  'ペア・2名同時可',
  'クレジットカード可',
  '電子マネー・QR決済可',
  'バリアフリー対応',
  'ドリンクサービス',
  'パウダールーム完備',
];

export const TherapistProfileEdit: React.FC<{ therapistId?: string }> = ({ therapistId }) => {
  const { currentUser, allUsers, therapistProfiles, updateTherapistInfo } = useApp();
  const targetUser = (therapistId ? allUsers.find((u) => u.id === therapistId) : null) || currentUser;
  const therapist = therapistProfiles[targetUser.id];

  const [name, setName] = useState(targetUser.name || '');
  const [phone, setPhone] = useState(targetUser.phone || '');
  const [email, setEmail] = useState(targetUser.email || '');
  const [postalCode, setPostalCode] = useState(targetUser.postal_code || '');

  // 拠点・出張出発地住所
  const [address, setAddress] = useState(therapist?.address || targetUser.address || '');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: therapist?.lat || targetUser.lat || 33.8392,
    lng: therapist?.lng || targetUser.lng || 132.7656,
  });

  // 施術スタイル・出張設定
  const [isStoreBased, setIsStoreBased] = useState<boolean>(therapist?.is_store_based ?? true);
  const [isVisitBased, setIsVisitBased] = useState<boolean>(therapist?.is_visit_based ?? true);
  const [visitRadiusKm, setVisitRadiusKm] = useState<number>(therapist?.visit_radius_km ?? 15);

  // 店舗・サロン詳細情報
  const [storeName, setStoreName] = useState(therapist?.store_name || '');
  const [storeAddress, setStoreAddress] = useState(therapist?.store_address || therapist?.address || '');
  const [storeAccess, setStoreAccess] = useState(therapist?.store_access || '');
  const [storeParking, setStoreParking] = useState(therapist?.store_parking || '');
  const [storeHours, setStoreHours] = useState(therapist?.store_hours || '');
  const [storeFacilities, setStoreFacilities] = useState<string[]>(
    therapist?.store_facilities || ['完全個室', '着替え無料貸出', 'クレジットカード可']
  );
  const [storeNotes, setStoreNotes] = useState(therapist?.store_notes || '');

  // プロフィール・専門分野
  const [bio, setBio] = useState(therapist?.bio || '');
  const [specialities, setSpecialities] = useState<string[]>(therapist?.specialities || []);
  const [newSpecialityInput, setNewSpecialityInput] = useState('');

  // 特典・キャンペーン設定
  const [hasCampaign, setHasCampaign] = useState<boolean>(Boolean(therapist?.campaign));
  const [campaignBadge, setCampaignBadge] = useState<string>(therapist?.campaign?.badge || '初回1,000円引');
  const [campaignTitle, setCampaignTitle] = useState<string>(therapist?.campaign?.title || '初回限定1,000円割引キャンペーン');
  const [campaignDescription, setCampaignDescription] = useState<string>(therapist?.campaign?.description || '');
  const [campaignValidUntil, setCampaignValidUntil] = useState<string>(therapist?.campaign?.valid_until || '');
  const [campaignDiscountType, setCampaignDiscountType] = useState<'fixed' | 'percent' | 'gift'>(
    therapist?.campaign?.discount_type || 'fixed'
  );
  const [campaignDiscountValue, setCampaignDiscountValue] = useState<number>(
    therapist?.campaign?.discount_value ?? 1000
  );

  const [isLoadingPostal, setIsLoadingPostal] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // targetUser や therapist が変わった時の同期
  useEffect(() => {
    setName(targetUser.name || '');
    setPhone(targetUser.phone || '');
    setEmail(targetUser.email || '');
    setPostalCode(targetUser.postal_code || '');
    if (therapist) {
      setAddress(therapist.address || targetUser.address || '');
      setCoords({
        lat: therapist.lat || targetUser.lat || 33.8392,
        lng: therapist.lng || targetUser.lng || 132.7656,
      });
      setBio(therapist.bio || '');
      setSpecialities(therapist.specialities || []);
      setIsStoreBased(therapist.is_store_based);
      setIsVisitBased(therapist.is_visit_based);
      setVisitRadiusKm(therapist.visit_radius_km || 15);

      // 店舗情報の同期
      setStoreName(therapist.store_name || `${targetUser.name} サロン`);
      setStoreAddress(therapist.store_address || therapist.address || targetUser.address || '');
      setStoreAccess(therapist.store_access || '');
      setStoreParking(therapist.store_parking || '');
      setStoreHours(therapist.store_hours || '10:00 〜 20:00（不定休）');
      setStoreFacilities(therapist.store_facilities || ['完全個室', '着替え無料貸出', 'クレジットカード可']);
      setStoreNotes(therapist.store_notes || '');

      // 特典・キャンペーンの同期
      setHasCampaign(Boolean(therapist.campaign));
      if (therapist.campaign) {
        setCampaignBadge(therapist.campaign.badge || '初回1,000円引');
        setCampaignTitle(therapist.campaign.title || '初回限定1,000円割引キャンペーン');
        setCampaignDescription(therapist.campaign.description || '');
        setCampaignValidUntil(therapist.campaign.valid_until || '');
        setCampaignDiscountType(therapist.campaign.discount_type || 'fixed');
        setCampaignDiscountValue(therapist.campaign.discount_value ?? 1000);
      }
    }
  }, [targetUser, therapist]);

  // 郵便番号からの住所検索 (zipcloud API)
  const handlePostalLookup = async (target: 'address' | 'storeAddress') => {
    const cleaned = postalCode.replace(/[^0-9]/g, '');
    if (cleaned.length !== 7) {
      setErrorMessage('郵便番号は7桁の数字で入力してください（例: 790-0003）');
      return;
    }

    setIsLoadingPostal(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleaned}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newAddr = `${result.address1}${result.address2}${result.address3}`;
        if (target === 'address') {
          setAddress(newAddr);
        } else {
          setStoreAddress(newAddr);
        }

        const geoResult = await geocodeAddress(newAddr);
        if (geoResult) {
          setCoords({ lat: geoResult.lat, lng: geoResult.lng });
        }
      } else {
        setErrorMessage('該当する住所が見つかりませんでした。');
      }
    } catch {
      setErrorMessage('住所の自動検索に失敗しました。');
    } finally {
      setIsLoadingPostal(false);
    }
  };

  // 実端末GPSから現在地・拠点を自動取得
  const handleGetGps = async () => {
    setIsLoadingGps(true);
    setErrorMessage(null);
    try {
      const position = await getCurrentGpsPosition();
      setCoords(position);
      const placeName = await reverseGeocode(position.lat, position.lng);
      if (placeName) {
        setAddress(placeName);
        if (!storeAddress) setStoreAddress(placeName);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'GPS位置情報の取得に失敗しました。');
    } finally {
      setIsLoadingGps(false);
    }
  };

  // 専門分野の追加・削除
  const handleAddSpeciality = (spec: string) => {
    const trimmed = spec.trim();
    if (trimmed && !specialities.includes(trimmed)) {
      setSpecialities([...specialities, trimmed]);
    }
    setNewSpecialityInput('');
  };
  const handleRemoveSpeciality = (spec: string) => {
    setSpecialities(specialities.filter((s) => s !== spec));
  };

  // 店舗設備の追加・トグル
  const handleToggleFacility = (fac: string) => {
    if (storeFacilities.includes(fac)) {
      setStoreFacilities(storeFacilities.filter((f) => f !== fac));
    } else {
      setStoreFacilities([...storeFacilities, fac]);
    }
  };

  // 拠点住所を店舗住所にコピー
  const handleCopyAddressToStore = () => {
    if (address) {
      setStoreAddress(address);
    }
  };

  // 保存実行
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('お名前を入力してください。');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('電話番号を入力してください。');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('拠点住所を入力してください。');
      return;
    }
    if (isStoreBased && !storeAddress.trim()) {
      setErrorMessage('店舗施術を受け付ける場合は、店舗住所を入力してください。');
      return;
    }
    if (!isStoreBased && !isVisitBased) {
      setErrorMessage('出張施術または店舗施術のどちらか一方は必ず有効にしてください。');
      return;
    }

    setIsSubmitting(true);
    try {
      // 住所が変わっている場合は最新座標を再確認
      let finalCoords = coords;
      const targetAddrForCoords = isStoreBased && storeAddress.trim() ? storeAddress.trim() : address.trim();
      const geoResult = await geocodeAddress(targetAddrForCoords);
      if (geoResult) {
        finalCoords = { lat: geoResult.lat, lng: geoResult.lng };
      }

      await updateTherapistInfo(
        targetUser.id,
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          postal_code: postalCode.trim(),
          lat: finalCoords.lat,
          lng: finalCoords.lng,
        },
        {
          bio: bio.trim(),
          specialities,
          is_store_based: isStoreBased,
          is_visit_based: isVisitBased,
          visit_radius_km: visitRadiusKm,
          address: address.trim(),
          lat: finalCoords.lat,
          lng: finalCoords.lng,
          // 店舗情報
          store_name: isStoreBased ? (storeName.trim() || `${name} サロン`) : undefined,
          store_address: isStoreBased ? storeAddress.trim() : undefined,
          store_access: isStoreBased ? storeAccess.trim() : undefined,
          store_parking: isStoreBased ? storeParking.trim() : undefined,
          store_hours: isStoreBased ? storeHours.trim() : undefined,
          store_facilities: isStoreBased ? storeFacilities : undefined,
          store_notes: isStoreBased ? storeNotes.trim() : undefined,
          // 特典・キャンペーン情報
          campaign: hasCampaign
            ? {
                badge: campaignBadge.trim() || '特典あり',
                title: campaignTitle.trim() || campaignBadge.trim(),
                description: campaignDescription.trim(),
                valid_until: campaignValidUntil || undefined,
                discount_type: campaignDiscountType,
                discount_value: Number(campaignDiscountValue) || 0,
              }
            : undefined,
        }
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'プロフィールの保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>セラピスト基本情報・店舗・出張設定</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              顧客への公開プロフィール、店舗情報、専門分野、施術スタイル、出張対応エリア等を設定できます。
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {therapist?.is_approved ? '承認済セラピスト' : '審査中'}
          </span>
        </div>
      </div>

      {/* 成功メッセージ */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>セラピストおよび店舗情報を正常に更新しました！顧客の検索・予約画面へ即時反映されます。</span>
        </div>
      )}

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報セクション */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>基本情報・連絡先</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                セラピスト氏名 / 屋号 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 佐藤 健一"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                電話番号（連絡先） <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="例: 089-912-2111"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500 shadow-2xs font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                メールアドレス（アカウントログイン用）
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="例: therapist@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500 shadow-2xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 施術スタイル選択（出張 vs 店舗） */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>施術スタイルの選択</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                isVisitBased
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 ring-1 ring-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={isVisitBased}
                onChange={(e) => setIsVisitBased(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold block">出張施術 (訪問) を受け付ける</span>
                  <span className="text-[10px] text-slate-500">お客様のご自宅や滞在ホテル等へ伺います</span>
                </div>
              </div>
            </label>

            <label
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                isStoreBased
                  ? 'bg-teal-50/60 border-teal-300 text-teal-900 ring-1 ring-teal-500/20'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={isStoreBased}
                onChange={(e) => setIsStoreBased(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold block">店舗・サロン施術を受け付ける</span>
                  <span className="text-[10px] text-slate-500">お客様があなたのサロン・店舗へ来店します</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 店舗・サロン詳細情報（店舗ありの場合に強調表示） */}
        {/* ======================================================== */}
        {isStoreBased && (
          <div className="p-5 bg-teal-50/50 rounded-2xl border-2 border-teal-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-teal-100 pb-2">
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-teal-700" />
                <span>店舗・サロン情報の詳細設定（顧客来店用）</span>
              </h4>
              <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                店舗あり
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  店舗・サロン名（屋号） <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="例: Care KURU 松山中央サロン"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-teal-500 shadow-2xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    営業時間・定休日
                  </label>
                  <span className="text-[10px] text-teal-700 bg-teal-100/70 px-1.5 py-0.2 rounded font-bold">
                    シフト設定と連動
                  </span>
                </div>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={storeHours}
                    onChange={(e) => setStoreHours(e.target.value)}
                    placeholder="例: 10:00 〜 20:00 (水曜定休)"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-teal-500 shadow-2xs"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  ※「営業時間・シフト・出張設定」タブで設定した受付曜日・時間帯が自動連動して反映されます（ここでの直接微修正も可能です）。
                </p>
              </div>

              {/* 店舗住所 */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    店舗の所在地（お客様が来店する住所） <span className="text-rose-500">*</span>
                  </label>
                  {address && address !== storeAddress && (
                    <button
                      type="button"
                      onClick={handleCopyAddressToStore}
                      className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 bg-white border border-teal-200 px-2 py-0.5 rounded-lg shadow-2xs transition"
                    >
                      <Copy className="w-3 h-3" />
                      <span>拠点住所を店舗住所にコピー</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="例: 愛媛県松山市大街道2丁目5-1 松山ビル2F"
                    required={isStoreBased}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-teal-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* 最寄駅・アクセス */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  最寄り駅・アクセス・道順
                </label>
                <div className="relative">
                  <Compass className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={storeAccess}
                    onChange={(e) => setStoreAccess(e.target.value)}
                    placeholder="例: 伊予鉄「大街道駅」より徒歩2分"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-teal-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* 駐車場情報 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  駐車場情報
                </label>
                <div className="relative">
                  <Car className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={storeParking}
                    onChange={(e) => setStoreParking(e.target.value)}
                    placeholder="例: 専用駐車場2台あり（無料）/ 近隣コインP提携"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-teal-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* 店舗設備・特徴タグ */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  店舗設備・サービス（お客様へのアピールポイント）
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_FACILITIES.map((fac) => {
                    const isSelected = storeFacilities.includes(fac);
                    return (
                      <button
                        key={fac}
                        type="button"
                        onClick={() => handleToggleFacility(fac)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 font-medium ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{fac}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ご来店時の注意事項 */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ご来店時のご案内・注意事項
                </label>
                <textarea
                  rows={2}
                  value={storeNotes}
                  onChange={(e) => setStoreNotes(e.target.value)}
                  placeholder="例: 完全予約制のためご予約の5分前にお越しください。オートロックのため「201」をお呼び出しください。"
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-teal-500 shadow-2xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* 出張施術・対応エリア設定（出張ありの場合） */}
        {isVisitBased && (
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>出張施術・対応エリア設定</span>
            </h4>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  出張対応可能エリア半径: <span className="text-emerald-700 font-black text-sm">{visitRadiusKm} km</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  拠点から片道約 {Math.round(visitRadiusKm * 2)} 分圏内
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={visitRadiusKm}
                onChange={(e) => setVisitRadiusKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5 km (近隣のみ)</span>
                <span>20 km</span>
                <span>35 km</span>
                <span>50 km (広域対応)</span>
              </div>
            </div>
          </div>
        )}

        {/* 拠点所在地（出張の出発拠点） */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>拠点所在地（出張の出発地点 / 距離計算の基準地）</span>
            </h4>
            <button
              type="button"
              onClick={handleGetGps}
              disabled={isLoadingGps}
              className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition"
            >
              <Navigation className="w-3 h-3 text-sky-600" />
              <span>{isLoadingGps ? 'GPS測位中...' : '実端末GPSから設定'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 max-w-xs">
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="郵便番号 (例: 7900003)"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-emerald-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={() => handlePostalLookup('address')}
              disabled={isLoadingPostal}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              {isLoadingPostal ? '検索中...' : '住所自動入力'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              住所（市町名・番地・建物名・号室） <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例: 愛媛県松山市三番町4丁目1-5"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500 shadow-2xs"
            />
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
              <span>緯度: {coords.lat.toFixed(5)}</span>
              <span>経度: {coords.lng.toFixed(5)}</span>
              <span className="text-slate-400">（距離計算・マップ表示に連動）</span>
            </div>
          </div>
        </div>

        {/* 🎁 特典・キャンペーン設定セクション */}
        <div className="p-5 bg-gradient-to-br from-amber-50/70 via-rose-50/40 to-amber-50/50 rounded-2xl border-2 border-amber-300/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>特典・キャンペーン設定</span>
                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    集客力UP
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  トップ画面や検索結果で「🎁 特典・キャンペーンあり」として優先表示され、目立つバッジが付きます。
                </p>
              </div>
            </div>

            {/* トグルスイッチ */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={hasCampaign}
                onChange={(e) => setHasCampaign(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2 text-xs font-bold text-slate-700">
                {hasCampaign ? 'キャンペーン掲載中' : 'キャンペーン停止中'}
              </span>
            </label>
          </div>

          {hasCampaign ? (
            <div className="pt-2 border-t border-amber-200/80 space-y-4">
              {/* かんたんプリセット */}
              <div>
                <span className="text-[11px] font-bold text-amber-900 block mb-1.5">
                  ワンタップで入力（プリセット）:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      badge: '初回1,000円引',
                      title: '【初回限定】1,000円割引キャンペーン',
                      desc: '初めてご利用いただくお客様限定で、全メニュー1,000円OFFで施術いたします！',
                      type: 'fixed' as const,
                      val: 1000,
                    },
                    {
                      badge: 'OPEN記念20%OFF',
                      title: 'OPEN記念！全メニュー20%割引',
                      desc: '期間限定で全コース施術料金より20%OFFにてご提供いたします。',
                      type: 'percent' as const,
                      val: 20,
                    },
                    {
                      badge: 'ヘッドスパ10分無料',
                      title: '極上ドライヘッドスパ（10分）無料プレゼント',
                      desc: '60分以上のボディケアコースをご予約いただいた方に、ヘッドスパを無料で延長サービス！',
                      type: 'gift' as const,
                      val: 0,
                    },
                    {
                      badge: '出張費無料',
                      title: '出張交通費0円キャンペーン',
                      desc: '対応エリア内のお客様のご自宅・オフィスへの出張費がすべて無料となります。',
                      type: 'gift' as const,
                      val: 0,
                    },
                    {
                      badge: '骨盤診断無料',
                      title: '専門セラピストによる骨盤・姿勢診断プレゼント',
                      desc: '施術前に骨盤の歪みや姿勢バランスを無料で測定・チェックいたします。',
                      type: 'gift' as const,
                      val: 0,
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCampaignBadge(preset.badge);
                        setCampaignTitle(preset.title);
                        setCampaignDescription(preset.desc);
                        setCampaignDiscountType(preset.type);
                        setCampaignDiscountValue(preset.val);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-medium transition shadow-2xs flex items-center gap-1 active:scale-95"
                    >
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>{preset.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* バッジ文字 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    バッジ表示文字（写真の上に表示されるラベル） <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={campaignBadge}
                    onChange={(e) => setCampaignBadge(e.target.value)}
                    placeholder="例: 初回1,000円引、20%OFF、ヘッドスパ無料"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-rose-600 focus:outline-rose-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">※全角12文字程度がおすすめです</p>
                </div>

                {/* キャンペーン見出し */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    キャンペーン名・見出し <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    placeholder="例: 【初回限定】1,000円割引キャンペーン"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* 特典タイプと値 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">特典の種類</label>
                  <select
                    value={campaignDiscountType}
                    onChange={(e) => setCampaignDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500"
                  >
                    <option value="fixed">定額値引き (円)</option>
                    <option value="percent">定率値引き (%)</option>
                    <option value="gift">無料サービス・特典付与</option>
                  </select>
                </div>

                {campaignDiscountType !== 'gift' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {campaignDiscountType === 'fixed' ? '割引金額 (円)' : '割引率 (%)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={campaignDiscountValue}
                      onChange={(e) => setCampaignDiscountValue(Number(e.target.value))}
                      placeholder={campaignDiscountType === 'fixed' ? '1000' : '20'}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    有効期限（空欄なら無期限）
                  </label>
                  <input
                    type="date"
                    value={campaignValidUntil}
                    onChange={(e) => setCampaignValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* キャンペーン詳細説明 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  特典の詳細説明・対象条件
                </label>
                <textarea
                  rows={2}
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  placeholder="例: 初めて当店をご利用のお客様限定。予約時の施術料金より自動的にお値引きいたします。"
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>

              {/* リアルタイムプレビュー */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">顧客画面でのプレビュー表示:</span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-black shadow-xs">
                  <Gift className="w-3.5 h-3.5" />
                  <span>{campaignBadge || '特典あり'}</span>
                </div>
                {campaignTitle && (
                  <p className="text-xs font-bold text-slate-800 mt-1">{campaignTitle}</p>
                )}
                {campaignDescription && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{campaignDescription}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2 text-[11px] text-slate-500">
              現在キャンペーンは設定されていません。「キャンペーン掲載中」に切り替えると、お客様の検索画面で優先表示されアピールできます。
            </div>
          )}
        </div>

        {/* 自己紹介 & 専門分野 */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>プロフィール文章・専門分野</span>
          </h4>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              自己紹介・経歴・メッセージ
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="経歴、施術のこだわり、国家資格（理学療法士・鍼灸師等）、どのようなお悩みをお持ちの方におすすめかを記入してください..."
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-emerald-500 shadow-2xs leading-relaxed"
            />
          </div>

          {/* 専門分野タグ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              専門分野・得意な手技（複数選択・追加可能）
            </label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {specialities.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                >
                  <span>{spec}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpeciality(spec)}
                    className="hover:text-rose-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {specialities.length === 0 && (
                <span className="text-xs text-slate-400 py-1">未設定です。以下の候補から追加してください。</span>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">候補からワンクリック追加:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SPECIALTIES.map((spec) => {
                  const isSelected = specialities.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleAddSpeciality(spec)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-300 hover:border-emerald-300'
                      }`}
                    >
                      + {spec}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 max-w-sm">
              <input
                type="text"
                value={newSpecialityInput}
                onChange={(e) => setNewSpecialityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpeciality(newSpecialityInput);
                  }
                }}
                placeholder="自由に入力して追加..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleAddSpeciality(newSpecialityInput)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shrink-0"
              >
                追加
              </button>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? '保存中...' : 'セラピスト・店舗情報を保存する'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
