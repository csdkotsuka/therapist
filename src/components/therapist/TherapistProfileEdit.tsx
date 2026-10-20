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

export const TherapistProfileEdit: React.FC = () => {
  const { currentUser, therapistProfiles, updateTherapistInfo } = useApp();
  const therapist = therapistProfiles[currentUser.id];

  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [postalCode, setPostalCode] = useState(currentUser.postal_code || '');

  // 住所・位置情報
  const [address, setAddress] = useState(therapist?.address || currentUser.address || '');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: therapist?.lat || currentUser.lat || 33.8392,
    lng: therapist?.lng || currentUser.lng || 132.7656,
  });

  // セラピスト固有設定
  const [bio, setBio] = useState(therapist?.bio || '');
  const [specialities, setSpecialities] = useState<string[]>(therapist?.specialities || []);
  const [newSpecialityInput, setNewSpecialityInput] = useState('');
  const [isStoreBased, setIsStoreBased] = useState<boolean>(therapist?.is_store_based ?? true);
  const [isVisitBased, setIsVisitBased] = useState<boolean>(therapist?.is_visit_based ?? true);
  const [visitRadiusKm, setVisitRadiusKm] = useState<number>(therapist?.visit_radius_km ?? 15);

  const [isLoadingPostal, setIsLoadingPostal] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // currentUser や therapist が変わった時の同期
  useEffect(() => {
    setName(currentUser.name || '');
    setPhone(currentUser.phone || '');
    setEmail(currentUser.email || '');
    setPostalCode(currentUser.postal_code || '');
    if (therapist) {
      setAddress(therapist.address || currentUser.address || '');
      setCoords({
        lat: therapist.lat || currentUser.lat || 33.8392,
        lng: therapist.lng || currentUser.lng || 132.7656,
      });
      setBio(therapist.bio || '');
      setSpecialities(therapist.specialities || []);
      setIsStoreBased(therapist.is_store_based);
      setIsVisitBased(therapist.is_visit_based);
      setVisitRadiusKm(therapist.visit_radius_km || 15);
    }
  }, [currentUser, therapist]);

  // 郵便番号からの住所検索 (zipcloud API)
  const handlePostalLookup = async () => {
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
        setAddress(newAddr);

        // ジオコーディングで座標も自動取得
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
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'GPS位置情報の取得に失敗しました。');
    } finally {
      setIsLoadingGps(false);
    }
  };

  // 専門分野の追加
  const handleAddSpeciality = (spec: string) => {
    const trimmed = spec.trim();
    if (trimmed && !specialities.includes(trimmed)) {
      setSpecialities([...specialities, trimmed]);
    }
    setNewSpecialityInput('');
  };

  // 専門分野の削除
  const handleRemoveSpeciality = (spec: string) => {
    setSpecialities(specialities.filter((s) => s !== spec));
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
      setErrorMessage('拠点または店舗の住所を入力してください。');
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
      if (!coords.lat || !coords.lng) {
        const geoResult = await geocodeAddress(address);
        if (geoResult) {
          finalCoords = { lat: geoResult.lat, lng: geoResult.lng };
        }
      }

      await updateTherapistInfo(
        currentUser.id,
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
              <span>セラピスト基本情報・プロフィールの編集</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              顧客への公開プロフィール、専門分野、施術スタイル、出張対応エリア等を設定できます。
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
          <span>セラピスト情報を正常に更新しました！顧客の検索・予約画面へ即時反映されます。</span>
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
                セラピスト名 / 屋号 <span className="text-rose-500">*</span>
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

        {/* 施術スタイル & 出張エリア設定 */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>施術スタイル・出張対応エリア</span>
          </h4>

          {/* 施術スタイルのチェックボックス */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                isVisitBased
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
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
                <Home className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold block">出張施術 (訪問) を受け付ける</span>
                  <span className="text-[10px] text-slate-500">お客様のご自宅や指定場所へ伺います</span>
                </div>
              </div>
            </label>

            <label
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                isStoreBased
                  ? 'bg-teal-50/60 border-teal-300 text-teal-900'
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
                <Building className="w-4 h-4 text-teal-600" />
                <div>
                  <span className="text-xs font-bold block">店舗・サロン施術を受け付ける</span>
                  <span className="text-[10px] text-slate-500">登録住所の拠点へお客様がご来店</span>
                </div>
              </div>
            </label>
          </div>

          {/* 出張可能半径スライダー */}
          {isVisitBased && (
            <div className="pt-2 border-t border-slate-200/60">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  出張可能エリア半径: <span className="text-emerald-700 font-black text-sm">{visitRadiusKm} km</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  拠点住所から片道約 {Math.round(visitRadiusKm * 2)} 分圏内
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
          )}
        </div>

        {/* 拠点・店舗の所在地（住所） */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>拠点・店舗の所在地（出張の出発点・来店場所）</span>
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

          {/* 郵便番号自動入力 */}
          <div className="flex items-center gap-2 max-w-xs">
            <div className="relative flex-1">
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="郵便番号 (例: 7900003)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-emerald-500 shadow-2xs"
              />
            </div>
            <button
              type="button"
              onClick={handlePostalLookup}
              disabled={isLoadingPostal}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              {isLoadingPostal ? '検索中...' : '住所自動入力'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              詳細住所（市町名・番地・建物名・号室） <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例: 愛媛県松山市三番町4丁目1-5 メディカルビル3F"
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
            
            {/* 現在設定中のタグ */}
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

            {/* 代表的な候補からワンクリック追加 */}
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

            {/* 自由追加入力 */}
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
            <span>{isSubmitting ? '保存中...' : 'セラピスト情報を保存する'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
