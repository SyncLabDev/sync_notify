import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { notificationStore } from '../../store/notificationStore'
import type { NotificationPosition } from '../../types/notification'
import { Notification } from './Notification'

const positions: NotificationPosition[] = ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

function PositionStack({ position }: { position: NotificationPosition }) {
  const view = notificationStore.positionView(position)
  const stackRef = useRef<HTMLElement>(null)
  const tops = useRef(new Map<string, number>())
  useLayoutEffect(() => {
    try {
      const stack = stackRef.current
      if (!stack) return
      const seen = new Set<string>()
      stack.querySelectorAll<HTMLElement>('[data-notify-handle]').forEach(cell => {
        const handle = cell.dataset.notifyHandle
        if (!handle) return
        seen.add(handle)
        const top = cell.offsetTop
        const previous = tops.current.get(handle)
        if (previous !== undefined && !prefersReducedMotion() && Math.abs(previous - top) > 0.5) {
          cell.style.transition = 'none'
          cell.style.transform = `translateY(${previous - top}px)`
          requestAnimationFrame(() => {
            cell.style.transition = 'transform 180ms cubic-bezier(.22,.72,.24,1)'
            cell.style.transform = ''
          })
        }
        tops.current.set(handle, top)
      })
      for (const handle of [...tops.current.keys()]) if (!seen.has(handle)) tops.current.delete(handle)
    } catch { /* FLIP is progressive enhancement; never let it break the render */ }
  })
  return <section ref={stackRef} className={`notification-stack ${position}`} data-position={position} aria-label={`${position.replace('-', ' ')} notifications`}>
    {view.visible.map(item => <div className="stack-cell" data-notify-handle={item.handle} key={item.handle}><Notification item={item} /></div>)}
    {view.queued > 0 && <span className="queue-indicator" role="status">{view.queued} queued</span>}
  </section>
}

export function NotificationStacks() {
  useSyncExternalStore(notificationStore.subscribe, notificationStore.getSnapshot)
  return <div className="notification-layer" aria-label="Notifications">
    {positions.map(position => <PositionStack position={position} key={position} />)}
  </div>
}
