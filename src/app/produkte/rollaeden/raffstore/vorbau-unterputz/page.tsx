import Image from "next/image";

export default function VorbauUnterputzPage() {
  return (
    <>
      <h1 className="h2">Vorbau Unterputz Raffstore</h1>
      <p className="muted">Unsichtbar integriert – ideal für Neubau und energetische Sanierung mit klarer Fassadenoptik.</p>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100">
          <Image src="/images/raffstore/vorbau-unterputz.jpg" alt="Vorbau Unterputz" fill className="object-cover" />
        </div>
        <div>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Unterputz‑Kasten – nahezu unsichtbare Lösung</li>
            <li>sehr gute Dämm‑/Dichtdetails möglich</li>
            <li>Lamellen variabel, Motor/Funk</li>
          </ul>
        </div>
      </div>
    </>
  );
}
