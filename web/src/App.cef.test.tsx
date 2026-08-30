import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./utils/environment', () => ({ isEnvBrowser: false }))
import App from './App'

describe('FiveM CEF separation', () => {
  it('renders only the transparent notification layer', () => {
    render(<App />)
    expect(screen.queryByLabelText('Notification playground')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name:/gameplay/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Default design')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })
})
