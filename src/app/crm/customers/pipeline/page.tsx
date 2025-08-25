'use client';

import React from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import LeadPipeline from '@/components/crm/LeadPipeline';
import { Customer, LeadStatus } from '@/lib/crm-types';

export default function PipelinePage() {
  const handleLeadClick = (lead: Customer) => {
    // Navigate to customer detail page
    window.location.href = `/crm/customers/${lead.id}`;
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus, reason?: string) => {
    try {
      const response = await fetch(`/api/crm/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reason,
          user_id: 'current-user-id' // In real app, get from session
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      const result = await response.json();
      console.log('Lead status updated:', result);
      
      // Show success message
      // In real app, use a toast notification
      alert(`Lead-Status erfolgreich zu "${newStatus}" geändert`);
      
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Fehler beim Aktualisieren des Lead-Status');
    }
  };

  return (
    <CRMLayout>
      <LeadPipeline 
        onLeadClick={handleLeadClick}
        onStatusChange={handleStatusChange}
      />
    </CRMLayout>
  );
}
