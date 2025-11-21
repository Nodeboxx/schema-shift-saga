# Subscription System - Complete Verification Guide

## Current Database State
✅ Users have correct tier values: `free`, `pro`, `enterprise`
✅ Trial users are set to `free` tier

## Feature Access Matrix

### Free Tier (Trial Users)
**Duration**: 14-day free trial (one-time per lifetime)
**Tier**: `free`

✅ **Included Features**:
- Prescriptions (Smart Prescription Builder)
- Patient Management (Required to create prescriptions)
- Custom Templates
- Email/WhatsApp/Messenger sharing
- Medicine Database (28,000+)
- Header-less Print Support

❌ **NOT Included**:
- Appointments
- Analytics & Reports
- Telemedicine
- Patient Journey Tracker
- Questionnaires

### Pro Tier (Appointment + Prescription Plan - ৳1,000/month)
**Tier**: `pro`

✅ **Everything in Free PLUS**:
- Online Appointment Scheduling
- Appointment Calendar (Day/Week/Month view)
- Auto SMS Reminders
- Time Slot Management
- Walk-In & Scheduled Patients
- Appointment History
- Telemedicine Integration
- Basic Analytics

❌ **NOT Included**:
- Patient Journey Tracker
- Questionnaires
- Advanced Analytics
- API Access

### Enterprise Tier (Full Care Plan - ৳2,000/month)
**Tier**: `enterprise`

✅ **Everything in Pro PLUS**:
- Patient Journey Tracker
- Progress & Milestone Monitoring
- Health Advice Notifications
- Multidisciplinary care support
- Patient Questionnaires
- Doctor-Patient Engagement Tools
- Advanced Analytics & Reports
- Clinical Insights & Research Support
- Personalised Onboarding
- Priority Feature Requests
- Dedicated Team Training

---

## Testing Scenarios

### ✅ Test 1: Free Trial User Access
**Steps**:
1. Sign up as new user
2. Start free trial (14 days)
3. Try to access features

**Expected Results**:
- ✅ Can create prescriptions
- ✅ Can add/manage patients
- ✅ Can view "My Patients" tab
- ❌ "Appointments" menu should show lock screen
- ❌ "Analytics" tab should show lock screen
- ❌ "Questionnaires" should show lock screen

**What to Check**:
- Dashboard shows "Free Trial" badge
- 14 days remaining counter
- Can create prescription with patient selection
- Locked features show "Required: pro" or "Required: enterprise"

### ✅ Test 2: One-Time Trial Restriction
**Steps**:
1. User completes trial (or it expires)
2. User tries to start trial again

**Expected Results**:
- ❌ "Trial Already Used" error message
- Must choose paid plan

### ✅ Test 3: Admin Subscription Management
**Steps**:
1. Admin Dashboard → Subscriptions
2. Find a user
3. Use Quick Actions:
   - "Start Trial" → Sets tier: `free`, status: `trial`, 14 days
   - "Activate Pro" → Sets tier: `pro`, status: `active`, end date +1 month
   - "Activate Enterprise" → Sets tier: `enterprise`, status: `active`, end date +1 month

**Expected Results**:
- User's dashboard updates immediately (realtime)
- User gets access to features for their new tier
- No data loss when changing tiers

### ✅ Test 4: Tier-Based Feature Gating
**User on Free Trial tries to access Appointments**:

**Expected Screen**:
```
🔒 Premium Feature Locked

Current: free → Required: pro

Appointment Management is available on the pro plan

Upgrade your plan to unlock this feature and many more powerful tools for your practice.

[View Plans & Pricing] [Go to Dashboard]
```

### ✅ Test 5: Data Preservation
**Steps**:
1. User on Enterprise creates:
   - 10 patients
   - 5 prescriptions
   - 3 appointments
   - 2 patient journeys
2. Admin downgrades user to Free tier
3. Check data

**Expected Results**:
- ✅ All 10 patients still exist in database
- ✅ All 5 prescriptions still exist
- ✅ All 3 appointments still exist
- ✅ All 2 patient journeys still exist
- ❌ User cannot VIEW appointments (locked)
- ❌ User cannot VIEW patient journeys (locked)
- ✅ User CAN still view patients and prescriptions
- ✅ When user upgrades again, all data is accessible

---

## Database Queries for Verification

### Check User Subscription Details
```sql
SELECT 
  email,
  subscription_tier,
  subscription_status,
  trial_started_at,
  trial_ends_at,
  subscription_end_date,
  CASE 
    WHEN subscription_status = 'trial' AND trial_ends_at > NOW() THEN 'Active Trial'
    WHEN subscription_status = 'active' AND subscription_end_date > NOW() THEN 'Active Subscription'
    WHEN subscription_status = 'cancelled' AND subscription_end_date > NOW() THEN 'Cancelled (Still Active)'
    ELSE 'Expired/Inactive'
  END as access_status
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
```

### Verify No Old Tier Values
This should return ZERO rows:
```sql
SELECT id, email, subscription_tier
FROM profiles
WHERE subscription_tier NOT IN ('free', 'pro', 'enterprise', null);
```

### Check Data Preservation
For a specific user:
```sql
-- Check if data exists even when downgraded
SELECT 
  (SELECT COUNT(*) FROM patients WHERE user_id = 'USER_ID_HERE') as patients_count,
  (SELECT COUNT(*) FROM prescriptions WHERE user_id = 'USER_ID_HERE') as prescriptions_count,
  (SELECT COUNT(*) FROM appointments WHERE doctor_id = 'USER_ID_HERE') as appointments_count,
  (SELECT COUNT(*) FROM patient_journeys WHERE doctor_id = 'USER_ID_HERE') as journeys_count;
```

---

## Real-Time Updates Verification

### Admin → User Dashboard Sync
**How it works**:
- Uses Supabase Realtime `postgres_changes` listener
- Listens to `profiles` table updates
- When admin changes subscription, user dashboard auto-refreshes

**Test**:
1. Open user dashboard in one browser
2. Open admin panel in another browser
3. Change user's subscription in admin panel
4. Watch user dashboard update within 1-2 seconds

**Files**:
- `src/hooks/useSubscriptionCheck.ts` - Realtime listener
- `src/components/subscription/SubscriptionManager.tsx` - Displays status

---

## Key Files

### Subscription Logic
- `src/lib/subscriptionFeatures.ts` - Feature access matrix
- `src/lib/planMapping.ts` - Maps CMS plan IDs to tier enum
- `src/components/subscription/SubscriptionGate.tsx` - Feature gate component
- `src/components/subscription/SubscriptionManager.tsx` - User subscription UI
- `src/hooks/useSubscriptionCheck.ts` - Realtime subscription checker

### Admin Management
- `src/components/admin/AdminSubscriptions.tsx` - Admin subscription manager
- Quick Actions: Start Trial, Activate Pro, Activate Enterprise
- Quick Extend: +1 Month, +3 Months, +6 Months, +1 Year

### Checkout Flow
- `src/pages/Checkout.tsx` - Maps plan ID → tier using `getTierFromPlanId()`
- `src/components/subscription/UpgradeModal.tsx` - In-app upgrade flow

---

## Expected Behavior Summary

### ✅ What Works:
1. **Tier-based access**: Free users see locks on pro/enterprise features
2. **One-time trial**: Users can only use trial once (tracked via `trial_started_at`)
3. **Data preservation**: Downgrading tier doesn't delete data
4. **Real-time updates**: Admin changes reflect instantly in user dashboard
5. **Correct tier mapping**: Checkout/Upgrade correctly maps plan IDs to tiers
6. **Admin gifting**: Admins can set any tier for any user

### ❌ What's Blocked:
- Free users accessing Appointments, Analytics, Questionnaires, Patient Journey
- Pro users accessing Patient Journey, Questionnaires, Advanced Analytics
- Users trying to start trial twice

---

## Console Logging

When testing, open browser console (F12 → Console) to see:
```
SubscriptionGate: {
  feature: "appointments",
  effectiveTier: "free",
  tierAccess: false,
  status: "trial"
}
```

This helps debug access issues.

---

## Troubleshooting

### Issue: Free trial user sees all features
**Check**:
1. User's `subscription_tier` in database is `'free'`
2. Console shows `effectiveTier: 'free'` and `tierAccess: false` for locked features
3. `SubscriptionGate` component is wrapping the feature

### Issue: Trial can be started multiple times
**Check**:
1. `trial_started_at` is being set when trial starts
2. `SubscriptionManager.startTrial()` checks for existing `trial_started_at`

### Issue: Admin changes don't reflect immediately
**Check**:
1. Realtime listener is active in `useSubscriptionCheck.ts`
2. Database `profiles` table has realtime enabled
3. User refreshes browser if listener fails

---

## Success Criteria

The system is working correctly when:

- ✅ Free trial users can ONLY access: Prescriptions + Patients
- ✅ Pro users can access: Prescriptions + Patients + Appointments + Analytics
- ✅ Enterprise users can access: Everything
- ✅ Users cannot restart trial after first use
- ✅ Admin can gift/change any subscription
- ✅ User data is never deleted when subscription changes
- ✅ Admin changes reflect instantly in user dashboard
- ✅ Locked features show clear upgrade prompts with tier requirements
