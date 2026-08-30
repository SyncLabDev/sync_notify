import type { NotificationDesign, NotificationPosition } from '../types/notification'

export type DevView = 'gameplay' | 'neutral' | 'transparent'
export type Viewport = 'responsive' | '1920x1080' | '2560x1440' | '3440x1440' | '3840x2160'

interface Props { view: DevView; design: NotificationDesign; controls: boolean; viewport: Viewport; position: NotificationPosition; onView: (value: DevView) => void; onDesign: (value: NotificationDesign) => void; onControls: () => void; onViewport: (value: Viewport) => void; onPosition: (value: NotificationPosition) => void; onReset: () => void }

export function DevToolbar(props: Props) {
  return <header className="dev-toolbar">
    <div className="dev-brand"><span>SYNC</span> NOTIFY <small>DEV</small></div>
    <div className="toolbar-group"><label>View</label>{(['gameplay', 'neutral', 'transparent'] as DevView[]).map(value => <button key={value} className={props.view === value ? 'active' : ''} onClick={() => props.onView(value)}>{value}</button>)}</div>
    <div className="toolbar-group"><label htmlFor="dev-design">Default design</label><select id="dev-design" value={props.design} onChange={event => props.onDesign(event.target.value as NotificationDesign)}>{['floating','split'].map(value => <option key={value}>{value}</option>)}</select></div>
    <div className="toolbar-group"><label htmlFor="dev-position">Position</label><select id="dev-position" value={props.position} onChange={event => props.onPosition(event.target.value as NotificationPosition)}>{['top-left','top-center','top-right','middle-left','middle-right','bottom-left','bottom-center','bottom-right'].map(value => <option key={value}>{value}</option>)}</select></div>
    <div className="toolbar-group viewport-group"><label htmlFor="viewport">Canvas</label><select id="viewport" value={props.viewport} onChange={event => props.onViewport(event.target.value as Viewport)}><option value="responsive">Responsive</option><option value="1920x1080">1920×1080</option><option value="2560x1440">2560×1440</option><option value="3440x1440">3440×1440</option><option value="3840x2160">3840×2160</option></select></div>
    <button className="controls-toggle" onClick={props.onControls}>{props.controls ? 'Hide controls' : 'Show controls'}</button>
    <button className="reset-button" onClick={props.onReset}>Reset</button>
  </header>
}
