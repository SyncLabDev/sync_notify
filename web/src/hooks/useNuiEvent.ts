import { useEffect } from 'react'

export function useNuiEvent<T>(action: string, handler: (data: T) => void) {
  useEffect(() => {
    const listener = (event: MessageEvent<{ scope?: string; action?: string; data?: T }>) => {
      if (event.data?.scope !== 'sync_notify' || event.data.action !== action || event.data.data === undefined) return
      handler(event.data.data)
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [action, handler])
}

