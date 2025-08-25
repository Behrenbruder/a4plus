'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { 
  DashboardStats, 
  LeadPipelineStats, 
  ProductInterestStats, 
  MonthlyMetrics,
  UserRole 
} from '@/lib/crm-types'

interface DashboardProps {
  userRole: UserRole
}

export default function Dashboard({ userRole }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalLeads: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    averageDealSize: 0,
    leadsThisMonth: 0,
    projectsCompleted: 0
  })

  const [pipelineStats, setPipelineStats] = useState<LeadPipelineStats>({
    neu: 0,
    qualifiziert: 0,
    angebot_erstellt: 0,
    in_verhandlung: 0,
    gewonnen: 0,
    verloren: 0
  })

  const [productStats, setProductStats] = useState<ProductInterestStats>({
    pv: 0,
    speicher: 0,
    waermepumpe: 0,
    fenster: 0,
    tueren: 0,
    daemmung: 0,
    rollaeden: 0
  })

  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data - in production, this would be API calls
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStats({
        totalCustomers: 247,
        totalLeads: 89,
        activeProjects: 34,
        monthlyRevenue: 125000,
        conversionRate: 23.5,
        averageDealSize: 15750,
        leadsThisMonth: 28,
        projectsCompleted: 156
      })

      setPipelineStats({
        neu: 28,
        qualifiziert: 15,
        angebot_erstellt: 12,
        in_verhandlung: 8,
        gewonnen: 5,
        verloren: 3
      })

      setProductStats({
        pv: 45,
        speicher: 32,
        waermepumpe: 28,
        fenster: 18,
        tueren: 15,
        daemmung: 22,
        rollaeden: 8
      })

      setMonthlyMetrics([
        { month: 'Jan', newLeads: 32, convertedLeads: 8, revenue: 98000, projects: 12 },
        { month: 'Feb', newLeads: 28, convertedLeads: 6, revenue: 87000, projects: 10 },
        { month: 'Mar', newLeads: 35, convertedLeads: 9, revenue: 125000, projects: 15 },
        { month: 'Apr', newLeads: 42, convertedLeads: 11, revenue: 156000, projects: 18 },
        { month: 'Mai', newLeads: 38, convertedLeads: 10, revenue: 142000, projects: 16 },
        { month: 'Jun', newLeads: 45, convertedLeads: 12, revenue: 178000, projects: 20 }
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    const colors = {
      neu: 'bg-blue-100 text-blue-800',
      qualifiziert: 'bg-yellow-100 text-yellow-800',
      angebot_erstellt: 'bg-purple-100 text-purple-800',
      in_verhandlung: 'bg-orange-100 text-orange-800',
      gewonnen: 'bg-green-100 text-green-800',
      verloren: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getProductIcon = (product: string) => {
    const icons = {
      pv: '☀️',
      speicher: '🔋',
      waermepumpe: '🌡️',
      fenster: '🪟',
      tueren: '🚪',
      daemmung: '🏠',
      rollaeden: '🎚️'
    }
    return icons[product as keyof typeof icons] || '📦'
  }

  const getProductName = (product: string) => {
    const names = {
      pv: 'PV-Anlagen',
      speicher: 'Speicher',
      waermepumpe: 'Wärmepumpen',
      fenster: 'Fenster',
      tueren: 'Türen',
      daemmung: 'Dämmung',
      rollaeden: 'Rolläden'
    }
    return names[product as keyof typeof names] || product
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Übersicht über Ihre CRM-Aktivitäten</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors">
            Daten aktualisieren
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gesamt Kunden</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                +12% vs. Vormonat
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktive Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                +8% vs. Vormonat
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktive Projekte</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              <p className="text-sm text-red-600 flex items-center">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                -3% vs. Vormonat
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monatsumsatz</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                +18% vs. Vormonat
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
            <p className="text-xl font-bold text-gray-900">{formatPercentage(stats.conversionRate)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Ø Auftragswert</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.averageDealSize)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Leads diesen Monat</p>
            <p className="text-xl font-bold text-gray-900">{stats.leadsThisMonth}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Abgeschlossene Projekte</p>
            <p className="text-xl font-bold text-gray-900">{stats.projectsCompleted}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Pipeline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Pipeline</h3>
          <div className="space-y-3">
            {Object.entries(pipelineStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(pipelineStats))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Interest */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Produktinteressen</h3>
          <div className="space-y-3">
            {Object.entries(productStats).map(([product, count]) => (
              <div key={product} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{getProductIcon(product)}</span>
                  <span className="text-sm font-medium text-gray-700">{getProductName(product)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(productStats))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Letzte Aktivitäten</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Neuer Lead: Max Mustermann</p>
                <p className="text-xs text-gray-500">PV-Anlage, vor 2 Stunden</p>
              </div>
            </div>
            <div className="flex items-start">
              <CurrencyEuroIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Angebot versendet: Anna Schmidt</p>
                <p className="text-xs text-gray-500">Wärmepumpe, vor 4 Stunden</p>
              </div>
            </div>
            <div className="flex items-start">
              <BuildingOfficeIcon className="h-5 w-5 text-purple-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Projekt abgeschlossen: Peter Weber</p>
                <p className="text-xs text-gray-500">Fenster-Installation, vor 1 Tag</p>
              </div>
            </div>
            <div className="flex items-start">
              <UserGroupIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Follow-up fällig: Lisa Müller</p>
                <p className="text-xs text-gray-500">Dämmung, vor 2 Tagen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Tasks */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Wichtige Hinweise</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">3 Follow-ups überfällig</p>
                <p className="text-xs text-gray-500">Kunden warten auf Rückmeldung</p>
              </div>
            </div>
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">5 Angebote laufen heute ab</p>
                <p className="text-xs text-gray-500">Nachfassen empfohlen</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Monatsziel zu 78% erreicht</p>
                <p className="text-xs text-gray-500">{formatCurrency(22000)} bis zum Ziel</p>
              </div>
            </div>
            <div className="flex items-start">
              <ChartBarIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Neue Förderung verfügbar</p>
                <p className="text-xs text-gray-500">KfW 270 - bis zu 100% Finanzierung</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schnellaktionen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <UserGroupIcon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Neuer Kunde</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BuildingOfficeIcon className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Neues Projekt</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CurrencyEuroIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Angebot erstellen</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Bericht erstellen</span>
          </button>
        </div>
      </div>
    </div>
  )
}
