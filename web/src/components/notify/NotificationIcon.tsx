import { Bell, Car, Check, HeartPulse, Info, LoaderCircle, Radio, Shield, TriangleAlert, Wallet, X } from 'lucide-react'

const icons = { bell: Bell, car: Car, check: Check, 'heart-pulse': HeartPulse, info: Info, loader: LoaderCircle, radio: Radio, shield: Shield, 'triangle-alert': TriangleAlert, wallet: Wallet, x: X }

export function NotificationIcon({ name = 'bell' }: { name?: string }) {
  const Icon = icons[name as keyof typeof icons] ?? Bell
  return <span className="notify-icon" aria-hidden="true"><Icon size={17} strokeWidth={1.9} /></span>
}

