'use client';

import React, { useState, useEffect } from 'react';
import { Booking, TherapistProfile, Profile } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatPrice, formatDate, calculateDistanceKm, estimateTravelTimeMinutes } from '@/lib/geo';
import {
  X,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Car,
  Home,
  Star,
  Activity,
  HeartPulse,
} from 'lucide-react';

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
          // セラピストの座標を補間
          const curLat = originLat + (destLat - originLat) * (next / 100);
          const curLng = originLng + (destLng - originLng) * (next / 100);
          updateTherapistLocation(booking.id, curLat, curLng);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingMove, originLat, originLng, destLat, destLng, booking.id, updateTherapistLocation]);

  const currentDist = calculateDistanceKm(
    originLat + (destLat - originLat) * (progress / 100),
    originLng + (destLng - originLng) * (progress / 100),
    destLat,
    destLng
  );
  const etaMinutes = Math.max(1, Math.round(estimateTravelTimeMinutes(currentDist) * (1 - progress / 100)));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="font-bold text-sm text-slate-100">
              リアルタイム出張追跡 (Live GPS)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Radar/Map View */}
        <div className="relative h-64 bg-slate-950 border-b border-slate-800 overflow-hidden flex items-center justify-center">
          {/* グリッドとレーダー同心円 */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
          <div className="absolute w-48 h-48 border border-sky-500/20 rounded-full animate-ping pointer-events-none"></div>
          <div className="absolute w-80 h-80 border border-slate-800 rounded-full pointer-events-none"></div>

          {/* 移動経路ライン */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="25%"
              y1="50%"
              x2="75%"
              y2="50%"
              stroke="#334155"
              strokeWidth="4"
              strokeDasharray="6 6"
            />
            <line
              x1="25%"
              y1="50%"
              x2={`${25 + progress * 0.5}%`}
              y2="50%"
              stroke="#10b981"
              strokeWidth="4"
            />
          </svg>

          {/* 出発地ピン（拠点） */}
          <div className="absolute left-[25%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs shadow-md">
              拠点
            </div>
          </div>

          {/* セラピストの現在地ピン（移動中） */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 z-10 flex flex-col items-center"
            style={{ left: `${25 + progress * 0.5}%` }}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-emerald-500/30">
                <Car className="w-6 h-6 animate-bounce" />
              </div>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-600 text-[10px] font-bold rounded-md whitespace-nowrap shadow-md">
                移動中
              </div>
            </div>
          </div>

          {/* 目的地（顧客宅）ピン */}
          <div className="absolute left-[75%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 border border-sky-400 flex items-center justify-center text-white shadow-lg">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-sky-300 font-bold mt-1">ご自宅</span>
          </div>

          {/* 到着時間オーバーレイ */}
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-right shadow-xl">
            <span className="text-[10px] text-slate-400 block font-semibold">到着予定 (ETA)</span>
            <div className="flex items-baseline gap-1 text-emerald-400 font-black text-xl">
              <span>あと約 {etaMinutes}</span>
              <span className="text-xs font-normal">分</span>
            </div>
          </div>

          {/* シミュレーション進行ボタン */}
          <div className="absolute bottom-3 left-3 z-20">
            <button
              onClick={() => setIsSimulatingMove(!isSimulatingMove)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-[11px] font-bold text-slate-200 transition flex items-center gap-1.5 shadow"
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
                src={therapistUser?.avatar_url}
                alt={therapistUser?.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-100">{therapistUser?.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{therapist?.rating_avg}</span>
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
        </div>
      </div>
    </div>
  );
};
