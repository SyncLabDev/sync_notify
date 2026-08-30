import { describe, expect, it } from 'vitest'
import css from './styles.css?raw'

describe('FiveM CEF stylesheet compatibility', () => {
  it('never uses CSS color features older CEF builds drop', () => {
    // color-mix()/oklch()/lab() need Chromium 111+; FiveM's CEF is older and
    // silently discards the whole declaration — accents must come from utils/accent.ts.
    const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(declarations).not.toMatch(/color-mix\(|oklch\(|oklab\(|\blab\(|\blch\(/)
    expect(declarations).not.toMatch(/backdrop-filter\s*:/)
  })
  it('keeps the reduced-motion overrides scoped to the workbench', () => {
    const block = css.match(/@media \(prefers-reduced-motion: reduce\)[^{]*\{([\s\S]*)$/)
    expect(block).not.toBeNull()
    expect(block![1]).not.toMatch(/(?<!\.dev-root )\.notification(?![\w-])/)
    expect(block![1]).toMatch(/\.dev-root \.notify-rail\.is-timed/)
  })
})
