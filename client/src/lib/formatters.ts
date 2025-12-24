/**
 * Input Formatting Utilities
 * Auto-format phone, PAN, GST, bank account, and other numeric/string fields
 */

/**
 * Format Indian phone number
 * Input: "9876543210" or "98765 43210" or "+919876543210"
 * Output: "+91 98765 43210"
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return '';

  // Remove all non-digits
  let digits = value.replace(/\D/g, '');

  // Remove country code (91) if present
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.substring(2);
  }

  // Take only last 10 digits
  digits = digits.slice(-10);

  // Format as: +91 XXXXX XXXXX
  if (digits.length === 0) return '';
  if (digits.length <= 5) {
    return `+91 ${digits}`;
  }
  
  const firstPart = digits.substring(0, 5);
  const secondPart = digits.substring(5, 10);
  return `+91 ${firstPart} ${secondPart}`;
};

/**
 * Get raw phone digits (for storage/API)
 * Input: "+91 98765 43210"
 * Output: "9876543210"
 */
export const getRawPhoneNumber = (formatted: string): string => {
  return formatted.replace(/\D/g, '').slice(-10);
};

/**
 * Format PAN number
 * Input: "abcd1234567x"
 * Output: "ABCD1234567X"
 */
export const formatPAN = (value: string): string => {
  if (!value) return '';

  // Convert to uppercase
  let formatted = value.toUpperCase();

  // Remove spaces and non-alphanumeric characters
  formatted = formatted.replace(/[^A-Z0-9]/g, '');

  // Limit to 10 characters
  formatted = formatted.slice(0, 10);

  return formatted;
};

/**
 * Format GST number
 * Input: "29aagct1234567890z1"
 * Output: "29AAGCT1234567890Z1"
 */
export const formatGST = (value: string): string => {
  if (!value) return '';

  // Convert to uppercase
  let formatted = value.toUpperCase();

  // Remove spaces and non-alphanumeric characters
  formatted = formatted.replace(/[^A-Z0-9]/g, '');

  // Limit to 15 characters
  formatted = formatted.slice(0, 15);

  return formatted;
};

/**
 * Format bank account number
 * Input: "1234567890123456"
 * Output: "1234 5678 9012 3456"
 */
export const formatBankAccount = (value: string): string => {
  if (!value) return '';

  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Format as: XXXX XXXX XXXX XXXX
  let formatted = '';
  for (let i = 0; i < digits.length; i += 4) {
    if (i > 0) formatted += ' ';
    formatted += digits.substring(i, i + 4);
  }

  // Max 16 digits + 3 spaces = 19 chars
  return formatted.slice(0, 19);
};

/**
 * Get raw account number (for storage/API)
 * Input: "1234 5678 9012 3456"
 * Output: "1234567890123456"
 */
export const getRawAccountNumber = (formatted: string): string => {
  return formatted.replace(/\D/g, '');
};

/**
 * Format IFSC code
 * Input: "sbin0000001" or "sbin0000001"
 * Output: "SBIN0000001"
 */
export const formatIFSC = (value: string): string => {
  if (!value) return '';

  // Convert to uppercase
  let formatted = value.toUpperCase();

  // Remove spaces and non-alphanumeric characters
  formatted = formatted.replace(/[^A-Z0-9]/g, '');

  // Limit to 11 characters
  formatted = formatted.slice(0, 11);

  return formatted;
};

/**
 * Format currency/number with commas
 * Input: 123456789
 * Output: "1,23,45,789" (Indian numbering)
 */
export const formatCurrencyINR = (value: number | string): string => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num)) return '';

  // Convert to string and add commas (Indian style: 1,23,456)
  const str = Math.abs(num).toString();
  const isNegative = num < 0;
  let formatted = '';

  // Add commas in Indian numbering system
  if (str.length <= 3) {
    formatted = str;
  } else {
    const lastThree = str.slice(-3);
    const remaining = str.slice(0, -3);
    formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return isNegative ? `-${formatted}` : formatted;
};

/**
 * Get raw number from formatted currency
 * Input: "1,23,45,789"
 * Output: 123456789
 */
export const getRawNumber = (formatted: string): number => {
  const raw = formatted.replace(/[^\d-]/g, '');
  return parseInt(raw, 10) || 0;
};

/**
 * Format percentage (ensure 0-100)
 * Input: "150"
 * Output: "100"
 */
export const formatPercentage = (value: string | number): string => {
  let num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num)) return '0';

  // Clamp between 0 and 100
  num = Math.max(0, Math.min(100, num));

  return num.toString();
};

/**
 * Format year (4 digits, between 1900 and current year)
 * Input: "202" or "20240"
 * Output: "2024"
 */
export const formatYear = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const year = parseInt(digits.slice(-4), 10);
  const currentYear = new Date().getFullYear();

  if (year < 1900 || year > currentYear || isNaN(year)) {
    return '';
  }

  return year.toString();
};

/**
 * Format text to title case (capitalize first letter of each word)
 * Input: "event planner"
 * Output: "Event Planner"
 */
export const formatTitleCase = (value: string): string => {
  if (!value) return '';

  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Remove extra whitespace and normalize
 * Input: "Business  Name   Ltd."
 * Output: "Business Name Ltd."
 */
export const normalizeWhitespace = (value: string): string => {
  if (!value) return '';

  return value.trim().replace(/\s+/g, ' ');
};

/**
 * Dispatcher function to format any field
 */
export const formatField = (fieldName: string, value: string | number): string => {
  if (!value) return '';

  const stringValue = String(value);

  switch (fieldName) {
    case 'contactPhone':
    case 'phone':
    case 'secondaryContactPhone':
      return formatPhoneNumber(stringValue);
    case 'panNumber':
      return formatPAN(stringValue);
    case 'gstNumber':
      return formatGST(stringValue);
    case 'accountNumber':
      return formatBankAccount(stringValue);
    case 'ifscCode':
      return formatIFSC(stringValue);
    case 'businessName':
    case 'contactPersonName':
    case 'secondaryContactName':
      return normalizeWhitespace(stringValue);
    case 'advancePercentage':
      return formatPercentage(stringValue);
    case 'yearEstablished':
      return formatYear(stringValue);
    default:
      return stringValue;
  }
};
