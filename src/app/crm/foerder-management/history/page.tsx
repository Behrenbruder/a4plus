'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, DocumentMagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface HistoryEntry {
  id: string;
  timestamp: string;
  type: 'scan' | 'approval' | 'conflict' | 'system';
  title: string;
  description: string;
  source?: string;
  user?: string;
  metadata?: any;
}

export default function FoerderHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scan' | 'approval' | 'conflict' | 'system'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchHistory();
  }, [filter, dateRange]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      if (dateRange !== 'all') params.append('range', dateRange);

      const response = await fetch(`/api/crm/foerder-management/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Historie:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scan':
        return <DocumentMagnifyingGlassIcon className="h-5 w-5 text-blue-500" />;
      case 'approval':
        return <ClockIcon className="h-5 w-5 text-green-500" />;
      case 'conflict':
        return <FunnelIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'scan': return 'Scan';
      case 'approval': return 'Freigabe';
      case 'conflict': return 'Konflikt';
      case 'system': return 'System';
      default: return type;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Vor wenigen Minuten';
    } else if (diffHours < 24) {
      return `Vor ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
    } else if (diffDays < 7) {
      return `Vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Datenbank-Verlauf</h1>
        <p className="text-gray-600">
          Chronologische Übersicht aller Aktivitäten im Förder-Monitoring System
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aktivitätstyp
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="all">Alle Aktivitäten</option>
              <option value="scan">Scans</option>
              <option value="approval">Freigaben</option>
              <option value="conflict">Konflikte</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zeitraum
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="today">Heute</option>
              <option value="week">Diese Woche</option>
              <option value="month">Dieser Monat</option>
              <option value="all">Alle</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Lade Historie...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center">
            <DocumentMagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Einträge gefunden</h3>
            <p className="text-gray-500">
              Für den gewählten Filter wurden keine Aktivitäten gefunden.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {history.map((entry, index) => (
              <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(entry.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {getTypeLabel(entry.type)}
                        </span>
                        <span>{formatTimestamp(entry.timestamp)}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {entry.description}
                    </p>
                    
                    {(entry.source || entry.user) && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {entry.source && (
                          <span>Quelle: {entry.source}</span>
                        )}
                        {entry.user && (
                          <span>Benutzer: {entry.user}</span>
                        )}
                      </div>
                    )}
                    
                    {entry.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Details anzeigen
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {history.filter(h => h.type === 'scan').length}
            </div>
            <div className="text-sm text-gray-600">Scans</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {history.filter(h => h.type === 'approval').length}
            </div>
            <div className="text-sm text-gray-600">Freigaben</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {history.filter(h => h.type === 'conflict').length}
            </div>
            <div className="text-sm text-gray-600">Konflikte</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {history.filter(h => h.type === 'system').length}
            </div>
            <div className="text-sm text-gray-600">System</div>
          </div>
        </div>
      </div>
    </div>
  );
}
