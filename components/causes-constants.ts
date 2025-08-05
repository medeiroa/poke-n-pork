// Shared causes/agencies constants for the Poke-n-Pork game
// This file ensures consistency between the dropdown and component lists

export interface CauseData {
  id: string;
  name: string;
  baseValue: number;
  category: 'humanitarian' | 'education' | 'health' | 'environmental' | 'social';
}

// Humanitarian causes list - replaces the previous government departments
export const HUMANITARIAN_CAUSES: CauseData[] = [
  // Keep the 8 causes from CausePointValues.tsx
  { id: 'clean_water', name: 'Clean Water Access', baseValue: 10000, category: 'humanitarian' },
  { id: 'education_fund', name: 'Education Fund', baseValue: 15000, category: 'education' },
  { id: 'medical_aid', name: 'Medical Aid', baseValue: 20000, category: 'health' },
  { id: 'food_security', name: 'Food Security', baseValue: 12000, category: 'humanitarian' },
  { id: 'renewable_energy', name: 'Renewable Energy', baseValue: 25000, category: 'environmental' },
  { id: 'wildlife_conservation', name: 'Wildlife Conservation', baseValue: 18000, category: 'environmental' },
  { id: 'housing_assistance', name: 'Housing Assistance', baseValue: 30000, category: 'social' },
  { id: 'disaster_relief', name: 'Disaster Relief', baseValue: 22000, category: 'humanitarian' }
];

// Create a funding targets object with standardized point values (not currency)
export const AGENCY_FUNDING_TARGETS: { [key: string]: number } = HUMANITARIAN_CAUSES.reduce((acc, cause) => {
  acc[cause.name] = cause.baseValue;
  return acc;
}, {} as { [key: string]: number });

// Available agencies list (cause names) for dropdown consistency
export const AVAILABLE_AGENCIES = HUMANITARIAN_CAUSES.map(cause => cause.name).sort();

// Default agency/cause
export const DEFAULT_AGENCY = 'Clean Water Access';
export const DEFAULT_GOP_BILL_TARGET = AGENCY_FUNDING_TARGETS[DEFAULT_AGENCY] || 10000;

// Level multiplier function for consistency across components
export const getLevelMultiplier = (level: number): number => {
  if (level <= 1) return 1.0;
  if (level <= 3) return 1.0 + (level - 1) * 0.25; // 1.25x, 1.5x
  if (level <= 6) return 1.5 + (level - 3) * 0.35; // 1.85x, 2.2x, 2.55x
  if (level <= 9) return 2.55 + (level - 6) * 0.45; // 3.0x, 3.45x, 3.9x
  return 3.9 + (level - 9) * 0.6; // 4.5x, 5.1x, 5.7x
};

// Get cause base value for level calculation
export const getCauseBaseValue = (causeId: string): number => {
  return AGENCY_FUNDING_TARGETS[causeId] || DEFAULT_GOP_BILL_TARGET;
};

// Format point values (points instead of currency)
export const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M points`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K points`;
  return `${value.toLocaleString()} points`;
};