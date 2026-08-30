import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NotificationStacks } from './NotificationStack'
import { notificationStore } from '../../store/notificationStore'

describe('notification UI', () => {
  it('renders semantic content without HTML injection', () => {
    notificationStore.add({ type:'success', title:'Complete', message:'<b>safe text</b>' })
    render(<NotificationStacks />)
    expect(screen.getByText('<b>safe text</b>')).toBeInTheDocument(); expect(document.querySelector('b')?.textContent).not.toBe('safe text')
  })
  it('pauses and resumes on hover', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    const handle=notificationStore.add({message:'Hover me'})!
    render(<NotificationStacks />); const card=screen.getByRole('status')
    fireEvent.mouseEnter(card); expect(notificationStore.getSnapshot().items.find(item=>item.handle===handle)?.paused).toBe(true)
    fireEvent.mouseLeave(card); expect(notificationStore.getSnapshot().items.find(item=>item.handle===handle)?.paused).toBe(false)
  })
  it('labels all eight stack positions', () => {
    render(<NotificationStacks />)
    expect(screen.getAllByRole('region')).toHaveLength(8)
  })
  it('sets CEF-safe accent variables on every card', () => {
    notificationStore.add({ type: 'success', title: 'Accent', message: 'vars' })
    render(<NotificationStacks />)
    const style = screen.getByText('Accent').closest('article')!.style
    expect(style.getPropertyValue('--notify-accent')).toBe('#61D6A3')
    expect(style.getPropertyValue('--accent-a14')).toBe('rgba(97, 214, 163, 0.14)')
    expect(style.getPropertyValue('--accent-hover')).toBe('#74dbae')
  })
  it('renders automatic and explicit mode classes', () => {
    notificationStore.add({message:'Micro signal'})
    notificationStore.add({message:'Forced full',mode:'full'})
    render(<NotificationStacks />)
    expect(screen.getByText('Micro signal').closest('article')).toHaveClass('mode-micro')
    expect(screen.getByText('Forced full').closest('article')).toHaveClass('mode-full')
  })
  it('renders all production design classes in full and micro modes', () => {
    notificationStore.configure({maxVisible:4})
    notificationStore.add({message:'Split micro',design:'split',mode:'micro'})
    notificationStore.add({message:'Floating micro',design:'floating',mode:'micro'})
    notificationStore.add({message:'Split full',design:'split',mode:'full'})
    notificationStore.add({message:'Floating full',design:'floating',mode:'full'})
    render(<NotificationStacks />)
    for (const design of ['Split','Floating']) {
      expect(screen.getByText(`${design} micro`).closest('article')).toHaveClass(`design-${design.toLowerCase()}`, 'mode-micro')
      expect(screen.getByText(`${design} full`).closest('article')).toHaveClass(`design-${design.toLowerCase()}`, 'mode-full')
    }
    expect(document.querySelector('.design-rail')).not.toBeInTheDocument()
  })
  it('renders persistent, progress, duplicate, and queue indicators', () => {
    notificationStore.configure({maxVisible:3})
    notificationStore.add({title:'Persistent',message:'Active',persistent:true})
    notificationStore.add({title:'Progress',message:'Working',progress:65})
    notificationStore.add({title:'Duplicate',message:'Paid',id:'salary',duplicateMode:'increment'})
    notificationStore.add({title:'Duplicate',message:'Paid',id:'salary',duplicateMode:'increment'})
    notificationStore.add({message:'Queued'})
    render(<NotificationStacks />)
    expect(screen.getByTitle('Persistent notification')).toHaveTextContent('∞')
    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByText('×2')).toBeInTheDocument()
    expect(screen.getByText('1 queued')).toBeInTheDocument()
  })
})
