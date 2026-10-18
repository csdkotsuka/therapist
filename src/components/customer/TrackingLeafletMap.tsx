'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface TrackingLeafletMapProps {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  curLat: number;
  curLng: number;
  progress: number;
}

export const TrackingLeafletMap: React.FC<TrackingLeafletMapProps> = ({
  originLat,
  originLng,
  destLat,
  destLng,
  curLat,
  curLng,
  progress,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const carMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const midLat = (originLat + destLat) / 2;
    const midLng = (originLng + destLng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [midLat, midLng],
      zoom: 14,
      zoomControl: false,
    });

    // スタイリッシュなダークモード風またはボイジャー地図タイル
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // 1. ルート線 (Polyline)
    L.polyline(
      [
        [originLat, originLng],
        [destLat, destLng],
      ],
      {
        color: '#059669',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8,
      }
    ).addTo(map);

    // 2. 出発地（拠点）マーカー
    const originIcon = L.divIcon({
      html: `
        <div style="background: #334155; color: white; border-radius: 8px; font-size: 10px; font-weight: bold; padding: 2px 6px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-align: center; white-space: nowrap;">
          拠点
        </div>
      `,
      className: 'tracking-origin-marker',
      iconSize: [40, 24],
      iconAnchor: [20, 12],
    });
    L.marker([originLat, originLng], { icon: originIcon }).addTo(map);

    // 3. 目的地（顧客宅）マーカー
    const destIcon = L.divIcon({
      html: `
        <div style="background: #0284c7; color: white; border-radius: 8px; font-size: 10px; font-weight: bold; padding: 2px 6px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-align: center; white-space: nowrap;">
          🏠 顧客宅
        </div>
      `,
      className: 'tracking-dest-marker',
      iconSize: [60, 24],
      iconAnchor: [30, 12],
    });
    L.marker([destLat, destLng], { icon: destIcon }).addTo(map);

    // 4. セラピスト現在地（車）マーカー
    const carIcon = L.divIcon({
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="width: 36px; height: 36px; background: #059669; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);">
            🚗
          </div>
          <div style="position: absolute; top: -18px; background: rgba(5, 150, 105, 0.95); color: white; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; white-space: nowrap;">
            移動中 (${progress}%)
          </div>
        </div>
      `,
      className: 'tracking-car-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const carMarker = L.marker([curLat, curLng], { icon: carIcon }).addTo(map);
    carMarkerRef.current = carMarker;

    // 両地点が収まるようにズーム調整
    map.fitBounds([
      [originLat, originLng],
      [destLat, destLng],
    ], { padding: [40, 40] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [originLat, originLng, destLat, destLng]);

  // 車の位置が更新されたときのアニメーション
  useEffect(() => {
    if (carMarkerRef.current) {
      carMarkerRef.current.setLatLng([curLat, curLng]);
      // アイコンのプログレスラベルも更新
      const carIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
            <div style="width: 36px; height: 36px; background: #059669; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);">
              🚗
            </div>
            <div style="position: absolute; top: -18px; background: rgba(5, 150, 105, 0.95); color: white; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; white-space: nowrap;">
              移動中 (${progress}%)
            </div>
          </div>
        `,
        className: 'tracking-car-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      carMarkerRef.current.setIcon(carIcon);
    }
  }, [curLat, curLng, progress]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};
