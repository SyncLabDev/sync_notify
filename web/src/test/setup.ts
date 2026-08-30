import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { notificationStore } from '../store/notificationStore'

globalThis.requestAnimationFrame = callback => window.setTimeout(callback, 0)
afterEach(() => { cleanup(); notificationStore.reset(); vi.useRealTimers(); sessionStorage.clear() })

