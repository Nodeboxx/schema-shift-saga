// Feature access configuration for each subscription tier
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type FeatureKey = 
  | 'prescriptions'
  | 'appointments'
  | 'patient_management'
  | 'analytics'
  | 'telemedicine'
  | 'patient_journey'
  | 'questionnaires'
  | 'prescription_history'
  | 'prescription_email'
  | 'custom_templates'
  | 'multi_clinic'
  | 'advanced_analytics'
  | 'api_access'
  | 'priority_support';

// Define which features are available for each tier
export const TIER_FEATURES: Record<SubscriptionTier, FeatureKey[]> = {
  free: [
    'prescriptions', // Basic prescription creation
  ],
  pro: [
    'prescriptions',
    'appointments',
    'patient_management',
    'analytics',
    'prescription_history',
    'prescription_email',
    'custom_templates',
  ],
  enterprise: [
    'prescriptions',
    'appointments',
    'patient_management',
    'analytics',
    'telemedicine',
    'patient_journey',
    'questionnaires',
    'prescription_history',
    'prescription_email',
    'custom_templates',
    'multi_clinic',
    'advanced_analytics',
    'api_access',
    'priority_support',
  ],
};

// Check if a tier has access to a specific feature
export const hasFeatureAccess = (
  tier: SubscriptionTier | null | undefined,
  feature: FeatureKey
): boolean => {
  if (!tier) return false;
  const normalizedTier = tier.toLowerCase() as SubscriptionTier;
  return TIER_FEATURES[normalizedTier]?.includes(feature) || false;
};

// Get feature display names
export const FEATURE_NAMES: Record<FeatureKey, string> = {
  prescriptions: 'Prescription Builder',
  appointments: 'Appointment Management',
  patient_management: 'Patient Management',
  analytics: 'Analytics & Reports',
  telemedicine: 'Telemedicine Integration',
  patient_journey: 'Patient Journey Tracker',
  questionnaires: 'Questionnaires',
  prescription_history: 'Prescription History',
  prescription_email: 'Email Prescriptions',
  custom_templates: 'Custom Templates',
  multi_clinic: 'Multi-Clinic Management',
  advanced_analytics: 'Advanced Analytics',
  api_access: 'API Access',
  priority_support: 'Priority Support',
};

// Get minimum tier required for a feature
export const getMinimumTier = (feature: FeatureKey): SubscriptionTier => {
  for (const [tier, features] of Object.entries(TIER_FEATURES)) {
    if (features.includes(feature)) {
      return tier as SubscriptionTier;
    }
  }
  return 'enterprise';
};
