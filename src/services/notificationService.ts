import { supabase } from "@/integrations/supabase/client";

interface SendNotificationParams {
  eventType: string;
  recipientEmail: string;
  recipientName: string;
  templateData: Record<string, string>;
}

export const sendNotification = async (params: SendNotificationParams) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification", {
      body: params,
    });

    if (error) {
      console.error("Error sending notification:", error);
      return { success: false, error };
    }

    console.log("Notification sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception sending notification:", error);
    return { success: false, error };
  }
};

// Helper functions for specific events
export const sendPrescriptionCreatedEmail = async (
  patientEmail: string,
  patientName: string,
  doctorName: string,
  prescriptionDate: string,
  prescriptionUrl: string,
  clinicName: string = "MedRxPro"
) => {
  return sendNotification({
    eventType: "prescription_created",
    recipientEmail: patientEmail,
    recipientName: patientName,
    templateData: {
      patient_name: patientName,
      doctor_name: doctorName,
      prescription_date: prescriptionDate,
      prescription_url: prescriptionUrl,
      clinic_name: clinicName,
    },
  });
};

export const sendAppointmentCreatedEmail = async (
  patientEmail: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  appointmentType: string,
  clinicName: string = "MedRxPro"
) => {
  return sendNotification({
    eventType: "appointment_created",
    recipientEmail: patientEmail,
    recipientName: patientName,
    templateData: {
      patient_name: patientName,
      doctor_name: doctorName,
      appointment_date: appointmentDate,
      appointment_type: appointmentType,
      clinic_name: clinicName,
    },
  });
};

export const sendAppointmentApprovedEmail = async (
  patientEmail: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  clinicName: string = "MedRxPro",
  clinicAddress: string = "Visit our clinic"
) => {
  return sendNotification({
    eventType: "appointment_approved",
    recipientEmail: patientEmail,
    recipientName: patientName,
    templateData: {
      patient_name: patientName,
      doctor_name: doctorName,
      appointment_date: appointmentDate,
      clinic_name: clinicName,
      clinic_address: clinicAddress,
    },
  });
};

export const sendAppointmentReminderEmail = async (
  patientEmail: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  clinicName: string = "MedRxPro",
  clinicAddress: string = "Visit our clinic"
) => {
  return sendNotification({
    eventType: "appointment_reminder",
    recipientEmail: patientEmail,
    recipientName: patientName,
    templateData: {
      patient_name: patientName,
      doctor_name: doctorName,
      appointment_date: appointmentDate,
      clinic_name: clinicName,
      clinic_address: clinicAddress,
    },
  });
};

export const sendAppointmentRescheduledEmail = async (
  patientEmail: string,
  patientName: string,
  doctorName: string,
  newAppointmentDate: string,
  oldAppointmentDate: string,
  clinicName: string = "MedRxPro"
) => {
  return sendNotification({
    eventType: "appointment_rescheduled",
    recipientEmail: patientEmail,
    recipientName: patientName,
    templateData: {
      patient_name: patientName,
      doctor_name: doctorName,
      new_appointment_date: newAppointmentDate,
      old_appointment_date: oldAppointmentDate,
      clinic_name: clinicName,
    },
  });
};

export const sendHealthAdviceEmail = async (
  patientEmail: string,
  patientName: string,
  doctorName: string,
  adviceTitle: string,
  adviceMessage: string,
  clinicName: string = "MedRxPro"
) => {
  return sendNotification({
    eventType: "health_advice_sent",
    recipientEmail: patientEmail,
    recipientName: patientName,
    templateData: {
      patient_name: patientName,
      doctor_name: doctorName,
      advice_title: adviceTitle,
      advice_message: adviceMessage,
      clinic_name: clinicName,
    },
  });
};