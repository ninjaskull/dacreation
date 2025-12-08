import nodemailer from 'nodemailer';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { storage } from './storage';
import type { SmtpSettings, EmailTemplate, CompanySettings } from '@shared/schema';

const ALGORITHM = 'aes-256-cbc';

function getEncryptionKey(): string {
  const key = process.env.SMTP_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP_ENCRYPTION_KEY environment variable is required in production');
    }
    console.warn('[email] Warning: SMTP_ENCRYPTION_KEY not set. Using development fallback. Set SMTP_ENCRYPTION_KEY for production.');
    return 'dev-only-encryption-key-not-secure';
  }
  return key;
}

function deriveKey(salt: Buffer): Buffer {
  return scryptSync(getEncryptionKey(), salt, 32);
}

export function encryptPassword(password: string): string {
  const iv = randomBytes(16);
  const salt = randomBytes(16);
  const key = deriveKey(salt);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Format: iv:salt:ciphertext
  return iv.toString('hex') + ':' + salt.toString('hex') + ':' + encrypted;
}

export function decryptPassword(encryptedPassword: string): string {
  try {
    const parts = encryptedPassword.split(':');
    
    // Handle new format: iv:salt:ciphertext
    if (parts.length === 3) {
      const [ivHex, saltHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const salt = Buffer.from(saltHex, 'hex');
      const key = deriveKey(salt);
      const decipher = createDecipheriv(ALGORITHM, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    
    // Handle legacy format: iv:ciphertext (for backward compatibility)
    if (parts.length === 2) {
      const [ivHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      // Use a fixed legacy salt for old encrypted passwords
      const legacySalt = Buffer.from('salt');
      const key = scryptSync(getEncryptionKey(), legacySalt, 32);
      const decipher = createDecipheriv(ALGORITHM, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    
    // Not encrypted, return as-is
    return encryptedPassword;
  } catch {
    return encryptedPassword;
  }
}

export function isPasswordEncrypted(password: string): boolean {
  const parts = password.split(':');
  // New format: iv:salt:ciphertext (3 parts)
  if (parts.length === 3) {
    return parts[0].length === 32 && parts[1].length === 32 && /^[a-f0-9]+$/.test(parts[0]) && /^[a-f0-9]+$/.test(parts[1]);
  }
  // Legacy format: iv:ciphertext (2 parts)
  if (parts.length === 2) {
    return parts[0].length === 32 && /^[a-f0-9]+$/.test(parts[0]);
  }
  return false;
}

interface EmailTransporter {
  transporter: nodemailer.Transporter | null;
  settings: SmtpSettings | null;
}

let cachedTransporter: EmailTransporter = {
  transporter: null,
  settings: null,
};

async function getTransporter(): Promise<nodemailer.Transporter | null> {
  const settings = await storage.getSmtpSettings();
  
  if (!settings || !settings.isActive) {
    return null;
  }
  
  if (cachedTransporter.transporter && 
      cachedTransporter.settings?.id === settings.id &&
      cachedTransporter.settings?.updatedAt?.getTime() === settings.updatedAt?.getTime()) {
    return cachedTransporter.transporter;
  }
  
  const decryptedPassword = decryptPassword(settings.password);
  
  const transportConfig: nodemailer.TransportOptions = {
    host: settings.host,
    port: settings.port,
    secure: settings.encryption === 'ssl',
    auth: {
      user: settings.username,
      pass: decryptedPassword,
    },
  } as any;
  
  if (settings.encryption === 'tls') {
    (transportConfig as any).requireTLS = true;
  }
  
  const transporter = nodemailer.createTransport(transportConfig);
  
  cachedTransporter = {
    transporter,
    settings,
  };
  
  return transporter;
}

export function clearTransporterCache(): void {
  cachedTransporter = {
    transporter: null,
    settings: null,
  };
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  templateId?: string;
  type?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  logId?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const transporter = await getTransporter();
  const settings = await storage.getSmtpSettings();
  
  if (!transporter || !settings) {
    return {
      success: false,
      error: 'SMTP is not configured or disabled',
    };
  }
  
  const emailTypeSettings = await storage.getEmailTypeSettings();
  if (emailTypeSettings && options.type) {
    const typeEnabled = {
      notification: emailTypeSettings.notificationsEnabled,
      transactional: emailTypeSettings.transactionalEnabled,
      internal: emailTypeSettings.internalEnabled,
      marketing: emailTypeSettings.marketingEnabled,
      reminder: emailTypeSettings.reminderEnabled,
    }[options.type];
    
    if (typeEnabled === false) {
      return {
        success: false,
        error: `Email type '${options.type}' is disabled`,
      };
    }
  }
  
  const log = await storage.createEmailLog({
    templateId: options.templateId || null,
    recipientEmail: options.to,
    recipientName: options.toName || null,
    subject: options.subject,
    type: options.type || 'notification',
  });
  
  try {
    const result = await transporter.sendMail({
      from: `"${settings.senderName}" <${settings.senderEmail}>`,
      to: options.toName ? `"${options.toName}" <${options.to}>` : options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });
    
    await storage.updateEmailLogStatus(log.id, 'sent');
    
    return {
      success: true,
      messageId: result.messageId,
      logId: log.id,
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';
    await storage.updateEmailLogStatus(log.id, 'failed', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      logId: log.id,
    };
  }
}

export async function testSmtpConnection(testEmail: string): Promise<{ success: boolean; message: string }> {
  const transporter = await getTransporter();
  const settings = await storage.getSmtpSettings();
  
  if (!transporter || !settings) {
    return {
      success: false,
      message: 'SMTP is not configured',
    };
  }
  
  try {
    await transporter.verify();
    
    await transporter.sendMail({
      from: `"${settings.senderName}" <${settings.senderEmail}>`,
      to: testEmail,
      subject: 'SMTP Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">SMTP Test Successful!</h2>
          <p>Your SMTP configuration is working correctly.</p>
          <p style="color: #666; font-size: 12px;">This is an automated test email from your email settings.</p>
        </div>
      `,
      text: 'SMTP Test Successful! Your SMTP configuration is working correctly.',
    });
    
    await storage.updateSmtpTestResult(settings.id, 'success');
    
    return {
      success: true,
      message: 'Test email sent successfully',
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Connection failed';
    await storage.updateSmtpTestResult(settings.id, `failed: ${errorMessage}`);
    
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export function renderTemplate(
  template: EmailTemplate,
  variables: Record<string, string>,
  companySettings?: CompanySettings | null
): { subject: string; html: string; text: string } {
  let subject = template.subject;
  let html = template.htmlContent;
  let text = template.textContent || '';
  
  const allVariables: Record<string, string> = {
    ...variables,
  };
  
  let baseUrl = '';
  
  if (companySettings?.website) {
    baseUrl = companySettings.website.replace(/\/$/, '');
  } else if (process.env.APP_ORIGIN) {
    baseUrl = process.env.APP_ORIGIN.replace(/\/$/, '');
  } else {
    const replitDomains = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
    if (replitDomains) {
      const primaryDomain = replitDomains.split(',')[0];
      baseUrl = `https://${primaryDomain}`;
    }
  }
  
  const makeAbsoluteUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (!baseUrl) return '';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  };
  
  const companyName = companySettings?.name || 'Our Team';
  const logoWhitePath = companySettings?.logoWhite || '/images/logo-white.webp';
  const logoWhiteFullUrl = makeAbsoluteUrl(logoWhitePath);
  const logoFullUrl = makeAbsoluteUrl(companySettings?.logo || '');
  
  allVariables['company_name'] = logoWhiteFullUrl
    ? `<img src="${logoWhiteFullUrl}" alt="${companyName}" style="max-height: 60px; width: auto;" />`
    : `<h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${companyName}</h1>`;
  allVariables['company_name_text'] = companyName;
  allVariables['company_email'] = companySettings?.email || '';
  allVariables['company_phone'] = companySettings?.phone || '';
  allVariables['company_address'] = companySettings?.address || '';
  allVariables['company_website'] = companySettings?.website || baseUrl || '';
  allVariables['company_logo'] = logoFullUrl || companyName;
  allVariables['company_logo_white'] = logoWhiteFullUrl || companyName;
  
  allVariables['current_year'] = new Date().getFullYear().toString();
  allVariables['current_date'] = new Date().toLocaleDateString();
  
  for (const [key, value] of Object.entries(allVariables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    subject = subject.replace(regex, value);
    html = html.replace(regex, value);
    text = text.replace(regex, value.replace(/<[^>]*>/g, ''));
  }
  
  return { subject, html, text };
}

export async function sendTemplatedEmail(
  templateKey: string,
  to: string,
  toName: string | undefined,
  variables: Record<string, string>
): Promise<SendEmailResult> {
  const template = await storage.getEmailTemplateByKey(templateKey);
  
  if (!template) {
    return {
      success: false,
      error: `Template '${templateKey}' not found`,
    };
  }
  
  if (!template.isActive) {
    return {
      success: false,
      error: `Template '${templateKey}' is disabled`,
    };
  }
  
  const companySettings = await storage.getCompanySettings();
  const rendered = renderTemplate(template, variables, companySettings);
  
  return sendEmail({
    to,
    toName,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateId: template.id,
    type: template.type,
  });
}
