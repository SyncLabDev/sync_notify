import type { CSSProperties } from 'react'

/**
 * FiveM ships an older CEF (Chromium ~103) that has no `color-mix()` — any
 * declaration using it is silently dropped, which broke card shells, borders,
 * and the rail track in-game. These helpers precompute every accent blend the
 * stylesheet needs as plain rgba()/hex custom properties instead.
 */

const DEFAULT_ACCENT = { r: 107, g: 191, b: 255 } // --sync-blue

const clamp255 = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

const hexToRgb = (hex: string) => {
  const digits = hex.slice(1)
  const full = digits.length === 3 ? digits.replace(/./g, pair => pair + pair) : digits
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) }
}

const rgbToHex = ({ r, g, b }: Rgb) => `#${[r, g, b].map(part => clamp255(part).toString(16).padStart(2, '0')).join('')}`

interface Rgb { r: number; g: number; b: number }

const parseAccent = (accent: string | undefined): Rgb => {
  if (!accent) return DEFAULT_ACCENT
  const value = accent.trim()
  if (value.startsWith('#')) return hexToRgb(value) ?? DEFAULT_ACCENT
  const numbers = value.match(/(\d{1,3})\D+(\d{1,3})\D+(\d{1,3})/)
  if (numbers) return { r: Number(numbers[1]), g: Number(numbers[2]), b: Number(numbers[3]) }
  return DEFAULT_ACCENT
}

const alpha = (color: Rgb, percent: number) => `rgba(${color.r}, ${color.g}, ${color.b}, ${percent / 100})`
const mix = (color: Rgb, other: Rgb, percent: number): Rgb => ({
  r: clamp255(color.r * percent / 100 + other.r * (100 - percent) / 100),
  g: clamp255(color.g * percent / 100 + other.g * (100 - percent) / 100),
  b: clamp255(color.b * percent / 100 + other.b * (100 - percent) / 100),
})

const WHITE: Rgb = { r: 255, g: 255, b: 255 }
const MODULE_BASE: Rgb = { r: 8, g: 16, b: 26 } // #08101a

/** Percentages below mirror the CEF-incompatible color-mix() calls they replace. */
export function accentVars(accent: string | undefined): CSSProperties {
  const color = parseAccent(accent)
  return {
    '--accent-a05': alpha(color, 5),
    '--accent-a13': alpha(color, 13),
    '--accent-a14': alpha(color, 14),
    '--accent-a19': alpha(color, 19),
    '--accent-a24': alpha(color, 24),
    '--accent-a28': alpha(color, 28),
    '--accent-a32': alpha(color, 32),
    '--accent-a42': alpha(color, 42),
    '--accent-a52': alpha(color, 52),
    '--accent-hover': rgbToHex(mix(color, WHITE, 88)),
    '--accent-primary': rgbToHex(mix(color, WHITE, 82)),
    '--accent-module': rgbToHex(mix(color, MODULE_BASE, 8)),
  } as CSSProperties
}
