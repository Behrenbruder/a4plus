'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface FoerderungChange {
  id: string
  name: string
  url: string
  currentStatus: 'available' | 'unavailable' | 'unknown'
  newStatus: 'available' | 'unavailable' | 'unknown'
  changeType: 'new' | 'status_change' | 'no_change'
  lastChecked?: string
}

interface PreviewData {
  summary: {
    totalChecked: number
    newEntries: number
    statusChanges: number
    noChanges: number
    availablePrograms: number
    unavailablePrograms: number
  }
  changes: {
    new: FoerderungChange[]
    statusChanges: FoerderungChange[]
    noChanges: FoerderungChange[]
  }
  timestamp: string
}

interface FoerderPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  previewData: PreviewData | null
  onApplyChanges: () => void
  isApplying: boolean
}

export default function FoerderPreviewModal({
  isOpen,
  onClose,
  previewData,
  onApplyChanges,
  isApplying
}: FoerderPreviewModalProps) {
  if (!previewData) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'unavailable':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Verfügbar'
      case 'unavailable':
        return 'Nicht verfügbar'
      default:
        return 'Unbekannt'
    }
  }

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'status_change':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const hasChanges = previewData.summary.newEntries > 0 || previewData.summary.statusChanges > 0

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Förderung Scan Vorschau
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Scan Zusammenfassung</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Geprüfte Programme:</span>
                      <span className="ml-2 font-medium">{previewData.summary.totalChecked}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Neue Einträge:</span>
                      <span className="ml-2 font-medium text-blue-600">{previewData.summary.newEntries}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status-Änderungen:</span>
                      <span className="ml-2 font-medium text-yellow-600">{previewData.summary.statusChanges}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Verfügbar:</span>
                      <span className="ml-2 font-medium text-green-600">{previewData.summary.availablePrograms}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Nicht verfügbar:</span>
                      <span className="ml-2 font-medium text-red-600">{previewData.summary.unavailablePrograms}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Keine Änderungen:</span>
                      <span className="ml-2 font-medium text-gray-600">{previewData.summary.noChanges}</span>
                    </div>
                  </div>
                </div>

                {/* Changes */}
                <div className="max-h-96 overflow-y-auto">
                  {/* New Entries */}
                  {previewData.changes.new.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                        Neue Einträge ({previewData.changes.new.length})
                      </h4>
                      <div className="space-y-2">
                        {previewData.changes.new.map((change) => (
                          <div key={change.id} className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{change.name}</h5>
                                <p className="text-sm text-gray-600 truncate">{change.url}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getChangeTypeColor(change.changeType)}`}>
                                  Neu
                                </span>
                                {getStatusIcon(change.newStatus)}
                                <span className="text-sm font-medium">{getStatusText(change.newStatus)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Changes */}
                  {previewData.changes.statusChanges.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                        Status-Änderungen ({previewData.changes.statusChanges.length})
                      </h4>
                      <div className="space-y-2">
                        {previewData.changes.statusChanges.map((change) => (
                          <div key={change.id} className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{change.name}</h5>
                                <p className="text-sm text-gray-600 truncate">{change.url}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(change.currentStatus)}
                                  <span className="text-sm">{getStatusText(change.currentStatus)}</span>
                                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                                  {getStatusIcon(change.newStatus)}
                                  <span className="text-sm font-medium">{getStatusText(change.newStatus)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Changes (collapsed by default) */}
                  {previewData.changes.noChanges.length > 0 && (
                    <div className="mb-6">
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                          Keine Änderungen ({previewData.changes.noChanges.length})
                          <span className="ml-2 text-xs text-gray-500">(Klicken zum Anzeigen)</span>
                        </summary>
                        <div className="space-y-2 mt-3">
                          {previewData.changes.noChanges.slice(0, 10).map((change) => (
                            <div key={change.id} className="p-2 border border-gray-200 rounded bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-gray-900">{change.name}</h5>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(change.currentStatus)}
                                  <span className="text-sm">{getStatusText(change.currentStatus)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {previewData.changes.noChanges.length > 10 && (
                            <p className="text-sm text-gray-500 text-center">
                              ... und {previewData.changes.noChanges.length - 10} weitere
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Scan durchgeführt: {new Date(previewData.timestamp).toLocaleString('de-DE')}
                  </p>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      Abbrechen
                    </button>
                    {hasChanges && (
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onApplyChanges}
                        disabled={isApplying}
                      >
                        {isApplying ? 'Wird angewendet...' : 'Änderungen anwenden'}
                      </button>
                    )}
                    {!hasChanges && (
                      <div className="text-sm text-gray-500 px-4 py-2">
                        Keine Änderungen zum Anwenden
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
