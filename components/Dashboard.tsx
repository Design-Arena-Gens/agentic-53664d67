'use client';

import { useEffect, useState } from 'react';
import { CameraFeed } from './CameraFeed';
import { ControlPanel } from './ControlPanel';
import { SnapshotGallery } from './SnapshotGallery';
import { TelemetryPanel } from './TelemetryPanel';
import type { RobotCameraSettings } from '@/lib/robotSettings';

interface DashboardProps {
  initialSettings: RobotCameraSettings;
}

export function Dashboard({ initialSettings }: DashboardProps) {
  const [settings, setSettings] = useState<RobotCameraSettings>(initialSettings);
  const [snapshots, setSnapshots] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const sync = async () => {
      try {
        const res = await fetch('/api/robot/settings', { cache: 'no-store' });
        if (!res.ok) return;
        const latest = (await res.json()) as RobotCameraSettings;
        if (isMounted) {
          setSettings(latest);
        }
      } catch (error) {
        console.error('Failed to refresh settings', error);
      }
    };
    sync();
    const interval = setInterval(sync, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <CameraFeed
            targetFrameRate={settings.frameRate}
            onSnapshot={(dataUrl) =>
              setSnapshots((prev) => [dataUrl, ...prev].slice(0, 12))
            }
          />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-300">
            <h3 className="text-sm font-semibold text-slate-100">Calibration Tips</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>• Dial exposure to keep histograms centered during outdoor runs.</li>
              <li>• Keep stabilization enabled for agile gaits; disable for SLAM calibration.</li>
              <li>• Capture snapshots at marked checkpoints for dataset labeling.</li>
            </ul>
          </div>
        </div>
        <div className="lg:col-span-2">
          <ControlPanel currentSettings={settings} onSettingsChange={setSettings} />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TelemetryPanel />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold">Snapshot Gallery</h2>
            <p className="mt-1 text-xs text-slate-400">Archive key frames for pose refinement.</p>
            <div className="mt-4">
              <SnapshotGallery snapshots={snapshots} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
