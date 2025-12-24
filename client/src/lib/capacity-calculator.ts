/**
 * Capacity and Staff Estimation Calculator
 * Auto-calculate derived fields based on user input
 */

export interface CapacityEstimate {
  min?: number;
  max?: number;
  confidence: number; // 0-100
  reason: string;
}

export interface StaffEstimate {
  minStaff?: number;
  maxStaff?: number;
  confidence: number;
  reason: string;
}

/**
 * Extract numeric capacity from text
 * Looks for patterns like "100 people", "500 capacity", "1000 guests"
 */
const extractCapacityFromText = (
  text: string
): { value: number; foundIn: string } | null => {
  if (!text) return null;

  const patterns = [
    /(\d+)\s*(?:people|guests|persons|capacity|pax)/i,
    /(?:capacity|up to|handles|accommodate[s]?)\s+(\d+)/i,
    /(\d+)\s*-\s*(\d+)\s*(?:people|guests)/i, // Range
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      return { value, foundIn: match[0] };
    }
  }

  return null;
};

/**
 * Estimate capacity range based on equipment details and service description
 * Returns min, max capacity with confidence level
 */
export const estimateCapacity = (
  equipmentDetails?: string,
  serviceDescription?: string,
  category?: string
): CapacityEstimate => {
  let min: number | undefined;
  let max: number | undefined;
  let confidence = 0;
  let reason = '';

  // Try to extract from equipment details
  if (equipmentDetails) {
    const extraction = extractCapacityFromText(equipmentDetails);
    if (extraction) {
      const capacity = extraction.value;
      min = Math.floor(capacity * 0.8);
      max = Math.ceil(capacity * 1.5);
      confidence = 85;
      reason = `Based on equipment details: "${extraction.foundIn}"`;
      return { min, max, confidence, reason };
    }
  }

  // Try to extract from service description
  if (serviceDescription) {
    const extraction = extractCapacityFromText(serviceDescription);
    if (extraction) {
      const capacity = extraction.value;
      min = Math.floor(capacity * 0.9);
      max = Math.ceil(capacity * 1.2);
      confidence = 70;
      reason = `Based on service description: "${extraction.foundIn}"`;
      return { min, max, confidence, reason };
    }
  }

  // Use category-based defaults if no explicit capacity found
  if (category) {
    switch (category.toLowerCase()) {
      case 'decorator':
        min = 50;
        max = 500;
        confidence = 40;
        reason = 'Default range for decorators';
        break;
      case 'caterer':
        min = 50;
        max = 1000;
        confidence = 40;
        reason = 'Default range for caterers';
        break;
      case 'venue_owner':
        min = 100;
        max = 1000;
        confidence = 40;
        reason = 'Default range for venues';
        break;
      case 'photographer':
      case 'videographer':
        min = 20;
        max = 500;
        confidence = 30;
        reason = 'Default range for photographers';
        break;
      case 'music_band':
        min = 50;
        max = 1000;
        confidence = 30;
        reason = 'Default range for performers';
        break;
      default:
        confidence = 0;
        reason = 'No capacity data available';
    }
  }

  return { min, max, confidence, reason };
};

/**
 * Estimate required staff strength based on event capacity
 * Uses industry standard: 1 staff per 30-50 guests
 */
export const estimateStaffStrength = (
  maxCapacity?: number,
  category?: string
): StaffEstimate => {
  let minStaff: number | undefined;
  let maxStaff: number | undefined;
  let confidence = 0;
  let reason = '';

  if (!maxCapacity) {
    return {
      confidence: 0,
      reason: 'Enter maximum capacity to estimate staff strength',
    };
  }

  // Standard ratios by category
  const staffRatios: Record<string, { minRatio: number; maxRatio: number }> = {
    decorator: { minRatio: 40, maxRatio: 60 }, // 1 staff per 40-60 guests
    caterer: { minRatio: 20, maxRatio: 30 }, // 1 staff per 20-30 guests (food needs more hands)
    venue_owner: { minRatio: 50, maxRatio: 100 }, // Varies, support staff
    event_planner: { minRatio: 30, maxRatio: 50 },
    photographer: { minRatio: 200, maxRatio: 500 }, // 1 per 200-500 guests
    default: { minRatio: 30, maxRatio: 50 },
  };

  const categoryKey = category?.toLowerCase() || 'default';
  const ratio = staffRatios[categoryKey] || staffRatios['default'];

  minStaff = Math.ceil(maxCapacity / ratio.maxRatio); // More conservative
  maxStaff = Math.ceil(maxCapacity / ratio.minRatio); // More generous

  confidence = 75;
  reason = `Estimated for capacity: ${maxCapacity} guests (${ratio.minRatio}-${ratio.maxRatio} guests per staff)`;

  return { minStaff, maxStaff, confidence, reason };
};

/**
 * Estimate average event value based on category, capacity, and pricing tier
 */
export const estimateEventValue = (
  maxCapacity?: number,
  pricingTier?: string,
  category?: string
): { estimatedMin?: number; estimatedMax?: number; confidence: number } => {
  if (!maxCapacity || !pricingTier) {
    return { confidence: 0 };
  }

  // Base rates per guest by category (in INR)
  const categoryRates: Record<string, { min: number; max: number }> = {
    decorator: { min: 50, max: 200 },
    caterer: { min: 150, max: 500 },
    photographer: { min: 2000, max: 10000 }, // Per event
    videographer: { min: 3000, max: 15000 },
    venue_owner: { min: 2000, max: 20000 }, // Per event/hour
    event_planner: { min: 100, max: 300 },
    makeup_artist: { min: 500, max: 2000 }, // Per person
    music_band: { min: 10000, max: 50000 }, // Per event
  };

  const tierMultipliers: Record<string, number> = {
    budget: 0.7,
    mid_range: 1.0,
    premium: 1.5,
    luxury: 2.5,
  };

  const categoryKey = category?.toLowerCase() || 'decorator';
  const baseRate = categoryRates[categoryKey] || categoryRates['decorator'];
  const multiplier = tierMultipliers[pricingTier.toLowerCase()] || 1.0;

  // For per-guest categories, multiply by capacity
  const isPerGuestCategory = ['decorator', 'caterer', 'event_planner', 'makeup_artist'].includes(categoryKey);

  let estimatedMin: number;
  let estimatedMax: number;

  if (isPerGuestCategory) {
    estimatedMin = Math.floor(maxCapacity * baseRate.min * multiplier);
    estimatedMax = Math.floor(maxCapacity * baseRate.max * multiplier);
  } else {
    // For per-event categories
    estimatedMin = Math.floor(baseRate.min * multiplier);
    estimatedMax = Math.floor(baseRate.max * multiplier);
  }

  return {
    estimatedMin,
    estimatedMax,
    confidence: 60,
  };
};

/**
 * Calculate effective hourly rate from event value
 */
export const calculateHourlyRate = (
  eventValue: number,
  eventDurationHours: number = 8
): number => {
  if (eventDurationHours <= 0) return 0;
  return Math.floor(eventValue / eventDurationHours);
};

/**
 * Validate capacity range (min <= max)
 */
export const validateCapacityRange = (
  minCapacity?: number,
  maxCapacity?: number
): { valid: boolean; message?: string } => {
  if (!minCapacity || !maxCapacity) {
    return { valid: true }; // Not required to validate if empty
  }

  if (minCapacity > maxCapacity) {
    return {
      valid: false,
      message: `Minimum capacity (${minCapacity}) cannot exceed maximum (${maxCapacity})`,
    };
  }

  if (maxCapacity - minCapacity < 5) {
    return {
      valid: false,
      message: 'Capacity range should be at least 5 guests apart',
    };
  }

  return { valid: true };
};
