import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL
});

async function createTables() {
  try {
    console.log('Creating missing tables in Neon database...');
    
    // Create smtp_settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS smtp_settings (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        host TEXT NOT NULL,
        port INTEGER NOT NULL DEFAULT 587,
        encryption TEXT NOT NULL DEFAULT 'tls',
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_tested_at TIMESTAMP,
        last_test_result TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✓ Created smtp_settings table');

    // Create email_templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        template_key TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL DEFAULT 'notification',
        subject TEXT NOT NULL,
        html_content TEXT NOT NULL,
        text_content TEXT,
        variables TEXT[],
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✓ Created email_templates table');

    // Create email_type_settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_type_settings (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email_type TEXT NOT NULL UNIQUE,
        is_enabled BOOLEAN NOT NULL DEFAULT true,
        template_id VARCHAR,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✓ Created email_type_settings table');

    // Create email_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email_type TEXT NOT NULL,
        template_id VARCHAR,
        recipient_email TEXT NOT NULL,
        recipient_name TEXT,
        subject TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        error_message TEXT,
        metadata JSONB,
        sent_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✓ Created email_logs table');

    // Add missing columns to company_settings
    await pool.query(`
      ALTER TABLE company_settings 
      ADD COLUMN IF NOT EXISTS whatsapp_number TEXT
    `);
    console.log('✓ Added whatsapp_number column to company_settings');

    console.log('\n✓ All tables created successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

createTables();
