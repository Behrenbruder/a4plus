'use client';

export type RoofType = 'Flachdach' | 'Satteldach' | 'Walmdach' | 'Pultdach' | 'Mansarddach';

const OPTIONS: Array<{ label: string; type: RoofType; tilt: number }> = [
  { label: 'Flachdach',   type: 'Flachdach',   tilt: 12 },
  { label: 'Satteldach',  type: 'Satteldach',  tilt: 35 },
  { label: 'Walmdach',    type: 'Walmdach',    tilt: 30 },
  { label: 'Pultdach',    type: 'Pultdach',    tilt: 15 },
  { label: 'Mansarddach', type: 'Mansarddach', tilt: 45 },
];

export function StepRoof({
  value,
  onNext,
}: {
  value?: RoofType;
  onNext: (type: RoofType, defaultTiltDeg: number) => void;
}) {
  return (
    <div>
      <p className="text-lg mb-3">Welche Dachart hat Ihr Gebäude?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {OPTIONS.map(opt => {
          const active = value === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onNext(opt.type, opt.tilt)}
              className={[
                'px-6 py-6 rounded-2xl border transition',
                active
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              ].join(' ')}
            >
              <div className="text-lg font-medium">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">Standardneigung: {opt.tilt}°</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
