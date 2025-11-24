import { Dashboard } from '@/components/Dashboard';
import { getCameraSettings } from '@/lib/robotSettings';

export default function Page() {
  const settings = getCameraSettings();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-1 text-xs uppercase tracking-wide text-slate-400">
          Monocular Vision Stack
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-slate-50">Robot Dog Camera Console</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Orchestrate the monocular imaging pipeline, tune camera parameters, and verify telemetry for your
            quadruped robotics platform.
          </p>
        </div>
      </header>
      <Dashboard initialSettings={settings} />
      <footer className="pb-10 text-xs text-slate-500">
        Built for rapid field deployment. Integrate with your robot bridge by wiring the API handlers to your control bus.
      </footer>
    </main>
  );
}
