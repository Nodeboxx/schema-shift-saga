import { supabase } from "@/integrations/supabase/client";

interface SendSMSParams {
  phoneNumber: string;
  message: string;
}

export const sendSMS = async ({ phoneNumber, message }: SendSMSParams) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-sms", {
      body: { phoneNumber, message },
    });

    if (error) {
      console.error("Error sending SMS:", error);
      throw new Error(error.message || "Failed to send SMS");
    }

    if (data?.error) {
      console.error("SMS error:", data.error);
      throw new Error(data.error);
    }

    if (!data?.success) {
      throw new Error("SMS sending failed");
    }

    console.log("SMS sent successfully:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Exception sending SMS:", error);
    throw error;
  }
};

// Helper functions for specific SMS events
export const sendAppointmentCreatedSMS = async (
  phoneNumber: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  clinicName: string = "MedRxPro"
) => {
  const message = `Dear ${patientName}, your appointment with Dr. ${doctorName} has been scheduled for ${appointmentDate} at ${clinicName}. Thank you!`;
  return sendSMS({ phoneNumber, message });
};

export const sendAppointmentApprovedSMS = async (
  phoneNumber: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  clinicName: string = "MedRxPro"
) => {
  const message = `Dear ${patientName}, your appointment with Dr. ${doctorName} on ${appointmentDate} at ${clinicName} has been approved. See you soon!`;
  return sendSMS({ phoneNumber, message });
};

export const sendAppointmentReminderSMS = async (
  phoneNumber: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  clinicName: string = "MedRxPro"
) => {
  const message = `Reminder: Dear ${patientName}, you have an appointment with Dr. ${doctorName} tomorrow (${appointmentDate}) at ${clinicName}. Please arrive 10 minutes early.`;
  return sendSMS({ phoneNumber, message });
};

export const sendAppointmentRescheduledSMS = async (
  phoneNumber: string,
  patientName: string,
  doctorName: string,
  newAppointmentDate: string,
  clinicName: string = "MedRxPro"
) => {
  const message = `Dear ${patientName}, your appointment with Dr. ${doctorName} at ${clinicName} has been rescheduled to ${newAppointmentDate}. Thank you for your understanding.`;
  return sendSMS({ phoneNumber, message });
};

export const sendPrescriptionLinkSMS = async (
  phoneNumber: string,
  patientName: string,
  doctorName: string,
  prescriptionUrl: string,
  clinicName: string = "MedRxPro"
) => {
  const message = `Dear ${patientName}, your prescription from Dr. ${doctorName} (${clinicName}) is ready. View: ${prescriptionUrl}`;
  return sendSMS({ phoneNumber, message });
};

export const sendOTPSMS = async (
  phoneNumber: string,
  otp: string,
  clinicName: string = "MedRxPro"
) => {
  const message = `Your ${clinicName} OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  return sendSMS({ phoneNumber, message });
};

export const sendPasswordResetSMS = async (
  phoneNumber: string,
  resetCode: string,
  clinicName: string = "MedRxPro"
) => {
  const message = `Your ${clinicName} password reset code is ${resetCode}. Valid for 15 minutes. If you didn't request this, please ignore.`;
  return sendSMS({ phoneNumber, message });
};
