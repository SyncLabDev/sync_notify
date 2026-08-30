import { useState } from 'react'
import { notificationStore } from '../store/notificationStore'
import type { DuplicateMode, NotificationDesign, NotificationMode, NotificationOptions, NotificationPosition, NotificationType } from '../types/notification'
import { presets } from './presets'

export function Playground({ position, defaultDesign }: { position: NotificationPosition; defaultDesign: NotificationDesign }) {
  const [draft, setDraft] = useState<NotificationOptions>({ ...presets.Success, position })
  const [lastHandle, setLastHandle] = useState<string | null>(null)
  const field = <K extends keyof NotificationOptions>(key: K, value: NotificationOptions[K]) => setDraft(current => ({ ...current, [key]: value }))
  const send = () => { const handle = notificationStore.add({ ...draft, position }); if (handle) setLastHandle(handle) }
  const burst = (count: number) => { for (let index = 0; index < count; index += 1) notificationStore.add({ ...presets[index % 2 ? 'Info' : 'Success'], title: `Stack event ${index + 1}`, position, duration: 2500 + index * 20 }) }
  const duplicate = () => { for (let index = 0; index < 4; index += 1) notificationStore.add({ ...presets.Success, id: 'salary_payment', duplicateMode: 'increment', title: 'Salary received', message: '$2,500 deposited.', position }) }
  const compare = (mode: 'full' | 'micro') => { notificationStore.clear(position); (['split', 'floating'] as NotificationDesign[]).forEach(design => notificationStore.add({ ...presets.Info, id: `concept-${mode}-${design}`, title: mode === 'full' ? 'Telemetry link' : undefined, message: 'Identical signal content for geometry review.', design, mode, position, persistent: true, progress: 72 })) }
  return <aside className="playground" aria-label="Notification playground">
    <div className="playground-heading"><div><span>Test bench</span><h1>Notification signal</h1></div><p>Compose, mutate, and stress the production renderer.</p></div>
    <div className="preset-row">{Object.entries(presets).map(([name, value]) => <button key={name} onClick={() => setDraft({ ...value, position })}>{name}</button>)}</div>
    <div className="form-grid">
      <label>Type<select value={draft.type} onChange={event => field('type', event.target.value as NotificationType)}>{['success','error','warning','info','dispatch','custom'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Mode<select value={draft.mode ?? 'auto'} onChange={event => field('mode', event.target.value as NotificationMode)}>{['auto','micro','full'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Design<select value={draft.design ?? defaultDesign} onChange={event => field('design', event.target.value as NotificationDesign)}>{['floating','split'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Title<input value={draft.title ?? ''} maxLength={80} onChange={event => field('title', event.target.value)} /></label>
      <label className="message-field">Message<textarea value={draft.message} maxLength={500} onChange={event => field('message', event.target.value)} /></label>
      <label>Icon<input value={draft.icon ?? ''} onChange={event => field('icon', event.target.value)} /></label>
      <label>Duration <output>{draft.duration ?? 5000} ms</output><input type="range" min="1000" max="60000" step="500" value={draft.duration ?? 5000} onChange={event => field('duration', Number(event.target.value))} /></label>
      <label>Priority<select value={draft.priority ?? 0} onChange={event => field('priority', Number(event.target.value))}>{[0,1,2,3].map(value => <option key={value} value={value}>P{value}</option>)}</select></label>
      <label>Progress<input type="number" min="0" max="100" value={typeof draft.progress === 'number' ? draft.progress : ''} onChange={event => field('progress', event.target.value === '' ? undefined : Number(event.target.value))} /></label>
      <label>Theme<input value={draft.theme ?? ''} onChange={event => field('theme', event.target.value)} /></label>
      <label>Duplicate ID<input value={draft.id ?? ''} onChange={event => field('id', event.target.value)} /></label>
      <label>Duplicate mode<select value={draft.duplicateMode ?? 'allow'} onChange={event => field('duplicateMode', event.target.value as DuplicateMode)}>{['allow','replace','increment','refresh'].map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="check"><input type="checkbox" checked={draft.persistent ?? false} onChange={event => field('persistent', event.target.checked)} />Persistent</label>
      <label className="check"><input type="checkbox" checked={draft.sound === true} onChange={event => field('sound', event.target.checked)} />Sound</label>
    </div>
    <div className="command-row"><button className="send" onClick={send}>Send notification</button><button disabled={!lastHandle} onClick={() => lastHandle && notificationStore.update(lastHandle, { progress: 100, title: 'Update complete', type: 'success', persistent: false })}>Update last</button><button disabled={!lastHandle} onClick={() => lastHandle && notificationStore.remove(lastHandle)}>Remove last</button><button onClick={() => notificationStore.clear()}>Clear all</button></div>
    <div className="stress-row"><span>Signal tests</span><button onClick={() => compare('full')}>Compare full</button><button onClick={() => compare('micro')}>Compare micro</button><button onClick={() => burst(4)}>Stack ×4</button><button onClick={() => burst(8)}>Queue ×8</button><button onClick={() => burst(50)}>Rapid ×50</button><button onClick={() => burst(100)}>Spam ×100</button><button onClick={duplicate}>Duplicate ×4</button></div>
  </aside>
}
