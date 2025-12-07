import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect, lazy, Suspense, ReactNode } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { useAuth } from "@/hooks/use-auth";
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
import ContactPage from "@/pages/contact";
import SitemapPage from "@/pages/sitemap";
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
import AdminCareersPage from "@/pages/admin/careers";
import AdminChatPage from "@/pages/admin/chat";
import AdminCallbacksPage from "@/pages/admin/callbacks";
import WebsiteSettingsPage from "@/pages/admin/website-settings";
import AdminPortfolioPage from "@/pages/admin/portfolio";
import EmailSettingsPage from "@/pages/admin/email-settings";
import { PopupSystem } from "@/components/sales/popup-system";
import { FloatingCTA } from "@/components/sales/floating-cta";
import { Chatbot } from "@/components/sales/chatbot";
import { StructuredData } from "@/components/seo/structured-data";
import { ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RequiredRole = 'admin' | 'staff' | 'viewer';

function hasRequiredRole(userRole: string, requiredRole: RequiredRole): boolean {
  if (requiredRole === 'viewer') return true;
  if (requiredRole === 'staff') return userRole === 'admin' || userRole === 'staff';
  if (requiredRole === 'admin') return userRole === 'admin';
  return false;
}

function RequireAuth({ children, requiredRole = 'viewer' }: { children: ReactNode; requiredRole?: RequiredRole }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect to="/admin/login" />;
  }

  if (!hasRequiredRole(user.role, requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <ShieldOff className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl">Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to access this page. This area requires {requiredRole === 'admin' ? 'administrator' : 'staff'} privileges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/admin/dashboard">Return to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/testimonials" component={TestimonialsPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/press" component={PressPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/services/weddings" component={WeddingsPage} />
      <Route path="/services/corporate" component={CorporatePage} />
      <Route path="/services/social" component={SocialPage} />
      <Route path="/services/destination" component={DestinationPage} />
      <Route path="/inquire" component={InquirePage} />
      <Route path="/sitemap" component={SitemapPage} />
      
      {/* Admin login - no auth required */}
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Admin pages - viewer accessible (read-only view) */}
      <Route path="/admin/dashboard">
        {() => <RequireAuth requiredRole="viewer"><AdminDashboard /></RequireAuth>}
      </Route>
      <Route path="/admin/leads">
        {() => <RequireAuth requiredRole="viewer"><LeadsPage /></RequireAuth>}
      </Route>
      <Route path="/admin/leads/:id">
        {() => <RequireAuth requiredRole="viewer"><LeadDetailPage /></RequireAuth>}
      </Route>
      <Route path="/admin/calendar">
        {() => <RequireAuth requiredRole="viewer"><CalendarPage /></RequireAuth>}
      </Route>
      <Route path="/admin/reports">
        {() => <RequireAuth requiredRole="viewer"><ReportsPage /></RequireAuth>}
      </Route>
      <Route path="/admin/notifications">
        {() => <RequireAuth requiredRole="viewer"><NotificationsPage /></RequireAuth>}
      </Route>
      <Route path="/admin/team">
        {() => <RequireAuth requiredRole="viewer"><AdminTeamPage /></RequireAuth>}
      </Route>
      <Route path="/admin/help">
        {() => <RequireAuth requiredRole="viewer"><HelpPage /></RequireAuth>}
      </Route>
      
      {/* Admin pages - staff and above (can create/edit) */}
      <Route path="/admin/clients">
        {() => <RequireAuth requiredRole="staff"><ClientsPage /></RequireAuth>}
      </Route>
      <Route path="/admin/events">
        {() => <RequireAuth requiredRole="staff"><EventsPage /></RequireAuth>}
      </Route>
      <Route path="/admin/vendors">
        {() => <RequireAuth requiredRole="staff"><VendorsPage /></RequireAuth>}
      </Route>
      <Route path="/admin/inquiries">
        {() => <RequireAuth requiredRole="staff"><InquiriesPage /></RequireAuth>}
      </Route>
      <Route path="/admin/bookings">
        {() => <RequireAuth requiredRole="staff"><BookingsPage /></RequireAuth>}
      </Route>
      <Route path="/admin/venues">
        {() => <RequireAuth requiredRole="staff"><VenuesPage /></RequireAuth>}
      </Route>
      <Route path="/admin/portfolio">
        {() => <RequireAuth requiredRole="staff"><AdminPortfolioPage /></RequireAuth>}
      </Route>
      <Route path="/admin/careers">
        {() => <RequireAuth requiredRole="staff"><AdminCareersPage /></RequireAuth>}
      </Route>
      <Route path="/admin/chat">
        {() => <RequireAuth requiredRole="staff"><AdminChatPage /></RequireAuth>}
      </Route>
      <Route path="/admin/callbacks">
        {() => <RequireAuth requiredRole="staff"><AdminCallbacksPage /></RequireAuth>}
      </Route>
      <Route path="/admin/tasks">
        {() => <RequireAuth requiredRole="staff"><TasksPage /></RequireAuth>}
      </Route>
      
      {/* Admin only pages (full system access) */}
      <Route path="/admin/settings">
        {() => <RequireAuth requiredRole="admin"><SettingsPage /></RequireAuth>}
      </Route>
      <Route path="/admin/website-settings">
        {() => <RequireAuth requiredRole="admin"><WebsiteSettingsPage /></RequireAuth>}
      </Route>
      <Route path="/admin/email-settings">
        {() => <RequireAuth requiredRole="admin"><EmailSettingsPage /></RequireAuth>}
      </Route>
      
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
      <BrandingProvider>
        <TooltipProvider>
          <StructuredData />
          <ScrollToTop />
          <Toaster />
          <Router />
          <LeadCaptureWidgets />
        </TooltipProvider>
      </BrandingProvider>
    </QueryClientProvider>
  );
}

export default App;
