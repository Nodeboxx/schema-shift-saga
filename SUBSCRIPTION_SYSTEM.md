# Subscription System Documentation

## Overview
Complete subscription management system with trials, payments, admin controls, and automated expiry handling.

## Features Implemented

### 1. **Checkout & Authentication**
- Embedded login/signup in checkout page
- Multiple payment methods:
  - Credit/Debit Card (instant activation)
  - bKash (pending approval)
  - Wire Transfer (pending approval)
- Seamless flow from pricing page to checkout

### 2. **User Dashboard**
- **Subscription Manager Card**:
  - Visual progress bar (green/orange/red based on remaining days)
  - Shows start date, end date, remaining days
  - Upgrade/renew buttons
  - Trial start button for new users

- **Subscription Gate**:
  - Blocks access to premium features
  - Redirects to subscription page
  - Used on: Prescriptions, Patients, Reports

- **Expiry Banner**:
  - Shows warning when 7 days or less remaining
  - Urgent alert when 3 days or less
  - Dismissible notification

### 3. **Admin Dashboard**
- **Subscriptions Management Tab**:
  - View all subscriptions
  - Approve/Reject pending orders
  - Edit any subscription:
    - Change tier (free, basic, professional, premium)
    - Change status (trial, active, inactive, cancelled)
    - Extend/reduce subscription dates
  - Real-time stats dashboard

- **Stats Cards**:
  - Total subscriptions
  - Active subscriptions
  - Monthly recurring revenue (MRR)
  - Trial users count

### 4. **Trial System**
- 14-day free trial with Basic tier features
- One-click trial activation
- Automatic expiry handling
- Warning notifications before expiry

### 5. **Automated Background Jobs**
Two edge functions for automation:

#### `check-subscription-status`
- Runs daily to check expired trials and subscriptions
- Auto-deactivates expired accounts
- Updates user status to "inactive"

#### `send-subscription-notifications`
- Sends email notifications for:
  - Subscription approved
  - Subscription rejected
  - Trial ending (3 days before)
  - Subscription expiring (7 days before)

### 6. **Real-time Updates**
- Subscription changes reflect immediately across the app
- Uses Supabase realtime subscriptions
- Auto-refresh on status changes

## Database Schema

### New Columns in `subscriptions`:
```sql
- payment_method (text): card, bkash, wire
- payment_reference (text): Transaction ID
- approved_by (uuid): Admin who approved
- approved_at (timestamp): Approval timestamp
- next_billing_date (date): Next billing cycle
- auto_renew (boolean): Auto-renewal flag
```

### New Columns in `profiles`:
```sql
- trial_started_at (timestamp): Trial start date
- subscription_start_date (date): Subscription start
- subscription_end_date (date): Subscription end
```

## User Flows

### Flow 1: New User Registration
1. User signs up → Goes to dashboard
2. Sees subscription manager with "Start Trial" button
3. Clicks trial → 14-day trial activated
4. Can access all features during trial
5. Gets warning 3 days before expiry
6. After expiry, features locked until upgrade

### Flow 2: Direct Plan Purchase
1. User clicks pricing plan → Goes to checkout
2. Not logged in → Shows login/signup form
3. Logs in/signs up → Payment form appears
4. Selects payment method → Submits
5. **Card payment**: Instant activation
6. **bKash/Wire**: Order goes to admin for approval
7. Admin approves → User gets notification
8. Subscription activated → Full access

### Flow 3: Admin Management
1. Admin goes to Subscriptions tab
2. Sees all subscriptions with filters
3. Pending orders show Approve/Reject buttons
4. Can edit any subscription:
   - Upgrade/downgrade tier
   - Extend expiry date
   - Change status
   - Reactivate cancelled subscriptions

## Setup Instructions

### 1. Cron Job Configuration (Optional)
To enable automated expiry checking, set up a cron job:

```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * curl -X POST https://your-project.supabase.co/functions/v1/check-subscription-status
```

Or use GitHub Actions, Vercel Cron, or any cron service.

### 2. Email Configuration
Configure SMTP settings in Admin Dashboard → SMTP Settings to enable email notifications.

### 3. Payment Gateway Integration
For production:
- Configure bKash merchant API
- Set up wire transfer bank details in Admin → Site Settings
- Integrate card payment gateway (Stripe, SSLCommerz, etc.)

## API Endpoints

### Edge Functions

#### Check Subscription Status
```
POST /functions/v1/check-subscription-status
```
Returns:
```json
{
  "success": true,
  "expiredTrials": 5,
  "expiredSubscriptions": 2
}
```

#### Send Notification
```
POST /functions/v1/send-subscription-notifications
Body: {
  "type": "subscription_approved",
  "subscriptionId": "uuid",
  "userId": "uuid"
}
```

## Security

### RLS Policies
- Users can only view their own subscriptions
- Admins can view/manage all subscriptions
- Subscription approval requires super_admin role
- Payment references are protected

### Subscription Gates
- All premium features check subscription status
- Real-time validation prevents bypassing
- Expired subscriptions auto-block access

## Testing

### Test Scenarios
1. **New user trial**:
   - Register → Start trial → Access features → Wait for expiry

2. **Card payment**:
   - Select plan → Login → Pay with card → Instant access

3. **Manual payment**:
   - Select plan → Choose bKash/Wire → Submit → Admin approves

4. **Admin controls**:
   - Extend subscription → User gets more days
   - Downgrade tier → Features adjust
   - Deactivate → User loses access

## Troubleshooting

### Issue: Subscription not activating
- Check RLS policies are correct
- Verify admin approval for manual payments
- Check subscription_status in profiles table

### Issue: Features not blocking
- Ensure SubscriptionGate is wrapping components
- Check useSubscriptionCheck hook is called
- Verify subscription dates are correct

### Issue: Notifications not sending
- Configure SMTP settings
- Check edge function logs
- Verify email addresses are valid

## Future Enhancements
- Automated payment processing (Stripe webhooks)
- Invoice generation and download
- Usage-based billing
- Proration for upgrades/downgrades
- Discount codes and coupons
- Referral system
- Multi-currency support
