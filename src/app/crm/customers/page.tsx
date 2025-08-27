'use client';

import React, { useState, useEffect } from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import CustomerList from '@/components/crm/CustomerList';
import CustomerForm from '@/components/crm/CustomerForm';
import CustomerDetail from '@/components/crm/CustomerDetail';
import EmailHistory from '@/components/crm/EmailHistory';
import { Customer, ProductInterest, LeadStatus } from '@/lib/crm-types';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEmailHistory, setShowEmailHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [productFilter, setProductFilter] = useState<ProductInterest | 'all'>('all');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'no_messages'>('all');
  const [emailCounts, setEmailCounts] = useState<Record<string, { total: number, unread: number }>>({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, statusFilter, productFilter, messageFilter, emailCounts]);

  // Fetch email counts for message filtering
  useEffect(() => {
    const fetchEmailCounts = async () => {
      if (customers.length === 0) return;
      
      try {
        const emailCountPromises = customers.map(async (customer) => {
          try {
            const response = await fetch(`/api/crm/customers/${customer.id}/emails`);
            if (response.ok) {
              const data = await response.json();
              const emails = data.emails || [];
              const unreadEmails = emails.filter((email: any) => 
                email.direction === 'incoming' && !email.is_read
              );
              return {
                customerId: customer.id,
                total: emails.length,
                unread: unreadEmails.length
              };
            }
            return { customerId: customer.id, total: 0, unread: 0 };
          } catch (error) {
            return { customerId: customer.id, total: 0, unread: 0 };
          }
        });

        const results = await Promise.all(emailCountPromises);
        const emailCountsMap = results.reduce((acc, result) => {
          acc[result.customerId] = { 
            total: result.total, 
            unread: result.unread
          };
          return acc;
        }, {} as Record<string, { total: number, unread: number }>);
        
        setEmailCounts(emailCountsMap);
      } catch (error) {
        console.error('Error fetching email counts:', error);
      }
    };

    fetchEmailCounts();
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/crm/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else {
        // Use mock data if API fails
        const mockCustomers: Customer[] = [
          {
            id: '1',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-20T14:30:00Z',
            first_name: 'Max',
            last_name: 'Mustermann',
            email: 'max.mustermann@email.de',
            phone: '+49 123 456789',
            address: 'Musterstraße 123',
            city: 'Musterstadt',
            postal_code: '12345',
            country: 'Deutschland',
            lead_status: 'qualifiziert',
            lead_source: 'website',
            product_interests: ['pv', 'speicher'],
            notes: 'Interessiert an 10kWp PV-Anlage mit Speicher. Südausrichtung vorhanden.',
            priority: 2,
            assigned_to: 'vertrieb@arteplus.de',
            last_contact_date: '2024-01-20T14:30:00Z',
            next_follow_up_date: '2024-01-25T10:00:00Z',
            estimated_value: 25000,
            probability: 75,
            tags: ['einfamilienhaus', 'neubau'],
            gdpr_consent: true,
            marketing_consent: true
          },
          {
            id: '2',
            created_at: '2024-01-18T09:15:00Z',
            updated_at: '2024-01-22T11:45:00Z',
            first_name: 'Anna',
            last_name: 'Schmidt',
            email: 'anna.schmidt@email.de',
            phone: '+49 987 654321',
            address: 'Beispielweg 456',
            city: 'Beispielstadt',
            postal_code: '54321',
            country: 'Deutschland',
            lead_status: 'angebot_erstellt',
            lead_source: 'referral',
            product_interests: ['waermepumpe', 'daemmung'],
            notes: 'Sanierung Altbau. Wärmepumpe + Dämmung geplant.',
            priority: 1,
            assigned_to: 'vertrieb@arteplus.de',
            last_contact_date: '2024-01-22T11:45:00Z',
            next_follow_up_date: '2024-01-28T09:00:00Z',
            estimated_value: 35000,
            probability: 60,
            tags: ['altbau', 'sanierung'],
            gdpr_consent: true,
            marketing_consent: false
          },
          {
            id: '3',
            created_at: '2024-01-20T16:30:00Z',
            updated_at: '2024-01-23T08:20:00Z',
            first_name: 'Peter',
            last_name: 'Weber',
            email: 'peter.weber@email.de',
            phone: '+49 555 123456',
            address: 'Teststraße 789',
            city: 'Teststadt',
            postal_code: '98765',
            country: 'Deutschland',
            lead_status: 'gewonnen',
            lead_source: 'google_ads',
            product_interests: ['fenster', 'tueren'],
            notes: 'Neubau - komplette Fenster und Türen. Projekt abgeschlossen.',
            priority: 3,
            assigned_to: 'monteur@arteplus.de',
            last_contact_date: '2024-01-23T08:20:00Z',
            next_follow_up_date: undefined,
            estimated_value: 18000,
            probability: 100,
            tags: ['modernisierung'],
            gdpr_consent: true,
            marketing_consent: true
          }
        ];
        setCustomers(mockCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.lead_status === statusFilter);
    }

    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(customer =>
        customer.product_interests?.includes(productFilter)
      );
    }

    // Message filter
    if (messageFilter !== 'all') {
      filtered = filtered.filter(customer => {
        const emailData = emailCounts[customer.id];
        if (messageFilter === 'unread') {
          return emailData && emailData.unread > 0;
        } else if (messageFilter === 'no_messages') {
          return !emailData || emailData.total === 0;
        }
        return true;
      });
    }

    setFilteredCustomers(filtered);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
    setShowForm(false);
    setShowEmailHistory(false);
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setShowForm(true);
    setShowDetail(false);
    setShowEmailHistory(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
    setShowDetail(false);
    setShowEmailHistory(false);
  };

  const handleEmailHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEmailHistory(true);
    setShowForm(false);
    setShowDetail(false);
  };

  const handleCustomerSave = async (customerData: Partial<Customer>) => {
    try {
      const url = selectedCustomer 
        ? `/api/crm/customers/${selectedCustomer.id}`
        : '/api/crm/customers';
      
      const method = selectedCustomer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        const savedCustomer = await response.json();
        
        if (selectedCustomer) {
          // Update existing customer
          setCustomers(prev => 
            prev.map(c => c.id === selectedCustomer.id ? savedCustomer : c)
          );
        } else {
          // Add new customer
          setCustomers(prev => [...prev, savedCustomer]);
        }
        
        setShowForm(false);
        setSelectedCustomer(null);
      } else {
        throw new Error('Failed to save customer');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Fehler beim Speichern des Kunden');
    }
  };

  const handleCustomerDelete = async (customerId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Kunden löschen möchten?')) {
      return;
    }

    try {
      const response = await fetch(`/api/crm/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        setShowDetail(false);
        setSelectedCustomer(null);
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Fehler beim Löschen des Kunden');
    }
  };

  const handleExportData = () => {
    const csvData = filteredCustomers.map(customer => ({
      Name: `${customer.first_name} ${customer.last_name}`,
      Email: customer.email,
      Telefon: customer.phone || '',
      Adresse: customer.address || '',
      Status: customer.lead_status,
      'Lead Quelle': customer.lead_source || '',
      'Produkt Interessen': customer.product_interests?.join(', ') || '',
      'Geschätzter Wert': customer.estimated_value || 0,
      'Wahrscheinlichkeit': customer.probability || 0,
      'Letzter Kontakt': customer.last_contact_date || '',
      'Nächstes Follow-up': customer.next_follow_up_date || '',
      Notizen: customer.notes || ''
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kunden_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusOptions = (): { value: LeadStatus | 'all'; label: string }[] => [
    { value: 'all', label: 'Alle Status' },
    { value: 'neu', label: 'Neu' },
    { value: 'qualifiziert', label: 'Qualifiziert' },
    { value: 'angebot_erstellt', label: 'Angebot erstellt' },
    { value: 'in_verhandlung', label: 'In Verhandlung' },
    { value: 'gewonnen', label: 'Gewonnen' },
    { value: 'verloren', label: 'Verloren' }
  ];

  const getProductOptions = (): { value: ProductInterest | 'all'; label: string }[] => [
    { value: 'all', label: 'Alle Produkte' },
    { value: 'pv', label: 'PV-Anlagen' },
    { value: 'speicher', label: 'Speicher' },
    { value: 'waermepumpe', label: 'Wärmepumpen' },
    { value: 'fenster', label: 'Fenster' },
    { value: 'tueren', label: 'Türen' },
    { value: 'daemmung', label: 'Dämmung' },
    { value: 'rollaeden', label: 'Rolläden' }
  ];

  if (showForm) {
    return (
      <CRMLayout>
        <CustomerForm
          customer={selectedCustomer || undefined}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleCustomerSave}
          loading={loading}
        />
      </CRMLayout>
    );
  }

  if (showEmailHistory && selectedCustomer) {
    return (
      <CRMLayout>
        <EmailHistory
          customer={selectedCustomer}
          onBack={() => setShowEmailHistory(false)}
        />
      </CRMLayout>
    );
  }

  if (showDetail && selectedCustomer) {
    return (
      <CRMLayout>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={() => setShowDetail(false)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              ← Zurück zur Kundenliste
            </button>
          </div>
          <CustomerDetail
            customerId={selectedCustomer.id}
            onBack={() => setShowDetail(false)}
            onEdit={handleEditCustomer}
          />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kunden & Leads</h1>
            <p className="text-gray-600">
              Verwalten Sie Ihre Kundenstammdaten und Lead-Pipeline
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleNewCustomer}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Neuer Kunde
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              {getStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Product Filter */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value as ProductInterest | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              {getProductOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Message Filter */}
            <select
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value as 'all' | 'unread' | 'no_messages')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Alle Nachrichten</option>
              <option value="unread">Ungelesene Nachrichten</option>
              <option value="no_messages">Keine Nachrichten</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setProductFilter('all');
                setMessageFilter('all');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              <p className="text-sm text-gray-600">Gesamt Kunden</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {customers.filter(c => ['neu', 'qualifiziert', 'angebot_erstellt', 'in_verhandlung'].includes(c.lead_status)).length}
              </p>
              <p className="text-sm text-gray-600">Aktive Leads</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.lead_status === 'gewonnen').length}
              </p>
              <p className="text-sm text-gray-600">Gewonnene Kunden</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(
                  customers.reduce((sum, c) => sum + (c.estimated_value || 0), 0) / 1000
                )}k€
              </p>
              <p className="text-sm text-gray-600">Pipeline Wert</p>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
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
          ) : (
            <CustomerList
              customers={filteredCustomers}
              loading={loading}
              onCustomerSelect={handleCustomerSelect}
              onCustomerEdit={handleEditCustomer}
              onCustomerDelete={handleCustomerDelete}
              onNewCustomer={handleNewCustomer}
              onEmailHistory={handleEmailHistory}
            />
          )}
        </div>
      </div>
    </CRMLayout>
  );
}
