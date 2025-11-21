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
      <div className="bg-orange-500 text-white py-3 px-6 text-center font-medium">
        🎯 Demo Mode - Explore features without signing up! Limited to 3 medicines, no printing.
      </div>

      {/* Header */}
      <div className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">HealthScribe Demo Dashboard</h1>
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prescription">Try Prescription</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                <h3 className="text-xl font-bold mb-2">Ready to unlock all features?</h3>
                <p className="text-muted-foreground mb-4">
                  Sign up now to get unlimited prescriptions, printing, patient management, and more!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button size="lg" onClick={() => navigate("/register")}>
                    Start Free Trial
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescription">
            <Card>
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
