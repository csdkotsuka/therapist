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
} from 'lucide-react';

export const CustomerProfileEdit: React.FC = () => {
  const { currentUser, updateUserProfile } = useApp();

  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email] = useState(currentUser.email || '');
  const [postalCode, setPostalCode] = useState(currentUser.postal_code || '');

  // 住所の分解または初期値
  const [prefecture, setPrefecture] = useState('東京都');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: currentUser.lat || 35.6580,
    lng: currentUser.lng || 139.7016,
  });

  const [isLoadingPostal, setIsLoadingPostal] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 初期住所の読み込み
  useEffect(() => {
    if (currentUser.address) {
      let matchedPref = '東京都';
      for (const pref of Object.keys(PREFECTURE_COORDINATES)) {
        if (currentUser.address.includes(pref)) {
          matchedPref = pref;
          break;
        }
      }
      setPrefecture(matchedPref);
      const rest = currentUser.address.replace(matchedPref, '').trim();
      setStreet(rest);
    }
    if (currentUser.lat && currentUser.lng) {
      setCoords({ lat: currentUser.lat, lng: currentUser.lng });
    }
  }, [currentUser]);

  // 郵便番号から自動入力
  const handlePostalLookup = async () => {
    const cleaned = postalCode.replace(/[^0-9]/g, '');
    if (cleaned.length !== 7) {
      setErrorMessage('郵便番号は7桁の半角数字で入力してください');
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
        setBuilding(''); // 郵便番号変更時は前回のマンション名・部屋番号を消去

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccess(false);

    if (!name.trim()) {
      setErrorMessage('お名前を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalLat = coords.lat;
      let finalLng = coords.lng;
      const fullAddress = `${prefecture}${city}${street}${building ? ' ' + building : ''}`.trim() || currentUser.address || '東京都渋谷区';

      const geo = await geocodeAddress(fullAddress);
      if (geo) {
        finalLat = geo.lat;
        finalLng = geo.lng;
      }

      await updateUserProfile(currentUser.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: fullAddress,
        postal_code: postalCode.replace(/[^0-9]/g, ''),
        lat: finalLat,
        lng: finalLng,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || '更新中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">会員情報・出張先住所の変更</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ご登録の基本情報やお名前、出張先のご住所を変更・保存できます。
          </p>
        </div>

        {/* 成功アラート */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-bold">会員情報とご住所を正常に更新しました！</span>
          </div>
        )}

        {/* エラーアラート */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* 基本情報 */}
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">お名前（氏名）</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">電話番号</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="090-1234-5678"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">メールアドレス（ログインID）</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                メールアドレスの変更はセキュリティ認証が必要です
              </span>
            </div>
          </div>

          {/* 出張先住所 */}
          <div className="pt-4 border-t border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700">出張先のご住所</label>
              <button
                type="button"
                onClick={handleCurrentLocationLookup}
                disabled={isLoadingGps}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition flex items-center gap-1 border border-emerald-200"
              >
                <Navigation className={`w-3 h-3 ${isLoadingGps ? 'animate-spin' : ''}`} />
                <span>{isLoadingGps ? 'GPS取得中...' : '現在地から住所を設定'}</span>
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
                className="w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={handlePostalLookup}
                disabled={isLoadingPostal}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition disabled:opacity-50"
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
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
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
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="市区町村 (例: 渋谷区神宮前)"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* 町名番地 */}
            <div>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="町名・番地 (例: 1-2-3)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* 建物名・部屋番号 */}
            <div>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="建物名・部屋番号 (例: グリーンハイツ 302号室)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* 登録住所のプレビュー */}
            {currentUser.address && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-slate-500 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>現在の保存住所: <strong className="text-slate-700">{currentUser.address}</strong></span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-[0.99] disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '保存中...' : '変更を保存する'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
