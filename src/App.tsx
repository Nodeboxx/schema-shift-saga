import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleRedirect } from "./components/guards/RoleRedirect";
import LandingPage from "./pages/public/LandingPage";
import PublicVerifyPrescription from "./pages/public/PublicVerifyPrescription";
import TermsOfService from "./pages/public/TermsOfService";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import AboutUs from "./pages/public/AboutUs";
import ContactUs from "./pages/public/ContactUs";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Prescription from "./pages/Prescription";
import PrescriptionList from "./pages/PrescriptionList";
import DataImport from "./pages/DataImport";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import Appointments from "./pages/Appointments";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClinicDashboard from "./pages/clinic/ClinicDashboard";
import VerifyPrescription from "./pages/VerifyPrescription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RoleRedirect />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/prescription" element={<Prescription />} />
              <Route path="/prescription/new" element={<Prescription />} />
              <Route path="/prescription/:id" element={<Prescription />} />
              <Route path="/prescriptions" element={<PrescriptionList />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/import-data" element={<DataImport />} />
              <Route path="/checkout/:plan" element={<Checkout />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/clinic" element={<ClinicDashboard />} />
              <Route path="/verify/:id" element={<PublicVerifyPrescription />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
