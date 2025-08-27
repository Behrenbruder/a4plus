import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-8 sm:mt-12 lg:mt-16">
      <div className="container py-8 sm:py-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-semibold mb-3 text-base">{site.name}</div>
            <p className="muted text-sm sm:text-base mb-4">{site.tagline}</p>
            <div className="text-sm space-y-1">
              <p>{site.address}</p>
              <p>
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-emerald-600 transition-colors">
                  Tel. {site.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-emerald-600 transition-colors underline">
                  {site.email}
                </a>
              </p>
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="font-semibold mb-3 text-base">Leistungen</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/produkte" className="hover:text-emerald-600 transition-colors">
                  Produkte
                </Link>
              </li>
              <li>
                <Link href="/pv-rechner" className="hover:text-emerald-600 transition-colors">
                  PV-Rechner
                </Link>
              </li>
              <li>
                <Link href="/faq-foerderungen" className="hover:text-emerald-600 transition-colors">
                  Förder-Check
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="font-semibold mb-3 text-base">Rechtliches</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="hover:text-emerald-600 transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-emerald-600 transition-colors">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-100">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} {site.name}. Alle Rechte vorbehalten.</p>
            <div className="flex gap-4">
              <Link href="/impressum" className="hover:text-gray-700 transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="hover:text-gray-700 transition-colors">
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
