import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
} from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { Lead } from "@shared/schema";

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  inquiry_form: 'Inquiry Form',
  popup: 'Pop-up',
  floating_cta: 'Floating CTA',
  chatbot: 'Chatbot',
  lead_magnet: 'Lead Magnet',
  callback_request: 'Callback',
  contact_form: 'Contact Form',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  'follow-up': 'Follow-up',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
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
      const response = await fetch("/api/appointments/upcoming?limit=5");
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
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
    },
  });

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setStatus(lead.status);
    setNotes(lead.notes || "");
  };

  const handleUpdateLead = () => {
    if (selectedLead) {
      updateLeadMutation.mutate({
        id: selectedLead.id,
        status,
        notes,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500";
      case "contacted": return "bg-yellow-500";
      case "follow-up": return "bg-orange-500";
      case "qualified": return "bg-green-500";
      case "converted": return "bg-purple-500";
      case "lost": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const sourceChartData = stats?.bySource 
    ? Object.entries(stats.bySource).map(([name, value]) => ({
        name: SOURCE_LABELS[name] || name,
        value: value as number,
      }))
    : [];

  const statusChartData = stats?.byStatus
    ? Object.entries(stats.byStatus).map(([name, value]) => ({
        name: STATUS_LABELS[name] || name,
        value: value as number,
      }))
    : [];

  const eventTypeChartData = stats?.byEventType
    ? Object.entries(stats.byEventType).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        leads: value as number,
      }))
    : [];

  const recentLeads = leads?.slice(0, 5) || [];

  return (
    <AdminLayout title="Dashboard" description="Overview of your event management business">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500" data-testid="card-total-leads">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-leads">
                {statsLoading ? "..." : stats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time leads
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500" data-testid="card-new-today">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Today</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-new-today">
                {statsLoading ? "..." : stats?.newToday || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leads received today
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500" data-testid="card-pending-followup">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-pending-followup">
                {statsLoading ? "..." : stats?.pendingFollowUp || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Require attention
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500" data-testid="card-conversion-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-conversion-rate">
                {stats?.total > 0 
                  ? Math.round(((stats?.byStatus?.converted || 0) / stats.total) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.byStatus?.converted || 0} converted leads
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-lead-sources-chart">
            <CardHeader>
              <CardTitle className="text-base">Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {sourceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {sourceChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-event-types-chart">
            <CardHeader>
              <CardTitle className="text-base">Leads by Event Type</CardTitle>
            </CardHeader>
            <CardContent>
              {eventTypeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={eventTypeChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" data-testid="card-recent-leads">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Leads</CardTitle>
              <Link href="/admin/leads">
                <Button variant="outline" size="sm" data-testid="button-view-all-leads">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="text-center py-8">Loading leads...</div>
              ) : !leads || leads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No leads yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentLeads.map((lead) => (
                        <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell className="capitalize">{lead.eventType}</TableCell>
                          <TableCell>{lead.date ? format(new Date(lead.date), "MMM dd, yyyy") : "TBD"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/leads/${lead.id}`}>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`button-view-${lead.id}`}
                              >
                                View
                                <ArrowUpRight className="ml-1 h-3 w-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-lead-pipeline">
            <CardHeader>
              <CardTitle className="text-base">Lead Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(STATUS_LABELS).map(([key, label]) => {
                const count = stats?.byStatus?.[key] || 0;
                const percentage = stats?.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(key)}`}></div>
                        <span>{label}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStatusColor(key)} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-upcoming-appointments">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Upcoming Appointments</CardTitle>
              <Link href="/admin/calendar">
                <Button variant="outline" size="sm" data-testid="button-view-calendar">
                  View Calendar
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt: any) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50" data-testid={`appointment-${apt.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <CalendarCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{apt.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {apt.lead?.name} - {format(new Date(apt.scheduledAt), "MMM dd, h:mm a")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">{apt.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming appointments
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link href="/admin/leads">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-leads">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Leads
                </Button>
              </Link>
              <Link href="/admin/calendar">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar
                </Button>
              </Link>
              <Link href="/admin/team">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-team">
                  <Users className="mr-2 h-4 w-4" />
                  Team Members
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" className="w-full justify-start" data-testid="button-quick-reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>View and update lead information</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
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
                      <span>{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="capitalize">{selectedLead.contactMethod}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Event Details</h3>
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
                      <span className="text-sm font-medium">Type: </span>
                      <span className="capitalize">{selectedLead.eventType}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Notes</label>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    rows={4}
                    data-testid="textarea-notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateLead}
                  disabled={updateLeadMutation.isPending}
                  data-testid="button-update-lead"
                >
                  {updateLeadMutation.isPending ? "Updating..." : "Update Lead"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
