'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateDistanceKm, estimateTravelTimeMinutes } from '@/lib/geo';
import { MapPin, Navigation, Compass, Star, Clock, Car, Sparkles, Building, Home } from 'lucide-react';
import { TherapistProfile, Profile } from '@/types';

interface InteractiveMapProps {
  onSelectTherapist: (therapistId: string) => void;
  filterType: 'all' | 'visit' | 'store';
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onSelectTherapist,
  filterType,
}) => {
  const { userLocation, therapistProfiles, allUsers } = useApp();
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);

  // マップの基準点（ユーザー現在地）
  const centerLat = userLocation.lat;
  const centerLng = userLocation.lng;

  // 画面内の座標にマッピング (簡易メルカトル投影風スケーリング)
  // 緯度1度 ≈ 111km, 経度1度 ≈ 90km (東京付近)
  const latSpan = 0.08; // 表示範囲
  const lngSpan = 0.10;

  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng - (centerLng - lngSpan / 2)) / lngSpan) * 100;
    const y = (( (centerLat + latSpan / 2) - lat) / latSpan) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(8, Math.min(92, y)),
    };
  };

  const userPos = projectToMap(centerLat, centerLng);

  const therapistsList = Object.values(therapistProfiles).filter((tp) => {
    if (!tp.is_approved) return false;
    if (filterType === 'visit' && !tp.is_visit_based) return false;
    if (filterType === 'store' && !tp.is_store_based) return false;
    return true;
  });

  const selectedTherapist = selectedTherapistId ? therapistProfiles[selectedTherapistId] : null;
  const selectedUser = selectedTherapistId ? allUsers.find((u) => u.id === selectedTherapistId) : null;

  return (
    <div className="relative w-full h-[480px] bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
      {/* マップ背景（スタイリッシュなダークグリッド＋等高線・道路風グラフィック） */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* 道路・街路風の抽象ライン */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-800/80" strokeWidth="2">
        <line x1="0" y1="35%" x2="100%" y2="40%" />
        <line x1="15%" y1="0" x2="30%" y2="100%" />
        <line x1="0" y1="75%" x2="100%" y2="70%" />
        <line x1="70%" y1="0" x2="60%" y2="100%" />
        <line x1="20%" y1="20%" x2="80%" y2="85%" strokeDasharray="4 4" stroke="#0ea5e9" strokeWidth="1.5" className="opacity-40" />
      </svg>

      {/* マップステータスバナー */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 text-xs text-slate-300">
        <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '12s' }} />
        <span>現在地周辺 ({userLocation.name}) のリアルタイムマップ</span>
      </div>

      {/* ユーザー現在地ピン */}
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
      >
        <div className="relative flex items-center justify-center">
          <span className="absolute w-12 h-12 bg-sky-500/20 rounded-full animate-ping"></span>
          <span className="absolute w-6 h-6 bg-sky-500/40 rounded-full animate-pulse"></span>
          <div className="w-5 h-5 bg-sky-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="absolute top-6 px-2 py-0.5 bg-slate-900/90 border border-sky-500/40 rounded-md text-[10px] text-sky-200 font-bold whitespace-nowrap shadow-md">
            あなた (顧客)
          </div>
        </div>
      </div>

      {/* セラピストピン群 */}
      {therapistsList.map((tp) => {
        const pos = projectToMap(tp.lat, tp.lng);
        const user = allUsers.find((u) => u.id === tp.user_id);
        const distance = calculateDistanceKm(centerLat, centerLng, tp.lat, tp.lng);
        const time = estimateTravelTimeMinutes(distance);
        const isSelected = selectedTherapistId === tp.user_id;

        return (
          <div
            key={tp.user_id}
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-110"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => setSelectedTherapistId(tp.user_id)}
          >
            <div className="relative group">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center p-0.5 shadow-xl transition-all ${
                  isSelected
                    ? 'ring-4 ring-emerald-400 scale-110 bg-emerald-500'
                    : 'bg-white hover:ring-2 hover:ring-emerald-400'
                }`}
              >
                <img
                  src={user?.avatar_url}
                  alt={user?.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>

              {/* アイコンバッジ（出張or店舗） */}
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 border border-white text-white flex items-center justify-center text-[10px] shadow">
                {tp.is_visit_based ? <Home className="w-2.5 h-2.5" /> : <Building className="w-2.5 h-2.5" />}
              </div>

              {/* ミニラベル */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900/95 border border-slate-700 rounded-md text-[10px] text-white font-medium whitespace-nowrap shadow-lg flex items-center gap-1">
                <span>{user?.name.split(' ')[0]}</span>
                <span className="text-emerald-400 font-bold">{distance}km</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* 選択されたセラピストのカード（下部スライドアップ） */}
      {selectedTherapist && selectedUser && (
        <div className="absolute bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <img
              src={selectedUser.avatar_url}
              alt={selectedUser.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">{selectedUser.name}</h4>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{selectedTherapist.rating_avg}</span>
                  <span className="text-slate-400 text-[10px]">({selectedTherapist.reviews_count}件)</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{selectedTherapist.address}</p>
              <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  現在地から {calculateDistanceKm(centerLat, centerLng, selectedTherapist.lat, selectedTherapist.lng)}km
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  移動目安 {estimateTravelTimeMinutes(calculateDistanceKm(centerLat, centerLng, selectedTherapist.lat, selectedTherapist.lng))}分
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTherapistId(null)}
              className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
            >
              閉じる
            </button>
            <button
              onClick={() => onSelectTherapist(selectedTherapist.user_id)}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              メニューを見て予約する
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
