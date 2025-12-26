import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2,
  MoreHorizontal,
  Camera,
  MapPin,
  Calendar,
  User,
  Star,
  Search,
  Image,
  Eye,
  EyeOff,
  Film,
  Upload,
  X,
  ChevronUp,
  ChevronDown,
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

type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  location: string | null;
  date: string | null;
  client: string | null;
  images: string[] | null;
  featuredImage: string | null;
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PortfolioVideo = {
  id: string;
  portfolioItemId: string;
  title: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  duration?: number;
  thumbnail?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate" },
  { value: "social", label: "Social Event" },
  { value: "destination", label: "Destination" },
];

const CATEGORY_COLORS: Record<string, string> = {
  wedding: "bg-pink-500",
  corporate: "bg-blue-500",
  social: "bg-purple-500",
  destination: "bg-teal-500",
};

export default function AdminPortfolioPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<PortfolioItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Video management state
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<PortfolioVideo | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<PortfolioVideo | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDisplayOrder, setVideoDisplayOrder] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "wedding",
    description: "",
    location: "",
    date: "",
    client: "",
    featuredImage: "",
    images: "",
    isFeatured: false,
    displayOrder: 0,
    isActive: true,
  });

  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ["/api/cms/portfolio"],
    queryFn: async () => {
      const response = await fetch("/api/cms/portfolio");
      if (!response.ok) throw new Error("Failed to fetch portfolio items");
      return response.json() as Promise<PortfolioItem[]>;
    },
  });

  const { data: portfolioVideos = [] } = useQuery({
    queryKey: ["/api/cms/portfolio", selectedPortfolioId, "videos"],
    queryFn: async () => {
      if (!selectedPortfolioId) return [];
      const response = await fetch(`/api/cms/portfolio/${selectedPortfolioId}/videos`);
      if (!response.ok) throw new Error("Failed to fetch videos");
      const data = await response.json();
      return data.videos || [];
    },
    enabled: !!selectedPortfolioId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        images: data.images ? data.images.split("\n").filter(Boolean) : [],
      };
      const response = await fetch("/api/cms/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create portfolio item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/portfolio"] });
      setShowAddDialog(false);
      resetForm();
      toast({ title: "Success", description: "Portfolio item created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.images !== undefined) {
        payload.images = typeof data.images === "string" 
          ? data.images.split("\n").filter(Boolean) 
          : (Array.isArray(data.images) ? data.images : []);
      }
      const response = await fetch(`/api/cms/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update portfolio item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/portfolio"] });
      setEditingItem(null);
      resetForm();
      toast({ title: "Success", description: "Portfolio item updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cms/portfolio/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete portfolio item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/portfolio"] });
      setDeleteItem(null);
      toast({ title: "Success", description: "Portfolio item deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Video mutations
  const uploadVideoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/cms/portfolio/${selectedPortfolioId}/videos`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload video");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/portfolio", selectedPortfolioId, "videos"] });
      resetVideoForm();
      setShowVideoDialog(false);
      toast({ title: "Success", description: "Video uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ videoId, data }: { videoId: string; data: Partial<PortfolioVideo> }) => {
      const response = await fetch(`/api/cms/portfolio/${selectedPortfolioId}/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/portfolio", selectedPortfolioId, "videos"] });
      setEditingVideo(null);
      resetVideoForm();
      toast({ title: "Success", description: "Video updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const response = await fetch(`/api/cms/portfolio/${selectedPortfolioId}/videos/${videoId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/portfolio", selectedPortfolioId, "videos"] });
      setDeleteVideo(null);
      toast({ title: "Success", description: "Video deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reorderVideosMutation = useMutation({
    mutationFn: async (videoIds: string[]) => {
      const response = await fetch(`/api/cms/portfolio/${selectedPortfolioId}/videos/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds }),
      });
      if (!response.ok) throw new Error("Failed to reorder videos");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/portfolio", selectedPortfolioId, "videos"] });
      toast({ title: "Success", description: "Videos reordered" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "wedding",
      description: "",
      location: "",
      date: "",
      client: "",
      featuredImage: "",
      images: "",
      isFeatured: false,
      displayOrder: 0,
      isActive: true,
    });
  };

  const resetVideoForm = () => {
    setVideoTitle("");
    setVideoDisplayOrder(0);
    setVideoUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!selectedPortfolioId) {
      toast({ title: "Error", description: "No portfolio selected", variant: "destructive" });
      return;
    }
    if (!videoTitle.trim()) {
      toast({ title: "Error", description: "Video title is required", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", videoTitle);
    formData.append("displayOrder", videoDisplayOrder.toString());
    uploadVideoMutation.mutate(formData);
  };

  const handleEditVideo = (video: PortfolioVideo) => {
    setEditingVideo(video);
    setVideoTitle(video.title);
    setVideoDisplayOrder(video.displayOrder);
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description || "",
      location: item.location || "",
      date: item.date || "",
      client: item.client || "",
      featuredImage: item.featuredImage || "",
      images: item.images?.join("\n") || "",
      isFeatured: item.isFeatured,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleActive = (item: PortfolioItem) => {
    updateMutation.mutate({ id: item.id, data: { isActive: !item.isActive } });
  };

  const toggleFeatured = (item: PortfolioItem) => {
    updateMutation.mutate({ id: item.id, data: { isFeatured: !item.isFeatured } });
  };

  const filteredItems = portfolioItems?.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const stats = {
    total: portfolioItems?.length || 0,
    active: portfolioItems?.filter(i => i.isActive).length || 0,
    featured: portfolioItems?.filter(i => i.isFeatured).length || 0,
    byCategory: portfolioItems?.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    const newVideos = [...portfolioVideos];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newVideos.length) return;
    
    const [movedVideo] = newVideos.splice(index, 1);
    newVideos.splice(newIndex, 0, movedVideo);
    
    reorderVideosMutation.mutate(newVideos.map(v => v.id));
  };

  return (
    <AdminLayout title="Portfolio" description="Manage your portfolio items">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Portfolio Items</h2>
            <p className="text-sm text-muted-foreground">
              Manage and showcase your event portfolio
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-portfolio">
            <Plus className="w-4 h-4 mr-2" />
            Add Portfolio Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-stat-total">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-active">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-featured">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Featured</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hidden</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.total - stats.active}</p>
                </div>
                <EyeOff className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search portfolio items..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]" data-testid="select-category-filter">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8">Loading portfolio items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No portfolio items found</p>
                <p className="text-sm">Add your first portfolio item to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} data-testid={`row-portfolio-${item.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {item.featuredImage ? (
                              <img 
                                src={item.featuredImage} 
                                alt={item.title} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Camera className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            {item.client && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {item.client}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={CATEGORY_COLORS[item.category] || "bg-gray-500"}>
                          {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.location ? (
                          <span className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {item.date ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={item.isActive} 
                          onCheckedChange={() => toggleActive(item)}
                          data-testid={`switch-active-${item.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={item.isFeatured} 
                          onCheckedChange={() => toggleFeatured(item)}
                          data-testid={`switch-featured-${item.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${item.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(item)} data-testid={`menu-edit-${item.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleFeatured(item)}
                              data-testid={`menu-feature-${item.id}`}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              {item.isFeatured ? "Unfeature" : "Feature"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleActive(item)}
                              data-testid={`menu-toggle-active-${item.id}`}
                            >
                              {item.isActive ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Show
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => { setSelectedPortfolioId(item.id); setShowVideoDialog(true); }}
                              data-testid={`menu-manage-videos-${item.id}`}
                            >
                              <Film className="w-4 h-4 mr-2" />
                              Manage Videos
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteItem(item)}
                              data-testid={`menu-delete-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog || !!editingItem} onOpenChange={() => { setShowAddDialog(false); setEditingItem(null); resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Portfolio Item" : "Add Portfolio Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update portfolio item details" : "Add a new item to showcase in your portfolio"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Royal Udaipur Wedding"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                data-testid="input-title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value !== "all").map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client Name</Label>
                <Input
                  id="client"
                  placeholder="The Sharma Family"
                  value={formData.client}
                  onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                  data-testid="input-client"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Udaipur, Rajasthan"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  data-testid="input-location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Event Date</Label>
                <Input
                  id="date"
                  placeholder="December 2024"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  data-testid="input-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A grand palace wedding with traditional Rajasthani elements and modern luxury..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image URL</Label>
              <Input
                id="featuredImage"
                placeholder="https://example.com/image.jpg"
                value={formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                data-testid="input-featured-image"
              />
              {formData.featuredImage && (
                <div className="mt-2 rounded-lg overflow-hidden border max-w-xs">
                  <img 
                    src={formData.featuredImage} 
                    alt="Preview" 
                    className="w-full h-32 object-cover"
                    onError={(e) => (e.currentTarget.src = "")}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Gallery Image URLs (one per line)</Label>
              <Textarea
                id="images"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                rows={3}
                value={formData.images}
                onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
                data-testid="input-images"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  placeholder="0"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                  data-testid="input-display-order"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <Label className="font-medium">Featured</Label>
                <p className="text-sm text-muted-foreground">Display this item prominently</p>
              </div>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                data-testid="switch-is-featured"
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <Label className="font-medium">Active</Label>
                <p className="text-sm text-muted-foreground">Show this item on the website</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                data-testid="switch-is-active"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingItem(null); resetForm(); }} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.category || createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit"
            >
              {createMutation.isPending || updateMutation.isPending 
                ? "Saving..." 
                : editingItem ? "Update Item" : "Add Item"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video Management Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={() => { setShowVideoDialog(false); setSelectedPortfolioId(null); resetVideoForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Portfolio Videos</DialogTitle>
            <DialogDescription>
              {portfolioItems?.find(i => i.id === selectedPortfolioId)?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Upload Section */}
            <Card data-testid="card-video-upload">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Upload New Video</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="video-title">Video Title *</Label>
                    <Input
                      id="video-title"
                      placeholder="e.g., Ceremony Highlights"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      data-testid="input-video-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-file">Video File (MP4, WebM, MOV, AVI - Max 500MB) *</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="drop-zone-video"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                        onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                        className="hidden"
                        data-testid="input-video-file"
                      />
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground">MP4, WebM, MOV, AVI up to 500MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-order">Display Order</Label>
                    <Input
                      id="video-order"
                      type="number"
                      value={videoDisplayOrder}
                      onChange={(e) => setVideoDisplayOrder(parseInt(e.target.value) || 0)}
                      data-testid="input-video-order"
                    />
                  </div>

                  {uploadVideoMutation.isPending && (
                    <div className="space-y-2">
                      <p className="text-sm">Uploading... {videoUploadProgress}%</p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Videos List */}
            <div className="space-y-3">
              <h3 className="font-medium">Videos ({portfolioVideos.length})</h3>
              {portfolioVideos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No videos uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {portfolioVideos.map((video: PortfolioVideo, index: number) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`card-video-${video.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{video.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {(video.fileSize / (1024 * 1024)).toFixed(2)} MB • Order: {video.displayOrder}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 mr-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={index === 0 || reorderVideosMutation.isPending}
                            onClick={() => moveVideo(index, 'up')}
                            title="Move Up"
                          >
                            <ChevronUp className="h-4 w-4" />
                            <span className="sr-only">Move Up</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={index === portfolioVideos.length - 1 || reorderVideosMutation.isPending}
                            onClick={() => moveVideo(index, 'down')}
                            title="Move Down"
                          >
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Move Down</span>
                          </Button>
                        </div>
                        <Switch
                          checked={video.isActive}
                          onCheckedChange={(checked) =>
                            updateVideoMutation.mutate({ videoId: video.id, data: { isActive: checked } })
                          }
                          data-testid={`switch-video-active-${video.id}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVideo(video)}
                          data-testid={`button-edit-video-${video.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteVideo(video)}
                          data-testid={`button-delete-video-${video.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowVideoDialog(false); setSelectedPortfolioId(null); resetVideoForm(); }}
              data-testid="button-close-video-dialog"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={() => { setEditingVideo(null); resetVideoForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-video-title">Title</Label>
              <Input
                id="edit-video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                data-testid="input-edit-video-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-video-order">Display Order</Label>
              <Input
                id="edit-video-order"
                type="number"
                value={videoDisplayOrder}
                onChange={(e) => setVideoDisplayOrder(parseInt(e.target.value) || 0)}
                data-testid="input-edit-video-order"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingVideo(null); resetVideoForm(); }} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button
              onClick={() =>
                editingVideo &&
                updateVideoMutation.mutate({
                  videoId: editingVideo.id,
                  data: { title: videoTitle, displayOrder: videoDisplayOrder },
                })
              }
              disabled={!videoTitle.trim()}
              data-testid="button-save-video"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Video Confirmation */}
      <AlertDialog open={!!deleteVideo} onOpenChange={() => setDeleteVideo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteVideo?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-video">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteVideo && deleteVideoMutation.mutate(deleteVideo.id)}
              data-testid="button-confirm-delete-video"
            >
              {deleteVideoMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
