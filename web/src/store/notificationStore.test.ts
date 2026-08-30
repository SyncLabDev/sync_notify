import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { notificationStore } from './notificationStore'

vi.mock('../utils/sound', () => ({ playNotificationSound: vi.fn(), configureSound: vi.fn(), getSoundSettings: vi.fn() }))

describe('notification store', () => {
  it('orders by priority then creation time', () => {
    vi.spyOn(Date, 'now').mockReturnValueOnce(1).mockReturnValueOnce(2)
    notificationStore.add({ message:'normal', priority:0 }); notificationStore.add({ message:'critical', priority:3 })
    expect(notificationStore.visible('top-right').map(item => item.message)).toEqual(['critical','normal'])
  })
  it('increments duplicates without changing handle', () => {
    const handle = notificationStore.add({ message:'Paid', id:'salary', duplicateMode:'increment' })!
    notificationStore.add({ message:'Paid', id:'salary', duplicateMode:'increment' })
    const item = notificationStore.getSnapshot().items[0]
    expect(item.handle).toBe(handle); expect(item.count).toBe(2)
  })
  it('refresh retains content and replace updates content', () => {
    notificationStore.add({ message:'First', id:'same', duplicateMode:'refresh' })
    notificationStore.add({ message:'Ignored', id:'same', duplicateMode:'refresh' })
    expect(notificationStore.getSnapshot().items[0].message).toBe('First')
    notificationStore.add({ message:'Replacement', id:'same', duplicateMode:'replace' })
    expect(notificationStore.getSnapshot().items[0].message).toBe('Replacement')
  })
  it('limits visible items and bounds the queue', () => {
    notificationStore.configure({ maxVisible:2, queueLimit:3 })
    for(let index=0;index<4;index++) notificationStore.add({ message:String(index) })
    expect(notificationStore.visible('top-right')).toHaveLength(2); expect(notificationStore.getSnapshot().items).toHaveLength(3)
  })
  it('locks actions once', () => {
    const handle=notificationStore.add({message:'Choose',actions:[{id:'yes',label:'Yes'}]})!
    notificationStore.lockAction(handle)
    expect(notificationStore.getSnapshot().items[0].actionLocked).toBe(true)
  })
  it('reports the per-position hidden queue count', () => {
    notificationStore.configure({ maxVisible:2 })
    for(let index=0;index<5;index++) notificationStore.add({ message:`Signal ${index}` })
    expect(notificationStore.positionView('top-right').visible).toHaveLength(2)
    expect(notificationStore.positionView('top-right').queued).toBe(3)
  })
  it('recalculates automatic mode after updates without changing handle', () => {
    const handle=notificationStore.add({message:'Simple'})!
    expect(notificationStore.getSnapshot().items[0].resolvedMode).toBe('micro')
    notificationStore.update(handle,{title:'Detailed'})
    const item=notificationStore.getSnapshot().items[0]
    expect(item.handle).toBe(handle); expect(item.resolvedMode).toBe('full')
    notificationStore.update(handle,{mode:'micro'})
    expect(notificationStore.getSnapshot().items[0].resolvedMode).toBe('micro')
  })
  it('uses the global design and changes a per-item design in place', () => {
    notificationStore.configure({defaultDesign:'split'})
    const handle=notificationStore.add({message:'Configured'})!
    expect(notificationStore.getSnapshot().items[0].design).toBe('split')
    notificationStore.update(handle,{design:'floating'})
    const item=notificationStore.getSnapshot().items[0]
    expect(item.handle).toBe(handle); expect(item.design).toBe('floating')
    notificationStore.update(handle,{design:'invalid' as never})
    expect(notificationStore.getSnapshot().items[0].design).toBe('split')
  })

  describe('sound triggers', () => {
    // setup.ts imports the store before mocks register; use a fresh module graph per test so the mocked engine applies.
    let store: typeof notificationStore
    let play: Mock
    beforeEach(async () => {
      vi.resetModules()
      const sound = await import('../utils/sound')
      play = sound.playNotificationSound as unknown as Mock
      ;({ notificationStore: store } = await import('./notificationStore'))
      play.mockClear()
    })
    it('plays on fresh adds with resolved theme sound', () => {
      store.registerTheme('police', { accent: '#4A8FFF', sound: 'dispatch' })
      store.add({ message: 'Unit 10-4', theme: 'police', type: 'dispatch' })
      expect(play).toHaveBeenCalledTimes(1)
      expect(play).toHaveBeenCalledWith('dispatch', undefined, 'dispatch')
    })
    it('plays on increment duplicates but not refresh or replace', () => {
      store.add({ message: 'Paid', id: 'salary', duplicateMode: 'increment' })
      store.add({ message: 'Paid', id: 'salary', duplicateMode: 'increment' })
      expect(play).toHaveBeenCalledTimes(2)
      store.add({ message: 'Ping', id: 'refresh-test', duplicateMode: 'refresh' })
      store.add({ message: 'Ping', id: 'refresh-test', duplicateMode: 'refresh' })
      expect(play).toHaveBeenCalledTimes(3)
      store.add({ message: 'Swap', id: 'replace-test', duplicateMode: 'replace' })
      store.add({ message: 'Swap', id: 'replace-test', duplicateMode: 'replace' })
      expect(play).toHaveBeenCalledTimes(4)
    })
    it('stays silent when the queue refuses the notification', () => {
      store.configure({ queueLimit: 1 })
      store.add({ message: 'Locked', persistent: true })
      expect(play).toHaveBeenCalledTimes(1)
      expect(store.add({ message: 'Refused' })).toBeNull()
      expect(play).toHaveBeenCalledTimes(1)
    })
  })
})
