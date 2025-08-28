'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentMagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import FoerderPreviewModal from '@/components/crm/FoerderPreviewModal'

interface DashboardStats {
  totalScans: number
  pendingChanges: number
  activeConflicts: number
  lastScanDate: string
  nextScanDate: string
  successRate: number
}

interface RecentActivity {
  id: string
  type: 'scan' | 'approval' | 'conflict'
  message: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
}

interface PreviewData {
  summary: {
    totalChecked: number
    newEntries: number
    statusChanges: number
    noChanges: number
    availablePrograms: number
    unavailablePrograms: number
  }
  changes: {
    new: any[]
    statusChanges: any[]
    noChanges: any[]
  }
  timestamp: string
}

export default function FoerderManagementDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/crm/foerder-management/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/crm/foerder-management/activity')
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setRecentActivity(activityData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerPreviewScan = async () => {
    try {
      setIsPreviewing(true)
      const response = await fetch('/api/foerder-scan/preview', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPreviewData(data)
          setShowPreviewModal(true)
        } else {
          console.error('Preview scan failed:', data.error)
          alert('Fehler beim Erstellen der Vorschau: ' + (data.error || 'Unbekannter Fehler'))
        }
      } else {
        console.error('Preview scan request failed')
        alert('Fehler beim Erstellen der Vorschau')
      }
    } catch (error) {
      console.error('Error triggering preview scan:', error)
      alert('Fehler beim Erstellen der Vorschau')
    } finally {
      setIsPreviewing(false)
    }
  }

  const triggerManualScan = async () => {
    try {
      setIsScanning(true)
      const response = await fetch('/api/foerder-scan', { method: 'POST' })
      if (response.ok) {
        // Refresh dashboard data after scan
        setTimeout(() => fetchDashboardData(), 2000)
        alert('Scan erfolgreich durchgeführt!')
      } else {
        alert('Fehler beim Durchführen des Scans')
      }
    } catch (error) {
      console.error('Error triggering manual scan:', error)
      alert('Fehler beim Durchführen des Scans')
    } finally {
      setIsScanning(false)
    }
  }

  const applyChanges = async () => {
    try {
      setIsApplying(true)
      const response = await fetch('/api/foerder-scan', { method: 'POST' })
      if (response.ok) {
        setShowPreviewModal(false)
        setPreviewData(null)
        // Refresh dashboard data after applying changes
        setTimeout(() => fetchDashboardData(), 2000)
        alert('Änderungen erfolgreich angewendet!')
      } else {
        alert('Fehler beim Anwenden der Änderungen')
      }
    } catch (error) {
      console.error('Error applying changes:', error)
      alert('Fehler beim Anwenden der Änderungen')
    } finally {
      setIsApplying(false)
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Förder-Management Dashboard</h1>
          <p className="text-gray-600">Übersicht über automatisierte Förderungen-Überwachung</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={triggerPreviewScan}
            disabled={isPreviewing || isScanning}
            className="inline-flex items-center px-4 py-2 border border-emerald-600 rounded-md shadow-sm text-sm font-medium text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            {isPreviewing ? 'Erstelle Vorschau...' : 'Vorschau'}
          </button>
          <button
            onClick={triggerManualScan}
            disabled={isScanning || isPreviewing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scannt...' : 'Manueller Scan'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Gesamt Scans
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalScans || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ausstehende Änderungen
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.pendingChanges || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Aktive Konflikte
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.activeConflicts || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Erfolgsrate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.successRate || 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scan-Informationen</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Letzter Scan:</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.lastScanDate ? new Date(stats.lastScanDate).toLocaleString('de-DE') : 'Noch kein Scan'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Nächster Scan:</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.nextScanDate ? new Date(stats.nextScanDate).toLocaleString('de-DE') : 'Unbekannt'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Scan-Intervall:</span>
              <span className="text-sm font-medium text-gray-900">Stündlich</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/crm/foerder-management/approve"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <div className="font-medium">Änderungen freigeben</div>
                  <div className="text-xs text-gray-500">{stats?.pendingChanges || 0} ausstehend</div>
                </div>
              </div>
            </a>
            <a
              href="/crm/foerder-management/conflicts"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <div className="font-medium">Konflikte lösen</div>
                  <div className="text-xs text-gray-500">{stats?.activeConflicts || 0} aktiv</div>
                </div>
              </div>
            </a>
            <a
              href="/crm/foerder-management/history"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex items-center">
                <DocumentMagnifyingGlassIcon className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <div className="font-medium">Datenbank-Verlauf</div>
                  <div className="text-xs text-gray-500">Alle Scans anzeigen</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Letzte Aktivitäten</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-400' :
                      activity.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      activity.type === 'scan' ? 'bg-blue-100 text-blue-800' :
                      activity.type === 'approval' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.type === 'scan' ? 'Scan' :
                       activity.type === 'approval' ? 'Freigabe' : 'Konflikt'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">Noch keine Aktivitäten vorhanden</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <FoerderPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        previewData={previewData}
        onApplyChanges={applyChanges}
        isApplying={isApplying}
      />
    </div>
  )
}
