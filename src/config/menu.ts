import {
  BarChart3,
  BookOpen,
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  PhoneCall,
  Settings,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AppRole } from '../types/database'

export type MenuItemId =
  | 'dashboard'
  | 'leads'
  | 'parents'
  | 'students'
  | 'programs'
  | 'registrations'
  | 'payments'
  | 'call-list'
  | 'tasks'
  | 'whatsapp-templates'
  | 'reports'
  | 'users-roles'
  | 'settings'

export type MenuItem = {
  id: MenuItemId
  label: string
  path: string
  icon: LucideIcon
  visibleRoles: AppRole[]
  routeRoles: AppRole[]
  editRoles?: AppRole[]
}

const allRoles: AppRole[] = ['admin', 'satis_personeli']
const adminOnly: AppRole[] = ['admin']

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: allRoles,
  },
  {
    id: 'leads',
    label: 'Lead / Potansiyel Müşteri',
    path: '/leads',
    icon: UserPlus,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: allRoles,
  },
  {
    id: 'parents',
    label: 'Veliler',
    path: '/parents',
    icon: UsersRound,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: allRoles,
  },
  {
    id: 'students',
    label: 'Öğrenciler',
    path: '/students',
    icon: GraduationCap,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: allRoles,
  },
  {
    id: 'programs',
    label: 'Programlar',
    path: '/programs',
    icon: BookOpen,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: allRoles,
  },
  {
    id: 'registrations',
    label: 'Kayıtlar',
    path: '/registrations',
    icon: ClipboardList,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: allRoles,
  },
  {
    id: 'payments',
    label: 'Ödemeler',
    path: '/payments',
    icon: CreditCard,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: adminOnly,
  },
  {
    id: 'call-list',
    label: 'Arama Listesi',
    path: '/call-list',
    icon: PhoneCall,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: allRoles,
  },
  {
    id: 'tasks',
    label: 'Görevler',
    path: '/tasks',
    icon: ListChecks,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: allRoles,
  },
  {
    id: 'whatsapp-templates',
    label: 'WhatsApp Şablonları',
    path: '/whatsapp-templates',
    icon: MessageSquare,
    visibleRoles: allRoles,
    routeRoles: allRoles,
    editRoles: allRoles,
  },
  {
    id: 'reports',
    label: 'Raporlar',
    path: '/reports',
    icon: BarChart3,
    visibleRoles: adminOnly,
    routeRoles: adminOnly,
    editRoles: adminOnly,
  },
  {
    id: 'users-roles',
    label: 'Kullanıcılar ve Roller',
    path: '/users-roles',
    icon: ShieldCheck,
    visibleRoles: adminOnly,
    routeRoles: adminOnly,
    editRoles: adminOnly,
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    path: '/settings',
    icon: Settings,
    visibleRoles: adminOnly,
    routeRoles: adminOnly,
    editRoles: adminOnly,
  },
]

export const moduleMenuItems = menuItems.filter(
  (item) => item.id !== 'dashboard',
)
