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
  ArrowPathIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  XMarkIcon
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
  metadata?: {
    source_account?: string
    from_email?: string
    to_emails?: string[]
    product_interests?: string[]
    [key: string]: any
  }
}

interface EmailHistoryProps {
  customer: Customer
  onBack: () => void
}

export default function EmailHistory({ customer, onBack }: EmailHistoryProps) {
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedSender, setSelectedSender] = useState('info@a4plus.eu')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  // A4Plus Account Information with Email Signatures
  const getA4PlusAccountInfo = (email: string, sourceAccount?: string) => {
    // Use source_account from metadata if available, otherwise fall back to from_email
    const accountEmail = sourceAccount || email
    
    const accounts = {
      'info@a4plus.eu': {
        name: 'A4Plus Team',
        avatar: 'AT',
        color: 'bg-emerald-500',
        textColor: 'text-white',
        signature: `

Wir wünschen einen Tag mit hoher Sonnenintensität

Ihr A4Plus Service-Team

---
A4Plus GmbH
Ihr Partner für nachhaltige Energielösungen

📧 s.behr@a4plus.eu
🌐 www.a4plus.eu
📞 06233 3798860

Photovoltaik | Wärmepumpen | Dämmung | Fenster & Türen`
      },
      's.behr@a4plus.eu': {
        name: 'Samuel Behr',
        avatar: 'SB',
        color: 'bg-blue-500',
        textColor: 'text-white',
        signature: `

Wir wünschen einen Tag mit hoher Sonnenintensität

Samuel Behr
Vertrieb und Web-Automatiserung

---
A4Plus GmbH
Ihr Partner für nachhaltige Energielösungen

📧 s.behr@a4plus.eu
🌐 www.a4plus.eu
📞 06233 3798860

Photovoltaik | Wärmepumpen | Dämmung | Fenster & Türen`
      },
      'b.behr@a4plus.eu': {
        name: 'Benno Behr',
        avatar: 'BB',
        color: 'bg-purple-500',
        textColor: 'text-white',
        signature: `

Wir wünschen einen Tag mit hoher Sonnenintensität
Benno Behr
Geschäftsführer

---
A4Plus GmbH
Ihr Partner für nachhaltige Energielösungen

📧 b.behr@a4plus.eu
🌐 www.a4plus.eu
📞 06233 3798860

Photovoltaik | Wärmepumpen | Dämmung | Fenster & Türen`
      },
      'l.behr@a4plus.eu': {
        name: 'Larissa Behr',
        avatar: 'LB',
        color: 'bg-orange-500',
        textColor: 'text-white',
        signature: `

Wir wünschen einen Tag mit hoher Sonnenintensität
Larissa Behr
Kundenbetreuung & Buchhaltung

---
A4Plus GmbH
Ihr Partner für nachhaltige Energielösungen

📧 l.behr@a4plus.eu
🌐 www.a4plus.eu
📞 06233 3798860

Photovoltaik | Wärmepumpen | Dämmung | Fenster & Türen`
      },
      'montage@a4plus.eu': {
        name: 'Montage Team',
        avatar: 'MT',
        color: 'bg-gray-600',
        textColor: 'text-white',
        signature: `

Wir wünschen einen Tag mit hoher Sonnenintensität
Ihr A4Plus Montage Team

---
A4Plus GmbH
Ihr Partner für nachhaltige Energielösungen

📧 montage@a4plus.eu
🌐 www.a4plus.eu
📞 06233 3798860

Photovoltaik | Wärmepumpen | Dämmung | Fenster & Türen`
      }
    }

    return accounts[accountEmail as keyof typeof accounts] || {
      name: 'A4Plus Team',
      avatar: 'A4',
      color: 'bg-emerald-500',
      textColor: 'text-white',
      signature: `

Wir wünschen einen Tag mit hoher Sonnenintensität

Ihr A4Plus Team

---
A4Plus GmbH
📧 info@a4plus.eu
🌐 www.a4plus.eu`
    }
  }

  // Get available sender accounts
  const getSenderAccounts = () => {
    return [
      'info@a4plus.eu',
      's.behr@a4plus.eu',
      'b.behr@a4plus.eu',
      'l.behr@a4plus.eu',
      'montage@a4plus.eu'
    ]
  }

  // Get email content with signature
  const getEmailContentWithSignature = (content: string, senderEmail: string) => {
    const accountInfo = getA4PlusAccountInfo(senderEmail)
    return content + accountInfo.signature
  }

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const files = event.dataTransfer.files
    if (files) {
      const newFiles = Array.from(files)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const downloadAttachment = async (attachmentPath: string, filename: string) => {
    try {
      const response = await fetch(`/api/attachments/${encodeURIComponent(attachmentPath)}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else if (response.status === 501) {
        // File download not yet implemented
        const errorData = await response.json()
        alert(`Download noch nicht verfügbar: ${errorData.message}\n\nDateiname: ${filename}`)
      } else {
        alert('Fehler beim Herunterladen der Datei')
      }
    } catch (error) {
      console.error('Error downloading attachment:', error)
      alert('Fehler beim Herunterladen der Datei')
    }
  }

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

  const syncEmails = async () => {
    setSyncing(true)
    try {
      console.log(`📧 Starting customer-specific email synchronization for ${customer.email}...`)
      
      // Call the sync API with customer-specific optimization
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout (shorter for customer-specific)
      
      const response = await fetch('/api/emails/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: customer.email, // Use customer-specific sync for performance
          sinceHours: 24 // Sync emails from last 24 hours only
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Customer-specific email sync completed:', data)
        
        // Show success message with customer-specific info
        alert(`E-Mail-Synchronisation für ${customer.email} erfolgreich! ${data.data.newEmails} neue E-Mails von ${data.data.emailsProcessed} verarbeiteten E-Mails hinzugefügt.`)
        
        // Refresh email history to show new emails
        await fetchEmailHistory()
      } else {
        const errorData = await response.json()
        console.error('❌ Customer-specific email sync failed:', errorData)
        alert('Fehler bei der E-Mail-Synchronisation: ' + (errorData.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('❌ Error during customer-specific email sync:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        alert('E-Mail-Synchronisation wurde wegen Timeout abgebrochen. Versuchen Sie es erneut.')
      } else {
        alert('Fehler bei der E-Mail-Synchronisation: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'))
      }
    } finally {
      setSyncing(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyContent.trim() || !replySubject.trim()) return

    setSending(true)
    try {
      // Get email content with signature
      const contentWithSignature = getEmailContentWithSignature(replyContent, selectedSender)
      
      // Prepare form data for file uploads
      const formData = new FormData()
      formData.append('subject', replySubject)
      formData.append('content', contentWithSignature)
      formData.append('fromEmail', selectedSender)
      
      // Add attachments to form data
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })
      
      const response = await fetch(`/api/crm/customers/${customer.id}/emails`, {
        method: 'POST',
        body: formData // Use FormData instead of JSON for file uploads
      })

      if (response.ok) {
        const data = await response.json()
        
        // Add the new message to the list
        setMessages(prev => [...prev, data.email])
        setReplyContent('')
        setAttachments([]) // Clear attachments after successful send
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

  // Parse email content - AGGRESSIVE: Stop at ANY sign of quoted content
  const parseEmailContent = (content: string, isFromCustomer: boolean) => {
    // Split content into lines
    const lines = content.split('\n')
    const cleanedLines = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      // Skip empty lines at the beginning
      if (cleanedLines.length === 0 && trimmedLine === '') {
        continue
      }
      
      // AGGRESSIVE QUOTE DETECTION - Stop at ANY of these patterns:
      
      // 1. German quote patterns
      if (trimmedLine.startsWith('Am ') && trimmedLine.includes('schrieb')) {
        break // Stop at "Am ... schrieb" pattern
      }
      
      // 2. Direct quote markers
      if (trimmedLine.startsWith('>') || trimmedLine.startsWith('>>')) {
        break // Stop at quoted content markers
      }
      
      // 3. Empty line followed by content that looks like a quote
      // This catches cases where there's a blank line before quoted content
      if (trimmedLine === '' && cleanedLines.length > 0) {
        // Check if the next few lines contain quoted content
        let hasQuoteAhead = false
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nextLine = lines[j].trim()
          if (nextLine.startsWith('Am ') && nextLine.includes('schrieb')) {
            hasQuoteAhead = true
            break
          }
          if (nextLine.startsWith('>') || nextLine.includes('mailto:')) {
            hasQuoteAhead = true
            break
          }
        }
        if (hasQuoteAhead) {
          break // Stop here if quotes are coming
        }
      }
      
      // 4. Lines that contain email addresses in angle brackets (often quote metadata)
      if (trimmedLine.includes('<') && trimmedLine.includes('@') && trimmedLine.includes('>')) {
        // This might be quote metadata like "<info@a4plus.eu>"
        break
      }
      
      // 5. Skip email headers but continue
      if (trimmedLine.match(/^(From:|Sent:|To:|Subject:|Date:)/i)) {
        continue // Skip email headers but keep processing
      }
      
      // Add the line if it passed all filters
      cleanedLines.push(line)
    }
    
    const cleanedContent = cleanedLines.join('\n').trim()
    
    if (cleanedContent) {
      return [{
        content: cleanedContent,
        isQuoted: false,
        sender: isFromCustomer ? 'customer' : 'a4plus'
      }]
    }
    
    // Fallback
    return [{
      content: 'No content found',
      isQuoted: false,
      sender: isFromCustomer ? 'customer' : 'a4plus'
    }]
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
          
          {/* Sync Button */}
          <div className="flex space-x-2">
            <button
              onClick={syncEmails}
              disabled={loading || syncing}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Synchronisiere...' : 'E-Mails synchronisieren'}
            </button>
          </div>
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
              className={`rounded-lg shadow-sm border-2 ${
                message.is_from_customer 
                  ? 'bg-blue-50 border-blue-200 border-l-8 border-l-blue-500' 
                  : 'bg-emerald-50 border-emerald-200 border-l-8 border-l-emerald-500'
              }`}
            >
              <div className="p-6">
                {/* Message Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {message.is_from_customer ? (
                      // Customer Avatar
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      // A4Plus Account Avatar
                      (() => {
                        const accountInfo = getA4PlusAccountInfo(message.from_email, message.metadata?.source_account)
                        return (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${accountInfo.color} ${accountInfo.textColor}`}>
                            {accountInfo.avatar}
                          </div>
                        )
                      })()
                    )}
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-lg font-bold ${
                          message.is_from_customer ? 'text-blue-700' : 'text-emerald-700'
                        }`}>
                          {message.is_from_customer 
                            ? `${customer.first_name} ${customer.last_name}` 
                            : getA4PlusAccountInfo(message.from_email, message.metadata?.source_account).name
                          }
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          message.is_from_customer 
                            ? 'bg-blue-200 text-blue-800' 
                            : 'bg-emerald-200 text-emerald-800'
                        }`}>
                          {message.is_from_customer ? 'KUNDE' : 'A4PLUS'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-medium text-gray-600">
                          von {message.is_from_customer ? customer.email : (message.metadata?.source_account || message.from_email)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500">{formatDate(message.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {message.message_type === 'website_formular' && (
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex items-center">
                        <ComputerDesktopIcon className="h-3 w-3 mr-1" />
                        Website-Formular
                      </div>
                    )}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      message.is_from_customer 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {message.is_from_customer ? 'Eingehend' : 'Ausgehend'}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Betreff:</span>
                    <h3 className="font-medium text-gray-900">{message.subject}</h3>
                  </div>
                </div>

                {/* Content - Show only new content, hide quotes */}
                <div className="prose prose-sm max-w-none">
                  {(() => {
                    const contentParts = parseEmailContent(message.content, message.is_from_customer)
                    
                    // Filter out quoted parts - only show new content
                    const newContentParts = contentParts.filter(part => !part.isQuoted)
                    
                    // If no new content parts, show the first part (fallback)
                    const partsToShow = newContentParts.length > 0 ? newContentParts : [contentParts[0]].filter(Boolean)
                    
                    return partsToShow.map((part, index) => (
                      <div key={index} className={`mb-3 ${index > 0 ? 'mt-4' : ''}`}>
                        {/* Show sender indicator only if multiple new parts */}
                        {partsToShow.length > 1 && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              part.sender === 'customer' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-emerald-500 text-white'
                            }`}>
                              {part.sender === 'customer' ? 'K' : 'A'}
                            </div>
                            <span className={`text-sm font-medium ${
                              part.sender === 'customer' ? 'text-blue-700' : 'text-emerald-700'
                            }`}>
                              {part.sender === 'customer' 
                                ? `${customer.first_name} ${customer.last_name}` 
                                : 'A4Plus Team'
                              }
                            </span>
                          </div>
                        )}
                        
                        {/* Content part - clean new content only */}
                        <div className={`whitespace-pre-wrap text-gray-700 p-4 rounded-lg ${
                          partsToShow.length > 1
                            ? part.sender === 'customer'
                              ? 'bg-blue-50 border-l-4 border-l-blue-300'
                              : 'bg-emerald-50 border-l-4 border-l-emerald-300'
                            : 'bg-gray-50'
                        }`}>
                          {part.content.trim()}
                        </div>
                      </div>
                    ))
                  })()}
                  
                  {/* Product Interests for Website Form Submissions */}
                  {message.message_type === 'website_formular' && message.metadata?.product_interests && message.metadata.product_interests.length > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <ComputerDesktopIcon className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Produktinteressen:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.metadata.product_interests.map((interest: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full border border-orange-300"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <PaperClipIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {message.attachments.length} Anhang{message.attachments.length > 1 ? 'e' : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {message.attachments.map((attachment, index) => {
                        // Extract filename from attachment path
                        const filename = attachment.split('/').pop() || attachment
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-3">
                              <DocumentIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {filename}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Anhang
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadAttachment(attachment, filename)}
                              className="flex items-center space-x-1 px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              <span>Download</span>
                            </button>
                          </div>
                        )
                      })}
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
            {/* From Field - Sender Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Von (Absender)
              </label>
              <select
                value={selectedSender}
                onChange={(e) => setSelectedSender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {getSenderAccounts().map((email) => {
                  const accountInfo = getA4PlusAccountInfo(email)
                  return (
                    <option key={email} value={email}>
                      {accountInfo.name} ({email})
                    </option>
                  )
                })}
              </select>
              <div className="mt-1 flex items-center space-x-2">
                {(() => {
                  const accountInfo = getA4PlusAccountInfo(selectedSender)
                  return (
                    <>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${accountInfo.color} ${accountInfo.textColor}`}>
                        {accountInfo.avatar}
                      </div>
                      <span className="text-xs text-gray-500">
                        E-Mail wird mit individueller Signatur von {accountInfo.name} gesendet
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>

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

            {/* Attachments Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anhänge
              </label>
              
              {/* File Upload Area */}
              <div
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <PaperClipIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Dateien hier ablegen oder klicken zum Auswählen
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Mehrere Dateien möglich
                  </span>
                </label>
              </div>

              {/* Selected Files List */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    {attachments.length} Datei{attachments.length > 1 ? 'en' : ''} ausgewählt:
                  </div>
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <DocumentIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
