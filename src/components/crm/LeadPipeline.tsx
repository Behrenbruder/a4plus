'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Customer, LeadStatus, ProductInterest } from '../../lib/crm-types';

interface LeadPipelineProps {
  onLeadClick?: (lead: Customer) => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus, reason?: string) => void;
}

interface PipelineData {
  neu: Customer[];
  qualifiziert: Customer[];
  angebot_erstellt: Customer[];
  in_verhandlung: Customer[];
  gewonnen: Customer[];
  verloren: Customer[];
}

interface PipelineStats {
  total: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
}

export default function LeadPipeline({ onLeadClick, onStatusChange }: LeadPipelineProps) {
  const [pipelineData, setPipelineData] = useState<PipelineData>({
    neu: [],
    qualifiziert: [],
    angebot_erstellt: [],
    in_verhandlung: [],
    gewonnen: [],
    verloren: []
  });
  const [stats, setStats] = useState<PipelineStats>({
    total: 0,
    totalValue: 0,
    averageValue: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<Customer | null>(null);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      const response = await fetch('/api/crm/leads?view=pipeline');
      const result = await response.json();
      
      if (result.data) {
        setPipelineData(result.data);
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      // Fallback to mock data
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockData: PipelineData = {
      neu: [
        {
          id: '1',
          first_name: 'Max',
          last_name: 'Mustermann',
          email: 'max@example.com',
          phone: '+49 123 456789',
          city: 'Berlin',
          lead_status: 'neu',
          estimated_value: 25000,
          probability: 25,
          product_interests: ['pv', 'speicher'],
          priority: 3,
          next_follow_up_date: '2025-01-30',
          created_at: '2025-01-25T10:00:00Z',
          updated_at: '2025-01-25T10:00:00Z',
          country: 'Deutschland',
          tags: [],
          gdpr_consent: true,
          marketing_consent: true
        }
      ],
      qualifiziert: [
        {
          id: '2',
          first_name: 'Anna',
          last_name: 'Schmidt',
          email: 'anna@example.com',
          phone: '+49 987 654321',
          city: 'München',
          lead_status: 'qualifiziert',
          estimated_value: 18000,
          probability: 50,
          product_interests: ['waermepumpe'],
          priority: 2,
          next_follow_up_date: '2025-01-28',
          created_at: '2025-01-20T10:00:00Z',
          updated_at: '2025-01-25T10:00:00Z',
          country: 'Deutschland',
          tags: [],
          gdpr_consent: true,
          marketing_consent: true
        }
      ],
      angebot_erstellt: [
        {
          id: '3',
          first_name: 'Peter',
          last_name: 'Weber',
          email: 'peter@example.com',
          phone: '+49 555 123456',
          city: 'Hamburg',
          lead_status: 'angebot_erstellt',
          estimated_value: 32000,
          probability: 75,
          product_interests: ['pv', 'speicher', 'waermepumpe'],
          priority: 1,
          next_follow_up_date: '2025-01-26',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-25T10:00:00Z',
          country: 'Deutschland',
          tags: [],
          gdpr_consent: true,
          marketing_consent: true
        }
      ],
      in_verhandlung: [
        {
          id: '4',
          first_name: 'Lisa',
          last_name: 'Müller',
          email: 'lisa@example.com',
          phone: '+49 777 987654',
          city: 'Köln',
          lead_status: 'in_verhandlung',
          estimated_value: 28000,
          probability: 85,
          product_interests: ['fenster', 'tueren'],
          priority: 1,
          next_follow_up_date: '2025-01-27',
          created_at: '2025-01-10T10:00:00Z',
          updated_at: '2025-01-25T10:00:00Z',
          country: 'Deutschland',
          tags: [],
          gdpr_consent: true,
          marketing_consent: true
        }
      ],
      gewonnen: [],
      verloren: []
    };

    setPipelineData(mockData);
    
    const total = Object.values(mockData).flat().length;
    const totalValue = Object.values(mockData).flat().reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
    
    setStats({
      total,
      totalValue,
      averageValue: total > 0 ? totalValue / total : 0,
      conversionRate: 0
    });
  };

  const handleDragStart = (e: React.DragEvent, lead: Customer) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    
    if (!draggedLead || draggedLead.lead_status === newStatus) {
      setDraggedLead(null);
      return;
    }

    try {
      // Update in backend
      if (onStatusChange) {
        await onStatusChange(draggedLead.id, newStatus, `Status geändert von ${draggedLead.lead_status} zu ${newStatus}`);
      }

      // Update local state
      const updatedLead = { ...draggedLead, lead_status: newStatus };
      
      setPipelineData(prev => {
        const newData = { ...prev };
        
        // Remove from old status
        newData[draggedLead.lead_status] = newData[draggedLead.lead_status].filter(
          lead => lead.id !== draggedLead.id
        );
        
        // Add to new status
        newData[newStatus] = [...newData[newStatus], updatedLead];
        
        return newData;
      });

    } catch (error) {
      console.error('Error updating lead status:', error);
    } finally {
      setDraggedLead(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      neu: 'bg-blue-50 border-blue-200',
      qualifiziert: 'bg-yellow-50 border-yellow-200',
      angebot_erstellt: 'bg-purple-50 border-purple-200',
      in_verhandlung: 'bg-orange-50 border-orange-200',
      gewonnen: 'bg-green-50 border-green-200',
      verloren: 'bg-red-50 border-red-200'
    };
    return colors[status];
  };

  const getStatusTitle = (status: LeadStatus) => {
    const titles = {
      neu: 'Neue Leads',
      qualifiziert: 'Qualifiziert',
      angebot_erstellt: 'Angebot erstellt',
      in_verhandlung: 'In Verhandlung',
      gewonnen: 'Gewonnen',
      verloren: 'Verloren'
    };
    return titles[status];
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600';
      case 2: return 'text-yellow-600';
      case 3: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getProductIcon = (product: ProductInterest) => {
    const icons = {
      pv: '☀️',
      speicher: '🔋',
      waermepumpe: '🌡️',
      fenster: '🪟',
      tueren: '🚪',
      daemmung: '🏠',
      rollaeden: '🎚️'
    };
    return icons[product] || '📦';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statuses: LeadStatus[] = ['neu', 'qualifiziert', 'angebot_erstellt', 'in_verhandlung', 'gewonnen', 'verloren'];

  return (
    <div className="p-6">
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
          <button
            onClick={fetchPipelineData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Aktualisieren
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-500">Gesamt Leads</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-500">Gesamtwert</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-500">Ø Wert</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageValue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {statuses.map((status) => (
          <div
            key={status}
            className={`${getStatusColor(status)} border-2 border-dashed rounded-lg p-4 min-h-96`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{getStatusTitle(status)}</h3>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                {pipelineData[status].length}
              </span>
            </div>

            <div className="space-y-3">
              {pipelineData[status].map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  className="bg-white p-3 rounded-lg shadow cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {lead.first_name} {lead.last_name}
                    </h4>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(lead.priority)}`}></div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    <div className="flex items-center mb-1">
                      <EnvelopeIcon className="h-3 w-3 mr-1" />
                      {lead.email}
                    </div>
                    {lead.phone && (
                      <div className="flex items-center mb-1">
                        <PhoneIcon className="h-3 w-3 mr-1" />
                        {lead.phone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <CurrencyEuroIcon className="h-3 w-3 mr-1" />
                      {formatCurrency(lead.estimated_value || 0)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {lead.product_interests.slice(0, 3).map((product) => (
                        <span key={product} className="text-xs">
                          {getProductIcon(product)}
                        </span>
                      ))}
                      {lead.product_interests.length > 3 && (
                        <span className="text-xs text-gray-500">+{lead.product_interests.length - 3}</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onLeadClick?.(lead)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="h-3 w-3" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {lead.next_follow_up_date && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Follow-up: {new Date(lead.next_follow_up_date).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
