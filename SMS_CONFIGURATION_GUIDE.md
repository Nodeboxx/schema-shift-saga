# SMS Configuration Guide - BulkSMS BD Integration

This guide explains how to configure and use the SMS notification system integrated with BulkSMS BD for sending appointment reminders, OTP verification, prescription links, and more.

## 🔧 Configuration

### 1. Admin Dashboard Setup

1. Navigate to `/admin` → **API & Integration Settings**
2. Go to the **Email/SMS** tab
3. Scroll to the **BulkSMS BD** section
4. Enter your credentials:
   - **API Key**: Your BulkSMS BD API key (e.g., `XQ6vD6omFQ21oVypfsjM`)
   - **Sender ID**: Your approved sender ID (e.g., `8809617626936`)
5. Click **Save Settings**

### 2. Environment Secrets

The following secrets are automatically configured in the backend:
- `BULKSMS_API_KEY`: Your BulkSMS BD API key
- `BULKSMS_SENDER_ID`: Your approved sender ID

## 📱 SMS Features

### Supported SMS Types

1. **Appointment Created**
   - Sent when a new appointment is booked
   - Includes doctor name, appointment date, and clinic details

2. **Appointment Approved**
   - Sent when an appointment is approved by the clinic/doctor
   - Confirms the appointment is scheduled

3. **Appointment Reminder**
   - Sent 24 hours before the appointment
   - Reminds patient to arrive 10 minutes early

4. **Appointment Rescheduled**
   - Sent when an appointment date/time is changed
   - Includes new appointment details

5. **Prescription Link**
   - Sent when a prescription is created
   - Includes a link to view the prescription

6. **OTP Verification**
   - Sent for account verification
   - 6-digit code valid for 10 minutes

7. **Password Reset**
   - Sent when user requests password reset
   - Includes reset code valid for 15 minutes

## 🎯 Enable/Disable SMS Notifications

1. Navigate to `/admin` → **Notifications**
2. Toggle switches for each SMS notification type:
   - ✅ Green = Enabled
   - ⬜ Gray = Disabled
3. Changes are saved automatically

## 💻 Developer Usage

### Send SMS Programmatically

```typescript
import { sendSMS } from "@/services/smsService";

// Basic SMS
await sendSMS({
  phoneNumber: "01712345678",
  message: "Your message here"
});

// Using helper functions
import { 
  sendAppointmentCreatedSMS,
  sendAppointmentReminderSMS,
  sendPrescriptionLinkSMS,
  sendOTPSMS
} from "@/services/smsService";

// Appointment Created
await sendAppointmentCreatedSMS(
  "01712345678",
  "John Doe",
  "Dr. Smith",
  "25 Jan 2024, 10:00 AM",
  "MedRxPro"
);

// OTP
await sendOTPSMS(
  "01712345678",
  "123456",
  "MedRxPro"
);
```

### Dual Notifications (Email + SMS)

The notification service automatically sends both email and SMS when phone number is provided:

```typescript
import { sendAppointmentCreatedEmail } from "@/services/notificationService";

// Sends both email and SMS
await sendAppointmentCreatedEmail(
  "patient@example.com",
  "John Doe",
  "Dr. Smith",
  "25 Jan 2024, 10:00 AM",
  "in-person",
  "MedRxPro",
  "01712345678" // Phone number enables SMS
);
```

## 🔍 Phone Number Format

The system automatically cleans phone numbers by removing:
- Spaces
- Dashes
- Parentheses
- Other non-numeric characters

**Supported Formats:**
- `01712345678`
- `+8801712345678`
- `880-1712-345678`
- `(880) 1712-345678`

## 📊 Response Codes

### Success
- **202**: SMS Submitted Successfully

### Errors
| Code | Meaning |
|------|---------|
| 1001 | Invalid Number |
| 1002 | Sender ID not correct/disabled |
| 1003 | Required fields missing |
| 1005 | Internal Error |
| 1006 | Balance Validity Not Available |
| 1007 | Balance Insufficient |
| 1011 | User ID not found |
| 1012 | Masking SMS must be sent in Bengali |
| 1031 | Account Not Verified |
| 1032 | IP Not whitelisted |

## 🔐 Security Best Practices

1. **Never expose API keys in frontend code**
   - All SMS sending happens through edge functions
   - API keys are stored securely as environment variables

2. **Rate Limiting**
   - Implement rate limiting to prevent SMS spam
   - Track SMS sending per user/phone number

3. **OTP Guidelines**
   - Use 6-digit codes
   - Set expiration time (10-15 minutes)
   - Format: "Your {Brand Name} OTP is XXXXXX"

## 🧪 Testing

### Test SMS Sending

1. Go to `/admin` → **API & Integration Settings**
2. Configure your BulkSMS BD credentials
3. Go to **Notifications** tab
4. Enable desired SMS notifications
5. Create a test appointment or trigger any SMS event
6. Check your phone for the SMS

### Monitor SMS Logs

Check the Lovable Cloud logs to see SMS sending status:
- Success/failure status
- Response codes
- Error messages
- Delivery confirmation

## 🚀 Automated SMS Triggers

The following events automatically trigger SMS (when enabled):

1. **Appointment Created** → Immediate SMS
2. **Appointment Approved** → Immediate SMS
3. **Appointment Reminder** → Sent 24 hours before appointment
4. **Appointment Rescheduled** → Immediate SMS
5. **Prescription Created** → Immediate SMS with link
6. **OTP Request** → Immediate SMS with code
7. **Password Reset** → Immediate SMS with reset code

## 💰 Pricing & Credits

BulkSMS BD charges per SMS sent. Make sure to:
1. Check your balance regularly at [BulkSMS BD Dashboard](http://bulksmsbd.net/api/getBalanceApi?api_key=YOUR_API_KEY)
2. Monitor SMS usage to control costs
3. Set up low balance alerts

## 📞 Support

For BulkSMS BD specific issues:
- Website: https://bulksmsbd.net
- Documentation: https://bulksmsbd.net/developers

For MedRxPro SMS integration issues:
- Check Lovable Cloud logs
- Verify API credentials are correct
- Ensure sender ID is approved by BulkSMS BD
- Confirm account balance is sufficient

## ✅ Checklist

- [ ] BulkSMS BD account created
- [ ] Sender ID approved
- [ ] API credentials configured in admin panel
- [ ] Secrets added in backend
- [ ] SMS notifications enabled in admin panel
- [ ] Test SMS sent successfully
- [ ] Monitoring setup for SMS delivery
