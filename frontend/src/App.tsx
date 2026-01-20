import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ServiceChoice from "./pages/ServiceChoice";
import PatientDashboard from "./pages/PatientDashboard";
import EmotionalState from "./pages/EmotionalState";
import Chat from "./pages/Chat";
import Feedback from "./pages/Feedback";
import About from "./pages/About";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import ChatHistory from "./pages/ChatHistory";
import ChatView from "./pages/ChatView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login/:userType" element={<Login />} />
            <Route path="/register/:userType" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/service-choice" element={<ServiceChoice />} />
            <Route path="/emotional-state" element={<EmotionalState />} />
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute requiredRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/psychologist-dashboard"
              element={
                <ProtectedRoute requiredRole="psychologist">
                  <PsychologistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat-history"
              element={
                <ProtectedRoute requiredRole="psychologist">
                  <ChatHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat-view"
              element={
                <ProtectedRoute requiredRole="psychologist">
                  <ChatView />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
