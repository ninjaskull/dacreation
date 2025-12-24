/**
 * Validation Rules and Progressive Feedback
 * Real-time validation with context-aware error messages
 */

export interface ValidationFeedback {
  valid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  suggestion?: string;
}

/**
 * Phone number validation
 */
export const validatePhone = (phone: string): ValidationFeedback => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required', severity: 'error' };
  }

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 10) {
    return {
      valid: false,
      message: `Phone incomplete: ${cleaned.length}/10 digits`,
      severity: 'info',
    };
  }

  if (cleaned.length === 10) {
    if (!/^[6-9]/.test(cleaned)) {
      return {
        valid: false,
        message: 'Indian phone must start with 6-9',
        severity: 'warning',
      };
    }
    return { valid: true, message: '✓ Valid phone number', severity: 'success' };
  }

  if (cleaned.length > 10 && cleaned.length <= 12) {
    return { valid: true, message: '✓ Valid phone number', severity: 'success' };
  }

  return {
    valid: false,
    message: `Phone too long (${cleaned.length} digits, max 12)`,
    severity: 'error',
  };
};

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationFeedback => {
  if (!email) {
    return { valid: false, message: 'Email is required', severity: 'error' };
  }

  if (!email.includes('@')) {
    return {
      valid: false,
      message: 'Missing @ symbol',
      severity: 'info',
    };
  }

  const [localPart, domain] = email.split('@');

  if (!localPart) {
    return {
      valid: false,
      message: 'Missing email address before @',
      severity: 'error',
    };
  }

  if (!domain) {
    return {
      valid: false,
      message: 'Missing domain name after @',
      severity: 'info',
    };
  }

  if (!domain.includes('.')) {
    return {
      valid: false,
      message: 'Missing domain extension (e.g., .com, .co.in)',
      severity: 'info',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: 'Invalid email format',
      severity: 'error',
    };
  }

  return { valid: true, message: '✓ Valid email', severity: 'success' };
};

/**
 * Business name validation
 */
export const validateBusinessName = (name: string): ValidationFeedback => {
  if (!name) {
    return { valid: false, message: 'Business name is required', severity: 'error' };
  }

  if (name.length < 2) {
    return {
      valid: false,
      message: `Business name too short (${name.length}/2 characters minimum)`,
      severity: 'info',
    };
  }

  if (name.length > 100) {
    return {
      valid: false,
      message: 'Business name too long (max 100 characters)',
      severity: 'error',
    };
  }

  if (!/^[a-zA-Z0-9\s\-&.,'()]+$/.test(name)) {
    return {
      valid: false,
      message: 'Business name contains invalid characters',
      severity: 'warning',
    };
  }

  return { valid: true, message: '✓ Valid business name', severity: 'success' };
};

/**
 * GST number validation
 */
export const validateGST = (gst: string): ValidationFeedback => {
  if (!gst) {
    return { valid: false, message: 'GST number required for companies', severity: 'error' };
  }

  const cleaned = gst.toUpperCase().replace(/\s/g, '');

  if (cleaned.length < 15) {
    return {
      valid: false,
      message: `GST incomplete: ${cleaned.length}/15 characters`,
      severity: 'info',
    };
  }

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(cleaned)) {
    return {
      valid: false,
      message: 'Invalid GST format',
      severity: 'error',
    };
  }

  return { valid: true, message: '✓ Valid GST number', severity: 'success' };
};

/**
 * PAN number validation
 */
export const validatePAN = (pan: string): ValidationFeedback => {
  if (!pan) {
    return { valid: false, message: 'PAN is required', severity: 'error' };
  }

  const cleaned = pan.toUpperCase().replace(/\s/g, '');

  if (cleaned.length < 10) {
    return {
      valid: false,
      message: `PAN incomplete: ${cleaned.length}/10 characters`,
      severity: 'info',
    };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleaned)) {
    return {
      valid: false,
      message: 'Invalid PAN format (expected: AAAAA0000A)',
      severity: 'error',
    };
  }

  return { valid: true, message: '✓ Valid PAN', severity: 'success' };
};

/**
 * FSSAI number validation (for caterers)
 */
export const validateFSSAI = (fssai: string): ValidationFeedback => {
  if (!fssai) {
    return { valid: false, message: 'FSSAI license required for food vendors', severity: 'error' };
  }

  const cleaned = fssai.replace(/\D/g, '');

  if (cleaned.length < 14) {
    return {
      valid: false,
      message: `FSSAI incomplete: ${cleaned.length}/14 digits`,
      severity: 'info',
    };
  }

  if (cleaned.length === 14) {
    return { valid: true, message: '✓ Valid FSSAI number', severity: 'success' };
  }

  return {
    valid: false,
    message: `FSSAI too long (${cleaned.length} digits, max 14)`,
    severity: 'error',
  };
};

/**
 * Bank account number validation
 */
export const validateAccountNumber = (account: string): ValidationFeedback => {
  if (!account) {
    return { valid: false, message: 'Account number required', severity: 'error' };
  }

  const cleaned = account.replace(/\D/g, '');

  if (cleaned.length < 9) {
    return {
      valid: false,
      message: `Account number too short (${cleaned.length}/9 digits minimum)`,
      severity: 'info',
    };
  }

  if (cleaned.length > 18) {
    return {
      valid: false,
      message: `Account number too long (${cleaned.length} digits, max 18)`,
      severity: 'error',
    };
  }

  return { valid: true, message: '✓ Valid account number', severity: 'success' };
};

/**
 * IFSC code validation
 */
export const validateIFSC = (ifsc: string): ValidationFeedback => {
  if (!ifsc) {
    return { valid: false, message: 'IFSC code required', severity: 'error' };
  }

  const cleaned = ifsc.toUpperCase().replace(/\s/g, '');

  if (cleaned.length < 11) {
    return {
      valid: false,
      message: `IFSC incomplete: ${cleaned.length}/11 characters`,
      severity: 'info',
    };
  }

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(cleaned)) {
    return {
      valid: false,
      message: 'Invalid IFSC format',
      severity: 'error',
    };
  }

  return { valid: true, message: '✓ Valid IFSC code', severity: 'success' };
};

/**
 * URL validation
 */
export const validateURL = (url: string): ValidationFeedback => {
  if (!url) {
    return { valid: false, message: 'URL is required', severity: 'error' };
  }

  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return { valid: true, message: '✓ Valid URL', severity: 'success' };
  } catch {
    return {
      valid: false,
      message: 'Invalid URL format',
      severity: 'error',
    };
  }
};

/**
 * Numeric field validation (capacity, employee count, etc.)
 */
export const validateNumber = (value: string | number, min?: number, max?: number): ValidationFeedback => {
  if (!value) {
    return { valid: false, message: 'This field is required', severity: 'error' };
  }

  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num)) {
    return {
      valid: false,
      message: 'Must be a valid number',
      severity: 'error',
    };
  }

  if (min !== undefined && num < min) {
    return {
      valid: false,
      message: `Value must be at least ${min}`,
      severity: 'error',
    };
  }

  if (max !== undefined && num > max) {
    return {
      valid: false,
      message: `Value cannot exceed ${max}`,
      severity: 'error',
    };
  }

  return { valid: true, message: '✓ Valid', severity: 'success' };
};

/**
 * Capacity range validation (min <= max)
 */
export const validateCapacityRange = (min: number, max: number): ValidationFeedback => {
  if (!min || !max) {
    return { valid: false, message: 'Both minimum and maximum capacity required', severity: 'error' };
  }

  if (min > max) {
    return {
      valid: false,
      message: `Minimum capacity (${min}) cannot exceed maximum (${max})`,
      severity: 'error',
    };
  }

  if (max - min < 10) {
    return {
      valid: false,
      message: 'Capacity range should be at least 10 guests',
      severity: 'warning',
    };
  }

  return { valid: true, message: '✓ Valid capacity range', severity: 'success' };
};

/**
 * Generic field validation dispatcher
 */
export const validateField = (fieldName: string, value: string | number): ValidationFeedback => {
  switch (fieldName) {
    case 'contactPhone':
    case 'phone':
      return validatePhone(String(value));
    case 'contactEmail':
    case 'email':
      return validateEmail(String(value));
    case 'businessName':
      return validateBusinessName(String(value));
    case 'gstNumber':
      return validateGST(String(value));
    case 'panNumber':
      return validatePAN(String(value));
    case 'fssaiNumber':
      return validateFSSAI(String(value));
    case 'accountNumber':
      return validateAccountNumber(String(value));
    case 'ifscCode':
      return validateIFSC(String(value));
    case 'websiteUrl':
    case 'instagramUrl':
    case 'youtubeUrl':
    case 'portfolioUrl':
      return validateURL(String(value));
    default:
      return { valid: true, message: '', severity: 'success' };
  }
};
