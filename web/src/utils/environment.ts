declare global { interface Window { invokeNative?: (command: string, argument?: string) => unknown } }
export const isEnvBrowser = typeof window !== 'undefined' && typeof window.invokeNative !== 'function'

