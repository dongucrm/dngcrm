import { Activity, Home, LayoutDashboard, LogIn } from 'lucide-react'
import type { NavigationItem } from '../types/navigation'

export const navItems: NavigationItem[] = [
  {
    label: 'Ana Sayfa',
    href: '/',
    icon: Home,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Health',
    href: '/health',
    icon: Activity,
  },
  {
    label: 'Giriş',
    href: '/login',
    icon: LogIn,
  },
]
