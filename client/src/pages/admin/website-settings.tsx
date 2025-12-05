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
import { X, Plus, Save, Loader2 } from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

interface WebsiteSettings {
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsappNumber: string | null;
  mapEmbedCode: string | null;
  topBarAddress: string | null;
  secondaryAddress: string | null;
  socialMedia: SocialLink[];
  numberOfEventsHeld: number;
  ratings: number;
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

export default function WebsiteSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
  });
  const [newSocial, setNewSocial] = useState({ platform: "", url: "" });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings/company"],
    queryFn: async () => {
      const response = await fetch("/api/settings/company");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
    onSuccess: (data) => {
      setFormData({
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        whatsappNumber: data.whatsappNumber || "",
        mapEmbedCode: data.mapEmbedCode || "",
        topBarAddress: data.topBarAddress || "",
        secondaryAddress: data.secondaryAddress || "",
        socialMedia: Array.isArray(data.socialMedia) ? data.socialMedia : [],
        numberOfEventsHeld: data.numberOfEventsHeld || 0,
        ratings: data.ratings || 0,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
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
      toast({ title: "Settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Events") || name === "ratings" ? parseInt(value) || 0 : value,
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

  if (isLoading) {
    return <AdminLayout title="Website Settings"><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout title="Website Settings" description="Manage your website contact information and content">
      <div className="space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </AdminLayout>
  );
}
