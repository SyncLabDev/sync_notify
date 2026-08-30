import type { NotificationType } from '../types/notification'
import { isEnvBrowser } from './environment'

interface SoundSettings { enabled: boolean; volume: number }

const settings: SoundSettings = { enabled: false, volume: 0.3 }
const variantFrequencies: Record<string, [number, number]> = {
  success: [659.3, 987.8], error: [415.3, 311.1], warning: [523.3, 622.3],
  info: [880, 1318.5], dispatch: [740, 1108.7], custom: [587.3, 880]
}
let lastPlayedAt = 0
let context: AudioContext | null = null
const audioFiles = new Map<string, HTMLAudioElement | 'pending' | 'missing'>()

const soundFileUrl = (name: string) => {
  const file = `/sounds/${name.replace(/[^a-z0-9_-]/gi, '')}.ogg`
  if (isEnvBrowser) return file
  const resource = (window as unknown as { GetParentResourceName?: () => string }).GetParentResourceName?.() ?? 'sync_notify'
  return `https://${resource}${file}`
}

function readyAudio(name: string): HTMLAudioElement | null {
  const state = audioFiles.get(name)
  if (state === 'pending' || state === 'missing') return null
  if (state) return state
  try {
    const audio = new Audio()
    audioFiles.set(name, 'pending')
    audio.addEventListener('canplaythrough', () => audioFiles.set(name, audio), { once: true })
    audio.addEventListener('error', () => audioFiles.set(name, 'missing'), { once: true })
    audio.preload = 'auto'
    audio.src = soundFileUrl(name)
    audio.load()
  } catch { audioFiles.set(name, 'missing') }
  return null
}

export function configureSound(sound?: { enabled?: boolean; volume?: number } | null) {
  if (typeof sound?.enabled === 'boolean') settings.enabled = sound.enabled
  if (typeof sound?.volume === 'number' && Number.isFinite(sound.volume)) settings.volume = Math.min(1, Math.max(0, sound.volume))
}

export function getSoundSettings(): SoundSettings { return { ...settings } }

export function playNotificationSound(type: NotificationType, source?: boolean | string, themeSound?: string) {
  if (!settings.enabled || source === false) return
  const now = performance.now()
  if (now - lastPlayedAt < 120) return
  lastPlayedAt = now
  const name = typeof source === 'string' ? source.toLowerCase() : typeof themeSound === 'string' ? themeSound.toLowerCase() : type
  const pair = variantFrequencies[name] ?? variantFrequencies.info
  if (typeof source === 'string' || typeof themeSound === 'string') {
    const audio = readyAudio(name)
    if (audio) { audio.volume = settings.volume; audio.currentTime = 0; void audio.play().catch(() => synthesize(pair)); return }
  }
  synthesize(pair)
}

function synthesize([first, second]: [number, number]) {
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
    const start = context.currentTime
    ;[first, second].forEach((frequency, index) => {
      const oscillator = context!.createOscillator()
      const envelope = context!.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      const offset = start + index * 0.09
      envelope.gain.setValueAtTime(0, offset)
      envelope.gain.linearRampToValueAtTime(settings.volume, offset + 0.012)
      envelope.gain.exponentialRampToValueAtTime(0.0001, offset + 0.3)
      oscillator.connect(envelope)
      envelope.connect(context!.destination)
      oscillator.start(offset)
      oscillator.stop(offset + 0.32)
    })
  } catch { /* audio unavailable (jsdom, restricted webview): stay silent */ }
}
