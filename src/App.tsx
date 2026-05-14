import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PatientProvider } from "@/contexts/PatientContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import HospitalMap from "./pages/HospitalMap";
import ImportHospitals from "./pages/ImportHospitals";
import Prescription from "./pages/Prescription";
import PatientProfile from "./pages/PatientProfile";
import HealthCard from "./pages/HealthCard";
import Appointments from "./pages/Appointments";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import HomeDashboard from "./pages/HomeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Features from "./pages/Features";
import Doctors from "./pages/Doctors";
import AdminBookings from "./pages/AdminBookings";
import JoinAsPartner from "./pages/JoinAsPartner";
import AboutUs from "./pages/AboutUs";
import CompleteProfile from "./pages/CompleteProfile";
import PartnerBookings from "./pages/PartnerBookings";
import DoctorDashboard from "./pages/DoctorDashboard";
import PartnerDashboard from "./pages/PartnerDashboard";
import TestReports from "./pages/TestReports";
import PaymentGateway from "./pages/PaymentGateway";
import Pharmacy from "./pages/Pharmacy";
import ProtectedRoute from "@/components/ProtectedRoute";
import PatientLayout from "@/components/layouts/PatientLayout";
import UpdatePassword from "./pages/UpdatePassword";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PatientProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/join-as-partner" element={<JoinAsPartner />} />

                <Route path="/partner-bookings" element={<ProtectedRoute allowedRoles={['partner', 'admin']}><PartnerBookings /></ProtectedRoute>} />
                <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/partner-dashboard" element={<ProtectedRoute allowedRoles={['partner', 'admin']}><PartnerDashboard /></ProtectedRoute>} />
                <Route path="/kazi" element={<ProtectedRoute allowedRoles={['admin', 'kazi']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin', 'kazi']}><AdminBookings /></ProtectedRoute>} />
                
                {/* Patient Routes with Global Header/Footer */}
                <Route element={<PatientLayout />}>
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/home" element={
                    <ProtectedRoute><HomeDashboard /></ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute><TestReports /></ProtectedRoute>
                  } />
                  <Route path="/payment" element={
                    <ProtectedRoute><PaymentGateway /></ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute><Index /></ProtectedRoute>
                  } />
                  <Route path="/hospital-map" element={
                    <ProtectedRoute><HospitalMap /></ProtectedRoute>
                  } />
                  <Route path="/prescription" element={
                    <ProtectedRoute><Prescription /></ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute><PatientProfile /></ProtectedRoute>
                  } />
                  <Route path="/health-card" element={
                    <ProtectedRoute><HealthCard /></ProtectedRoute>
                  } />
                  <Route path="/appointments" element={
                    <ProtectedRoute><Appointments /></ProtectedRoute>
                  } />
                  <Route path="/pharmacy" element={
                    <ProtectedRoute><Pharmacy /></ProtectedRoute>
                  } />
                  <Route path="/import" element={<ProtectedRoute><ImportHospitals /></ProtectedRoute>} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PatientProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
