import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Users, FileText, Calendar, ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Demo = () => {
  const navigate = useNavigate();

  const demoStats = {
    totalPatients: 127,
    totalPrescriptions: 543,
    totalAppointments: 89,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-3 px-6 text-center font-medium">
        🎯 Demo Mode - Experience MedDexPro without signing up!
      </div>

      {/* Header */}
      <div className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">MedDexPro Demo Dashboard</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a demo environment with sample data. Sign up to access full features including unlimited prescriptions and printing capabilities.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="doctor" className="space-y-6">
          <TabsList>
            <TabsTrigger value="doctor">Doctor Dashboard</TabsTrigger>
            <TabsTrigger value="clinic">Clinic Dashboard</TabsTrigger>
            <TabsTrigger value="prescription">Prescription Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="doctor" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => navigate("/demo/prescription")}>
                <FileText className="w-4 h-4 mr-2" />
                Try Creating Prescription
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.totalPatients}</div>
                  <p className="text-xs text-muted-foreground">Demo Data</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.totalPrescriptions}</div>
                  <p className="text-xs text-muted-foreground">Demo Data</p>
                  <Button onClick={() => navigate("/demo/prescription")} size="sm" className="mt-2">
                    Try it now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoStats.totalAppointments}</div>
                  <p className="text-xs text-muted-foreground">Demo Data</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sample Patient Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Sarah Johnson", age: "32", condition: "Hypertension" },
                    { name: "Michael Chen", age: "45", condition: "Diabetes Type 2" },
                    { name: "Emily Rodriguez", age: "28", condition: "Asthma" },
                  ].map((patient, i) => (
                    <div key={i} className="p-3 bg-muted rounded-lg">
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Age: {patient.age} • {patient.condition}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Prescriptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { patient: "Sarah Johnson", date: "Today", medicines: 3 },
                    { patient: "Michael Chen", date: "Yesterday", medicines: 5 },
                    { patient: "Emily Rodriguez", date: "2 days ago", medicines: 2 },
                  ].map((rx, i) => (
                    <div key={i} className="p-3 bg-muted rounded-lg">
                      <div className="font-medium">{rx.patient}</div>
                      <div className="text-sm text-muted-foreground">
                        {rx.date} • {rx.medicines} medicines
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-primary">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Enjoying the demo?</h3>
                <p className="text-muted-foreground mb-4">
                  This is a preview of our doctor dashboard. Explore the prescription feature to see more!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button size="lg" onClick={() => navigate("/demo/prescription")}>
                    Try Prescription Demo
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clinic" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Clinic Dashboard Preview</h3>
              <p className="text-muted-foreground">Manage up to 50 doctors, patients, appointments, payroll, and subscription - all in one place.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all doctors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12 / 50</div>
                  <p className="text-xs text-muted-foreground mt-1">Enterprise plan</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳2,45,000</div>
                  <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">342</div>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Clinic Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <div className="font-medium">Doctor Management</div>
                      <div className="text-sm text-muted-foreground">Add, edit, delete up to 50 doctors. Reset passwords, manage profiles.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <div className="font-medium">Patient Overview</div>
                      <div className="text-sm text-muted-foreground">View all patients across doctors with full medical history.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <div className="font-medium">Appointment Tracking</div>
                      <div className="text-sm text-muted-foreground">Approve, complete, or cancel appointments for entire clinic.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <div className="font-medium">Payroll Management</div>
                      <div className="text-sm text-muted-foreground">Track payments, commissions, bonuses for each doctor.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clinic Branding & Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-2">Custom Branding</div>
                    <div className="text-sm text-muted-foreground">Upload clinic logo, header image, customize colors and styles.</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-2">Team Collaboration</div>
                    <div className="text-sm text-muted-foreground">Invite staff members, assign roles, manage permissions.</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-2">Revenue Analytics</div>
                    <div className="text-sm text-muted-foreground">Track earnings, generate reports, monitor clinic performance.</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prescription" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Smart Prescription Builder</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <div className="font-medium">Medicine Autocomplete</div>
                      <div className="text-sm text-muted-foreground">Search from 12,000+ medicines with brand & generic names</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <div className="font-medium">Voice Input</div>
                      <div className="text-sm text-muted-foreground">Dictate prescriptions using AI-powered voice recognition</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <div className="font-medium">Custom Templates</div>
                      <div className="text-sm text-muted-foreground">Create & save templates for different specialties</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <div className="font-medium">QR Code Verification</div>
                      <div className="text-sm text-muted-foreground">Each prescription gets unique QR for authenticity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Output</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-2">Print & Share</div>
                    <div className="text-sm text-muted-foreground">Download as PDF, print directly, or share via WhatsApp/Email/Messenger</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-2">Bengali & English Support</div>
                    <div className="text-sm text-muted-foreground">Full Unicode support for Bengali text, mixed language prescriptions</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium mb-2">Patient History</div>
                    <div className="text-sm text-muted-foreground">Access previous prescriptions, track medications, view trends</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-primary">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-3">Try the Prescription Feature</h3>
                <p className="text-muted-foreground mb-6">
                  Experience our powerful prescription creation tool with demo data.
                  Limited to 3 medicines in demo mode.
                </p>
                <Button size="lg" onClick={() => navigate("/demo/prescription")}>
                  <FileText className="w-5 h-5 mr-2" />
                  Open Prescription Demo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Demo;
