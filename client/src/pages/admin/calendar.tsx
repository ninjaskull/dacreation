import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  PhoneCall,
  Video,
  Users,
  Building,
  Clock,
  User,
  Check,
  X,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { appointmentTypes } from "@shared/schema";

type AppointmentWithDetails = {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  leadId: string;
  lead?: { id: string; name: string; email: string; phone: string } | null;
  assignee?: { id: string; name: string | null; username: string } | null;
};

const TYPE_COLORS: Record<string, string> = {
  call: "bg-blue-500",
  video_call: "bg-purple-500",
  meeting: "bg-green-500",
  site_visit: "bg-orange-500",
};

export default function CalendarPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [filterAssignee, setFilterAssignee] = useState("all");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", format(monthStart, "yyyy-MM"), filterAssignee],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("from", monthStart.toISOString());
      params.append("to", monthEnd.toISOString());
      if (filterAssignee !== "all") {
        params.append("assignedTo", filterAssignee);
      }
      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json() as Promise<AppointmentWithDetails[]>;
    },
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Failed to fetch team");
      return response.json();
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads");
      if (!response.ok) throw new Error("Failed to fetch leads");
      return response.json();
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update appointment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setSelectedAppointment(null);
      toast({ title: "Success", description: "Appointment updated" });
    },
  });

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentMonth]);

  const firstDayOfWeek = monthStart.getDay();

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, AppointmentWithDetails[]>();
    appointments?.forEach(apt => {
      const dateKey = format(new Date(apt.scheduledAt), "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(apt);
    });
    return map;
  }, [appointments]);

  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return appointmentsByDate.get(dateKey) || [];
  }, [selectedDate, appointmentsByDate]);

  const stats = useMemo(() => {
    if (!appointments) return { total: 0, scheduled: 0, completed: 0, cancelled: 0 };
    return {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === "scheduled").length,
      completed: appointments.filter(a => a.status === "completed").length,
      cancelled: appointments.filter(a => a.status === "cancelled").length,
    };
  }, [appointments]);

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case "call": return <PhoneCall className="h-3 w-3" />;
      case "video_call": return <Video className="h-3 w-3" />;
      case "meeting": return <Users className="h-3 w-3" />;
      case "site_visit": return <Building className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <AdminLayout title="Calendar" description="View and manage your appointments">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} data-testid="button-prev-month">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[180px] text-center" data-testid="text-current-month">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} data-testid="button-next-month">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-assignee">
                <User className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All team members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team Members</SelectItem>
                {teamMembers?.map((member: any) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name || member.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }} 
              data-testid="button-today"
            >
              Today
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-total-appointments">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-scheduled">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Scheduled
                <Badge className="bg-blue-500">Upcoming</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-completed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Completed
                <Badge className="bg-green-500">Done</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-cancelled">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Cancelled
                <Badge variant="secondary">Cancelled</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3" data-testid="card-calendar">
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] p-2 border-b border-r bg-muted/20"></div>
                ))}
                
                {daysInMonth.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const dayAppointments = appointmentsByDate.get(dateKey) || [];
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={cn(
                        "min-h-[100px] p-2 border-b border-r hover:bg-muted/50 transition-colors cursor-pointer",
                        isToday(day) && "bg-primary/5",
                        isSelected && "ring-2 ring-primary ring-inset"
                      )}
                      onClick={() => setSelectedDate(day)}
                      data-testid={`day-${format(day, "yyyy-MM-dd")}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                          isToday(day) && "bg-primary text-primary-foreground"
                        )}>
                          {format(day, "d")}
                        </span>
                        {dayAppointments.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {dayAppointments.length}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayAppointments.slice(0, 2).map(apt => (
                          <div 
                            key={apt.id} 
                            className={cn(
                              "text-xs px-2 py-1 rounded text-white truncate flex items-center gap-1",
                              TYPE_COLORS[apt.type] || "bg-gray-500",
                              apt.status === "cancelled" && "opacity-50 line-through"
                            )}
                            onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); }}
                          >
                            {getAppointmentIcon(apt.type)}
                            <span className="truncate">{apt.lead?.name || apt.title}</span>
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-muted-foreground px-2">
                            +{dayAppointments.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card data-testid="card-selected-date">
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  selectedDateAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateAppointments.map(apt => (
                        <div 
                          key={apt.id} 
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                            apt.status === "completed" && "bg-green-50 border-green-200",
                            apt.status === "cancelled" && "opacity-60"
                          )}
                          onClick={() => setSelectedAppointment(apt)}
                          data-testid={`appointment-card-${apt.id}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("p-1.5 rounded", TYPE_COLORS[apt.type] || "bg-gray-500")}>
                              {getAppointmentIcon(apt.type)}
                            </div>
                            <span className="font-medium text-sm">{apt.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {format(new Date(apt.scheduledAt), "h:mm a")} - {apt.duration} min
                          </p>
                          {apt.lead && (
                            <p className="text-xs">
                              <span className="text-muted-foreground">Lead:</span> {apt.lead.name}
                            </p>
                          )}
                          <div className="mt-2">
                            <Badge 
                              variant={apt.status === "scheduled" ? "default" : "secondary"}
                              className="text-xs capitalize"
                            >
                              {apt.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No appointments on this day
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Click a date to view appointments
                  </p>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-legend">
              <CardHeader>
                <CardTitle className="text-base">Appointment Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {appointmentTypes.map(type => (
                  <div key={type.value} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", TYPE_COLORS[type.value] || "bg-gray-500")} />
                    <span className="text-sm">{type.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedAppointment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAppointment && format(new Date(selectedAppointment.scheduledAt), "EEEE, MMMM d 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedAppointment.type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedAppointment.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={selectedAppointment.status === "scheduled" ? "default" : "secondary"}
                    className="capitalize mt-1"
                  >
                    {selectedAppointment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">
                    {selectedAppointment.assignee?.name || selectedAppointment.assignee?.username || "Unassigned"}
                  </p>
                </div>
              </div>

              {selectedAppointment.lead && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Lead</p>
                  <p className="font-medium">{selectedAppointment.lead.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.lead.phone}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.lead.email}</p>
                  <Link href={`/admin/leads/${selectedAppointment.leadId}`}>
                    <Button variant="link" size="sm" className="px-0 mt-1">
                      View Lead Details
                    </Button>
                  </Link>
                </div>
              )}

              {selectedAppointment.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedAppointment.description}</p>
                </div>
              )}

              {selectedAppointment.status === "scheduled" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => updateAppointmentMutation.mutate({ id: selectedAppointment.id, status: "completed" })}
                    disabled={updateAppointmentMutation.isPending}
                    data-testid="button-complete-appointment"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => updateAppointmentMutation.mutate({ id: selectedAppointment.id, status: "cancelled" })}
                    disabled={updateAppointmentMutation.isPending}
                    data-testid="button-cancel-appointment"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
