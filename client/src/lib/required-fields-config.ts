/**
 * Dynamic Required Fields Configuration
 * Determine which fields are required based on entity type, category, and context
 */

export type EntityType = 'sole_proprietor' | 'partnership' | 'llp' | 'opc' | 'private_limited' | 'public_limited' | 'huf' | 'trust' | 'society' | 'other';

/**
 * Base required fields (always required)
 */
const BASE_REQUIRED_FIELDS = [
  'businessName',
  'entityType',
  'contactPersonName',
  'contactEmail',
  'contactPhone',
  'agreesToTerms',
];

/**
 * Entity type specific required fields
 */
const ENTITY_REQUIRED_FIELDS: Record<EntityType, string[]> = {
  'sole_proprietor': [],
  'partnership': ['panNumber'],
  'llp': ['panNumber', 'gstNumber'],
  'opc': ['panNumber', 'gstNumber'],
  'private_limited': ['panNumber', 'gstNumber'],
  'public_limited': ['panNumber', 'gstNumber'],
  'huf': ['panNumber'],
  'trust': [],
  'society': [],
  'other': [],
};

/**
 * Category specific required fields
 */
const CATEGORY_REQUIRED_FIELDS: Record<string, string[]> = {
  'caterer': ['fssaiNumber'],
  'decorator': ['minimumGuestCapacity', 'maximumGuestCapacity'],
  'venue_owner': ['minimumGuestCapacity', 'maximumGuestCapacity'],
  'photographer': [],
  'videographer': [],
  'planner': ['staffStrength'],
  'makeup_artist': [],
  'music_band': ['staffStrength'],
};

/**
 * Get all required fields based on form context
 */
export const getRequiredFields = (formData: {
  entityType?: EntityType | string;
  primaryCategory?: string;
  panIndiaService?: boolean;
  staffStrength?: number;
}): string[] => {
  let required = [...BASE_REQUIRED_FIELDS];

  // Add entity type specific requirements
  if (formData.entityType && ENTITY_REQUIRED_FIELDS[formData.entityType as EntityType]) {
    required.push(...ENTITY_REQUIRED_FIELDS[formData.entityType as EntityType]);
  }

  // Add category specific requirements
  if (formData.primaryCategory && CATEGORY_REQUIRED_FIELDS[formData.primaryCategory]) {
    required.push(...CATEGORY_REQUIRED_FIELDS[formData.primaryCategory]);
  }

  // Geographic requirements
  if (formData.panIndiaService === false) {
    // User must select specific states
    required.push('serviceStates');
  }

  // Remove duplicates
  return Array.from(new Set(required));
};

/**
 * Check if a specific field is required
 */
export const isFieldRequired = (
  fieldName: string,
  formData: {
    entityType?: EntityType | string;
    primaryCategory?: string;
    panIndiaService?: boolean;
  }
): boolean => {
  const required = getRequiredFields(formData);
  return required.includes(fieldName);
};

/**
 * Get contextual reason why a field is required
 */
const REQUIRED_FIELD_REASONS: Record<string, Record<string, string>> = {
  'businessName': {
    'default': 'Your business name helps us identify your profile',
  },
  'entityType': {
    'default': 'We need to know your business structure for compliance',
  },
  'contactPersonName': {
    'default': 'We need a primary contact for your business',
  },
  'contactEmail': {
    'default': 'Email is how we\'ll contact you about leads and updates',
  },
  'contactPhone': {
    'default': 'Phone is how leads will contact you for bookings',
  },
  'panNumber': {
    'partnership': 'PAN is required for partnership firms',
    'llp': 'PAN is required for LLP entities',
    'opc': 'PAN is required for OPC entities',
    'private_limited': 'PAN is required for private companies',
    'public_limited': 'PAN is required for public companies',
    'huf': 'PAN is required for HUF entities',
    'default': 'PAN is required for your business type',
  },
  'gstNumber': {
    'llp': 'GST registration is mandatory for LLPs',
    'opc': 'GST is mandatory for OPCs',
    'private_limited': 'GST is mandatory for private companies',
    'public_limited': 'GST is mandatory for public companies',
    'default': 'GST registration is required for your business type',
  },
  'fssaiNumber': {
    'caterer': 'FSSAI license is mandatory for food service vendors in India',
    'default': 'FSSAI license is required for food-related services',
  },
  'minimumGuestCapacity': {
    'decorator': 'Capacity helps us match you with appropriate events',
    'venue_owner': 'We need your venue capacity to suggest suitable events',
    'default': 'Capacity information is needed for your service type',
  },
  'maximumGuestCapacity': {
    'decorator': 'Maximum capacity is needed to match you with right events',
    'venue_owner': 'Maximum capacity helps us serve you better',
    'default': 'Maximum capacity is needed for your service type',
  },
  'staffStrength': {
    'planner': 'Team size helps us understand your service scale',
    'music_band': 'Team size is important for group performances',
    'default': 'Staff strength information is needed',
  },
  'serviceStates': {
    'default': 'Select at least one state where you operate to receive relevant leads',
  },
  'agreesToTerms': {
    'default': 'You must accept the Terms & Conditions to proceed',
  },
};

/**
 * Get reason why a field is required
 */
export const getRequiredFieldReason = (
  fieldName: string,
  context?: string
): string => {
  const reasons = REQUIRED_FIELD_REASONS[fieldName];
  if (!reasons) return `${fieldName} is required`;

  return reasons[context || 'default'] || reasons['default'] || `${fieldName} is required`;
};

/**
 * Get all missing required fields
 */
export const getMissingRequiredFields = (
  formData: Record<string, any>,
  requiredFieldsList: string[]
): string[] => {
  return requiredFieldsList.filter((field) => {
    const value = formData[field];
    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'boolean') return value !== true;
    return false;
  });
};

/**
 * Get friendly field label
 */
export const getFieldLabel = (fieldName: string): string => {
  const labels: Record<string, string> = {
    'businessName': 'Business Name',
    'entityType': 'Business Type',
    'panNumber': 'PAN Number',
    'gstNumber': 'GST Number',
    'fssaiNumber': 'FSSAI License',
    'contactPersonName': 'Contact Person Name',
    'contactEmail': 'Contact Email',
    'contactPhone': 'Contact Phone',
    'minimumGuestCapacity': 'Minimum Guest Capacity',
    'maximumGuestCapacity': 'Maximum Guest Capacity',
    'staffStrength': 'Staff Strength',
    'serviceStates': 'Service States',
    'agreesToTerms': 'Terms & Conditions',
  };

  return labels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim();
};
