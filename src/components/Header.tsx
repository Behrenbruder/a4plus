import Link from "next/link";
import { LogoBadge } from "@/components/LogoBadge";


export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <LogoBadge className="text-[0.8em]" />

        {/* Navigation */}
        <nav className="flex gap-6 text-sm font-medium text-gray-700">
          {/* Produkte Dropdown */}
          <div className="relative group">
            <Link
              href="/produkte"
              className="hover:text-emerald-600 inline-flex items-center gap-1 px-2 py-1"
              aria-haspopup="true"
            >
              Produkte
              <svg className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.04 1.08l-4.24 3.36a.75.75 0 01-.94 0L5.21 8.31a.75.75 0 01.02-1.1z" />
              </svg>
            </Link>

            {/* Dropdown Menu - positioned to expand down and right, with boundary detection */}
            <div className="absolute top-full left-0 z-50 pointer-events-none group-hover:pointer-events-auto">
              <div
                className="invisible opacity-0 pointer-events-auto
                           group-hover:visible group-hover:opacity-100
                           focus-within:visible focus-within:opacity-100
                           mt-2 w-[720px] max-w-[calc(100vw-2rem)] 
                           rounded-2xl border border-gray-100 bg-white shadow-xl 
                           transition-all duration-200 ease-out
                           transform translate-x-0 
                           xl:translate-x-0 lg:translate-x-0 md:translate-x-[-50%] sm:translate-x-[-75%]"
                style={{
                  left: 'clamp(-50vw, 0px, calc(100vw - 720px - 2rem))'
                }}
                role="menu"
                aria-label="Produktkategorien"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                  <DropdownLink href="/produkte/fenster"      label="Fenster"                   desc="Kömmerling 88 / 76 AD / 76 MD, lackierte Profile" />
                  <DropdownLink href="/produkte/tueren"       label="Türen"                     desc="Haustüren, Nebeneingang, Schiebe-/Hebeschiebe" />
                  <DropdownLink href="/produkte/daemmung"     label="Dämmung"                   desc="Fassade, Dach, Kellerdecke" />
                  <DropdownLink href="/produkte/pv"           label="PV‑Anlagen"                desc="Planung, Montage, Förderung" />
                  <DropdownLink href="/produkte/batterie"     label="Batteriespeicher"          desc="Kapazitäten, Kompatibilität" />
                  <DropdownLink href="/produkte/waermepumpen" label="Wärmepumpen"               desc="Luft/Wasser, Hybrid" />
                  <DropdownLink href="/produkte/rollaeden"    label="Rollläden & Blinos‑Rollos" desc="Nachrüstung, Hitzeschutz" />
                </div>
              </div>
            </div>
          </div>

          <Link href="/pv-rechner" className="hover:text-emerald-600 px-2 py-1">PV-Rechner</Link>
          <Link href="/faq-foerderungen" className="hover:text-emerald-600 px-2 py-1">Förder-Check</Link>
          <Link href="/ueber-uns" className="hover:text-emerald-600 px-2 py-1">Über uns</Link>
          <Link href="/kontakt" className="hover:text-emerald-600 px-2 py-1">Kontakt</Link>
        </nav>
      </div>
    </header>
  );
}

function DropdownLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group/item flex flex-col gap-1 rounded-xl p-3 hover:bg-gray-50 transition"
      role="menuitem"
    >
      <span className="font-medium text-gray-900 group-hover/item:text-emerald-700">{label}</span>
      <span className="text-xs text-gray-600">{desc}</span>
    </Link>
  );
}
