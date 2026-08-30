import { useState, useEffect, useSyncExternalStore } from 'react'
import type { NotificationItem } from '../../types/notification'
import { notificationStore } from '../../store/notificationStore'
import { useNotificationTimer } from '../../hooks/useNotificationTimer'
import { fetchNui } from '../../utils/fetchNui'
import { accentVars } from '../../utils/accent'
import { typeThemes } from '../../themes/sync'
import { NotificationIcon } from './NotificationIcon'
import { NotificationRail } from './NotificationRail'
import { NotificationActions } from './NotificationActions'

export function Notification({ item }: { item: NotificationItem }) {
  useNotificationTimer(item)
  const { themes, pauseOnHover } = useSyncExternalStore(notificationStore.subscribe, notificationStore.getSnapshot)
  const [hovered, setHovered] = useState(false)
  const theme = { ...typeThemes[item.type], ...(item.theme ? themes[item.theme] : {}) }
  const interactive = Boolean(item.actions?.length)
  useEffect(() => {
    if (!interactive) return
    return () => { void fetchNui('focus', { enabled: false }) }
  }, [interactive])
  const microText = item.title || item.message
  const hovering = hovered && pauseOnHover && !item.persistent
  const setHover = (active: boolean) => {
    if (!pauseOnHover || item.persistent) return
    if (active) notificationStore.pause(item.handle); else notificationStore.resume(item.handle)
  }
  const onEnter = () => { setHovered(true); setHover(true) }
  const onLeave = () => { setHovered(false); setHover(false) }
  const setFocus = (focused: boolean) => { if (interactive) void fetchNui('focus', { enabled: focused }) }
  return <article
    className={`notification design-${item.design} mode-${item.resolvedMode} type-${item.type} priority-${item.priority} phase-${item.phase} ${interactive ? 'is-action' : ''} ${item.persistent ? 'is-persistent' : ''}`}
    style={{ '--notify-accent': theme.accent, ...accentVars(theme.accent) } as React.CSSProperties}
    role={item.priority >= 2 ? 'alert' : 'status'} aria-live={item.priority >= 2 ? 'assertive' : 'polite'}
    onMouseEnter={onEnter} onMouseLeave={onLeave}
    onFocusCapture={() => setFocus(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocus(false) }}
  >
    <NotificationRail item={item} hovering={hovering} />
    <NotificationIcon name={item.icon ?? theme.icon} />
    <div className="notify-copy">
      {item.resolvedMode === 'full' && <div className="notify-meta"><span>{item.type === 'dispatch' ? 'Dispatch signal' : item.type}</span>{item.priority > 0 && <b>P{item.priority}</b>}{item.persistent && <b title="Persistent notification">∞</b>}</div>}
      <h2>{item.resolvedMode === 'micro' ? microText : item.title || item.message}</h2>
      {item.resolvedMode === 'full' && item.title && <p>{item.message}</p>}
      {item.count > 1 && <span className="notify-count" key={item.count}>×{item.count}</span>}
    </div>
    {typeof item.progress === 'number' && item.progressStyle === 'rail' && <span className="notify-percent">{Math.round(item.progress)}%</span>}
    {item.progressStyle === 'minimal' && typeof item.progress === 'number' && <div className="minimal-progress"><span style={{ width: `${item.progress}%` }} /></div>}
    <NotificationActions item={item} />
    {item.priority > 0 && <span className="priority-corner" aria-hidden="true" />}
  </article>
}
