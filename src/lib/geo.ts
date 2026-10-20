/**
 * 2地点の緯度経度から距離(km)を計算する (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球の半径 (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * 距離から推定制約・移動時間(分)を算出 (Uber風の到着予測)
 */
export function estimateTravelTimeMinutes(distanceKm: number): number {
  // 都心部の平均移動速度 18km/h + 準備時間5分
  const minutes = Math.round((distanceKm / 18) * 60) + 5;
  return Math.max(5, minutes);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * ブラウザのGPS APIから現在地を取得 (navigator.geolocation)
 */
export function getCurrentGpsPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('お使いのブラウザはGPS位置情報に対応していません'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let msg = '位置情報の取得に失敗しました';
        if (error.code === error.PERMISSION_DENIED) {
          msg = '位置情報の利用が許可されていません。ブラウザの設定で位置情報を許可してください。';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = '現在地を取得できませんでした';
        } else if (error.code === error.TIMEOUT) {
          msg = '位置情報の取得がタイムアウトしました';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * 緯度経度から市区町村名・地名を取得する逆ジオコーディング
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'ja',
        },
      }
    );
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();
    const addr = data.address;
    if (addr) {
      const city = addr.city || addr.ward || addr.town || addr.village || addr.suburb || addr.province || '';
      const state = addr.province || addr.state || '';
      return `${state} ${city}`.trim() || data.display_name.split(',')[0];
    }
    return `現在地 (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
  } catch (e) {
    return `現在地 (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
  }
}

// 日本47都道府県の代表庁舎座標（全国展開用フォールバック）
export const PREFECTURE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '北海道': { lat: 43.0642, lng: 141.3469 },
  '青森県': { lat: 40.8244, lng: 140.7400 },
  '岩手県': { lat: 39.7036, lng: 141.1527 },
  '宮城県': { lat: 38.2688, lng: 140.8721 },
  '秋田県': { lat: 39.7186, lng: 140.1024 },
  '山形県': { lat: 38.2404, lng: 140.3633 },
  '福島県': { lat: 37.7503, lng: 140.4678 },
  '茨城県': { lat: 36.3418, lng: 140.4468 },
  '栃木県': { lat: 36.5658, lng: 139.8836 },
  '群馬県': { lat: 36.3912, lng: 139.0608 },
  '埼玉県': { lat: 35.8569, lng: 139.6489 },
  '千葉県': { lat: 35.6051, lng: 140.1233 },
  '東京都': { lat: 35.6895, lng: 139.6917 },
  '神奈川県': { lat: 35.4478, lng: 139.6425 },
  '新潟県': { lat: 37.9026, lng: 139.0232 },
  '富山県': { lat: 36.6953, lng: 137.2113 },
  '石川県': { lat: 36.5947, lng: 136.6256 },
  '福井県': { lat: 36.0652, lng: 136.2216 },
  '山梨県': { lat: 35.6639, lng: 138.5684 },
  '長野県': { lat: 36.6513, lng: 138.1810 },
  '岐阜県': { lat: 35.3912, lng: 136.7223 },
  '静岡県': { lat: 34.9756, lng: 138.3828 },
  '愛知県': { lat: 35.1802, lng: 136.9066 },
  '三重県': { lat: 34.7303, lng: 136.5086 },
  '滋賀県': { lat: 35.0045, lng: 135.8686 },
  '京都府': { lat: 35.0212, lng: 135.7556 },
  '大阪府': { lat: 34.6863, lng: 135.5200 },
  '兵庫県': { lat: 34.6913, lng: 135.1830 },
  '奈良県': { lat: 34.6853, lng: 135.8327 },
  '和歌山県': { lat: 34.2260, lng: 135.1675 },
  '鳥取県': { lat: 35.5036, lng: 134.2377 },
  '島根県': { lat: 35.4723, lng: 133.0505 },
  '岡山県': { lat: 34.6618, lng: 133.9344 },
  '広島県': { lat: 34.3966, lng: 132.4596 },
  '山口県': { lat: 34.1859, lng: 131.4705 },
  '徳島県': { lat: 34.0658, lng: 134.5593 },
  '香川県': { lat: 34.3401, lng: 134.0434 },
  '愛媛県': { lat: 33.8417, lng: 132.7661 },
  '高知県': { lat: 33.5597, lng: 133.5311 },
  '福岡県': { lat: 33.6068, lng: 130.4181 },
  '佐賀県': { lat: 33.2494, lng: 130.2988 },
  '長崎県': { lat: 32.7448, lng: 129.8737 },
  '熊本県': { lat: 32.7898, lng: 130.7417 },
  '大分県': { lat: 33.2382, lng: 131.6126 },
  '宮崎県': { lat: 31.9111, lng: 131.4239 },
  '鹿児島県': { lat: 31.5602, lng: 130.5581 },
  '沖縄県': { lat: 26.2124, lng: 127.6809 },
};

export function getFallbackCoordinates(prefecture: string): { lat: number; lng: number } {
  for (const [pref, coords] of Object.entries(PREFECTURE_COORDINATES)) {
    if (prefecture.includes(pref) || pref.includes(prefecture)) {
      return coords;
    }
  }
  // デフォルトは東京都（渋谷・新宿近辺）
  return { lat: 35.6580, lng: 139.7016 };
}

/**
 * 住所から緯度経度を取得するジオコーディング
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'Accept-Language': 'ja',
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Google Polyline アルゴリズムのデコーダー (エンコードされた道路ルート座標を [lat, lng][] に変換)
 */
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

/**
 * Google Routes API を呼び出して走行距離・渋滞考慮所要時間・道路ルート座標を取得
 */
export async function fetchRouteDistanceAndDuration(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{
  distanceKm: number;
  durationMinutes: number;
  polylinePoints: [number, number][] | null;
  provider: 'google_routes' | 'fallback_haversine' | 'fallback';
}> {
  try {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination }),
    });

    if (!res.ok) throw new Error('Route API failed');
    const data = await res.json();

    return {
      distanceKm: data.distanceKm,
      durationMinutes: data.durationMinutes,
      polylinePoints: data.encodedPolyline ? decodePolyline(data.encodedPolyline) : null,
      provider: data.provider,
    };
  } catch (e) {
    const dist = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
    return {
      distanceKm: dist,
      durationMinutes: estimateTravelTimeMinutes(dist),
      polylinePoints: null,
      provider: 'fallback',
    };
  }
}
