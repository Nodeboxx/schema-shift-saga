# Notifications & Questionnaires System Guide

## 📋 Patient Questionnaires System

### Overview
The questionnaires system allows doctors to create pre-consultation forms that patients can fill out before appointments. This helps gather important medical information efficiently.

### How It Works

#### For Doctors:
1. **Create Templates** (`/questionnaires`)
   - Click "New Template" button
   - Add questions (text, multiple choice, date, etc.)
   - Set questions as required or optional
   - Categorize (pre-consultation, screening, pediatric, etc.)
   - Save and activate

2. **Assign to Patients**
   - Link questionnaires to appointments via `appointment_id`
   - Link to patient journeys via `journey_id`
   - Send invitation email to patient with questionnaire link

3. **View Responses**
   - Go to "Patient Responses" tab
   - Filter by patient, date, or template
   - Review answers before consultation

#### For Patients:
1. Receive email invitation with questionnaire link
2. Fill out the form online
3. Submit responses before appointment
4. Doctor reviews during consultation

### Database Structure
- `questionnaire_templates`: Stores the template questions created by doctors
- `questionnaire_responses`: Stores patient answers linked to appointments/journeys

### Integration Points
- **Appointments**: Attach questionnaire when creating appointment
- **Patient Journeys**: Track long-term health questionnaires
- **Email Notifications**: Auto-send questionnaire links to patients

---

## 📧 Notification System

### Overview
Automated email notification system that sends emails for key events in the medical workflow.

### Supported Events

#### 1. **Prescription Created**
- **Trigger**: When doctor saves a prescription
- **Recipient**: Patient
- **Content**: Prescription details, view link, doctor info
- **Template**: `prescription` category

#### 2. **Appointment Created**
- **Trigger**: When new appointment is scheduled
- **Recipient**: Patient
- **Content**: Appointment date, time, doctor name, type
- **Template**: `appointment` category

#### 3. **Appointment Approved**
- **Trigger**: When appointment status changes to "approved"
- **Recipient**: Patient
- **Content**: Confirmation, appointment details, clinic address
- **Template**: `appointment` category

#### 4. **Appointment Reminder**
- **Trigger**: 24 hours before appointment (scheduled task)
- **Recipient**: Patient
- **Content**: Reminder details, arrive early message
- **Template**: `reminder` category

#### 5. **Appointment Rescheduled**
- **Trigger**: When appointment date/time is updated
- **Recipient**: Patient
- **Content**: Old and new dates, reason if provided
- **Template**: `appointment` category

#### 6. **Health Advice**
- **Trigger**: When doctor sends health advice to patient
- **Recipient**: Patient
- **Content**: Advice title, message, doctor name
- **Template**: `health_advice` category

### How to Use

#### Send Notification (Code Example)
```typescript
import { sendPrescriptionCreatedEmail } from "@/services/notificationService";

// After creating a prescription
await sendPrescriptionCreatedEmail(
  patientEmail,
  patientName,
  doctorName,
  prescriptionDate,
  prescriptionUrl,
  clinicName
);
```

#### Manage Templates (`/notifications`)
1. Go to "Email Templates" tab
2. Click "New Template" to create custom templates
3. Use variables like `{{patient_name}}`, `{{doctor_name}}` in content
4. Activate/deactivate templates as needed

#### Configure Notifications
1. Go to "Settings" tab in `/notifications`
2. Toggle email notifications on/off for each event type
3. Changes take effect immediately

### Email Service
- Uses **Resend** for reliable email delivery
- Templates are customizable per clinic
- Variables are auto-replaced with actual data
- HTML email support with professional styling

### Database Structure
- `email_templates`: Stores reusable email templates
- `notifications_config`: Controls which notifications are enabled
- Edge Function: `send-notification` handles email sending

### Setup Required
1. Add `RESEND_API_KEY` secret (already done ✅)
2. Verify domain in Resend dashboard
3. Update "from" email address in edge function to your verified domain

---

## 🔄 Integration Workflow

### Example: Complete Appointment Flow
1. **Patient books appointment** → `appointment_created` email sent
2. **Doctor approves** → `appointment_approved` email sent
3. **System sends reminder** → 24h before, `appointment_reminder` sent
4. **If rescheduled** → `appointment_rescheduled` email sent
5. **After visit, prescription created** → `prescription_created` email sent
6. **Doctor sends follow-up advice** → `health_advice` email sent

### Example: Questionnaire Flow
1. **Doctor creates questionnaire template**
2. **Links to appointment** when scheduling
3. **Patient receives email** with questionnaire link
4. **Patient fills out form** online
5. **Doctor reviews responses** before consultation
6. **Responses stored** in `questionnaire_responses` table

---

## 🛠️ Developer Notes

### Adding New Notification Types
1. Add event type to `notifications_config` table
2. Create email template in `email_templates` table
3. Add helper function in `src/services/notificationService.ts`
4. Call the function when event occurs

### Customizing Email Templates
- Edit templates in `/notifications` UI
- Use HTML for rich formatting
- Include variables: `{{variable_name}}`
- Test with sample data before enabling

### Troubleshooting
- Check edge function logs if emails don't send
- Verify Resend API key is set correctly
- Ensure notification config is enabled for event type
- Check that email template exists and is active

---

## 📊 Demo Data Included

### Questionnaire Templates
1. **General Health Assessment** - Basic health screening
2. **COVID-19 Screening** - Symptoms and exposure check
3. **Pediatric Assessment** - Health form for children

### Email Templates
1. Prescription Created
2. Appointment Created
3. Appointment Approved
4. Appointment Reminder
5. Appointment Rescheduled
6. Health Advice

All templates are pre-configured and ready to use!