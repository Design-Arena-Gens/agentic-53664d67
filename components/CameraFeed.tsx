'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface CameraFeedProps {
  onSnapshot?: (dataUrl: string) => void;
  targetFrameRate: number;
}

export function CameraFeed({ onSnapshot, targetFrameRate }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      activeStream?.getTracks().forEach((track) => track.stop());
    };
  }, [activeStream]);

  const constraints = useMemo<MediaStreamConstraints>(
    () => ({
      audio: false,
      video: {
        facingMode: 'environment',
        frameRate: { ideal: targetFrameRate, max: targetFrameRate + 10 },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }),
    [targetFrameRate],
  );

  const startStream = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = videoRef.current;
      if (!video) {
        return;
      }
      video.srcObject = stream;
      await video.play();
      setActiveStream(stream);
      setIsReady(true);
    } catch (err) {
      console.error(err);
      setError('Unable to access camera. Grant permissions or connect a camera module.');
    }
  }, [constraints]);

  const stopStream = useCallback(() => {
    activeStream?.getTracks().forEach((track) => track.stop());
    setActiveStream(null);
    setIsReady(false);
  }, [activeStream]);

  const captureSnapshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    if (isMirrored) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (isMirrored) {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/png');
    onSnapshot?.(dataUrl);
  }, [isMirrored, onSnapshot]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <video
          ref={videoRef}
          className={`h-[360px] w-full object-cover transition-transform ${isMirrored ? '-scale-x-100' : ''}`}
          playsInline
          muted
        />
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 text-center text-sm">
            <div className="animate-pulse text-accent">Monocular camera idle</div>
            <div className="max-w-xs text-slate-400">
              Start streaming to preview the forward monocular feed from the robot dog.
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-x-0 bottom-0 bg-red-950/80 px-4 py-3 text-sm text-red-300 backdrop-blur">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={isReady ? stopStream : startStream}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isReady ? 'Stop Stream' : 'Start Stream'}
        </button>
        <button
          onClick={captureSnapshot}
          disabled={!isReady}
          className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Capture Snapshot
        </button>
        <button
          onClick={() => setIsMirrored((prev) => !prev)}
          className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
        >
          {isMirrored ? 'Disable Mirror' : 'Enable Mirror'}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
