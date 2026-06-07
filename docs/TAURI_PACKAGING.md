# Tauri Packaging Plan

## Prerequisites

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Tauri CLI
npm install -D @tauri-apps/cli@latest

# Initialize (if not done)
npm run tauri init
```

## Project Structure

```
src-tauri/
├── Cargo.toml
├── tauri.conf.json      # Window, CSP, build commands
├── src/
│   └── main.rs          # Tauri entry
├── icons/
│   ├── icon.png         # 1024×1024 source
│   ├── 32x32.png
│   └── ...
└── capabilities/
    └── default.json     # Permissions
```

## Build Commands

| Command | Output |
|---------|--------|
| `npm run tauri:dev` | Dev window → localhost:5173 |
| `npm run tauri:build` | Platform installer in `src-tauri/target/release/bundle/` |

## Required Permissions

```json
{
  "permissions": [
    "core:default",
    "shell:allow-open",
    "fs:allow-read",
    "fs:allow-write",
    "dialog:default"
  ]
}
```

- **Microphone:** WebView handles via browser permissions (MediaRecorder)
- **Camera:** WebView handles via getUserMedia (Posture Coach)
- **Filesystem:** Export recordings, session logs offline

## CSP Configuration

Already set in `tauri.conf.json`:
- `connect-src`: Supabase, OpenAI
- `media-src`: blob: for recordings
- No `unsafe-eval` (TensorFlow.js may need wasm-unsafe-eval — test in Phase 2)

## Platform Targets

| Platform | Format | Priority |
|----------|--------|----------|
| Windows 10+ | MSI + NSIS | P0 |
| macOS 12+ | DMG | P1 |
| Linux | AppImage + deb | P2 |

## Auto-Update

```json
// tauri.conf.json (Phase 2)
"plugins": {
  "updater": {
    "active": true,
    "endpoints": ["https://releases.pianomastery.os/{{target}}/{{current_version}}"],
    "dialog": true
  }
}
```

## Code Signing

- **Windows:** EV certificate for SmartScreen trust
- **macOS:** Apple Developer ID + notarization
- **CI:** GitHub Actions with stored secrets

## Build Pipeline (GitHub Actions sketch)

```yaml
jobs:
  build-tauri:
    strategy:
      matrix:
        platform: [windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run tauri:build
      - uses: tauri-apps/tauri-action@v0
```

## Bundle Size Optimization

- Dynamic import MediaPipe, TensorFlow.js, FullCalendar
- Tree-shake Recharts (import specific charts only)
- Target: <50MB installer (excluding WebView2 on Windows)
