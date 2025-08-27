'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

interface SimpleCustomerFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  notes: string
  status: 'lead' | 'customer' | 'inactive'
  // Zusätzliche relevante Felder
  company?: string
  lead_source?: string
  product_interests?: string[]
  budget_range?: string
  timeline?: string
  property_type?: string
  roof_area?: number
  energy_consumption?: number
  priority?: number
}

interface SimpleCustomerFormProps {
  customer?: any
  isOpen: boolean
  onClose: () => void
  onSave: (customerData: SimpleCustomerFormData) => Promise<void>
  loading?: boolean
}

export default function SimpleCustomerForm({ 
  customer, 
  isOpen, 
  onClose, 
  onSave, 
  loading = false 
}: SimpleCustomerFormProps) {
  const [formData, setFormData] = useState<SimpleCustomerFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    notes: '',
    status: 'lead',
    company: '',
    lead_source: '',
    product_interests: [],
    budget_range: '',
    timeline: '',
    property_type: '',
    roof_area: undefined,
    energy_consumption: undefined,
    priority: 3
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        postal_code: customer.postal_code || '',
        notes: customer.notes || '',
        status: customer.status || 'lead',
        company: customer.company || '',
        lead_source: customer.lead_source || '',
        product_interests: customer.product_interests || [],
        budget_range: customer.budget_range || '',
        timeline: customer.timeline || '',
        property_type: customer.property_type || '',
        roof_area: customer.roof_area || undefined,
        energy_consumption: customer.energy_consumption || undefined,
        priority: customer.priority || 3
      })
    } else {
      // Reset form for new customer
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        notes: '',
        status: 'lead',
        company: '',
        lead_source: '',
        product_interests: [],
        budget_range: '',
        timeline: '',
        property_type: '',
        roof_area: undefined,
        energy_consumption: undefined,
        priority: 3
      })
    }
    setErrors({})
  }, [customer, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Vorname ist erforderlich'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nachname ist erforderlich'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse'
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Ungültige Telefonnummer'
    }

    if (formData.postal_code && !/^\d{5}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'PLZ muss 5 Ziffern haben'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      console.log('Form submission started with data:', formData)
      await onSave(formData)
      console.log('Form submission successful')
      onClose()
    } catch (error) {
      console.error('Error saving customer:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        formData: formData
      })
      
      // Show error to user
      alert(`Fehler beim Speichern: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
    }
  }

  if (!isOpen) return null

  // Check if we're in a modal context (has overlay) or page context
  const isModal = typeof window !== 'undefined' && window.location.pathname !== '/crm/customers/new'

  const renderFormContent = () => (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {customer ? 'Kunde bearbeiten' : 'Neuer Kunde'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto px-1">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Persönliche Daten
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Vorname *
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.first_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nachname *
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.last_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      E-Mail *
                    </label>
                    <div className="mt-1 relative">
                      <EnvelopeIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`block w-full pl-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telefon
                    </label>
                    <div className="mt-1 relative">
                      <PhoneIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className={`block w-full pl-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Unternehmen
                    </label>
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Firmenname (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'lead' | 'customer' | 'inactive' }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="lead">Lead</option>
                        <option value="customer">Kunde</option>
                        <option value="inactive">Inaktiv</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Priorität
                      </label>
                      <select
                        value={formData.priority || 3}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value={1}>1 - Sehr hoch</option>
                        <option value={2}>2 - Hoch</option>
                        <option value={3}>3 - Normal</option>
                        <option value={4}>4 - Niedrig</option>
                        <option value={5}>5 - Sehr niedrig</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    Adresse
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Straße und Hausnummer
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        PLZ
                      </label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.postal_code ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.postal_code && (
                        <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Stadt
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Lead & Projekt Informationen */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 flex items-center">
                    🎯 Lead & Projekt Informationen
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Lead-Quelle
                      </label>
                      <select
                        value={formData.lead_source || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, lead_source: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Bitte wählen</option>
                        <option value="website">Website</option>
                        <option value="google_ads">Google Ads</option>
                        <option value="empfehlung">Empfehlung</option>
                        <option value="messe">Messe</option>
                        <option value="telefon">Telefonakquise</option>
                        <option value="social_media">Social Media</option>
                        <option value="sonstiges">Sonstiges</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Budget-Bereich
                      </label>
                      <select
                        value={formData.budget_range || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget_range: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Bitte wählen</option>
                        <option value="unter_10k">Unter 10.000 €</option>
                        <option value="10k_25k">10.000 - 25.000 €</option>
                        <option value="25k_50k">25.000 - 50.000 €</option>
                        <option value="50k_100k">50.000 - 100.000 €</option>
                        <option value="ueber_100k">Über 100.000 €</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Zeitrahmen
                      </label>
                      <select
                        value={formData.timeline || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Bitte wählen</option>
                        <option value="sofort">Sofort</option>
                        <option value="1_3_monate">1-3 Monate</option>
                        <option value="3_6_monate">3-6 Monate</option>
                        <option value="6_12_monate">6-12 Monate</option>
                        <option value="ueber_1_jahr">Über 1 Jahr</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Immobilientyp
                      </label>
                      <select
                        value={formData.property_type || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, property_type: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Bitte wählen</option>
                        <option value="einfamilienhaus">Einfamilienhaus</option>
                        <option value="mehrfamilienhaus">Mehrfamilienhaus</option>
                        <option value="gewerbe">Gewerbeimmobilie</option>
                        <option value="neubau">Neubau</option>
                        <option value="altbau">Altbau</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Produktinteressen
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'pv', label: '☀️ PV-Anlagen' },
                        { value: 'speicher', label: '🔋 Speicher' },
                        { value: 'waermepumpe', label: '🌡️ Wärmepumpen' },
                        { value: 'fenster', label: '🪟 Fenster' },
                        { value: 'tueren', label: '🚪 Türen' },
                        { value: 'daemmung', label: '🏠 Dämmung' }
                      ].map(product => (
                        <label key={product.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.product_interests?.includes(product.value) || false}
                            onChange={(e) => {
                              const interests = formData.product_interests || []
                              if (e.target.checked) {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  product_interests: [...interests, product.value] 
                                }))
                              } else {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  product_interests: interests.filter(i => i !== product.value) 
                                }))
                              }
                            }}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {product.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Dachfläche (m²)
                      </label>
                      <input
                        type="number"
                        value={formData.roof_area || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, roof_area: parseFloat(e.target.value) || undefined }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="z.B. 120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Stromverbrauch (kWh/Jahr)
                      </label>
                      <input
                        type="number"
                        value={formData.energy_consumption || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, energy_consumption: parseFloat(e.target.value) || undefined }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="z.B. 4500"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notizen
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Zusätzliche Informationen zum Kunden..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse flex-shrink-0 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Speichern...' : (customer ? 'Aktualisieren' : 'Erstellen')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Abbrechen
              </button>
            </div>
          </form>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            {renderFormContent()}
          </div>
        </div>
      </div>
    )
  }

  // Page context - render without modal wrapper
  return (
    <div className="w-full max-w-4xl h-full">
      {renderFormContent()}
    </div>
  )
}
