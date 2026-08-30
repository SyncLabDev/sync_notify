import type { NotificationDesign, NotificationItem, NotificationOptions, NotificationPosition, ThemeDefinition } from '../types/notification'
import { normalizeDesign, normalizeNotification, resolveNotificationMode } from '../utils/validation'
import { playNotificationSound } from '../utils/sound'

interface State { items: NotificationItem[]; themes: Record<string, ThemeDefinition>; maxVisible: number; queueLimit: number; pauseOnHover: boolean; defaultDesign: NotificationDesign }
type Listener = () => void
let state: State = { items: [], themes: {}, maxVisible: 4, queueLimit: 50, pauseOnHover: true, defaultDesign: 'floating' }
const listeners = new Set<Listener>()
const emit = () => listeners.forEach(listener => listener())
const change = (next: State) => { state = next; emit() }

const themeSoundFor = (theme?: string) => (theme ? state.themes[theme]?.sound : undefined)

function mergeDuplicate(item: NotificationItem, current: NotificationItem, now: number): NotificationItem {
  if (item.duplicateMode === 'refresh') return { ...current, startedAt: now, remaining: current.duration, paused: false }
  if (item.duplicateMode === 'increment') return { ...current, count: current.count + 1, startedAt: now, remaining: current.duration, paused: false }
  return { ...item, handle: current.handle, createdAt: current.createdAt }
}

function add(options: NotificationOptions) {
  const item = normalizeNotification(options, Date.now(), state.defaultDesign)
  if (!item) return null
  if (item.id && item.duplicateMode !== 'allow') {
    const current = state.items.find(value => value.id === item.id)
    if (current) {
      const merged = mergeDuplicate(item, current, Date.now())
      if (item.duplicateMode === 'increment') playNotificationSound(merged.type, item.sound, themeSoundFor(merged.theme))
      change({ ...state, items: state.items.map(value => value.handle === current.handle ? merged : value) })
      return current.handle
    }
  }
  if (state.items.length >= state.queueLimit) {
    const removable = [...state.items].reverse().find(value => !value.persistent && value.priority === 0)
    if (!removable) return null
    state = { ...state, items: state.items.filter(value => value.handle !== removable.handle) }
  }
  change({ ...state, items: [...state.items, item] })
  playNotificationSound(item.type, item.sound, themeSoundFor(item.theme))
  requestAnimationFrame(() => update(item.handle, { phase: 'visible' }))
  return item.handle
}

type NotificationPatch = Partial<Omit<NotificationOptions, 'handle'>> & Partial<Pick<NotificationItem, 'phase' | 'paused' | 'remaining' | 'startedAt' | 'count' | 'actionLocked'>>

function update(handle: string, patch: NotificationPatch) {
  const now = Date.now()
  change({ ...state, items: state.items.map(item => {
    if (item.handle !== handle) return item
    const merged = {
      ...item, ...patch,
      design: patch.design === undefined ? item.design : normalizeDesign(patch.design, state.defaultDesign),
      startedAt: patch.duration !== undefined || patch.persistent === false ? now : item.startedAt,
      remaining: patch.duration ?? (patch.persistent === false ? item.duration : item.remaining)
    }
    return { ...merged, resolvedMode: resolveNotificationMode(merged) }
  }) })
}

function remove(handle: string, immediate = false) {
  if (immediate) return change({ ...state, items: state.items.filter(item => item.handle !== handle) })
  update(handle, { phase: 'leaving' })
  window.setTimeout(() => change({ ...state, items: state.items.filter(item => item.handle !== handle) }), 190)
}

function clear(position?: NotificationPosition) {
  change({ ...state, items: position ? state.items.filter(item => item.position !== position) : [] })
}

function visible(position: NotificationPosition) {
  return state.items.filter(item => item.position === position)
    .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt)
    .slice(0, state.maxVisible)
}

function positionView(position: NotificationPosition) {
  const ordered = state.items.filter(item => item.position === position)
    .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt)
  return { visible: ordered.slice(0, state.maxVisible), queued: Math.max(0, ordered.length - state.maxVisible) }
}

export const notificationStore = {
  subscribe(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener) },
  getSnapshot: () => state,
  add, update, remove, clear, visible, positionView,
  pause(handle: string) { const item = state.items.find(value => value.handle === handle); if (item && !item.paused) update(handle, { paused: true, remaining: Math.max(0, item.remaining - (Date.now() - item.startedAt)) }) },
  resume(handle: string) { update(handle, { paused: false, startedAt: Date.now() }) },
  lockAction(handle: string) { update(handle, { actionLocked: true }) },
  registerTheme(name: string, definition: ThemeDefinition) { change({ ...state, themes: { ...state.themes, [name]: definition } }) },
  configure(config: Partial<Pick<State, 'maxVisible' | 'queueLimit' | 'pauseOnHover' | 'defaultDesign'>>) { change({ ...state, ...config, defaultDesign: normalizeDesign(config.defaultDesign, state.defaultDesign) }) },
  reset() { change({ items: [], themes: {}, maxVisible: 4, queueLimit: 50, pauseOnHover: true, defaultDesign: 'floating' }) }
}
