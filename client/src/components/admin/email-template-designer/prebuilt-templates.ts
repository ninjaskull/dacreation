import { EmailBlock, GlobalStyles, defaultGlobalStyles, PreBuiltTemplate } from './types';
import { generateId } from './utils';

export const prebuiltTemplates: PreBuiltTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Welcome new leads and clients to your business',
    category: 'notification',
    thumbnail: 'welcome',
    globalStyles: defaultGlobalStyles,
    blocks: [
      {
        id: generateId(),
        type: 'header',
        content: { logo: '{{company_name}}', showLogo: true, tagline: '' },
        styles: { backgroundColor: '#7c3aed', textColor: '#ffffff', padding: '24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'hero',
        content: { title: 'Welcome to {{company_name_text}}!', subtitle: 'We are thrilled to have you with us' },
        styles: { backgroundColor: '#8b5cf6', textColor: '#ffffff', padding: '48px 24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'text',
        content: { text: 'Dear {{recipient_name}},\n\nThank you for choosing us for your special occasion. We are excited to help bring your vision to life.\n\nOur team of experts will work closely with you to ensure every detail is perfect. Whether it\'s a wedding, corporate event, or social gathering, we\'ve got you covered.' },
        styles: { backgroundColor: 'transparent', textColor: '#18181b', padding: '24px', textAlign: 'left', fontSize: '16px' },
      },
      {
        id: generateId(),
        type: 'callout',
        content: { icon: 'tip', title: 'What\'s Next?', message: 'Our team will contact you within 24 hours to discuss your requirements and provide a personalized quote.' },
        styles: { backgroundColor: '#f0fdf4', textColor: '#166534', padding: '16px 24px', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'button',
        content: { text: 'Browse Our Portfolio', link: '{{company_website}}/portfolio' },
        styles: { backgroundColor: '#7c3aed', textColor: '#ffffff', padding: '24px', textAlign: 'center', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'footer',
        content: { companyName: '{{company_name_text}}', address: '{{company_address}}', email: '{{company_email}}', phone: '{{company_phone}}', copyright: '© {{current_year}} All rights reserved.' },
        styles: { backgroundColor: '#27272a', textColor: '#a1a1aa', padding: '32px 24px', textAlign: 'center', fontSize: '12px' },
      },
    ],
  },
  {
    id: 'inquiry_confirmation',
    name: 'Inquiry Confirmation',
    description: 'Confirm receipt of customer inquiries',
    category: 'transactional',
    thumbnail: 'inquiry',
    globalStyles: defaultGlobalStyles,
    blocks: [
      {
        id: generateId(),
        type: 'header',
        content: { logo: '{{company_name}}', showLogo: true, tagline: '' },
        styles: { backgroundColor: '#0891b2', textColor: '#ffffff', padding: '24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'text',
        content: { text: 'Hello {{recipient_name}},\n\nThank you for your inquiry! We have received your request and our team is reviewing it.' },
        styles: { backgroundColor: 'transparent', textColor: '#18181b', padding: '24px', textAlign: 'left', fontSize: '16px' },
      },
      {
        id: generateId(),
        type: 'callout',
        content: { icon: 'info', title: 'Your Inquiry Details', message: 'Event Type: {{event_name}}\nDate: {{event_date}}\nLocation: {{event_location}}' },
        styles: { backgroundColor: '#f0f9ff', textColor: '#0369a1', padding: '16px 24px', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'text',
        content: { text: 'We typically respond within 24-48 business hours. If you have any urgent questions, feel free to call us directly.' },
        styles: { backgroundColor: 'transparent', textColor: '#71717a', padding: '16px 24px', textAlign: 'left', fontSize: '14px' },
      },
      {
        id: generateId(),
        type: 'button',
        content: { text: 'Contact Us', link: '{{company_website}}/contact' },
        styles: { backgroundColor: '#0891b2', textColor: '#ffffff', padding: '24px', textAlign: 'center', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'footer',
        content: { companyName: '{{company_name_text}}', address: '{{company_address}}', email: '{{company_email}}', phone: '{{company_phone}}', copyright: '© {{current_year}} All rights reserved.' },
        styles: { backgroundColor: '#27272a', textColor: '#a1a1aa', padding: '32px 24px', textAlign: 'center', fontSize: '12px' },
      },
    ],
  },
  {
    id: 'appointment_confirmation',
    name: 'Appointment Confirmation',
    description: 'Confirm scheduled appointments with clients',
    category: 'transactional',
    thumbnail: 'appointment',
    globalStyles: defaultGlobalStyles,
    blocks: [
      {
        id: generateId(),
        type: 'header',
        content: { logo: '{{company_name}}', showLogo: true, tagline: '' },
        styles: { backgroundColor: '#059669', textColor: '#ffffff', padding: '24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'hero',
        content: { title: 'Appointment Confirmed!', subtitle: 'We look forward to meeting you' },
        styles: { backgroundColor: '#10b981', textColor: '#ffffff', padding: '32px 24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'text',
        content: { text: 'Dear {{recipient_name}},\n\nYour appointment has been confirmed. Here are the details:' },
        styles: { backgroundColor: 'transparent', textColor: '#18181b', padding: '24px 24px 8px', textAlign: 'left', fontSize: '16px' },
      },
      {
        id: generateId(),
        type: 'callout',
        content: { icon: 'success', title: 'Appointment Details', message: '📅 Date: {{appointment_date}}\n🕐 Time: {{appointment_time}}\n📍 Location: {{event_location}}\n👤 With: {{staff_name}}' },
        styles: { backgroundColor: '#f0fdf4', textColor: '#166534', padding: '16px 24px', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'text',
        content: { text: 'Please arrive 10 minutes early. If you need to reschedule, please contact us at least 24 hours in advance.' },
        styles: { backgroundColor: 'transparent', textColor: '#71717a', padding: '16px 24px', textAlign: 'left', fontSize: '14px' },
      },
      {
        id: generateId(),
        type: 'button',
        content: { text: 'Add to Calendar', link: '{{company_website}}' },
        styles: { backgroundColor: '#059669', textColor: '#ffffff', padding: '24px', textAlign: 'center', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'footer',
        content: { companyName: '{{company_name_text}}', address: '{{company_address}}', email: '{{company_email}}', phone: '{{company_phone}}', copyright: '© {{current_year}} All rights reserved.' },
        styles: { backgroundColor: '#27272a', textColor: '#a1a1aa', padding: '32px 24px', textAlign: 'center', fontSize: '12px' },
      },
    ],
  },
  {
    id: 'event_reminder',
    name: 'Event Reminder',
    description: 'Remind clients about upcoming events',
    category: 'reminder',
    thumbnail: 'reminder',
    globalStyles: defaultGlobalStyles,
    blocks: [
      {
        id: generateId(),
        type: 'header',
        content: { logo: '{{company_name}}', showLogo: true, tagline: '' },
        styles: { backgroundColor: '#dc2626', textColor: '#ffffff', padding: '24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'hero',
        content: { title: '⏰ Event Reminder', subtitle: 'Your event is coming up soon!' },
        styles: { backgroundColor: '#ef4444', textColor: '#ffffff', padding: '32px 24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'text',
        content: { text: 'Hello {{recipient_name}},\n\nThis is a friendly reminder that your event is approaching!' },
        styles: { backgroundColor: 'transparent', textColor: '#18181b', padding: '24px', textAlign: 'left', fontSize: '16px' },
      },
      {
        id: generateId(),
        type: 'callout',
        content: { icon: 'warning', title: 'Event Details', message: '🎉 Event: {{event_name}}\n📅 Date: {{event_date}}\n🕐 Time: {{event_time}}\n📍 Venue: {{event_location}}' },
        styles: { backgroundColor: '#fef3c7', textColor: '#92400e', padding: '16px 24px', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'list',
        content: { items: ['Confirm final guest count', 'Review timeline with coordinator', 'Prepare vendor payments', 'Arrange transportation'], listStyle: 'bullet' },
        styles: { padding: '16px 24px', textAlign: 'left' },
      },
      {
        id: generateId(),
        type: 'button',
        content: { text: 'Contact Us', link: '{{company_website}}/contact' },
        styles: { backgroundColor: '#dc2626', textColor: '#ffffff', padding: '24px', textAlign: 'center', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'footer',
        content: { companyName: '{{company_name_text}}', address: '{{company_address}}', email: '{{company_email}}', phone: '{{company_phone}}', copyright: '© {{current_year}} All rights reserved.' },
        styles: { backgroundColor: '#27272a', textColor: '#a1a1aa', padding: '32px 24px', textAlign: 'center', fontSize: '12px' },
      },
    ],
  },
  {
    id: 'payment_received',
    name: 'Payment Received',
    description: 'Confirm payment receipt to clients',
    category: 'transactional',
    thumbnail: 'payment',
    globalStyles: defaultGlobalStyles,
    blocks: [
      {
        id: generateId(),
        type: 'header',
        content: { logo: '{{company_name}}', showLogo: true, tagline: '' },
        styles: { backgroundColor: '#059669', textColor: '#ffffff', padding: '24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'hero',
        content: { title: '✓ Payment Received', subtitle: 'Thank you for your payment!' },
        styles: { backgroundColor: '#10b981', textColor: '#ffffff', padding: '32px 24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'text',
        content: { text: 'Dear {{recipient_name}},\n\nWe have received your payment. Thank you for your prompt payment!' },
        styles: { backgroundColor: 'transparent', textColor: '#18181b', padding: '24px', textAlign: 'left', fontSize: '16px' },
      },
      {
        id: generateId(),
        type: 'callout',
        content: { icon: 'success', title: 'Payment Details', message: '💰 Amount: {{amount}}\n📄 Invoice: {{invoice_number}}\n📅 Date: {{current_date}}' },
        styles: { backgroundColor: '#f0fdf4', textColor: '#166534', padding: '16px 24px', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'text',
        content: { text: 'A receipt has been generated and is available in your account. If you have any questions, please don\'t hesitate to reach out.' },
        styles: { backgroundColor: 'transparent', textColor: '#71717a', padding: '16px 24px', textAlign: 'left', fontSize: '14px' },
      },
      {
        id: generateId(),
        type: 'footer',
        content: { companyName: '{{company_name_text}}', address: '{{company_address}}', email: '{{company_email}}', phone: '{{company_phone}}', copyright: '© {{current_year}} All rights reserved.' },
        styles: { backgroundColor: '#27272a', textColor: '#a1a1aa', padding: '32px 24px', textAlign: 'center', fontSize: '12px' },
      },
    ],
  },
  {
    id: 'new_lead_alert',
    name: 'New Lead Alert (Internal)',
    description: 'Notify team members about new leads',
    category: 'internal',
    thumbnail: 'lead',
    globalStyles: defaultGlobalStyles,
    blocks: [
      {
        id: generateId(),
        type: 'header',
        content: { logo: '{{company_name}}', showLogo: true, tagline: '' },
        styles: { backgroundColor: '#f59e0b', textColor: '#ffffff', padding: '24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'hero',
        content: { title: '🔔 New Lead Received!', subtitle: 'A new inquiry has been submitted' },
        styles: { backgroundColor: '#fbbf24', textColor: '#18181b', padding: '32px 24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'callout',
        content: { icon: 'info', title: 'Lead Information', message: '👤 Name: {{recipient_name}}\n📧 Email: {{recipient_email}}\n🎉 Event: {{event_name}}\n📅 Date: {{event_date}}\n📍 Location: {{event_location}}\n📱 Source: {{lead_source}}' },
        styles: { backgroundColor: '#fef3c7', textColor: '#92400e', padding: '16px 24px', borderRadius: '8px' },
      },
      {
        id: generateId(),
        type: 'cta-banner',
        content: { title: 'Take Action Now', subtitle: 'Respond within 1 hour for best results', buttonText: 'View Lead Details', buttonLink: '{{company_website}}/admin/leads' },
        styles: { backgroundColor: '#f59e0b', textColor: '#ffffff', padding: '32px 24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'footer',
        content: { companyName: '{{company_name_text}}', address: '', email: '', phone: '', copyright: 'Internal notification - {{current_date}}' },
        styles: { backgroundColor: '#27272a', textColor: '#a1a1aa', padding: '16px 24px', textAlign: 'center', fontSize: '12px' },
      },
    ],
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Marketing newsletter template',
    category: 'marketing',
    thumbnail: 'newsletter',
    globalStyles: { ...defaultGlobalStyles, primaryColor: '#ec4899' },
    blocks: [
      {
        id: generateId(),
        type: 'header',
        content: { logo: '{{company_name}}', showLogo: true, tagline: '' },
        styles: { backgroundColor: '#ec4899', textColor: '#ffffff', padding: '24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'hero',
        content: { title: 'Monthly Newsletter', subtitle: 'Latest updates, tips, and inspiration' },
        styles: { backgroundColor: '#f472b6', textColor: '#ffffff', padding: '48px 24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'text',
        content: { text: 'Hello {{recipient_name}},\n\nWelcome to this month\'s newsletter! We\'re excited to share our latest updates, event inspiration, and exclusive offers with you.' },
        styles: { backgroundColor: 'transparent', textColor: '#18181b', padding: '24px', textAlign: 'left', fontSize: '16px' },
      },
      {
        id: generateId(),
        type: 'divider',
        content: { style: 'solid', color: '#fce7f3', thickness: '2px' },
        styles: { padding: '8px 24px' },
      },
      {
        id: generateId(),
        type: 'columns',
        content: { leftContent: '🎊 Featured Event\n\nCheck out our latest wedding showcase featuring stunning decor and unforgettable moments.', rightContent: '💡 Planning Tips\n\nDiscover our top 10 tips for planning a stress-free event that your guests will love.' },
        styles: { padding: '24px', textAlign: 'left' },
      },
      {
        id: generateId(),
        type: 'cta-banner',
        content: { title: 'Special Offer!', subtitle: 'Book your event this month and get 15% off', buttonText: 'Book Now', buttonLink: '{{company_website}}/contact' },
        styles: { backgroundColor: '#ec4899', textColor: '#ffffff', padding: '32px 24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'social',
        content: { facebook: '', twitter: '', instagram: 'https://instagram.com', linkedin: '', youtube: '' },
        styles: { padding: '16px 24px', textAlign: 'center' },
      },
      {
        id: generateId(),
        type: 'footer',
        content: { companyName: '{{company_name_text}}', address: '{{company_address}}', email: '{{company_email}}', phone: '{{company_phone}}', unsubscribeLink: '{{company_website}}/unsubscribe', copyright: '© {{current_year}} All rights reserved.' },
        styles: { backgroundColor: '#27272a', textColor: '#a1a1aa', padding: '32px 24px', textAlign: 'center', fontSize: '12px' },
      },
    ],
  },
];

export function getTemplatesByCategory(category: string): PreBuiltTemplate[] {
  return prebuiltTemplates.filter(t => t.category === category);
}

export function getTemplateById(id: string): PreBuiltTemplate | undefined {
  return prebuiltTemplates.find(t => t.id === id);
}
