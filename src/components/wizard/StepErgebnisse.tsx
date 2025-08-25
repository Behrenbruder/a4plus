'use client';

import React, { useState } from 'react';
import type { FinancialMetrics, SystemLossBreakdown, RoofFace, EVConfig } from '@/lib/types';
import QuoteRequestModal from '@/components/QuoteRequestModal';

type Props = {
  totalKWp: number;
  annualPV: number;                 // kWh/a
  eigenverbrauchKWh: number;        // kWh/a
  feedInKWh: number;                // kWh/a
  einsparungJahrEUR: number;        // €
  co2SavingsTons: number;           // t/a
  batteryUsagePct: number | null;   // 0..100 oder null
  autarkie: number;                 // 0..1
  eigenverbrauch: number;           // 0..1
  // Neue Props
  financialMetrics?: FinancialMetrics;
  totalCapexEUR?: number;
  systemLossBreakdown?: SystemLossBreakdown;
  annualMaintenanceEUR?: number;
  annualInsuranceEUR?: number;
  // PV-Rechner Daten für Angebotserstellung
  pvCalculatorData?: {
    roofType?: string;
    roofTilt?: number;
    annualConsumption?: number;
    electricityPrice?: number;
    roofFaces?: RoofFace[];
    batteryKWh?: number;
    evData?: EVConfig;
    heatPumpConsumption?: number;
  };
};

export function StepErgebnisse({
  totalKWp,
  annualPV,
  eigenverbrauchKWh,
  feedInKWh,
  einsparungJahrEUR,
  co2SavingsTons,
  batteryUsagePct,
  autarkie,
  eigenverbrauch,
  financialMetrics,
  totalCapexEUR,
  systemLossBreakdown,
  annualMaintenanceEUR,
  annualInsuranceEUR,
  pvCalculatorData,
}: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'financial'>('overview');
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Übersicht', icon: '📊' },
            { id: 'financial', label: 'Wirtschaftlichkeit', icon: '💰' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'financial')}
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500">Installierbare Leistung</div>
              <div className="text-2xl font-bold">{totalKWp.toFixed(2)} kWp</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500">Jahresproduktion</div>
              <div className="text-2xl font-bold">{annualPV.toLocaleString()} kWh/a</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500">Autarkie / Eigenverbrauch</div>
              <div className="text-2xl font-bold">
                {(autarkie * 100).toFixed(0)}% / {(eigenverbrauch * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Weitere Kennzahlen */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500">Eigenverbrauch (kWh/a)</div>
              <div className="text-2xl font-bold">{eigenverbrauchKWh.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500">Überschussstrom</div>
              <div className="text-2xl font-bold">{feedInKWh.toLocaleString()} kWh</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500">Einsparung/Jahr</div>
              <div className="text-2xl font-bold">{einsparungJahrEUR.toFixed(0)} €</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500">CO₂‑Einsparung</div>
              <div className="text-2xl font-bold">{co2SavingsTons.toFixed(2)} t/a</div>
            </div>
            {batteryUsagePct !== null && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Batterie‑Nutzungsgrad</div>
                <div className="text-2xl font-bold">{batteryUsagePct.toFixed(0)}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Investition & Amortisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {totalCapexEUR && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-sm text-blue-600">Gesamtinvestition</div>
                <div className="text-2xl font-bold text-blue-900">
                  {Math.round(totalCapexEUR).toLocaleString()} €
                </div>
              </div>
            )}
            
            {financialMetrics && (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="text-sm text-green-600">Amortisationszeit</div>
                  <div className="text-2xl font-bold text-green-900">
                    {financialMetrics.paybackTimeYears.toFixed(1)} Jahre
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="text-sm text-purple-600">ROI (30 Jahre)</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {financialMetrics.roiPct.toFixed(0)}%
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="text-sm text-orange-600">Interne Zinsfuß</div>
                  <div className="text-2xl font-bold text-orange-900">
                    {financialMetrics.irrPct.toFixed(1)}%
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Erweiterte Finanzmetriken */}
          {financialMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Kapitalwert (NPV)</div>
                <div className="text-xl font-bold">
                  {Math.round(financialMetrics.npvEUR).toLocaleString()} €
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {financialMetrics.npvEUR > 0 ? 'Positiv - Investition lohnt sich' : 'Negativ - Investition kritisch prüfen'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Stromgestehungskosten (LCOE)</div>
                <div className="text-xl font-bold">
                  {financialMetrics.lcoeCtPerKWh.toFixed(1)} ct/kWh
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Kosten pro selbst erzeugter kWh
                </div>
              </div>
            </div>
          )}

          {/* Jährliche Kosten */}
          {(annualMaintenanceEUR || annualInsuranceEUR) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Jährliche Betriebskosten</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {annualMaintenanceEUR && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Wartung:</span>
                    <span className="font-medium text-yellow-900">{Math.round(annualMaintenanceEUR)} €/Jahr</span>
                  </div>
                )}
                {annualInsuranceEUR && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Versicherung:</span>
                    <span className="font-medium text-yellow-900">{Math.round(annualInsuranceEUR)} €/Jahr</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Angebot anfordern Button */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Interessiert an einem individuellen Angebot?
            </h3>
            <p className="text-gray-600">
              Lassen Sie sich von unseren Experten ein maßgeschneidertes Angebot für Ihre PV-Anlage erstellen. 
              Kostenlos und unverbindlich.
            </p>
          </div>
          <button
            onClick={() => setShowQuoteModal(true)}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            Kostenloses Angebot anfordern
          </button>
        </div>
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        pvData={{
          // Grunddaten
          roofType: pvCalculatorData?.roofType,
          roofTilt: pvCalculatorData?.roofTilt,
          annualConsumption: pvCalculatorData?.annualConsumption,
          electricityPrice: pvCalculatorData?.electricityPrice,
          
          // Dachflächen
          roofFaces: pvCalculatorData?.roofFaces,
          
          // System-Konfiguration
          totalKWp,
          annualPV,
          batteryKWh: pvCalculatorData?.batteryKWh,
          
          // E-Auto Daten
          evData: pvCalculatorData?.evData,
          
          // Wärmepumpe
          heatPumpConsumption: pvCalculatorData?.heatPumpConsumption,
          
          // Berechnungsergebnisse
          autarkie,
          eigenverbrauch,
          annualSavings: einsparungJahrEUR,
          co2Savings: co2SavingsTons,
          paybackTime: financialMetrics?.paybackTimeYears,
        }}
      />
    </div>
  );
}

export default StepErgebnisse;
