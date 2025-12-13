import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
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
  Bell,
  HelpCircle,
  Briefcase,
  Phone,
  MessagesSquare,
  Image,
  Mail,
  Search,
  BookOpen,
  Receipt,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/hooks/use-auth";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  adminOnly?: boolean;
  staffAndAbove?: boolean;
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
      { name: "Clients", href: "/admin/clients", icon: UserCheck, staffAndAbove: true },
      { name: "Subscribers", href: "/admin/subscribers", icon: Mail, staffAndAbove: true },
      { name: "Chat", href: "/admin/chat", icon: MessagesSquare, staffAndAbove: true },
      { name: "Callbacks", href: "/admin/callbacks", icon: Phone, staffAndAbove: true },
    ],
  },
  {
    title: "Event Management",
    items: [
      { name: "Events", href: "/admin/events", icon: Sparkles, staffAndAbove: true },
      { name: "Calendar", href: "/admin/calendar", icon: CalendarDays },
      { name: "Bookings", href: "/admin/bookings", icon: ClipboardList, staffAndAbove: true },
      { name: "Venues", href: "/admin/venues", icon: MapPin, staffAndAbove: true },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Vendors", href: "/admin/vendors", icon: Truck, staffAndAbove: true },
      { name: "Team", href: "/admin/team", icon: Building2 },
      { name: "Portfolio", href: "/admin/portfolio", icon: Image, staffAndAbove: true },
      { name: "Blog", href: "/admin/blog", icon: BookOpen, staffAndAbove: true },
      { name: "Careers", href: "/admin/careers", icon: Briefcase, staffAndAbove: true },
      { name: "Tasks", href: "/admin/tasks", icon: FileText, staffAndAbove: true },
    ],
  },
  {
    title: "Finance",
    items: [
      { name: "Invoices", href: "/admin/invoices", icon: Receipt, staffAndAbove: true },
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
  { name: "Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
  { name: "Website Settings", href: "/admin/website-settings", icon: Sparkles, adminOnly: true },
  { name: "Email Settings", href: "/admin/email-settings", icon: Mail, adminOnly: true },
  { name: "Help & Support", href: "/admin/help", icon: HelpCircle },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { role, isAdmin, isViewer } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const isActive = (href: string) => location === href;

  const handleNavigation = (href: string) => {
    setLocation(href);
    setSearchOpen(false);
  };

  const canAccessItem = (item: SidebarItem) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.staffAndAbove && isViewer) return false;
    return true;
  };

  const getFilteredSections = () => {
    return sidebarSections.map(section => ({
      ...section,
      items: section.items.filter(canAccessItem),
    })).filter(section => section.items.length > 0);
  };

  const getFilteredBottomItems = () => {
    return bottomItems.filter(canAccessItem);
  };

  const filteredSections = getFilteredSections();
  const filteredBottomItems = getFilteredBottomItems();

  const NavItem = ({ item }: { item: SidebarItem }) => {
    const content = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-150 cursor-pointer group relative",
          isActive(item.href)
            ? "bg-gradient-to-r from-primary/90 to-primary text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
        data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", collapsed && "mx-auto")} />
        {!collapsed && (
          <>
            <span className="text-[13px] font-medium flex-1 truncate">{item.name}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[18px] text-center">
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded-full font-medium min-w-[14px] text-center">
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2 text-xs">
            {item.name}
            {item.badge && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
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
    <>
      <div
        className={cn(
          "relative flex flex-col bg-white border-r border-slate-200 h-screen transition-all duration-200 shadow-sm",
          collapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        <div className={cn(
          "flex items-center h-14 border-b border-slate-200 px-3",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                <img src={branding.assets.logos.iconMaroon} alt={branding.company.name} className="h-5 w-5 object-contain brightness-0 invert" />
              </div>
              <span className="font-semibold text-sm text-slate-900 truncate">{branding.company.name}</span>
            </div>
          )}
          {collapsed && (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <img src={branding.assets.logos.iconMaroon} alt={branding.company.name} className="h-5 w-5 object-contain brightness-0 invert" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100",
              collapsed && "absolute -right-3.5 bg-white border border-slate-200 shadow-sm rounded-full z-10"
            )}
            onClick={() => setCollapsed(!collapsed)}
            data-testid="button-toggle-sidebar"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {!collapsed && (
          <div className="px-3 py-2 border-b border-slate-100">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
              data-testid="button-search-sidebar"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-auto text-[10px] bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-400">⌘K</kbd>
            </button>
          </div>
        )}

        {collapsed && (
          <div className="px-2 py-2 border-b border-slate-100">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-full flex items-center justify-center p-2 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
                  data-testid="button-search-sidebar-collapsed"
                >
                  <Search className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Search (⌘K)
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        <ScrollArea className="flex-1 py-2">
          <div className="space-y-4 px-2">
            {filteredSections.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <h3 className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavItem key={item.href} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-slate-200 p-2 space-y-0.5">
          {filteredBottomItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {filteredSections.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => handleNavigation(item.href)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <item.icon className="h-4 w-4 text-slate-500" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          {filteredBottomItems.length > 0 && (
            <CommandGroup heading="Settings">
              {filteredBottomItems.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => handleNavigation(item.href)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <item.icon className="h-4 w-4 text-slate-500" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
