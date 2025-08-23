'use client';

import React, { useState } from 'react';
import type { EconomicConfig, SystemLossBreakdown } from '@/lib/types';
import { calculateSystemLossBreakdown, systemLossFactorFromBreakdown } from '@/lib/pvcalc';

type Props = {
  econ: EconomicConfig;
  systemLossBreakdown?: SystemLossBreakdown;
  onNext: (econ: EconomicConfig, systemLossBreakdown: SystemLossBreakdown) => void;
  totalKWp?: number;
  batteryKWh?: number;
};

export default function StepPricesExtended({ 
  econ, 
  systemLossBreakdown, 
  onNext, 
  totalKWp = 0, 
  batteryKWh = 0 
}: Props) {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'losses'>('basic');
  const [localEcon, setLocalEcon] = useState<EconomicConfig>(econ);
  const [localLosses, setLocalLosses] = useState<SystemLossBreakdown>(
    systemLossBreakdown || calculateSystemLossBreakdown()
  );

  const [costMode, setCostMode] = useState<'total' | 'per_unit'>('total');

  const handleEconChange = (field: keyof EconomicConfig, value: number | undefined) => {
    const updated = { ...localEcon, [field]: value };
    setLocalEcon(updated);
  };

  const handleLossChange = (field: keyof SystemLossBreakdown, value: number) => {
    if (field === 'totalLossPct') return; // Wird automatisch berechnet
    
    const updated = { ...localLosses, [field]: value };
    // Gesamtverluste neu berechnen
    const total = updated.inverterLossPct + updated.wiringLossPct + updated.soilingLossPct + 
                  updated.shadingLossPct + updated.temperatureLossPct + updated.mismatchLossPct;
    updated.totalLossPct = total;
    setLocalLosses(updated);
  };

  const handleSubmit = () => {
    onNext(localEcon, localLosses);
  };

  const estimatedPVCost = totalKWp * localEcon.capexPerKWpEUR;
  const estimatedBatteryCost = batteryKWh * localEcon.capexBatteryPerKWhEUR;
  const totalEstimated = estimatedPVCost + estimatedBatteryCost + (localEcon.installationCostEUR || 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Preise & Systemverluste
        </h3>
        <p className="text-sm text-gray-600">
          Konfigurieren Sie Strompreise, Investitionskosten und Systemverluste
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Grundpreise', icon: '💰' },
            { id: 'advanced', label: 'Investitionskosten', icon: '🏗️' },
            { id: 'losses', label: 'Systemverluste', icon: '⚡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'basic' | 'advanced' | 'losses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Basic Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strompreis (ct/kWh)
              </label>
              <input
                type="number"
                step="0.1"
                value={localEcon.electricityPriceCtPerKWh}
                onChange={(e) => handleEconChange('electricityPriceCtPerKWh', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Einspeisevergütung (ct/kWh)
              </label>
              <input
                type="number"
                step="0.1"
                value={localEcon.feedInTariffCtPerKWh}
                onChange={(e) => handleEconChange('feedInTariffCtPerKWh', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grundgebühr (€/Monat)
            </label>
            <input
              type="number"
              step="0.1"
              value={localEcon.baseFeeEURPerMonth || ''}
              onChange={(e) => handleEconChange('baseFeeEURPerMonth', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional"
            />
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Kostenmodus */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kosteneingabe-Modus
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={costMode === 'per_unit'}
                  onChange={() => setCostMode('per_unit')}
                  className="mr-2"
                />
                Pro Einheit (€/kWp, €/kWh)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={costMode === 'total'}
                  onChange={() => setCostMode('total')}
                  className="mr-2"
                />
                Gesamtkosten (€)
              </label>
            </div>
          </div>

          {costMode === 'per_unit' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PV-System (€/kWp)
                </label>
                <input
                  type="number"
                  step="10"
                  value={localEcon.capexPerKWpEUR}
                  onChange={(e) => handleEconChange('capexPerKWpEUR', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {totalKWp > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {Math.round(estimatedPVCost).toLocaleString()} € bei {totalKWp.toFixed(1)} kWp
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batterie (€/kWh)
                </label>
                <input
                  type="number"
                  step="10"
                  value={localEcon.capexBatteryPerKWhEUR}
                  onChange={(e) => handleEconChange('capexBatteryPerKWhEUR', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {batteryKWh > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {Math.round(estimatedBatteryCost).toLocaleString()} € bei {batteryKWh} kWh
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PV-System Gesamtkosten (€)
                </label>
                <input
                  type="number"
                  step="100"
                  value={localEcon.pvSystemCapexEUR || ''}
                  onChange={(e) => handleEconChange('pvSystemCapexEUR', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Geschätzt: ${Math.round(estimatedPVCost).toLocaleString()} €`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batterie Gesamtkosten (€)
                </label>
                <input
                  type="number"
                  step="100"
                  value={localEcon.batteryCapexEUR || ''}
                  onChange={(e) => handleEconChange('batteryCapexEUR', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Geschätzt: ${Math.round(estimatedBatteryCost).toLocaleString()} €`}
                />
              </div>
            </div>
          )}

          {/* Zusätzliche Kosten */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Installation (€)
              </label>
              <input
                type="number"
                step="100"
                value={localEcon.installationCostEUR || ''}
                onChange={(e) => handleEconChange('installationCostEUR', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wartung (€/Jahr)
              </label>
              <input
                type="number"
                step="10"
                value={localEcon.maintenanceCostPerYearEUR || ''}
                onChange={(e) => handleEconChange('maintenanceCostPerYearEUR', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Versicherung (€/Jahr)
              </label>
              <input
                type="number"
                step="10"
                value={localEcon.insuranceCostPerYearEUR || ''}
                onChange={(e) => handleEconChange('insuranceCostPerYearEUR', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Gesamtkosten Übersicht */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Geschätzte Gesamtinvestition</h4>
            <div className="text-sm text-blue-800">
              <div className="flex justify-between">
                <span>PV-System:</span>
                <span>{Math.round(localEcon.pvSystemCapexEUR || estimatedPVCost).toLocaleString()} €</span>
              </div>
              {batteryKWh > 0 && (
                <div className="flex justify-between">
                  <span>Batterie:</span>
                  <span>{Math.round(localEcon.batteryCapexEUR || estimatedBatteryCost).toLocaleString()} €</span>
                </div>
              )}
              {localEcon.installationCostEUR && (
                <div className="flex justify-between">
                  <span>Installation:</span>
                  <span>{Math.round(localEcon.installationCostEUR).toLocaleString()} €</span>
                </div>
              )}
              <div className="border-t border-blue-300 mt-2 pt-2 flex justify-between font-medium">
                <span>Gesamt:</span>
                <span>{Math.round(
                  (localEcon.pvSystemCapexEUR || estimatedPVCost) +
                  (localEcon.batteryCapexEUR || estimatedBatteryCost) +
                  (localEcon.installationCostEUR || 0)
                ).toLocaleString()} €</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Losses Tab */}
      {activeTab === 'losses' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Systemverluste Aufschlüsselung</h4>
            <p className="text-xs text-yellow-700">
              Passen Sie die einzelnen Verlustkomponenten an. Die Gesamtverluste werden automatisch berechnet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wechselrichter-Verluste (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={localLosses.inverterLossPct}
                onChange={(e) => handleLossChange('inverterLossPct', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verkabelungs-Verluste (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={localLosses.wiringLossPct}
                onChange={(e) => handleLossChange('wiringLossPct', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verschmutzungs-Verluste (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={localLosses.soilingLossPct}
                onChange={(e) => handleLossChange('soilingLossPct', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschattungs-Verluste (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={localLosses.shadingLossPct}
                onChange={(e) => handleLossChange('shadingLossPct', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatur-Verluste (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="15"
                value={localLosses.temperatureLossPct}
                onChange={(e) => handleLossChange('temperatureLossPct', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mismatch-Verluste (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={localLosses.mismatchLossPct}
                onChange={(e) => handleLossChange('mismatchLossPct', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Gesamtverluste */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-red-800">Gesamtverluste:</span>
              <span className="text-lg font-bold text-red-900">{localLosses.totalLossPct.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-red-700">Systemwirkungsgrad:</span>
              <span className="text-sm font-medium text-red-800">
                {((100 - localLosses.totalLossPct)).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
