import { revalidatePath } from "next/cache";
import LocationMap from "@/components/LocationMap";

async function send(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const message = String(formData.get("message") || "");
  console.log({ name, email, message }); // TODO: Mailversand integrieren (Resend/SMTP)
  revalidatePath("/kontakt");
}

export default function KontaktPage() {
  return (
    <div className="section">
      <div className="container grid md:grid-cols-2 gap-10">
        <div>
          <h1 className="h1">Kontakt & Angebot</h1>
          <p className="muted mt-2">Beschreiben Sie kurz Ihr Projekt – wir melden uns zeitnah.</p>
          <form action={send} className="mt-6 space-y-4">
            <input name="name" required placeholder="Ihr Name" className="w-full border rounded-xl px-4 py-3" />
            <input type="email" name="email" required placeholder="Ihre E-Mail" className="w-full border rounded-xl px-4 py-3" />
            <textarea name="message" required placeholder="Ihr Anliegen" className="w-full border rounded-xl px-4 py-3 min-h-[140px]"></textarea>
            <button className="btn-primary" type="submit">Absenden</button>
          </form>
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <div className="font-semibold">Direkter Kontakt</div>
            <p className="mt-2 text-sm">
              E-Mail: info@a4plus.eu<br/>
              Telefon: +49 6233 3798860<br/>
              <span className="text-gray-600">Carl-Zeiss-Straße 5<br/>67227 Frankenthal</span>
            </p>
          </div>
          <div className="card p-0 overflow-hidden">
            <LocationMap 
              address="Carl-Zeiss-Straße 5, 67227 Frankenthal" 
              className="h-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
