'use client';

export function StepPrices({
  priceCt,
  feedinCt,
  onNext,
}: {
  priceCt?: number;
  feedinCt?: number;
  onNext: (vals: { priceCt: number; feedinCt: number }) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-600">Strompreis (ct/kWh)</label>
        <input
          type="number"
          defaultValue={priceCt ?? 35}
          onBlur={(e) => onNext({ priceCt: Number(e.target.value || 0), feedinCt: feedinCt ?? 8 })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">Einspeisevergütung (ct/kWh)</label>
        <input
          type="number"
          defaultValue={feedinCt ?? 8.2}
          onBlur={(e) => onNext({ priceCt: priceCt ?? 35, feedinCt: Number(e.target.value || 0) })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <p className="md:col-span-2 text-xs text-gray-500">
        Tipp: Du kannst einfach in ein Feld klicken und mit „Weiter“ bestätigen.
      </p>
    </div>
  );
}
