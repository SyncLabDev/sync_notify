import { describe, expect, it } from 'vitest'
import { accentVars } from './accent'

const vars = accentVars('#61D6A3') as Record<string, string>

describe('accentVars', () => {
  it('produces plain rgba alpha variants a FiveM CEF build can parse', () => {
    expect(vars['--accent-a14']).toBe('rgba(97, 214, 163, 0.14)')
    expect(vars['--accent-a52']).toBe('rgba(97, 214, 163, 0.52)')
    for (const value of Object.values(vars)) expect(value).not.toMatch(/color-mix|oklch/)
  })
  it('blends with white for hover/primary text and with the dark module base', () => {
    expect(vars['--accent-hover']).toBe('#74dbae') // 88% accent + white
    expect(vars['--accent-primary']).toBe('#7dddb4') // 82% accent + white
    expect(vars['--accent-module']).toBe('#0f2025') // 8% accent into #08101a
  })
  it('accepts shorthand hex and rgb() strings', () => {
    expect((accentVars('#fff') as Record<string, string>)['--accent-a14']).toBe('rgba(255, 255, 255, 0.14)')
    expect((accentVars('rgb(10, 20, 30)') as Record<string, string>)['--accent-a05']).toBe('rgba(10, 20, 30, 0.05)')
  })
  it('falls back to the default sync blue for missing or malformed accents', () => {
    const fallback = accentVars(undefined) as Record<string, string>
    expect(fallback['--accent-a14']).toBe('rgba(107, 191, 255, 0.14)')
    expect((accentVars('hotpink; } body { display:none') as Record<string, string>)['--accent-a14']).toBe(fallback['--accent-a14'])
  })
})
