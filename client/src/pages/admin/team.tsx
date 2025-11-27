import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Plus, 
  Edit, 
  Shield,
  ShieldCheck,
  Eye,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  Key,
  UserCog,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { userRoles } from "@shared/schema";

type TeamMember = {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  staff: 'Staff',
  viewer: 'Viewer',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Full access to all leads and team management',
  staff: 'Can manage assigned leads only',
  viewer: 'Read-only access to leads',
};

export default function TeamPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    role: "staff",
  });

  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Not authenticated");
      return response.json();
    },
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json() as Promise<TeamMember[]>;
    },
    enabled: currentUser?.user?.role === 'admin',
  });

  const { data: team } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Failed to fetch team");
      return response.json();
    },
    enabled: currentUser?.user?.role !== 'admin',
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      setShowAddDialog(false);
      resetForm();
      toast({ title: "Success", description: "Team member added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      setEditingMember(null);
      resetForm();
      toast({ title: "Success", description: "Team member updated" });
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "staff",
    });
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      username: member.username,
      password: "",
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role,
    });
  };

  const handleSubmit = () => {
    if (editingMember) {
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      delete updateData.username;
      updateUserMutation.mutate({ id: editingMember.id, data: updateData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <ShieldCheck className="h-4 w-4 text-purple-500" />;
      case "staff": return <Shield className="h-4 w-4 text-blue-500" />;
      case "viewer": return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-500";
      case "staff": return "bg-blue-500";
      case "viewer": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const displayUsers = currentUser?.user?.role === 'admin' ? users : team;
  const isAdmin = currentUser?.user?.role === 'admin';

  return (
    <AdminLayout title="Team" description="Manage your team members">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Team Members</h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Manage team access and permissions" : "View your team members"}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-member">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userRoles.map(role => (
              <Card key={role} data-testid={`card-role-${role}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getRoleIcon(role)}
                    {ROLE_LABELS[role]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {ROLE_DESCRIPTIONS[role]}
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {users?.filter(u => u.role === role).length || 0}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8">Loading team members...</div>
            ) : !displayUsers || displayUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No team members found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead>Joined</TableHead>}
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayUsers.map((member: TeamMember) => (
                    <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {(member.name || member.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name || member.username}</p>
                            <p className="text-sm text-muted-foreground">@{member.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {member.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {!member.email && !member.phone && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {ROLE_LABELS[member.role] || member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-sm text-muted-foreground">
                          {member.createdAt ? format(new Date(member.createdAt), "MMM dd, yyyy") : "-"}
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(member)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateUserMutation.mutate({ 
                                  id: member.id, 
                                  data: { isActive: !member.isActive } as any
                                })}
                              >
                                {member.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog || !!editingMember} onOpenChange={() => { setShowAddDialog(false); setEditingMember(null); resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
            <DialogDescription>
              {editingMember ? "Update member details and permissions" : "Add a new member to your team"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingMember && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="johndoe"
                    className="pl-9"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    data-testid="input-username"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">{editingMember ? "New Password (leave blank to keep current)" : "Password"}</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  className="pl-9"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  data-testid="input-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
              >
                <SelectTrigger data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role)}
                        <span>{ROLE_LABELS[role]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {ROLE_DESCRIPTIONS[formData.role]}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingMember(null); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={(!editingMember && (!formData.username || !formData.password)) || createUserMutation.isPending || updateUserMutation.isPending}
              data-testid="button-submit-member"
            >
              {createUserMutation.isPending || updateUserMutation.isPending 
                ? "Saving..." 
                : editingMember ? "Update Member" : "Add Member"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
