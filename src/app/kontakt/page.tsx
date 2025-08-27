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
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="h1">Kontakt & Angebot</h1>
            <p className="muted mt-2 text-responsive">Beschreiben Sie kurz Ihr Projekt – wir melden uns zeitnah.</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Kontaktformular */}
            <div className="order-2 lg:order-1">
              <form action={send} className="space-y-4 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input 
                    name="name" 
                    required 
                    placeholder="Ihr Name" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                  />
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="Ihre E-Mail" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                  />
                </div>
                
                {/* Produktkategorien-Auswahl */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="block text-sm sm:text-base font-medium text-gray-700">
                    Welche Produkte interessieren Sie? (Mehrfachauswahl möglich)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer touch-spacing bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input type="checkbox" name="product_pv" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <span className="text-sm sm:text-base">☀️ PV-Anlagen</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer touch-spacing bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input type="checkbox" name="product_speicher" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <span className="text-sm sm:text-base">🔋 Speicher</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer touch-spacing bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input type="checkbox" name="product_waermepumpe" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <span className="text-sm sm:text-base">🌡️ Wärmepumpen</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer touch-spacing bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input type="checkbox" name="product_fenster" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <span className="text-sm sm:text-base">🪟 Fenster</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer touch-spacing bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input type="checkbox" name="product_tueren" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <span className="text-sm sm:text-base">🚪 Türen</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer touch-spacing bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input type="checkbox" name="product_daemmung" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <span className="text-sm sm:text-base">🏠 Dämmung</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer touch-spacing bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors sm:col-span-2">
                      <input type="checkbox" name="product_rollaeden" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                      <span className="text-sm sm:text-base">🎚️ Rollläden & Blinos-Rollos</span>
                    </label>
                  </div>
                </div>
                
                <textarea 
                  name="message" 
                  required 
                  placeholder="Ihr Anliegen" 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[120px] sm:min-h-[140px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-vertical"
                ></textarea>
                
                <button className="btn-primary w-full sm:w-auto" type="submit">
                  Absenden
                </button>
              </form>
            </div>
            
            {/* Kontaktinformationen */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="card touch-spacing">
                <h3 className="h3 mb-4">Direkter Kontakt</h3>
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600">📧</span>
                    <a href="mailto:info@a4plus.eu" className="hover:text-emerald-600 transition-colors">
                      info@a4plus.eu
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600">📞</span>
                    <a href="tel:+4962333798860" className="hover:text-emerald-600 transition-colors">
                      +49 6233 3798860
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 mt-0.5">📍</span>
                    <div className="text-gray-600">
                      Carl-Zeiss-Straße 5<br/>
                      67227 Frankenthal
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card p-0 overflow-hidden">
                <LocationMap 
                  address="Carl-Zeiss-Straße 5, 67227 Frankenthal" 
                  className="h-64 sm:h-80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
