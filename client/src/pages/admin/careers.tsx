import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Edit2, Trash2, Briefcase, MapPin, Clock, DollarSign,
  Search, Eye, EyeOff, ExternalLink, Mail, Building, Users,
  CheckCircle, XCircle, Filter, MoreHorizontal, FileText
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Career } from "@shared/schema";

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const departments = [
  "Event Operations",
  "Design & Decor",
  "Marketing",
  "Sales",
  "Finance",
  "Human Resources",
  "Technology",
  "Client Relations",
  "Vendor Management",
  "Creative",
  "Other"
];

interface CareerStats {
  total: number;
  active: number;
  inactive: number;
  byDepartment: Record<string, number>;
  byType: Record<string, number>;
  byLocation: Record<string, number>;
}

function calculateStats(careers: Career[]): CareerStats {
  const stats: CareerStats = {
    total: careers.length,
    active: careers.filter(c => c.isActive).length,
    inactive: careers.filter(c => !c.isActive).length,
    byDepartment: {},
    byType: {},
    byLocation: {},
  };

  careers.forEach(career => {
    stats.byDepartment[career.department] = (stats.byDepartment[career.department] || 0) + 1;
    stats.byType[career.type] = (stats.byType[career.type] || 0) + 1;
    if (career.location) {
      stats.byLocation[career.location] = (stats.byLocation[career.location] || 0) + 1;
    }
  });

  return stats;
}

function CareerForm({ 
  career, 
  onSave, 
  onClose,
  isSubmitting 
}: { 
  career?: Career; 
  onSave: (data: any) => void; 
  onClose: () => void;
  isSubmitting: boolean;
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
    applicationEmail: career?.applicationEmail || "careers@dacreation.in",
    isActive: career?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Job title is required";
    if (!form.department.trim()) newErrors.department = "Department is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.description.trim()) newErrors.description = "Job description is required";
    if (form.applicationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicationEmail)) {
      newErrors.applicationEmail = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave({
        ...form,
        requirements: form.requirements.split("\n").filter(r => r.trim()),
        benefits: form.benefits.split("\n").filter(b => b.trim())
      });
    }
  };

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Basic Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
            <Input 
              id="title"
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Senior Event Manager"
              className={errors.title ? "border-red-500" : ""}
              data-testid="input-career-title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
            <Select 
              value={form.department} 
              onValueChange={(value) => setForm({ ...form, department: value })}
            >
              <SelectTrigger className={errors.department ? "border-red-500" : ""} data-testid="select-career-department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
          </div>
          <div>
            <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
            <Input 
              id="location"
              value={form.location} 
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., Mumbai, Delhi NCR"
              className={errors.location ? "border-red-500" : ""}
              data-testid="input-career-location"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>
          <div>
            <Label htmlFor="type">Job Type <span className="text-red-500">*</span></Label>
            <Select 
              value={form.type} 
              onValueChange={(value) => setForm({ ...form, type: value })}
            >
              <SelectTrigger data-testid="select-career-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="experience">Experience Required</Label>
            <Input 
              id="experience"
              value={form.experience} 
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              placeholder="e.g., 2-4 years, 5+ years"
              data-testid="input-career-experience"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Job Details
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
            <Textarea 
              id="description"
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe the role, responsibilities, and what makes this position exciting..."
              className={errors.description ? "border-red-500" : ""}
              data-testid="input-career-description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          <div>
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea 
              id="requirements"
              value={form.requirements} 
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              rows={4}
              placeholder="Bachelor's degree in relevant field&#10;3+ years experience in event planning&#10;Strong communication skills&#10;Ability to work under pressure"
              data-testid="input-career-requirements"
            />
            <p className="text-gray-500 text-xs mt-1">Enter each requirement on a new line</p>
          </div>
          <div>
            <Label htmlFor="benefits">Benefits & Perks (one per line)</Label>
            <Textarea 
              id="benefits"
              value={form.benefits} 
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              rows={3}
              placeholder="Competitive salary package&#10;Health insurance for family&#10;Flexible work hours&#10;Learning & development allowance"
              data-testid="input-career-benefits"
            />
            <p className="text-gray-500 text-xs mt-1">Enter each benefit on a new line</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Compensation & Contact
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary">Salary Range</Label>
            <Input 
              id="salary"
              value={form.salary} 
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              placeholder="e.g., ₹8-12 LPA, Competitive"
              data-testid="input-career-salary"
            />
          </div>
          <div>
            <Label htmlFor="applicationEmail">Application Email</Label>
            <Input 
              id="applicationEmail"
              type="email"
              value={form.applicationEmail} 
              onChange={(e) => setForm({ ...form, applicationEmail: e.target.value })}
              placeholder="careers@yourcompany.com"
              className={errors.applicationEmail ? "border-red-500" : ""}
              data-testid="input-career-email"
            />
            {errors.applicationEmail && <p className="text-red-500 text-sm mt-1">{errors.applicationEmail}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-3">
          <Switch 
            id="isActive"
            checked={form.isActive} 
            onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
            data-testid="switch-career-active"
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            <span className="font-medium">Publish Position</span>
            <p className="text-sm text-gray-500">
              {form.isActive ? "This position will be visible on the careers page" : "This position is saved as draft"}
            </p>
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting} data-testid="button-cancel">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="bg-[#601a29] hover:bg-[#4a1320]"
          data-testid="button-save-career"
        >
          {isSubmitting ? "Saving..." : career?.id ? "Update Position" : "Create Position"}
        </Button>
      </div>
    </div>
  );
}

function CareerDetailsDialog({
  career,
  open,
  onClose
}: {
  career: Career | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!career) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{career.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {career.department} • {career.location}
              </DialogDescription>
            </div>
            <Badge variant={career.isActive ? "default" : "secondary"}>
              {career.isActive ? "Active" : "Draft"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="gap-1">
              <Briefcase className="w-3 h-3" />
              {career.type}
            </Badge>
            {career.experience && (
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {career.experience}
              </Badge>
            )}
            {career.salary && (
              <Badge variant="outline" className="gap-1 text-green-700 border-green-200 bg-green-50">
                <DollarSign className="w-3 h-3" />
                {career.salary}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" />
              {career.location}
            </Badge>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
            <p className="text-gray-600 whitespace-pre-line">{career.description}</p>
          </div>

          {career.requirements && career.requirements.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
              <ul className="space-y-2">
                {career.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#601a29] mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {career.benefits && career.benefits.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Benefits & Perks</h4>
              <ul className="space-y-2">
                {career.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {career.applicationEmail && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Application Contact
              </h4>
              <a 
                href={`mailto:${career.applicationEmail}`}
                className="text-[#601a29] hover:underline"
              >
                {career.applicationEmail}
              </a>
            </div>
          )}

          <div className="text-sm text-gray-500 pt-4 border-t">
            <p>Created: {new Date(career.createdAt).toLocaleDateString('en-IN', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })}</p>
            <p>Last Updated: {new Date(career.updatedAt).toLocaleDateString('en-IN', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCareersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [viewingCareer, setViewingCareer] = useState<Career | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Career | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: careers = [], isLoading } = useQuery<Career[]>({
    queryKey: ["/api/cms/careers"],
  });

  const stats = calculateStats(careers);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/cms/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create career");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/careers"] });
      toast({ title: "Success", description: "Job position created successfully!" });
      setShowForm(false);
      setEditingCareer(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/cms/careers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update career");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/careers"] });
      toast({ title: "Success", description: "Job position updated successfully!" });
      setShowForm(false);
      setEditingCareer(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/careers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete career");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/careers"] });
      toast({ title: "Success", description: "Job position deleted successfully!" });
      setDeleteConfirm(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete the position. Please try again.", variant: "destructive" });
    },
  });

  const handleSave = (data: any) => {
    if (editingCareer?.id) {
      updateMutation.mutate({ id: editingCareer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleToggleStatus = (career: Career) => {
    updateMutation.mutate({ 
      id: career.id, 
      data: { isActive: !career.isActive } 
    });
  };

  const filteredCareers = careers.filter(career => {
    const matchesSearch = !searchQuery || 
      career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || career.department === filterDepartment;
    const matchesType = filterType === "all" || career.type === filterType;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && career.isActive) || 
      (filterStatus === "inactive" && !career.isActive);

    return matchesSearch && matchesDepartment && matchesType && matchesStatus;
  });

  const uniqueDepartments = Array.from(new Set(careers.map(c => c.department))).sort();
  const uniqueTypes = Array.from(new Set(careers.map(c => c.type))).sort();

  return (
    <AdminLayout 
      title="Career Positions" 
      description="Manage job openings and career opportunities"
    >
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Positions</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-[#601a29]/10 rounded-full flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-[#601a29]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Listings</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Draft Positions</p>
                  <p className="text-3xl font-bold text-gray-500">{stats.inactive}</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <EyeOff className="h-6 w-6 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Departments Hiring</p>
                  <p className="text-3xl font-bold text-[#601a29]">{Object.keys(stats.byDepartment).length}</p>
                </div>
                <div className="h-12 w-12 bg-[#601a29]/10 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-[#601a29]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#601a29]" />
                  Job Positions
                </CardTitle>
                <CardDescription>
                  {filteredCareers.length} position{filteredCareers.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Button 
                onClick={() => { setEditingCareer(null); setShowForm(true); }}
                className="bg-[#601a29] hover:bg-[#4a1320]"
                data-testid="button-add-position"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Position
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search positions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-careers"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-[180px]" data-testid="filter-department">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px]" data-testid="filter-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredCareers.length > 0 ? (
              <div className="space-y-4">
                {filteredCareers.map((career) => (
                  <div 
                    key={career.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      career.isActive 
                        ? 'bg-white border-gray-200' 
                        : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                    data-testid={`career-card-${career.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{career.title}</h3>
                          <Badge 
                            variant={career.isActive ? "default" : "secondary"}
                            className={career.isActive ? "bg-green-100 text-green-700" : ""}
                          >
                            {career.isActive ? "Active" : "Draft"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4 text-gray-400" />
                            {career.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {career.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            {career.type}
                          </span>
                          {career.experience && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {career.experience}
                            </span>
                          )}
                          {career.salary && (
                            <span className="flex items-center gap-1 text-green-700 font-medium">
                              <DollarSign className="w-4 h-4" />
                              {career.salary}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {career.description}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`menu-career-${career.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => setViewingCareer(career)}
                            data-testid={`view-career-${career.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => { setEditingCareer(career); setShowForm(true); }}
                            data-testid={`edit-career-${career.id}`}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Position
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(career)}
                            data-testid={`toggle-career-${career.id}`}
                          >
                            {career.isActive ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          {career.applicationEmail && (
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${career.applicationEmail}`}>
                                <Mail className="w-4 h-4 mr-2" />
                                Email Applications
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteConfirm(career)}
                            className="text-red-600 focus:text-red-600"
                            data-testid={`delete-career-${career.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Position
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No positions found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || filterDepartment !== "all" || filterType !== "all" || filterStatus !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "Start by adding your first job opening"}
                </p>
                {!searchQuery && filterDepartment === "all" && filterType === "all" && filterStatus === "all" && (
                  <Button 
                    onClick={() => { setEditingCareer(null); setShowForm(true); }}
                    className="bg-[#601a29] hover:bg-[#4a1320]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Position
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {Object.keys(stats.byDepartment).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Positions by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byDepartment)
                    .sort((a, b) => b[1] - a[1])
                    .map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between">
                        <span className="text-gray-600">{dept}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Positions by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byLocation)
                    .sort((a, b) => b[1] - a[1])
                    .map(([location, count]) => (
                      <div key={location} className="flex items-center justify-between">
                        <span className="text-gray-600">{location}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { 
        setShowForm(open); 
        if (!open) setEditingCareer(null); 
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCareer?.id ? "Edit Job Position" : "Create New Position"}
            </DialogTitle>
            <DialogDescription>
              {editingCareer?.id 
                ? "Update the details for this job position" 
                : "Fill in the details to create a new job opening"}
            </DialogDescription>
          </DialogHeader>
          <CareerForm 
            career={editingCareer || undefined}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingCareer(null); }}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <CareerDetailsDialog 
        career={viewingCareer}
        open={!!viewingCareer}
        onClose={() => setViewingCareer(null)}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the position "{deleteConfirm?.title}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
