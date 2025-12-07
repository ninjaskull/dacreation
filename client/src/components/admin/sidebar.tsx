import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck,
  ClipboardList,
  PieChart,
  Truck,
  MapPin,
  MessageSquare,
  Bell,
  HelpCircle,
  Briefcase,
  Phone,
  MessagesSquare,
  Image,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBranding } from "@/contexts/BrandingContext";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Notifications", href: "/admin/notifications", icon: Bell, badge: 3 },
    ],
  },
  {
    title: "CRM",
    items: [
      { name: "Leads", href: "/admin/leads", icon: Users },
      { name: "Clients", href: "/admin/clients", icon: UserCheck },
      { name: "Chat", href: "/admin/chat", icon: MessagesSquare },
      { name: "Callbacks", href: "/admin/callbacks", icon: Phone },
    ],
  },
  {
    title: "Event Management",
    items: [
      { name: "Events", href: "/admin/events", icon: Sparkles },
      { name: "Calendar", href: "/admin/calendar", icon: CalendarDays },
      { name: "Bookings", href: "/admin/bookings", icon: ClipboardList },
      { name: "Venues", href: "/admin/venues", icon: MapPin },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Vendors", href: "/admin/vendors", icon: Truck },
      { name: "Team", href: "/admin/team", icon: Building2 },
      { name: "Portfolio", href: "/admin/portfolio", icon: Image },
      { name: "Careers", href: "/admin/careers", icon: Briefcase },
      { name: "Tasks", href: "/admin/tasks", icon: FileText },
    ],
  },
  {
    title: "Analytics",
    items: [
      { name: "Reports", href: "/admin/reports", icon: PieChart },
    ],
  },
];

const bottomItems: SidebarItem[] = [
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Website Settings", href: "/admin/website-settings", icon: Sparkles },
  { name: "Email Settings", href: "/admin/email-settings", icon: Mail },
  { name: "Help & Support", href: "/admin/help", icon: HelpCircle },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => location === href;

  const NavItem = ({ item }: { item: SidebarItem }) => {
    const content = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group",
          isActive(item.href)
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
        {!collapsed && (
          <>
            <span className="text-sm font-medium flex-1">{item.name}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.name}
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const { branding } = useBranding();
  
  return (
    <div
      className={cn(
        "relative flex flex-col bg-white border-r border-border h-screen transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      <div className={cn("flex items-center h-16 border-b border-border px-4", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={branding.assets.logos.iconMaroon} alt={branding.company.name} className="h-8 w-8 object-contain" />
            <span className="font-serif font-bold text-lg text-primary">{branding.company.name}</span>
          </div>
        )}
        {collapsed && <img src={branding.assets.logos.iconMaroon} alt={branding.company.name} className="h-8 w-8 object-contain" />}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", collapsed && "absolute -right-4 bg-white border shadow-sm rounded-full")}
          onClick={() => setCollapsed(!collapsed)}
          data-testid="button-toggle-sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-6 px-3">
          {sidebarSections.map((section, idx) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              {collapsed && idx > 0 && <Separator className="my-2" />}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3 space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}
