import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Edit2, Trash2, Users, Image, Star, Briefcase, Newspaper, 
  FileText, GripVertical, Eye, EyeOff 
} from "lucide-react";
import type { 
  TeamMember, PortfolioItem, Testimonial, Career, PressArticle, PageContent 
} from "@shared/schema";

function TeamMemberForm({ 
  member, 
  onSave, 
  onClose 
}: { 
  member?: TeamMember; 
  onSave: (data: any) => void; 
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: member?.name || "",
    role: member?.role || "",
    bio: member?.bio || "",
    image: member?.image || "",
    email: member?.email || "",
    phone: member?.phone || "",
    linkedin: member?.linkedin || "",
    instagram: member?.instagram || "",
    displayOrder: member?.displayOrder || 0,
    isActive: member?.isActive ?? true,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Name *</Label>
          <Input 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            data-testid="input-member-name"
          />
        </div>
        <div>
          <Label>Role *</Label>
          <Input 
            value={form.role} 
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            data-testid="input-member-role"
          />
        </div>
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea 
          value={form.bio} 
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
          data-testid="input-member-bio"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            data-testid="input-member-email"
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input 
            value={form.phone} 
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            data-testid="input-member-phone"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>LinkedIn URL</Label>
          <Input 
            value={form.linkedin} 
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            data-testid="input-member-linkedin"
          />
        </div>
        <div>
          <Label>Instagram URL</Label>
          <Input 
            value={form.instagram} 
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            data-testid="input-member-instagram"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Image URL</Label>
          <Input 
            value={form.image} 
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            data-testid="input-member-image"
          />
        </div>
        <div>
          <Label>Display Order</Label>
          <Input 
            type="number"
            value={form.displayOrder} 
            onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
            data-testid="input-member-order"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch 
          checked={form.isActive} 
          onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
          data-testid="switch-member-active"
        />
        <Label>Active</Label>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} data-testid="button-cancel">Cancel</Button>
        <Button 
          onClick={() => onSave(form)} 
          disabled={!form.name || !form.role}
          data-testid="button-save-member"
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function PortfolioForm({ 
  item, 
  onSave, 
  onClose 
}: { 
  item?: PortfolioItem; 
  onSave: (data: any) => void; 
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: item?.title || "",
    category: item?.category || "wedding",
    description: item?.description || "",
    location: item?.location || "",
    date: item?.date || "",
    client: item?.client || "",
    featuredImage: item?.featuredImage || "",
    images: item?.images?.join("\n") || "",
    isFeatured: item?.isFeatured ?? false,
    displayOrder: item?.displayOrder || 0,
    isActive: item?.isActive ?? true,
  });

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Title *</Label>
          <Input 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            data-testid="input-portfolio-title"
          />
        </div>
        <div>
          <Label>Category *</Label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3"
            data-testid="select-portfolio-category"
          >
            <option value="wedding">Wedding</option>
            <option value="corporate">Corporate</option>
            <option value="social">Social Event</option>
            <option value="destination">Destination</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea 
          value={form.description} 
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          data-testid="input-portfolio-description"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Location</Label>
          <Input 
            value={form.location} 
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            data-testid="input-portfolio-location"
          />
        </div>
        <div>
          <Label>Date</Label>
          <Input 
            value={form.date} 
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            placeholder="e.g., March 2024"
            data-testid="input-portfolio-date"
          />
        </div>
        <div>
          <Label>Client</Label>
          <Input 
            value={form.client} 
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            data-testid="input-portfolio-client"
          />
        </div>
      </div>
      <div>
        <Label>Featured Image URL</Label>
        <Input 
          value={form.featuredImage} 
          onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
          data-testid="input-portfolio-featured-image"
        />
      </div>
      <div>
        <Label>Gallery Images (one URL per line)</Label>
        <Textarea 
          value={form.images} 
          onChange={(e) => setForm({ ...form, images: e.target.value })}
          rows={4}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          data-testid="input-portfolio-images"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Display Order</Label>
          <Input 
            type="number"
            value={form.displayOrder} 
            onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
            data-testid="input-portfolio-order"
          />
        </div>
        <div className="flex items-center gap-4 pt-6">
          <div className="flex items-center gap-2">
            <Switch 
              checked={form.isFeatured} 
              onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked })}
              data-testid="switch-portfolio-featured"
            />
            <Label>Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={form.isActive} 
              onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              data-testid="switch-portfolio-active"
            />
            <Label>Active</Label>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} data-testid="button-cancel">Cancel</Button>
        <Button 
          onClick={() => onSave({
            ...form,
            images: form.images.split("\n").filter(url => url.trim())
          })} 
          disabled={!form.title || !form.category}
          data-testid="button-save-portfolio"
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function TestimonialForm({ 
  testimonial, 
  onSave, 
  onClose 
}: { 
  testimonial?: Testimonial; 
  onSave: (data: any) => void; 
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    clientName: testimonial?.clientName || "",
    clientRole: testimonial?.clientRole || "",
    eventType: testimonial?.eventType || "",
    content: testimonial?.content || "",
    rating: testimonial?.rating || 5,
    image: testimonial?.image || "",
    videoUrl: testimonial?.videoUrl || "",
    isFeatured: testimonial?.isFeatured ?? false,
    displayOrder: testimonial?.displayOrder || 0,
    isActive: testimonial?.isActive ?? true,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Client Name *</Label>
          <Input 
            value={form.clientName} 
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            data-testid="input-testimonial-name"
          />
        </div>
        <div>
          <Label>Client Role/Title</Label>
          <Input 
            value={form.clientRole} 
            onChange={(e) => setForm({ ...form, clientRole: e.target.value })}
            data-testid="input-testimonial-role"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Event Type</Label>
          <Input 
            value={form.eventType} 
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            placeholder="e.g., Wedding, Corporate"
            data-testid="input-testimonial-event"
          />
        </div>
        <div>
          <Label>Rating (1-5)</Label>
          <Input 
            type="number"
            min={1}
            max={5}
            value={form.rating} 
            onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })}
            data-testid="input-testimonial-rating"
          />
        </div>
      </div>
      <div>
        <Label>Testimonial Content *</Label>
        <Textarea 
          value={form.content} 
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={4}
          data-testid="input-testimonial-content"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Client Image URL</Label>
          <Input 
            value={form.image} 
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            data-testid="input-testimonial-image"
          />
        </div>
        <div>
          <Label>Video URL (YouTube/Vimeo)</Label>
          <Input 
            value={form.videoUrl} 
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            data-testid="input-testimonial-video"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch 
            checked={form.isFeatured} 
            onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked })}
            data-testid="switch-testimonial-featured"
          />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            checked={form.isActive} 
            onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
            data-testid="switch-testimonial-active"
          />
          <Label>Active</Label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} data-testid="button-cancel">Cancel</Button>
        <Button 
          onClick={() => onSave(form)} 
          disabled={!form.clientName || !form.content}
          data-testid="button-save-testimonial"
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function CareerForm({ 
  career, 
  onSave, 
  onClose 
}: { 
  career?: Career; 
  onSave: (data: any) => void; 
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: career?.title || "",
    department: career?.department || "",
    location: career?.location || "",
    type: career?.type || "Full-time",
    experience: career?.experience || "",
    description: career?.description || "",
    requirements: career?.requirements?.join("\n") || "",
    benefits: career?.benefits?.join("\n") || "",
    salary: career?.salary || "",
    applicationEmail: career?.applicationEmail || "",
    isActive: career?.isActive ?? true,
  });

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Job Title *</Label>
          <Input 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            data-testid="input-career-title"
          />
        </div>
        <div>
          <Label>Department *</Label>
          <Input 
            value={form.department} 
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="e.g., Operations, Design"
            data-testid="input-career-department"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Location *</Label>
          <Input 
            value={form.location} 
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            data-testid="input-career-location"
          />
        </div>
        <div>
          <Label>Job Type *</Label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-background px-3"
            data-testid="select-career-type"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
        <div>
          <Label>Experience</Label>
          <Input 
            value={form.experience} 
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
            placeholder="e.g., 2-4 years"
            data-testid="input-career-experience"
          />
        </div>
      </div>
      <div>
        <Label>Job Description *</Label>
        <Textarea 
          value={form.description} 
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          data-testid="input-career-description"
        />
      </div>
      <div>
        <Label>Requirements (one per line)</Label>
        <Textarea 
          value={form.requirements} 
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          rows={4}
          placeholder="Bachelor's degree required&#10;3+ years experience in event planning"
          data-testid="input-career-requirements"
        />
      </div>
      <div>
        <Label>Benefits (one per line)</Label>
        <Textarea 
          value={form.benefits} 
          onChange={(e) => setForm({ ...form, benefits: e.target.value })}
          rows={3}
          placeholder="Health insurance&#10;Flexible work hours"
          data-testid="input-career-benefits"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Salary Range</Label>
          <Input 
            value={form.salary} 
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            placeholder="e.g., ₹5-8 LPA"
            data-testid="input-career-salary"
          />
        </div>
        <div>
          <Label>Application Email</Label>
          <Input 
            value={form.applicationEmail} 
            onChange={(e) => setForm({ ...form, applicationEmail: e.target.value })}
            placeholder="careers@dacreation.in"
            data-testid="input-career-email"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch 
          checked={form.isActive} 
          onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
          data-testid="switch-career-active"
        />
        <Label>Active</Label>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} data-testid="button-cancel">Cancel</Button>
        <Button 
          onClick={() => onSave({
            ...form,
            requirements: form.requirements.split("\n").filter(r => r.trim()),
            benefits: form.benefits.split("\n").filter(b => b.trim())
          })} 
          disabled={!form.title || !form.department || !form.location || !form.description}
          data-testid="button-save-career"
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function PressForm({ 
  article, 
  onSave, 
  onClose 
}: { 
  article?: PressArticle; 
  onSave: (data: any) => void; 
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: article?.title || "",
    publication: article?.publication || "",
    publishedDate: article?.publishedDate || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    externalUrl: article?.externalUrl || "",
    image: article?.image || "",
    isFeatured: article?.isFeatured ?? false,
    displayOrder: article?.displayOrder || 0,
    isActive: article?.isActive ?? true,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Article Title *</Label>
          <Input 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            data-testid="input-press-title"
          />
        </div>
        <div>
          <Label>Publication *</Label>
          <Input 
            value={form.publication} 
            onChange={(e) => setForm({ ...form, publication: e.target.value })}
            placeholder="e.g., Times of India"
            data-testid="input-press-publication"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Published Date</Label>
          <Input 
            value={form.publishedDate} 
            onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
            placeholder="e.g., March 15, 2024"
            data-testid="input-press-date"
          />
        </div>
        <div>
          <Label>External URL</Label>
          <Input 
            value={form.externalUrl} 
            onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
            data-testid="input-press-url"
          />
        </div>
      </div>
      <div>
        <Label>Excerpt</Label>
        <Textarea 
          value={form.excerpt} 
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          rows={2}
          data-testid="input-press-excerpt"
        />
      </div>
      <div>
        <Label>Full Content (optional)</Label>
        <Textarea 
          value={form.content} 
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={4}
          data-testid="input-press-content"
        />
      </div>
      <div>
        <Label>Image URL</Label>
        <Input 
          value={form.image} 
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          data-testid="input-press-image"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch 
            checked={form.isFeatured} 
            onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked })}
            data-testid="switch-press-featured"
          />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            checked={form.isActive} 
            onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
            data-testid="switch-press-active"
          />
          <Label>Active</Label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} data-testid="button-cancel">Cancel</Button>
        <Button 
          onClick={() => onSave(form)} 
          disabled={!form.title || !form.publication}
          data-testid="button-save-press"
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function CMSSection<T extends { id: string; isActive: boolean }>({
  title,
  icon: Icon,
  items,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  renderItem,
}: {
  title: string;
  icon: any;
  items?: T[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[#601a29]" />
          {title}
        </CardTitle>
        <Button onClick={onAdd} size="sm" className="bg-[#601a29] hover:bg-[#4a1320]" data-testid={`button-add-${title.toLowerCase()}`}>
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 rounded-lg border ${item.isActive ? 'bg-white' : 'bg-gray-50 opacity-70'}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  {renderItem(item)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleActive(item.id, !item.isActive)}
                    data-testid={`button-toggle-${item.id}`}
                  >
                    {item.isActive ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    data-testid={`button-edit-${item.id}`}
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Icon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No {title.toLowerCase()} found.</p>
            <p className="text-sm">Click "Add New" to create one.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CMSPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("team");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);

  const { data: teamMembers, isLoading: loadingTeam } = useQuery<TeamMember[]>({
    queryKey: ["/api/cms/team"],
  });

  const { data: portfolioItems, isLoading: loadingPortfolio } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/cms/portfolio"],
  });

  const { data: testimonials, isLoading: loadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/cms/testimonials"],
  });

  const { data: careers, isLoading: loadingCareers } = useQuery<Career[]>({
    queryKey: ["/api/cms/careers"],
  });

  const { data: pressArticles, isLoading: loadingPress } = useQuery<PressArticle[]>({
    queryKey: ["/api/cms/press"],
  });

  const createMutation = (endpoint: string, queryKey: string) => useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({ title: "Created successfully" });
      setShowDialog(false);
      setEditingItem(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create. Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = (endpoint: string, queryKey: string) => useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({ title: "Updated successfully" });
      setShowDialog(false);
      setEditingItem(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update. Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = (endpoint: string, queryKey: string) => useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({ title: "Deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete. Please try again.", variant: "destructive" });
    },
  });

  const teamCreate = createMutation("/api/cms/team", "/api/cms/team");
  const teamUpdate = updateMutation("/api/cms/team", "/api/cms/team");
  const teamDelete = deleteMutation("/api/cms/team", "/api/cms/team");

  const portfolioCreate = createMutation("/api/cms/portfolio", "/api/cms/portfolio");
  const portfolioUpdate = updateMutation("/api/cms/portfolio", "/api/cms/portfolio");
  const portfolioDelete = deleteMutation("/api/cms/portfolio", "/api/cms/portfolio");

  const testimonialCreate = createMutation("/api/cms/testimonials", "/api/cms/testimonials");
  const testimonialUpdate = updateMutation("/api/cms/testimonials", "/api/cms/testimonials");
  const testimonialDelete = deleteMutation("/api/cms/testimonials", "/api/cms/testimonials");

  const careerCreate = createMutation("/api/cms/careers", "/api/cms/careers");
  const careerUpdate = updateMutation("/api/cms/careers", "/api/cms/careers");
  const careerDelete = deleteMutation("/api/cms/careers", "/api/cms/careers");

  const pressCreate = createMutation("/api/cms/press", "/api/cms/press");
  const pressUpdate = updateMutation("/api/cms/press", "/api/cms/press");
  const pressDelete = deleteMutation("/api/cms/press", "/api/cms/press");

  const handleSave = (type: string, data: any) => {
    if (editingItem?.id) {
      switch (type) {
        case "team": teamUpdate.mutate({ id: editingItem.id, data }); break;
        case "portfolio": portfolioUpdate.mutate({ id: editingItem.id, data }); break;
        case "testimonial": testimonialUpdate.mutate({ id: editingItem.id, data }); break;
        case "career": careerUpdate.mutate({ id: editingItem.id, data }); break;
        case "press": pressUpdate.mutate({ id: editingItem.id, data }); break;
      }
    } else {
      switch (type) {
        case "team": teamCreate.mutate(data); break;
        case "portfolio": portfolioCreate.mutate(data); break;
        case "testimonial": testimonialCreate.mutate(data); break;
        case "career": careerCreate.mutate(data); break;
        case "press": pressCreate.mutate(data); break;
      }
    }
  };

  const handleDelete = (type: string, id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      switch (type) {
        case "team": teamDelete.mutate(id); break;
        case "portfolio": portfolioDelete.mutate(id); break;
        case "testimonial": testimonialDelete.mutate(id); break;
        case "career": careerDelete.mutate(id); break;
        case "press": pressDelete.mutate(id); break;
      }
    }
  };

  const handleToggleActive = (type: string, id: string, active: boolean) => {
    switch (type) {
      case "team": teamUpdate.mutate({ id, data: { isActive: active } }); break;
      case "portfolio": portfolioUpdate.mutate({ id, data: { isActive: active } }); break;
      case "testimonial": testimonialUpdate.mutate({ id, data: { isActive: active } }); break;
      case "career": careerUpdate.mutate({ id, data: { isActive: active } }); break;
      case "press": pressUpdate.mutate({ id, data: { isActive: active } }); break;
    }
  };

  return (
    <AdminLayout title="Content Management" description="Manage your website content">
      <div className="p-6">

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="team" className="gap-2" data-testid="tab-team">
              <Users className="w-4 h-4" /> Team
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2" data-testid="tab-portfolio">
              <Image className="w-4 h-4" /> Portfolio
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2" data-testid="tab-testimonials">
              <Star className="w-4 h-4" /> Testimonials
            </TabsTrigger>
            <TabsTrigger value="careers" className="gap-2" data-testid="tab-careers">
              <Briefcase className="w-4 h-4" /> Careers
            </TabsTrigger>
            <TabsTrigger value="press" className="gap-2" data-testid="tab-press">
              <Newspaper className="w-4 h-4" /> Press
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <CMSSection
              title="Team Members"
              icon={Users}
              items={teamMembers}
              isLoading={loadingTeam}
              onAdd={() => { setEditingItem({}); setShowDialog(true); setActiveTab("team"); }}
              onEdit={(item) => { setEditingItem(item); setShowDialog(true); }}
              onDelete={(id) => handleDelete("team", id)}
              onToggleActive={(id, active) => handleToggleActive("team", id, active)}
              renderItem={(item: TeamMember) => (
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="portfolio">
            <CMSSection
              title="Portfolio Items"
              icon={Image}
              items={portfolioItems}
              isLoading={loadingPortfolio}
              onAdd={() => { setEditingItem({}); setShowDialog(true); setActiveTab("portfolio"); }}
              onEdit={(item) => { setEditingItem(item); setShowDialog(true); }}
              onDelete={(id) => handleDelete("portfolio", id)}
              onToggleActive={(id, active) => handleToggleActive("portfolio", id, active)}
              renderItem={(item: PortfolioItem) => (
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.category} {item.location && `• ${item.location}`}</p>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="testimonials">
            <CMSSection
              title="Testimonials"
              icon={Star}
              items={testimonials}
              isLoading={loadingTestimonials}
              onAdd={() => { setEditingItem({}); setShowDialog(true); setActiveTab("testimonials"); }}
              onEdit={(item) => { setEditingItem(item); setShowDialog(true); }}
              onDelete={(id) => handleDelete("testimonial", id)}
              onToggleActive={(id, active) => handleToggleActive("testimonial", id, active)}
              renderItem={(item: Testimonial) => (
                <div>
                  <p className="font-medium">{item.clientName}</p>
                  <p className="text-sm text-gray-500">{item.eventType} • {"★".repeat(item.rating)}</p>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="careers">
            <CMSSection
              title="Job Openings"
              icon={Briefcase}
              items={careers}
              isLoading={loadingCareers}
              onAdd={() => { setEditingItem({}); setShowDialog(true); setActiveTab("careers"); }}
              onEdit={(item) => { setEditingItem(item); setShowDialog(true); }}
              onDelete={(id) => handleDelete("career", id)}
              onToggleActive={(id, active) => handleToggleActive("career", id, active)}
              renderItem={(item: Career) => (
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.department} • {item.location} • {item.type}</p>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="press">
            <CMSSection
              title="Press Articles"
              icon={Newspaper}
              items={pressArticles}
              isLoading={loadingPress}
              onAdd={() => { setEditingItem({}); setShowDialog(true); setActiveTab("press"); }}
              onEdit={(item) => { setEditingItem(item); setShowDialog(true); }}
              onDelete={(id) => handleDelete("press", id)}
              onToggleActive={(id, active) => handleToggleActive("press", id, active)}
              renderItem={(item: PressArticle) => (
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.publication} {item.publishedDate && `• ${item.publishedDate}`}</p>
                </div>
              )}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) setEditingItem(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? "Edit" : "Add New"}{" "}
              {activeTab === "team" ? "Team Member" : 
               activeTab === "portfolio" ? "Portfolio Item" : 
               activeTab === "testimonials" ? "Testimonial" : 
               activeTab === "careers" ? "Career" : "Press Article"}
            </DialogTitle>
          </DialogHeader>
          
          {activeTab === "team" && (
            <TeamMemberForm 
              member={editingItem?.id ? editingItem : undefined}
              onSave={(data) => handleSave("team", data)}
              onClose={() => { setShowDialog(false); setEditingItem(null); }}
            />
          )}
          {activeTab === "portfolio" && (
            <PortfolioForm 
              item={editingItem?.id ? editingItem : undefined}
              onSave={(data) => handleSave("portfolio", data)}
              onClose={() => { setShowDialog(false); setEditingItem(null); }}
            />
          )}
          {activeTab === "testimonials" && (
            <TestimonialForm 
              testimonial={editingItem?.id ? editingItem : undefined}
              onSave={(data) => handleSave("testimonial", data)}
              onClose={() => { setShowDialog(false); setEditingItem(null); }}
            />
          )}
          {activeTab === "careers" && (
            <CareerForm 
              career={editingItem?.id ? editingItem : undefined}
              onSave={(data) => handleSave("career", data)}
              onClose={() => { setShowDialog(false); setEditingItem(null); }}
            />
          )}
          {activeTab === "press" && (
            <PressForm 
              article={editingItem?.id ? editingItem : undefined}
              onSave={(data) => handleSave("press", data)}
              onClose={() => { setShowDialog(false); setEditingItem(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
