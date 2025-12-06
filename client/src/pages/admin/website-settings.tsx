import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { 
  X, 
  Plus, 
  Save, 
  Loader2, 
  Settings, 
  Users, 
  Pencil, 
  Trash2,
  User,
  Mail,
  Phone,
  Linkedin,
  Instagram,
  GripVertical,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import type { TeamMember, InsertTeamMember } from "@shared/schema";

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

interface WebsiteSettings {
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  mapEmbedCode: string;
  topBarAddress: string;
  secondaryAddress: string;
  socialMedia: SocialLink[];
  numberOfEventsHeld: number;
  ratings: number;
  weddingsCount: number;
  corporateCount: number;
  socialCount: number;
  awardsCount: number;
  destinationsCount: number;
  happyGuestsCount: number;
  clientSatisfaction: number;
}

const SOCIAL_PLATFORMS = [
  { value: "facebook", label: "Facebook", icon: "🔵" },
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "twitter", label: "Twitter", icon: "🐦" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "whatsapp", label: "WhatsApp", icon: "💬" },
  { value: "pinterest", label: "Pinterest", icon: "📌" },
];

const emptyTeamMember = {
  name: "",
  role: "",
  bio: "",
  image: "",
  email: "",
  phone: "",
  linkedin: "",
  instagram: "",
  displayOrder: 0,
  isActive: true,
};

export default function WebsiteSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  
  const [formData, setFormData] = useState<WebsiteSettings>({
    address: "",
    phone: "",
    email: "",
    whatsappNumber: "",
    mapEmbedCode: "",
    topBarAddress: "",
    secondaryAddress: "",
    socialMedia: [],
    numberOfEventsHeld: 0,
    ratings: 0,
    weddingsCount: 0,
    corporateCount: 0,
    socialCount: 0,
    awardsCount: 0,
    destinationsCount: 0,
    happyGuestsCount: 0,
    clientSatisfaction: 0,
  });
  const [newSocial, setNewSocial] = useState({ platform: "", url: "" });

  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [teamFormData, setTeamFormData] = useState<Partial<InsertTeamMember>>(emptyTeamMember);
  const [deleteTeamMemberId, setDeleteTeamMemberId] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings/company"],
    queryFn: async () => {
      const response = await fetch("/api/settings/company");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  const { data: teamMembers = [], isLoading: isLoadingTeam, isError: isTeamError, refetch: refetchTeam } = useQuery<TeamMember[]>({
    queryKey: ["/api/cms/team"],
    queryFn: async () => {
      const response = await fetch("/api/cms/team");
      if (!response.ok) throw new Error("Failed to fetch team members");
      return response.json();
    },
  });

  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        whatsappNumber: settings.whatsappNumber || "",
        mapEmbedCode: settings.mapEmbedCode || "",
        topBarAddress: settings.topBarAddress || "",
        secondaryAddress: settings.secondaryAddress || "",
        socialMedia: Array.isArray(settings.socialMedia) ? settings.socialMedia : [],
        numberOfEventsHeld: settings.numberOfEventsHeld || 0,
        ratings: settings.ratings || 0,
        weddingsCount: settings.weddingsCount || 0,
        corporateCount: settings.corporateCount || 0,
        socialCount: settings.socialCount || 0,
        awardsCount: settings.awardsCount || 0,
        destinationsCount: settings.destinationsCount || 0,
        happyGuestsCount: settings.happyGuestsCount || 0,
        clientSatisfaction: settings.clientSatisfaction || 0,
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: WebsiteSettings) => {
      const response = await fetch("/api/settings/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/company"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/website"] });
      toast({ title: "Settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const createTeamMemberMutation = useMutation({
    mutationFn: async (data: Partial<InsertTeamMember>) => {
      const response = await fetch("/api/cms/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create team member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/team"] });
      setShowTeamDialog(false);
      setTeamFormData(emptyTeamMember);
      toast({ title: "Team member added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add team member", variant: "destructive" });
    },
  });

  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTeamMember> }) => {
      const response = await fetch(`/api/cms/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update team member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/team"] });
      setShowTeamDialog(false);
      setEditingTeamMember(null);
      setTeamFormData(emptyTeamMember);
      toast({ title: "Team member updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update team member", variant: "destructive" });
    },
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cms/team/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete team member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/team"] });
      setDeleteTeamMemberId(null);
      toast({ title: "Team member deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete team member", variant: "destructive" });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Events") || name === "ratings" || name.includes("Count") || name.includes("Satisfaction") ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddSocial = () => {
    if (!newSocial.platform || !newSocial.url) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    const platform = SOCIAL_PLATFORMS.find(p => p.value === newSocial.platform);
    setFormData(prev => ({
      ...prev,
      socialMedia: [...prev.socialMedia, {
        platform: newSocial.platform,
        url: newSocial.url,
        icon: platform?.icon,
      }],
    }));
    setNewSocial({ platform: "", url: "" });
  };

  const handleRemoveSocial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleTeamInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeamFormData(prev => ({
      ...prev,
      [name]: name === "displayOrder" ? parseInt(value) || 0 : value,
    }));
  };

  const handleOpenAddTeamDialog = () => {
    setEditingTeamMember(null);
    const maxOrder = teamMembers.length > 0 
      ? Math.max(...teamMembers.map(m => m.displayOrder)) + 1 
      : 0;
    setTeamFormData({ ...emptyTeamMember, displayOrder: maxOrder });
    setShowTeamDialog(true);
  };

  const handleOpenEditTeamDialog = (member: TeamMember) => {
    setEditingTeamMember(member);
    setTeamFormData({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      image: member.image || "",
      email: member.email || "",
      phone: member.phone || "",
      linkedin: member.linkedin || "",
      instagram: member.instagram || "",
      displayOrder: member.displayOrder,
      isActive: member.isActive,
    });
    setShowTeamDialog(true);
  };

  const handleSaveTeamMember = () => {
    if (!teamFormData.name || !teamFormData.role) {
      toast({ title: "Error", description: "Name and role are required", variant: "destructive" });
      return;
    }

    if (editingTeamMember) {
      updateTeamMemberMutation.mutate({ id: editingTeamMember.id, data: teamFormData });
    } else {
      createTeamMemberMutation.mutate(teamFormData);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTeamMemberId) {
      deleteTeamMemberMutation.mutate(deleteTeamMemberId);
    }
  };

  const handleMoveOrder = async (memberId: string, direction: 'up' | 'down') => {
    const sortedMembers = [...teamMembers].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sortedMembers.findIndex(m => m.id === memberId);
    
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sortedMembers.length - 1)) {
      return;
    }

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const currentMember = sortedMembers[index];
    const swapMember = sortedMembers[swapIndex];

    setIsReordering(true);
    try {
      await fetch(`/api/cms/team/${currentMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: swapMember.displayOrder }),
      });
      await fetch(`/api/cms/team/${swapMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: currentMember.displayOrder }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/team"] });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reorder team members", variant: "destructive" });
    } finally {
      setIsReordering(false);
    }
  };

  const handleCloseTeamDialog = () => {
    setShowTeamDialog(false);
    setEditingTeamMember(null);
    setTeamFormData(emptyTeamMember);
  };

  if (isLoading) {
    return <AdminLayout title="Website Settings"><div>Loading...</div></AdminLayout>;
  }

  const sortedTeamMembers = [...teamMembers].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <AdminLayout title="Website Settings" description="Manage your website content and team">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2" data-testid="tab-general">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2" data-testid="tab-teams">
            <Users className="w-4 h-4" />
            Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your primary contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    data-testid="input-email"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    data-testid="input-phone"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    data-testid="input-whatsapp"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Update your office address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Primary Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  data-testid="textarea-address"
                  placeholder="123 Business Street, City, State 12345"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="topBarAddress">Top Bar Address (Navbar)</Label>
                <Input
                  id="topBarAddress"
                  name="topBarAddress"
                  value={formData.topBarAddress}
                  onChange={handleInputChange}
                  data-testid="input-topbar-address"
                  placeholder="123 Main Street, Mumbai"
                />
              </div>
              <div>
                <Label htmlFor="secondaryAddress">Secondary Address</Label>
                <Textarea
                  id="secondaryAddress"
                  name="secondaryAddress"
                  value={formData.secondaryAddress}
                  onChange={handleInputChange}
                  data-testid="textarea-secondary-address"
                  placeholder="Alternative office address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Map Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle>Map Integration</CardTitle>
              <CardDescription>Add embedded map code for your contact page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mapEmbedCode">Map Embed Code (Google Maps iframe)</Label>
                <Textarea
                  id="mapEmbedCode"
                  name="mapEmbedCode"
                  value={formData.mapEmbedCode}
                  onChange={handleInputChange}
                  data-testid="textarea-map-embed"
                  placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="100%" height="450" style="border:0;" allowFullScreen="" loading="lazy"></iframe>'
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-2">Paste the embed code from Google Maps</p>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Add or remove social media links (only those with URLs will display)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.socialMedia.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Current Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.socialMedia.map((link, index) => (
                      <Badge key={index} className="flex items-center gap-2 px-3 py-2" data-testid={`badge-social-${link.platform}`}>
                        <span>{link.icon || '🔗'}</span>
                        <span>{link.platform}</span>
                        <button
                          onClick={() => handleRemoveSocial(index)}
                          className="ml-1 hover:text-red-500"
                          data-testid={`button-remove-social-${index}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3">Add Social Media Link</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <select
                      id="platform"
                      value={newSocial.platform}
                      onChange={(e) => setNewSocial(prev => ({ ...prev, platform: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                      data-testid="select-platform"
                    >
                      <option value="">Select a platform...</option>
                      {SOCIAL_PLATFORMS.map(platform => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="socialUrl">URL</Label>
                    <Input
                      id="socialUrl"
                      value={newSocial.url}
                      onChange={(e) => setNewSocial(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                      data-testid="input-social-url"
                    />
                  </div>
                  <Button
                    onClick={handleAddSocial}
                    variant="outline"
                    className="w-full"
                    data-testid="button-add-social"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Website statistics displayed on your homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="numberOfEventsHeld">Number of Events Held</Label>
                  <Input
                    id="numberOfEventsHeld"
                    name="numberOfEventsHeld"
                    type="number"
                    value={formData.numberOfEventsHeld}
                    onChange={handleInputChange}
                    data-testid="input-events-held"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="ratings">Rating (out of 5)</Label>
                  <Input
                    id="ratings"
                    name="ratings"
                    type="number"
                    value={formData.ratings}
                    onChange={handleInputChange}
                    data-testid="input-ratings"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="weddingsCount">Weddings</Label>
                  <Input
                    id="weddingsCount"
                    name="weddingsCount"
                    type="number"
                    value={formData.weddingsCount}
                    onChange={handleInputChange}
                    data-testid="input-weddings-count"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="corporateCount">Corporate Events</Label>
                  <Input
                    id="corporateCount"
                    name="corporateCount"
                    type="number"
                    value={formData.corporateCount}
                    onChange={handleInputChange}
                    data-testid="input-corporate-count"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="socialCount">Social Events</Label>
                  <Input
                    id="socialCount"
                    name="socialCount"
                    type="number"
                    value={formData.socialCount}
                    onChange={handleInputChange}
                    data-testid="input-social-count"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="awardsCount">Awards</Label>
                  <Input
                    id="awardsCount"
                    name="awardsCount"
                    type="number"
                    value={formData.awardsCount}
                    onChange={handleInputChange}
                    data-testid="input-awards-count"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="destinationsCount">Destinations</Label>
                  <Input
                    id="destinationsCount"
                    name="destinationsCount"
                    type="number"
                    value={formData.destinationsCount}
                    onChange={handleInputChange}
                    data-testid="input-destinations-count"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="happyGuestsCount">Happy Guests</Label>
                  <Input
                    id="happyGuestsCount"
                    name="happyGuestsCount"
                    type="number"
                    value={formData.happyGuestsCount}
                    onChange={handleInputChange}
                    data-testid="input-happy-guests-count"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="clientSatisfaction">Client Satisfaction (%)</Label>
                  <Input
                    id="clientSatisfaction"
                    name="clientSatisfaction"
                    type="number"
                    value={formData.clientSatisfaction}
                    onChange={handleInputChange}
                    data-testid="input-client-satisfaction"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage team members displayed on your public Teams page</CardDescription>
              </div>
              <Button onClick={handleOpenAddTeamDialog} disabled={isReordering} data-testid="button-add-team-member">
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingTeam ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : isTeamError ? (
                <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
                  <Users className="w-12 h-12 text-red-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-red-800">Failed to load team members</h3>
                  <p className="text-red-600 mb-4">There was an error loading the team members. Please try again.</p>
                  <Button onClick={() => refetchTeam()} variant="outline" data-testid="button-retry-team">
                    Retry
                  </Button>
                </div>
              ) : sortedTeamMembers.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first team member to display on the public Teams page</p>
                  <Button onClick={handleOpenAddTeamDialog} variant="outline" data-testid="button-add-first-team-member">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedTeamMembers.map((member, index) => (
                    <div 
                      key={member.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg ${!member.isActive ? 'bg-muted/50 opacity-60' : 'bg-white'}`}
                      data-testid={`team-member-row-${member.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleMoveOrder(member.id, 'up')}
                            disabled={index === 0 || isReordering}
                            data-testid={`button-move-up-${member.id}`}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleMoveOrder(member.id, 'down')}
                            disabled={index === sortedTeamMembers.length - 1 || isReordering}
                            data-testid={`button-move-down-${member.id}`}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] flex items-center justify-center text-white font-bold overflow-hidden">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{member.name}</h4>
                            {!member.isActive && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {member.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </span>
                            )}
                            {member.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditTeamDialog(member)}
                          disabled={isReordering || deleteTeamMemberMutation.isPending}
                          data-testid={`button-edit-team-${member.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTeamMemberId(member.id)}
                          disabled={isReordering || deleteTeamMemberMutation.isPending}
                          data-testid={`button-delete-team-${member.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Team Member Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={(open) => !open && handleCloseTeamDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTeamMember ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
            <DialogDescription>
              {editingTeamMember 
                ? "Update the team member's information. Changes will be reflected on the public Teams page immediately."
                : "Add a new team member to display on your public Teams page."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={teamFormData.name || ""}
                  onChange={handleTeamInputChange}
                  placeholder="John Doe"
                  data-testid="input-team-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role/Position *</Label>
                <Input
                  id="role"
                  name="role"
                  value={teamFormData.role || ""}
                  onChange={handleTeamInputChange}
                  placeholder="Event Manager"
                  data-testid="input-team-role"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={teamFormData.bio || ""}
                onChange={handleTeamInputChange}
                placeholder="A short bio about the team member..."
                rows={3}
                data-testid="textarea-team-bio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                name="image"
                value={teamFormData.image || ""}
                onChange={handleTeamInputChange}
                placeholder="https://example.com/image.jpg"
                data-testid="input-team-image"
              />
              <p className="text-xs text-muted-foreground">Leave empty to show initials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={teamFormData.email || ""}
                    onChange={handleTeamInputChange}
                    placeholder="john@example.com"
                    className="pl-10"
                    data-testid="input-team-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    value={teamFormData.phone || ""}
                    onChange={handleTeamInputChange}
                    placeholder="+91 98765 43210"
                    className="pl-10"
                    data-testid="input-team-phone"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={teamFormData.linkedin || ""}
                    onChange={handleTeamInputChange}
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10"
                    data-testid="input-team-linkedin"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    name="instagram"
                    value={teamFormData.instagram || ""}
                    onChange={handleTeamInputChange}
                    placeholder="https://instagram.com/username"
                    className="pl-10"
                    data-testid="input-team-instagram"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  name="displayOrder"
                  type="number"
                  value={teamFormData.displayOrder || 0}
                  onChange={handleTeamInputChange}
                  min="0"
                  data-testid="input-team-order"
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    id="isActive"
                    checked={teamFormData.isActive ?? true}
                    onCheckedChange={(checked) => setTeamFormData(prev => ({ ...prev, isActive: checked }))}
                    data-testid="switch-team-active"
                  />
                  <Label htmlFor="isActive" className="font-normal">
                    {teamFormData.isActive ? "Active (visible on website)" : "Inactive (hidden from website)"}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseTeamDialog}
              data-testid="button-cancel-team"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTeamMember}
              disabled={createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending}
              data-testid="button-save-team"
            >
              {(createTeamMemberMutation.isPending || updateTeamMemberMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingTeamMember ? "Update" : "Add"} Team Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTeamMemberId} onOpenChange={() => setDeleteTeamMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team member? This action cannot be undone and will remove them from the public Teams page immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteTeamMemberMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
