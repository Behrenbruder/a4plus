'use client'

import { useState, useEffect } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  PaperClipIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Customer } from '@/lib/crm-types'

interface EmailMessage {
  id: string
  created_at: string
  from_email: string
  to_email: string
  subject: string
  content: string
  is_from_customer: boolean
  is_read: boolean
  attachments?: string[]
  message_type: 'email' | 'website_formular'
  contact_type?: string
}

interface EmailHistoryProps {
  customer: Customer
  onBack: () => void
}

export default function EmailHistory({ customer, onBack }: EmailHistoryProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchEmailHistory()
  }, [customer.id])

  useEffect(() => {
    // Auto-set subject when messages change
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      const subject = latestMessage.subject
      if (subject && !replySubject) {
        setReplySubject(subject.startsWith('Re: ') ? subject : `Re: ${subject}`)
      }
    } else if (!replySubject) {
      setReplySubject('Erste Kontaktaufnahme')
    }
  }, [messages, replySubject])

  const fetchEmailHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/crm/customers/${customer.id}/emails`)
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.emails || [])
      } else {
        console.error('Failed to fetch email history')
        setMessages([])
      }
    } catch (error) {
      console.error('Error fetching email history:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyContent.trim() || !replySubject.trim()) return

    setSending(true)
    try {
      const response = await fetch(`/api/crm/customers/${customer.id}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: replySubject,
          content: replyContent
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Add the new message to the list
        setMessages(prev => [...prev, data.email])
        setReplyContent('')
        // Keep subject for potential follow-up
      } else {
        const errorData = await response.json()
        console.error('Failed to send email:', errorData.error)
        alert('Fehler beim Senden der E-Mail: ' + errorData.error)
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Fehler beim Senden der E-Mail')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Zurück
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" />
                E-Mail Verlauf
              </h1>
              <p className="text-gray-600">
                {customer.first_name} {customer.last_name} ({customer.email})
              </p>
              {messages.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {messages.length} Nachricht{messages.length !== 1 ? 'en' : ''} gefunden
                </p>
              )}
            </div>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchEmailHistory}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Aktualisiere...' : 'Aktualisieren'}
          </button>
        </div>
      </div>

      {/* Email Messages Container with fixed height */}
      <div className="h-[calc(100vh-400px)] overflow-y-auto mb-6 space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine E-Mails gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              Es wurden noch keine E-Mails mit diesem Kunden ausgetauscht.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Verwenden Sie das Textfeld unten, um die erste E-Mail zu senden.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-lg shadow-sm border ${
                message.is_from_customer ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-emerald-500'
              }`}
            >
              <div className="p-6">
                {/* Message Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.is_from_customer ? 'bg-blue-100' : 'bg-emerald-100'
                    }`}>
                      {message.is_from_customer ? (
                        <UserIcon className={`h-4 w-4 ${message.is_from_customer ? 'text-blue-600' : 'text-emerald-600'}`} />
                      ) : (
                        <ComputerDesktopIcon className={`h-4 w-4 ${message.is_from_customer ? 'text-blue-600' : 'text-emerald-600'}`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {message.is_from_customer ? `${customer.first_name} ${customer.last_name}` : 'A4Plus Team'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {message.is_from_customer ? 'an' : 'von'} {message.is_from_customer ? message.to_email : message.from_email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    message.is_from_customer 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {message.is_from_customer ? 'Eingehend' : 'Ausgehend'}
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900">{message.subject}</h3>
                </div>

                {/* Content */}
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {message.content}
                  </div>
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <PaperClipIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {message.attachments.length} Anhang{message.attachments.length > 1 ? 'e' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Reply Form at Bottom */}
      <div className="bg-white border-t border-gray-200 p-6 -mx-6 -mb-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Neue Nachricht senden</h3>
          
          <div className="space-y-4">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                An
              </label>
              <input
                type="email"
                value={customer.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Betreff
              </label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Betreff eingeben..."
              />
            </div>

            {/* Content Field - Large */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nachricht
              </label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                placeholder="Ihre Nachricht eingeben..."
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSendReply}
                disabled={!replyContent.trim() || !replySubject.trim() || sending}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-base font-medium"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                    E-Mail senden
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
