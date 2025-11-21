// Map CMS pricing plan IDs to subscription tiers
import { SubscriptionTier } from './subscriptionFeatures';

export const PLAN_TIER_MAP: Record<string, SubscriptionTier> = {
  'prescription': 'free',           // Prescription Plan → Free tier
  'appointment_prescription': 'pro', // Appointment + Prescription Plan → Pro tier  
  'fullcare': 'enterprise',          // Full Care Plan → Enterprise tier
  'free': 'free',
  'pro': 'pro',
  'enterprise': 'enterprise',
};

// Get tier from plan ID
export const getTierFromPlanId = (planId: string): SubscriptionTier => {
  return PLAN_TIER_MAP[planId] || 'free';
};

// Get plan ID from tier
export const getPlanIdFromTier = (tier: SubscriptionTier): string => {
  const reverseMap: Record<SubscriptionTier, string> = {
    'free': 'prescription',
    'pro': 'appointment_prescription',
    'enterprise': 'fullcare',
  };
  return reverseMap[tier] || 'prescription';
};

// Get plan display name from tier
export const getPlanNameFromTier = (tier: SubscriptionTier): string => {
  const nameMap: Record<SubscriptionTier, string> = {
    'free': 'Prescription Plan',
    'pro': 'Appointment + Prescription Plan',
    'enterprise': 'Full Care Plan',
  };
  return nameMap[tier] || 'Free Plan';
};
