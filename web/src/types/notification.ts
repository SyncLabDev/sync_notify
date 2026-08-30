export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'dispatch' | 'custom'
export type NotificationPosition = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
export type DuplicateMode = 'allow' | 'replace' | 'increment' | 'refresh'
export type ProgressStyle = 'rail' | 'minimal' | 'none'
export type NotificationMode = 'auto' | 'micro' | 'full'
export type ResolvedNotificationMode = Exclude<NotificationMode, 'auto'>
export type NotificationDesign = 'split' | 'floating'

export interface NotificationAction { id: string; label: string }
export interface ThemeDefinition { accent?: string; icon?: string; sound?: string }
export interface NotificationOptions {
  handle?: string
  id?: string
  type?: NotificationType
  theme?: string
  title?: string
  message: string
  icon?: string
  duration?: number
  persistent?: boolean
  priority?: number
  position?: NotificationPosition
  sound?: boolean | string
  progress?: boolean | number
  progressStyle?: ProgressStyle
  mode?: NotificationMode
  design?: NotificationDesign
  duplicateMode?: DuplicateMode
  actions?: NotificationAction[]
  metadata?: Record<string, unknown>
}

export interface NotificationItem extends Required<Pick<NotificationOptions, 'handle' | 'type' | 'message' | 'duration' | 'persistent' | 'priority' | 'position' | 'progressStyle' | 'duplicateMode'>> {
  id?: string
  theme?: string
  title?: string
  icon?: string
  sound?: boolean | string
  progress?: boolean | number
  actions?: NotificationAction[]
  metadata?: Record<string, unknown>
  createdAt: number
  startedAt: number
  remaining: number
  paused: boolean
  count: number
  phase: 'entering' | 'visible' | 'leaving'
  actionLocked: boolean
  mode: NotificationMode
  resolvedMode: ResolvedNotificationMode
  design: NotificationDesign
}
