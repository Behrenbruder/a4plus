'use client'

import { useState, useEffect } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowPathIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import CRMLayout from '@/components/crm/CRMLayout'

interface CommunicationStats {
  totalEmails: number
  unreadEmails: number
  emailsToday: number
  emailsThisWeek: number
  responseRate: number
  avgResponseTime: string
}

interface RecentCommunication {
  id: string
  type: 'email' | 'phone' | 'meeting'
  customerName: string
  customerEmail: string
  subject: string
  content: string
  direction: 'inbound' | 'outbound'
  created_at: string
  status: 'read' | 'unread' | 'replied'
  priority: 'low' | 'medium' | 'high'
}

export default function CommunicationPage() {
  const [stats, setStats] = useState<CommunicationStats>({
    totalEmails: 0,
    unreadEmails: 0,
    emailsToday: 0,
    emailsThisWeek: 0,
    responseRate: 0,
    avgResponseTime: '0h'
  })
  
  const [recentCommunications, setRecentCommunications] = useState<RecentCommunication[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'today' | 'urgent'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCommunicationData()
  }, [])

  const fetchCommunicationData = async () => {
    setLoading(true)
    try {
      // Fetch communication statistics and recent communications
      const [statsResponse, communicationsResponse] = await Promise.all([
        fetch('/api/crm/communication/stats'),
        fetch('/api/crm/communication/recent')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (communicationsResponse.ok) {
        const communicationsData = await communicationsResponse.json()
        setRecentCommunications(communicationsData.communications || [])
      }
    } catch (error) {
      console.error('Error fetching communication data:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncAllEmails = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/emails/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sinceHours: 24
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`E-Mail-Synchronisation erfolgreich! ${data.data.newEmails} neue E-Mails hinzugefügt.`)
        await fetchCommunicationData()
      } else {
        alert('Fehler bei der E-Mail-Synchronisation')
      }
    } catch (error) {
      console.error('Error syncing emails:', error)
      alert('Fehler bei der E-Mail-Synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  const getFilteredCommunications = () => {
    let filtered = recentCommunications

    // Apply filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(comm => comm.status === 'unread')
        break
      case 'today':
        const today = new Date().toDateString()
        filtered = filtered.filter(comm => 
          new Date(comm.created_at).toDateString() === today
        )
        break
      case 'urgent':
        filtered = filtered.filter(comm => comm.priority === 'high')
        break
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(comm =>
        comm.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="h-5 w-5" />
      case 'phone':
        return <PhoneIcon className="h-5 w-5" />
      case 'meeting':
        return <CalendarIcon className="h-5 w-5" />
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800'
      case 'replied':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <CRMLayout>
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
      </CRMLayout>
    )
  }

  return (
    <CRMLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3 text-emerald-600" />
                Kommunikation
              </h1>
              <p className="text-gray-600 mt-2">
                Übersicht über alle Kommunikationsaktivitäten und E-Mail-Management
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={syncAllEmails}
                disabled={syncing}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchronisiere...' : 'E-Mails synchronisieren'}
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Neue E-Mail
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt E-Mails</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmails}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ungelesen</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadEmails}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Heute</p>
                <p className="text-2xl font-bold text-gray-900">{stats.emailsToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100">
                <ChartBarIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Antwortrate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <PaperAirplaneIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Massen-E-Mail senden</div>
                <div className="text-sm text-gray-600">E-Mail an mehrere Kunden</div>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <DocumentTextIcon className="h-6 w-6 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">E-Mail-Vorlagen</div>
                <div className="text-sm text-gray-600">Vorlagen verwalten</div>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Cog6ToothIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">E-Mail-Einstellungen</div>
                <div className="text-sm text-gray-600">Konten und Signaturen</div>
              </div>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'Alle' },
                  { key: 'unread', label: 'Ungelesen' },
                  { key: 'today', label: 'Heute' },
                  { key: 'urgent', label: 'Dringend' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === filterOption.key
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Recent Communications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Aktuelle Kommunikation ({getFilteredCommunications().length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {getFilteredCommunications().length === 0 ? (
              <div className="p-12 text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Kommunikation gefunden</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' 
                    ? 'Es wurden noch keine Kommunikationsaktivitäten aufgezeichnet.'
                    : 'Keine Kommunikation entspricht den aktuellen Filterkriterien.'
                  }
                </p>
              </div>
            ) : (
              getFilteredCommunications().map((communication) => (
                <div key={communication.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${
                        communication.direction === 'inbound' ? 'bg-blue-100' : 'bg-emerald-100'
                      }`}>
                        <div className={
                          communication.direction === 'inbound' ? 'text-blue-600' : 'text-emerald-600'
                        }>
                          {getTypeIcon(communication.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {communication.customerName}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({communication.customerEmail})
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(communication.status)}`}>
                            {communication.status === 'unread' ? 'Ungelesen' : 
                             communication.status === 'replied' ? 'Beantwortet' : 'Gelesen'}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {communication.subject}
                        </p>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {communication.content}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {formatDate(communication.created_at)}
                          </span>
                          <span className={`flex items-center ${getPriorityColor(communication.priority)}`}>
                            {communication.priority === 'high' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                            {communication.priority === 'high' ? 'Hoch' : 
                             communication.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            communication.direction === 'inbound' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {communication.direction === 'inbound' ? 'Eingehend' : 'Ausgehend'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </CRMLayout>
  )
}
