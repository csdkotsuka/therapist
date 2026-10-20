'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { registerCustomerToSupabase } from '@/lib/supabase';
import { registerCustomerToFirebase } from '@/lib/firebase';
import {
  geocodeAddress,
  getCurrentGpsPosition,
  reverseGeocode,
  getFallbackCoordinates,
  PREFECTURE_COORDINATES,
} from '@/lib/geo';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Lock,
  User,
  Phone,
  MapPin,
  Mail,
  Eye,
  EyeOff,
  Navigation,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Database,
} from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { addCustomerUser, setUserLocation, isLiveSupabase } = useApp();

  // フォームステート
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [prefecture, setPrefecture] = useState('東京都');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');

  // 座標（全国展開・Uber Eats風近接検索用）
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 35.6580,
    lng: 139.7016,
  });

  // UI状態
  const [isLoadingPostal, setIsLoadingPostal] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<string | null>(null);

  // 郵便番号から住所を自動検索 (zipcloud API)
  const handlePostalLookup = async () => {
    const cleaned = postalCode.replace(/[^0-9]/g, '');
    if (cleaned.length !== 7) {
      setErrorMessage('郵便番号は7桁の半角数字で入力してください (例: 1500001)');
      return;
    }
    setErrorMessage(null);
    setIsLoadingPostal(true);

    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleaned}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        setPrefecture(item.address1);
        setCity(`${item.address2}${item.address3}`);

        // 住所から緯度経度を自動取得（全国展開のUber Eats風近接検索の基礎）
        const full = `${item.address1}${item.address2}${item.address3}`;
        const geo = await geocodeAddress(full);
        if (geo) {
          setCoords(geo);
        } else {
          setCoords(getFallbackCoordinates(item.address1));
        }
      } else {
        setErrorMessage('該当する住所が見つかりませんでした。住所を手動で入力してください。');
      }
    } catch {
      setErrorMessage('住所の自動取得に失敗しました。直接入力してください。');
    } finally {
      setIsLoadingPostal(false);
    }
  };

  // GPS現在地から自動入力
  const handleCurrentLocationLookup = async () => {
    setErrorMessage(null);
    setIsLoadingGps(true);
    try {
      const pos = await getCurrentGpsPosition();
      setCoords(pos);

      // 逆ジオコーディングで地名を取得
      const placeName = await reverseGeocode(pos.lat, pos.lng);
      if (placeName && !placeName.startsWith('現在地')) {
        // 都道府県の判定
        for (const pref of Object.keys(PREFECTURE_COORDINATES)) {
          if (placeName.includes(pref)) {
            setPrefecture(pref);
            const remaining = placeName.replace(pref, '').trim();
            setCity(remaining);
            break;
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || '現在地の取得に失敗しました');
    } finally {
      setIsLoadingGps(false);
    }
  };

  // アカウント作成送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // バリデーション
    if (!name.trim()) {
      setErrorMessage('お名前を入力してください');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('有効なメールアドレスを入力してください');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('パスワードは6文字以上で入力してください');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('有効な電話番号（10桁または11桁）を入力してください');
      return;
    }
    if (!city.trim() || !street.trim()) {
      setErrorMessage('市区町村と町名・番地を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // 最新の正確な緯度経度を確保
      let finalLat = coords.lat;
      let finalLng = coords.lng;
      const fullAddress = `${prefecture}${city}${street}${building ? ' ' + building : ''}`;

      const geo = await geocodeAddress(fullAddress);
      if (geo) {
        finalLat = geo.lat;
        finalLng = geo.lng;
      } else if (finalLat === 35.6580 && finalLng === 139.7016) {
        const fallback = getFallbackCoordinates(prefecture);
        finalLat = fallback.lat;
        finalLng = fallback.lng;
      }

      // 1. Supabase (Auth + profilesテーブル) へ保存
      const result = await registerCustomerToSupabase({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: cleanPhone,
        postalCode: postalCode.replace(/[^0-9]/g, ''),
        prefecture,
        city: city.trim(),
        street: street.trim(),
        building: building.trim(),
        lat: finalLat,
        lng: finalLng,
      });

      // 2. Firebase（オプション連携）
      try {
        await registerCustomerToFirebase({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: cleanPhone,
          postalCode: postalCode.replace(/[^0-9]/g, ''),
          prefecture,
          city: city.trim(),
          street: street.trim(),
          building: building.trim(),
          lat: finalLat,
          lng: finalLng,
        });
      } catch {
        // Firebase同期はオプショナル
      }

      // AppContext への即時反映
      const newCustomerProfile = {
        id: result.customer.id,
        name: result.customer.name,
        email: result.customer.email,
        phone: result.customer.phone,
        role: 'customer' as const,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(result.customer.name)}`,
        address: result.customer.address,
        lat: result.customer.lat,
        lng: result.customer.lng,
      };

      addCustomerUser(newCustomerProfile);
      setUserLocation({
        name: `${prefecture} ${city}`,
        lat: finalLat,
        lng: finalLng,
      });

      if (result.isSavedToSupabase) {
        setDatabaseStatus('Supabase Database (Auth & profiles) への保存が完了しました');
      } else {
        setDatabaseStatus('Supabase連携モード（ローカル保存完了）');
      }

      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'アカウント作成中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* 完了画面 */}
        {isSuccess ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                アカウント作成完了
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                ようこそ、{name} さん！
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                顧客アカウントの作成とデータベースへの登録が完了しました。
                ご指定の住所周辺で待機している凄腕セラピストを今すぐ探せます。
              </p>
            </div>

            {/* 登録内容サマリー */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">お名前</span>
                <span className="font-bold text-slate-800">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">電話番号</span>
                <span className="font-bold text-slate-800">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">出張先住所</span>
                <span className="font-bold text-slate-800 line-clamp-1">
                  {prefecture}{city}{street} {building}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">位置情報 (GPS/Geo)</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  緯度 {coords.lat.toFixed(4)}, 経度 {coords.lng.toFixed(4)}
                </span>
              </div>
              {databaseStatus && (
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>{databaseStatus}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full max-w-md mx-auto py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              <span>近くのセラピストを探す (Uber風)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ページタイトル */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>無料ですぐに予約できる顧客会員登録</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                顧客アカウントを作成
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                安心・安全な出張＆来店施術をお届けするため、最低限必要な情報のみをお預かりします。
              </p>
            </div>

            {/* セキュリティ＆プライバシー守り優先ポリシー（安心バッジ） */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-4 sm:p-5 text-xs text-emerald-900 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                    <span>最大限のプライバシー保護・守り優先設計</span>
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    ・登録項目は出張施術に不可欠な<strong>「お名前」「電話番号」「住所」</strong>のみに厳選しています。<br />
                    ・<strong>クレジットカード情報の事前登録は不要</strong>です（施術予約の決済時のみ安全に処理されます）。<br />
                    ・番地や部屋番号は<strong>「予約が確定した担当セラピストにのみ当日限定開示」</strong>され、外部に公開されることは一切ありません。
                  </p>
                </div>
              </div>
            </div>

            {/* エラーメッセージ */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 登録フォーム */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6"
            >
              {/* セクション 1: 基本認証情報 */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>基本情報（必須）</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* お名前 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      お名前（氏名） <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="山田 太郎"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      セラピストが訪問時にご本人確認を行います
                    </span>
                  </div>

                  {/* 電話番号 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      電話番号（緊急連絡用） <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="090-1234-5678"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      到着時のインターホン・緊急連絡のみに使用
                    </span>
                  </div>
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    メールアドレス（ログインID） <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* パスワード */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    パスワード <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6文字以上の英数字"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* セクション 2: 住所 & 位置情報（全国展開 & 近接検索の基盤） */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>出張先住所（必須）</span>
                  </h3>

                  {/* GPS現在地ボタン */}
                  <button
                    type="button"
                    onClick={handleCurrentLocationLookup}
                    disabled={isLoadingGps}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl transition flex items-center gap-1 border border-emerald-200"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLoadingGps ? 'animate-spin' : ''}`} />
                    <span>{isLoadingGps ? 'GPS取得中...' : '現在地から住所を自動設定'}</span>
                  </button>
                </div>

                {/* 郵便番号 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    郵便番号（ハイフンなし7桁）
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={8}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="1500001"
                      className="w-36 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={handlePostalLookup}
                      disabled={isLoadingPostal}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isLoadingPostal ? '検索中...' : '住所自動入力'}
                    </button>
                  </div>
                </div>

                {/* 都道府県 & 市区町村 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      都道府県 <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={prefecture}
                      onChange={(e) => {
                        setPrefecture(e.target.value);
                        setCoords(getFallbackCoordinates(e.target.value));
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    >
                      {Object.keys(PREFECTURE_COORDINATES).map((pref) => (
                        <option key={pref} value={pref}>
                          {pref}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      市区町村 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="渋谷区神宮前"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* 町名・番地 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    町名・丁目・番地 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="1-2-3"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                {/* 建物名・部屋番号 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    建物名・部屋番号（マンション・ホテル等）
                  </label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder="グリーンハイツ 302号室（または ホテル名と部屋番号）"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                    <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>建物名や部屋番号は予約確定までセラピストにも伏せられます</span>
                  </div>
                </div>

                {/* 全国展開・Uber Eats風 近接検索プレビュー */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">
                        Uber Eats スタイルの近接検索に対応
                      </span>
                      <span className="text-[10px] text-slate-500">
                        登録された住所から近くにいるセラピストを距離順で瞬時にマッチングします
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-600 font-mono">
                    {coords.lat.toFixed(2)}, {coords.lng.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>アカウントを作成中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>利用規約に同意してアカウントを作成する</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  すでにアカウントをお持ちの方・トップに戻る
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
