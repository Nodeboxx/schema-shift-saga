import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to MedRxPro",
    description: "Let's get you set up in just a few steps"
  },
  {
    id: 2,
    title: "Complete Your Profile",
    description: "Help patients find and trust you"
  },
  {
    id: 3,
    title: "Explore Key Features",
    description: "Learn what you can do with MedRxPro"
  },
  {
    id: 4,
    title: "All Set!",
    description: "You're ready to start"
  }
];

export const OnboardingWizard = ({ open, onComplete }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState({
    full_name: "",
    specialization: "",
    license_number: "",
    phone: "",
    address: "",
    bio: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          specialization: data.specialization || "",
          license_number: data.license_number || "",
          phone: data.phone || "",
          address: data.address || "",
          bio: data.bio || ""
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      await saveProfile();
    }
    if (currentStep === steps.length) {
      await completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const saveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          specialization: profile.specialization,
          license_number: profile.license_number,
          phone: profile.phone,
          address: profile.address,
          bio: profile.bio,
          onboarding_step: 2
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const completeOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          onboarding_step: steps.length,
          last_onboarding_date: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Welcome aboard!",
        description: "You're all set to start using MedRxPro"
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">{steps[currentStep - 1].title}</DialogTitle>
          </div>
          <DialogDescription>{steps[currentStep - 1].description}</DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="mb-6" />

        {/* Step Navigation Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
              disabled={step.id > currentStep}
              className="group"
            >
              {step.id < currentStep ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : step.id === currentStep ? (
                <Circle className="h-6 w-6 text-primary fill-primary" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {currentStep === 1 && (
            <div className="space-y-6 text-center py-8">
              <div className="max-w-lg mx-auto">
                <h3 className="text-xl font-semibold mb-4">Welcome to Your Medical Practice Platform</h3>
                <p className="text-muted-foreground mb-6">
                  MedRxPro is designed to help healthcare professionals manage their practice efficiently. 
                  Let's take a quick tour to get you started.
                </p>
                <div className="grid gap-4 text-left">
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Smart Prescription Builder</h4>
                      <p className="text-sm text-muted-foreground">Create digital prescriptions quickly with our intelligent builder</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Patient Management</h4>
                      <p className="text-sm text-muted-foreground">Track patient journeys and medical histories</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Appointment Scheduling</h4>
                      <p className="text-sm text-muted-foreground">Manage appointments and online bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={profile.specialization}
                    onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                    placeholder="e.g., General Medicine"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={profile.license_number}
                    onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                    placeholder="BM&DC Reg. No."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+880 1XX XXX XXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Clinic Address</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Your clinic or practice address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Brief description of your experience and expertise"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 py-4">
              <h3 className="text-lg font-semibold mb-4">Key Features Tour</h3>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📝 Create Prescriptions</h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the Prescription page to create digital prescriptions with medicine suggestions, 
                    dosage instructions, and QR code verification.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">👥 Manage Patients</h4>
                  <p className="text-sm text-muted-foreground">
                    Track patient history, medical records, and journey progress all in one place.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📅 Appointments</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule appointments, manage bookings, and send automated reminders to patients.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📊 Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    View practice insights, patient demographics, and export data for research purposes.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">⚙️ Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Customize prescription templates, manage your profile, and configure notifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <CheckCircle2 className="h-20 w-20 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">You're All Set!</h3>
                <p className="text-muted-foreground mb-6">
                  Your account is ready to use. Start creating prescriptions, managing patients, 
                  and growing your practice.
                </p>
              </div>
              <div className="bg-primary/5 p-6 rounded-lg text-left max-w-md mx-auto">
                <h4 className="font-semibold mb-3">Quick Tips:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Complete your profile in Settings for better patient trust</li>
                  <li>• Create your first prescription to get familiar with the builder</li>
                  <li>• Enable public appointment booking to let patients book online</li>
                  <li>• Check Analytics regularly to track your practice growth</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          {currentStep > 1 && currentStep < steps.length && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          <Button onClick={handleNext} disabled={currentStep === 2 && !profile.full_name}>
            {currentStep === steps.length ? (
              "Get Started"
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
