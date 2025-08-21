'use client';

import React from 'react';

export function DebugPanel({
  data,
  filename = 'pvwizard-debug.json',
  defaultOpen = true,
}: {
  data: Record<string, unknown>;
  filename?: string;
  defaultOpen?: boolean;
}) {
  const json = React.useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return '// <unserialisierbar>';
    }
  }, [data]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      alert('Debug-JSON in die Zwischenablage kopiert.');
    } catch {
      alert('Kopieren nicht möglich (Clipboard-API).');
    }
  };

  const download = () => {
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <details open={defaultOpen} className="border rounded-2xl bg-white shadow-sm">
      <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">Debug – State & Ergebnisse</span>
        <span className="text-xs text-gray-500">auf/zu</span>
      </summary>

      <div className="px-4 pb-4 flex items-center gap-2">
        <button onClick={copy} className="px-3 py-1.5 rounded-md border bg-gray-50 hover:bg-gray-100 text-sm">
          Kopieren
        </button>
        <button onClick={download} className="px-3 py-1.5 rounded-md border bg-gray-50 hover:bg-gray-100 text-sm">
          Als JSON speichern
        </button>
      </div>

      <pre className="m-0 px-4 pb-4 max-h-[28rem] overflow-auto text-xs leading-5 font-mono bg-gray-900 text-gray-100 rounded-b-2xl">
{json}
      </pre>
    </details>
  );
}

export default DebugPanel;
