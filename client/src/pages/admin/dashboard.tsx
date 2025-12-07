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

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new: { label: 'New', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  'follow-up': { label: 'Follow-up', color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  qualified: { label: 'Qualified', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  converted: { label: 'Converted', color: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-500' },
  lost: { label: 'Lost', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
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
      <div className="space-y-4 max-w-[1600px]">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-sm" data-testid="card-total-leads">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium mb-1">Total Leads</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-leads">
                    {statsLoading ? "-" : stats?.total || 0}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-sm" data-testid="card-new-today">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium mb-1">New Today</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-new-today">
                    {statsLoading ? "-" : stats?.newToday || 0}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 border-0 shadow-sm" data-testid="card-pending-followup">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-amber-100 text-xs font-medium mb-1">Follow-ups</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-pending-followup">
                    {statsLoading ? "-" : stats?.pendingFollowUp || 0}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-sm" data-testid="card-conversion-rate">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium mb-1">Conversion</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-conversion-rate">
                    {conversionRate}%
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-3">
          {/* Recent Leads */}
          <Card className="col-span-12 lg:col-span-7 border-slate-200 shadow-sm" data-testid="card-recent-leads">
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900">Recent Leads</CardTitle>
              <Link href="/admin/leads">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-slate-900" data-testid="button-view-all-leads">
                  View All <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-3">
              {leadsLoading ? (
                <div className="text-center py-8 text-sm text-slate-400">Loading...</div>
              ) : !leads || leads.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-400">No leads yet</div>
              ) : (
                <div className="space-y-2">
                  {recentLeads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                      onClick={() => handleOpenLead(lead)}
                      data-testid={`row-lead-${lead.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-white">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">{lead.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{lead.eventType} - {lead.date ? format(new Date(lead.date), "MMM dd") : "TBD"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${STATUS_CONFIG[lead.status]?.bg} ${STATUS_CONFIG[lead.status]?.color} text-[10px] font-medium border-0 px-2 py-0.5`}>
                          {STATUS_CONFIG[lead.status]?.label || lead.status}
                        </Badge>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card className="col-span-12 lg:col-span-5 border-slate-200 shadow-sm" data-testid="card-lead-pipeline">
            <CardHeader className="p-3 pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900">Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2.5">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const count = stats?.byStatus?.[key] || 0;
                  const percentage = stats?.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                      <span className="text-xs text-slate-600 flex-1">{config.label}</span>
                      <span className="text-xs font-semibold text-slate-900 w-6 text-right">{count}</span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${config.dot} transition-all duration-500`}
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

        {/* Bottom Row */}
        <div className="grid grid-cols-12 gap-3">
          {/* Lead Sources */}
          <Card className="col-span-6 lg:col-span-3 border-slate-200 shadow-sm" data-testid="card-lead-sources-chart">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-semibold text-slate-900">Lead Sources</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {sourceChartData.length > 0 ? (
                <div className="flex items-center gap-2">
                  <ResponsiveContainer width={80} height={80}>
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={35}
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
                      <div key={item.name} className="flex items-center gap-1.5 text-[11px]">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-slate-600 truncate flex-1">{item.name}</span>
                        <span className="font-medium text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-xs text-slate-400">
                  No data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card className="col-span-6 lg:col-span-3 border-slate-200 shadow-sm" data-testid="card-upcoming-appointments">
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900">Upcoming</CardTitle>
              <Link href="/admin/calendar">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600" data-testid="button-view-calendar">
                  <Calendar className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-3">
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-2">
                  {upcomingAppointments.slice(0, 3).map((apt: any) => (
                    <div key={apt.id} className="flex items-center gap-2" data-testid={`appointment-${apt.id}`}>
                      <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs text-slate-900 truncate">{apt.title || apt.lead?.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {format(new Date(apt.scheduledAt), "MMM dd, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No appointments
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-12 lg:col-span-6 border-slate-200 shadow-sm" data-testid="card-quick-actions">
            <CardHeader className="p-3 pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                <Link href="/admin/leads">
                  <Button variant="ghost" className="w-full h-auto py-2.5 flex-col gap-1.5 bg-slate-50 hover:bg-slate-100 border-0" data-testid="button-quick-leads">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-[10px] text-slate-600 font-medium">Leads</span>
                  </Button>
                </Link>
                <Link href="/admin/calendar">
                  <Button variant="ghost" className="w-full h-auto py-2.5 flex-col gap-1.5 bg-slate-50 hover:bg-slate-100 border-0" data-testid="button-quick-calendar">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] text-slate-600 font-medium">Calendar</span>
                  </Button>
                </Link>
                <Link href="/admin/portfolio">
                  <Button variant="ghost" className="w-full h-auto py-2.5 flex-col gap-1.5 bg-slate-50 hover:bg-slate-100 border-0" data-testid="button-quick-portfolio">
                    <Image className="h-4 w-4 text-purple-500" />
                    <span className="text-[10px] text-slate-600 font-medium">Portfolio</span>
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="ghost" className="w-full h-auto py-2.5 flex-col gap-1.5 bg-slate-50 hover:bg-slate-100 border-0" data-testid="button-quick-reports">
                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] text-slate-600 font-medium">Reports</span>
                  </Button>
                </Link>
                <Link href="/admin/chat">
                  <Button variant="ghost" className="w-full h-auto py-2.5 flex-col gap-1.5 bg-slate-50 hover:bg-slate-100 border-0" data-testid="button-quick-chat">
                    <MessageCircle className="h-4 w-4 text-pink-500" />
                    <span className="text-[10px] text-slate-600 font-medium">Chat</span>
                  </Button>
                </Link>
                <Link href="/admin/callbacks">
                  <Button variant="ghost" className="w-full h-auto py-2.5 flex-col gap-1.5 bg-slate-50 hover:bg-slate-100 border-0" data-testid="button-quick-callbacks">
                    <PhoneCall className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] text-slate-600 font-medium">Callbacks</span>
                  </Button>
                </Link>
                <Link href="/admin/team">
                  <Button variant="ghost" className="w-full h-auto py-2.5 flex-col gap-1.5 bg-slate-50 hover:bg-slate-100 border-0" data-testid="button-quick-team">
                    <Users className="h-4 w-4 text-cyan-500" />
                    <span className="text-[10px] text-slate-600 font-medium">Team</span>
                  </Button>
                </Link>
                <Link href="/admin/invoices">
                  <Button variant="ghost" className="w-full h-auto py-2.5 flex-col gap-1.5 bg-slate-50 hover:bg-slate-100 border-0" data-testid="button-quick-invoices">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-[10px] text-slate-600 font-medium">Invoices</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-base font-semibold">Lead Details</DialogTitle>
            <DialogDescription className="text-xs">View and update lead information</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-[10px] text-slate-400 uppercase tracking-wide">Contact</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{selectedLead.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedLead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span className="capitalize">{selectedLead.contactMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-[10px] text-slate-400 uppercase tracking-wide">Event</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedLead.date ? format(new Date(selectedLead.date), "PPP") : "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{selectedLead.location || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedLead.guestCount || 0} guests</span>
                    </div>
                    <div>
                      <Badge variant="secondary" className="capitalize text-xs">{selectedLead.eventType}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div>
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1.5 block">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 text-sm" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key} className="text-sm">{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1.5 block">Notes</label>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={2}
                    className="text-sm resize-none"
                    data-testid="textarea-notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSelectedLead(null)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  className="h-8 text-xs"
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
