import { useCallback, useEffect, useRef, useState } from 'react'
import { NotificationStacks } from './components/notify/NotificationStack'
import { DevToolbar, type DevView, type Viewport } from './dev/DevToolbar'
import { Playground } from './dev/Playground'
import { presets } from './dev/presets'
import { useNuiEvent } from './hooks/useNuiEvent'
import { notificationStore } from './store/notificationStore'
import type { NotificationDesign, NotificationOptions, NotificationPosition, ThemeDefinition } from './types/notification'
import { isEnvBrowser } from './utils/environment'
import { fetchNui } from './utils/fetchNui'
import { configureSound } from './utils/sound'

export default function App() {
  const [view, setView] = useState<DevView>(() => (sessionStorage.getItem('sync_notify_dev_view') as DevView) || 'gameplay')
  const [controls, setControls] = useState(() => sessionStorage.getItem('sync_notify_dev_controls') !== 'false')
  const [viewport, setViewport] = useState<Viewport>('responsive')
  const [position, setPosition] = useState<NotificationPosition>('top-right')
  const [design, setDesign] = useState<NotificationDesign>('floating')
  const bootstrapped = useRef(false)
  const notify = useCallback((data: NotificationOptions) => { notificationStore.add(data) }, [])
  const update = useCallback((data: { handle: string; patch: Partial<NotificationOptions> }) => notificationStore.update(data.handle, data.patch), [])
  const remove = useCallback((data: { handle: string }) => notificationStore.remove(data.handle), [])
  const clear = useCallback((data: { position?: NotificationPosition }) => notificationStore.clear(data.position), [])
  const registerTheme = useCallback((data: { name: string; definition: ThemeDefinition }) => notificationStore.registerTheme(data.name, data.definition), [])
  useNuiEvent('notify', notify); useNuiEvent('update', update); useNuiEvent('remove', remove); useNuiEvent('clear', clear); useNuiEvent('registerTheme', registerTheme); useNuiEvent('registerState', registerTheme)
  useEffect(() => { if (!isEnvBrowser) void fetchNui('ready').then((response: unknown) => {
    const value = response as { config?: { MaxVisible?: number; QueueLimit?: number; PauseOnHover?: boolean; Design?: NotificationDesign; Sound?: { enabled?: boolean; volume?: number }; Offset?: { x?: number; y?: number } }; themes?: Record<string, ThemeDefinition>; states?: Record<string, ThemeDefinition> }
    const config = value.config
    if (config) {
      notificationStore.configure({ maxVisible: config.MaxVisible, queueLimit: config.QueueLimit, pauseOnHover: config.PauseOnHover, defaultDesign: config.Design })
      configureSound(config.Sound)
      if (typeof config.Offset?.x === 'number') document.documentElement.style.setProperty('--offset-x', `${config.Offset.x}px`)
      if (typeof config.Offset?.y === 'number') document.documentElement.style.setProperty('--offset-y', `${config.Offset.y}px`)
    }
    for (const [name, definition] of Object.entries({ ...value.themes, ...value.states })) notificationStore.registerTheme(name, definition)
  }) }, [])
  useEffect(() => {
    if (isEnvBrowser) { configureSound({ enabled: true, volume: 0.15 }); if (!bootstrapped.current) { bootstrapped.current = true; notificationStore.add({ ...presets.Success, position: 'top-right' }) } }
  }, [])
  const changeView = (value: DevView) => { setView(value); sessionStorage.setItem('sync_notify_dev_view', value) }
  const toggleControls = () => setControls(value => { sessionStorage.setItem('sync_notify_dev_controls', String(!value)); return !value })
  const changeDesign = (value: NotificationDesign) => { setDesign(value); notificationStore.configure({ defaultDesign: value }) }
  if (!isEnvBrowser) return <main className="nui-root"><NotificationStacks /></main>
  return <main className={`dev-root view-${view} ${controls ? 'has-controls' : 'clean-preview'}`}>
    {controls && <DevToolbar view={view} design={design} controls={controls} viewport={viewport} position={position} onView={changeView} onDesign={changeDesign} onControls={toggleControls} onViewport={setViewport} onPosition={setPosition} onReset={() => { notificationStore.reset(); setDesign('floating'); setViewport('responsive'); setPosition('top-right'); changeView('gameplay') }} />}
    {!controls && <button className="floating-controls" onClick={toggleControls}>Show controls</button>}
    <div className={`preview-frame viewport-${viewport}`}><div className="gameplay-scene" aria-hidden="true"><div className="city-glow" /><div className="road"><i /><i /><i /></div><div className="hud-sim"><span>VINEWOOD</span><b>22:47</b></div></div><NotificationStacks /></div>
    {controls && <Playground position={position} defaultDesign={design} />}
  </main>
}
