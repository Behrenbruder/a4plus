'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline'
import { Customer, CustomerFormData, LeadStatus, ProductInterest } from '@/lib/crm-types'

interface CustomerFormProps {
  customer?: Customer
  isOpen: boolean
  onClose: () => void
  onSave: (customerData: CustomerFormData) => Promise<void>
  loading?: boolean
}

export default function CustomerForm({ 
  customer, 
  isOpen, 
  onClose, 
  onSave, 
  loading = false 
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    notes: '',
    lead_status: 'neu',
    lead_source: '',
    assigned_to: '',
    estimated_value: 0,
    probability: 50,
    expected_close_date: '',
    next_follow_up_date: '',
    product_interests: [],
    priority: 3,
    tags: [],
    gdpr_consent: false,
    marketing_consent: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        postal_code: customer.postal_code || '',
        notes: customer.notes || '',
        lead_status: customer.lead_status,
        lead_source: customer.lead_source || '',
        assigned_to: customer.assigned_to || '',
        estimated_value: customer.estimated_value || 0,
        probability: customer.probability || 50,
        expected_close_date: customer.expected_close_date || '',
        next_follow_up_date: customer.next_follow_up_date || '',
        product_interests: customer.product_interests,
        priority: customer.priority,
        tags: customer.tags,
        gdpr_consent: customer.gdpr_consent,
        marketing_consent: customer.marketing_consent
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
        lead_status: 'neu',
        lead_source: '',
        assigned_to: '',
        estimated_value: 0,
        probability: 50,
        expected_close_date: '',
        next_follow_up_date: '',
        product_interests: [],
        priority: 3,
        tags: [],
        gdpr_consent: false,
        marketing_consent: false
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

    if (formData.estimated_value && formData.estimated_value < 0) {
      newErrors.estimated_value = 'Wert muss positiv sein'
    }

    if ((formData.probability || 0) < 0 || (formData.probability || 0) > 100) {
      newErrors.probability = 'Wahrscheinlichkeit muss zwischen 0 und 100 liegen'
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
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  const handleProductInterestChange = (interest: ProductInterest, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      product_interests: checked
        ? [...prev.product_interests, interest]
        : prev.product_interests.filter(i => i !== interest)
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const productInterestOptions: { value: ProductInterest; label: string; icon: string }[] = [
    { value: 'pv', label: 'PV-Anlagen', icon: '☀️' },
    { value: 'speicher', label: 'Speicher', icon: '🔋' },
    { value: 'waermepumpe', label: 'Wärmepumpen', icon: '🌡️' },
    { value: 'fenster', label: 'Fenster', icon: '🪟' },
    { value: 'tueren', label: 'Türen', icon: '🚪' },
    { value: 'daemmung', label: 'Dämmung', icon: '🏠' },
    { value: 'rollaeden', label: 'Rolläden', icon: '🎚️' }
  ]

  const leadStatusOptions: { value: LeadStatus; label: string }[] = [
    { value: 'neu', label: 'Neu' },
    { value: 'qualifiziert', label: 'Qualifiziert' },
    { value: 'angebot_erstellt', label: 'Angebot erstellt' },
    { value: 'in_verhandlung', label: 'In Verhandlung' },
    { value: 'gewonnen', label: 'Gewonnen' },
    { value: 'verloren', label: 'Verloren' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  {/* Address */}
                  <h4 className="text-md font-medium text-gray-900 flex items-center mt-6">
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

                {/* Lead Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">
                    Lead-Informationen
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Lead-Status
                      </label>
                      <select
                        value={formData.lead_status}
                        onChange={(e) => setFormData(prev => ({ ...prev, lead_status: e.target.value as LeadStatus }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {leadStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Priorität
                      </label>
                      <select
                        value={formData.priority}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lead-Quelle
                    </label>
                    <input
                      type="text"
                      value={formData.lead_source}
                      onChange={(e) => setFormData(prev => ({ ...prev, lead_source: e.target.value }))}
                      placeholder="z.B. Website, Google Ads, Empfehlung"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Geschätzter Wert (€)
                      </label>
                      <div className="mt-1 relative">
                        <CurrencyEuroIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={formData.estimated_value}
                          onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: parseFloat(e.target.value) || 0 }))}
                          className={`block w-full pl-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            errors.estimated_value ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.estimated_value && (
                        <p className="mt-1 text-sm text-red-600">{errors.estimated_value}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Wahrscheinlichkeit (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          errors.probability ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.probability && (
                        <p className="mt-1 text-sm text-red-600">{errors.probability}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Erwartetes Abschlussdatum
                      </label>
                      <div className="mt-1 relative">
                        <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={formData.expected_close_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, expected_close_date: e.target.value }))}
                          className="block w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nächster Follow-up
                      </label>
                      <div className="mt-1 relative">
                        <CalendarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={formData.next_follow_up_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, next_follow_up_date: e.target.value }))}
                          className="block w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Interests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Produktinteressen
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {productInterestOptions.map(option => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.product_interests.includes(option.value)}
                            onChange={(e) => handleProductInterestChange(option.value, e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {option.icon} {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex-1 relative">
                        <TagIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          placeholder="Tag hinzufügen..."
                          className="block w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-emerald-600 hover:text-emerald-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
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

              {/* Consent */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.gdpr_consent}
                    onChange={(e) => setFormData(prev => ({ ...prev, gdpr_consent: e.target.checked }))}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    DSGVO-Einverständnis erteilt
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.marketing_consent}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketing_consent: e.target.checked }))}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Marketing-Einverständnis erteilt
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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
        </div>
      </div>
    </div>
  )
}
