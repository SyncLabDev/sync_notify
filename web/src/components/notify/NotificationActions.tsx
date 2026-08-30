import type { NotificationItem } from '../../types/notification'
import { notificationStore } from '../../store/notificationStore'
import { fetchNui } from '../../utils/fetchNui'

export function NotificationActions({ item }: { item: NotificationItem }) {
  if (!item.actions?.length) return null
  const choose = async (actionId: string) => {
    if (item.actionLocked) return
    notificationStore.lockAction(item.handle)
    const result = await fetchNui<{ ok: boolean }>('action', { handle: item.handle, actionId })
    if (result.ok) notificationStore.remove(item.handle)
    else notificationStore.update(item.handle, { actionLocked: false })
  }
  return <div className="notify-actions" aria-label="Notification actions">
    {item.actions.map((action, index) => <button type="button" key={action.id} className={index === 0 ? 'is-primary' : ''} disabled={item.actionLocked} onClick={() => void choose(action.id)}>{action.label}</button>)}
  </div>
}
