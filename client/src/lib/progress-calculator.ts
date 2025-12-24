/**
 * Form Progress Calculation
 * Track form completion, estimate remaining time, and provide encouragement
 */

export interface FormProgressMetrics {
  percentage: number;
  filledFields: number;
  totalFields: number;
  estimatedTimeMinutes: number;
}

export interface StepProgressMetrics {
  step: number;
  filledFields: number;
  totalFields: number;
  percentage: number;
}

/**
 * All form fields to track for progress
 */
const ALL_FORM_FIELDS = [
  'businessName',
  'brandName',
  'entityType',
  'yearEstablished',
  'employeeCount',
  'annualTurnover',
  'panNumber',
  'gstNumber',
  'gstState',
  'msmeNumber',
  'fssaiNumber',
  'contactPersonName',
  'contactPersonDesignation',
  'contactEmail',
  'contactPhone',
  'contactWhatsapp',
  'secondaryContactName',
  'secondaryContactPhone',
  'registeredAddress',
  'registeredCity',
  'registeredState',
  'registeredPincode',
  'operationalAddress',
  'operationalCity',
  'operationalState',
  'operationalPincode',
  'categories',
  'primaryCategory',
  'serviceDescription',
  'specializations',
  'serviceAreas',
  'serviceCities',
  'serviceStates',
  'panIndiaService',
  'minimumGuestCapacity',
  'maximumGuestCapacity',
  'eventsPerMonth',
  'staffStrength',
  'equipmentOwned',
  'equipmentDetails',
  'minimumBudget',
  'averageEventValue',
  'pricingTier',
  'paymentTerms',
  'advancePercentage',
  'acceptsOnlinePayment',
  'bankName',
  'bankBranch',
  'accountNumber',
  'ifscCode',
  'accountHolderName',
  'upiId',
  'yearsInBusiness',
  'eventsCompleted',
  'websiteUrl',
  'instagramUrl',
  'facebookUrl',
  'youtubeUrl',
  'hasLiabilityInsurance',
  'hasFireSafetyCertificate',
  'hasPollutionCertificate',
  'hasNoPendingLitigation',
  'hasNeverBlacklisted',
  'agreesToTerms',
  'agreesToNda',
];

/**
 * Step-wise field grouping
 */
const STEP_FIELDS = {
  1: [
    'businessName',
    'entityType',
    'panNumber',
    'gstNumber',
    'msmeNumber',
    'contactPersonName',
    'contactEmail',
  ],
  2: [
    'contactPhone',
    'registeredAddress',
    'registeredState',
    'registeredCity',
    'operationalAddress',
    'operationalCity',
  ],
  3: [
    'categories',
    'primaryCategory',
    'serviceDescription',
    'minimumGuestCapacity',
    'maximumGuestCapacity',
    'pricingTier',
    'minimumBudget',
  ],
  4: [
    'bankName',
    'accountNumber',
    'ifscCode',
    'agreesToTerms',
  ],
};

/**
 * Calculate overall form progress
 */
export const calculateFormProgress = (
  formData: Record<string, any>
): FormProgressMetrics => {
  const filledFields = ALL_FORM_FIELDS.filter((field) => {
    const value = formData[field];
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value === true;
    return true;
  }).length;

  const percentage = Math.round((filledFields / ALL_FORM_FIELDS.length) * 100);
  const remainingFields = ALL_FORM_FIELDS.length - filledFields;
  const estimatedTimeMinutes = Math.max(1, Math.ceil(remainingFields / 5));

  return {
    percentage,
    filledFields,
    totalFields: ALL_FORM_FIELDS.length,
    estimatedTimeMinutes,
  };
};

/**
 * Calculate progress for a specific step
 */
export const calculateStepProgress = (
  stepNumber: number,
  formData: Record<string, any>
): StepProgressMetrics => {
  const stepFields = STEP_FIELDS[stepNumber as keyof typeof STEP_FIELDS] || [];

  const filledFields = stepFields.filter((field) => {
    const value = formData[field];
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }).length;

  const percentage = Math.round((filledFields / stepFields.length) * 100);

  return {
    step: stepNumber,
    filledFields,
    totalFields: stepFields.length,
    percentage,
  };
};

/**
 * Calculate progress for all steps
 */
export const calculateAllStepsProgress = (
  formData: Record<string, any>
): StepProgressMetrics[] => {
  return [1, 2, 3, 4].map((step) => calculateStepProgress(step, formData));
};

/**
 * Get encouragement message based on progress percentage
 */
export const getEncouragementMessage = (percentage: number): string => {
  if (percentage === 0) {
    return "Let's get started! Complete your vendor profile to receive events.";
  }
  if (percentage < 25) {
    return '🚀 Great start! You\'re on your way to becoming a verified vendor.';
  }
  if (percentage < 50) {
    return '📈 You\'re making progress! Keep going, you\'re doing great.';
  }
  if (percentage < 75) {
    return '⭐ You\'re halfway there! Just a bit more to complete your profile.';
  }
  if (percentage < 100) {
    return '🎯 Almost done! Complete the final details to go live.';
  }
  return '🎉 Perfect! Your profile is complete and verified.';
};

/**
 * Get progress bar color based on percentage
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage < 25) return 'bg-red-500';
  if (percentage < 50) return 'bg-orange-500';
  if (percentage < 75) return 'bg-yellow-500';
  if (percentage < 100) return 'bg-blue-500';
  return 'bg-green-600';
};

/**
 * Estimate completion based on current rate
 */
export const estimateCompletionTime = (
  formData: Record<string, any>,
  fieldsPerMinute: number = 5
): { hours: number; minutes: number } => {
  const progress = calculateFormProgress(formData);
  const totalMinutes = Math.ceil(progress.estimatedTimeMinutes);

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
};

/**
 * Get formatted time remaining string
 */
export const getTimeRemainingString = (
  formData: Record<string, any>
): string => {
  const progress = calculateFormProgress(formData);

  if (progress.percentage === 100) {
    return '✓ Complete';
  }

  if (progress.estimatedTimeMinutes < 60) {
    return `~${progress.estimatedTimeMinutes} min remaining`;
  }

  const hours = Math.floor(progress.estimatedTimeMinutes / 60);
  const minutes = progress.estimatedTimeMinutes % 60;

  if (minutes === 0) {
    return `~${hours} hour${hours > 1 ? 's' : ''} remaining`;
  }

  return `~${hours}h ${minutes}m remaining`;
};
