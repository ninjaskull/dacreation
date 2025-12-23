/**
 * Vendor Form Configuration
 * Field visibility rules based on entity type, service category, and business context
 */

export type EntityType = 'sole_proprietor' | 'partnership' | 'llp' | 'opc' | 'private_limited' | 'public_limited' | 'huf' | 'trust' | 'society' | 'other';
export type ServiceCategory = string;

interface FieldVisibilityConfig {
  show: string[];
  hide: string[];
  required: string[];
}

/**
 * Field visibility rules based on entity type
 * Controls which fields are shown/hidden for each business entity type
 */
export const ENTITY_TYPE_FIELD_VISIBILITY: Record<EntityType, FieldVisibilityConfig> = {
  'sole_proprietor': {
    show: ['businessName', 'entityType', 'contactPersonName', 'contactEmail', 'contactPhone', 'serviceDescription', 'pricingTier'],
    hide: ['gstNumber', 'msmeNumber', 'fssaiNumber', 'companyProfile'],
    required: ['businessName', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
  'partnership': {
    show: ['businessName', 'entityType', 'employeeCount', 'gstNumber', 'contactPersonName', 'contactEmail', 'contactPhone', 'bankName', 'accountNumber'],
    hide: ['fssaiNumber'],
    required: ['businessName', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
  'llp': {
    show: ['businessName', 'entityType', 'employeeCount', 'gstNumber', 'panNumber', 'contactPersonName', 'contactEmail', 'contactPhone', 'bankName', 'accountNumber', 'ifscCode'],
    hide: [],
    required: ['businessName', 'gstNumber', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
  'opc': {
    show: ['businessName', 'entityType', 'employeeCount', 'gstNumber', 'panNumber', 'contactPersonName', 'contactEmail', 'contactPhone', 'bankName', 'accountNumber', 'ifscCode'],
    hide: [],
    required: ['businessName', 'gstNumber', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
  'private_limited': {
    show: ['businessName', 'entityType', 'yearEstablished', 'employeeCount', 'gstNumber', 'panNumber', 'msmeNumber', 'contactPersonName', 'contactPersonDesignation', 'contactEmail', 'contactPhone', 'bankName', 'bankBranch', 'accountNumber', 'ifscCode', 'accountHolderName'],
    hide: [],
    required: ['businessName', 'gstNumber', 'panNumber', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
  'public_limited': {
    show: ['businessName', 'entityType', 'yearEstablished', 'employeeCount', 'gstNumber', 'panNumber', 'annualTurnover', 'contactPersonName', 'contactPersonDesignation', 'contactEmail', 'contactPhone', 'bankName', 'bankBranch', 'accountNumber', 'ifscCode'],
    hide: [],
    required: ['businessName', 'gstNumber', 'panNumber', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
  'huf': {
    show: ['businessName', 'entityType', 'panNumber', 'contactPersonName', 'contactEmail', 'contactPhone', 'bankName', 'accountNumber'],
    hide: ['gstNumber', 'msmeNumber', 'fssaiNumber'],
    required: ['businessName', 'panNumber', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
  'trust': {
    show: ['businessName', 'entityType', 'contactPersonName', 'contactEmail', 'contactPhone', 'registeredAddress', 'registeredState', 'bankName', 'accountNumber'],
    hide: ['gstNumber', 'msmeNumber', 'fssaiNumber'],
    required: ['businessName', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
  'society': {
    show: ['businessName', 'entityType', 'contactPersonName', 'contactEmail', 'contactPhone', 'registeredAddress', 'registeredState', 'bankName', 'accountNumber'],
    hide: ['gstNumber', 'msmeNumber', 'fssaiNumber'],
    required: ['businessName', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
  'other': {
    show: ['businessName', 'entityType', 'contactPersonName', 'contactEmail', 'contactPhone', 'serviceDescription'],
    hide: [],
    required: ['businessName', 'contactPersonName', 'contactEmail', 'contactPhone'],
  },
};

/**
 * Field visibility rules based on service category
 * Shows/hides category-specific fields
 */
export const CATEGORY_FIELD_VISIBILITY: Record<ServiceCategory, FieldVisibilityConfig> = {
  'decorator': {
    show: ['minimumGuestCapacity', 'maximumGuestCapacity', 'equipmentOwned', 'equipmentDetails', 'staffStrength'],
    hide: ['fssaiNumber', 'hasFireSafetyCertificate'],
    required: ['minimumGuestCapacity', 'maximumGuestCapacity'],
  },
  'caterer': {
    show: ['minimumGuestCapacity', 'maximumGuestCapacity', 'fssaiNumber', 'hasFireSafetyCertificate', 'hasPollutionCertificate'],
    hide: ['equipmentDetails'],
    required: ['minimumGuestCapacity', 'maximumGuestCapacity', 'fssaiNumber'],
  },
  'photographer': {
    show: ['websiteUrl', 'instagramUrl', 'portfolioUrl', 'yearsInBusiness', 'eventsCompleted'],
    hide: ['staffStrength', 'equipmentDetails'],
    required: [],
  },
  'videographer': {
    show: ['websiteUrl', 'youtubeUrl', 'yearsInBusiness', 'eventsCompleted'],
    hide: ['staffStrength'],
    required: [],
  },
  'venue_owner': {
    show: ['minimumGuestCapacity', 'maximumGuestCapacity', 'registeredAddress', 'hasFireSafetyCertificate', 'hasLiabilityInsurance'],
    hide: ['equipmentDetails', 'fssaiNumber'],
    required: ['minimumGuestCapacity', 'maximumGuestCapacity'],
  },
  'planner': {
    show: ['yearsInBusiness', 'eventsCompleted', 'staffStrength', 'averageEventValue', 'serviceStates'],
    hide: ['equipmentDetails', 'fssaiNumber'],
    required: ['yearsInBusiness'],
  },
  'makeup_artist': {
    show: ['yearsInBusiness', 'portfolioUrl', 'instagramUrl'],
    hide: ['minimumGuestCapacity', 'equipmentDetails', 'staffStrength'],
    required: [],
  },
  'music_band': {
    show: ['staffStrength', 'yearsInBusiness', 'averageEventValue'],
    hide: ['minimumGuestCapacity', 'equipmentDetails', 'fssaiNumber'],
    required: ['staffStrength'],
  },
};

/**
 * Combine visibility rules from multiple sources
 */
export const getFieldVisibility = (
  entityType?: string,
  category?: string,
  panIndiaService?: boolean
): FieldVisibilityConfig => {
  let combined: FieldVisibilityConfig = {
    show: [],
    hide: [],
    required: [],
  };

  // Start with entity type visibility
  if (entityType && ENTITY_TYPE_FIELD_VISIBILITY[entityType as EntityType]) {
    combined = {
      show: [...ENTITY_TYPE_FIELD_VISIBILITY[entityType as EntityType].show],
      hide: [...ENTITY_TYPE_FIELD_VISIBILITY[entityType as EntityType].hide],
      required: [...ENTITY_TYPE_FIELD_VISIBILITY[entityType as EntityType].required],
    };
  }

  // Add category-specific rules
  if (category && CATEGORY_FIELD_VISIBILITY[category]) {
    const categoryRules = CATEGORY_FIELD_VISIBILITY[category];
    combined.show = [...new Set([...combined.show, ...categoryRules.show])];
    combined.hide = [...new Set([...combined.hide, ...categoryRules.hide])];
    combined.required = [...new Set([...combined.required, ...categoryRules.required])];
  }

  // Geographic dependencies
  if (panIndiaService === false) {
    // Must select specific states
    combined.required = [...new Set([...combined.required, 'serviceStates'])];
  } else if (panIndiaService === true) {
    // Hide state selection
    combined.hide = [...new Set([...combined.hide, 'serviceStates', 'serviceCities'])];
  }

  // Remove conflicting show/hide
  combined.show = combined.show.filter(field => !combined.hide.includes(field));

  return combined;
};

/**
 * Check if a field should be visible
 */
export const isFieldVisible = (
  fieldName: string,
  entityType?: string,
  category?: string,
  panIndiaService?: boolean
): boolean => {
  const visibility = getFieldVisibility(entityType, category, panIndiaService);
  
  // If show list is empty, show all (default behavior)
  if (visibility.show.length === 0) {
    return !visibility.hide.includes(fieldName);
  }
  
  return visibility.show.includes(fieldName) && !visibility.hide.includes(fieldName);
};

/**
 * Check if a field is required
 */
export const isFieldRequired = (
  fieldName: string,
  entityType?: string,
  category?: string,
  panIndiaService?: boolean
): boolean => {
  const visibility = getFieldVisibility(entityType, category, panIndiaService);
  return visibility.required.includes(fieldName);
};

/**
 * Get all visible fields
 */
export const getVisibleFields = (
  entityType?: string,
  category?: string,
  panIndiaService?: boolean
): string[] => {
  const visibility = getFieldVisibility(entityType, category, panIndiaService);
  return visibility.show;
};

/**
 * Get all required fields
 */
export const getRequiredFields = (
  entityType?: string,
  category?: string,
  panIndiaService?: boolean
): string[] => {
  const visibility = getFieldVisibility(entityType, category, panIndiaService);
  return visibility.required;
};

/**
 * Field-specific help text
 */
export const FIELD_HELP_TEXT: Record<string, Record<string, string>> = {
  'gstNumber': {
    'private_limited': 'As a private company, GST registration is required',
    'public_limited': 'As a public company, GST registration is mandatory',
    'partnership': 'Partnership firms with turnover > 20L must register for GST',
    'default': 'GST registration number (if applicable)',
  },
  'fssaiNumber': {
    'caterer': 'FSSAI license is mandatory for food service vendors',
    'default': 'Food Safety & Standards Authority of India license number',
  },
  'minimumGuestCapacity': {
    'decorator': 'Minimum guest count you can handle',
    'venue_owner': 'Minimum venue capacity',
    'caterer': 'Minimum guest count you can cater for',
    'default': 'Minimum capacity',
  },
  'maximumGuestCapacity': {
    'decorator': 'Maximum guest count you can handle',
    'venue_owner': 'Maximum venue capacity',
    'caterer': 'Maximum guest count you can cater for',
    'default': 'Maximum capacity',
  },
  'equipmentDetails': {
    'decorator': 'Describe your lighting, sound, and decoration equipment',
    'default': 'Details about your equipment',
  },
};

/**
 * Get help text for a field
 */
export const getFieldHelpText = (fieldName: string, context?: string): string => {
  const helpTexts = FIELD_HELP_TEXT[fieldName];
  if (!helpTexts) return '';
  return helpTexts[context || 'default'] || helpTexts['default'] || '';
};
