import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleRedirect } from "./components/guards/RoleRedirect";
import CMSLandingPage from "./pages/public/CMSLandingPage";
import PublicVerifyPrescription from "./pages/public/PublicVerifyPrescription";
import TermsOfService from "./pages/public/TermsOfService";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import AboutUs from "./pages/public/AboutUs";
import ContactUs from "./pages/public/ContactUs";
import FindDoctors from "./pages/public/FindDoctors";
import BookAppointment from "./pages/public/BookAppointment";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Prescription from "./pages/Prescription";
import PrescriptionList from "./pages/PrescriptionList";
import DataImport from "./pages/DataImport";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import Appointments from "./pages/Appointments";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClinicDashboard from "./pages/clinic/ClinicDashboard";
import VerifyPrescription from "./pages/VerifyPrescription";
import Questionnaires from "./pages/Questionnaires";
import Notifications from "./pages/Notifications";
import Telemedicine from "./pages/Telemedicine";
import NotFound from "./pages/NotFound";
import Demo from "./pages/Demo";
import DemoPrescription from "./pages/DemoPrescription";

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
              <Route path="/" element={<CMSLandingPage />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/find-doctors" element={<FindDoctors />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/prescription" element={<Prescription />} />
              <Route path="/prescription/new" element={<Prescription />} />
              <Route path="/prescription/:id" element={<Prescription />} />
              <Route path="/prescriptions" element={<PrescriptionList />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/questionnaires" element={<Questionnaires />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/telemedicine" element={<Telemedicine />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/import-data" element={<DataImport />} />
              <Route path="/checkout/:plan" element={<Checkout />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/clinic" element={<ClinicDashboard />} />
              <Route path="/verify/:id" element={<PublicVerifyPrescription />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/demo/prescription" element={<DemoPrescription />} />
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
