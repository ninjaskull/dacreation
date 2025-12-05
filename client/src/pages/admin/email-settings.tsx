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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Settings, FileText, History, Save, Loader2, Send, Plus, Pencil, Trash2, Eye, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SmtpSettings {
  id: string;
  host: string;
  port: number;
  encryption: string;
  username: string;
  hasPassword: boolean;
  senderName: string;
  senderEmail: string;
  isActive: boolean;
  lastTestResult: string | null;
  lastTestAt: string | null;
}

interface EmailTypeSettings {
  id: string;
  notificationsEnabled: boolean;
  transactionalEnabled: boolean;
  internalEnabled: boolean;
  marketingEnabled: boolean;
  reminderEnabled: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  templateKey: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  type: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface EmailLog {
  id: string;
  templateId: string | null;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  status: string;
  errorMessage: string | null;
  type: string;
  sentAt: string;
}

const defaultSmtpSettings: Partial<SmtpSettings> = {
  host: "",
  port: 587,
  encryption: "tls",
  username: "",
  senderName: "",
  senderEmail: "",
  isActive: false,
};

const defaultEmailTypeSettings: EmailTypeSettings = {
  id: "",
  notificationsEnabled: true,
  transactionalEnabled: true,
  internalEnabled: true,
  marketingEnabled: true,
  reminderEnabled: true,
};

export default function EmailSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState("");
  const [smtpForm, setSmtpForm] = useState(defaultSmtpSettings);
  const [password, setPassword] = useState("");
  const [emailTypes, setEmailTypes] = useState(defaultEmailTypeSettings);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ subject: string; html: string } | null>(null);

  const { data: smtpSettings, isLoading: loadingSmtp } = useQuery<SmtpSettings | null>({
    queryKey: ["/api/settings/smtp"],
    queryFn: async () => {
      const response = await fetch("/api/settings/smtp");
      if (!response.ok) return null;
      const data = await response.json();
      if (data) {
        setSmtpForm(data);
      }
      return data;
    },
  });

  const { data: emailTypeSettings, isLoading: loadingEmailTypes } = useQuery<EmailTypeSettings | null>({
    queryKey: ["/api/settings/email-types"],
    queryFn: async () => {
      const response = await fetch("/api/settings/email-types");
      if (!response.ok) return null;
      const data = await response.json();
      if (data) {
        setEmailTypes(data);
      }
      return data;
    },
  });

  const { data: templates = [], isLoading: loadingTemplates } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
    queryFn: async () => {
      const response = await fetch("/api/email-templates");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: emailLogs = [], isLoading: loadingLogs } = useQuery<EmailLog[]>({
    queryKey: ["/api/email-logs"],
    queryFn: async () => {
      const response = await fetch("/api/email-logs");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const saveSmtpMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = smtpSettings ? "PATCH" : "POST";
      const response = await fetch("/api/settings/smtp", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save SMTP settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/smtp"] });
      setPassword("");
      toast({ title: "SMTP settings saved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const testSmtpMutation = useMutation({
    mutationFn: async (testEmail: string) => {
      const response = await fetch("/api/settings/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to test SMTP");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/smtp"] });
      if (data.success) {
        toast({ title: "Test email sent successfully" });
      } else {
        toast({ title: "Test failed", description: data.message, variant: "destructive" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const saveEmailTypesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/settings/email-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save email type settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/email-types"] });
      toast({ title: "Email type settings saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = editingTemplate ? "PATCH" : "POST";
      const url = editingTemplate ? `/api/email-templates/${editingTemplate.id}` : "/api/email-templates";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save template");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      setTemplateDialogOpen(false);
      setEditingTemplate(null);
      toast({ title: editingTemplate ? "Template updated" : "Template created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/email-templates/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete template");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Template deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const previewTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/email-templates/${id}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to preview template");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewContent(data);
      setPreviewDialogOpen(true);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveSmtp = () => {
    const data = { ...smtpForm };
    if (password) {
      (data as any).password = password;
    }
    saveSmtpMutation.mutate(data);
  };

  const handleTestSmtp = () => {
    if (!testEmail) {
      toast({ title: "Please enter a test email address", variant: "destructive" });
      return;
    }
    testSmtpMutation.mutate(testEmail);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      notification: "bg-blue-100 text-blue-700",
      transactional: "bg-green-100 text-green-700",
      internal: "bg-purple-100 text-purple-700",
      marketing: "bg-orange-100 text-orange-700",
      reminder: "bg-yellow-100 text-yellow-700",
    };
    return <Badge className={colors[type] || "bg-gray-100 text-gray-700"}>{type}</Badge>;
  };

  return (
    <AdminLayout title="Email Settings" description="Configure SMTP, email templates, and manage outgoing communications">
      <div className="space-y-6">

        <Tabs defaultValue="smtp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="smtp" className="gap-2" data-testid="tab-smtp">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">SMTP</span>
            </TabsTrigger>
            <TabsTrigger value="types" className="gap-2" data-testid="tab-types">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email Types</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2" data-testid="tab-templates">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2" data-testid="tab-logs">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="smtp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
                <CardDescription>Configure your email server settings for sending emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Sending</Label>
                    <p className="text-sm text-muted-foreground">Turn on to enable outgoing emails</p>
                  </div>
                  <Switch
                    checked={smtpForm.isActive}
                    onCheckedChange={(checked) => setSmtpForm({ ...smtpForm, isActive: checked })}
                    data-testid="switch-smtp-active"
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input
                      id="smtp-host"
                      placeholder="smtp.example.com"
                      value={smtpForm.host || ""}
                      onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                      data-testid="input-smtp-host"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      placeholder="587"
                      value={smtpForm.port || ""}
                      onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) || 587 })}
                      data-testid="input-smtp-port"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-encryption">Encryption</Label>
                    <Select
                      value={smtpForm.encryption || "tls"}
                      onValueChange={(value) => setSmtpForm({ ...smtpForm, encryption: value })}
                    >
                      <SelectTrigger data-testid="select-smtp-encryption">
                        <SelectValue placeholder="Select encryption" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="tls">TLS (STARTTLS)</SelectItem>
                        <SelectItem value="ssl">SSL/TLS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">Username</Label>
                    <Input
                      id="smtp-username"
                      placeholder="user@example.com"
                      value={smtpForm.username || ""}
                      onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                      data-testid="input-smtp-username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Password</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    placeholder={smtpSettings?.hasPassword ? "••••••••" : "Enter password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-smtp-password"
                  />
                  {smtpSettings?.hasPassword && (
                    <p className="text-sm text-muted-foreground">Leave empty to keep current password</p>
                  )}
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sender-name">Sender Name</Label>
                    <Input
                      id="sender-name"
                      placeholder="Company Name"
                      value={smtpForm.senderName || ""}
                      onChange={(e) => setSmtpForm({ ...smtpForm, senderName: e.target.value })}
                      data-testid="input-sender-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender-email">Sender Email</Label>
                    <Input
                      id="sender-email"
                      type="email"
                      placeholder="noreply@example.com"
                      value={smtpForm.senderEmail || ""}
                      onChange={(e) => setSmtpForm({ ...smtpForm, senderEmail: e.target.value })}
                      data-testid="input-sender-email"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleSaveSmtp} disabled={saveSmtpMutation.isPending} data-testid="button-save-smtp">
                    {saveSmtpMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Settings
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Test Configuration</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="test@example.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        data-testid="input-test-email"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleTestSmtp}
                      disabled={testSmtpMutation.isPending || !smtpSettings?.isActive}
                      data-testid="button-test-smtp"
                    >
                      {testSmtpMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send Test Email
                    </Button>
                  </div>
                  {smtpSettings?.lastTestResult && (
                    <div className={`p-3 rounded-lg ${smtpSettings.lastTestResult === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      <p className="text-sm">
                        Last test: {smtpSettings.lastTestResult === "success" ? "Successful" : smtpSettings.lastTestResult}
                        {smtpSettings.lastTestAt && ` (${format(new Date(smtpSettings.lastTestAt), "PPp")})`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Type Settings</CardTitle>
                <CardDescription>Enable or disable different categories of emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notification Emails</Label>
                      <p className="text-sm text-muted-foreground">New leads, inquiries, and system alerts</p>
                    </div>
                    <Switch
                      checked={emailTypes.notificationsEnabled}
                      onCheckedChange={(checked) => setEmailTypes({ ...emailTypes, notificationsEnabled: checked })}
                      data-testid="switch-notifications"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Transactional Emails</Label>
                      <p className="text-sm text-muted-foreground">Invoices, receipts, and confirmations</p>
                    </div>
                    <Switch
                      checked={emailTypes.transactionalEnabled}
                      onCheckedChange={(checked) => setEmailTypes({ ...emailTypes, transactionalEnabled: checked })}
                      data-testid="switch-transactional"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Internal Emails</Label>
                      <p className="text-sm text-muted-foreground">Team notifications and internal updates</p>
                    </div>
                    <Switch
                      checked={emailTypes.internalEnabled}
                      onCheckedChange={(checked) => setEmailTypes({ ...emailTypes, internalEnabled: checked })}
                      data-testid="switch-internal"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Promotional content and newsletters</p>
                    </div>
                    <Switch
                      checked={emailTypes.marketingEnabled}
                      onCheckedChange={(checked) => setEmailTypes({ ...emailTypes, marketingEnabled: checked })}
                      data-testid="switch-marketing"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reminder Emails</Label>
                      <p className="text-sm text-muted-foreground">Event reminders and follow-ups</p>
                    </div>
                    <Switch
                      checked={emailTypes.reminderEnabled}
                      onCheckedChange={(checked) => setEmailTypes({ ...emailTypes, reminderEnabled: checked })}
                      data-testid="switch-reminder"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => saveEmailTypesMutation.mutate(emailTypes)}
                  disabled={saveEmailTypesMutation.isPending}
                  data-testid="button-save-email-types"
                >
                  {saveEmailTypesMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Manage email templates with dynamic variables</CardDescription>
                </div>
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingTemplate(null)} data-testid="button-new-template">
                      <Plus className="h-4 w-4 mr-2" />
                      New Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
                      <DialogDescription>
                        Use variables like {"{{recipient_name}}"}, {"{{company_name}}"}, {"{{event_date}}"} in your templates
                      </DialogDescription>
                    </DialogHeader>
                    <TemplateForm
                      template={editingTemplate}
                      onSubmit={(data) => saveTemplateMutation.mutate(data)}
                      isPending={saveTemplateMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No email templates yet</p>
                    <p className="text-sm">Create your first template to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id} data-testid={`row-template-${template.id}`}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell className="font-mono text-sm">{template.templateKey}</TableCell>
                          <TableCell>{getTypeBadge(template.type)}</TableCell>
                          <TableCell>
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => previewTemplateMutation.mutate(template.id)}
                                data-testid={`button-preview-${template.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingTemplate(template);
                                  setTemplateDialogOpen(true);
                                }}
                                data-testid={`button-edit-${template.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this template?")) {
                                    deleteTemplateMutation.mutate(template.id);
                                  }
                                }}
                                data-testid={`button-delete-${template.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Template Preview</DialogTitle>
                  <DialogDescription>Subject: {previewContent?.subject}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] border rounded-lg p-4">
                  <div dangerouslySetInnerHTML={{ __html: previewContent?.html || "" }} />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Logs</CardTitle>
                <CardDescription>View history of sent emails</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : emailLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No email logs yet</p>
                    <p className="text-sm">Sent emails will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailLogs.map((log) => (
                        <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className="capitalize">{log.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{log.recipientName || log.recipientEmail}</p>
                              {log.recipientName && (
                                <p className="text-sm text-muted-foreground">{log.recipientEmail}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{log.subject}</TableCell>
                          <TableCell>{getTypeBadge(log.type)}</TableCell>
                          <TableCell>{format(new Date(log.sentAt), "PP p")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

interface TemplateFormProps {
  template: EmailTemplate | null;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

function TemplateForm({ template, onSubmit, isPending }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: template?.name || "",
    templateKey: template?.templateKey || "",
    subject: template?.subject || "",
    htmlContent: template?.htmlContent || getDefaultHtmlTemplate(),
    textContent: template?.textContent || "",
    type: template?.type || "notification",
    variables: template?.variables || [],
    isActive: template?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Welcome Email"
            required
            data-testid="input-template-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-key">Template Key</Label>
          <Input
            id="template-key"
            value={formData.templateKey}
            onChange={(e) => setFormData({ ...formData, templateKey: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
            placeholder="welcome_email"
            required
            disabled={!!template}
            data-testid="input-template-key"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="template-type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger data-testid="select-template-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="notification">Notification</SelectItem>
              <SelectItem value="transactional">Transactional</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 pt-8">
          <Switch
            id="template-active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            data-testid="switch-template-active"
          />
          <Label htmlFor="template-active">Active</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-subject">Subject Line</Label>
        <Input
          id="template-subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Welcome to {{company_name}}"
          required
          data-testid="input-template-subject"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-html">HTML Content</Label>
        <Textarea
          id="template-html"
          value={formData.htmlContent}
          onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
          placeholder="<html>...</html>"
          className="font-mono text-sm min-h-[300px]"
          required
          data-testid="textarea-template-html"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-text">Plain Text Content (Optional)</Label>
        <Textarea
          id="template-text"
          value={formData.textContent || ""}
          onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
          placeholder="Plain text version of the email..."
          className="min-h-[100px]"
          data-testid="textarea-template-text"
        />
      </div>

      <div className="bg-muted p-3 rounded-lg">
        <p className="text-sm font-medium mb-2">Available Variables</p>
        <div className="flex flex-wrap gap-2">
          {["recipient_name", "recipient_email", "company_name", "company_email", "company_phone", "company_address", "company_website", "event_name", "event_date", "event_location", "amount", "invoice_number", "due_date", "current_year", "current_date"].map((variable) => (
            <Badge key={variable} variant="outline" className="font-mono text-xs">
              {`{{${variable}}}`}
            </Badge>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isPending} data-testid="button-save-template">
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {template ? "Update Template" : "Create Template"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function getDefaultHtmlTemplate(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h1 style="color: #111827; margin-bottom: 16px;">Hello {{recipient_name}},</h1>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Your email content goes here...
    </p>
    
    <p style="color: #4b5563; line-height: 1.6;">
      Best regards,<br>
      <strong>{{company_name}}</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
    <p>{{company_name}} | {{company_address}}</p>
    <p>{{company_email}} | {{company_phone}}</p>
    <p>&copy; {{current_year}} All rights reserved.</p>
  </div>
</body>
</html>`;
}
