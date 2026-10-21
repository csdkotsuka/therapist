'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateDistanceKm, estimateTravelTimeMinutes, formatPrice } from '@/lib/geo';
import { MapPin, Navigation, Compass, Star, Clock, Home, Building, Sparkles } from 'lucide-react';
import L from 'leaflet';

interface RealLeafletMapProps {
  onSelectTherapist: (therapistId: string) => void;
  filterType: 'all' | 'visit' | 'store';
}

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  onSelectTherapist,
  filterType,
}) => {
  const { userLocation, therapistProfiles, allUsers } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);

  const therapistsList = Object.values(therapistProfiles).filter((tp) => {
    if (!tp.is_approved) return false;
    if (filterType === 'visit' && !tp.is_visit_based) return false;
    if (filterType === 'store' && !tp.is_store_based) return false;
    return true;
  });

  // マップの初期化
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 既にマップインスタンスが存在する場合は破棄して再作成
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Leaflet マップ作成
    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: false,
    });

    // ズームコントロールを右下に配置
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap 標準タイル (APIキー不要・完全無料・日本語対応)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 現在地やセラピスト一覧の更新時にマーカーを描画
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. ユーザー現在地マーカー（アニメーション付きブルーサークル）
    const userMarkerHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
        <span style="position: absolute; width: 32px; height: 32px; background: rgba(14, 165, 233, 0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 18px; height: 18px; background: #0284c7; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userMarkerHtml,
      className: 'custom-user-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindTooltip(`📍 あなたの現在地 (${userLocation.name})`, {
        permanent: false,
        direction: 'top',
        className: 'font-sans text-xs font-bold rounded-lg px-2 py-1',
      })
      .addTo(group);

    // 現在地へ視点を移動
    map.panTo([userLocation.lat, userLocation.lng]);

    // 2. セラピストマーカー群
    therapistsList.forEach((tp) => {
      const user = allUsers.find((u) => u.id === tp.user_id);
      const distance = calculateDistanceKm(userLocation.lat, userLocation.lng, tp.lat, tp.lng);
      const travelTime = estimateTravelTimeMinutes(distance);

      const markerHtml = `
        <div style="position: relative; cursor: pointer; transition: transform 0.2s;" class="group">
          <div style="
            width: 46px; 
            height: 46px; 
            border-radius: 14px; 
            background: white; 
            padding: 2px; 
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); 
            border: 2px solid ${tp.is_visit_based ? '#059669' : '#0d9488'};
            overflow: hidden;
          ">
            <img src="${user?.avatar_url}" style="width: 100%; height: 100%; border-radius: 10px; object-fit: cover;" />
          </div>
          <div style="
            position: absolute; 
            top: -6px; 
            right: -6px; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            background: ${tp.is_visit_based ? '#059669' : '#0d9488'}; 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 10px; 
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${tp.is_visit_based ? '🏠' : '🏢'}
          </div>
          <div style="
            position: absolute; 
            bottom: -18px; 
            left: 50%; 
            transform: translateX(-50%); 
            background: rgba(15, 23, 42, 0.9); 
            color: white; 
            font-size: 10px; 
            font-weight: bold; 
            padding: 1px 6px; 
            border-radius: 6px; 
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${distance}km
          </div>
        </div>
      `;

      const therapistIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-therapist-marker',
        iconSize: [46, 46],
        iconAnchor: [23, 23],
      });

      const marker = L.marker([tp.lat, tp.lng], { icon: therapistIcon });

      marker.on('click', () => {
        setSelectedTherapistId(tp.user_id);
      });

      marker.addTo(group);
    });
  }, [userLocation, therapistProfiles, allUsers, filterType]);

  const selectedTherapist = selectedTherapistId ? therapistProfiles[selectedTherapistId] : null;
  const selectedUser = selectedTherapistId ? allUsers.find((u) => u.id === selectedTherapistId) : null;

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      {/* Leaflet 地図コンテナ */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* マップ情報バナー */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 shadow-md">
        <Compass className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '16s' }} />
        <span className="font-bold">リアルマップ (OpenStreetMap / GPS連動)</span>
      </div>

      {/* 現在地へセンタリングするボタン */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1 });
            }
          }}
          className="p-2.5 bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 rounded-2xl shadow-md border border-slate-200 transition"
          title="現在地に移動"
        >
          <Navigation className="w-4 h-4 text-sky-600" />
        </button>
      </div>

      {/* 選択されたセラピストカード（下部スライドアップ） */}
      {selectedTherapist && selectedUser && (
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
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
                  現在地から {calculateDistanceKm(userLocation.lat, userLocation.lng, selectedTherapist.lat, selectedTherapist.lng)}km
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  移動目安 {estimateTravelTimeMinutes(calculateDistanceKm(userLocation.lat, userLocation.lng, selectedTherapist.lat, selectedTherapist.lng))}分
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
