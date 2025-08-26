import Image from "next/image";

export function LogoBadge({ className = "" }: { className?: string }) {
  return (
      <Image
        src="/images/logo/logo.png"
        alt="a4 Plus Logo"
        width={120}      // Breite nach Bedarf anpassen
        height={40}      // Höhe nach Bedarf anpassen
        priority         // lädt das Logo bevorzugt
        className="h-auto w-auto"
      />
  );
}
