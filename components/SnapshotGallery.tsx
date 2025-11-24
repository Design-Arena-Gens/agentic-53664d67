'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SnapshotGalleryProps {
  snapshots: string[];
}

export function SnapshotGallery({ snapshots }: SnapshotGalleryProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (snapshots.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-sm text-slate-400">
        No snapshots captured yet. Grab frames to annotate obstacle positions or terrain cues.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {snapshots.map((snapshot, index) => (
          <button
            type="button"
            key={snapshot}
            onClick={() => setSelected(snapshot)}
            className="group relative h-24 w-24 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/70"
          >
            <Image
              src={snapshot}
              alt={`Snapshot ${index + 1}`}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 px-2 py-1 text-center text-[10px] uppercase tracking-wide text-slate-400 group-hover:text-accent">
              Frame {index + 1}
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800">
            <Image
              src={selected}
              alt="Selected snapshot"
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 512px, 100vw"
              unoptimized
            />
          </div>
          <div className="mt-2 text-center text-xs text-slate-400">
            Export to your SLAM dataset or compare frame-to-frame pose estimates.
          </div>
        </div>
      )}
    </div>
  );
}
