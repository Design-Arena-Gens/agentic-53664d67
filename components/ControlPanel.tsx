'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import type { RobotCameraSettings } from '@/lib/robotSettings';

async function updateSettings(url: string, { arg }: { arg: Partial<RobotCameraSettings> }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  if (!response.ok) {
    throw new Error('Failed to update camera settings');
  }
  return response.json();
}

interface ControlPanelProps {
  currentSettings: RobotCameraSettings | undefined;
  onSettingsChange: (settings: RobotCameraSettings) => void;
}

export function ControlPanel({ currentSettings, onSettingsChange }: ControlPanelProps) {
  const [localSettings, setLocalSettings] = useState<RobotCameraSettings | undefined>(currentSettings);
  const { trigger } = useSWRMutation('/api/robot/settings', updateSettings);

  useEffect(() => {
    setLocalSettings(currentSettings);
  }, [currentSettings]);

  const descriptors = useMemo(
    () => [
      {
        key: 'exposure',
        label: 'Exposure',
        min: 0,
        max: 1,
        step: 0.01,
        helper: 'Controls perceived brightness by adjusting sensor integration time.',
      },
      {
        key: 'gain',
        label: 'Analog Gain',
        min: 0,
        max: 1,
        step: 0.01,
        helper: 'Boosts signal amplitude—higher gain equals brighter but noisier image.',
      },
      {
        key: 'sharpness',
        label: 'Sharpness',
        min: 0,
        max: 1,
        step: 0.01,
        helper: 'Edge-enhancement for feature detection. Keep moderate for SLAM/VO.',
      },
      {
        key: 'whiteBalance',
        label: 'White Balance',
        min: 0,
        max: 1,
        step: 0.01,
        helper: 'Color temperature compensation. 0=cooler, 1=warmer image.',
      },
    ],
    [],
  );

  const discreteDescriptors = useMemo(
    () => [
      {
        key: 'frameRate',
        label: 'Video FPS',
        options: [24, 30, 45, 60],
        helper: 'Match gait estimation pipeline—higher FPS increases compute load.',
      },
    ],
    [],
  );

  if (!localSettings) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Loading camera parameters…
      </div>
    );
  }

  const applyPatch = async (partial: Partial<RobotCameraSettings>) => {
    const nextSettings = { ...localSettings, ...partial };
    setLocalSettings(nextSettings);
    const serverSettings: RobotCameraSettings = await trigger(partial);
    onSettingsChange(serverSettings);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Camera Parameters</h2>
          <p className="mt-1 text-xs text-slate-400">
            Tune the monocular pipeline for visual odometry and obstacle avoidance.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {descriptors.map((descriptor) => (
          <div key={descriptor.key} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{descriptor.label}</span>
              <span className="tabular-nums text-slate-400">
                {(localSettings[descriptor.key as keyof RobotCameraSettings] as number).toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={descriptor.min}
              max={descriptor.max}
              step={descriptor.step}
              value={localSettings[descriptor.key as keyof RobotCameraSettings] as number}
              onChange={(event) =>
                applyPatch({
                  [descriptor.key]: Number(event.target.value),
                } as Partial<RobotCameraSettings>)
              }
              className="w-full accent-accent"
            />
            <p className="text-xs text-slate-500">{descriptor.helper}</p>
          </div>
        ))}

        {discreteDescriptors.map((descriptor) => (
          <div key={descriptor.key} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{descriptor.label}</span>
              <span className="tabular-nums text-slate-400">
                {localSettings[descriptor.key as keyof RobotCameraSettings]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {descriptor.options.map((option) => {
                const selected = localSettings[descriptor.key as keyof RobotCameraSettings] === option;
                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() =>
                      applyPatch({
                        [descriptor.key]: option,
                      } as Partial<RobotCameraSettings>)
                    }
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      selected
                        ? 'border-accent bg-accent/20 text-accent'
                        : 'border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {option} fps
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">{descriptor.helper}</p>
          </div>
        ))}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm">
            <span className="font-medium">Electronic Stabilization</span>
            <input
              type="checkbox"
              checked={localSettings.stabilization}
              onChange={(event) =>
                applyPatch({
                  stabilization: event.target.checked,
                })
              }
              className="h-4 w-4 accent-accent"
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm">
            <span className="font-medium">Continuous Auto Focus</span>
            <input
              type="checkbox"
              checked={localSettings.autoFocus}
              onChange={(event) =>
                applyPatch({
                  autoFocus: event.target.checked,
                })
              }
              className="h-4 w-4 accent-accent"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
