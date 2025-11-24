import { NextResponse } from 'next/server';
import { getCameraSettings, updateCameraSettings } from '@/lib/robotSettings';

export async function GET() {
  return NextResponse.json(getCameraSettings());
}

export async function POST(request: Request) {
  const payload = await request.json();
  const updated = updateCameraSettings(payload);
  return NextResponse.json(updated);
}
