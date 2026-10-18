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
 * 緯度経度から市区町村名・地名を取得する逆ジオコーディング (無料・キー不要)
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

/**
 * 住所から緯度経度を取得するジオコーディング (無料・キー不要)
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
