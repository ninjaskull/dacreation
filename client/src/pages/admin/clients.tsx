import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Mail, Phone, MoreHorizontal, Star } from "lucide-react";

const mockClients = [
  { id: 1, name: "Emily Johnson", email: "emily@example.com", phone: "+1 555-0123", events: 3, totalSpent: 45000, status: "vip", lastContact: "2025-01-15" },
  { id: 2, name: "Michael Chen", email: "michael@techcorp.com", phone: "+1 555-0456", events: 1, totalSpent: 85000, status: "active", lastContact: "2025-01-20" },
  { id: 3, name: "Sarah Williams", email: "sarah@example.com", phone: "+1 555-0789", events: 2, totalSpent: 12000, status: "active", lastContact: "2025-01-18" },
  { id: 4, name: "David Miller", email: "david@company.com", phone: "+1 555-0321", events: 1, totalSpent: 28000, status: "new", lastContact: "2025-01-22" },
];

export default function ClientsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vip": return <Badge className="bg-amber-500"><Star className="w-3 h-3 mr-1" />VIP</Badge>;
      case "active": return <Badge className="bg-green-500">Active</Badge>;
      case "new": return <Badge className="bg-blue-500">New</Badge>;
      default: return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="Clients" description="Manage your client relationships">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Client Directory</h2>
            <p className="text-muted-foreground">Build lasting relationships with your clients</p>
          </div>
          <Button data-testid="button-add-client">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">VIP Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">24</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$2.4M</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search clients..." className="pl-9" data-testid="input-search-clients" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClients.map((client) => (
                  <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.events}</TableCell>
                    <TableCell className="font-medium">${client.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" data-testid={`button-client-menu-${client.id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
