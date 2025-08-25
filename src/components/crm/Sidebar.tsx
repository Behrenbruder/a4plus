'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  CalendarIcon,
  EnvelopeIcon,
  CurrencyEuroIcon,
  GiftIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { UserRole } from '@/lib/crm-types'

interface SidebarProps {
  userRole: UserRole
  userName: string
  userEmail: string
  onLogout: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  roles: UserRole[]
  badge?: number
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/crm',
    icon: HomeIcon,
    roles: ['admin', 'vertrieb', 'monteur']
  },
  {
    name: 'Kunden & Leads',
    href: '/crm/customers',
    icon: UserGroupIcon,
    roles: ['admin', 'vertrieb'],
    children: [
      { name: 'Alle Kunden', href: '/crm/customers', icon: UserGroupIcon, roles: ['admin', 'vertrieb'] },
      { name: 'Lead Pipeline', href: '/crm/customers/pipeline', icon: ChartBarIcon, roles: ['admin', 'vertrieb'] },
      { name: 'Neuer Kunde', href: '/crm/customers/new', icon: UserIcon, roles: ['admin', 'vertrieb'] }
    ]
  },
  {
    name: 'Projekte',
    href: '/crm/projects',
    icon: BuildingOfficeIcon,
    roles: ['admin', 'vertrieb', 'monteur'],
    children: [
      { name: 'Alle Projekte', href: '/crm/projects', icon: BuildingOfficeIcon, roles: ['admin', 'vertrieb', 'monteur'] },
      { name: 'Meine Projekte', href: '/crm/projects/mine', icon: UserIcon, roles: ['monteur'] },
      { name: 'Neues Projekt', href: '/crm/projects/new', icon: BuildingOfficeIcon, roles: ['admin', 'vertrieb'] }
    ]
  },
  {
    name: 'Angebote',
    href: '/crm/quotes',
    icon: DocumentTextIcon,
    roles: ['admin', 'vertrieb'],
    children: [
      { name: 'Alle Angebote', href: '/crm/quotes', icon: DocumentTextIcon, roles: ['admin', 'vertrieb'] },
      { name: 'Neues Angebot', href: '/crm/quotes/new', icon: DocumentTextIcon, roles: ['admin', 'vertrieb'] }
    ]
  },
  {
    name: 'Kommunikation',
    href: '/crm/communication',
    icon: ChatBubbleLeftRightIcon,
    roles: ['admin', 'vertrieb'],
    children: [
      { name: 'Chat', href: '/crm/communication/chat', icon: ChatBubbleLeftRightIcon, roles: ['admin', 'vertrieb'] },
      { name: 'E-Mails', href: '/crm/communication/emails', icon: EnvelopeIcon, roles: ['admin', 'vertrieb'] },
      { name: 'Kontakt-Historie', href: '/crm/communication/history', icon: ClipboardDocumentListIcon, roles: ['admin', 'vertrieb'] }
    ]
  },
  {
    name: 'Dokumente',
    href: '/crm/documents',
    icon: FolderIcon,
    roles: ['admin', 'vertrieb', 'monteur']
  },
  {
    name: 'Termine',
    href: '/crm/calendar',
    icon: CalendarIcon,
    roles: ['admin', 'vertrieb', 'monteur']
  },
  {
    name: 'Förderungen',
    href: '/crm/subsidies',
    icon: GiftIcon,
    roles: ['admin', 'vertrieb'],
    children: [
      { name: 'Verfügbare Förderungen', href: '/crm/subsidies', icon: GiftIcon, roles: ['admin', 'vertrieb'] },
      { name: 'Kunden-Förderungen', href: '/crm/subsidies/customers', icon: UserGroupIcon, roles: ['admin', 'vertrieb'] }
    ]
  },
  {
    name: 'Kalkulation',
    href: '/crm/calculator',
    icon: CurrencyEuroIcon,
    roles: ['admin', 'vertrieb']
  },
  {
    name: 'Marketing',
    href: '/crm/marketing',
    icon: MegaphoneIcon,
    roles: ['admin', 'vertrieb'],
    children: [
      { name: 'Kampagnen', href: '/crm/marketing/campaigns', icon: MegaphoneIcon, roles: ['admin', 'vertrieb'] },
      { name: 'Newsletter', href: '/crm/marketing/newsletter', icon: EnvelopeIcon, roles: ['admin', 'vertrieb'] },
      { name: 'Automatisierung', href: '/crm/marketing/automation', icon: CogIcon, roles: ['admin'] }
    ]
  },
  {
    name: 'Berichte & KPIs',
    href: '/crm/reports',
    icon: ChartBarIcon,
    roles: ['admin', 'vertrieb'],
    children: [
      { name: 'Dashboard', href: '/crm/reports/dashboard', icon: ChartBarIcon, roles: ['admin', 'vertrieb'] },
      { name: 'Umsatz-Berichte', href: '/crm/reports/revenue', icon: CurrencyEuroIcon, roles: ['admin', 'vertrieb'] },
      { name: 'Lead-Analyse', href: '/crm/reports/leads', icon: UserGroupIcon, roles: ['admin', 'vertrieb'] }
    ]
  },
  {
    name: 'Benachrichtigungen',
    href: '/crm/notifications',
    icon: BellIcon,
    roles: ['admin', 'vertrieb', 'monteur'],
    badge: 3
  },
  {
    name: 'Einstellungen',
    href: '/crm/settings',
    icon: CogIcon,
    roles: ['admin'],
    children: [
      { name: 'Benutzer', href: '/crm/settings/users', icon: UserGroupIcon, roles: ['admin'] },
      { name: 'Automatisierung', href: '/crm/settings/automation', icon: CogIcon, roles: ['admin'] },
      { name: 'Integrationen', href: '/crm/settings/integrations', icon: BuildingOfficeIcon, roles: ['admin'] },
      { name: 'E-Mail Templates', href: '/crm/settings/email-templates', icon: EnvelopeIcon, roles: ['admin'] }
    ]
  }
]

export default function Sidebar({ userRole, userName, userEmail, onLogout, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  const isActive = (href: string) => {
    if (href === '/crm') {
      return pathname === '/crm'
    }
    return pathname.startsWith(href)
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const active = isActive(item.href)
    const filteredChildren = item.children?.filter(child => child.roles.includes(userRole))

    return (
      <div key={item.name}>
        <div className="flex items-center">
          <Link
            href={item.href}
            className={`
              flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${level > 0 ? 'ml-6' : ''}
              ${active 
                ? 'bg-emerald-100 text-emerald-900 border-r-2 border-emerald-500' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {item.badge}
              </span>
            )}
          </Link>
          {hasChildren && filteredChildren && filteredChildren.length > 0 && (
            <button
              onClick={() => toggleExpanded(item.name)}
              className="p-1 ml-1 rounded hover:bg-gray-100"
            >
              <svg
                className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        {hasChildren && isExpanded && filteredChildren && (
          <div className="mt-1 space-y-1">
            {filteredChildren.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Desktop collapse button */}
      <div className="hidden lg:block fixed top-4 z-50 transition-all duration-300" style={{ left: isCollapsed ? '72px' : '256px' }}>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          {isCollapsed ? (
            <Bars3Icon className="h-5 w-5" />
          ) : (
            <XMarkIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-center h-16 px-4 bg-emerald-600">
            {isCollapsed ? (
              <div className="text-xl font-bold text-white">A+</div>
            ) : (
              <h1 className="text-xl font-bold text-white">ArtePlus CRM</h1>
            )}
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                  <p className="text-xs text-emerald-600 font-medium capitalize">{userRole}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {filteredNavigation.map(item => renderNavigationItem(item))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
