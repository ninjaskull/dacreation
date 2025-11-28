import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WeddingsPage from "@/pages/services/weddings";
import CorporatePage from "@/pages/services/corporate";
import SocialPage from "@/pages/services/social";
import DestinationPage from "@/pages/services/destination";
import InquirePage from "@/pages/inquire";
import AboutPage from "@/pages/about";
import TeamPage from "@/pages/team";
import PortfolioPage from "@/pages/portfolio";
import TestimonialsPage from "@/pages/testimonials";
import CareersPage from "@/pages/careers";
import PressPage from "@/pages/press";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import LeadsPage from "@/pages/admin/leads";
import LeadDetailPage from "@/pages/admin/lead-detail";
import ClientsPage from "@/pages/admin/clients";
import EventsPage from "@/pages/admin/events";
import CalendarPage from "@/pages/admin/calendar";
import VendorsPage from "@/pages/admin/vendors";
import ReportsPage from "@/pages/admin/reports";
import SettingsPage from "@/pages/admin/settings";
import { 
  NotificationsPage, 
  InquiriesPage, 
  BookingsPage, 
  VenuesPage, 
  TasksPage, 
  HelpPage 
} from "@/pages/admin/placeholder";
import AdminTeamPage from "@/pages/admin/team";
import { PopupSystem } from "@/components/sales/popup-system";
import { FloatingCTA } from "@/components/sales/floating-cta";
import { Chatbot } from "@/components/sales/chatbot";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/testimonials" component={TestimonialsPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/press" component={PressPage} />
      <Route path="/services/weddings" component={WeddingsPage} />
      <Route path="/services/corporate" component={CorporatePage} />
      <Route path="/services/social" component={SocialPage} />
      <Route path="/services/destination" component={DestinationPage} />
      <Route path="/inquire" component={InquirePage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/leads" component={LeadsPage} />
      <Route path="/admin/leads/:id" component={LeadDetailPage} />
      <Route path="/admin/clients" component={ClientsPage} />
      <Route path="/admin/events" component={EventsPage} />
      <Route path="/admin/calendar" component={CalendarPage} />
      <Route path="/admin/vendors" component={VendorsPage} />
      <Route path="/admin/reports" component={ReportsPage} />
      <Route path="/admin/settings" component={SettingsPage} />
      <Route path="/admin/notifications" component={NotificationsPage} />
      <Route path="/admin/inquiries" component={InquiriesPage} />
      <Route path="/admin/bookings" component={BookingsPage} />
      <Route path="/admin/venues" component={VenuesPage} />
      <Route path="/admin/team" component={AdminTeamPage} />
      <Route path="/admin/tasks" component={TasksPage} />
      <Route path="/admin/help" component={HelpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function LeadCaptureWidgets() {
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");
  
  if (isAdminPage) return null;
  
  return (
    <>
      <PopupSystem />
      <FloatingCTA />
      <Chatbot />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <LeadCaptureWidgets />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
