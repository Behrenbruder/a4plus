'use client'

import { useState } from 'react'
import { UserRole } from '@/lib/crm-types'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface LoginFormProps {
  onLogin: (email: string, password: string, role: UserRole) => Promise<void>
  loading?: boolean
  error?: string
}

export default function LoginForm({ onLogin, loading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('kunde')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!email || !password) {
      setFormError('Bitte füllen Sie alle Felder aus.')
      return
    }

    if (!email.includes('@')) {
      setFormError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      return
    }

    try {
      await onLogin(email, password, role)
    } catch (err) {
      setFormError('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.')
    }
  }

  const roleOptions = [
    { value: 'admin' as UserRole, label: 'Administrator', description: 'Vollzugriff auf alle Funktionen' },
    { value: 'vertrieb' as UserRole, label: 'Vertrieb', description: 'Kunden- und Projektmanagement' },
    { value: 'monteur' as UserRole, label: 'Monteur', description: 'Projektausführung und Dokumentation' },
    { value: 'kunde' as UserRole, label: 'Kunde', description: 'Projektübersicht und Kommunikation' }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ArtePlus CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Melden Sie sich mit Ihren Zugangsdaten an
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Anmelden als
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      relative flex cursor-pointer rounded-lg border p-4 focus:outline-none
                      ${role === option.value
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role === option.value}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="sr-only"
                    />
                    <div className="flex flex-1">
                      <div className="flex flex-col">
                        <span className={`block text-sm font-medium ${
                          role === option.value ? 'text-emerald-900' : 'text-gray-900'
                        }`}>
                          {option.label}
                        </span>
                        <span className={`block text-sm ${
                          role === option.value ? 'text-emerald-700' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </span>
                      </div>
                    </div>
                    {role === option.value && (
                      <div className="flex-shrink-0 text-emerald-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="ihre.email@beispiel.de"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Passwort
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Ihr Passwort"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {(error || formError) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Anmeldung fehlgeschlagen
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error || formError}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Anmelden...
                </div>
              ) : (
                'Anmelden'
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Demo-Zugangsdaten:</p>
              <div className="space-y-1 text-xs">
                <p><strong>Admin:</strong> admin@arteplus.de / admin123</p>
                <p><strong>Vertrieb:</strong> vertrieb@arteplus.de / vertrieb123</p>
                <p><strong>Monteur:</strong> monteur@arteplus.de / monteur123</p>
                <p><strong>Kunde:</strong> kunde@beispiel.de / kunde123</p>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="flex items-center justify-between text-sm">
            <a href="#" className="text-emerald-600 hover:text-emerald-500">
              Passwort vergessen?
            </a>
            <a href="#" className="text-emerald-600 hover:text-emerald-500">
              Registrieren
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
