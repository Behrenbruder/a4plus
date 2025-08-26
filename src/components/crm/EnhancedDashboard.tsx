'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { 
  DashboardStats, 
  LeadPipelineStats, 
  ProductInterestStats, 
  MonthlyMetrics,
  RevenueByProduct,
  ProductInterest 
} from '@/lib/crm-types'

interface EnhancedDashboardProps {
  className?: string
}

export default function EnhancedDashboard({ className = '' }: EnhancedDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pipelineStats, setPipelineStats] = useState<LeadPipelineStats | null>(null)
  const [productStats, setProductStats] = useState<ProductInterestStats | null>(null)
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetrics[]>([])
  const [revenueByProduct, setRevenueByProduct] = useState<RevenueByProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchDashboardData()
  }, [selectedPeriod])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Mock data - in production, this would be API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockStats: DashboardStats = {
        totalCustomers: 1247,
        totalLeads: 89,
        activeProjects: 34,
        monthlyRevenue: 285000,
        conversionRate: 23.5,
        averageDealSize: 18500,
        leadsThisMonth: 67,
        projectsCompleted: 156
      }

      const mockPipelineStats: LeadPipelineStats = {
        neu: 23,
        qualifiziert: 18,
        angebot_erstellt: 15,
        in_verhandlung: 12,
        gewonnen: 8,
        verloren: 13
      }

      const mockProductStats: ProductInterestStats = {
        pv: 45,
        speicher: 32,
        waermepumpe: 28,
        fenster: 19,
        tueren: 15,
        daemmung: 22,
        rollaeden: 8
      }

      const mockMonthlyMetrics: MonthlyMetrics[] = [
        { month: 'Jan', newLeads: 45, convertedLeads: 12, revenue: 220000, projects: 18 },
        { month: 'Feb', newLeads: 52, convertedLeads: 15, revenue: 275000, projects: 22 },
        { month: 'Mar', newLeads: 48, convertedLeads: 11, revenue: 195000, projects: 16 },
        { month: 'Apr', newLeads: 61, convertedLeads: 18, revenue: 320000, projects: 25 },
        { month: 'Mai', newLeads: 67, convertedLeads: 21, revenue: 385000, projects: 28 },
        { month: 'Jun', newLeads: 58, convertedLeads: 16, revenue: 285000, projects: 21 }
      ]

      const mockRevenueByProduct: RevenueByProduct[] = [
        { product: 'pv', revenue: 1250000, count: 67, averageValue: 18656 },
        { product: 'speicher', revenue: 480000, count: 32, averageValue: 15000 },
        { product: 'waermepumpe', revenue: 560000, count: 28, averageValue: 20000 },
        { product: 'fenster', revenue: 285000, count: 19, averageValue: 15000 },
        { product: 'tueren', revenue: 180000, count: 15, averageValue: 12000 },
        { product: 'daemmung', revenue: 330000, count: 22, averageValue: 15000 }
      ]

      setStats(mockStats)
      setPipelineStats(mockPipelineStats)
      setProductStats(mockProductStats)
      setMonthlyMetrics(mockMonthlyMetrics)
      setRevenueByProduct(mockRevenueByProduct)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getProductLabel = (product: ProductInterest) => {
    const labels = {
      pv: 'PV-Anlagen',
      speicher: 'Speicher',
      waermepumpe: 'Wärmepumpen',
      fenster: 'Fenster',
      tueren: 'Türen',
      daemmung: 'Dämmung',
      rollaeden: 'Rolläden'
    }
    return labels[product]
  }

  const getStatusColor = (status: keyof LeadPipelineStats) => {
    const colors = {
      neu: 'bg-blue-500',
      qualifiziert: 'bg-yellow-500',
      angebot_erstellt: 'bg-purple-500',
      in_verhandlung: 'bg-orange-500',
      gewonnen: 'bg-green-500',
      verloren: 'bg-red-500'
    }
    return colors[status]
  }

  const getStatusLabel = (status: keyof LeadPipelineStats) => {
    const labels = {
      neu: 'Neu',
      qualifiziert: 'Qualifiziert',
      angebot_erstellt: 'Angebot erstellt',
      in_verhandlung: 'In Verhandlung',
      gewonnen: 'Gewonnen',
      verloren: 'Verloren'
    }
    return labels[status]
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Übersicht über Ihre Geschäftstätigkeit</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="90d">Letzte 90 Tage</option>
            <option value="1y">Letztes Jahr</option>
          </select>
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
              <p className="text-sm font-medium text-gray-500">Gesamtkunden</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalCustomers.toLocaleString('de-DE')}</p>
              <div className="flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+12% vs. Vormonat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktive Leads</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalLeads}</p>
              <div className="flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+8% vs. Vormonat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyEuroIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monatsumsatz</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
              <div className="flex items-center mt-1">
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 ml-1">-3% vs. Vormonat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.conversionRate}%</p>
              <div className="flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+2.1% vs. Vormonat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Pipeline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Pipeline</h3>
          <div className="space-y-4">
            {pipelineStats && Object.entries(pipelineStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status as keyof LeadPipelineStats)} mr-3`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {getStatusLabel(status as keyof LeadPipelineStats)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900 mr-2">{count}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStatusColor(status as keyof LeadPipelineStats)}`}
                      style={{ width: `${(count / 89) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Interest Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Produktinteressen</h3>
          <div className="space-y-3">
            {productStats && Object.entries(productStats)
              .sort(([,a], [,b]) => b - a)
              .map(([product, count]) => (
                <div key={product} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {getProductLabel(product as ProductInterest)}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-900 mr-2">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-emerald-500 rounded-full"
                        style={{ width: `${(count / 45) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Revenue and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monatliche Entwicklung</h3>
          <div className="space-y-4">
            {monthlyMetrics.map((metric, index) => (
              <div key={metric.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 w-8">{metric.month}</span>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Neue Leads</p>
                      <p className="text-sm font-semibold text-blue-600">{metric.newLeads}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Konvertiert</p>
                      <p className="text-sm font-semibold text-green-600">{metric.convertedLeads}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Projekte</p>
                      <p className="text-sm font-semibold text-purple-600">{metric.projects}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(metric.revenue)}</p>
                  <p className="text-xs text-gray-500">Umsatz</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Benachrichtigungen</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Überfällige Follow-ups</p>
                  <p className="text-xs text-red-600">5 Kunden warten auf Rückmeldung</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <ClockIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Termine heute</p>
                  <p className="text-xs text-yellow-600">3 Kundentermine geplant</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Neue Leads</p>
                  <p className="text-xs text-green-600">8 neue Anfragen heute</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products by Revenue */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Produkte</h3>
            <div className="space-y-3">
              {revenueByProduct.slice(0, 4).map((item, index) => (
                <div key={item.product} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {getProductLabel(item.product)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-gray-500">{item.count} Projekte</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
