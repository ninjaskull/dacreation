import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  Trash2,
  Users,
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
  admin: 'Full access to all dashboard features including settings',
  staff: 'Access to all tabs except Settings, Website Settings & Email Settings',
  viewer: 'Read-only access to view basic details without making changes',
};

export default function TeamPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser, isAdmin, isViewer, permissions } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    role: "staff",
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json() as Promise<TeamMember[]>;
    },
    enabled: isAdmin,
  });

  const { data: team } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Failed to fetch team");
      return response.json();
    },
    enabled: !isAdmin,
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData & { isActive: boolean }> }) => {
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
    onError: () => {
      toast({ title: "Error", description: "Failed to update team member", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      if (!response.ok) throw new Error("Failed to remove user");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      setDeletingMember(null);
      toast({ title: "Success", description: "Team member removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove team member", variant: "destructive" });
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
    if (!isAdmin) {
      toast({ title: "Error", description: "Admin access required", variant: "destructive" });
      return;
    }
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
      case "viewer": return <Eye className="h-4 w-4 text-slate-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "staff": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "viewer": return "bg-slate-100 text-slate-600 hover:bg-slate-100";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const displayUsers = isAdmin ? users : team;
  const activeUsers = displayUsers?.filter((u: TeamMember) => u.isActive) || [];
  const inactiveUsers = displayUsers?.filter((u: TeamMember) => !u.isActive) || [];

  return (
    <AdminLayout title="Team Members" description={isAdmin ? "Manage your team and permissions" : "View your team members"}>
      <div className="space-y-4 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
              <p className="text-sm text-slate-500">
                {activeUsers.length} active member{activeUsers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowAddDialog(true)} className="gap-2" data-testid="button-add-member">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          )}
        </div>

        {/* Role Overview Cards - Admin Only */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {userRoles.map(role => {
              const count = users?.filter(u => u.role === role && u.isActive).length || 0;
              return (
                <Card key={role} className="border-slate-200 shadow-sm" data-testid={`card-role-${role}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          role === 'admin' ? 'bg-purple-100' : role === 'staff' ? 'bg-blue-100' : 'bg-slate-100'
                        }`}>
                          {getRoleIcon(role)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{ROLE_LABELS[role]}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{ROLE_DESCRIPTIONS[role]}</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-slate-900">{count}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Team Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold text-slate-900">
              {isAdmin ? "All Team Members" : "Team Directory"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading team members...</div>
            ) : !activeUsers || activeUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No team members found</p>
                {isAdmin && (
                  <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first team member
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="text-xs font-semibold text-slate-500">Member</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Contact</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Role</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                    {isAdmin && <TableHead className="text-xs font-semibold text-slate-500">Joined</TableHead>}
                    {isAdmin && <TableHead className="text-xs font-semibold text-slate-500 w-[60px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeUsers.map((member: TeamMember) => (
                    <TableRow key={member.id} className="hover:bg-slate-50/50" data-testid={`row-member-${member.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white text-sm font-medium">
                              {(member.name || member.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-slate-900">{member.name || member.username}</p>
                            <p className="text-xs text-slate-500">@{member.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-0.5">
                          {member.email && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="text-xs">{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="text-xs">{member.phone}</span>
                            </div>
                          )}
                          {!member.email && !member.phone && (
                            <span className="text-xs text-slate-400">No contact info</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs font-medium ${getRoleBadgeStyles(member.role)}`}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{ROLE_LABELS[member.role] || member.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={member.isActive 
                            ? "bg-emerald-100 text-emerald-700 text-xs" 
                            : "bg-slate-100 text-slate-500 text-xs"
                          }
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-xs text-slate-500">
                          {member.createdAt ? format(new Date(member.createdAt), "MMM dd, yyyy") : "-"}
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs text-slate-500">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(member)} className="text-sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateUserMutation.mutate({ 
                                  id: member.id, 
                                  data: { isActive: !member.isActive }
                                })}
                                className="text-sm"
                              >
                                <UserCog className="w-4 h-4 mr-2" />
                                {member.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              {member.id !== currentUser?.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => setDeletingMember(member)}
                                    className="text-sm text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove Member
                                  </DropdownMenuItem>
                                </>
                              )}
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

        {/* Inactive Users - Admin Only */}
        {isAdmin && inactiveUsers.length > 0 && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900">
                Inactive Members ({inactiveUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {inactiveUsers.map((member: TeamMember) => (
                    <TableRow key={member.id} className="opacity-60 hover:opacity-100">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-slate-200 text-slate-500 text-sm font-medium">
                              {(member.name || member.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-slate-700">{member.name || member.username}</p>
                            <p className="text-xs text-slate-400">@{member.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-500">
                          {ROLE_LABELS[member.role] || member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => updateUserMutation.mutate({ id: member.id, data: { isActive: true } })}
                        >
                          Reactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingMember} onOpenChange={() => { setShowAddDialog(false); setEditingMember(null); resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
            <DialogDescription className="text-sm">
              {editingMember ? "Update member details and permissions" : "Add a new member to your team"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editingMember && (
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="username"
                    placeholder="johndoe"
                    className="pl-9 h-10"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    data-testid="input-username"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                {editingMember ? "New Password (optional)" : "Password"}
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder={editingMember ? "Leave blank to keep current" : "Min 8 chars, uppercase, number, special"}
                  className="pl-9 h-10"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  data-testid="input-password"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="h-10"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="h-10"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  className="h-10"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Role & Permissions</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
              >
                <SelectTrigger className="h-10" data-testid="select-role">
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
              <p className="text-[11px] text-slate-500 mt-1">
                {ROLE_DESCRIPTIONS[formData.role]}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
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
                : editingMember ? "Save Changes" : "Add Member"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deletingMember?.name || deletingMember?.username}</strong> from your team? 
              This will deactivate their account and they will no longer be able to access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMember && deleteUserMutation.mutate(deletingMember.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
