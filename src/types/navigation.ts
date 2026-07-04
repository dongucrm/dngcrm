import type { LucideIcon } from 'lucide-react'
import type { AppRole } from './database'

export type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  allowedRoles?: AppRole[]
  hideWhenAuthenticated?: boolean
  requiresAuth?: boolean
}
