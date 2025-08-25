'use client'

import { useState, useEffect } from 'react'
import { UserRole, User } from '@/lib/crm-types'
import Sidebar from './Sidebar'
import LoginForm from './LoginForm'

interface CRMLayoutProps {
  children: React.ReactNode
}

export default function CRMLayout({ children }: CRMLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const savedUser = localStorage.getItem('crm_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('crm_user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = async (email: string, password: string, role: UserRole) => {
    setLoginLoading(true)
    setLoginError('')

    try {
      // Demo authentication - in production, this would be a real API call
      const demoCredentials = {
        'admin@arteplus.de': { password: 'admin123', role: 'admin' as UserRole },
        'vertrieb@arteplus.de': { password: 'vertrieb123', role: 'vertrieb' as UserRole },
        'monteur@arteplus.de': { password: 'monteur123', role: 'monteur' as UserRole },
        'kunde@beispiel.de': { password: 'kunde123', role: 'kunde' as UserRole }
      }

      const credential = demoCredentials[email as keyof typeof demoCredentials]
      
      if (!credential || credential.password !== password) {
        throw new Error('Ungültige Anmeldedaten')
      }

      if (credential.role !== role) {
        throw new Error('Die ausgewählte Rolle stimmt nicht mit Ihrem Account überein')
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email,
        first_name: email.split('@')[0].split('.')[0] || 'User',
        last_name: email.split('@')[0].split('.')[1] || 'Name',
        role,
        is_active: true,
        last_login: new Date().toISOString()
      }

      setUser(mockUser)
      localStorage.setItem('crm_user', JSON.stringify(mockUser))
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('crm_user')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade CRM-System...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <LoginForm 
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        userRole={user.role}
        userName={`${user.first_name} ${user.last_name}`}
        userEmail={user.email}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
