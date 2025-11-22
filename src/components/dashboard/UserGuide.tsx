import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Calendar, Video, ScanLine, BarChart3, Settings, Mail, Bell } from "lucide-react";

export const UserGuide = () => {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          User Guide - Getting Started
        </CardTitle>
        <CardDescription>
          Complete guide to using all features of MedRxPro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {/* Patient Management */}
          <AccordionItem value="patients">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Patient Management
                <Badge variant="secondary">Essential</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Adding Patients</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Navigate to "My Patients" tab</li>
                  <li>Click "Add Patient" button</li>
                  <li>Fill in patient details (name, age, sex, contact info)</li>
                  <li>
                    <strong>Optional:</strong> Check "Send invitation to create patient account" to allow 
                    patients to access their own portal
                  </li>
                  <li>Click "Save Patient"</li>
                </ol>
              </div>
              
              <div className="space-y-2 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300">Patient Registration Status</h4>
                <ul className="space-y-1 ml-2">
                  <li><Badge variant="default" className="mr-2">✓ Registered</Badge> Patient has created their account</li>
                  <li><Badge variant="secondary" className="mr-2">Invited</Badge> Invitation sent, pending acceptance</li>
                  <li><Badge variant="outline" className="mr-2">Not Invited</Badge> Patient record only, no portal access</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Managing Patients</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Search patients by name, phone, or email</li>
                  <li>Click on any patient row to view full details</li>
                  <li>Use edit icon to update patient information</li>
                  <li>Delete patients using the trash icon</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Prescriptions */}
          <AccordionItem value="prescriptions">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Creating Prescriptions
                <Badge variant="secondary">Essential</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Quick Start</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "New Prescription" from dashboard or navigation</li>
                  <li>Select patient (or enter new patient details)</li>
                  <li>Fill in patient vitals and examination findings</li>
                  <li>Add medicines using autocomplete search</li>
                  <li>Add advice, diagnosis, and follow-up instructions</li>
                  <li>Save and print prescription</li>
                </ol>
              </div>

              <div className="space-y-2 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-300">Pro Tips</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Use voice input for faster prescription creation</li>
                  <li>Prescriptions are automatically saved as you type</li>
                  <li>QR code is generated for verification</li>
                  <li>Previous prescriptions can be accessed from "Prescriptions" menu</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appointments */}
          <AccordionItem value="appointments">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Appointment Management
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Managing Appointments</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Navigate to "Appointments" from the main menu</li>
                  <li>View appointments in calendar or list view</li>
                  <li>Click "New Appointment" to schedule</li>
                  <li>Select patient, date, time, and appointment type</li>
                  <li>Add notes if needed</li>
                  <li>Approve or cancel appointments as needed</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Appointment Types</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>In-Person:</strong> Traditional clinic visit</li>
                  <li><strong>Telemedicine:</strong> Virtual consultation via video/voice</li>
                  <li><strong>Follow-up:</strong> Scheduled check-in visit</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Telemedicine */}
          <AccordionItem value="telemedicine">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Telemedicine Consultations
                <Badge variant="outline">Premium</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Starting a Telemedicine Session</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Create a telemedicine appointment for the patient</li>
                  <li>When ready, click "Start Session" from appointments</li>
                  <li>Patient will receive notification to join</li>
                  <li>Patient logs into their dashboard and joins the session</li>
                  <li>Communicate via video, voice, or text chat</li>
                  <li>End session when consultation is complete</li>
                </ol>
              </div>

              <div className="space-y-2 bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">Requirements</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Patient must have a registered account (invite them first)</li>
                  <li>Stable internet connection required</li>
                  <li>Browser must allow camera/microphone access</li>
                  <li>Session includes real-time chat, voice, and video</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* QR Verification */}
          <AccordionItem value="verification">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-primary" />
                Prescription Verification
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Verifying Prescriptions</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Navigate to "Verify Patient" tab on dashboard</li>
                  <li>Click "Start Scanning"</li>
                  <li>Allow camera access when prompted</li>
                  <li>Point camera at prescription QR code</li>
                  <li>View prescription details and verify authenticity</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Why Verification Matters</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Prevents prescription fraud</li>
                  <li>Ensures patient identity</li>
                  <li>Tracks prescription history</li>
                  <li>Validates authenticity instantly</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Analytics */}
          <AccordionItem value="analytics">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Reports & Analytics
                <Badge variant="outline">Premium</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Available Reports</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Appointment Analytics:</strong> Track visit patterns and trends</li>
                  <li><strong>Patient Demographics:</strong> Understand your patient base</li>
                  <li><strong>Prescription Analytics:</strong> Monitor prescription patterns</li>
                  <li><strong>Revenue Analytics:</strong> Track earnings and financial trends</li>
                  <li><strong>Research Insights:</strong> Export data for research purposes</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Accessing Reports</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to "Reports" tab on dashboard</li>
                  <li>Or navigate to "Analytics" from main menu</li>
                  <li>Select date range for analysis</li>
                  <li>View interactive charts and graphs</li>
                  <li>Export data as needed</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Settings */}
          <AccordionItem value="settings">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Profile & Settings
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Customizing Your Profile</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Settings" from navigation menu</li>
                  <li>Update your professional information</li>
                  <li>Upload profile photo and council logo</li>
                  <li>Configure prescription templates</li>
                  <li>Set notification preferences</li>
                  <li>Manage subscription settings</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Important Settings</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Profile:</strong> Name, degrees, specialization, contact info</li>
                  <li><strong>Templates:</strong> Customize prescription layout and content</li>
                  <li><strong>Notifications:</strong> Email and SMS notification preferences</li>
                  <li><strong>Security:</strong> Password change and security settings</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Patient Portal */}
          <AccordionItem value="patient-portal">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Patient Portal Access
                <Badge>New</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Inviting Patients to Portal</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>When adding/editing a patient, check "Send invitation"</li>
                  <li>System sends email with secure invitation link</li>
                  <li>Patient clicks link and sets their password</li>
                  <li>Patient gains access to their personal dashboard</li>
                </ol>
              </div>

              <div className="space-y-2 bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                <h4 className="font-semibold text-amber-700 dark:text-amber-300">What Patients Can Access</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>View all their prescriptions (read-only)</li>
                  <li>Check upcoming and past appointments</li>
                  <li>Join telemedicine sessions when scheduled</li>
                  <li>View medical history and test results</li>
                  <li>Update their personal information</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Getting Help */}
          <AccordionItem value="help">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Getting Help & Support
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Need Assistance?</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check notifications for important updates</li>
                  <li>Visit Settings → Help Center for documentation</li>
                  <li>Contact support through the help menu</li>
                  <li>Join our community forum for tips and tricks</li>
                </ul>
              </div>

              <div className="space-y-2 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                <h4 className="font-semibold text-red-700 dark:text-red-300">Quick Tips</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Save work frequently (auto-save is enabled)</li>
                  <li>Keep patient data secure and confidential</li>
                  <li>Review subscription status regularly</li>
                  <li>Update profile information to keep it current</li>
                  <li>Enable notifications for appointment reminders</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};