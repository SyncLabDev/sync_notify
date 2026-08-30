import type { NotificationOptions, NotificationItem, NotificationPosition, NotificationType, DuplicateMode, ProgressStyle, NotificationMode, ResolvedNotificationMode, NotificationDesign } from '../types/notification'

const types = new Set<NotificationType>(['success', 'error', 'warning', 'info', 'dispatch', 'custom'])
const positions = new Set<NotificationPosition>(['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'])
const duplicates = new Set<DuplicateMode>(['allow', 'replace', 'increment', 'refresh'])
const progressStyles = new Set<ProgressStyle>(['rail', 'minimal', 'none'])
const modes = new Set<NotificationMode>(['auto', 'micro', 'full'])
const designs = new Set<NotificationDesign>(['split', 'floating'])
const trim = (value: unknown, max: number) => typeof value === 'string' ? Array.from(value).filter(character => character.charCodeAt(0) >= 32).join('').slice(0, max) : undefined
const clamp = (value: unknown, min: number, max: number, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback

export function resolveNotificationMode(input: Pick<NotificationOptions, 'mode' | 'title' | 'actions' | 'type' | 'priority'>): ResolvedNotificationMode {
  if (input.mode === 'micro' || input.mode === 'full') return input.mode
  return !input.title && !input.actions?.length && input.type !== 'dispatch' && (input.priority ?? 0) <= 1 ? 'micro' : 'full'
}

export function normalizeDesign(value: unknown, fallback: NotificationDesign = 'floating'): NotificationDesign {
  return designs.has(value as NotificationDesign) ? value as NotificationDesign : fallback
}

export function normalizeNotification(input: NotificationOptions, now = Date.now(), defaultDesign: NotificationDesign = 'floating'): NotificationItem | null {
  const message = trim(input?.message, 500)
  if (!message) return null
  const duration = clamp(input.duration, 1000, 60000, 5000)
  const handle = trim(input.handle, 80) || `web:${now}:${Math.random().toString(36).slice(2, 8)}`
  const actions = Array.isArray(input.actions) ? input.actions.slice(0, 3).flatMap(action => {
    const id = trim(action?.id, 32); const label = trim(action?.label, 32)
    return id && label ? [{ id, label }] : []
  }).filter((action, index, all) => all.findIndex(value => value.id === action.id) === index) : undefined
  const mode = modes.has(input.mode as NotificationMode) ? input.mode! : 'auto'
  const normalized = {
    handle, id: trim(input.id, 64), type: types.has(input.type as NotificationType) ? input.type! : 'info',
    theme: trim(input.theme, 32), title: trim(input.title, 80), message, icon: trim(input.icon, 48),
    duration, persistent: input.persistent === true, priority: Math.floor(clamp(input.priority, 0, 3, 0)),
    position: positions.has(input.position as NotificationPosition) ? input.position! : 'top-right',
    sound: input.sound === true ? true : typeof input.sound === 'string' ? trim(input.sound, 32) : input.sound === false ? false : undefined,
    progress: typeof input.progress === 'number' ? clamp(input.progress, 0, 100, 0) : input.progress === true,
    progressStyle: progressStyles.has(input.progressStyle as ProgressStyle) ? input.progressStyle! : 'rail',
    duplicateMode: duplicates.has(input.duplicateMode as DuplicateMode) ? input.duplicateMode! : 'allow',
    actions: actions?.length ? actions : undefined, metadata: input.metadata, mode, design: normalizeDesign(input.design, defaultDesign),
    createdAt: now, startedAt: now, remaining: duration, paused: false, count: 1, phase: 'entering' as const, actionLocked: false
  }
  return { ...normalized, resolvedMode: resolveNotificationMode(normalized) }
}
