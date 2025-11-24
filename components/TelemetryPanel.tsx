'use client';

import useSWR from 'swr';
import type { RobotTelemetry } from '@/lib/telemetry';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TelemetryPanel() {
  const { data, error } = useSWR<RobotTelemetry>('/api/robot/telemetry', fetcher, {
    refreshInterval: 2000,
  });

  const telemetry = data;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Robot Telemetry</h2>
        <p className="mt-1 text-xs text-slate-400">
          Monitor compute thermals, battery, and camera pipeline health in real time.
        </p>
      </div>
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-xs text-red-300">
          Failed to fetch telemetry stream.
        </div>
      )}
      {!telemetry && !error && <div className="text-sm text-slate-400">Bootstrapping telemetry…</div>}
      {telemetry && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TelemetryCard label="Battery" value={`${telemetry.battery.toFixed(1)}%`} trend="normal" />
          <TelemetryCard label="CPU Load" value={`${telemetry.cpuLoad.toFixed(0)}%`} trend="rising" />
          <TelemetryCard label="SoC Temp" value={`${telemetry.temperature.toFixed(1)} °C`} trend="normal" />
          <TelemetryCard label="Uptime" value={`${formatSeconds(telemetry.uptimeSeconds)}`} trend="normal" />
          <TelemetryCard label="Gait Mode" value={telemetry.gait.toUpperCase()} trend="normal" />
          <TelemetryCard
            label="Camera FPS"
            value={`${telemetry.camera.frameRate.toFixed(1)} fps`}
            trend={telemetry.camera.frameRate < 28 ? 'falling' : 'normal'}
          />
          <TelemetryCard
            label="Dropped Frames"
            value={`${telemetry.camera.droppedFrames}`}
            trend={telemetry.camera.droppedFrames > 3 ? 'rising' : 'normal'}
          />
          <TelemetryCard
            label="Bitrate"
            value={`${telemetry.camera.bitrate.toFixed(2)} Mbps`}
            trend={telemetry.camera.bitrate < 6 ? 'falling' : 'normal'}
          />
        </div>
      )}
    </div>
  );
}

interface TelemetryCardProps {
  label: string;
  value: string;
  trend: 'normal' | 'rising' | 'falling';
}

function TelemetryCard({ label, value, trend }: TelemetryCardProps) {
  const trendColor =
    trend === 'rising' ? 'text-warning' : trend === 'falling' ? 'text-red-300' : 'text-slate-400';
  const trendLabel = trend === 'normal' ? 'Stable' : trend === 'rising' ? 'Rising' : 'Falling';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-100">{value}</div>
      <div className={`text-xs ${trendColor}`}>{trendLabel}</div>
    </div>
  );
}

function formatSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
