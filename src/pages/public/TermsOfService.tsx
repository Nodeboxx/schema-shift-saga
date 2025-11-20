import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";

const TermsOfService = () => {
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
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Last Updated: November 20, 2024
          </p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using HealthScribe's medical practice management platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Service Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                HealthScribe provides a comprehensive healthcare management platform including prescription writing, patient management, appointment scheduling, and clinic collaboration tools. Our services are designed for licensed healthcare professionals.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                As a user of HealthScribe, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the platform in compliance with applicable healthcare regulations</li>
                <li>Ensure all patient data is handled according to privacy laws</li>
                <li>Provide accurate and up-to-date information</li>
                <li>Use the service only for lawful purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Medical Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                HealthScribe is a tool to assist healthcare professionals. It does not replace professional medical judgment. All medical decisions remain the responsibility of the licensed healthcare provider using the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Privacy and Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data. All patient information is encrypted and stored securely. We comply with healthcare data protection regulations including HIPAA standards where applicable. For more details, please review our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Subscription and Payment</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                HealthScribe offers multiple subscription tiers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Free tier with limited features</li>
                <li>Pro and Enterprise subscriptions with full feature access</li>
                <li>Payments are processed securely through our payment partners</li>
                <li>Subscriptions auto-renew unless cancelled</li>
                <li>Refunds are subject to our refund policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of HealthScribe are owned by us and protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our platform without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                HealthScribe is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid for the service in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Service Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will provide reasonable notice of significant changes that affect your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account for violations of these terms. You may cancel your subscription at any time through your account settings. Upon termination, you must cease all use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by the laws of the jurisdiction where HealthScribe operates. Any disputes shall be resolved through binding arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-3 text-muted-foreground">
                <p>Email: legal@healthscribe.com</p>
                <p>Address: Healthcare Technology Center, Medical District</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these terms from time to time. Significant changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance of the updated terms.
              </p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              By using HealthScribe, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default TermsOfService;
