import CRMLayout from '@/components/crm/CRMLayout'
import Dashboard from '@/components/crm/Dashboard'

export default function CRMPage() {
  return (
    <CRMLayout>
      <Dashboard userRole="admin" />
    </CRMLayout>
  )
}
