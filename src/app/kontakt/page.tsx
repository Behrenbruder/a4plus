import { revalidatePath } from "next/cache";
import LocationMap from "@/components/LocationMap";
import { ProductInterest } from "@/lib/crm-types";

async function send(formData: FormData) {
  "use server";
  
  console.log('📝 Kontaktformular-Submission gestartet');
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const message = String(formData.get("message") || "");
  
  // Produktinteressen aus dem Formular extrahieren
  const productInterests: ProductInterest[] = [];
  const allProductInterests: ProductInterest[] = ['pv', 'speicher', 'waermepumpe', 'fenster', 'tueren', 'daemmung', 'rollaeden'];
  
  allProductInterests.forEach(product => {
    if (formData.get(`product_${product}`) === 'on') {
      productInterests.push(product);
    }
  });
  
  try {
    // CRM-Integration
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let customerId = null;

    // Prüfe ob bereits ein Kunde mit dieser E-Mail existiert
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single();

    if (!existingCustomer) {
      // Erstelle neuen CRM-Lead
      const crmLeadData = {
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        email: email,
        country: 'Deutschland',
        lead_status: 'neu', // Enum-Wert
        lead_source: 'Kontaktformular',
        estimated_value: null,
        probability: 25, // Standard für Kontaktformular
        product_interests: productInterests, // Ausgewählte Produktinteressen
        priority: 3, // Normale Priorität
        tags: ['kontaktformular', 'website'],
        notes: `Kontaktformular-Anfrage: ${message}`,
        gdpr_consent: true,
        marketing_consent: false
      };

      const { data: crmLead, error: crmError } = await supabase
        .from('customers')
        .insert([crmLeadData])
        .select()
        .single();

      if (crmError) {
        console.error('Fehler beim Erstellen des CRM-Leads:', crmError);
      } else {
        customerId = crmLead.id;
        console.log('CRM-Lead erfolgreich erstellt:', crmLead.id);
      }
    } else {
      customerId = existingCustomer.id;
      console.log('Kunde existiert bereits im CRM:', existingCustomer.id);
    }

    // Erstelle Kontakt-Historie Eintrag
    if (customerId) {
      await supabase
        .from('contact_history')
        .insert([{
          customer_id: customerId,
          contact_type: 'website_formular',
          subject: 'Kontaktformular-Anfrage',
          content: message,
          direction: 'inbound',
          metadata: {
            form_type: 'kontaktformular',
            customer_name: name
          }
        }]);
    }

    // E-Mail-Benachrichtigung senden
    const { sendCustomerInquiryNotificationEmail, sendCustomerInquiryConfirmationEmail } = await import('@/lib/email-notifications');
    
    const customerData = {
      id: customerId?.toString() || Date.now().toString(),
      first_name: name.split(' ')[0] || name,
      last_name: name.split(' ').slice(1).join(' ') || '',
      email: email,
      message: message,
      inquiry_type: 'Kontaktformular',
      created_at: new Date().toISOString()
    };

    // Benachrichtigung an info@a4plus.eu
    await sendCustomerInquiryNotificationEmail(customerData);
    
    // Bestätigung an Kunden
    await sendCustomerInquiryConfirmationEmail(customerData);
    
    console.log('✅ Kontaktformular erfolgreich versendet und im CRM gespeichert:', { name, email, customerId });
  } catch (error) {
    console.error('❌ Fehler beim Verarbeiten der Kontaktformular-Anfrage:', error);
    // Fehler nicht an den Benutzer weiterleiten, da das Formular trotzdem funktionieren soll
  }
  
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
            
            {/* Produktkategorien-Auswahl */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Welche Produkte interessieren Sie? (Mehrfachauswahl möglich)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="product_pv" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm">☀️ PV-Anlagen</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="product_speicher" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm">🔋 Speicher</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="product_waermepumpe" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm">🌡️ Wärmepumpen</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="product_fenster" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm">🪟 Fenster</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="product_tueren" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm">🚪 Türen</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="product_daemmung" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm">🏠 Dämmung</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="product_rollaeden" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm">🎚️ Rolläden</span>
                </label>
              </div>
            </div>
            
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
