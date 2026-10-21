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
  routePolyline?: [number, number][] | null;
}

export const TrackingLeafletMap: React.FC<TrackingLeafletMapProps> = ({
  originLat,
  originLng,
  destLat,
  destLng,
  curLat,
  curLng,
  progress,
  routePolyline,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const carMarkerRef = useRef<L.Marker | null>(null);
  const fixedMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. マップ本体の初期化（1回のみ実行）
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // 既存のインスタンスや leaflet_id の安全なクリア
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (container as any)._leaflet_id;

    const midLat = (originLat + destLat) / 2;
    const midLng = (originLng + destLng) / 2;

    const map = L.map(container, {
      center: [midLat, midLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    // OpenStreetMap 標準タイル (APIキー不要・完全無料・日本語対応)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const fixedMarkersGroup = L.layerGroup().addTo(map);
    fixedMarkersLayerRef.current = fixedMarkersGroup;
    mapInstanceRef.current = map;

    // モーダル表示のアニメーションやレンダリングラグでサイズが0になるのを防ぐ
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    // リサイズ監視
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
      routeLayerRef.current = null;
      carMarkerRef.current = null;
      fixedMarkersLayerRef.current = null;
    };
  }, []);

  // 2. 出発地・目的地の固定マーカーとルート線の描画・更新
  useEffect(() => {
    const map = mapInstanceRef.current;
    const fixedGroup = fixedMarkersLayerRef.current;
    if (!map || !fixedGroup) return;

    fixedGroup.clearLayers();

    // 拠点（出発地）アイコン
    const originIcon = L.divIcon({
      html: `
        <div style="background: #1e293b; color: #f8fafc; border-radius: 8px; font-size: 11px; font-weight: 700; padding: 3px 8px; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); text-align: center; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;">
          <span>🏢</span><span>セラピスト拠点</span>
        </div>
      `,
      className: 'tracking-origin-marker',
      iconSize: [110, 26],
      iconAnchor: [55, 13],
    });
    L.marker([originLat, originLng], { icon: originIcon }).addTo(fixedGroup);

    // 顧客宅（目的地）アイコン
    const destIcon = L.divIcon({
      html: `
        <div style="background: #0284c7; color: #ffffff; border-radius: 8px; font-size: 11px; font-weight: 700; padding: 3px 8px; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); text-align: center; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;">
          <span>🏠</span><span>あなたのご指定先</span>
        </div>
      `,
      className: 'tracking-dest-marker',
      iconSize: [120, 26],
      iconAnchor: [60, 13],
    });
    L.marker([destLat, destLng], { icon: destIcon }).addTo(fixedGroup);

    // ルートポリラインの更新
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const latLngs: [number, number][] = routePolyline && routePolyline.length > 0
      ? routePolyline
      : [
          [originLat, originLng],
          [destLat, destLng],
        ];

    const polyline = L.polyline(latLngs, {
      color: '#10b981',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    routeLayerRef.current = polyline;

    // 全体が収まるようフィット
    try {
      map.fitBounds(polyline.getBounds(), { padding: [50, 50], maxZoom: 16 });
    } catch {
      // boundsが空の場合のフォールバック
      map.setView([(originLat + destLat) / 2, (originLng + destLng) / 2], 14);
    }

    map.invalidateSize();
  }, [originLat, originLng, destLat, destLng, routePolyline]);

  // 3. 現在地（車両）マーカーの移動アニメーション
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const carHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
        <span style="position: absolute; width: 44px; height: 44px; background: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 38px; height: 38px; background: #059669; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); font-size: 18px; z-index: 2;">
          🚗
        </div>
        <div style="position: absolute; top: -20px; background: #064e3b; color: #a7f3d0; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; border: 1px solid #059669; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 3;">
          セラピスト移動中 (${progress}%)
        </div>
      </div>
    `;

    const carIcon = L.divIcon({
      html: carHtml,
      className: 'tracking-car-marker',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    if (carMarkerRef.current) {
      carMarkerRef.current.setLatLng([curLat, curLng]);
      carMarkerRef.current.setIcon(carIcon);
    } else {
      carMarkerRef.current = L.marker([curLat, curLng], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
    }
  }, [curLat, curLng, progress]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[280px]"
      style={{ width: '100%', height: '100%', zIndex: 1 }}
    />
  );
};
