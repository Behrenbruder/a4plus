'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  XMarkIcon,
  UserIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { ChatMessage, ChatSession, Customer } from '@/lib/crm-types'

interface ChatInterfaceProps {
  customer: Customer
  onClose?: () => void
  className?: string
}

export default function ChatInterface({ customer, onClose, className = '' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [customer.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      // Mock data - in production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          created_at: '2024-01-20T09:00:00Z',
          customer_id: customer.id,
          user_id: undefined,
          message: 'Hallo, ich interessiere mich für eine PV-Anlage. Können Sie mir ein Angebot machen?',
          is_from_customer: true,
          is_read: true,
          message_type: 'text'
        },
        {
          id: '2',
          created_at: '2024-01-20T09:15:00Z',
          customer_id: customer.id,
          user_id: 'user-1',
          message: 'Hallo! Gerne helfe ich Ihnen bei Ihrem PV-Projekt. Können Sie mir mehr Details zu Ihrem Haus geben?',
          is_from_customer: false,
          is_read: true,
          message_type: 'text'
        },
        {
          id: '3',
          created_at: '2024-01-20T09:30:00Z',
          customer_id: customer.id,
          user_id: undefined,
          message: 'Wir haben ein Einfamilienhaus mit Süddach, ca. 100qm Dachfläche.',
          is_from_customer: true,
          is_read: true,
          message_type: 'text'
        },
        {
          id: '4',
          created_at: '2024-01-20T09:45:00Z',
          customer_id: customer.id,
          user_id: 'user-1',
          message: 'Das klingt sehr gut! Ich erstelle Ihnen gerne ein individuelles Angebot. Darf ich Sie morgen anrufen?',
          is_from_customer: false,
          is_read: false,
          message_type: 'text'
        }
      ]

      setMessages(mockMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      customer_id: customer.id,
      user_id: 'current-user',
      message: newMessage,
      is_from_customer: false,
      is_read: false,
      message_type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate sending message
    try {
      // In production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mark as sent
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, is_read: true } : msg
      ))
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Heute'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern'
    } else {
      return date.toLocaleDateString('de-DE')
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="ml-3">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {customer.first_name[0]}{customer.last_name[0]}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                {customer.first_name} {customer.last_name}
              </h3>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
        {messages.map((message, index) => {
          const showDate = index === 0 || 
            formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)
          
          return (
            <div key={message.id}>
              {showDate && (
                <div className="text-center my-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {formatDate(message.created_at)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${message.is_from_customer ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                  message.is_from_customer ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                }`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    message.is_from_customer 
                      ? 'bg-gray-300' 
                      : 'bg-emerald-500'
                  }`}>
                    {message.is_from_customer ? (
                      <UserIcon className="h-4 w-4 text-gray-600" />
                    ) : (
                      <span className="text-xs font-medium text-white">A</span>
                    )}
                  </div>
                  
                  <div className={`rounded-lg px-4 py-2 ${
                    message.is_from_customer
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <div className={`flex items-center justify-between mt-1 ${
                      message.is_from_customer ? 'text-gray-500' : 'text-emerald-100'
                    }`}>
                      <span className="text-xs">{formatTime(message.created_at)}</span>
                      {!message.is_from_customer && (
                        <div className="ml-2">
                          {message.is_read ? (
                            <div className="flex">
                              <CheckIcon className="h-3 w-3" />
                              <CheckIcon className="h-3 w-3 -ml-1" />
                            </div>
                          ) : (
                            <CheckIcon className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nachricht eingeben..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={handleFileUpload}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              title="Datei anhängen"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>
            
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              title="Emoji"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Senden"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,.pdf,.doc,.docx"
        />
      </div>
    </div>
  )
}
