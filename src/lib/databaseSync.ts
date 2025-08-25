import { createClient } from '@supabase/supabase-js';
import { createGoogleSheetsService } from './googleSheets';

// Datenbank-Synchronisation Service
export class DatabaseSyncService {
  private supabase;
  private googleSheets;

  constructor() {
    // Supabase Client initialisieren
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase Umgebungsvariablen nicht konfiguriert');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Google Sheets Service initialisieren
    const googleSheetsService = createGoogleSheetsService();
    if (!googleSheetsService) {
      throw new Error('Google Sheets Service konnte nicht initialisiert werden');
    }
    this.googleSheets = googleSheetsService;
  }

  // Synchronisiere alle Tabellen
  async syncAllTables(): Promise<{ success: boolean; results: any[] }> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const results = [];

    try {
      // Synchronisiere Kunden
      const customersResult = await this.syncCustomers();
      results.push({ table: 'customers', ...customersResult });

      // Synchronisiere PV-Angebote
      const pvQuotesResult = await this.syncPvQuotes();
      results.push({ table: 'pv_quotes', ...pvQuotesResult });

      // Synchronisiere Installateure
      const installersResult = await this.syncInstallers();
      results.push({ table: 'installers', ...installersResult });

      // Synchronisiere E-Mail-Logs
      const emailLogsResult = await this.syncEmailLogs();
      results.push({ table: 'email_logs', ...emailLogsResult });

      // Synchronisiere Projekte
      const projectsResult = await this.syncProjects();
      results.push({ table: 'projects', ...projectsResult });

      const allSuccessful = results.every(r => r.success);
      
      return {
        success: allSuccessful,
        results
      };
    } catch (error) {
      console.error('Fehler bei der Synchronisation:', error);
      return {
        success: false,
        results: [...results, { error: error instanceof Error ? error.message : String(error) }]
      };
    }
  }

  // Synchronisiere Kunden-Tabelle
  async syncCustomers(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'id',
        'created_at',
        'updated_at',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'postal_code',
        'notes',
        'status'
      ];

      // Formatiere Daten für Google Sheets
      const formattedData = data?.map(row => ({
        id: row.id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone || '',
        address: row.address || '',
        city: row.city || '',
        postal_code: row.postal_code || '',
        notes: row.notes || '',
        status: row.status
      })) || [];

      await this.googleSheets!.syncDataToSheet('Kunden', formattedData, headers);

      return { success: true, count: formattedData.length };
    } catch (error) {
      console.error('Fehler beim Synchronisieren der Kunden:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Synchronisiere PV-Angebote-Tabelle
  async syncPvQuotes(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('pv_quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'id',
        'created_at',
        'updated_at',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'postal_code',
        'roof_type',
        'roof_tilt_deg',
        'annual_consumption_kwh',
        'electricity_price_ct_per_kwh',
        'total_kwp',
        'annual_pv_kwh',
        'battery_kwh',
        'ev_km_per_year',
        'ev_kwh_per_100km',
        'ev_home_charging_share',
        'ev_charger_power_kw',
        'heat_pump_consumption_kwh',
        'autarkie_pct',
        'eigenverbrauch_pct',
        'annual_savings_eur',
        'co2_savings_tons',
        'payback_time_years',
        'status',
        'notes'
      ];

      // Formatiere Daten für Google Sheets
      const formattedData = data?.map(row => ({
        id: row.id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone || '',
        address: row.address || '',
        city: row.city || '',
        postal_code: row.postal_code || '',
        roof_type: row.roof_type || '',
        roof_tilt_deg: row.roof_tilt_deg || '',
        annual_consumption_kwh: row.annual_consumption_kwh || '',
        electricity_price_ct_per_kwh: row.electricity_price_ct_per_kwh || '',
        total_kwp: row.total_kwp || '',
        annual_pv_kwh: row.annual_pv_kwh || '',
        battery_kwh: row.battery_kwh || '',
        ev_km_per_year: row.ev_km_per_year || '',
        ev_kwh_per_100km: row.ev_kwh_per_100km || '',
        ev_home_charging_share: row.ev_home_charging_share || '',
        ev_charger_power_kw: row.ev_charger_power_kw || '',
        heat_pump_consumption_kwh: row.heat_pump_consumption_kwh || '',
        autarkie_pct: row.autarkie_pct || '',
        eigenverbrauch_pct: row.eigenverbrauch_pct || '',
        annual_savings_eur: row.annual_savings_eur || '',
        co2_savings_tons: row.co2_savings_tons || '',
        payback_time_years: row.payback_time_years || '',
        status: row.status,
        notes: row.notes || ''
      })) || [];

      await this.googleSheets!.syncDataToSheet('PV-Angebote', formattedData, headers);

      return { success: true, count: formattedData.length };
    } catch (error) {
      console.error('Fehler beim Synchronisieren der PV-Angebote:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Synchronisiere Installateure-Tabelle
  async syncInstallers(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('installers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'id',
        'created_at',
        'updated_at',
        'first_name',
        'last_name',
        'email',
        'phone',
        'specialties',
        'status',
        'hourly_rate',
        'notes'
      ];

      // Formatiere Daten für Google Sheets
      const formattedData = data?.map(row => ({
        id: row.id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone || '',
        specialties: Array.isArray(row.specialties) ? row.specialties.join(', ') : '',
        status: row.status,
        hourly_rate: row.hourly_rate || '',
        notes: row.notes || ''
      })) || [];

      await this.googleSheets!.syncDataToSheet('Installateure', formattedData, headers);

      return { success: true, count: formattedData.length };
    } catch (error) {
      console.error('Fehler beim Synchronisieren der Installateure:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Synchronisiere E-Mail-Logs-Tabelle
  async syncEmailLogs(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('email_logs')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1000); // Begrenze auf die letzten 1000 E-Mails

      if (error) throw error;

      const headers = [
        'id',
        'created_at',
        'customer_name',
        'customer_email',
        'subject',
        'direction',
        'status',
        'sender_email',
        'recipient_email'
      ];

      // Formatiere Daten für Google Sheets
      const formattedData = data?.map(row => ({
        id: row.id,
        created_at: row.created_at,
        customer_name: row.customers ? `${row.customers.first_name} ${row.customers.last_name}` : '',
        customer_email: row.customers?.email || '',
        subject: row.subject,
        direction: row.direction,
        status: row.status,
        sender_email: row.sender_email,
        recipient_email: row.recipient_email
      })) || [];

      await this.googleSheets!.syncDataToSheet('E-Mail-Logs', formattedData, headers);

      return { success: true, count: formattedData.length };
    } catch (error) {
      console.error('Fehler beim Synchronisieren der E-Mail-Logs:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Synchronisiere Projekte-Tabelle
  async syncProjects(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email
          ),
          installers (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = [
        'id',
        'created_at',
        'updated_at',
        'customer_name',
        'customer_email',
        'installer_name',
        'installer_email',
        'title',
        'description',
        'status',
        'start_date',
        'end_date',
        'estimated_cost',
        'actual_cost'
      ];

      // Formatiere Daten für Google Sheets
      const formattedData = data?.map(row => ({
        id: row.id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        customer_name: row.customers ? `${row.customers.first_name} ${row.customers.last_name}` : '',
        customer_email: row.customers?.email || '',
        installer_name: row.installers ? `${row.installers.first_name} ${row.installers.last_name}` : '',
        installer_email: row.installers?.email || '',
        title: row.title,
        description: row.description || '',
        status: row.status,
        start_date: row.start_date || '',
        end_date: row.end_date || '',
        estimated_cost: row.estimated_cost || '',
        actual_cost: row.actual_cost || ''
      })) || [];

      await this.googleSheets!.syncDataToSheet('Projekte', formattedData, headers);

      return { success: true, count: formattedData.length };
    } catch (error) {
      console.error('Fehler beim Synchronisieren der Projekte:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Teste die Verbindungen
  async testConnections(): Promise<{ supabase: boolean; googleSheets: boolean }> {
    const results = {
      supabase: false,
      googleSheets: false
    };

    try {
      // Teste Supabase Verbindung
      const { error } = await this.supabase.from('customers').select('count').limit(1);
      results.supabase = !error;
    } catch (error) {
      console.error('Supabase Verbindungstest fehlgeschlagen:', error);
    }

    try {
      // Teste Google Sheets Verbindung
      results.googleSheets = await this.googleSheets!.testConnection();
    } catch (error) {
      console.error('Google Sheets Verbindungstest fehlgeschlagen:', error);
    }

    return results;
  }
}

// Hilfsfunktion zum Erstellen der Service-Instanz
export function createDatabaseSyncService(): DatabaseSyncService | null {
  try {
    return new DatabaseSyncService();
  } catch (error) {
    console.error('Fehler beim Erstellen des DatabaseSyncService:', error);
    return null;
  }
}
