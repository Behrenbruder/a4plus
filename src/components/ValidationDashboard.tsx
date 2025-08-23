'use client';

import React, { useState, useEffect } from 'react';
import { 
  ValidationResult, 
  ValidationReport, 
  ABTestResult,
  generateSamplePlantData,
  validateHybridCalculation,
  generateValidationReport,
  runABTest,
  RealPlantData
} from '@/lib/validation';

interface ValidationDashboardProps {
  className?: string;
}

export default function ValidationDashboard({ className = '' }: ValidationDashboardProps) {
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [abTestResult, setAbTestResult] = useState<ABTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'abtest'>('overview');

  // Lade Beispieldaten und führe Validierung durch
  const runValidation = async () => {
    setIsLoading(true);
    try {
      // Generiere Beispieldaten (in der Realität würden hier echte Anlagendaten geladen)
      const sampleData = generateSamplePlantData(50);
      
      // Führe Validierung durch
      const results = sampleData.map(validateHybridCalculation);
      const report = generateValidationReport(results);
      
      setValidationReport(report);
    } catch (error) {
      console.error('Fehler bei der Validierung:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Führe A/B-Test durch
  const runABTestComparison = async () => {
    setIsLoading(true);
    try {
      const sampleData = generateSamplePlantData(30);
      
      // Methode A: Hybrid-Ansatz
      const methodA = (data: RealPlantData) => validateHybridCalculation(data);
      
      // Methode B: Vereinfachte Faktor-basierte Berechnung (Simulation)
      const methodB = (data: RealPlantData) => {
        // Simuliere eine einfachere Berechnungsmethode
        const pvToConsumptionRatio = data.actualAnnualPVKWh / data.actualAnnualConsumptionKWh;
        let baseSelfConsumption = 0.3;
        if (pvToConsumptionRatio <= 0.5) baseSelfConsumption = 0.8;
        else if (pvToConsumptionRatio <= 1.0) baseSelfConsumption = 0.6;
        else baseSelfConsumption = 0.4;
        
        // Batterie-Bonus
        if (data.batteryCapacityKWh && data.batteryCapacityKWh > 0) {
          baseSelfConsumption += 0.15;
        }
        
        const calculatedSelfConsumption = Math.min(0.95, baseSelfConsumption) * 100;
        const calculatedAutarky = Math.min(0.95, (data.actualAnnualPVKWh * baseSelfConsumption) / data.actualAnnualConsumptionKWh) * 100;
        
        const autarkyAbsolute = Math.abs(calculatedAutarky - data.actualAutarkyPercent);
        const selfConsumptionAbsolute = Math.abs(calculatedSelfConsumption - data.actualSelfConsumptionPercent);
        
        let quality: 'excellent' | 'good' | 'acceptable' | 'poor';
        if (autarkyAbsolute <= 3 && selfConsumptionAbsolute <= 2) quality = 'excellent';
        else if (autarkyAbsolute <= 5 && selfConsumptionAbsolute <= 3) quality = 'good';
        else if (autarkyAbsolute <= 10 && selfConsumptionAbsolute <= 7) quality = 'acceptable';
        else quality = 'poor';
        
        return {
          plantId: data.plantId,
          calculated: { autarkyPercent: calculatedAutarky, selfConsumptionPercent: calculatedSelfConsumption },
          actual: { autarkyPercent: data.actualAutarkyPercent, selfConsumptionPercent: data.actualSelfConsumptionPercent },
          deviations: {
            autarkyAbsolute,
            autarkyRelative: Math.abs((calculatedAutarky - data.actualAutarkyPercent) / data.actualAutarkyPercent) * 100,
            selfConsumptionAbsolute,
            selfConsumptionRelative: Math.abs((calculatedSelfConsumption - data.actualSelfConsumptionPercent) / data.actualSelfConsumptionPercent) * 100,
          },
          quality,
          plantData: data,
        };
      };
      
      const abResult = runABTest(
        sampleData,
        methodA,
        methodB,
        'Hybrid vs. Faktor-basiert',
        'Hybrid-Ansatz',
        'Faktor-basiert'
      );
      
      setAbTestResult(abResult);
    } catch (error) {
      console.error('Fehler beim A/B-Test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'acceptable': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Exzellent';
      case 'good': return 'Gut';
      case 'acceptable': return 'Akzeptabel';
      case 'poor': return 'Schlecht';
      default: return quality;
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Validierung läuft...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Validierung Hybrid-Ansatz</h2>
        <p className="text-gray-600">
          Vergleich der Hybrid-Berechnung mit realen Anlagendaten und A/B-Tests
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Übersicht' },
            { id: 'details', label: 'Details' },
            { id: 'abtest', label: 'A/B-Test' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && validationReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500">Anlagen gesamt</div>
              <div className="text-2xl font-bold text-gray-900">{validationReport.summary.totalPlants}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500">Ø Autarkie-Abweichung</div>
              <div className="text-2xl font-bold text-gray-900">
                {validationReport.summary.averageAutarkyDeviation.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500">Ø Eigenverbrauch-Abweichung</div>
              <div className="text-2xl font-bold text-gray-900">
                {validationReport.summary.averageSelfConsumptionDeviation.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500">R² Autarkie</div>
              <div className="text-2xl font-bold text-gray-900">
                {validationReport.summary.r2Autarky.toFixed(3)}
              </div>
            </div>
          </div>

          {/* Quality Distribution */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Qualitätsverteilung</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { quality: 'excellent', count: validationReport.summary.excellentCount, label: 'Exzellent' },
                { quality: 'good', count: validationReport.summary.goodCount, label: 'Gut' },
                { quality: 'acceptable', count: validationReport.summary.acceptableCount, label: 'Akzeptabel' },
                { quality: 'poor', count: validationReport.summary.poorCount, label: 'Schlecht' },
              ].map((item) => (
                <div key={item.quality} className={`p-3 rounded-lg ${getQualityColor(item.quality)}`}>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xl font-bold">{item.count}</div>
                  <div className="text-xs">
                    {((item.count / validationReport.summary.totalPlants) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {validationReport.recommendations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-amber-800 mb-2">Empfehlungen</h3>
              <ul className="space-y-1">
                {validationReport.recommendations.map((rec, index) => (
                  <li key={index} className="text-amber-700 text-sm">• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={runValidation}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Validierung wiederholen
            </button>
            <button
              onClick={runABTestComparison}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              A/B-Test starten
            </button>
          </div>
        </div>
      )}

      {/* Details Tab */}
      {selectedTab === 'details' && validationReport && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Detaillierte Ergebnisse</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Anlage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualität
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Autarkie (Ist/Berechnet)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eigenverbrauch (Ist/Berechnet)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Abweichungen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {validationReport.results.slice(0, 20).map((result) => (
                    <tr key={result.plantId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.plantId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(result.quality)}`}>
                          {getQualityLabel(result.quality)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.actual.autarkyPercent.toFixed(1)}% / {result.calculated.autarkyPercent.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.actual.selfConsumptionPercent.toFixed(1)}% / {result.calculated.selfConsumptionPercent.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ±{result.deviations.autarkyAbsolute.toFixed(1)}% / ±{result.deviations.selfConsumptionAbsolute.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {validationReport.results.length > 20 && (
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
                Zeige 20 von {validationReport.results.length} Anlagen
              </div>
            )}
          </div>
        </div>
      )}

      {/* A/B Test Tab */}
      {selectedTab === 'abtest' && (
        <div className="space-y-6">
          {!abTestResult ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Noch kein A/B-Test durchgeführt</p>
              <button
                onClick={runABTestComparison}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                A/B-Test starten
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{abTestResult.testName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {abTestResult.comparison.methodABetter}
                    </div>
                    <div className="text-sm text-gray-500">{abTestResult.methodA} besser</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {abTestResult.comparison.methodBBetter}
                    </div>
                    <div className="text-sm text-gray-500">{abTestResult.methodB} besser</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {abTestResult.comparison.significanceLevel < 0.1 ? 'Signifikant' : 'Nicht signifikant'}
                    </div>
                    <div className="text-sm text-gray-500">p = {abTestResult.comparison.significanceLevel.toFixed(3)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">{abTestResult.methodA}</h4>
                  <div className="text-sm text-gray-600">
                    Durchschnittliche Verbesserung: {abTestResult.comparison.averageImprovementA.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">{abTestResult.methodB}</h4>
                  <div className="text-sm text-gray-600">
                    Durchschnittliche Verbesserung: {abTestResult.comparison.averageImprovementB.toFixed(2)}%
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
