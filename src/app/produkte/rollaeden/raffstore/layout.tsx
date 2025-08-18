import Link from "next/link";

export default function RaffstoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-screen-xl mx-auto px-6 space-y-8">
      {/* Back-Bar */}
      <nav className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3 flex flex-wrap items-center gap-2">
        <Link
          href="/produkte/rollaeden#raffstore"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          <span aria-hidden>←</span> Zur Übersicht (Raffstore)
        </Link>

        <span className="mx-1 hidden sm:inline text-gray-300">|</span>

        <Link
          href="/produkte/rollaeden#blinos"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Blinos‑Rollos
        </Link>

        <span className="mx-1 hidden sm:inline text-gray-300">|</span>

        <Link
          href="/kontakt"
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Angebot anfordern
        </Link>
      </nav>

      {children}
    </div>
  );
}
