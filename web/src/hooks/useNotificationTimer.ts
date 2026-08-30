import { useEffect } from 'react'
import type { NotificationItem } from '../types/notification'
import { notificationStore } from '../store/notificationStore'
import { fetchNui } from '../utils/fetchNui'

export function useNotificationTimer(item: NotificationItem) {
  useEffect(() => {
    if (item.persistent || item.paused || item.phase === 'leaving') return
    const timer = window.setTimeout(() => {
      notificationStore.remove(item.handle)
      void fetchNui('expired', { handle: item.handle })
    }, item.remaining)
    return () => window.clearTimeout(timer)
  }, [item.handle, item.paused, item.persistent, item.phase, item.remaining, item.startedAt])
}

