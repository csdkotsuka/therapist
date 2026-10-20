'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  calculateDistanceKm,
  estimateTravelTimeMinutes,
  fetchRouteDistanceAndDuration,
} from '@/lib/geo';
import {
  X,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  Navigation,
  Star,
} from 'lucide-react';

const TrackingLeafletMap = dynamic(
  () => import('./TrackingLeafletMap').then((m) => m.TrackingLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[280px] bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-2">
        <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
        <span>リアルタイムGPS追跡マップを起動中...</span>
      </div>
    ),
  }
);

interface LiveTrackingModalProps {
  booking: Booking;
  onClose: () => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  booking,
  onClose,
}) => {
  const { allUsers, therapistProfiles, updateTherapistLocation } = useApp();

  const therapist = therapistProfiles[booking.therapist_id];
  const therapistUser = allUsers.find((u) => u.id === booking.therapist_id);

  // リアルタイムシミュレーションのプログレス (0%〜100%)
  const [progress, setProgress] = useState(45);
  const [isSimulatingMove, setIsSimulatingMove] = useState(false);

  // 出発地（セラピスト拠点）と目的地（顧客先）
  const originLat = therapist?.lat || 35.6666;
  const originLng = therapist?.lng || 139.7092;
  const destLat = booking.lat || 35.6600;
  const destLng = booking.lng || 139.7050;

  // Google Routes API からの取得結果
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMinutes: number;
    polylinePoints: [number, number][] | null;
    provider: string;
  }>({
    distanceKm: calculateDistanceKm(originLat, originLng, destLat, destLng),
    durationMinutes: estimateTravelTimeMinutes(calculateDistanceKm(originLat, originLng, destLat, destLng)),
    polylinePoints: null,
    provider: 'calculating',
  });

  // ESCキーで閉じるリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // 初回マウント時に Google Routes API を呼び出して実道路ルート・所要時間を取得
  useEffect(() => {
    fetchRouteDistanceAndDuration(
      { lat: originLat, lng: originLng },
      { lat: destLat, lng: destLng }
    ).then((res) => {
      setRouteInfo(res);
    });
  }, [originLat, originLng, destLat, destLng]);

  // 車両の現在地座標の算出 (道路ポリラインがあればその上を走行、なければ直線補間)
  const getInterpolatedCoord = (p: number) => {
    if (routeInfo.polylinePoints && routeInfo.polylinePoints.length > 1) {
      const idx = Math.min(
        routeInfo.polylinePoints.length - 1,
        Math.floor((p / 100) * (routeInfo.polylinePoints.length - 1))
      );
      return {
        lat: routeInfo.polylinePoints[idx][0],
        lng: routeInfo.polylinePoints[idx][1],
      };
    }
    return {
      lat: originLat + (destLat - originLat) * (p / 100),
      lng: originLng + (destLng - originLng) * (p / 100),
    };
  };

  const currentCoord = getInterpolatedCoord(progress);

  // 移動シミュレーション
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulatingMove) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsSimulatingMove(false);
            return 100;
          }
          const next = prev + 5;
          const coord = getInterpolatedCoord(next);
          updateTherapistLocation(booking.id, coord.lat, coord.lng);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingMove, originLat, originLng, destLat, destLng, booking.id, updateTherapistLocation, routeInfo.polylinePoints]);

  const etaMinutes = Math.max(1, Math.round(routeInfo.durationMinutes * (1 - progress / 100)));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 text-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col my-auto relative"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>リアルタイム出張追跡 (Live GPS)</span>
                {routeInfo.provider === 'google_routes' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Google Routes 渋滞考慮
                  </span>
                )}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            title="閉じる (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Map View (Leaflet + Google Routes Polyline) */}
        <div className="relative h-72 sm:h-80 w-full min-h-[280px] border-b border-slate-800 overflow-hidden bg-slate-950">
          <TrackingLeafletMap
            originLat={originLat}
            originLng={originLng}
            destLat={destLat}
            destLng={destLng}
            curLat={currentCoord.lat}
            curLng={currentCoord.lng}
            progress={progress}
            routePolyline={routeInfo.polylinePoints}
          />

          {/* 到着時間オーバーレイ */}
          <div className="absolute top-3 right-3 z-[500] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-right shadow-xl pointer-events-auto">
            <span className="text-[10px] text-slate-400 block font-semibold">到着予定 (ETA)</span>
            <div className="flex items-baseline gap-1 text-emerald-400 font-black text-xl">
              <span>あと約 {etaMinutes}</span>
              <span className="text-xs font-normal">分</span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              実走行 {routeInfo.distanceKm} km
            </span>
          </div>

          {/* シミュレーション進行ボタン */}
          <div className="absolute bottom-3 left-3 z-[500] pointer-events-auto">
            <button
              onClick={() => setIsSimulatingMove(!isSimulatingMove)}
              className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-slate-600 rounded-xl text-[11px] font-bold text-slate-200 transition flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              {isSimulatingMove ? 'シミュレーション一時停止' : 'GPS移動をシミュレート'}
            </button>
          </div>
        </div>

        {/* Therapist & Booking Details */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={therapistUser?.avatar_url || 'https://images.unsplash.com/photo-1594824813633-5b87ec8f86df?auto=format&fit=crop&q=80&w=256'}
                alt={therapistUser?.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-100">{therapistUser?.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{therapist?.rating_avg || 4.9}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  出張移動手段: 車両（折りたたみマッサージベッド積載）
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${therapistUser?.phone || '09011112222'}`}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 flex items-center justify-center border border-slate-700 transition"
                title="電話をかける"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => alert('セラピストへのメッセージ機能（チャット）を開きます')}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center justify-center border border-slate-700 transition"
                title="チャットを開く"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-800 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">訪問先住所</span>
                <span className="text-slate-200 font-semibold">{booking.visit_address}</span>
              </div>
            </div>
            {booking.customer_notes && (
              <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">伝達事項: </span>
                {booking.customer_notes}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>安心・安全の身元確認済みセラピスト</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              本人確認・資格確認済
            </span>
          </div>

          <p className="text-[10px] text-slate-500 text-center">
            ※ ESCキー または 背景をクリックするとモーダルを閉じることができます
          </p>
        </div>
      </div>
    </div>
  );
};
