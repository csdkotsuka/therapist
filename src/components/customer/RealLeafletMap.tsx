'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateDistanceKm, estimateTravelTimeMinutes, formatPrice, geocodeLocation } from '@/lib/geo';
import { MapPin, Navigation, Compass, Star, Clock, Home, Building, Sparkles, Search } from 'lucide-react';
import L from 'leaflet';
import { escapeHtml, safeUrlAttr } from '@/lib/escapeHtml';

import { TherapistProfile } from '@/types';

interface RealLeafletMapProps {
  onSelectTherapist: (therapistId: string) => void;
  filterType?: 'all' | 'visit' | 'store';
  therapists?: (TherapistProfile & { distance?: number })[];
  isCustomCenter?: boolean;
  onSetCustomCenter?: (result: { name: string; lat: number; lng: number }) => void;
  onResetToGps?: () => void;
}

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  onSelectTherapist,
  filterType = 'all',
  therapists,
  isCustomCenter = false,
  onSetCustomCenter,
  onResetToGps,
}) => {
  const { userLocation, setUserLocation, therapistProfiles, allUsers } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);

  const [mapCenterQuery, setMapCenterQuery] = useState('');
  const [isSearchingCenter, setIsSearchingCenter] = useState(false);

  const handleMapSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = mapCenterQuery.trim();
    if (!q) return;

    setIsSearchingCenter(true);
    try {
      const res = await geocodeLocation(q);
      if (res) {
        if (onSetCustomCenter) {
          onSetCustomCenter({
            name: res.displayName,
            lat: res.lat,
            lng: res.lng,
          });
        } else {
          setUserLocation({
            name: res.displayName,
            lat: res.lat,
            lng: res.lng,
          });
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([res.lat, res.lng], 14, { duration: 1.2 });
        }
      } else {
        alert(`「${q}」の位置が見つかりませんでした。別の駅名や市区町村名でお試しください。`);
      }
    } catch {
      alert('位置情報の取得に失敗しました。');
    } finally {
      setIsSearchingCenter(false);
    }
  };

  // therapists が渡された場合は絞り込み済みリストをそのまま使用し、未指定の場合はデフォルトのフィルタリングを行う
  const therapistsList = therapists ?? Object.values(therapistProfiles).filter((tp) => {
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

    // 1. 中心地／現在地マーカー（アニメーション付きサークル）
    const userMarkerHtml = isCustomCenter
      ? `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
        <span style="position: absolute; width: 36px; height: 36px; background: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 22px; height: 22px; background: #059669; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 8px -1px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
        </div>
      </div>
    `
      : `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
        <span style="position: absolute; width: 32px; height: 32px; background: rgba(14, 165, 233, 0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 18px; height: 18px; background: #0284c7; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userMarkerHtml,
      className: 'custom-user-marker',
      iconSize: isCustomCenter ? [44, 44] : [40, 40],
      iconAnchor: isCustomCenter ? [22, 22] : [20, 20],
    });

    const markerLabel = isCustomCenter
      ? `📍 指定中心地 (${escapeHtml(userLocation.name)})`
      : `📍 あなたの現在地 (${escapeHtml(userLocation.name)})`;

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindTooltip(markerLabel, {
        permanent: false,
        direction: 'top',
        className: 'font-sans text-xs font-bold rounded-lg px-2 py-1',
      })
      .addTo(group);

    // 中心地へ視点を移動
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
            <img src="${safeUrlAttr(user?.avatar_url)}" alt="" style="width: 100%; height: 100%; border-radius: 10px; object-fit: cover;" />
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
  }, [userLocation, therapistProfiles, allUsers, filterType, therapists, isCustomCenter]);

  const selectedTherapist = selectedTherapistId ? therapistProfiles[selectedTherapistId] : null;
  const selectedUser = selectedTherapistId ? allUsers.find((u) => u.id === selectedTherapistId) : null;

  return (
    <div className="relative w-full h-[580px] sm:h-[640px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      {/* Leaflet 地図コンテナ */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* マップ上部バー: 情報バナー ＆ 中心地検索入力 */}
      <div className="absolute top-3 sm:top-4 left-3 right-3 sm:left-4 sm:right-4 z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pointer-events-none">
        {/* 左側: マップ情報バナー & 現在の中心地バッジ */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 text-xs font-bold text-slate-700 shadow-md">
            <Compass className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '16s' }} />
            <span>リアルマップ</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700">{therapistsList.length}名表示中</span>
          </div>

          {isCustomCenter && (
            <div className="flex items-center gap-1.5 bg-emerald-700/95 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-md animate-in fade-in">
              <MapPin className="w-3.5 h-3.5 text-emerald-200" />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">中心地: {userLocation.name}</span>
            </div>
          )}
        </div>

        {/* 右側: 中心地入力バー & GPSリセットボタン */}
        <div className="flex items-center gap-2 pointer-events-auto w-full md:w-auto justify-end">
          <form
            onSubmit={handleMapSearchSubmit}
            className="flex-1 md:flex-initial flex items-center bg-white/98 backdrop-blur-md rounded-2xl border-2 border-emerald-600/30 hover:border-emerald-500 shadow-lg p-1 sm:p-1.5 pl-3 sm:pl-3.5 gap-2 transition"
          >
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            <input
              type="text"
              value={mapCenterQuery}
              onChange={(e) => setMapCenterQuery(e.target.value)}
              placeholder="中心地を入力（例: 松山駅、道後温泉）"
              className="bg-transparent border-none text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none w-full sm:w-72 md:w-80"
            />
            {mapCenterQuery && (
              <button
                type="button"
                onClick={() => setMapCenterQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-1 cursor-pointer shrink-0"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={isSearchingCenter || !mapCenterQuery.trim()}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-sm disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>{isSearchingCenter ? '検索中...' : '中心に設定'}</span>
            </button>
          </form>

          {/* 現在地へセンタリング / GPSリセットボタン */}
          <button
            onClick={() => {
              if (onResetToGps) {
                onResetToGps();
              } else if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1 });
              }
            }}
            className="p-2 sm:p-2.5 bg-white/98 backdrop-blur-md hover:bg-slate-50 text-slate-700 rounded-2xl shadow-md border border-slate-200 hover:border-slate-300 transition cursor-pointer shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-bold"
            title={isCustomCenter ? 'GPS現在地に戻す' : '現在地に移動'}
          >
            <Navigation className={`w-4 h-4 sm:w-4 sm:h-4 ${isCustomCenter ? 'text-emerald-600' : 'text-sky-600'}`} />
            <span className="hidden sm:inline">{isCustomCenter ? 'GPSに戻す' : '現在地'}</span>
          </button>
        </div>
      </div>

      {/* 0件時のアラート */}
      {therapistsList.length === 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-xl border border-slate-700 font-bold">
          絞り込み条件に一致するセラピストが見つかりませんでした
        </div>
      )}

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
                  {isCustomCenter ? '中心地から ' : '現在地から '}
                  {calculateDistanceKm(userLocation.lat, userLocation.lng, selectedTherapist.lat, selectedTherapist.lng)}km
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
              className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              閉じる
            </button>
            <button
              onClick={() => onSelectTherapist(selectedTherapist.user_id)}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
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
