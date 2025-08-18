import Image from "next/image";

export default function RetroluxPage() {
  return (
    <>
      <h1 className="h2">RETROLux Tageslichtraffstore</h1>
      <p className="muted">Maximale Tageslichtlenkung, Blendfreiheit und Hitzeschutz – ideal für anspruchsvolle Fassaden.</p>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100">
          <Image src="/images/raffstore/retrolux.jpg" alt="RETROLux" fill className="object-cover" />
        </div>
        <div>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>spezielles Lamellendesign für Tageslichtlenkung</li>
            <li>guter Sichtschutz bei hoher Durchsicht</li>
            <li>verschiedene Führungssysteme, Motor/Funk</li>
            <li>breite Farbpalette (RAL)</li>
          </ul>
        </div>
      </div>
    </>
  );
}
