/**
 * Vendor Registration Utilities
 * Smart auto-filling and extraction logic for GST and PAN numbers
 */

// GST State Code Mapping (First 2 digits of GST)
export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Andhra Pradesh',
  '02': 'Arunachal Pradesh',
  '03': 'Assam',
  '04': 'Bihar',
  '05': 'Chhattisgarh',
  '06': 'Goa',
  '07': 'Gujarat',
  '08': 'Haryana',
  '09': 'Himachal Pradesh',
  '10': 'Jharkhand',
  '11': 'Karnataka',
  '12': 'Kerala',
  '13': 'Madhya Pradesh',
  '14': 'Maharashtra',
  '15': 'Manipur',
  '16': 'Meghalaya',
  '17': 'Mizoram',
  '18': 'Nagaland',
  '19': 'Odisha',
  '20': 'Punjab',
  '21': 'Rajasthan',
  '22': 'Sikkim',
  '23': 'Tamil Nadu',
  '24': 'Telangana',
  '25': 'Tripura',
  '26': 'Uttar Pradesh',
  '27': 'Uttarakhand',
  '28': 'West Bengal',
  '29': 'Delhi',
  '30': 'Jammu and Kashmir',
  '31': 'Ladakh',
  '32': 'Puducherry',
  '33': 'Chandigarh',
  '34': 'Andaman and Nicobar Islands',
  '35': 'Dadra and Nagar Haveli and Daman and Diu',
  '36': 'Lakshadweep',
  '97': 'Other Territory',
  '98': 'Supply outside India',
  '99': 'Composition',
};

// PAN Entity Type Mapping (5th character of PAN)
export const PAN_ENTITY_TYPE_MAP: Record<string, string> = {
  'P': 'individual', // Person
  'C': 'private_limited', // Company
  'S': 'sole_proprietor', // Sole Proprietor
  'H': 'huf', // Hindu Undivided Family
  'A': 'partnership', // Association of Persons
  'T': 'trust', // Trust
  'B': 'partnership', // Body Corporate (General)
  'L': 'llp', // Limited Liability Partnership
  'J': 'partnership', // Artificial Juridical Person
  'G': 'individual', // Government
  'F': 'partnership', // Firm/Registered Partnership
  'K': 'partnership', // Not Recognized (trust)
};

/**
 * Extract state from GST number
 * GST Format: [0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}
 * First 2 digits represent state code
 */
export function extractStateFromGST(gstNumber: string): {
  state: string | null;
  stateCode: string;
  isValid: boolean;
} {
  if (!gstNumber || gstNumber.length < 2) {
    return { state: null, stateCode: '', isValid: false };
  }

  const stateCode = gstNumber.substring(0, 2);
  const state = GST_STATE_CODES[stateCode];

  return {
    state: state || null,
    stateCode,
    isValid: !!state,
  };
}

/**
 * Validate GST Number Format
 */
export function isValidGSTFormat(gstNumber: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstNumber.toUpperCase());
}

/**
 * Extract entity type suggestion from PAN number
 * PAN Format: [A-Z]{5}[0-9]{4}[A-Z]{1}
 * 5th character indicates entity type
 */
export function suggestEntityTypeFromPAN(panNumber: string): {
  entityType: string | null;
  entityChar: string;
  description: string;
  confidence: number; // 0-100
} {
  if (!panNumber || panNumber.length < 5) {
    return {
      entityType: null,
      entityChar: '',
      description: '',
      confidence: 0,
    };
  }

  const entityChar = panNumber.charAt(4).toUpperCase();
  const entityType = PAN_ENTITY_TYPE_MAP[entityChar];

  const entityDescriptions: Record<string, string> = {
    'P': 'Individual/Person',
    'C': 'Private Limited Company',
    'S': 'Sole Proprietor/Self-employed',
    'H': 'Hindu Undivided Family',
    'A': 'Association of Persons',
    'T': 'Trust/Charitable Organization',
    'B': 'Body Corporate',
    'L': 'Limited Liability Partnership',
    'J': 'Artificial Juridical Person',
    'G': 'Government Entity',
    'F': 'Firm/Partnership',
    'K': 'Other Entity Type',
  };

  return {
    entityType: entityType || null,
    entityChar,
    description: entityDescriptions[entityChar] || 'Unknown entity type',
    confidence: entityType ? 85 : 0,
  };
}

/**
 * Validate PAN Number Format
 */
export function isValidPANFormat(panNumber: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(panNumber.toUpperCase());
}

/**
 * Extract business initials from PAN (first 3 characters)
 * Can provide clue about business name
 */
export function extractInitialsFromPAN(panNumber: string): string {
  if (!panNumber || panNumber.length < 3) {
    return '';
  }
  return panNumber.substring(0, 3).toUpperCase();
}

/**
 * Check if PAN and Entity Type match
 * Returns warning if mismatch detected
 */
export function checkPANEntityTypeMatch(
  panNumber: string,
  selectedEntityType: string
): {
  matches: boolean;
  warning: string | null;
} {
  const suggestion = suggestEntityTypeFromPAN(panNumber);

  if (!suggestion.entityType) {
    return { matches: true, warning: null };
  }

  const matches = suggestion.entityType === selectedEntityType;

  if (!matches) {
    return {
      matches: false,
      warning: `Based on your PAN, you appear to be a "${suggestion.description}" but selected "${selectedEntityType}". Please verify.`,
    };
  }

  return { matches: true, warning: null };
}

/**
 * Format GST number to standard format
 * Input: any case, with/without spaces
 * Output: Standard uppercase format
 */
export function formatGSTNumber(gstNumber: string): string {
  let formatted = gstNumber.toUpperCase();
  formatted = formatted.replace(/[^A-Z0-9]/g, '');
  formatted = formatted.slice(0, 15);
  return formatted;
}

/**
 * Format PAN number to standard format
 * Input: any case, with/without spaces
 * Output: Standard uppercase format
 */
export function formatPANNumber(panNumber: string): string {
  let formatted = panNumber.toUpperCase();
  formatted = formatted.replace(/[^A-Z0-9]/g, '');
  formatted = formatted.slice(0, 10);
  return formatted;
}

/**
 * Get suggested business entity types based on multiple indicators
 */
export function getSuggestedEntityTypes(
  panNumber?: string,
  businessType?: string
): Array<{
  type: string;
  label: string;
  confidence: number;
  reason: string;
}> {
  const suggestions: Array<{
    type: string;
    label: string;
    confidence: number;
    reason: string;
  }> = [];

  if (panNumber && panNumber.length >= 5) {
    const { entityType, description, confidence } = suggestEntityTypeFromPAN(panNumber);
    if (entityType) {
      suggestions.push({
        type: entityType,
        label: description,
        confidence,
        reason: 'Based on your PAN entity code',
      });
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract tax identification details from documents
 */
export function extractTaxDetails(gstNumber: string, panNumber: string) {
  const gstDetails = extractStateFromGST(gstNumber);
  const panDetails = suggestEntityTypeFromPAN(panNumber);

  return {
    gst: {
      ...gstDetails,
      formatted: formatGSTNumber(gstNumber),
      isValid: isValidGSTFormat(gstNumber),
    },
    pan: {
      ...panDetails,
      formatted: formatPANNumber(panNumber),
      isValid: isValidPANFormat(panNumber),
    },
  };
}
