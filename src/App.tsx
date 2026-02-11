import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PageTransition } from "@/components/PageTransition";
import Index from "./pages/Index";
import AdminPortal from "./pages/AdminPortal";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ASPIREFeedback from "./pages/ASPIREFeedback";
import PreSurvey from "./pages/PreSurvey";
import BuildDayProjects from "./pages/BuildDayProjects";
import StudentDashboard from "./pages/StudentDashboard";
import AspireLeadJan2026 from "./pages/AspireLeadJan2026";
import EventBreakdown from "./pages/EventBreakdown";
import MicrosoftVisit from "./pages/MicrosoftVisit";
import MicrosoftVisitRecap from "./pages/MicrosoftVisitRecap";
import MicrosoftVisitGallery from "./pages/MicrosoftVisitGallery";
import Timeline from "./pages/Timeline";
import AspireEnterprise from "./pages/AspireEnterprise";
import InvestNorth from "./pages/InvestNorth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/aspire-feedback" element={<ASPIREFeedback />} />
        <Route path="/pre-survey" element={<PreSurvey />} />
        <Route path="/build-day" element={<BuildDayProjects />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/aspireleadjan312026" element={<AspireLeadJan2026 />} />
        <Route path="/events/:eventId" element={<EventBreakdown />} />
        <Route path="/microsoftvisit" element={<MicrosoftVisit />} />
        <Route path="/microsoftvisitrecap" element={<MicrosoftVisitRecap />} />
        <Route path="/microsoftvisitgallery" element={<MicrosoftVisitGallery />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/aspireenterprise" element={<AspireEnterprise />} />
        <Route path="/investnorth" element={<InvestNorth />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
