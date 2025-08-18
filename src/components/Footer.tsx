import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-16">
      <div className="container py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-semibold mb-3">{site.name}</div>
          <p className="muted">{site.tagline}</p>
          <p className="mt-3 text-sm">
            {site.address}<br/>
            Tel. {site.phone}<br/>
            <a href={`mailto:${site.email}`} className="underline">{site.email}</a>
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3">Leistungen</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/produkte">Produkte</Link></li>
            <li><Link href="/pv-rechner">PV-Rechner</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Rechtliches</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/impressum">Impressum</Link></li>
            <li><Link href="/datenschutz">Datenschutz</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="container py-4 text-xs text-gray-500">
          © {new Date().getFullYear()} {site.name}. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
