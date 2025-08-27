import { HybridConflictResult } from './hybrid-conflict-detector';
import { FoerderProgram } from './foerder-parsers';
import { sendEmail } from './email-service';

// Interface für Förder-Scan Ergebnisse
interface FoerderScanResult {
  id: string;
  user_email?: string;
  user_name?: string;
  scan_type: string;
  total_programs: number;
  conflicts_found: number;
  conflicts: HybridConflictResult[];
  programs: Array<{
    program: FoerderProgram;
    source: string;
  }>;
  created_at: string;
}

// E-Mail-Konfiguration
const EMAIL_CONFIG = {
  from: process.env.SMTP_FROM || process.env.COMPANY_EMAIL || 'info@a4plus.eu',
  notificationEmail: process.env.NOTIFICATION_EMAIL || 'info@a4plus.eu',
  companyName: process.env.COMPANY_NAME || 'A4Plus',
  companyPhone: process.env.COMPANY_PHONE || '+49 (0) 123 456789',
  companyAddress: process.env.COMPANY_ADDRESS || 'Musterstraße 1, 12345 Musterstadt',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
};

/**
 * Sendet eine erweiterte Benachrichtigung über Förder-Konflikte mit KI-Analyse
 */
export async function sendFoerderConflictNotificationEmail(
  scanResult: FoerderScanResult
): Promise<void> {
  const subject = `🚨 Förder-Konflikte erkannt - ${scanResult.conflicts_found} Konflikte gefunden`;
  
  const textContent = createTextContent(scanResult);
  const htmlContent = createHtmlContent(scanResult);

  console.log('📧 Förder-Konflikt Benachrichtigung an', EMAIL_CONFIG.notificationEmail);
  console.log('Betreff:', subject);

  await sendEmail({
    to: EMAIL_CONFIG.notificationEmail,
    from: EMAIL_CONFIG.from,
    subject: subject,
    text: textContent,
    html: htmlContent
  });
}

/**
 * Erstellt den Text-Inhalt der E-Mail
 */
function createTextContent(scanResult: FoerderScanResult): string {
  let content = `
Förder-Monitoring System - Konflikt-Benachrichtigung

SCAN-ÜBERSICHT:
Scan-ID: ${scanResult.id}
Scan-Typ: ${scanResult.scan_type}
Zeitpunkt: ${new Date(scanResult.created_at).toLocaleString('de-DE')}
Programme gescannt: ${scanResult.total_programs}
Konflikte gefunden: ${scanResult.conflicts_found}
${scanResult.user_email ? `Benutzer: ${scanResult.user_name || 'Unbekannt'} (${scanResult.user_email})` : ''}

KONFLIKT-DETAILS:
`;

  scanResult.conflicts.forEach((conflict, index) => {
    content += `
--- KONFLIKT ${index + 1} ---
Typ: ${conflict.conflictType}
Schweregrad: ${conflict.severity}
${conflict.confidence ? `KI-Konfidenz: ${(conflict.confidence * 100).toFixed(1)}%` : ''}

Regel-basierte Analyse:
${conflict.ruleBasedAnalysis.summary || 'Keine Details verfügbar'}

${conflict.aiAnalysis ? `
KI-Analyse:
${conflict.aiAnalysis.explanation}

Empfehlung:
${conflict.aiAnalysis.recommendation}

Wichtige Unterschiede:
${conflict.aiAnalysis.keyDifferences.map(diff => `• ${diff}`).join('\n')}
` : 'KI-Analyse nicht verfügbar'}

Zusammenfassung: ${conflict.summary}
`;
  });

  content += `
VERWALTUNG:
Admin-Link: ${EMAIL_CONFIG.baseUrl}/admin/foerder-review/${scanResult.id}

---
Diese E-Mail wurde automatisch vom Förder-Monitoring System generiert.
${EMAIL_CONFIG.companyName}
`;

  return content;
}

/**
 * Erstellt den HTML-Inhalt der E-Mail
 */
function createHtmlContent(scanResult: FoerderScanResult): string {
  const conflictsHtml = scanResult.conflicts.map((conflict, index) => 
    createConflictHtml(conflict, index + 1)
  ).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin-bottom: 10px;">
            🚨 Förder-Konflikte erkannt
          </h1>
          <p style="color: #6b7280; font-size: 16px; margin: 0;">
            ${scanResult.conflicts_found} Konflikte in ${scanResult.total_programs} Programmen gefunden
          </p>
        </div>

        <!-- Scan-Übersicht -->
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
          <h2 style="color: #d97706; margin-top: 0; margin-bottom: 15px;">📊 Scan-Übersicht</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p><strong>Scan-ID:</strong> ${scanResult.id}</p>
            <p><strong>Scan-Typ:</strong> ${scanResult.scan_type}</p>
            <p><strong>Zeitpunkt:</strong> ${new Date(scanResult.created_at).toLocaleString('de-DE')}</p>
            <p><strong>Programme:</strong> ${scanResult.total_programs}</p>
            ${scanResult.user_email ? `<p><strong>Benutzer:</strong> ${scanResult.user_name || 'Unbekannt'}</p>` : ''}
            ${scanResult.user_email ? `<p><strong>E-Mail:</strong> ${scanResult.user_email}</p>` : ''}
          </div>
        </div>

        <!-- Konflikte -->
        <div style="margin-bottom: 25px;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">🔍 Konflikt-Details</h2>
          ${conflictsHtml}
        </div>

        <!-- Admin-Bereich -->
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="color: #0369a1; margin-top: 0;">Verwaltung</h3>
          <p style="margin-bottom: 20px;">Überprüfen Sie die Konflikte im Admin-Bereich:</p>
          <a href="${EMAIL_CONFIG.baseUrl}/admin/foerder-review/${scanResult.id}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
            🔧 Admin-Bereich öffnen
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Diese E-Mail wurde automatisch vom Förder-Monitoring System generiert<br>
          ${EMAIL_CONFIG.companyName} • ${EMAIL_CONFIG.companyAddress} • ${EMAIL_CONFIG.companyPhone}
        </div>
      </div>
    </div>
  `;
}

/**
 * Erstellt HTML für einen einzelnen Konflikt
 */
function createConflictHtml(conflict: HybridConflictResult, conflictNumber: number): string {
  const severityColor = getSeverityColor(conflict.severity);
  const severityIcon = getSeverityIcon(conflict.severity);
  
  return `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
      
      <!-- Konflikt-Header -->
      <div style="background-color: ${severityColor}; color: white; padding: 15px;">
        <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
          ${severityIcon} Konflikt ${conflictNumber}: ${conflict.conflictType}
          <span style="background-color: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: normal;">
            ${conflict.severity}
          </span>
          ${conflict.confidence ? `
            <span style="background-color: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: normal;">
              KI: ${(conflict.confidence * 100).toFixed(0)}%
            </span>
          ` : ''}
        </h3>
      </div>

      <div style="padding: 20px;">
        
        <!-- Regel-basierte Analyse -->
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h4 style="color: #475569; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            ⚙️ Regel-basierte Analyse
          </h4>
          <p style="margin: 0; color: #64748b;">
            ${conflict.ruleBasedAnalysis.summary || 'Keine Details verfügbar'}
          </p>
        </div>

        ${conflict.aiAnalysis ? `
          <!-- KI-Analyse -->
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <h4 style="color: #1e40af; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              🤖 KI-Analyse (GPT-4o Mini)
            </h4>
            <p style="margin-bottom: 10px; color: #1e40af;">
              <strong>Erklärung:</strong><br>
              ${conflict.aiAnalysis.explanation}
            </p>
            
            ${conflict.aiAnalysis.keyDifferences.length > 0 ? `
              <div style="margin-bottom: 10px;">
                <strong style="color: #1e40af;">Wichtige Unterschiede:</strong>
                <ul style="margin: 5px 0; padding-left: 20px; color: #1e40af;">
                  ${conflict.aiAnalysis.keyDifferences.map(diff => `<li>${diff}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <!-- KI-Empfehlung -->
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
            <h4 style="color: #059669; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              💡 KI-Empfehlung
            </h4>
            <p style="margin: 0; color: #059669;">
              ${conflict.aiAnalysis.recommendation}
            </p>
          </div>
        ` : `
          <!-- Keine KI-Analyse -->
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px;">
            <p style="margin: 0; color: #d97706; font-style: italic;">
              ℹ️ KI-Analyse nicht verfügbar - nur regel-basierte Erkennung verwendet
            </p>
          </div>
        `}
      </div>
    </div>
  `;
}

/**
 * Gibt die Farbe für den Schweregrad zurück
 */
function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'HIGH': return '#dc2626';
    case 'MEDIUM': return '#f59e0b';
    case 'LOW': return '#10b981';
    default: return '#6b7280';
  }
}

/**
 * Gibt das Icon für den Schweregrad zurück
 */
function getSeverityIcon(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'HIGH': return '🔴';
    case 'MEDIUM': return '🟡';
    case 'LOW': return '🟢';
    default: return '⚪';
  }
}

/**
 * Sendet eine Zusammenfassung der Förder-Scan Ergebnisse
 */
export async function sendFoerderScanSummaryEmail(
  scanResult: FoerderScanResult
): Promise<void> {
  const subject = scanResult.conflicts_found > 0 
    ? `📊 Förder-Scan abgeschlossen - ${scanResult.conflicts_found} Konflikte gefunden`
    : `✅ Förder-Scan abgeschlossen - Keine Konflikte gefunden`;
  
  const textContent = `
Förder-Monitoring System - Scan-Zusammenfassung

ERGEBNIS:
${scanResult.conflicts_found > 0 ? '⚠️ Konflikte gefunden' : '✅ Keine Konflikte'}
Programme gescannt: ${scanResult.total_programs}
Konflikte gefunden: ${scanResult.conflicts_found}
Scan-Typ: ${scanResult.scan_type}
Zeitpunkt: ${new Date(scanResult.created_at).toLocaleString('de-DE')}

${scanResult.conflicts_found > 0 ? `
KONFLIKT-ÜBERSICHT:
${scanResult.conflicts.map((conflict, index) => `
${index + 1}. ${conflict.conflictType} (${conflict.severity})
   ${conflict.aiAnalysis ? `KI-Konfidenz: ${(conflict.aiAnalysis.confidence * 100).toFixed(0)}%` : 'Regel-basiert'}
   ${conflict.summary}
`).join('')}

Detaillierte Analyse: ${EMAIL_CONFIG.baseUrl}/admin/foerder-review/${scanResult.id}
` : `
Alle gescannten Programme sind konsistent und weisen keine Konflikte auf.
`}

---
${EMAIL_CONFIG.companyName} Förder-Monitoring System
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: ${scanResult.conflicts_found > 0 ? '#f59e0b' : '#10b981'}; margin-bottom: 10px;">
            ${scanResult.conflicts_found > 0 ? '📊 Förder-Scan abgeschlossen' : '✅ Förder-Scan erfolgreich'}
          </h1>
          <p style="color: #6b7280; font-size: 16px; margin: 0;">
            ${scanResult.conflicts_found > 0 
              ? `${scanResult.conflicts_found} Konflikte in ${scanResult.total_programs} Programmen gefunden`
              : `${scanResult.total_programs} Programme gescannt - Keine Konflikte`
            }
          </p>
        </div>

        <div style="background-color: ${scanResult.conflicts_found > 0 ? '#fef3c7' : '#ecfdf5'}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: ${scanResult.conflicts_found > 0 ? '#d97706' : '#059669'}; margin-top: 0;">
            ${scanResult.conflicts_found > 0 ? '⚠️ Konflikte gefunden' : '✅ Scan erfolgreich'}
          </h2>
          <p><strong>Programme gescannt:</strong> ${scanResult.total_programs}</p>
          <p><strong>Konflikte gefunden:</strong> ${scanResult.conflicts_found}</p>
          <p><strong>Scan-Typ:</strong> ${scanResult.scan_type}</p>
          <p><strong>Zeitpunkt:</strong> ${new Date(scanResult.created_at).toLocaleString('de-DE')}</p>
        </div>

        ${scanResult.conflicts_found > 0 ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151;">Konflikt-Übersicht</h3>
            ${scanResult.conflicts.map((conflict, index) => `
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid ${getSeverityColor(conflict.severity)};">
                <strong>${index + 1}. ${conflict.conflictType}</strong>
                <span style="background-color: ${getSeverityColor(conflict.severity)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 8px;">
                  ${conflict.severity}
                </span>
                ${conflict.confidence ? `
                  <span style="background-color: #3b82f6; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 4px;">
                    KI: ${(conflict.confidence * 100).toFixed(0)}%
                  </span>
                ` : ''}
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
                  ${conflict.summary}
                </p>
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; background-color: #f0f9ff; padding: 20px; border-radius: 8px;">
            <p style="margin-bottom: 15px;">Detaillierte Analyse im Admin-Bereich:</p>
            <a href="${EMAIL_CONFIG.baseUrl}/admin/foerder-review/${scanResult.id}" 
               style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              🔍 Konflikte analysieren
            </a>
          </div>
        ` : `
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="color: #059669; margin-top: 0;">🎉 Alles in Ordnung!</h3>
            <p style="color: #059669; margin: 0;">
              Alle gescannten Programme sind konsistent und weisen keine Konflikte auf.
            </p>
          </div>
        `}

        <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          ${EMAIL_CONFIG.companyName} Förder-Monitoring System<br>
          Automatisch generiert am ${new Date().toLocaleString('de-DE')}
        </div>
      </div>
    </div>
  `;

  console.log('📧 Förder-Scan Zusammenfassung an', EMAIL_CONFIG.notificationEmail);

  await sendEmail({
    to: EMAIL_CONFIG.notificationEmail,
    from: EMAIL_CONFIG.from,
    subject: subject,
    text: textContent,
    html: htmlContent
  });
}

// Export der E-Mail-Konfiguration
export { EMAIL_CONFIG };
