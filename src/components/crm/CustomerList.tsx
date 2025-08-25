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
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { Customer, LeadStatus, ProductInterest, CustomerFilter } from '@/lib/crm-types'

interface CustomerListProps {
  onCustomerSelect?: (customer: Customer) => void
  onCustomerEdit?: (customer: Customer) => void
  onCustomerDelete?: (customerId: string) => void
  onNewCustomer?: () => void
}

export default function CustomerList({ 
  onCustomerSelect, 
  onCustomerEdit, 
  onCustomerDelete, 
  onNewCustomer 
}: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<CustomerFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm, filters, currentPage])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      // Mock data - in production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockCustomers: Customer[] = [
        {
          id: '1',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z',
          first_name: 'Max',
          last_name: 'Mustermann',
          email: 'max.mustermann@email.com',
          phone: '+49 123 456789',
          address: 'Musterstraße 123',
          city: 'Berlin',
          postal_code: '10115',
          country: 'Deutschland',
          notes: 'Interessiert an PV-Anlage für Einfamilienhaus',
          lead_status: 'qualifiziert',
          lead_source: 'Website',
          estimated_value: 25000,
          probability: 75,
          expected_close_date: '2024-02-15',
          last_contact_date: '2024-01-18T09:15:00Z',
          next_follow_up_date: '2024-01-25T10:00:00Z',
          product_interests: ['pv', 'speicher'],
          priority: 2,
          tags: ['einfamilienhaus', 'neubau'],
          gdpr_consent: true,
          marketing_consent: true
        },
        {
          id: '2',
          created_at: '2024-01-10T08:30:00Z',
          updated_at: '2024-01-22T16:45:00Z',
          first_name: 'Anna',
          last_name: 'Schmidt',
          email: 'anna.schmidt@email.com',
          phone: '+49 987 654321',
          address: 'Hauptstraße 456',
          city: 'München',
          postal_code: '80331',
          country: 'Deutschland',
          notes: 'Wärmepumpe für Altbausanierung',
          lead_status: 'angebot_erstellt',
          lead_source: 'Empfehlung',
          estimated_value: 18000,
          probability: 60,
          expected_close_date: '2024-02-28',
          last_contact_date: '2024-01-20T11:30:00Z',
          next_follow_up_date: '2024-01-28T14:00:00Z',
          product_interests: ['waermepumpe', 'daemmung'],
          priority: 1,
          tags: ['altbau', 'sanierung'],
          gdpr_consent: true,
          marketing_consent: false
        },
        {
          id: '3',
          created_at: '2024-01-05T14:20:00Z',
          updated_at: '2024-01-19T10:15:00Z',
          first_name: 'Peter',
          last_name: 'Weber',
          email: 'peter.weber@email.com',
          phone: '+49 555 123456',
          address: 'Gartenweg 789',
          city: 'Hamburg',
          postal_code: '20095',
          country: 'Deutschland',
          notes: 'Fenster und Türen Austausch geplant',
          lead_status: 'in_verhandlung',
          lead_source: 'Google Ads',
          estimated_value: 12000,
          probability: 85,
          expected_close_date: '2024-02-10',
          last_contact_date: '2024-01-17T15:45:00Z',
          next_follow_up_date: '2024-01-24T09:30:00Z',
          product_interests: ['fenster', 'tueren'],
          priority: 1,
          tags: ['modernisierung'],
          gdpr_consent: true,
          marketing_consent: true
        }
      ]

      // Apply filters and search
      let filteredCustomers = mockCustomers
      
      if (searchTerm) {
        filteredCustomers = filteredCustomers.filter(customer =>
          customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.city?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (filters.lead_status?.length) {
        filteredCustomers = filteredCustomers.filter(customer =>
          filters.lead_status!.includes(customer.lead_status)
        )
      }

      if (filters.product_interests?.length) {
        filteredCustomers = filteredCustomers.filter(customer =>
          customer.product_interests.some(interest => 
            filters.product_interests!.includes(interest)
          )
        )
      }

      setCustomers(filteredCustomers)
      setTotalPages(Math.ceil(filteredCustomers.length / 10))
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const getProductIcons = (interests: ProductInterest[]) => {
    const icons = {
      pv: '☀️',
      speicher: '🔋',
      waermepumpe: '🌡️',
      fenster: '🪟',
      tueren: '🚪',
      daemmung: '🏠',
      rollaeden: '🎚️'
    }
    return interests.map(interest => icons[interest]).join(' ')
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunden & Leads</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Kunden und Lead-Pipeline</p>
        </div>
        <button
          onClick={onNewCustomer}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Neuer Kunde
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kunden suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filter
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead-Status
                </label>
                <select
                  multiple
                  className="w-full border border-gray-300 rounded-md p-2"
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value) as LeadStatus[]
                    setFilters(prev => ({ ...prev, lead_status: values }))
                  }}
                >
                  <option value="neu">Neu</option>
                  <option value="qualifiziert">Qualifiziert</option>
                  <option value="angebot_erstellt">Angebot erstellt</option>
                  <option value="in_verhandlung">In Verhandlung</option>
                  <option value="gewonnen">Gewonnen</option>
                  <option value="verloren">Verloren</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produktinteressen
                </label>
                <select
                  multiple
                  className="w-full border border-gray-300 rounded-md p-2"
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value) as ProductInterest[]
                    setFilters(prev => ({ ...prev, product_interests: values }))
                  }}
                >
                  <option value="pv">PV-Anlagen</option>
                  <option value="speicher">Speicher</option>
                  <option value="waermepumpe">Wärmepumpen</option>
                  <option value="fenster">Fenster</option>
                  <option value="tueren">Türen</option>
                  <option value="daemmung">Dämmung</option>
                  <option value="rollaeden">Rolläden</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stadt
                </label>
                <input
                  type="text"
                  placeholder="Stadt filtern..."
                  className="w-full border border-gray-300 rounded-md p-2"
                  onChange={(e) => setFilters(prev => ({ ...prev, city: [e.target.value] }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

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
                  Wert
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
              {customers.map((customer) => (
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
                      {getProductIcons(customer.product_interests)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {customer.product_interests.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.estimated_value ? formatCurrency(customer.estimated_value) : '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {customer.probability}% Wahrscheinlichkeit
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.next_follow_up_date ? formatDate(customer.next_follow_up_date) : '-'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Letzter Kontakt: {customer.last_contact_date ? formatDate(customer.last_contact_date) : '-'}
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
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-green-600 hover:text-green-900"
                        title="Anrufen"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </a>
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-purple-600 hover:text-purple-900"
                        title="E-Mail senden"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </a>
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
            {searchTerm || Object.keys(filters).length > 0
              ? 'Versuchen Sie andere Suchkriterien oder Filter.'
              : 'Beginnen Sie mit dem Hinzufügen Ihres ersten Kunden.'}
          </p>
          {!searchTerm && Object.keys(filters).length === 0 && (
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
