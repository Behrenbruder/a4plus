export default function ImpressumPage() {
  return (
    <div className="section">
      <div className="container prose max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 TMG</h2>
            <p className="mb-4">
              <strong>ArtePlus e.K.</strong><br/>
              Inhaber: Benno Behr<br/>
              Carl-Zeiss-Str. 5<br/>
              67227 Frankenthal
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
            <p className="mb-4">
              <strong>Telefon:</strong> +49 (0) 6233 37988-0<br/>
              <strong>Fax:</strong> +49 (0) 6233 37988-47<br/>
              <strong>E-Mail:</strong> <a href="mailto:info@a4plus.eu" className="text-blue-600 hover:underline">info@a4plus.eu</a><br/>
              <strong>Website:</strong> <a href="https://www.a4plus.eu" className="text-blue-600 hover:underline">www.a4plus.eu</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Handelsregister</h2>
            <p className="mb-4">
              <strong>Registergericht:</strong> Amtsgericht Frankenthal<br/>
              <strong>Registernummer:</strong> HRA 60040<br/>
              <strong>Umsatzsteuer-ID:</strong> DE 148 430 418
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Verantwortlich für den Inhalt nach § 6 MDStV</h2>
            <p className="mb-4">
              Benno Behr<br/>
              ArtePlus e.K.<br/>
              Carl-Zeiss-Str. 5<br/>
              67227 Frankenthal
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">EU-Streitschlichtung</h2>
            <p className="mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mb-4">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p className="mb-4">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Haftungsausschluss</h2>
            
            <h3 className="text-lg font-medium mb-2">Haftung für Inhalte</h3>
            <p className="mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. 
              Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="mb-4">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. 
              Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. 
              Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>

            <h3 className="text-lg font-medium mb-2">Haftung für Links</h3>
            <p className="mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. 
              Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. 
              Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p className="mb-4">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. 
              Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Urheberrecht</h2>
            <p className="mb-4">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. 
              Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. 
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className="mb-4">
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. 
              Insbesondere werden Inhalte Dritter als solche gekennzeichnet. 
              Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. 
              Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
          </div>

          <div className="text-sm text-gray-500 mt-8 pt-4 border-t">
            <p>Stand: August 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
