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
  AlertCircle,
  Database,
} from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { addCustomerUser, setUserLocation } = useApp();

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

  // 座標（近接検索用）
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
        setBuilding(''); // 郵便番号変更時は前回のマンション名をクリア

        const full = `${item.address1}${item.address2}${item.address3}`;
        const geo = await geocodeAddress(full);
        if (geo) {
          setCoords(geo);
        } else {
          setCoords(getFallbackCoordinates(item.address1));
        }
      } else {
        setErrorMessage('該当する住所が見つかりませんでした');
      }
    } catch {
      setErrorMessage('住所の自動取得に失敗しました');
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

      const placeName = await reverseGeocode(pos.lat, pos.lng);
      if (placeName && !placeName.startsWith('現在地')) {
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

      // Supabase へ保存
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

      // Firebase（オプショナル）
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
        // ignore
      }

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
        setDatabaseStatus('Supabase Database へ保存完了');
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

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8">
        {/* 完了画面 */}
        {isSuccess ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                アカウントを作成しました
              </h2>
              <p className="text-xs text-slate-600">
                ようこそ、{name} さん
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">お名前</span>
                <span className="font-bold text-slate-800">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">電話番号</span>
                <span className="font-bold text-slate-800">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">住所</span>
                <span className="font-bold text-slate-800 line-clamp-1">
                  {prefecture}{city}{street} {building}
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
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
            >
              <span>セラピストを探す</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ページタイトル */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                顧客アカウントを作成
              </h1>
            </div>

            {/* エラーメッセージ */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 登録フォーム */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-lg space-y-5"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* お名前 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      お名前 <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="山田 太郎"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* 電話番号 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      電話番号 <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="090-1234-5678"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    メールアドレス <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 住所情報 */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    ご住所 <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCurrentLocationLookup}
                    disabled={isLoadingGps}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-lg transition flex items-center gap-1 border border-emerald-200"
                  >
                    <Navigation className={`w-3 h-3 ${isLoadingGps ? 'animate-spin' : ''}`} />
                    <span>{isLoadingGps ? 'GPS取得中...' : '現在地から入力'}</span>
                  </button>
                </div>

                {/* 郵便番号 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="郵便番号 (例: 1500001)"
                    className="w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={handlePostalLookup}
                    disabled={isLoadingPostal}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    {isLoadingPostal ? '検索中...' : '住所自動入力'}
                  </button>
                </div>

                {/* 都道府県 & 市区町村 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <select
                      value={prefecture}
                      onChange={(e) => {
                        setPrefecture(e.target.value);
                        setCoords(getFallbackCoordinates(e.target.value));
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    >
                      {Object.keys(PREFECTURE_COORDINATES).map((pref) => (
                        <option key={pref} value={pref}>
                          {pref}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="市区町村 (例: 渋谷区神宮前)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* 町名・番地 */}
                <div>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="町名・番地 (例: 1-2-3)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                {/* 建物名・部屋番号 */}
                <div>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder="建物名・部屋番号 (任意)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>作成中...</span>
                  </>
                ) : (
                  <>
                    <span>アカウントを作成する</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <Link
                  href="/"
                  className="text-[11px] text-slate-500 hover:text-slate-800 transition"
                >
                  トップに戻る
                </Link>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
