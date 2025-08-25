'use client';

import React, { useState } from 'react';
import type { WizardState, RoofFace, BatteryConfig, EVConfig } from '@/lib/types';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  pvData: {
    // Grunddaten
    roofType?: string;
    roofTilt?: number;
    annualConsumption?: number;
    electricityPrice?: number;
    
    // Dachflächen
    roofFaces?: RoofFace[];
    
    // System-Konfiguration
    totalKWp?: number;
    annualPV?: number;
    batteryKWh?: number;
    
    // E-Auto Daten
    evData?: EVConfig;
    
    // Wärmepumpe
    heatPumpConsumption?: number;
    
    // Berechnungsergebnisse
    autarkie?: number;
    eigenverbrauch?: number;
    annualSavings?: number;
    co2Savings?: number;
    paybackTime?: number;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export function QuoteRequestModal({ isOpen, onClose, pvData }: QuoteRequestModalProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/pv-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          pvData
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Nach 2 Sekunden schließen
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            postalCode: ''
          });
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Kostenloses Angebot anfordern
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Lassen Sie sich ein individuelles Angebot für Ihre PV-Anlage erstellen. 
            Wir melden uns innerhalb von 24 Stunden bei Ihnen.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vielen Dank für Ihre Anfrage!
              </h3>
              <p className="text-gray-600">
                Wir haben Ihre Daten erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Persönliche Daten */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ihre Kontaktdaten
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Vorname *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nachname *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Kontaktinformationen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefonnummer (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Adresse (optional)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Straße und Hausnummer
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        PLZ
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ort
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PV-Daten Zusammenfassung */}
              {pvData.totalKWp && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ihre PV-Konfiguration
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Leistung:</span>
                      <div className="font-semibold">{pvData.totalKWp?.toFixed(2)} kWp</div>
                    </div>
                    {pvData.annualPV && (
                      <div>
                        <span className="text-gray-600">Jahresertrag:</span>
                        <div className="font-semibold">{pvData.annualPV.toLocaleString()} kWh</div>
                      </div>
                    )}
                    {pvData.autarkie && (
                      <div>
                        <span className="text-gray-600">Autarkie:</span>
                        <div className="font-semibold">{(pvData.autarkie * 100).toFixed(0)}%</div>
                      </div>
                    )}
                    {pvData.batteryKWh && (
                      <div>
                        <span className="text-gray-600">Speicher:</span>
                        <div className="font-semibold">{pvData.batteryKWh} kWh</div>
                      </div>
                    )}
                    {pvData.annualSavings && (
                      <div>
                        <span className="text-gray-600">Einsparung/Jahr:</span>
                        <div className="font-semibold">{pvData.annualSavings.toFixed(0)} €</div>
                      </div>
                    )}
                    {pvData.paybackTime && (
                      <div>
                        <span className="text-gray-600">Amortisation:</span>
                        <div className="font-semibold">{pvData.paybackTime.toFixed(1)} Jahre</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-800">
                    <strong>Fehler:</strong> {errorMessage}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Angebot anfordern'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuoteRequestModal;
