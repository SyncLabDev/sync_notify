import type { NotificationItem } from '../../types/notification'

const railClasses = (kind: string, hovering: boolean) => `notify-rail ${hovering ? 'is-hovered' : ''} ${kind}`

export function NotificationRail({ item, hovering = false }: { item: NotificationItem; hovering?: boolean }) {
  const explicit = typeof item.progress === 'number'
  const progress = explicit ? item.progress : 100
  if (item.progressStyle === 'none') return null
  const kind = explicit ? 'is-explicit' : item.persistent ? 'is-persistent' : 'is-timed'
  return <span className={railClasses(kind, hovering)} aria-hidden="true">
    <i className="rail-cap rail-cap-top" />
    <span style={explicit ? { height: `${progress}%` } : item.persistent ? undefined : { animationDuration: `${item.duration}ms`, animationPlayState: item.paused ? 'paused' : 'running' }} />
    <i className="rail-cap rail-cap-bottom" />
  </span>
}
