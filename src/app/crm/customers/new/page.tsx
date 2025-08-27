'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CRMLayout from '@/components/crm/CRMLayout'
import SimpleCustomerForm from '@/components/crm/SimpleCustomerForm'

export default function NewCustomerPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreateCustomer = async (customerData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        throw new Error('Failed to create customer')
      }

      const result = await response.json()
      console.log('Customer created successfully:', result)
      
      // Redirect to customer list or pipeline
      router.push('/crm/customers/pipeline')
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error // Re-throw to let the form handle the error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/crm/customers/pipeline')
  }

  return (
    <CRMLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Neuen Kunden anlegen</h1>
          <p className="text-gray-600 mt-2">
            Erfassen Sie alle relevanten Informationen für den neuen Kunden
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <SimpleCustomerForm
            isOpen={true}
            onClose={handleCancel}
            onSave={handleCreateCustomer}
            loading={loading}
          />
        </div>
      </div>
    </CRMLayout>
  )
}
