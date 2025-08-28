'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Conflict {
  id: string;
  conflict_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  program_a_name: string;
  program_b_name: string;
  source_a: string;
  source_b: string;
  description: string;
  created_at: string;
  resolved_at?: string;
  resolution_status: 'PENDING' | 'RESOLVED' | 'IGNORED';
  ai_analysis?: any;
}

export default function FoerderConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'ignored'>('pending');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'LOW' | 'MEDIUM' | 'HIGH'>('all');
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  useEffect(() => {
    fetchConflicts();
  }, [filter, severityFilter]);

  const fetchConflicts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);

      const response = await fetch(`/api/crm/foerder-management/conflicts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setConflicts(data.conflicts || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Konflikte:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveConflict = async (conflictId: string, resolution: 'RESOLVED' | 'IGNORED') => {
    try {
      const response = await fetch(`/api/crm/foerder-management/conflicts/${conflictId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution })
      });

      if (response.ok) {
        fetchConflicts(); // Refresh list
        setSelectedConflict(null);
      }
    } catch (error) {
      console.error('Fehler beim Lösen des Konflikts:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'MEDIUM': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'LOW': return <ExclamationTriangleIcon className="h-5 w-5 text-green-500" />;
      default: return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'IGNORED': return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default: return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Konflikte lösen</h1>
        <p className="text-gray-600">
          Erkannte Konflikte zwischen Förderprogrammen verwalten und lösen
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="all">Alle Konflikte</option>
              <option value="pending">Ausstehend</option>
              <option value="resolved">Gelöst</option>
              <option value="ignored">Ignoriert</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schweregrad
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="all">Alle Schweregrade</option>
              <option value="HIGH">Hoch</option>
              <option value="MEDIUM">Mittel</option>
              <option value="LOW">Niedrig</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Lade Konflikte...</p>
          </div>
        ) : conflicts.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Konflikte gefunden</h3>
            <p className="text-gray-500">
              {filter === 'pending' 
                ? 'Alle Konflikte wurden gelöst oder es gibt keine ausstehenden Konflikte.'
                : 'Für den gewählten Filter wurden keine Konflikte gefunden.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(conflict.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {conflict.conflict_type}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(conflict.severity)}`}>
                          {conflict.severity}
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(conflict.resolution_status)}
                          <span className="text-xs text-gray-500">
                            {conflict.resolution_status === 'PENDING' ? 'Ausstehend' :
                             conflict.resolution_status === 'RESOLVED' ? 'Gelöst' : 'Ignoriert'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {conflict.description}
                      </p>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>
                          <strong>Programme:</strong> &quot;{conflict.program_a_name}&quot; vs &quot;{conflict.program_b_name}&quot;
                        </div>
                        <div>
                          <strong>Quellen:</strong> {conflict.source_a} vs {conflict.source_b}
                        </div>
                        <div>
                          <strong>Erkannt:</strong> {formatDate(conflict.created_at)}
                        </div>
                        {conflict.resolved_at && (
                          <div>
                            <strong>Gelöst:</strong> {formatDate(conflict.resolved_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedConflict(conflict)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Details anzeigen"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {conflict.resolution_status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => resolveConflict(conflict.id, 'RESOLVED')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Lösen
                        </button>
                        <button
                          onClick={() => resolveConflict(conflict.id, 'IGNORED')}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          Ignorieren
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conflict Detail Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Konflikt-Details
                </h2>
                <button
                  onClick={() => setSelectedConflict(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Programm A</h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{selectedConflict.program_a_name}</p>
                      <p className="text-sm text-gray-600">Quelle: {selectedConflict.source_a}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Programm B</h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{selectedConflict.program_b_name}</p>
                      <p className="text-sm text-gray-600">Quelle: {selectedConflict.source_b}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Beschreibung</h3>
                  <p className="text-gray-700">{selectedConflict.description}</p>
                </div>
                
                {selectedConflict.ai_analysis && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">KI-Analyse</h3>
                    <div className="bg-blue-50 p-4 rounded">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedConflict.ai_analysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {selectedConflict.resolution_status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => resolveConflict(selectedConflict.id, 'RESOLVED')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Als gelöst markieren
                    </button>
                    <button
                      onClick={() => resolveConflict(selectedConflict.id, 'IGNORED')}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Ignorieren
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {conflicts.filter(c => c.resolution_status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Ausstehend</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {conflicts.filter(c => c.resolution_status === 'RESOLVED').length}
            </div>
            <div className="text-sm text-gray-600">Gelöst</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {conflicts.filter(c => c.severity === 'HIGH').length}
            </div>
            <div className="text-sm text-gray-600">Hoch</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {conflicts.filter(c => c.resolution_status === 'IGNORED').length}
            </div>
            <div className="text-sm text-gray-600">Ignoriert</div>
          </div>
        </div>
      </div>
    </div>
  );
}
