import { NextResponse, type NextRequest } from 'next/server';

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const lat = parseNumber(sp.get('lat'));
  const lon = parseNumber(sp.get('lon'));
  const zoomRaw = parseNumber(sp.get('zoom'));

  if (lat === null || lon === null) {
    return NextResponse.json(
      { error: 'Missing or invalid lat/lon' },
      { status: 400 }
    );
  }

  // Nominatim expects valid ranges.
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'lat/lon out of range' },
      { status: 400 }
    );
  }

  const zoom = zoomRaw === null ? 18 : clamp(Math.round(zoomRaw), 3, 18);

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'json');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('zoom', String(zoom));
  url.searchParams.set('addressdetails', '1');

  // Nominatim usage policy recommends identifying your application via User-Agent.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Workly/1.0 (support: official.workly@gmail.com)',
      },
      signal: controller.signal,
      // Avoid Vercel caching surprises; location lookups can change and should be "fresh enough".
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        {
          error: 'Reverse geocoding failed',
          status: res.status,
          details: contentType.includes('application/json') ? undefined : text.slice(0, 500),
        },
        { status: 502 }
      );
    }

    // Proxy JSON as-is.
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    const name = e instanceof Error ? e.name : 'Error';
    return NextResponse.json(
      { error: 'Reverse geocoding request failed', name },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

