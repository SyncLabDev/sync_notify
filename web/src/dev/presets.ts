import type { NotificationOptions } from '../types/notification'

export const presets: Record<string, NotificationOptions> = {
  Success: { type: 'success', title: 'Vehicle purchased', message: 'Your Sultan RS has been delivered.', icon: 'car' },
  Error: { type: 'error', title: 'Transaction declined', message: 'Your account could not authorize this payment.' },
  Warning: { type: 'warning', title: 'Fuel reserve', message: 'Your vehicle has less than 10% fuel remaining.' },
  Info: { type: 'info', title: 'Route updated', message: 'A new waypoint has been marked on your map.' },
  Dispatch: { type: 'dispatch', title: '10-80 vehicle pursuit', message: 'Alta Street · Dark sports coupe', priority: 3, duration: 10000 },
  Priority: { type: 'warning', title: 'Security notice', message: 'Restricted access detected nearby.', priority: 2 },
  Action: { type: 'info', title: 'Job invitation', message: 'John invited you to join Burgershot.', duration: 15000, actions: [{ id: 'accept', label: 'Accept' }, { id: 'decline', label: 'Decline' }] },
  Persistent: { type: 'info', title: 'Uploading evidence', message: 'Preparing secure upload…', persistent: true, progress: 38, icon: 'loader' },
  Progress: { type: 'info', title: 'Vehicle diagnostics', message: 'Scanning control modules…', duration: 12000, progress: 64 }
  ,Micro: { type: 'success', message: 'Vehicle locked.', icon: 'check', mode: 'micro' }
  ,Full: { type: 'info', title: 'Route updated', message: 'A new waypoint has been marked on your map.', mode: 'full' }
  ,Split: { type: 'info', title: 'Module linked', message: 'Icon and content channels are synchronized.', design: 'split', mode: 'full' }
  ,Floating: { type: 'dispatch', title: 'Detached signal', message: 'Independent rail telemetry is active.', design: 'floating', mode: 'full' }
}
