import { isEnvBrowser } from './environment'

export async function fetchNui<T = unknown>(event: string, data: unknown = {}): Promise<T> {
  if (isEnvBrowser) return { ok: true } as T
  const resource = (window as unknown as { GetParentResourceName?: () => string }).GetParentResourceName?.() ?? 'sync_notify'
  const response = await fetch(`https://${resource}/${event}`, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(data) })
  return response.json() as Promise<T>
}

