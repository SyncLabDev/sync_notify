# SYNC Notify

SYNC Notify is a compact, framework-independent notification system for FiveM. It provides stateful notifications, action prompts, priority-aware stacking, duplicate handling, themes, dispatch presentation, synthesized notification sounds, and a browser development workbench while keeping the production NUI transparent and event-driven. An optional ox_lib compatibility bridge lets existing ox-shaped payloads render through SYNC without rewriting call sites.

## Requirements and installation

- FiveM artifact with Lua 5.4 support
- Node.js 20+ and pnpm 10+ only when rebuilding the NUI

Copy the resource into your resources directory, build the web package when `web/dist` is not present, then add `ensure sync_notify` to `server.cfg`.

```bash
pnpm --dir web install
pnpm --dir web build
```

The core works standalone. `Config.Framework = 'auto'` detects Qbox, QBCore, then ESX; set `standalone`, `qbox`, `qbcore`, or `esx` to force a bridge.

## Quick start

```lua
exports['sync_notify']:Notify('success', 'Hello world')

local id = exports['sync_notify']:Notify({
    type = 'success',
    title = 'Vehicle purchased',
    message = 'Your Sultan RS has been delivered.',
    duration = 5000,
    icon = 'car',
    position = 'top-right',
    design = 'split',
    priority = 1
})
```

## Client exports

### `Notify(options)`

Returns a generated handle or `nil` when validation fails. Supported fields are `id`, `type`, `theme`, `title`, required `message`, `icon`, `duration`, `persistent`, `priority`, `position`, `mode`, `design`, `sound`, `progress`, `progressStyle`, `duplicateMode`, `actions`, and `metadata`.

Types: `success`, `error`, `warning`, `info`, `dispatch`, `custom`. Positions: `top-left`, `top-center`, `top-right`, `middle-left`, `middle-right`, `bottom-left`, `bottom-center`, `bottom-right`.

`mode` accepts `auto`, `micro`, or `full`. Auto mode uses the compact micro layout only when the notification has no title or actions, is not dispatch, and has priority 0 or 1. Explicit `micro` and `full` selections always win. Updates recalculate an automatic layout without replacing its notification handle.

`design` accepts `split` or `floating`. `Config.Design = 'floating'` sets the resource-wide default, while an individual notification may override it. Split separates the icon and content modules with a progress connector; Floating detaches the telemetry rail from the quiet content shell. Invalid and legacy `rail` values safely use the configured default. `Update(handle, { design = 'split' })` changes geometry without replacing the notification or resetting unrelated state.

### `Action(options)`

```lua
local id = exports['sync_notify']:Action({
    type = 'info',
    title = 'Job invitation',
    message = 'John invited you to Burgershot.',
    duration = 15000,
    actions = {
        { id = 'accept', label = 'Accept' },
        { id = 'decline', label = 'Decline' }
    }
})

AddEventHandler('sync_notify:action', function(notificationId, actionId)
    if notificationId == id and actionId == 'accept' then
        -- Join the job.
    end
end)
```

Action cards take NUI focus only during keyboard/mouse interaction. Selection, expiry, removal, clear, and resource stop all release focus.

### `Update(handle, patch)`

```lua
exports['sync_notify']:Update(id, {
    type = 'success', title = 'Upload complete',
    message = 'Evidence uploaded.', progress = 100,
    persistent = false, duration = 3000
})
```

### `Remove(handle)` and `Clear(position?)`

Both return a boolean. Passing a position to `Clear` only clears that stack.

### Client events

Client events use the same validated payload contract as the exports:

```lua
TriggerEvent('sync_notify:client:notify', {
    type = 'info',
    message = 'Radio channel updated.'
})

TriggerEvent('sync_notify:client:update', handle, { progress = 75 })
TriggerEvent('sync_notify:client:remove', handle)
TriggerEvent('sync_notify:client:clear', 'top-right')
```

### Themes and custom states

```lua
exports['sync_notify']:RegisterTheme('police', {
    accent = '#4A8FFF', icon = 'shield', sound = 'dispatch'
})

exports['sync_notify']:RegisterState('ems', {
    accent = '#FF668F', icon = 'heart-pulse', sound = 'info'
})
```

Themes change controlled visual properties without replacing the SYNC structure. Colors must be six-digit hex values and icons must be built in.

### ox_lib compatibility

`bridge/oxlib.lua` ships with the resource and adds ox-style helpers plus a transparent takeover for servers that do not run `ox_lib`:

```lua
exports['sync_notify']:OxNotify({
    id = 'bank_transfer',
    title = 'Transfer received',
    description = '$450 from Mike.',
    duration = 6,          -- seconds, ox-style
    position = 'top',      -- ox positions map onto SYNC positions
    type = 'informative',  -- informative | success | warn | error
    icon = 'circle-check'  -- Lucide names translate to the built-in set
})

exports['sync_notify']:OxHide('bank_transfer')
```

Mapping rules: `description` becomes `message`, `duration` is converted from seconds to milliseconds, a stable `id` implies `duplicateMode = 'replace'` (matching ox behavior), and `top`/`bottom` map to `top-center`/`bottom-center`. Unrecognized icons degrade to the built-in bell; `iconColor` and `style` are ignored.

#### Working alongside ox_lib

The bridge's behavior depends on whether `ox_lib` is running on the server:

- **`ox_lib` not installed** — full transparent takeover. Every existing `TriggerClientEvent('ox_lib:notify', src, data)` from any producer resource renders through SYNC Notify with no script changes.
- **`ox_lib` installed and started** — the bridge intentionally stays silent and ox_lib shows its own notifications. FiveM events cannot be consumed, so rendering anyway would mean **two notifications per call**, which is treated as a defect, not a feature.

To get ox-shaped payloads into SYNC Notify while ox_lib keeps running:

1. **Preferred:** point the producing script at the export — swap `lib.notify(data)` for `exports['sync_notify']:OxNotify(data)`; the payload fields are identical.
2. Many scripts already expose a "custom notify" provider hook in their config — wire it to the export above.
3. Otherwise, leave ox_lib's look for those scripts; SYNC Notify handles everything routed through its own exports and events.

With `Config.Debug = true`, the resource logs a one-time startup notice when ox_lib is detected, so admins immediately know why the takeover is idle.

## Duplicate and queue behavior

Set a stable `id` and one of these modes:

- `allow`: create a separate notification.
- `replace`: replace its content but retain stack identity.
- `increment`: increment the visible counter and restart the timer.
- `refresh`: retain content and restart the timer.

Each position displays four notifications by default, sorted by priority then creation time. The global queue is capped at 50. When full, the newest removable normal-priority item is discarded; persistent or priority work is retained.

## Persistent notifications and progress

`persistent = true` disables expiry. Numeric `progress` is clamped to 0–100 and takes precedence over duration in the rail. `progressStyle` accepts `rail`, `minimal`, or `none`. Updating a persistent notification to `persistent = false` starts its duration.

## Sound

`Config.Sound` gates a built-in, license-free synthesized chime rendered by the NUI — no audio files are required. A `sound` value on a notification or theme is a logical name: one of the built-in variants (`success`, `error`, `warning`, `info`, `dispatch`, `custom`) selects the chime melody, while any other name resolves `sounds/<name>.ogg` from the resource and plays it once loaded, falling back to the synthesized chime. Rapid bursts coalesce to at most one sound per 120 ms, `sound = false` mutes a single notification, and updates never replay a sound.

## Server integration and security

Server resources should use the server export:

```lua
exports['sync_notify']:NotifyPlayer(playerId, {
    type = 'info', message = 'Server maintenance begins in ten minutes.'
})
```

The client-originated `sync_notify:server:notifySelf` event is disabled unless the player has the `sync_notify.self` ACE and is rate-limited. Do not grant this ACE to ordinary players unless a trusted integration needs it. Payloads are copied to a bounded depth and normalized again on the receiving client.

## Configuration

The main defaults in `config.lua` are:

| Setting | Default | Purpose |
| --- | --- | --- |
| `Config.Framework` | `auto` | Selects standalone, Qbox, QBCore, or ESX integration. |
| `Config.Position` | `top-right` | Sets the default notification position. |
| `Config.Offset` | `{ x = 24, y = 24 }` | Offsets from screen edges in pixels: `x` is the side gap for left/right stacks, `y` the top gap for top positions. |
| `Config.Duration` | `5000` | Sets the default lifetime in milliseconds. |
| `Config.Mode` | `auto` | Selects automatic, micro, or full layout behavior. |
| `Config.Design` | `floating` | Selects Floating or Split as the default design. |
| `Config.MaxVisible` | `4` | Limits visible notifications per position. |
| `Config.QueueLimit` | `50` | Bounds the global notification queue. |
| `Config.PauseOnHover` | `true` | Pauses timed notifications while hovered. |
| `Config.Debug` | `false` | Enables the `/syncnotify_test` smoke command. |
| `Config.Sound` | `enabled`, `0.30` | Master switch and volume (0–1) for the notification chime. |

Sound defaults, theme colors, validation limits, and server rate limits are also centralized in `config.lua`. Invalid notification modes and designs use their configured defaults.

Default safety limits are 80 title characters, 500 message characters, 32 action-label characters, three actions, 1–60 second duration, four visible cards, and 50 total queued cards.

## Development mode

```bash
pnpm --dir web dev
```

Open `http://localhost:5173`. Browser mode provides Gameplay, Neutral, and Transparent views, viewport simulations, every notification field, presets, mutation controls, and stack/spam/duplicate tests. View and control visibility persist only for the browser session. Hiding controls leaves a clean preview with a subtle recovery button.

The browser uses a mock callback transport. FiveM CEF uses real NUI callbacks. Environment detection is runtime-based, and the development shell is not rendered inside CEF. The notification components, store, themes, animations, sound engine, and validation are shared by both modes. The workbench enables the chime at reduced volume so the sound pipeline can be previewed; browser autoplay policies mean the first sound plays after your first interaction.

## Testing

```bash
pnpm --dir web lint
pnpm --dir web typecheck
pnpm --dir web test
pnpm --dir web exec playwright install chromium
pnpm --dir web test:e2e
pnpm --dir web build
```

Unit coverage includes normalization, mode resolution and update recalculation, limits, priority sorting, queue counts, duplicate modes, action locks, semantics, injection-safe text, hover pause, and all stack positions. Playwright covers development view persistence, playground lifecycle, every position, and Gameplay/Neutral/Transparent screenshots at all supported viewport presets.

For framework acceptance, test the resource independently on standalone, Qbox, QBCore, and ESX servers. Also verify action focus, resource restarts, 1920×1080 through 3840×2160, invalid inputs, and the 100-notification stress preset.

## Performance notes

- No Lua polling loop runs at idle.
- The frontend owns display timers and clears them during updates/removal.
- Store subscribers receive one small state signal and keyed React elements preserve card identity.
- Motion uses opacity and transforms; the browser workbench honors reduced-motion preferences (the in-game NUI keeps the functional countdown rail).
- The queue and input sizes are bounded.

## Troubleshooting

- Blank NUI: run `pnpm build` and confirm `web/dist/index.html` exists.
- No server notification: confirm the target player exists and call the server export, not the protected self-event.
- Development UI in FiveM: confirm `window.invokeNative` is available in the artifact and no browser extension overrides it.
- Actions cannot be clicked: ensure no other resource continually owns NUI focus.
- Custom icon falls back to a bell: use a built-in icon from `shared/constants.lua`.
- ox_lib still shows its own notifications: expected while `ox_lib` is running — the compatibility bridge yields to avoid duplicates. Route those payloads with `exports['sync_notify']:OxNotify(data)` (see “Working alongside ox_lib”).

## License

MIT © 2026 SYNC Lab.

## Changelog

Release history and notable changes are documented in [CHANGELOG.md](CHANGELOG.md).
