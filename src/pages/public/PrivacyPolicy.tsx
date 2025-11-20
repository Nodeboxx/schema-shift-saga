import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Last Updated: November 20, 2024
          </p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We collect information necessary to provide our healthcare management services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Account information (name, email, credentials)</li>
                <li>Professional information (medical license, specialization)</li>
                <li>Patient data entered through the platform</li>
                <li>Usage data and analytics</li>
                <li>Payment and billing information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Your information is used to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and maintain our services</li>
                <li>Process prescriptions and manage patient records</li>
                <li>Facilitate appointments and communications</li>
                <li>Improve platform functionality and user experience</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Send service updates and important notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement enterprise-grade security measures including encryption at rest and in transit, regular security audits, access controls, and secure data centers. All patient data is handled in compliance with healthcare privacy standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We do not sell your personal information. Data may be shared only in these circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>With your explicit consent</li>
                <li>Within your clinic for authorized staff</li>
                <li>With service providers under strict confidentiality agreements</li>
                <li>When required by law or to protect rights and safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Lodge complaints with supervisory authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain data as long as necessary to provide services and comply with legal obligations. Medical records are retained according to healthcare regulations. Inactive accounts may be deleted after appropriate notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies for platform functionality and analytics cookies to improve our services. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related questions or to exercise your rights:
              </p>
              <div className="mt-3 text-muted-foreground">
                <p>Email: privacy@healthscribe.com</p>
                <p>Data Protection Officer: dpo@healthscribe.com</p>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPolicy;
