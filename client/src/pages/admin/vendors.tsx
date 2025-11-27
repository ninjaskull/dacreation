import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Mail, Phone, MoreHorizontal, Star, MapPin } from "lucide-react";

const mockVendors = [
  { id: 1, name: "Bloom Florists", category: "Florist", contact: "Lisa Brown", email: "lisa@bloomflorists.com", phone: "+1 555-1234", rating: 4.9, events: 45 },
  { id: 2, name: "Divine Catering", category: "Catering", contact: "James Wilson", email: "james@divinecatering.com", phone: "+1 555-5678", rating: 4.8, events: 62 },
  { id: 3, name: "Snapshot Photography", category: "Photography", contact: "Maria Garcia", email: "maria@snapshot.com", phone: "+1 555-9012", rating: 5.0, events: 38 },
  { id: 4, name: "Melody DJ Services", category: "Entertainment", contact: "Chris Lee", email: "chris@melodydj.com", phone: "+1 555-3456", rating: 4.7, events: 51 },
];

const categories = ["All", "Florist", "Catering", "Photography", "Entertainment", "Venue", "Decor"];

export default function VendorsPage() {
  return (
    <AdminLayout title="Vendors" description="Manage your vendor partnerships">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Vendor Directory</h2>
            <p className="text-muted-foreground">Trusted partners for exceptional events</p>
          </div>
          <Button data-testid="button-add-vendor">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">42</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 flex items-center gap-1">
                4.8 <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search vendors..." className="pl-9" data-testid="input-search-vendors" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <Button key={cat} variant={cat === "All" ? "default" : "outline"} size="sm" data-testid={`button-filter-${cat.toLowerCase()}`}>
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockVendors.map((vendor) => (
                  <TableRow key={vendor.id} data-testid={`row-vendor-${vendor.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {vendor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-muted-foreground">{vendor.contact}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {vendor.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{vendor.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>{vendor.events} events</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" data-testid={`button-vendor-menu-${vendor.id}`}>
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
