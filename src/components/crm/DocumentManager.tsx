'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  DocumentTextIcon,
  PhotoIcon,
  PaperClipIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Document, DocumentType, Customer } from '@/lib/crm-types'

interface DocumentManagerProps {
  customer: Customer
  className?: string
}

export default function DocumentManager({ customer, className = '' }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [customer.id])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      // Mock data - in production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockDocuments: Document[] = [
        {
          id: '1',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z',
          customer_id: customer.id,
          uploaded_by: 'user-1',
          document_type: 'angebot',
          title: 'PV-Angebot Einfamilienhaus',
          description: 'Detailliertes Angebot für 10kWp PV-Anlage',
          file_name: 'pv-angebot-mustermann.pdf',
          file_path: '/documents/pv-angebot-mustermann.pdf',
          file_size: 2048576,
          mime_type: 'application/pdf',
          version: 1,
          is_active: true,
          tags: ['pv', 'angebot', '10kwp']
        },
        {
          id: '2',
          created_at: '2024-01-18T14:30:00Z',
          updated_at: '2024-01-18T14:30:00Z',
          customer_id: customer.id,
          uploaded_by: 'user-1',
          document_type: 'foto',
          title: 'Dachaufnahme Süddach',
          description: 'Foto des Süddachs für PV-Planung',
          file_name: 'dach-sued.jpg',
          file_path: '/documents/dach-sued.jpg',
          file_size: 1024000,
          mime_type: 'image/jpeg',
          version: 1,
          is_active: true,
          tags: ['dach', 'foto', 'planung']
        },
        {
          id: '3',
          created_at: '2024-01-15T09:15:00Z',
          updated_at: '2024-01-15T09:15:00Z',
          customer_id: customer.id,
          uploaded_by: 'user-2',
          document_type: 'technische_zeichnung',
          title: 'Technische Zeichnung PV-Layout',
          description: 'CAD-Zeichnung der geplanten Modulanordnung',
          file_name: 'pv-layout-technisch.dwg',
          file_path: '/documents/pv-layout-technisch.dwg',
          file_size: 512000,
          mime_type: 'application/dwg',
          version: 2,
          is_active: true,
          tags: ['technisch', 'layout', 'cad']
        }
      ]

      setDocuments(mockDocuments)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        // Mock upload - in production, this would upload to cloud storage
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newDocument: Document = {
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customer_id: customer.id,
          uploaded_by: 'current-user',
          document_type: getDocumentTypeFromFile(file),
          title: file.name.split('.')[0],
          description: '',
          file_name: file.name,
          file_path: `/documents/${file.name}`,
          file_size: file.size,
          mime_type: file.type,
          version: 1,
          is_active: true,
          tags: []
        }

        setDocuments(prev => [newDocument, ...prev])
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
      setShowUploadModal(false)
    }
  }

  const getDocumentTypeFromFile = (file: File): DocumentType => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    const mimeType = file.type.toLowerCase()

    if (mimeType.startsWith('image/')) return 'foto'
    if (extension === 'pdf') return 'angebot'
    if (extension === 'dwg' || extension === 'dxf') return 'technische_zeichnung'
    return 'angebot'
  }

  const getDocumentIcon = (document: Document) => {
    if (document.mime_type?.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />
    }
    return <DocumentTextIcon className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels = {
      angebot: 'Angebot',
      vertrag: 'Vertrag',
      rechnung: 'Rechnung',
      foto: 'Foto',
      technische_zeichnung: 'Technische Zeichnung',
      foerderantrag: 'Förderantrag'
    }
    return labels[type]
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = selectedType === 'all' || doc.document_type === selectedType
    
    return matchesSearch && matchesType && doc.is_active
  })

  const documentTypes: { value: DocumentType | 'all', label: string }[] = [
    { value: 'all', label: 'Alle Dokumente' },
    { value: 'angebot', label: 'Angebote' },
    { value: 'vertrag', label: 'Verträge' },
    { value: 'rechnung', label: 'Rechnungen' },
    { value: 'foto', label: 'Fotos' },
    { value: 'technische_zeichnung', label: 'Technische Zeichnungen' },
    { value: 'foerderantrag', label: 'Förderanträge' }
  ]

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Dokumente</h3>
            <p className="text-sm text-gray-500">
              {filteredDocuments.length} von {documents.length} Dokumenten
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Hochladen
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Dokumente suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DocumentType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document List */}
      <div className="p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Dokumente gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType !== 'all'
                ? 'Versuchen Sie andere Suchkriterien.'
                : 'Laden Sie das erste Dokument hoch.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getDocumentIcon(document)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {document.title}
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {getDocumentTypeLabel(document.document_type)}
                      </span>
                      {document.version > 1 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          v{document.version}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{document.file_name}</span>
                      <span>{formatFileSize(document.file_size || 0)}</span>
                      <span>{new Date(document.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                    {document.description && (
                      <p className="mt-1 text-sm text-gray-600 truncate">
                        {document.description}
                      </p>
                    )}
                    {document.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {document.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    title="Anzeigen"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    title="Herunterladen"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50"
                    title="Löschen"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowUploadModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Dokumente hochladen
                  </h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-emerald-600 hover:text-emerald-500">
                          Klicken Sie hier
                        </span>{' '}
                        oder ziehen Sie Dateien hierher
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, JPG, PNG bis zu 10MB
                      </p>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.dxf"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>
              
              {uploading && (
                <div className="bg-gray-50 px-4 py-3 sm:px-6">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Dateien werden hochgeladen...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
