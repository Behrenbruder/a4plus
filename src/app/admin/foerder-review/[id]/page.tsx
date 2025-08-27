'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FoerderChange {
  id: string;
  scan_date: string;
  change_type: 'ADDED' | 'MODIFIED' | 'REMOVED' | 'EXPIRED';
  foerder_id: string;
  old_data: any;
  new_data: any;
  change_summary: string;
  reviewed: boolean;
  approved: boolean;
  reviewer_notes: string;
}

interface ReviewSession {
  id: string;
  scan_date: string;
  status: 'pending' | 'reviewed' | 'applied';
  total_changes: number;
  reviewed_at: string;
  applied_at: string;
  reviewer_email: string;
  notes: string;
}

export default function FoerderReviewPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;
  
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  const [changes, setChanges] = useState<FoerderChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());
  const [reviewNotes, setReviewNotes] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadReviewData();
  }, [reviewId]);

  const loadReviewData = async () => {
    try {
      setLoading(true);
      
      // Lade Review-Session
      const { data: session, error: sessionError } = await supabase
        .from('foerder_reviews')
        .select('*')
        .eq('id', reviewId)
        .single();
      
      if (sessionError) throw sessionError;
      setReviewSession(session);
      
      // Lade Änderungen für diesen Scan
      const { data: changesData, error: changesError } = await supabase
        .from('foerder_changes')
        .select('*')
        .eq('scan_date', session.scan_date)
        .order('created_at', { ascending: true });
      
      if (changesError) throw changesError;
      setChanges(changesData || []);
      
      // Alle Änderungen standardmäßig auswählen
      setSelectedChanges(new Set(changesData?.map(c => c.id) || []));
      
    } catch (err) {
      console.error('Fehler beim Laden der Review-Daten:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const toggleChangeSelection = (changeId: string) => {
    const newSelection = new Set(selectedChanges);
    if (newSelection.has(changeId)) {
      newSelection.delete(changeId);
    } else {
      newSelection.add(changeId);
    }
    setSelectedChanges(newSelection);
  };

  const selectAll = () => {
    setSelectedChanges(new Set(changes.map(c => c.id)));
  };

  const selectNone = () => {
    setSelectedChanges(new Set());
  };

  const applyChanges = async () => {
    if (selectedChanges.size === 0) {
      alert('Bitte wählen Sie mindestens eine Änderung aus.');
      return;
    }

    if (!confirm(`Möchten Sie ${selectedChanges.size} Änderungen übernehmen?`)) {
      return;
    }

    try {
      setApplying(true);
      
      const response = await fetch('/api/foerder-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          changeIds: Array.from(selectedChanges),
          notes: reviewNotes
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Übernehmen der Änderungen');
      }
      
      alert(`${result.appliedChanges} Änderungen erfolgreich übernommen!`);
      router.push('/admin/foerder-review');
      
    } catch (err) {
      console.error('Fehler beim Übernehmen der Änderungen:', err);
      alert(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setApplying(false);
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'ADDED': return 'bg-green-100 text-green-800';
      case 'MODIFIED': return 'bg-yellow-100 text-yellow-800';
      case 'REMOVED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'ADDED': return 'Neu hinzugefügt';
      case 'MODIFIED': return 'Geändert';
      case 'REMOVED': return 'Entfernt';
      case 'EXPIRED': return 'Abgelaufen';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Review-Daten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Fehler beim Laden</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Förderungen Review
              </h1>
              <p className="text-gray-600">
                Scan vom {new Date(reviewSession?.scan_date || '').toLocaleDateString('de-DE')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {changes.length} Änderungen gefunden
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Zurück
              </button>
            </div>
          </div>
        </div>

        {/* Aktionen */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Alle auswählen
            </button>
            <button
              onClick={selectNone}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Auswahl aufheben
            </button>
            <span className="text-sm text-gray-600">
              {selectedChanges.size} von {changes.length} ausgewählt
            </span>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review-Notizen (optional)
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              placeholder="Notizen zu diesem Review..."
            />
          </div>
          
          <button
            onClick={applyChanges}
            disabled={applying || selectedChanges.size === 0}
            className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applying ? 'Übernehme...' : `${selectedChanges.size} Änderungen übernehmen`}
          </button>
        </div>

        {/* Änderungen Liste */}
        <div className="space-y-4">
          {changes.map((change) => (
            <div key={change.id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedChanges.has(change.id)}
                    onChange={() => toggleChangeSelection(change.id)}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getChangeTypeColor(change.change_type)}`}>
                        {getChangeTypeLabel(change.change_type)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {change.foerder_id}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {change.change_summary}
                    </h3>
                    
                    {/* Änderungsdetails */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {change.old_data && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Vorher:</h4>
                          <div className="bg-red-50 p-3 rounded border">
                            <div className="text-sm">
                              <div className="font-medium">{change.old_data.name}</div>
                              <div className="text-gray-600 mt-1">{change.old_data.summary}</div>
                              <div className="text-sm text-gray-500 mt-2">
                                <div>Betrag: {change.old_data.amount}</div>
                                <div>Gültigkeit: {change.old_data.validity}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {change.new_data && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Nachher:</h4>
                          <div className="bg-green-50 p-3 rounded border">
                            <div className="text-sm">
                              <div className="font-medium">{change.new_data.name}</div>
                              <div className="text-gray-600 mt-1">{change.new_data.summary}</div>
                              <div className="text-sm text-gray-500 mt-2">
                                <div>Betrag: {change.new_data.amount}</div>
                                <div>Gültigkeit: {change.new_data.validity}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {changes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-500">
              <div className="text-xl mb-2">Keine Änderungen gefunden</div>
              <p>Für diesen Scan wurden keine Förderungsänderungen erkannt.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
