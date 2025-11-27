import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

const mockEvents = [
  { id: 1, name: "Johnson Wedding", date: 14, type: "wedding", color: "bg-pink-500" },
  { id: 2, name: "Tech Corp Gala", date: 20, type: "corporate", color: "bg-blue-500" },
  { id: 3, name: "Site Visit", date: 8, type: "meeting", color: "bg-green-500" },
  { id: 4, name: "Vendor Meeting", date: 12, type: "meeting", color: "bg-amber-500" },
];

export default function CalendarPage() {
  const [currentMonth] = useState("February 2025");
  const daysInMonth = 28;
  const startDay = 6; // Saturday

  const getDayEvents = (day: number) => {
    return mockEvents.filter(e => e.date === day);
  };

  return (
    <AdminLayout title="Calendar" description="View and manage your event schedule">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" data-testid="button-prev-month">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold">{currentMonth}</h2>
            <Button variant="outline" size="icon" data-testid="button-next-month">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-today">Today</Button>
            <Button data-testid="button-add-event">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-b">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[120px] p-2 border-b border-r bg-muted/20"></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const events = getDayEvents(day);
                return (
                  <div key={day} className="min-h-[120px] p-2 border-b border-r hover:bg-muted/50 transition-colors cursor-pointer">
                    <span className="text-sm font-medium">{day}</span>
                    <div className="mt-1 space-y-1">
                      {events.map(event => (
                        <div key={event.id} className={`text-xs px-2 py-1 rounded text-white truncate ${event.color}`}>
                          {event.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockEvents.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${event.color}`}></div>
                  <div>
                    <p className="text-sm font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">Feb {event.date}, 2025</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span className="text-sm">Weddings</span>
                </div>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Corporate</span>
                </div>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Social</span>
                </div>
                <Badge variant="secondary">5</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Events This Month</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Site Visits Scheduled</span>
                <span className="font-semibold">6</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vendor Meetings</span>
                <span className="font-semibold">3</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
