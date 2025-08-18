import Image from "next/image";

export default function AufsatzkastenPage() {
  return (
    <>
      <h1 className="h2">Aufsatzkasten Raffstore</h1>
      <p className="muted">Auf das Fenster aufgesetzt – sauberer Bauablauf, sehr gut kombinierbar mit neuen Fenstern.</p>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100">
          <Image src="/images/raffstore/aufsatzkasten.jpg" alt="Aufsatzkasten" fill className="object-cover" />
        </div>
        <div>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>integrierte Lösung beim Fenstertausch</li>
            <li>gute Wärmedämmanschlüsse</li>
            <li>einfache Wartung, Motor/Funk</li>
          </ul>
        </div>
      </div>
    </>
  );
}
