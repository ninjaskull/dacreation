import { Switch, Route } from "wouter";
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
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import LeadsPage from "@/pages/admin/leads";
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
  TeamPage, 
  TasksPage, 
  HelpPage 
} from "@/pages/admin/placeholder";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services/weddings" component={WeddingsPage} />
      <Route path="/services/corporate" component={CorporatePage} />
      <Route path="/services/social" component={SocialPage} />
      <Route path="/services/destination" component={DestinationPage} />
      <Route path="/inquire" component={InquirePage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/leads" component={LeadsPage} />
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
      <Route path="/admin/team" component={TeamPage} />
      <Route path="/admin/tasks" component={TasksPage} />
      <Route path="/admin/help" component={HelpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
