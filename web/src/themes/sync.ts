import type { NotificationType, ThemeDefinition } from '../types/notification'

export const typeThemes: Record<NotificationType, Required<Pick<ThemeDefinition, 'accent' | 'icon'>>> = {
  success: { accent: '#61D6A3', icon: 'check' }, error: { accent: '#FF6B7A', icon: 'x' },
  warning: { accent: '#F5C96A', icon: 'triangle-alert' }, info: { accent: '#6BBFFF', icon: 'info' },
  dispatch: { accent: '#8EA8FF', icon: 'radio' }, custom: { accent: '#B29CFF', icon: 'bell' }
}

