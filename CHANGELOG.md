# Changelog

All notable changes to SYNC Notify are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Startup notice with `Config.Debug` enabled when ox_lib is detected, explaining that the `ox_lib:notify` takeover stays idle to avoid duplicate notifications and pointing at the `OxNotify` export.

### Changed

- Documentation: a dedicated "Working alongside ox_lib" README section (takeover semantics, recommended routing options, troubleshooting entry) replaces the single dense compatibility paragraph.

### Fixed

- The transparent NUI overlay no longer paints black on older FiveM CEF builds: the `color-scheme: dark` meta was dropped and the stylesheet declares its layer order before Tailwind, so the page background stays transparent across CEF versions.
- FiveM CEF color compatibility: every `color-mix()` in the notification stylesheet was replaced with plain `rgba`/hex accent variants precomputed per card, so split and floating themes, borders, and the rail track render correctly in FiveM's older Chromium instead of being silently dropped.
- The countdown rail now drains in-game: the reduced-motion stylesheet override (which freezes it into a static bar, and which FiveM CEF reports regardless of player intent) is scoped to the browser workbench, keeping the functional timing rail visible in the NUI.
- Entry stutter in CEF: notification cards no longer animate a large blurred `drop-shadow` filter (and hover no longer rerasterizes brightness filters), leaving only transform/opacity/bleed-free paint work per frame.
- `Config.Offset` now ships as `{ x = 24, y = 24 }` with matching stylesheet fallbacks, so top stacks sit snug against both screen edges instead of leaving the previous large inset.

## [1.1.0] - 2026-08-30

### Added

- Notification sounds: a license-free synthesized NUI chime gated by `Config.Sound`, logical `sound` names resolving `sounds/<name>.ogg` with synth fallback, per-theme `sound` variants, burst coalescing, and per-item mute via `sound = false`.
- ox_lib compatibility bridge (`bridge/oxlib.lua`): `OxNotify`/`OxHide` exports, ox field and icon mapping, and a transparent takeover of `ox_lib:notify` client events when ox_lib is not running.
- FLIP-style stack reflow so siblings glide to new positions when a card is removed.
- Direction-aware enter/exit motion: cards now travel along the axis of their anchor edge for all eight positions.
- Hover feedback on the countdown rail (brightness lift while pause-on-hover is active).
- Browser workbench previews the sound pipeline at reduced volume.

### Fixed

- Action notifications no longer leak NUI mouse focus when they expire or are removed by script; unmounting action cards also releases focus.
- `Config.Offset` is now applied to the NUI (`--offset-x`/`--offset-y`), with side gaps honored by left, right, and bottom stacks.
- Themes and states registered before the NUI page finished loading are hydrated from the `ready` response instead of being lost.
- Omitted `sound` fields normalize to "use default" instead of `false`, which had silenced the chime entirely.
- The countdown rail no longer jumps when pause-on-hover recomputes the remaining time mid-animation.
- Development mode no longer shows a duplicate bootstrap notification under React StrictMode.

### Changed

- All web dependencies are pinned to exact versions for reproducible resource builds.
- Reinstall repair: broken partial `node_modules` no longer blocks quality scripts.

### Performance

- Sound triggering is throttled to one chime per 120 ms and adds no timers or polling.

## [1.0.0] - 2026-08-29

### Added

- Production-ready FiveM notification resource with standalone, Qbox, QBCore, and ESX bridges.
- Client APIs for notifications, actions, updates, removal, clearing, themes, and custom states.
- Targeted server notification helpers with validation and rate limiting.
- Priority-aware queues, duplicate policies, persistent notifications, explicit progress, actions, and all eight screen positions.
- Automatic, micro, and full notification modes.
- Selectable Split and Floating production designs, with Floating as the default.
- Browser-only development workbench with presets, stress tools, viewport simulation, and transparent preview mode.
- Unit, component, CEF-separation, and Playwright browser coverage.

### Changed

- Replaced the original Rail design with the Split and Floating design system.
- Removed the connected stack background while preserving internal timer and progress rails.
- Standardized notification and workbench text alignment using shared layout tokens.
- Refined Split micro icon containment, connector geometry, and text centering.
- Removed decorative diamond markers from notification icon modules.
- Improved queue-label alignment for left, center, and right stack positions.

### Security

- Normalized and bounded notification payloads, actions, metadata, durations, icons, themes, and colors.
- Restricted client-originated server notifications through ACE checks and rate limiting.
- Validated NUI callbacks and prevented duplicate action submissions.
- Kept browser development controls unavailable in FiveM CEF.
