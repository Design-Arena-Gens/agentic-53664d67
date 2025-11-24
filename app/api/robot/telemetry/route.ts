import { NextResponse } from 'next/server';
import { generateTelemetry } from '@/lib/telemetry';

export async function GET() {
  return NextResponse.json(generateTelemetry());
}
