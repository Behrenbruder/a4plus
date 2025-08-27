export default function DatenschutzPage() {
  return (
    <div className="section">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">Datenschutzerklärung</h1>
        
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">Einleitung</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Wir freuen uns über Ihr Interesse an ArtePlus e.K. und darüber, dass Sie unsere Website besuchen.
            </p>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Mit den nachfolgend dargestellten Informationen geben wir Ihnen einen Überblick über die Verarbeitung Ihrer personenbezogenen Daten auf unserer Webseite 
              <a href="https://www.a4plus.eu" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">https://www.a4plus.eu</a> (nachfolgend &ldquo;Webseite&rdquo;).
            </p>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Die Verarbeitung Ihrer personenbezogenen Daten durch uns erfolgt stets im Einklang mit der Datenschutzgrundverordnung (nachfolgend &ldquo;DSGVO&rdquo;), 
              dem Gesetz über den Datenschutz und den Schutz der Privatsphäre in der Telekommunikation und bei digitalen Diensten (nachfolgend &ldquo;TDDDG&rdquo;) 
              sowie allen geltenden landesspezifischen Datenschutzbestimmungen.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">1. Verantwortlichkeit</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Verantwortlich im Sinne der DSGVO ist:
            </p>
            <div className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg">
              <strong>ArtePlus e.K.</strong><br/>
              Inhaber: Benno Behr<br/>
              Carl-Zeiss-Str. 5<br/>
              67227 Frankenthal<br/>
              E-Mail: <a href="mailto:info@a4plus.eu" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">info@a4plus.eu</a><br/>
              Telefon: +49 (0) 6233 37988-0
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">2. Begriffsbestimmung</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Diese Datenschutzerklärung beruht auf den Begrifflichkeiten der DSGVO. Zur Vereinfachung möchten wir Ihnen einige in diesem Zusammenhang wichtige Begriffe näher erläutern:
            </p>
            <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-2 text-sm sm:text-base text-gray-700">
              <li><strong>Personenbezogene Daten:</strong> Alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen.</li>
              <li><strong>Betroffene Person:</strong> Jede identifizierte oder identifizierbare natürliche Person, deren personenbezogene Daten verarbeitet werden.</li>
              <li><strong>Verarbeitung:</strong> Jeder Vorgang im Zusammenhang mit personenbezogenen Daten, wie das Erheben, Erfassen, die Organisation, das Ordnen, die Speicherung, die Anpassung oder Veränderung, das Auslesen, das Abfragen, die Verwendung, die Offenlegung durch Übermittlung, Verbreitung oder eine andere Form der Bereitstellung, den Abgleich oder die Verknüpfung, die Einschränkung, das Löschen oder die Vernichtung.</li>
              <li><strong>Einwilligung:</strong> Jede von der betroffenen Person freiwillig für den bestimmten Fall in informierter Weise und unmissverständlich abgegebene Willensbekundung in Form einer Erklärung oder einer sonstigen eindeutigen bestätigenden Handlung.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">3. Bereitstellung der Website und Server-Logfiles</h2>
            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">3.1 Umfang der Verarbeitung</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Bei jedem Aufruf unserer Website werden automatisch Informationen erfasst, die Ihr Browser an unseren Server übermittelt. Diese werden in sogenannten Server-Logfiles gespeichert. Erfasst werden können:
            </p>
            <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 text-sm sm:text-base text-gray-700">
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL (zuvor besuchte Webseite)</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Datum und Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">3.2 Zweck der Verarbeitung</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Die Verarbeitung erfolgt zu folgenden Zwecken:
            </p>
            <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 text-sm sm:text-base text-gray-700">
              <li>Bereitstellung unserer Webseite</li>
              <li>Gewährleistung eines reibungslosen Verbindungsaufbaus</li>
              <li>Gewährleistung der Systemsicherheit und -stabilität</li>
              <li>Aufklärung von Missbrauchs- oder Betrugshandlungen</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">3.3 Rechtsgrundlage</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Die Rechtsgrundlage für die Datenverarbeitung ist unser berechtigtes Interesse im Sinne des Art. 6 Abs. 1 S. 1 lit. f) DSGVO.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">3.4 Speicherdauer</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Die Logfiles werden aus Sicherheitsgründen für die Dauer von maximal 7 Tagen gespeichert und danach gelöscht.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">4. Einsatz von Cookies</h2>
            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">4.1 Allgemeine Informationen</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Wir setzen auf unserer Webseite Cookies ein. Dabei handelt es sich um kleine Dateien, die Ihr Browser automatisch erstellt und die auf Ihrem IT-System gespeichert werden, wenn Sie unsere Seite besuchen.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">4.2 Essenzielle Cookies</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Wir setzen essenzielle Cookies ein, die technisch erforderlich sind, um alle Funktionen unserer Webseite zur Verfügung zu stellen. 
              Die Rechtsgrundlage ist unser berechtigtes Interesse im Sinne des Art. 6 Abs. 1 S. 1 lit. f) DSGVO.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">4.3 Nicht essenzielle Cookies</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Wir setzen darüber hinaus auch nicht essenzielle Cookies (z. B. Analyse-Cookies) ein. 
              Die Rechtsgrundlage ist Ihre Einwilligung gem. Art. 6 Abs. 1 S. 1 lit. a) DSGVO.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">5. PV-Rechner und Kontaktformulare</h2>
            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">5.1 Umfang der Verarbeitung</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Über unsere Website haben Sie die Möglichkeit, unseren PV-Rechner zu nutzen und mit uns über Kontaktformulare in Kontakt zu treten. 
              Dabei verarbeiten wir folgende personenbezogene Daten:
            </p>
            <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 text-sm sm:text-base text-gray-700">
              <li>Vor- und Nachname</li>
              <li>Anschrift</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer</li>
              <li>Dachform und Eigenschaften Ihres Hauses</li>
              <li>Anzahl der Personen im Haushalt</li>
              <li>Stromverbrauchsverhalten</li>
              <li>Eigentümereigenschaft</li>
              <li>Bilder Ihres Hauses (optional)</li>
              <li>Daten zu Ihrem Stromverbrauch</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">5.2 Zweck der Verarbeitung</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Wir verarbeiten Ihre Daten zur Berechnung Ihrer möglichen Ersparnis durch eine PV-Anlage, zur Erstellung eines individuellen Angebots und zur Kontaktaufnahme mit Ihnen.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">5.3 Rechtsgrundlage</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. b) DSGVO, da die Berechnung im Zuge der Anbahnung eines Vertrags geschieht.
            </p>

            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-800">5.4 Speicherdauer</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Wir löschen Ihre personenbezogenen Daten, sobald sie für die Erreichung des Zweckes der Erhebung nicht mehr erforderlich sind. 
              Im Rahmen von Kontaktanfragen ist dies grundsätzlich dann der Fall, wenn sich aus den Umständen ergibt, dass der konkrete Sachverhalt abschließend bearbeitet ist.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">6. Empfänger personenbezogener Daten</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Eine Weitergabe der von uns erhobenen Daten erfolgt grundsätzlich nur, wenn hierfür eine datenschutzrechtliche Rechtsgrundlage vorliegt. 
              Empfänger können sein:
            </p>
            <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 text-sm sm:text-base text-gray-700">
              <li>Interne Stellen soweit zur Aufgabenabwicklung erforderlich</li>
              <li>IT-Dienstleister und Hosting-Provider</li>
              <li>Handwerkspartner für die Installation</li>
              <li>Öffentliche Stellen aufgrund gesetzlicher Vorschriften</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">7. Datenübermittlung in Drittländer</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Soweit wir personenbezogene Daten in Staaten außerhalb der EU übermitteln, stellen wir sicher, dass ein angemessenes Datenschutzniveau gewährleistet ist. 
              Dies erfolgt durch Angemessenheitsbeschlüsse der EU-Kommission oder durch geeignete Garantien wie Standardvertragsklauseln.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">8. Speicherdauer</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Wir verarbeiten Ihre personenbezogenen Daten solange dies für die Zweckerfüllung erforderlich ist. 
              Die Daten werden gelöscht, sobald sie für ihre Zweckbestimmung nicht mehr erforderlich sind und der Löschung keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Wir unterliegen verschiedenen Aufbewahrungs- und Dokumentationspflichten, die sich unter anderem aus dem Handelsgesetzbuch (HGB) und der Abgabenordnung (AO) ergeben. 
              Die dort vorgeschriebenen Fristen zur Aufbewahrung bzw. Dokumentation betragen zwei bis zehn Jahre.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">9. Ihre Rechte</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Ihnen stehen folgende Rechte zu:
            </p>
            <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-2 text-sm sm:text-base text-gray-700">
              <li><strong>Recht auf Auskunft (Art. 15 DSGVO):</strong> Sie haben das Recht, Auskunft über die zu Ihrer Person gespeicherten Daten zu erhalten.</li>
              <li><strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Sie haben das Recht, die Berichtigung unrichtiger Daten zu verlangen.</li>
              <li><strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Sie haben das Recht, die Löschung Ihrer Daten zu verlangen.</li>
              <li><strong>Recht auf Einschränkung (Art. 18 DSGVO):</strong> Sie haben das Recht, die Einschränkung der Verarbeitung zu verlangen.</li>
              <li><strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie haben das Recht, Ihre Daten in einem strukturierten Format zu erhalten.</li>
              <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie haben das Recht, der Verarbeitung zu widersprechen.</li>
              <li><strong>Widerruf der Einwilligung:</strong> Sie können Ihre Einwilligung jederzeit widerrufen.</li>
            </ul>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: 
              <a href="mailto:info@a4plus.eu" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">info@a4plus.eu</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">10. Beschwerde bei einer Aufsichtsbehörde</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde über unsere Verarbeitung personenbezogener Daten zu beschweren. 
              Die für uns zuständige Aufsichtsbehörde ist:
            </p>
            <div className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg">
              Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz<br/>
              Hintere Bleiche 34<br/>
              55116 Mainz<br/>
              Telefon: +49 (0) 6131 208-2449<br/>
              E-Mail: poststelle@datenschutz.rlp.de
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">11. SSL-Verschlüsselung</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. 
              Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von &ldquo;http://&rdquo; auf &ldquo;https://&rdquo; wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">12. Änderungen der Datenschutzerklärung</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700">
              Gelegentlich aktualisieren wir diese Datenschutzerklärung, beispielsweise wenn wir unsere Website anpassen oder sich die gesetzlichen Vorgaben ändern. 
              Die jeweils aktuelle Datenschutzerklärung können Sie jederzeit hier abrufen.
            </p>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 pt-4 border-t">
            <p><strong>Stand:</strong> August 2025</p>
            <p className="mt-2">
              Bei Fragen zum Datenschutz wenden Sie sich gerne an: 
              <a href="mailto:info@a4plus.eu" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors ml-1">info@a4plus.eu</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
