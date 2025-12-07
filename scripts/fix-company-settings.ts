import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

async function fixCompanySettings() {
  try {
    console.log('Adding missing columns to company_settings...');
    
    const columns = [
      { name: 'name', type: 'TEXT' },
      { name: 'city', type: 'TEXT' },
      { name: 'country', type: 'TEXT' },
      { name: 'website', type: 'TEXT' },
      { name: 'tax_id', type: 'TEXT' },
      { name: 'logo', type: 'TEXT' },
      { name: 'currency', type: "TEXT NOT NULL DEFAULT 'INR'" },
      { name: 'timezone', type: "TEXT NOT NULL DEFAULT 'Asia/Kolkata'" },
      { name: 'fiscal_year_start', type: "TEXT NOT NULL DEFAULT '04'" },
      { name: 'map_embed_code', type: 'TEXT' },
      { name: 'top_bar_address', type: 'TEXT' },
      { name: 'secondary_address', type: 'TEXT' },
      { name: 'social_media', type: "JSONB DEFAULT '[]'" },
      { name: 'number_of_events_held', type: 'INTEGER DEFAULT 0' },
      { name: 'ratings', type: 'INTEGER DEFAULT 0' },
      { name: 'weddings_count', type: 'INTEGER DEFAULT 0' },
      { name: 'corporate_count', type: 'INTEGER DEFAULT 0' },
      { name: 'social_count', type: 'INTEGER DEFAULT 0' },
      { name: 'awards_count', type: 'INTEGER DEFAULT 0' },
      { name: 'destinations_count', type: 'INTEGER DEFAULT 0' },
      { name: 'happy_guests_count', type: 'INTEGER DEFAULT 0' },
      { name: 'client_satisfaction', type: 'INTEGER DEFAULT 0' },
      { name: 'updated_at', type: 'TIMESTAMP NOT NULL DEFAULT NOW()' },
    ];

    for (const col of columns) {
      try {
        await pool.query(`ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        console.log(`✓ Added ${col.name}`);
      } catch (e: any) {
        if (e.code === '42701') {
          console.log(`• ${col.name} already exists`);
        } else {
          console.log(`✗ Failed to add ${col.name}: ${e.message}`);
        }
      }
    }

    console.log('\n✓ All columns added!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixCompanySettings();
