import { NextResponse } from 'next/server';
import { calculateDistanceKm, estimateTravelTimeMinutes } from '@/lib/geo';
import { createSupabaseServerClient } from '@/lib/server/supabaseServer';

interface LatLng {
  lat: number;
  lng: number;
}

const isLatLng = (v: unknown): v is LatLng =>
  typeof v === 'object' &&
  v !== null &&
  Number.isFinite((v as LatLng).lat) &&
  Number.isFinite((v as LatLng).lng) &&
  Math.abs((v as LatLng).lat) <= 90 &&
  Math.abs((v as LatLng).lng) <= 180;

// 経路・所要時間の計算（Google Routes API は従量課金のため、ログインユーザーのみ利用可）
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 });
    }

    const { origin, destination } = (await req.json().catch(() => ({}))) as { origin?: unknown; destination?: unknown };
    if (!isLatLng(origin) || !isLatLng(destination)) {
      return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
    }

    // サーバー専用キーを優先（NEXT_PUBLIC_ のキーはブラウザにも配信されるため、HTTP リファラ制限を必ず設定すること）
    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Google Routes API が利用可能な場合
    if (apiKey) {
      try {
        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: origin.lat,
                  longitude: origin.lng,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: destination.lat,
                  longitude: destination.lng,
                },
              },
            },
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE',
          }),
        });

        const data = await response.json();

        if (response.ok && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // duration は "1234s" の形式で返る
          const durationSeconds = parseInt(route.duration?.replace('s', '') || '0', 10);
          const distanceMeters = route.distanceMeters || 0;

          return NextResponse.json({
            provider: 'google_routes',
            distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
            durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
            encodedPolyline: route.polyline?.encodedPolyline || null,
          });
        }
      } catch (googleErr) {
        console.warn('Google Routes API fetch failed, falling back:', googleErr);
      }
    }

    // フォールバック計算 (Haversine + 推定速度)
    const distanceKm = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const durationMinutes = estimateTravelTimeMinutes(distanceKm);

    return NextResponse.json({
      provider: 'fallback_haversine',
      distanceKm,
      durationMinutes,
      encodedPolyline: null,
    });
  } catch (error) {
    console.error('[routes] failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
