export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: Record<string, any>;
  styles: EmailBlockStyles;
}

export type EmailBlockType = 
  | 'header'
  | 'hero'
  | 'text'
  | 'image'
  | 'button'
  | 'columns'
  | 'divider'
  | 'spacer'
  | 'social'
  | 'footer'
  | 'callout'
  | 'list'
  | 'cta-banner';

export interface EmailBlockStyles {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  fontWeight?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  blocks: EmailBlock[];
  globalStyles: GlobalStyles;
}

export interface GlobalStyles {
  backgroundColor: string;
  contentBackgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  mutedTextColor: string;
  fontFamily: string;
  contentWidth: string;
}

export const defaultGlobalStyles: GlobalStyles = {
  backgroundColor: '#f4f4f5',
  contentBackgroundColor: '#ffffff',
  primaryColor: '#7c3aed',
  secondaryColor: '#8b5cf6',
  textColor: '#18181b',
  mutedTextColor: '#71717a',
  fontFamily: 'Arial, sans-serif',
  contentWidth: '600px',
};

export interface BlockDefinition {
  type: EmailBlockType;
  label: string;
  icon: string;
  category: 'structure' | 'content' | 'media' | 'action';
  defaultContent: Record<string, any>;
  defaultStyles: EmailBlockStyles;
}

export const blockDefinitions: BlockDefinition[] = [
  {
    type: 'header',
    label: 'Header',
    icon: 'layout-dashboard',
    category: 'structure',
    defaultContent: {
      logo: '{{company_logo_white}}',
      showLogo: true,
      tagline: '',
    },
    defaultStyles: {
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      padding: '24px',
      textAlign: 'center',
    },
  },
  {
    type: 'hero',
    label: 'Hero Section',
    icon: 'image',
    category: 'structure',
    defaultContent: {
      title: 'Welcome!',
      subtitle: 'We are excited to have you here.',
      backgroundImage: '',
    },
    defaultStyles: {
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      padding: '48px 24px',
      textAlign: 'center',
    },
  },
  {
    type: 'text',
    label: 'Text Block',
    icon: 'type',
    category: 'content',
    defaultContent: {
      text: 'Hello {{recipient_name}},\n\nThank you for reaching out to us. We appreciate your interest.',
    },
    defaultStyles: {
      backgroundColor: 'transparent',
      textColor: '#18181b',
      padding: '16px 24px',
      textAlign: 'left',
      fontSize: '16px',
    },
  },
  {
    type: 'image',
    label: 'Image',
    icon: 'image',
    category: 'media',
    defaultContent: {
      src: '',
      alt: 'Image',
      link: '',
      width: '100%',
    },
    defaultStyles: {
      padding: '16px 24px',
      textAlign: 'center',
    },
  },
  {
    type: 'button',
    label: 'Button',
    icon: 'mouse-pointer-click',
    category: 'action',
    defaultContent: {
      text: 'Click Here',
      link: '{{company_website}}',
    },
    defaultStyles: {
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      padding: '24px',
      textAlign: 'center',
      borderRadius: '8px',
    },
  },
  {
    type: 'columns',
    label: 'Two Columns',
    icon: 'columns',
    category: 'structure',
    defaultContent: {
      leftContent: 'Left column content',
      rightContent: 'Right column content',
    },
    defaultStyles: {
      padding: '16px 24px',
      textAlign: 'left',
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: 'minus',
    category: 'structure',
    defaultContent: {
      style: 'solid',
      color: '#e4e4e7',
      thickness: '1px',
    },
    defaultStyles: {
      padding: '16px 24px',
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: 'move-vertical',
    category: 'structure',
    defaultContent: {
      height: '32px',
    },
    defaultStyles: {},
  },
  {
    type: 'callout',
    label: 'Callout Box',
    icon: 'message-square',
    category: 'content',
    defaultContent: {
      icon: 'info',
      title: 'Important Notice',
      message: 'This is an important message for you.',
    },
    defaultStyles: {
      backgroundColor: '#fef3c7',
      textColor: '#92400e',
      padding: '16px 24px',
      borderRadius: '8px',
    },
  },
  {
    type: 'list',
    label: 'List',
    icon: 'list',
    category: 'content',
    defaultContent: {
      items: ['Item 1', 'Item 2', 'Item 3'],
      listStyle: 'bullet',
    },
    defaultStyles: {
      padding: '16px 24px',
      textAlign: 'left',
    },
  },
  {
    type: 'cta-banner',
    label: 'CTA Banner',
    icon: 'megaphone',
    category: 'action',
    defaultContent: {
      title: 'Ready to get started?',
      subtitle: 'Contact us today for more information.',
      buttonText: 'Get Started',
      buttonLink: '{{company_website}}',
    },
    defaultStyles: {
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      padding: '32px 24px',
      textAlign: 'center',
    },
  },
  {
    type: 'social',
    label: 'Social Links',
    icon: 'share-2',
    category: 'action',
    defaultContent: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
    },
    defaultStyles: {
      padding: '16px 24px',
      textAlign: 'center',
    },
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: 'layout-dashboard',
    category: 'structure',
    defaultContent: {
      companyName: '{{company_name_text}}',
      address: '{{company_address}}',
      email: '{{company_email}}',
      phone: '{{company_phone}}',
      unsubscribeLink: '',
      copyright: '© {{current_year}} All rights reserved.',
    },
    defaultStyles: {
      backgroundColor: '#27272a',
      textColor: '#a1a1aa',
      padding: '32px 24px',
      textAlign: 'center',
      fontSize: '12px',
    },
  },
];

export const templateVariables = [
  { key: 'recipient_name', label: 'Recipient Name', example: 'John Doe' },
  { key: 'recipient_email', label: 'Recipient Email', example: 'john@example.com' },
  { key: 'company_name', label: 'Company Logo (White)', example: '<img src="logo-white.png" />' },
  { key: 'company_name_text', label: 'Company Name (Text)', example: 'Da Creation' },
  { key: 'company_logo', label: 'Company Logo', example: '<img src="logo.png" />' },
  { key: 'company_logo_white', label: 'Company Logo White URL', example: 'https://...' },
  { key: 'company_email', label: 'Company Email', example: 'info@company.com' },
  { key: 'company_phone', label: 'Company Phone', example: '+91 1234567890' },
  { key: 'company_address', label: 'Company Address', example: '123 Business St.' },
  { key: 'company_website', label: 'Company Website', example: 'https://example.com' },
  { key: 'event_name', label: 'Event Name', example: 'Wedding Reception' },
  { key: 'event_date', label: 'Event Date', example: 'December 25, 2024' },
  { key: 'event_location', label: 'Event Location', example: 'Grand Ballroom' },
  { key: 'event_time', label: 'Event Time', example: '6:00 PM' },
  { key: 'amount', label: 'Amount', example: '₹50,000' },
  { key: 'invoice_number', label: 'Invoice Number', example: 'INV-2024-001' },
  { key: 'due_date', label: 'Due Date', example: 'January 15, 2025' },
  { key: 'appointment_date', label: 'Appointment Date', example: 'December 20, 2024' },
  { key: 'appointment_time', label: 'Appointment Time', example: '10:00 AM' },
  { key: 'staff_name', label: 'Staff Name', example: 'Jane Smith' },
  { key: 'lead_source', label: 'Lead Source', example: 'Website' },
  { key: 'current_year', label: 'Current Year', example: '2024' },
  { key: 'current_date', label: 'Current Date', example: 'December 13, 2024' },
];

export interface PreBuiltTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  blocks: EmailBlock[];
  globalStyles: GlobalStyles;
}
