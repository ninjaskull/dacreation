import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/layout";
import { Link } from "wouter";
import { 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare,
  TrendingUp,
  CalendarCheck,
  Clock,
  UserPlus,
  ArrowUpRight,
  ChevronRight,
  Image,
  FileText,
  PhoneCall,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Lead } from "@shared/schema";

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  inquiry_form: 'Inquiry',
  popup: 'Pop-up',
  floating_cta: 'CTA',
  chatbot: 'Chat',
  lead_magnet: 'Magnet',
  callback_request: 'Callback',
  contact_form: 'Contact',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-700', bg: 'bg-blue-100' },
  contacted: { label: 'Contacted', color: 'text-amber-700', bg: 'bg-amber-100' },
  'follow-up': { label: 'Follow-up', color: 'text-orange-700', bg: 'bg-orange-100' },
  qualified: { label: 'Qualified', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  converted: { label: 'Converted', color: 'text-purple-700', bg: 'bg-purple-100' },
  lost: { label: 'Lost', color: 'text-gray-700', bg: 'bg-gray-100' },
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads");
      if (!response.ok) throw new Error("Failed to fetch leads");
      return response.json() as Promise<Lead[]>;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["leadStats"],
    queryFn: async () => {
      const response = await fetch("/api/leads/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: upcomingAppointments } = useQuery({
    queryKey: ["upcomingAppointments"],
    queryFn: async () => {
      const response = await fetch("/api/appointments/upcoming?limit=3");
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error("Failed to update lead");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadStats"] });
      setSelectedLead(null);
      toast({ title: "Success", description: "Lead updated successfully" });
    },
  });

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setStatus(lead.status);
    setNotes(lead.notes || "");
  };

  const handleUpdateLead = () => {
    if (selectedLead) {
      updateLeadMutation.mutate({ id: selectedLead.id, status, notes });
    }
  };

  const sourceChartData = stats?.bySource 
    ? Object.entries(stats.bySource).map(([name, value]) => ({
        name: SOURCE_LABELS[name] || name,
        value: value as number,
      }))
    : [];

  const recentLeads = leads?.slice(0, 4) || [];
  const conversionRate = stats?.total > 0 
    ? Math.round(((stats?.byStatus?.converted || 0) / stats.total) * 100)
    : 0;

  return (
    <AdminLayout title="Dashboard" description="Business overview at a glance">
      <div className="space-y-4">
        {/* Compact Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-blue-500" data-testid="card-total-leads">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Leads</p>
                  <p className="text-2xl font-bold" data-testid="text-total-leads">
                    {statsLoading ? "..." : stats?.total || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500" data-testid="card-new-today">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">New Today</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="text-new-today">
                    {statsLoading ? "..." : stats?.newToday || 0}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500" data-testid="card-pending-followup">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Follow-ups</p>
                  <p className="text-2xl font-bold text-amber-600" data-testid="text-pending-followup">
                    {statsLoading ? "..." : stats?.pendingFollowUp || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500" data-testid="card-conversion-rate">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Conversion</p>
                  <p className="text-2xl font-bold text-purple-600" data-testid="text-conversion-rate">
                    {conversionRate}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Leads - Takes 2 columns */}
          <Card className="lg:col-span-2" data-testid="card-recent-leads">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Leads</CardTitle>
              <Link href="/admin/leads">
                <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid="button-view-all-leads">
                  View All <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {leadsLoading ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Loading...</div>
              ) : !leads || leads.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No leads yet</div>
              ) : (
                <div className="space-y-2">
                  {recentLeads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
                      onClick={() => handleOpenLead(lead)}
                      data-testid={`row-lead-${lead.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{lead.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{lead.eventType} • {lead.date ? format(new Date(lead.date), "MMM dd") : "TBD"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${STATUS_CONFIG[lead.status]?.bg} ${STATUS_CONFIG[lead.status]?.color} text-xs font-medium border-0`}>
                          {STATUS_CONFIG[lead.status]?.label || lead.status}
                        </Badge>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead Pipeline - Compact */}
          <Card data-testid="card-lead-pipeline">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const count = stats?.byStatus?.[key] || 0;
                  const percentage = stats?.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.bg.replace('100', '500')}`}></div>
                      <span className="text-xs flex-1">{config.label}</span>
                      <span className="text-xs font-semibold w-6 text-right">{count}</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${config.bg.replace('100', '500')} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Charts and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Lead Sources Mini Chart */}
          <Card data-testid="card-lead-sources-chart">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm font-semibold">Lead Sources</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {sourceChartData.length > 0 ? (
                <div className="flex items-center">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sourceChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1">
                    {sourceChartData.slice(0, 4).map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate">{item.name}</span>
                        <span className="font-medium ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-xs text-muted-foreground">
                  No data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments - Compact */}
          <Card data-testid="card-upcoming-appointments">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Upcoming</CardTitle>
              <Link href="/admin/calendar">
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" data-testid="button-view-calendar">
                  <Calendar className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-2">
                  {upcomingAppointments.slice(0, 3).map((apt: any) => (
                    <div key={apt.id} className="flex items-center gap-2 text-xs" data-testid={`appointment-${apt.id}`}>
                      <CalendarCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{apt.title || apt.lead?.name}</p>
                        <p className="text-muted-foreground">
                          {format(new Date(apt.scheduledAt), "MMM dd, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No appointments
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions - Compact Grid */}
          <Card className="lg:col-span-2" data-testid="card-quick-actions">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-4 gap-2">
                <Link href="/admin/leads">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-quick-leads">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Leads</span>
                  </Button>
                </Link>
                <Link href="/admin/calendar">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-quick-calendar">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Calendar</span>
                  </Button>
                </Link>
                <Link href="/admin/portfolio">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-quick-portfolio">
                    <Image className="h-4 w-4" />
                    <span className="text-xs">Portfolio</span>
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-quick-reports">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs">Reports</span>
                  </Button>
                </Link>
                <Link href="/admin/chat">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-quick-chat">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">Chat</span>
                  </Button>
                </Link>
                <Link href="/admin/callbacks">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-quick-callbacks">
                    <PhoneCall className="h-4 w-4" />
                    <span className="text-xs">Callbacks</span>
                  </Button>
                </Link>
                <Link href="/admin/team">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-quick-team">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Team</span>
                  </Button>
                </Link>
                <Link href="/admin/invoices">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-quick-invoices">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">Invoices</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Lead Details</DialogTitle>
            <DialogDescription>View and update lead information</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="capitalize">{selectedLead.contactMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Event</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.date ? format(new Date(selectedLead.date), "PPP") : "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.location || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.guestCount || 0} guests</span>
                    </div>
                    <div>
                      <Badge variant="secondary" className="capitalize">{selectedLead.eventType}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Notes</label>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleUpdateLead}
                  disabled={updateLeadMutation.isPending}
                  data-testid="button-update-lead"
                >
                  {updateLeadMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
