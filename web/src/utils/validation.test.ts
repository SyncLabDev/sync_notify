import { describe, expect, it } from 'vitest'
import { normalizeDesign, normalizeNotification, resolveNotificationMode } from './validation'

describe('normalizeNotification', () => {
  it('rejects empty messages', () => expect(normalizeNotification({ message: '' })).toBeNull())
  it('clamps unsafe input', () => {
    const item = normalizeNotification({ message: 'x'.repeat(700), title: 't'.repeat(100), duration: 100000, priority: 9, position: 'bad' as never })!
    expect(item.message).toHaveLength(500); expect(item.title).toHaveLength(80); expect(item.duration).toBe(60000); expect(item.priority).toBe(3); expect(item.position).toBe('top-right')
  })
  it('deduplicates and limits actions', () => {
    const item = normalizeNotification({ message: 'Choose', actions: [{id:'a',label:'A'},{id:'a',label:'Again'},{id:'b',label:'B'},{id:'c',label:'C'}] })!
    expect(item.actions?.map(action => action.id)).toEqual(['a','b'])
  })
  it('gives numeric progress precedence', () => expect(normalizeNotification({ message: 'Working', duration: 9000, progress: 72 })?.progress).toBe(72))
  it('resolves automatic micro and full modes deterministically', () => {
    expect(resolveNotificationMode({})).toBe('micro')
    expect(resolveNotificationMode({ title:'Title' })).toBe('full')
    expect(resolveNotificationMode({ type:'dispatch' })).toBe('full')
    expect(resolveNotificationMode({ priority:2 })).toBe('full')
    expect(resolveNotificationMode({ actions:[{id:'yes',label:'Yes'}] })).toBe('full')
  })
  it('honors explicit modes and rejects invalid values', () => {
    expect(normalizeNotification({ message:'Forced', title:'Title', mode:'micro' })?.resolvedMode).toBe('micro')
    expect(normalizeNotification({ message:'Forced', mode:'full' })?.resolvedMode).toBe('full')
    expect(normalizeNotification({ message:'Fallback', mode:'invalid' as never })?.mode).toBe('auto')
  })
  it('validates designs and supports a configured fallback', () => {
    expect(normalizeNotification({ message:'Default' })?.design).toBe('floating')
    expect(normalizeNotification({ message:'Split', design:'split' })?.design).toBe('split')
    expect(normalizeNotification({ message:'Floating', design:'floating' })?.design).toBe('floating')
    expect(normalizeNotification({ message:'Legacy', design:'rail' as never })?.design).toBe('floating')
    expect(normalizeDesign('invalid', 'split')).toBe('split')
    expect(normalizeNotification({ message:'Configured' }, 1, 'floating')?.design).toBe('floating')
  })
})
