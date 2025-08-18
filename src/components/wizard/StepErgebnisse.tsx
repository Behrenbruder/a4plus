'use client';

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
}: Props) {
  return (
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
  );
}

export default StepErgebnisse;
