import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bell, Shield, Building, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface UserSettings {
  id?: string;
  userId?: string;
  notifyNewLeads: boolean;
  notifyAppointments: boolean;
  notifyWeeklyReports: boolean;
  notifyPayments: boolean;
  emailNotifications: boolean;
  theme: string;
}

interface CompanySettings {
  id?: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  logo?: string | null;
  logoWhite?: string | null;
  currency: string;
  timezone: string;
  fiscalYearStart: string;
  whatsappNumber?: string;
  mapEmbedCode?: string;
  topBarAddress?: string;
  secondaryAddress?: string;
}

const defaultUserSettings: UserSettings = {
  notifyNewLeads: true,
  notifyAppointments: true,
  notifyWeeklyReports: false,
  notifyPayments: true,
  emailNotifications: true,
  theme: 'system',
};

const defaultCompanySettings: CompanySettings = {
  name: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  country: 'India',
  taxId: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  fiscalYearStart: '04',
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userSettings, isLoading: loadingUserSettings } = useQuery<UserSettings>({
    queryKey: ["/api/settings/user"],
    queryFn: async () => {
      const response = await fetch("/api/settings/user");
      if (!response.ok) return defaultUserSettings;
      const data = await response.json();
      return data || defaultUserSettings;
    },
  });

  const { data: companySettings, isLoading: loadingCompanySettings } = useQuery<CompanySettings>({
    queryKey: ["/api/settings/company"],
    queryFn: async () => {
      const response = await fetch("/api/settings/company");
      if (!response.ok) return defaultCompanySettings;
      return (await response.json()) || defaultCompanySettings;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const updateUserSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const response = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/user"] });
      toast({ title: "Settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  const updateCompanySettingsMutation = useMutation({
    mutationFn: async (data: CompanySettings) => {
      const response = await fetch("/api/settings/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update company settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/company"] });
      toast({ title: "Company settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update company settings", variant: "destructive" });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    };
    updateProfileMutation.mutate(data);
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Please fill in all password fields", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords do not match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    updatePasswordMutation.mutate({ currentPassword, newPassword });
    (e.target as HTMLFormElement).reset();
  };

  const handleNotificationToggle = (key: keyof Pick<UserSettings, 'notifyNewLeads' | 'notifyAppointments' | 'notifyWeeklyReports' | 'notifyPayments' | 'emailNotifications'>) => {
    const currentValue = userSettings?.[key] ?? defaultUserSettings[key];
    updateUserSettingsMutation.mutate({ [key]: !currentValue });
  };

  const handleCompanySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<CompanySettings> = {
      name: formData.get("companyName") as string,
      email: formData.get("companyEmail") as string,
      phone: formData.get("companyPhone") as string,
      website: formData.get("website") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      taxId: formData.get("taxId") as string,
    };
    updateCompanySettingsMutation.mutate(data as CompanySettings);
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <AdminLayout title="Settings" description="Manage your account and preferences">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name || user?.username}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user?.role || 'User'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" defaultValue={user?.name || ""} data-testid="input-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={user?.email || ""} data-testid="input-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" defaultValue={user?.phone || ""} data-testid="input-phone" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                    {updateProfileMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Lead Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when a new lead comes in</p>
                  </div>
                  <Switch 
                    checked={userSettings?.notifyNewLeads ?? defaultUserSettings.notifyNewLeads} 
                    onCheckedChange={() => handleNotificationToggle('notifyNewLeads')}
                    data-testid="switch-new-leads" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Appointment Reminders</p>
                    <p className="text-sm text-muted-foreground">Receive reminders before upcoming appointments</p>
                  </div>
                  <Switch 
                    checked={userSettings?.notifyAppointments ?? defaultUserSettings.notifyAppointments}
                    onCheckedChange={() => handleNotificationToggle('notifyAppointments')}
                    data-testid="switch-appointments" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">Get a weekly summary of your business</p>
                  </div>
                  <Switch 
                    checked={userSettings?.notifyWeeklyReports ?? defaultUserSettings.notifyWeeklyReports}
                    onCheckedChange={() => handleNotificationToggle('notifyWeeklyReports')}
                    data-testid="switch-weekly-reports" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts for payments and invoices</p>
                  </div>
                  <Switch 
                    checked={userSettings?.notifyPayments ?? defaultUserSettings.notifyPayments}
                    onCheckedChange={() => handleNotificationToggle('notifyPayments')}
                    data-testid="switch-payment-notifications" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                  </div>
                  <Switch 
                    checked={userSettings?.emailNotifications ?? defaultUserSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                    data-testid="switch-email-notifications" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" name="currentPassword" type="password" data-testid="input-current-password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" name="newPassword" type="password" data-testid="input-new-password" />
                    <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" data-testid="input-confirm-password" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updatePasswordMutation.isPending} data-testid="button-update-password">
                    {updatePasswordMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your business details</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCompanySettings ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <form onSubmit={handleCompanySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" name="companyName" defaultValue={companySettings?.name || ""} data-testid="input-company-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Company Email</Label>
                      <Input id="companyEmail" name="companyEmail" type="email" defaultValue={companySettings?.email || ""} data-testid="input-company-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Company Phone</Label>
                      <Input id="companyPhone" name="companyPhone" defaultValue={companySettings?.phone || ""} data-testid="input-company-phone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" name="website" defaultValue={companySettings?.website || ""} data-testid="input-website" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / GST</Label>
                      <Input id="taxId" name="taxId" defaultValue={companySettings?.taxId || ""} data-testid="input-tax-id" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" defaultValue={companySettings?.address || ""} data-testid="input-address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" defaultValue={companySettings?.city || ""} data-testid="input-city" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" defaultValue={companySettings?.country || "India"} data-testid="input-country" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateCompanySettingsMutation.isPending} data-testid="button-save-company">
                      {updateCompanySettingsMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
