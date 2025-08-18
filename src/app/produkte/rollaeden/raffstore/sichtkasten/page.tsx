import Image from "next/image";

export default function SichtkastenPage() {
  return (
    <>
      <h1 className="h2">Sichtkasten Raffstore</h1>
      <p className="muted">Klassischer Vorbaukasten – flexibel in der Nachrüstung, sichtbar als Gestaltungselement.</p>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100">
          <Image src="/images/raffstore/sichtkasten.jpg" alt="Sichtkasten" fill className="object-cover" />
        </div>
        <div>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>schnell nachrüstbar</li>
            <li>verschiedene Kastenformen und Farben</li>
            <li>Lamellenbreiten und Führungen wählbar</li>
          </ul>
        </div>
      </div>
    </>
  );
}
