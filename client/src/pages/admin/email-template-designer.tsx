import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/layout";
import { EmailTemplateDesigner } from "@/components/admin/email-template-designer";
import { prebuiltTemplates } from "@/components/admin/email-template-designer/prebuilt-templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  templateKey: string;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  designerData: string | null;
  type: string;
  variables: string[];
  isActive: boolean;
}

export default function EmailTemplateDesignerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedPrebuilt, setSelectedPrebuilt] = useState<typeof prebuiltTemplates[0] | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');

  const { data: existingTemplate, isLoading } = useQuery<EmailTemplate | null>({
    queryKey: ["/api/email-templates", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const response = await fetch(`/api/email-templates/${templateId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!templateId,
  });

  const isEditMode = !!templateId;
  const isDataReady = !isEditMode || (isEditMode && !!existingTemplate);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = isEditMode ? "PATCH" : "POST";
      const url = isEditMode 
        ? `/api/email-templates/${templateId}` 
        : "/api/email-templates";
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
      toast({ title: "Template saved successfully!" });
      navigate("/admin/email-settings");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading || !isDataReady) {
    return (
      <AdminLayout title="Email Template Designer" description="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!showDesigner && !isEditMode) {
    return (
      <AdminLayout title="Email Template Designer" description="Create professional email templates with our visual designer">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/admin/email-settings")} data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Email Settings
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Start with a Template
                </CardTitle>
                <CardDescription>Choose from our professionally designed templates or start from scratch</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all" data-testid="tab-all-templates">All</TabsTrigger>
                    <TabsTrigger value="notification" data-testid="tab-notification-templates">Notification</TabsTrigger>
                    <TabsTrigger value="transactional" data-testid="tab-transactional-templates">Transactional</TabsTrigger>
                    <TabsTrigger value="internal" data-testid="tab-internal-templates">Internal</TabsTrigger>
                    <TabsTrigger value="marketing" data-testid="tab-marketing-templates">Marketing</TabsTrigger>
                    <TabsTrigger value="reminder" data-testid="tab-reminder-templates">Reminder</TabsTrigger>
                  </TabsList>

                  {["all", "notification", "transactional", "internal", "marketing", "reminder"].map((category) => (
                    <TabsContent key={category} value={category} className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <Card
                          className="cursor-pointer border-dashed hover:border-primary transition-colors"
                          onClick={() => {
                            setShowDesigner(true);
                            setSelectedPrebuilt(null);
                          }}
                          data-testid="card-blank-template"
                        >
                          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="font-medium">Blank Template</p>
                            <p className="text-sm text-muted-foreground">Start from scratch</p>
                          </CardContent>
                        </Card>

                        {prebuiltTemplates
                          .filter((t) => category === "all" || t.category === category)
                          .map((template) => (
                            <Card
                              key={template.id}
                              className="cursor-pointer hover:border-primary transition-colors"
                              onClick={() => {
                                setSelectedPrebuilt(template);
                                setShowDesigner(true);
                              }}
                              data-testid={`card-template-${template.id}`}
                            >
                              <CardContent className="flex flex-col h-48 p-4">
                                <div
                                  className="flex-1 rounded-lg mb-3 flex items-center justify-center"
                                  style={{ backgroundColor: template.globalStyles.primaryColor + "20" }}
                                >
                                  <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl"
                                    style={{ backgroundColor: template.globalStyles.primaryColor }}
                                  >
                                    {template.name[0]}
                                  </div>
                                </div>
                                <p className="font-medium text-sm">{template.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                                <Badge variant="outline" className="mt-2 w-fit text-xs">
                                  {template.category}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const getInitialTemplate = () => {
    if (selectedPrebuilt) {
      return {
        name: selectedPrebuilt.name,
        templateKey: selectedPrebuilt.id,
        subject: `{{company_name_text}} - ${selectedPrebuilt.name}`,
        htmlContent: "",
        textContent: null,
        type: selectedPrebuilt.category,
        variables: [],
        isActive: true,
        blocks: selectedPrebuilt.blocks,
        globalStyles: selectedPrebuilt.globalStyles,
      };
    }
    
    if (existingTemplate) {
      let blocks = undefined;
      let globalStyles = undefined;
      
      if (existingTemplate.designerData) {
        try {
          const parsed = JSON.parse(existingTemplate.designerData);
          blocks = parsed.blocks;
          globalStyles = parsed.globalStyles;
        } catch {
        }
      }
      
      return {
        ...existingTemplate,
        blocks,
        globalStyles,
      };
    }
    
    return null;
  };

  const initialTemplate = getInitialTemplate();

  return (
    <AdminLayout title="Email Template Designer" description="Design your email template">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              if (isEditMode) {
                navigate("/admin/email-settings");
              } else {
                setShowDesigner(false);
                setSelectedPrebuilt(null);
              }
            }} 
            data-testid="button-back-to-templates"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isEditMode ? "Back to Settings" : "Choose Template"}
          </Button>
        </div>

        <EmailTemplateDesigner
          initialTemplate={initialTemplate as any}
          onSave={(data) => saveMutation.mutate(data)}
          isPending={saveMutation.isPending}
          isEditing={isEditMode}
        />
      </div>
    </AdminLayout>
  );
}
