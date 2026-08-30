import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureSound, getSoundSettings, playNotificationSound } from './sound'

interface FakeOscillator { type: string; frequency: { value: number }; startedAt: number }

let oscillators: FakeOscillator[]

class FakeAudioContext {
  currentTime = 0
  state = 'running'
  destination = {}
  createOscillator(): FakeOscillator { const oscillator = { type: '', frequency: { value: 0 }, startedAt: -1, connect() {}, start(at: number) { oscillator.startedAt = at }, stop() {} }; oscillators.push(oscillator); return oscillator }
  createGain() { return { gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} } }
  resume() {}
}

let fakeNow = 10_000
const cool = () => { fakeNow += 200 }

beforeEach(() => {
  vi.spyOn(performance, 'now').mockImplementation(() => fakeNow)
  oscillators = []
  vi.stubGlobal('AudioContext', FakeAudioContext)
  configureSound({ enabled: true, volume: 0.3 })
  cool()
})

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('sound engine', () => {
  it('stays silent when disabled or explicitly muted per item', () => {
    configureSound({ enabled: false })
    playNotificationSound('info')
    configureSound({ enabled: true })
    playNotificationSound('info', false)
    expect(oscillators).toHaveLength(0)
  })

  it('plays a two-tone chime using the type variant', () => {
    playNotificationSound('error')
    expect(oscillators.map(oscillator => oscillator.frequency.value)).toEqual([415.3, 311.1])
  })

  it('prefers item sound name, then theme sound, then type', () => {
    cool(); playNotificationSound('info', 'success')
    cool(); playNotificationSound('info', undefined, 'warning')
    expect(oscillators.map(oscillator => oscillator.frequency.value).slice(0, 4)).toEqual([659.3, 987.8, 523.3, 622.3])
  })

  it('coalesces rapid bursts into one chime', () => {
    playNotificationSound('info')
    playNotificationSound('info')
    playNotificationSound('info')
    expect(oscillators).toHaveLength(2)
  })

  it('survives an environment without AudioContext', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    const fresh = await import('./sound')
    fresh.configureSound({ enabled: true })
    expect(() => fresh.playNotificationSound('info')).not.toThrow()
  })

  it('clamps configured volume', () => {
    configureSound({ volume: 7 })
    expect(getSoundSettings().volume).toBe(1)
    configureSound({ volume: Number.NaN })
    expect(getSoundSettings().volume).toBe(1)
  })
})
