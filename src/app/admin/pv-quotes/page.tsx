'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PVQuote {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  roof_type?: string
  total_kwp?: number
  annual_pv_kwh?: number
  battery_kwh?: number
  autarkie_pct?: number
  eigenverbrauch_pct?: number
  annual_savings_eur?: number
  payback_time_years?: number
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'declined'
  notes?: string
}

const statusLabels = {
  new: 'Neu',
  contacted: 'Kontaktiert',
  quoted: 'Angebot erstellt',
  converted: 'Kunde gewonnen',
  declined: 'Abgelehnt'
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800'
}

export default function PVQuotesAdmin() {
  const [quotes, setQuotes] = useState<PVQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalQuotes, setTotalQuotes] = useState(0)

  useEffect(() => {
    fetchQuotes()
  }, [currentPage, selectedStatus])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus)
      }

      const response = await fetch(`/api/pv-quotes?${params}`)
      const data = await response.json()

      if (response.ok) {
        setQuotes(data.data || [])
        setTotalPages(data.pagination?.pages || 1)
        setTotalQuotes(data.pagination?.total || 0)
      } else {
        console.error('Error fetching quotes:', data.error)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuoteStatus = async (quoteId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/pv-quotes/${quoteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchQuotes() // Refresh the list
      } else {
        console.error('Error updating quote status')
      }
    } catch (error) {
      console.error('Error updating quote status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade PV-Anfragen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PV-Angebots-Anfragen</h1>
              <p className="mt-2 text-gray-600">
                Verwalten Sie alle Anfragen aus dem PV-Rechner ({totalQuotes} gesamt)
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              ← Zurück zum Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Alle ({totalQuotes})
            </button>
            {Object.entries(statusLabels).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quotes Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kunde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PV-System
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wirtschaftlichkeit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {quote.first_name} {quote.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{quote.email}</div>
                        {quote.phone && (
                          <div className="text-sm text-gray-500">{quote.phone}</div>
                        )}
                        {quote.city && (
                          <div className="text-sm text-gray-500">{quote.city}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quote.total_kwp ? `${quote.total_kwp.toFixed(2)} kWp` : '—'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quote.annual_pv_kwh ? `${quote.annual_pv_kwh.toLocaleString()} kWh/a` : '—'}
                      </div>
                      {quote.battery_kwh && quote.battery_kwh > 0 && (
                        <div className="text-sm text-gray-500">
                          Speicher: {quote.battery_kwh} kWh
                        </div>
                      )}
                      {quote.roof_type && (
                        <div className="text-sm text-gray-500">{quote.roof_type}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quote.autarkie_pct && (
                        <div className="text-sm text-gray-900">
                          Autarkie: {quote.autarkie_pct.toFixed(0)}%
                        </div>
                      )}
                      {quote.eigenverbrauch_pct && (
                        <div className="text-sm text-gray-500">
                          Eigenverbrauch: {quote.eigenverbrauch_pct.toFixed(0)}%
                        </div>
                      )}
                      {quote.annual_savings_eur && (
                        <div className="text-sm text-gray-500">
                          Einsparung: {quote.annual_savings_eur.toFixed(0)} €/a
                        </div>
                      )}
                      {quote.payback_time_years && (
                        <div className="text-sm text-gray-500">
                          Amortisation: {quote.payback_time_years.toFixed(1)} Jahre
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={quote.status}
                        onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${statusColors[quote.status]}`}
                      >
                        {Object.entries(statusLabels).map(([status, label]) => (
                          <option key={status} value={status}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quote.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/pv-quotes/${quote.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Details
                      </Link>
                      <a
                        href={`mailto:${quote.email}?subject=Ihr PV-Angebot&body=Hallo ${quote.first_name} ${quote.last_name},%0D%0A%0D%0Avielen Dank für Ihr Interesse an einer PV-Anlage.`}
                        className="text-green-600 hover:text-green-900"
                      >
                        E-Mail
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {quotes.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Keine PV-Anfragen</h3>
              <p className="mt-1 text-sm text-gray-500">
                Es wurden noch keine Angebots-Anfragen über den PV-Rechner gestellt.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Seite {currentPage} von {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vorherige
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Nächste
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
