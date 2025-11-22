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
        🎯 Demo Mode - Experience MedRxPro without signing up!
      </div>

      {/* Header */}
      <div className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">MedRxPro Demo Dashboard</h1>
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

          <TabsContent value="doctor" className="space-y-4">
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-1 bg-muted/30">
              <div className="bg-background rounded-md overflow-hidden">
                {/* Dashboard Header */}
                <div className="border-b bg-card/50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Dr. Ahmed Rahman</h3>
                      <p className="text-xs text-muted-foreground">MBBS, MD (Cardiology)</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => navigate("/demo/prescription")}>
                    <FileText className="w-4 h-4 mr-2" />
                    New Prescription
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="p-4 grid gap-3 md:grid-cols-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Total Patients</span>
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600">127</div>
                    <p className="text-xs text-muted-foreground mt-1">+12 this month</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Prescriptions</span>
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-600">543</div>
                    <p className="text-xs text-muted-foreground mt-1">89 this week</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Appointments</span>
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600">23</div>
                    <p className="text-xs text-muted-foreground mt-1">5 today</p>
                  </div>
                </div>

                {/* Dashboard Tabs Preview */}
                <div className="px-4 pb-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 flex gap-2 border-b">
                      <div className="px-3 py-1 bg-background rounded text-sm font-medium">My Patients</div>
                      <div className="px-3 py-1 text-sm text-muted-foreground">Appointments</div>
                      <div className="px-3 py-1 text-sm text-muted-foreground">Reports</div>
                    </div>
                    <div className="p-4 space-y-2">
                      {[
                        { name: "Sarah Johnson", age: "32", sex: "F", lastVisit: "Today" },
                        { name: "Michael Chen", age: "45", sex: "M", lastVisit: "Yesterday" },
                        { name: "Emily Rodriguez", age: "28", sex: "F", lastVisit: "2 days ago" },
                      ].map((patient, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-sm">{patient.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-xs text-muted-foreground">{patient.age}Y • {patient.sex} • Last visit: {patient.lastVisit}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-primary/5 border-primary">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">This is the Doctor Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Manage patients, create prescriptions, schedule appointments, and track analytics - all in one place.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button size="lg" onClick={() => navigate("/demo/prescription")}>
                    Try Prescription Builder
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
                    Sign Up Free
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clinic" className="space-y-4">
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-1 bg-muted/30">
              <div className="bg-background rounded-md overflow-hidden">
                {/* Clinic Header */}
                <div className="border-b bg-card/50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">SC</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Sunrise Health Clinic</h3>
                      <p className="text-xs text-muted-foreground">Enterprise Plan • 12/50 Doctors Active</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Manage Subscription</Button>
                </div>

                {/* Clinic Stats */}
                <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20 p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Total Patients</span>
                      <Users className="h-3.5 w-3.5 text-cyan-600" />
                    </div>
                    <div className="text-2xl font-bold text-cyan-600">1,247</div>
                    <p className="text-xs text-muted-foreground">Across all doctors</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Active Doctors</span>
                      <Users className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">12 / 50</div>
                    <p className="text-xs text-muted-foreground">38 slots available</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Revenue</span>
                      <span className="text-xs font-bold">৳</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">2,45,000</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/20 p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Appointments</span>
                      <Calendar className="h-3.5 w-3.5 text-violet-600" />
                    </div>
                    <div className="text-2xl font-bold text-violet-600">342</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                </div>

                {/* Clinic Tabs Preview */}
                <div className="px-4 pb-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 flex gap-2 border-b text-xs">
                      <div className="px-3 py-1 bg-background rounded font-medium">Doctors</div>
                      <div className="px-3 py-1 text-muted-foreground">Patients</div>
                      <div className="px-3 py-1 text-muted-foreground">Appointments</div>
                      <div className="px-3 py-1 text-muted-foreground">Payroll</div>
                      <div className="px-3 py-1 text-muted-foreground">Revenue</div>
                    </div>
                    <div className="p-3">
                      {/* Doctor Management Table Preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pb-2 border-b">
                          <span>Doctor</span>
                          <span>Actions</span>
                        </div>
                        {[
                          { name: "Dr. Ayesha Rahman", specialty: "Cardiologist", patients: 245 },
                          { name: "Dr. Imran Hossain", specialty: "Diabetologist", patients: 198 },
                          { name: "Dr. Fatima Khan", specialty: "Pediatrician", patients: 312 },
                        ].map((doctor, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-semibold">{doctor.name.split(' ')[1][0]}{doctor.name.split(' ')[2][0]}</span>
                              </div>
                              <div>
                                <div className="font-medium text-sm">{doctor.name}</div>
                                <div className="text-xs text-muted-foreground">{doctor.specialty} • {doctor.patients} patients</div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Edit</Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Reset PW</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-primary/5 border-primary">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">This is the Clinic Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Manage up to 50 doctors, track payroll, appointments, patients, revenue, branding - complete clinic management system.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button size="lg" onClick={() => navigate("/register")}>
                    Start Your Clinic
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescription" className="space-y-4">
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-1 bg-muted/30">
              <div className="bg-background rounded-md overflow-hidden">
                {/* Prescription Builder Interface */}
                <div className="border-b bg-card/50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Smart Prescription Builder</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <span className="text-xs">🎤 Voice Input</span>
                      </Button>
                      <Button size="sm">Save & Print</Button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 divide-x">
                  {/* Left Column - Input Form */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Patient Info</label>
                      <div className="p-3 bg-muted/50 rounded border">
                        <div className="font-medium">Sarah Johnson</div>
                        <div className="text-xs text-muted-foreground">32Y • F • 55kg</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Chief Complaints</label>
                      <div className="p-2 bg-muted/30 rounded border text-sm min-h-[60px]">
                        Chest pain, shortness of breath
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Medicines</label>
                      <div className="space-y-2">
                        {[
                          { name: "Tab. Atorvastatin 20mg", dose: "1+0+1", duration: "30 days" },
                          { name: "Tab. Aspirin 75mg", dose: "0+0+1", duration: "30 days" },
                          { name: "Tab. Metoprolol 50mg", dose: "1+0+1", duration: "30 days" },
                        ].map((med, i) => (
                          <div key={i} className="p-2 bg-primary/5 rounded border border-primary/20">
                            <div className="font-medium text-sm">{med.name}</div>
                            <div className="text-xs text-muted-foreground">{med.dose} • {med.duration}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium">💡 Smart Features:</span>
                        <span className="text-muted-foreground">Medicine autocomplete • Voice input • Templates</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Live Preview */}
                  <div className="p-4 bg-muted/20">
                    <div className="text-xs font-medium text-muted-foreground mb-3">Live Prescription Preview</div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg border-2 shadow-lg p-4 space-y-3 text-xs">
                      {/* Doctor Header */}
                      <div className="text-center border-b pb-3">
                        <div className="font-bold text-primary">Dr. Ahmed Rahman</div>
                        <div className="text-[10px] text-muted-foreground">MBBS, MD (Cardiology)</div>
                        <div className="text-[10px] text-muted-foreground">BMDC Reg: 12345</div>
                      </div>

                      {/* Patient Info */}
                      <div className="flex justify-between text-[11px] border-b pb-2">
                        <div>
                          <div><span className="font-medium">Name:</span> Sarah Johnson</div>
                          <div><span className="font-medium">Age:</span> 32Y • <span className="font-medium">Sex:</span> F</div>
                        </div>
                        <div className="text-right">
                          <div><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</div>
                          <div><span className="font-medium">Weight:</span> 55kg</div>
                        </div>
                      </div>

                      {/* CC */}
                      <div>
                        <div className="font-semibold mb-1">C/C:</div>
                        <div className="text-[11px] text-muted-foreground pl-2">Chest pain, shortness of breath</div>
                      </div>

                      {/* Rx */}
                      <div>
                        <div className="font-semibold mb-1">Rx:</div>
                        <div className="space-y-1 pl-2">
                          <div className="text-[11px]">1. Tab. Atorvastatin 20mg - 1+0+1 (30 days)</div>
                          <div className="text-[11px]">2. Tab. Aspirin 75mg - 0+0+1 (30 days)</div>
                          <div className="text-[11px]">3. Tab. Metoprolol 50mg - 1+0+1 (30 days)</div>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="flex justify-end pt-2">
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-[8px]">
                          QR
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-primary/5 border-primary">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">This is the Prescription Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Create professional prescriptions in seconds with 12,000+ medicines, voice input, Bengali support, and QR verification.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button size="lg" onClick={() => navigate("/demo/prescription")}>
                    <FileText className="w-5 h-5 mr-2" />
                    Try Full Demo
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
                    Start Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Demo;
