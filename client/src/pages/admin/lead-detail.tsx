import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft,
  Phone, 
  Mail, 
  MapPin, 
  Calendar as CalendarIcon,
  MessageSquare,
  User,
  Clock,
  Edit,
  Save,
  Plus,
  Pin,
  Trash2,
  CalendarCheck,
  PhoneCall,
  Video,
  Building,
  IndianRupee,
  Users,
  Activity,
  FileText,
  Send,
  Check,
  X,
} from "lucide-react";
import { budgetRanges, leadStatuses, appointmentTypes, eventTypes } from "@shared/schema";

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  'follow-up': 'Follow-up',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
};

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

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [newNote, setNewNote] = useState("");
  
  const [editForm, setEditForm] = useState({
    status: "",
    assignedTo: "",
    notes: "",
  });
  
  const [appointmentForm, setAppointmentForm] = useState({
    title: "",
    description: "",
    scheduledAt: new Date(),
    duration: 30,
    type: "call",
    assignedTo: "",
  });
  
  const [activityForm, setActivityForm] = useState({
    action: "",
    details: "",
    outcome: "",
  });

  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${id}`);
      if (!response.ok) throw new Error("Failed to fetch lead");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: notes } = useQuery({
    queryKey: ["leadNotes", id],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${id}/notes`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: activities } = useQuery({
    queryKey: ["leadActivities", id],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${id}/activity`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: appointments } = useQuery({
    queryKey: ["leadAppointments", id],
    queryFn: async () => {
      const response = await fetch(`/api/leads/${id}/appointments`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Failed to fetch team");
      return response.json();
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update lead");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leadActivities", id] });
      setIsEditing(false);
      toast({ title: "Success", description: "Lead updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update lead", variant: "destructive" });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/leads/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to create note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadNotes", id] });
      queryClient.invalidateQueries({ queryKey: ["leadActivities", id] });
      setNewNote("");
      toast({ title: "Success", description: "Note added successfully" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete note");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadNotes", id] });
      toast({ title: "Success", description: "Note deleted" });
    },
  });

  const togglePinNoteMutation = useMutation({
    mutationFn: async ({ noteId, isPinned }: { noteId: string; isPinned: boolean }) => {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      });
      if (!response.ok) throw new Error("Failed to update note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadNotes", id] });
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, leadId: id }),
      });
      if (!response.ok) throw new Error("Failed to create appointment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadAppointments", id] });
      queryClient.invalidateQueries({ queryKey: ["leadActivities", id] });
      setShowAppointmentDialog(false);
      setAppointmentForm({
        title: "",
        description: "",
        scheduledAt: new Date(),
        duration: 30,
        type: "call",
        assignedTo: "",
      });
      toast({ title: "Success", description: "Appointment scheduled" });
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/leads/${id}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to log activity");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadActivities", id] });
      setShowActivityDialog(false);
      setActivityForm({ action: "", details: "", outcome: "" });
      toast({ title: "Success", description: "Activity logged" });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: string }) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update appointment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadAppointments", id] });
      queryClient.invalidateQueries({ queryKey: ["leadActivities", id] });
      toast({ title: "Success", description: "Appointment updated" });
    },
  });

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

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case "call": return <PhoneCall className="h-4 w-4" />;
      case "video_call": return <Video className="h-4 w-4" />;
      case "meeting": return <Users className="h-4 w-4" />;
      case "site_visit": return <Building className="h-4 w-4" />;
      default: return <CalendarCheck className="h-4 w-4" />;
    }
  };

  if (leadLoading) {
    return (
      <AdminLayout title="Lead Details" description="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout title="Lead Not Found" description="">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Lead not found</p>
          <Link href="/admin/leads">
            <Button>Back to Leads</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Lead Details" description={lead.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/leads">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <a href={`tel:${lead.phone}`}>
              <Button variant="outline" size="sm" data-testid="button-call">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </a>
            <a href={`mailto:${lead.email}`}>
              <Button variant="outline" size="sm" data-testid="button-email">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </a>
            <Button onClick={() => setShowAppointmentDialog(true)} data-testid="button-schedule">
              <CalendarCheck className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="card-lead-info">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{lead.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <Badge className={getStatusColor(lead.status)}>
                      {STATUS_LABELS[lead.status] || lead.status}
                    </Badge>
                    <span className="text-sm">Source: {SOURCE_LABELS[lead.leadSource] || lead.leadSource}</span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      updateLeadMutation.mutate(editForm);
                    } else {
                      setEditForm({
                        status: lead.status,
                        assignedTo: lead.assignedTo || "",
                        notes: lead.notes || "",
                      });
                      setIsEditing(true);
                    }
                  }}
                  data-testid="button-edit"
                >
                  {isEditing ? <Save className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{lead.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Preferred Contact</p>
                          <p className="font-medium capitalize">{lead.contactMethod}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Event Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Event Date</p>
                          <p className="font-medium">{lead.date ? format(new Date(lead.date), "PPP") : "TBD"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{lead.location || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Guest Count</p>
                          <p className="font-medium">{lead.guestCount || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Budget Range</p>
                          <p className="font-medium">
                            {budgetRanges.find(b => b.value === lead.budgetRange)?.label || lead.budgetRange || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <Select 
                            value={editForm.status} 
                            onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v }))}
                          >
                            <SelectTrigger data-testid="select-edit-status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {leadStatuses.map(status => (
                                <SelectItem key={status} value={status}>
                                  {STATUS_LABELS[status] || status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Assigned To</label>
                          <Select 
                            value={editForm.assignedTo || "unassigned"} 
                            onValueChange={(v) => setEditForm(prev => ({ ...prev, assignedTo: v === "unassigned" ? "" : v }))}
                          >
                            <SelectTrigger data-testid="select-edit-assignee">
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {teamMembers?.map((member: any) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name || member.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => updateLeadMutation.mutate(editForm)}
                          disabled={updateLeadMutation.isPending}
                        >
                          {updateLeadMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {lead.message && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">Message</h3>
                      <p className="text-sm bg-muted p-4 rounded-lg">{lead.message}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="notes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="notes" data-testid="tab-notes">
                  <FileText className="w-4 h-4 mr-2" />
                  Notes ({notes?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="activity" data-testid="tab-activity">
                  <Activity className="w-4 h-4 mr-2" />
                  Activity Log ({activities?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="appointments" data-testid="tab-appointments">
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  Appointments ({appointments?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Internal Notes</CardTitle>
                    <CardDescription>Add notes about this lead for your team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1"
                        data-testid="textarea-new-note"
                      />
                      <Button 
                        onClick={() => createNoteMutation.mutate(newNote)}
                        disabled={!newNote.trim() || createNoteMutation.isPending}
                        data-testid="button-add-note"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {notes?.map((note: any) => (
                        <div 
                          key={note.id} 
                          className={cn(
                            "p-4 rounded-lg border",
                            note.isPinned && "bg-yellow-50 border-yellow-200"
                          )}
                          data-testid={`note-${note.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {note.user?.name || note.user?.username || "Unknown"} - {format(new Date(note.createdAt), "MMM dd, yyyy h:mm a")}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => togglePinNoteMutation.mutate({ noteId: note.id, isPinned: !note.isPinned })}
                              >
                                <Pin className={cn("w-4 h-4", note.isPinned && "text-yellow-600 fill-yellow-600")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => deleteNoteMutation.mutate(note.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!notes || notes.length === 0) && (
                        <p className="text-center py-8 text-muted-foreground">No notes yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Activity Log</CardTitle>
                      <CardDescription>Track all interactions with this lead</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setShowActivityDialog(true)} data-testid="button-log-activity">
                      <Plus className="w-4 h-4 mr-2" />
                      Log Activity
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities?.map((activity: any) => (
                        <div key={activity.id} className="flex gap-4" data-testid={`activity-${activity.id}`}>
                          <div className="flex flex-col items-center">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <div className="w-px h-full bg-border mt-2" />
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-sm capitalize">{activity.action.replace(/_/g, ' ')}</p>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                            )}
                            {activity.outcome && (
                              <p className="text-sm mt-1">
                                <span className="text-muted-foreground">Outcome:</span> {activity.outcome}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {activity.user?.name || activity.user?.username || "System"} - {format(new Date(activity.createdAt), "MMM dd, yyyy h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(!activities || activities.length === 0) && (
                        <p className="text-center py-8 text-muted-foreground">No activity logged yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Appointments</CardTitle>
                      <CardDescription>Scheduled calls and meetings</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setShowAppointmentDialog(true)} data-testid="button-new-appointment">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {appointments?.map((apt: any) => (
                        <div 
                          key={apt.id} 
                          className={cn(
                            "p-4 rounded-lg border flex items-center justify-between",
                            apt.status === "completed" && "bg-green-50 border-green-200",
                            apt.status === "cancelled" && "bg-gray-50 border-gray-200 opacity-60"
                          )}
                          data-testid={`appointment-${apt.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-2 rounded-lg",
                              apt.status === "completed" ? "bg-green-100" : "bg-primary/10"
                            )}>
                              {getAppointmentIcon(apt.type)}
                            </div>
                            <div>
                              <p className="font-medium">{apt.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(apt.scheduledAt), "MMM dd, yyyy h:mm a")} - {apt.duration} min
                              </p>
                              {apt.assignee && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Assigned to: {apt.assignee.name || apt.assignee.username}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={apt.status === "scheduled" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {apt.status}
                            </Badge>
                            {apt.status === "scheduled" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600"
                                  onClick={() => updateAppointmentMutation.mutate({ appointmentId: apt.id, status: "completed" })}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => updateAppointmentMutation.mutate({ appointmentId: apt.id, status: "cancelled" })}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!appointments || appointments.length === 0) && (
                        <p className="text-center py-8 text-muted-foreground">No appointments scheduled</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card data-testid="card-quick-info">
              <CardHeader>
                <CardTitle className="text-base">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <p className="font-medium capitalize">{lead.eventType}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">
                    {lead.assignee?.name || lead.assignee?.username || "Unassigned"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{format(new Date(lead.createdAt), "PPP")}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{format(new Date(lead.updatedAt || lead.createdAt), "PPP")}</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-upcoming-appointments">
              <CardHeader>
                <CardTitle className="text-base">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments?.filter((apt: any) => apt.status === "scheduled" && new Date(apt.scheduledAt) > new Date()).slice(0, 3).map((apt: any) => (
                  <div key={apt.id} className="flex items-center gap-3 py-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getAppointmentIcon(apt.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{apt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(apt.scheduledAt), "MMM dd, h:mm a")}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>Schedule a call or meeting with {lead.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g., Initial consultation call"
                value={appointmentForm.title}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, title: e.target.value }))}
                data-testid="input-appointment-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={appointmentForm.type}
                  onValueChange={(v) => setAppointmentForm(prev => ({ ...prev, type: v }))}
                >
                  <SelectTrigger data-testid="select-appointment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (min)</label>
                <Select
                  value={String(appointmentForm.duration)}
                  onValueChange={(v) => setAppointmentForm(prev => ({ ...prev, duration: parseInt(v) }))}
                >
                  <SelectTrigger data-testid="select-appointment-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date & Time</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" data-testid="button-select-date">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(appointmentForm.scheduledAt, "PPP p")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={appointmentForm.scheduledAt}
                    onSelect={(date) => date && setAppointmentForm(prev => ({ ...prev, scheduledAt: date }))}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={format(appointmentForm.scheduledAt, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(appointmentForm.scheduledAt);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setAppointmentForm(prev => ({ ...prev, scheduledAt: newDate }));
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign To</label>
              <Select
                value={appointmentForm.assignedTo || "unassigned"}
                onValueChange={(v) => setAppointmentForm(prev => ({ ...prev, assignedTo: v === "unassigned" ? "" : v }))}
              >
                <SelectTrigger data-testid="select-appointment-assignee">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers?.map((member: any) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name || member.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                placeholder="Add any notes..."
                value={appointmentForm.description}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, description: e.target.value }))}
                data-testid="textarea-appointment-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createAppointmentMutation.mutate(appointmentForm)}
              disabled={!appointmentForm.title || createAppointmentMutation.isPending}
              data-testid="button-create-appointment"
            >
              {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>Record an interaction with {lead.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select
                value={activityForm.action}
                onValueChange={(v) => setActivityForm(prev => ({ ...prev, action: v }))}
              >
                <SelectTrigger data-testid="select-activity-action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="called">Made a Call</SelectItem>
                  <SelectItem value="emailed">Sent Email</SelectItem>
                  <SelectItem value="messaged">Sent Message</SelectItem>
                  <SelectItem value="met">Had Meeting</SelectItem>
                  <SelectItem value="site_visit">Site Visit</SelectItem>
                  <SelectItem value="proposal_sent">Sent Proposal</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Details</label>
              <Textarea
                placeholder="What happened?"
                value={activityForm.details}
                onChange={(e) => setActivityForm(prev => ({ ...prev, details: e.target.value }))}
                data-testid="textarea-activity-details"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <Input
                placeholder="e.g., Client interested, needs time to decide"
                value={activityForm.outcome}
                onChange={(e) => setActivityForm(prev => ({ ...prev, outcome: e.target.value }))}
                data-testid="input-activity-outcome"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivityDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createActivityMutation.mutate(activityForm)}
              disabled={!activityForm.action || createActivityMutation.isPending}
              data-testid="button-log-activity-submit"
            >
              {createActivityMutation.isPending ? "Logging..." : "Log Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
