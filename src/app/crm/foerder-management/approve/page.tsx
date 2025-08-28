'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface FoerderChange {
  id: string
  created_at: string
  scan_date: string
  change_type: 'ADDED' | 'MODIFIED' | 'REMOVED' | 'EXPIRED'
  foerder_id: string
  old_data: any
  new_data: any
  change_summary: string
  reviewed: boolean
  approved: boolean
  applied: boolean
  reviewer_notes: string | null
}

export default function FoerderApprovalPage() {
  const [changes, setChanges] = useState<FoerderChange[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set())
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending')

  useEffect(() => {
    fetchChanges()
  }, [filter])

  const fetchChanges = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'pending') params.append('reviewed', 'false')
      if (filter === 'reviewed') params.append('reviewed', 'true')

      const response = await fetch(`/api/crm/foerder-management/changes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setChanges(data)
      }
    } catch (error) {
      console.error('Error fetching changes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (changeId: string) => {
    const newSelected = new Set(selectedChanges)
    if (newSelected.has(changeId)) {
      newSelected.delete(changeId)
    } else {
      newSelected.add(changeId)
    }
    setSelectedChanges(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedChanges.size === changes.filter(c => !c.reviewed).length) {
      setSelectedChanges(new Set())
    } else {
      setSelectedChanges(new Set(changes.filter(c => !c.reviewed).map(c => c.id)))
    }
  }

  const handleBulkApproval = async (approved: boolean) => {
    if (selectedChanges.size === 0) return

    try {
      const response = await fetch('/api/crm/foerder-management/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeIds: Array.from(selectedChanges),
          approved,
          notes: approved ? 'Bulk approval' : 'Bulk rejection'
        })
      })

      if (response.ok) {
        setSelectedChanges(new Set())
        fetchChanges()
      }
    } catch (error) {
      console.error('Error processing bulk approval:', error)
    }
  }

  const handleSingleApproval = async (changeId: string, approved: boolean, notes?: string) => {
    try {
      const response = await fetch('/api/crm/foerder-management/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeId,
          approved,
          notes: notes || (approved ? 'Approved' : 'Rejected')
        })
      })

      if (response.ok) {
        fetchChanges()
      }
    } catch (error) {
      console.error('Error processing approval:', error)
    }
  }

  const toggleExpanded = (changeId: string) => {
    const newExpanded = new Set(expandedChanges)
    if (newExpanded.has(changeId)) {
      newExpanded.delete(changeId)
    } else {
      newExpanded.add(changeId)
    }
    setExpandedChanges(newExpanded)
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'ADDED': return 'bg-green-100 text-green-800'
      case 'MODIFIED': return 'bg-blue-100 text-blue-800'
      case 'REMOVED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'ADDED': return '+'
      case 'MODIFIED': return '~'
      case 'REMOVED': return '-'
      case 'EXPIRED': return '⏰'
      default: return '?'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const pendingChanges = changes.filter(c => !c.reviewed)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Änderungen freigeben</h1>
          <p className="text-gray-600">Überprüfen und genehmigen Sie gefundene Förderungsänderungen</p>
        </div>
        
        {/* Filter */}
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="pending">Ausstehend</option>
            <option value="reviewed">Überprüft</option>
            <option value="all">Alle</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {pendingChanges.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedChanges.size === pendingChanges.length && pendingChanges.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Alle auswählen ({selectedChanges.size} von {pendingChanges.length})
                </span>
              </label>
            </div>
            
            {selectedChanges.size > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkApproval(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Alle genehmigen
                </button>
                <button
                  onClick={() => handleBulkApproval(false)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Alle ablehnen
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Changes List */}
      <div className="space-y-4">
        {changes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Änderungen gefunden</h3>
            <p className="text-gray-500">
              {filter === 'pending' ? 'Alle Änderungen wurden bereits überprüft.' : 'Es wurden noch keine Änderungen erkannt.'}
            </p>
          </div>
        ) : (
          changes.map((change) => (
            <div key={change.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {!change.reviewed && (
                      <input
                        type="checkbox"
                        checked={selectedChanges.has(change.id)}
                        onChange={() => handleSelectChange(change.id)}
                        className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeTypeColor(change.change_type)}`}>
                          {getChangeTypeIcon(change.change_type)} {change.change_type}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{change.foerder_id}</span>
                        {change.reviewed && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            change.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {change.approved ? 'Genehmigt' : 'Abgelehnt'}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{change.change_summary}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Erkannt: {new Date(change.created_at).toLocaleString('de-DE')}</span>
                        <span>Scan: {new Date(change.scan_date).toLocaleDateString('de-DE')}</span>
                      </div>
                      
                      {change.reviewer_notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          <strong>Notiz:</strong> {change.reviewer_notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleExpanded(change.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Details anzeigen"
                    >
                      {expandedChanges.has(change.id) ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                    
                    {!change.reviewed && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSingleApproval(change.id, true)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Genehmigen"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleSingleApproval(change.id, false)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Ablehnen"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedChanges.has(change.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {change.old_data && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Vorherige Daten:</h4>
                          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                            {JSON.stringify(change.old_data, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {change.new_data && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Neue Daten:</h4>
                          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                            {JSON.stringify(change.new_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
