# Robot Dog Monocular Console

Full-stack Next.js dashboard for operating and tuning a monocular camera pipeline on a quadruped robot dog. The console provides a live browser preview, adjustable imaging parameters, simulated robot telemetry, and a frame capture archive for dataset generation.

## Quickstart

```bash
npm install
npm run dev
```

Navigate to http://localhost:3000 for the control surface.

## Features

- Browser-based monocular preview using `getUserMedia` with start/stop controls, mirroring toggle, and PNG snapshot capture.
- Parameter panel to tune exposure, gain, white balance, sharpness, frame rate, stabilization, and autofocus. Updates persist via Next.js API routes.
- Telemetry monitor that simulates battery, thermals, gait state, and camera health with auto-refresh.
- Snapshot gallery for annotating captured frames prior to SLAM/VO ingestion.

## Deployment

```bash
npm run build
npm start
```

Ready for Vercel `vercel deploy --prod` flows. Set `VERCEL_TOKEN` in the environment when deploying CI/CD.

## Extending

- Replace `app/api/robot/settings` and `app/api/robot/telemetry` with calls to your robot bridge or middleware.
- Pipe captured snapshots to storage or a labelling backend.
- Harden the telemetry panel with WebSocket streams or ROS2 bridge integration.
