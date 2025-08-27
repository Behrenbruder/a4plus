'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { Customer, LeadStatus, ProductInterest, CustomerFilter } from '@/lib/crm-types'

interface CustomerListProps {
  customers?: Customer[]
  loading?: boolean
  onCustomerSelect?: (customer: Customer) => void
  onCustomerEdit?: (customer: Customer) => void
  onCustomerDelete?: (customerId: string) => void
  onNewCustomer?: () => void
  onEmailHistory?: (customer: Customer) => void
}

export default function CustomerList({ 
  customers: propCustomers = [],
  loading: propLoading = false,
  onCustomerSelect, 
  onCustomerEdit, 
  onCustomerDelete, 
  onNewCustomer,
  onEmailHistory
}: CustomerListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [syncingCustomers, setSyncingCustomers] = useState<Set<string>>(new Set())
  const [emailCounts, setEmailCounts] = useState<Record<string, { total: number, unread: number, lastEmailDate?: string | null }>>({})

  const customers = propCustomers
  const loading = propLoading
  const totalPages = Math.ceil(customers.length / 10)
  const paginatedCustomers = customers.slice((currentPage - 1) * 10, currentPage * 10)

  // Fetch email counts and last contact dates from email history
  useEffect(() => {
    const fetchEmailData = async () => {
      if (customers.length === 0) return
      
      try {
        const emailDataPromises = customers.map(async (customer) => {
          try {
            const response = await fetch(`/api/crm/customers/${customer.id}/emails`)
            if (response.ok) {
              const data = await response.json()
              const emails = data.emails || []
              
              // Count unread emails
              const unreadEmails = emails.filter((email: any) => 
                email.direction === 'incoming' && !email.is_read
              )
              
              // Find the most recent email date
              let lastEmailDate = null
              if (emails.length > 0) {
                const sortedEmails = emails.sort((a: any, b: any) => 
                  new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()
                )
                lastEmailDate = sortedEmails[0].date || sortedEmails[0].created_at
              }
              
              return {
                customerId: customer.id,
                total: emails.length,
                unread: unreadEmails.length,
                lastEmailDate: lastEmailDate
              }
            }
            return { customerId: customer.id, total: 0, unread: 0, lastEmailDate: null }
          } catch (error) {
            console.error(`Error fetching emails for customer ${customer.id}:`, error)
            return { customerId: customer.id, total: 0, unread: 0, lastEmailDate: null }
          }
        })

        const results = await Promise.all(emailDataPromises)
        const emailCountsMap = results.reduce((acc, result) => {
          acc[result.customerId] = { 
            total: result.total, 
            unread: result.unread,
            lastEmailDate: result.lastEmailDate
          }
          return acc
        }, {} as Record<string, { total: number, unread: number, lastEmailDate: string | null }>)
        
        setEmailCounts(emailCountsMap)
      } catch (error) {
        console.error('Error fetching email data:', error)
      }
    }

    fetchEmailData()
  }, [customers])

  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      neu: 'bg-blue-100 text-blue-800',
      qualifiziert: 'bg-yellow-100 text-yellow-800',
      angebot_erstellt: 'bg-purple-100 text-purple-800',
      in_verhandlung: 'bg-orange-100 text-orange-800',
      gewonnen: 'bg-green-100 text-green-800',
      verloren: 'bg-red-100 text-red-800'
    }
    return colors[status]
  }

  const getStatusLabel = (status: LeadStatus) => {
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

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'text-red-600'
    if (priority === 2) return 'text-orange-600'
    if (priority === 3) return 'text-yellow-600'
    if (priority === 4) return 'text-green-600'
    return 'text-gray-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  const handleSetFollowUpDate = async (customer: Customer) => {
    const dateInput = prompt('Nächstes Follow-up Datum (YYYY-MM-DD):')
    if (!dateInput) return

    try {
      const response = await fetch(`/api/crm/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...customer,
          next_follow_up_date: dateInput
        }),
      })

      if (response.ok) {
        // Refresh the customer list by calling parent's fetch function
        window.location.reload() // Simple refresh for now
      } else {
        alert('Fehler beim Setzen des Follow-up Datums')
      }
    } catch (error) {
      console.error('Error setting follow-up date:', error)
      alert('Fehler beim Setzen des Follow-up Datums')
    }
  }


  const getLastContactDisplay = (customer: Customer) => {
    // Prioritize email history date over stored last_contact_date
    const emailData = emailCounts[customer.id]
    const lastEmailDate = emailData?.lastEmailDate
    const lastContactDate = lastEmailDate || customer.last_contact_date

    if (!lastContactDate) {
      return (
        <span className="text-xs text-gray-500">
          Kein Kontakt
        </span>
      )
    }

    const contactDate = new Date(lastContactDate)
    const today = new Date()
    
    // Set both dates to start of day for accurate day comparison
    const contactDateStart = new Date(contactDate.getFullYear(), contactDate.getMonth(), contactDate.getDate())
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    const diffTime = todayStart.getTime() - contactDateStart.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    let timeAgo = ''
    if (diffDays === 0) {
      timeAgo = 'Heute'
    } else if (diffDays === 1) {
      timeAgo = 'Gestern'
    } else if (diffDays < 7) {
      timeAgo = `vor ${diffDays} Tagen`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      timeAgo = `vor ${weeks} Woche${weeks > 1 ? 'n' : ''}`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      timeAgo = `vor ${months} Monat${months > 1 ? 'en' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      timeAgo = `vor ${years} Jahr${years > 1 ? 'en' : ''}`
    }

    const isOld = diffDays > 30
    const isFromEmail = lastEmailDate && lastEmailDate === lastContactDate
    
    return (
      <div className="flex items-center space-x-1">
        <span className={`text-xs ${isOld ? 'text-red-600' : 'text-gray-500'}`}>
          {timeAgo}
        </span>
        {isFromEmail && (
          <span className="text-xs text-blue-500" title="Letzter Kontakt aus E-Mail-Verlauf">
            📧
          </span>
        )}
      </div>
    )
  }

  const handleEmailHistoryWithSync = async (customer: Customer) => {
    // First, open the email history immediately for better UX
    onEmailHistory?.(customer)
    
    // Add customer to syncing state for visual feedback
    setSyncingCustomers(prev => new Set(prev).add(customer.id))
    
    // Then trigger email synchronization in the background
    try {
      console.log(`🔄 Triggering background email sync for customer: ${customer.email}`)
      
      const response = await fetch('/api/emails/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: customer.email,
          sinceHours: 72 // Sync last 3 days when clicking chat link
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log(`✅ Background email sync completed for ${customer.email}:`, result.data)
        
        // Show success notification (optional)
        // You could add a toast notification here if you have one implemented
      } else {
        console.error(`❌ Background email sync failed for ${customer.email}:`, result.error)
      }
    } catch (error) {
      console.error(`❌ Error in background email sync for ${customer.email}:`, error)
    } finally {
      // Remove customer from syncing state
      setSyncingCustomers(prev => {
        const newSet = new Set(prev)
        newSet.delete(customer.id)
        return newSet
      })
    }
  }


  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produktinteressen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nächster Follow-up
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-emerald-800">
                            {customer.first_name[0]}{customer.last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.lead_status)}`}>
                        {getStatusLabel(customer.lead_status)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className={`mr-1 ${getPriorityColor(customer.priority)}`}>●</span>
                        Priorität {customer.priority}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.product_interests.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.next_follow_up_date ? (
                        <div className="flex items-center space-x-2">
                          <span>{formatDate(customer.next_follow_up_date)}</span>
                          {new Date(customer.next_follow_up_date) < new Date() && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Überfällig
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSetFollowUpDate(customer)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Follow-up setzen
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Letzter Kontakt: {getLastContactDisplay(customer)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onCustomerSelect?.(customer)}
                        className="text-emerald-600 hover:text-emerald-900"
                        title="Details anzeigen"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onCustomerEdit?.(customer)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Bearbeiten"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEmailHistoryWithSync(customer)}
                        disabled={syncingCustomers.has(customer.id)}
                        className={`relative ${
                          syncingCustomers.has(customer.id)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-purple-600 hover:text-purple-900'
                        }`}
                        title={
                          syncingCustomers.has(customer.id)
                            ? 'E-Mails werden im Hintergrund synchronisiert...'
                            : 'E-Mail Verlauf öffnen (synchronisiert automatisch im Hintergrund)'
                        }
                      >
                        <ChatBubbleLeftRightIcon 
                          className={`h-4 w-4 ${
                            syncingCustomers.has(customer.id) ? 'animate-pulse' : ''
                          }`} 
                        />
                        {emailCounts[customer.id]?.unread > 0 && (
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white min-w-[18px] h-[18px]">
                            {emailCounts[customer.id].unread}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => onCustomerDelete?.(customer.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Löschen"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Zurück
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Weiter
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Zeige <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> bis{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, customers.length)}</span> von{' '}
                  <span className="font-medium">{customers.length}</span> Kunden
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Zurück
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Weiter
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {customers.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Kunden gefunden</h3>
          <p className="mt-1 text-sm text-gray-500">
            Beginnen Sie mit dem Hinzufügen Ihres ersten Kunden.
          </p>
          {(
            <div className="mt-6">
              <button
                onClick={onNewCustomer}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Neuer Kunde
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
