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
    allowedRoles: ['admin', 'satis_personeli'],
    requiresAuth: true,
  },
  {
    label: 'Health',
    href: '/health',
    icon: Activity,
    allowedRoles: ['admin'],
    requiresAuth: true,
  },
  {
    label: 'Giriş',
    href: '/login',
    icon: LogIn,
    hideWhenAuthenticated: true,
  },
]
