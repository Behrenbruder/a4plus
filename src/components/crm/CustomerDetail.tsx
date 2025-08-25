'use client';

import React, { useState } from 'react';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Customer, ContactHistory, Project, Quote, Document, ProductInterest, PVQuote, CustomerWithPVQuotes } from '../../lib/crm-types';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
  onEdit: (customer: Customer) => void;
}

// Mock data for development
const mockCustomer: Customer = {
  id: '1',
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-25T14:30:00Z',
  first_name: 'Max',
  last_name: 'Mustermann',
  email: 'max.mustermann@email.com',
  phone: '+49 123 456789',
  address: 'Musterstraße 123',
  city: 'Musterstadt',
  postal_code: '12345',
  country: 'Deutschland',
  lead_status: 'in_verhandlung',
  priority: 3,
  estimated_value: 25000,
  probability: 75,
  product_interests: ['pv', 'speicher', 'waermepumpe'],
  tags: ['Neubau', 'Förderung', 'Eilig'],
  notes: 'Kunde ist sehr interessiert an einer kompletten Energielösung. Hat bereits Förderanträge gestellt.',
  lead_source: 'Website',
  assigned_to: 'user-1',
  next_follow_up_date: '2025-01-30',
  last_contact_date: '2025-01-25',
  gdpr_consent: true,
  marketing_consent: true
};

const mockContactHistory: ContactHistory[] = [
  {
    id: '1',
    created_at: '2025-01-25T14:30:00Z',
    customer_id: '1',
    user_id: 'user-1',
    contact_type: 'email',
    subject: 'Angebot für PV-Anlage',
    content: 'Kunde hat nach einem detaillierten Angebot für eine 10kWp PV-Anlage mit Speicher gefragt.',
    direction: 'inbound',
    attachments: [],
    metadata: {} as Record<string, unknown>
  },
  {
    id: '2',
    created_at: '2025-01-22T11:00:00Z',
    customer_id: '1',
    user_id: 'user-1',
    contact_type: 'telefon',
    subject: 'Beratungsgespräch',
    content: 'Telefonische Beratung zu Fördermöglichkeiten. Kunde ist sehr interessiert.',
    direction: 'outbound',
    duration_minutes: 30,
    attachments: [],
    metadata: {} as Record<string, unknown>
  },
  {
    id: '3',
    created_at: '2025-01-20T09:00:00Z',
    customer_id: '1',
    user_id: 'user-1',
    contact_type: 'termin',
    subject: 'Vor-Ort Termin',
    content: 'Besichtigung des Objekts. Dach ist optimal ausgerichtet, keine Verschattung.',
    direction: 'outbound',
    duration_minutes: 120,
    attachments: [],
    metadata: {} as Record<string, unknown>
  }
];

const mockProjects: Project[] = [
  {
    id: '1',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-25T14:30:00Z',
    customer_id: '1',
    assigned_installer: 'installer-1',
    project_manager: 'manager-1',
    title: 'PV-Anlage Mustermann',
    description: '10kWp PV-Anlage mit 10kWh Speicher',
    status: 'in_arbeit',
    product_type: 'pv',
    start_date: '2025-02-01',
    planned_end_date: '2025-02-15',
    estimated_cost: 25000,
    technical_specs: {} as Record<string, unknown>,
    materials_list: {} as Record<string, unknown>
  }
];

const mockQuotes: Quote[] = [
  {
    id: '1',
    created_at: '2025-01-25T14:30:00Z',
    updated_at: '2025-01-25T14:30:00Z',
    customer_id: '1',
    project_id: '1',
    created_by: 'user-1',
    quote_number: 'ANG-2025-001',
    title: 'PV-Anlage Angebot',
    status: 'versendet',
    valid_until: '2025-02-15',
    total_amount: 25000,
    tax_amount: 4750,
    discount_amount: 0,
    line_items: []
  }
];

const mockDocuments: Document[] = [
  {
    id: '1',
    created_at: '2025-01-25T14:30:00Z',
    updated_at: '2025-01-25T14:30:00Z',
    customer_id: '1',
    uploaded_by: 'user-1',
    document_type: 'angebot',
    title: 'Angebot PV-Anlage',
    file_name: 'angebot-pv-anlage.pdf',
    file_path: '/documents/angebot-001.pdf',
    file_size: 1024000,
    mime_type: 'application/pdf',
    version: 1,
    is_active: true,
    tags: []
  },
  {
    id: '2',
    created_at: '2025-01-20T09:00:00Z',
    updated_at: '2025-01-20T09:00:00Z',
    customer_id: '1',
    uploaded_by: 'user-1',
    document_type: 'foto',
    title: 'Dachplan',
    file_name: 'dachplan.jpg',
    file_path: '/documents/dachplan-001.jpg',
    file_size: 512000,
    mime_type: 'image/jpeg',
    version: 1,
    is_active: true,
    tags: []
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'neu': return 'bg-blue-100 text-blue-800';
    case 'qualifiziert': return 'bg-yellow-100 text-yellow-800';
    case 'angebot_erstellt': return 'bg-purple-100 text-purple-800';
    case 'in_verhandlung': return 'bg-orange-100 text-orange-800';
    case 'gewonnen': return 'bg-green-100 text-green-800';
    case 'verloren': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

const getProductIcon = (product: ProductInterest) => {
  switch (product) {
    case 'pv': return '☀️';
    case 'speicher': return '🔋';
    case 'waermepumpe': return '🌡️';
    case 'fenster': return '🪟';
    case 'tueren': return '🚪';
    case 'daemmung': return '🏠';
    default: return '📦';
  }
};

const getContactTypeIcon = (type: string) => {
  switch (type) {
    case 'email': return <EnvelopeIcon className="h-4 w-4" />;
    case 'phone': return <PhoneIcon className="h-4 w-4" />;
    case 'meeting': return <UserIcon className="h-4 w-4" />;
    case 'chat': return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
    default: return <DocumentTextIcon className="h-4 w-4" />;
  }
};

export default function CustomerDetail({ customerId, onBack, onEdit }: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contact' | 'projects' | 'documents' | 'pv-quotes'>('overview');
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [newContact, setNewContact] = useState({
    type: 'email',
    subject: '',
    content: ''
  });

  const customer = mockCustomer; // In real app, fetch by customerId
  const contactHistory = mockContactHistory;
  const projects = mockProjects;
  const quotes = mockQuotes;
  const documents = mockDocuments;

  const handleNewContact = () => {
    // In real app, save to database
    console.log('New contact:', newContact);
    setShowNewContactForm(false);
    setNewContact({ type: 'email', subject: '', content: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Zurück
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.first_name} {customer.last_name}
              </h1>
              <p className="text-gray-600">{customer.city}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(customer.lead_status)}`}>
              {customer.lead_status.replace('_', ' ')}
            </span>
            <button
              onClick={() => onEdit(customer)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Bearbeiten
            </button>
          </div>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Geschätzter Wert</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.estimated_value || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wahrscheinlichkeit</p>
              <p className="text-2xl font-bold text-gray-900">{customer.probability || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nächster Follow-up</p>
              <p className="text-sm font-bold text-gray-900">
                {customer.next_follow_up_date ? new Date(customer.next_follow_up_date).toLocaleDateString('de-DE') : 'Nicht geplant'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationTriangleIcon className={`h-8 w-8 ${getPriorityColor(customer.priority?.toString() || 'medium')}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Priorität</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{customer.priority || 'Medium'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Übersicht', icon: UserIcon },
            { id: 'contact', name: 'Kontaktverlauf', icon: ChatBubbleLeftRightIcon },
            { id: 'projects', name: 'Projekte', icon: DocumentTextIcon },
            { id: 'documents', name: 'Dokumente', icon: DocumentTextIcon },
            { id: 'pv-quotes', name: 'PV-Anfragen', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'contact' | 'projects' | 'documents' | 'pv-quotes')}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kontaktinformationen</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{customer.email}</span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{customer.phone}</span>
              </div>
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                <span className="text-gray-900">{customer.address}</span>
              </div>
            </div>
          </div>

          {/* Product Interests */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Produktinteressen</h3>
            <div className="flex flex-wrap gap-2">
              {customer.product_interests?.map((product) => (
                <span
                  key={product}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  <span className="mr-2">{getProductIcon(product)}</span>
                  {product.charAt(0).toUpperCase() + product.slice(1)}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {customer.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notizen</h3>
            <p className="text-gray-700">{customer.notes || 'Keine Notizen vorhanden.'}</p>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Kontaktverlauf</h3>
              <button
                onClick={() => setShowNewContactForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Neuer Kontakt
              </button>
            </div>
          </div>

          {/* New Contact Form */}
          {showNewContactForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kontakttyp
                  </label>
                  <select
                    value={newContact.type}
                    onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">E-Mail</option>
                    <option value="phone">Telefon</option>
                    <option value="meeting">Meeting</option>
                    <option value="chat">Chat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Betreff
                  </label>
                  <input
                    type="text"
                    value={newContact.subject}
                    onChange={(e) => setNewContact({ ...newContact, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Betreff eingeben..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inhalt
                  </label>
                  <textarea
                    value={newContact.content}
                    onChange={(e) => setNewContact({ ...newContact, content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kontaktinhalt eingeben..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNewContactForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleNewContact}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact History List */}
          <div className="divide-y divide-gray-200">
            {contactHistory.map((contact) => (
              <div key={contact.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {getContactTypeIcon(contact.contact_type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{contact.subject}</p>
                      <p className="text-sm text-gray-500">{formatDate(contact.created_at)}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{contact.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {contact.contact_type.charAt(0).toUpperCase() + contact.contact_type.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Projects */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Projekte</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {projects.map((project) => (
                <div key={project.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                      <p className="text-gray-600">{project.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Start: {project.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : 'TBD'}</span>
                        <span>Ende: {project.planned_end_date ? new Date(project.planned_end_date).toLocaleDateString('de-DE') : 'TBD'}</span>
                        <span>Budget: {formatCurrency(project.estimated_cost || 0)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === 'abgeschlossen' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_arbeit' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quotes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Angebote</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {quotes.map((quote) => (
                <div key={quote.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{quote.quote_number}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Betrag: {formatCurrency(quote.total_amount)}</span>
                        <span>Gültig bis: {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('de-DE') : 'TBD'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        quote.status === 'angenommen' ? 'bg-green-100 text-green-800' :
                        quote.status === 'versendet' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'abgelehnt' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Dokumente</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Dokument hochladen
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {documents.map((document) => (
              <div key={document.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{document.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{document.document_type}</span>
                        <span>{document.file_size ? (document.file_size / 1024).toFixed(0) : '0'} KB</span>
                        <span>{formatDate(document.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pv-quotes' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">PV-Rechner Anfragen</h3>
              <div className="text-sm text-gray-500">
                Automatisch verknüpft über E-Mail-Adresse
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {/* Mock PV Quotes - In real app, these would come from the API */}
            {[
              {
                id: '1',
                created_at: '2025-01-20T14:30:00Z',
                total_kwp: 9.6,
                annual_pv_kwh: 9200,
                battery_kwh: 10,
                annual_consumption_kwh: 4500,
                autarkie_pct: 85,
                eigenverbrauch_pct: 78,
                annual_savings_eur: 1850,
                payback_time_years: 8.5,
                status: 'new',
                roof_type: 'Satteldach',
                address: 'Musterstraße 123, 12345 Musterstadt'
              },
              {
                id: '2',
                created_at: '2025-01-15T10:15:00Z',
                total_kwp: 12.0,
                annual_pv_kwh: 11500,
                battery_kwh: 15,
                annual_consumption_kwh: 5200,
                autarkie_pct: 92,
                eigenverbrauch_pct: 82,
                annual_savings_eur: 2150,
                payback_time_years: 7.8,
                status: 'contacted',
                roof_type: 'Flachdach',
                address: 'Musterstraße 123, 12345 Musterstadt'
              }
            ].map((pvQuote) => (
              <div key={pvQuote.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        PV-Anlage {pvQuote.total_kwp} kWp
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          pvQuote.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          pvQuote.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          pvQuote.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                          pvQuote.status === 'converted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {pvQuote.status === 'new' ? 'Neu' :
                           pvQuote.status === 'contacted' ? 'Kontaktiert' :
                           pvQuote.status === 'quoted' ? 'Angebot erstellt' :
                           pvQuote.status === 'converted' ? 'Konvertiert' : 'Abgelehnt'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(pvQuote.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Anlagenleistung</p>
                        <p className="text-sm font-semibold text-gray-900">{pvQuote.total_kwp} kWp</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Jahresertrag</p>
                        <p className="text-sm font-semibold text-gray-900">{pvQuote.annual_pv_kwh?.toLocaleString()} kWh</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Speicher</p>
                        <p className="text-sm font-semibold text-gray-900">{pvQuote.battery_kwh} kWh</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Verbrauch</p>
                        <p className="text-sm font-semibold text-gray-900">{pvQuote.annual_consumption_kwh?.toLocaleString()} kWh</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-600 mb-1">Autarkiegrad</p>
                        <p className="text-sm font-semibold text-green-800">{pvQuote.autarkie_pct}%</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 mb-1">Eigenverbrauch</p>
                        <p className="text-sm font-semibold text-blue-800">{pvQuote.eigenverbrauch_pct}%</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-xs text-yellow-600 mb-1">Jährl. Ersparnis</p>
                        <p className="text-sm font-semibold text-yellow-800">{formatCurrency(pvQuote.annual_savings_eur || 0)}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-600 mb-1">Amortisation</p>
                        <p className="text-sm font-semibold text-purple-800">{pvQuote.payback_time_years} Jahre</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>📍 {pvQuote.address}</span>
                      <span>🏠 {pvQuote.roof_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="text-blue-600 hover:text-blue-800 p-2">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800 p-2" title="Als Kunde konvertieren">
                      <UserIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Empty state if no PV quotes */}
            {false && (
              <div className="p-12 text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine PV-Anfragen gefunden</h3>
                <p className="text-gray-500">
                  Für diese E-Mail-Adresse wurden noch keine PV-Rechner Anfragen erstellt.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
