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
  Plus, Edit2, Trash2, Search, Eye, EyeOff, ExternalLink,
  FileText, Calendar, User, Tag, Image, MoreHorizontal,
  BookOpen, TrendingUp, Star, Clock, CheckCircle, Filter
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BlogPost } from "@shared/schema";
import { format } from "date-fns";

const categories = [
  { value: "weddings", label: "Weddings" },
  { value: "corporate", label: "Corporate Events" },
  { value: "destination", label: "Destination Events" },
  { value: "planning", label: "Event Planning Tips" },
  { value: "trends", label: "Industry Trends" },
  { value: "decor", label: "Decor & Design" },
  { value: "vendors", label: "Vendor Spotlights" },
  { value: "real-events", label: "Real Events" },
];

const statuses = [
  { value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-800" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-800" },
];

interface BlogStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  featured: number;
}

function calculateStats(posts: BlogPost[]): BlogStats {
  return {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    archived: posts.filter(p => p.status === 'archived').length,
    totalViews: posts.reduce((sum, p) => sum + (p.viewCount || 0), 0),
    featured: posts.filter(p => p.isFeatured).length,
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function BlogForm({ 
  post, 
  onSave, 
  onClose,
  isSubmitting 
}: { 
  post?: BlogPost; 
  onSave: (data: any) => void; 
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featuredImage: post?.featuredImage || "",
    author: post?.author || "",
    category: post?.category || "",
    tags: post?.tags?.join(", ") || "",
    status: post?.status || "draft",
    isFeatured: post?.isFeatured || false,
    metaTitle: post?.metaTitle || "",
    metaDescription: post?.metaDescription || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(!post);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.slug.trim()) newErrors.slug = "URL slug is required";
    if (!form.content.trim()) newErrors.content = "Content is required";
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTitleChange = (title: string) => {
    setForm({ 
      ...form, 
      title,
      slug: autoSlug ? generateSlug(title) : form.slug
    });
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave({
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(t => t),
        publishedAt: form.status === 'published' && !post?.publishedAt ? new Date().toISOString() : post?.publishedAt,
      });
    }
  };

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Basic Information
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input 
              id="title"
              value={form.title} 
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter blog post title"
              className={errors.title ? "border-red-500" : ""}
              data-testid="input-blog-title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">URL Slug <span className="text-red-500">*</span></Label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input 
                  type="checkbox" 
                  checked={autoSlug} 
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="rounded"
                />
                Auto-generate from title
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/blog/</span>
              <Input 
                id="slug"
                value={form.slug} 
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                placeholder="url-friendly-slug"
                className={errors.slug ? "border-red-500" : ""}
                disabled={autoSlug}
                data-testid="input-blog-slug"
              />
            </div>
            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea 
              id="excerpt"
              value={form.excerpt} 
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief summary of the blog post (displayed in listings)"
              rows={2}
              data-testid="input-blog-excerpt"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Content
        </h4>
        <div>
          <Label htmlFor="content">Blog Content <span className="text-red-500">*</span></Label>
          <Textarea 
            id="content"
            value={form.content} 
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your blog post content here. Use ## for headings, **text** for bold, *text* for italic."
            rows={12}
            className={errors.content ? "border-red-500" : ""}
            data-testid="input-blog-content"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supports basic Markdown: ## Heading, **bold**, *italic*
          </p>
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Media & Metadata
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="featuredImage">Featured Image URL</Label>
            <Input 
              id="featuredImage"
              value={form.featuredImage} 
              onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              data-testid="input-blog-image"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a URL for the featured image, or upload to your hosting and paste the URL here
            </p>
          </div>
          <div>
            <Label htmlFor="author">Author</Label>
            <Input 
              id="author"
              value={form.author} 
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Author name"
              data-testid="input-blog-author"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={form.category} 
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger data-testid="select-blog-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <Input 
              id="tags"
              value={form.tags} 
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="wedding, luxury, destination (comma-separated)"
              data-testid="input-blog-tags"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          SEO Settings
        </h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input 
              id="metaTitle"
              value={form.metaTitle} 
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
              placeholder="SEO title (defaults to post title)"
              data-testid="input-blog-meta-title"
            />
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea 
              id="metaDescription"
              value={form.metaDescription} 
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              placeholder="SEO description (defaults to excerpt)"
              rows={2}
              data-testid="input-blog-meta-description"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Publishing
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={form.status} 
              onValueChange={(value) => setForm({ ...form, status: value })}
            >
              <SelectTrigger data-testid="select-blog-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between pt-6">
            <Label htmlFor="featured" className="cursor-pointer">Feature this post</Label>
            <Switch 
              id="featured"
              checked={form.isFeatured}
              onCheckedChange={(checked) => setForm({ ...form, isFeatured: checked })}
              data-testid="switch-blog-featured"
            />
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 sticky bottom-0 bg-white pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="button-save-blog">
          {isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | undefined>();
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/cms/blog", { status: statusFilter, category: categoryFilter, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchQuery) params.append("search", searchQuery);
      const res = await fetch(`/api/cms/blog?${params}`);
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/cms/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create blog post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] });
      toast({ title: "Success", description: "Blog post created successfully" });
      setIsDialogOpen(false);
      setSelectedPost(undefined);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/cms/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update blog post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] });
      toast({ title: "Success", description: "Blog post updated successfully" });
      setIsDialogOpen(false);
      setSelectedPost(undefined);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete blog post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/blog"] });
      toast({ title: "Success", description: "Blog post deleted successfully" });
      setPostToDelete(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = (data: any) => {
    if (selectedPost) {
      updateMutation.mutate({ id: selectedPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedPost(undefined);
    setIsDialogOpen(true);
  };

  const stats = calculateStats(posts);
  const filteredPosts = posts;

  const getStatusBadge = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color || 'bg-gray-100 text-gray-800'} border-0`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  return (
    <AdminLayout title="Blog Management" description="Create and manage blog posts for your website">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-muted-foreground">Create and manage blog posts for your website</p>
          </div>
          <Button onClick={handleCreate} className="gap-2" data-testid="button-create-blog">
            <Plus className="w-4 h-4" /> New Blog Post
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All blog posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <p className="text-xs text-muted-foreground">Live on website</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time views</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <CardTitle>All Blog Posts</CardTitle>
                <CardDescription>Manage your blog content</CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                    data-testid="input-search-blog"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="filter-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-muted-foreground mb-4">Create your first blog post to get started</p>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="w-4 h-4" /> Create Blog Post
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Post</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Views</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="border-b hover:bg-muted/50 transition-colors" data-testid={`row-blog-${post.id}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {post.featuredImage ? (
                              <img 
                                src={post.featuredImage} 
                                alt={post.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                {post.title}
                                {post.isFeatured && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">/blog/{post.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {post.category ? (
                            <Badge variant="outline" className="capitalize">{post.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(post.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            {post.viewCount || 0}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {post.publishedAt 
                            ? format(new Date(post.publishedAt), 'MMM dd, yyyy')
                            : format(new Date(post.createdAt), 'MMM dd, yyyy')
                          }
                        </td>
                        <td className="py-4 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`menu-blog-${post.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(post)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              {post.status === 'published' && (
                                <DropdownMenuItem asChild>
                                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" /> View Post
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setPostToDelete(post)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedPost ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
            <DialogDescription>
              {selectedPost ? "Update your blog post content and settings" : "Fill in the details to create a new blog post"}
            </DialogDescription>
          </DialogHeader>
          <BlogForm 
            post={selectedPost}
            onSave={handleSave}
            onClose={() => setIsDialogOpen(false)}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => postToDelete && deleteMutation.mutate(postToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
