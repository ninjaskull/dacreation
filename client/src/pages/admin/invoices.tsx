import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  Copy,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react";
import type { Invoice, Client, InvoiceItem, InvoiceTemplate, Event, CompanySettings } from "@shared/schema";

interface InvoiceWithDetails extends Invoice {
  client?: { id: string; name: string; email: string } | null;
  event?: { id: string; name: string } | null;
  template?: { id: string; name: string; layout: string } | null;
  items?: InvoiceItem[];
}

interface InvoiceStats {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

interface InvoiceFormData {
  clientId: string | null;
  eventId: string | null;
  templateId: string | null;
  title: string;
  description: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientGst: string;
  notes: string;
  termsAndConditions: string;
  discountType: string;
  discountValue: number;
  taxType: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
}

interface LineItem {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  taxable: boolean;
  hsnCode: string;
  sacCode: string;
  amount: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-purple-100 text-purple-700",
  paid: "bg-green-100 text-green-700",
  partially_paid: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
  refunded: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  paid: "Paid",
  partially_paid: "Partially Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function InvoicesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceWithDetails | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: null,
    eventId: null,
    templateId: null,
    title: "",
    description: "",
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    clientGst: "",
    notes: "",
    termsAndConditions: "",
    discountType: "percentage",
    discountValue: 0,
    taxType: "gst",
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { name: "", description: "", quantity: 1, unit: "unit", unitPrice: 0, discount: 0, taxable: true, hsnCode: "", sacCode: "", amount: 0 },
  ]);

  const { data: invoices = [], isLoading: loadingInvoices, refetch } = useQuery<InvoiceWithDetails[]>({
    queryKey: ["/api/invoices", statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/invoices?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
  });

  const { data: stats } = useQuery<InvoiceStats>({
    queryKey: ["/api/invoices/stats"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: templates = [] } = useQuery<InvoiceTemplate[]>({
    queryKey: ["/api/invoice-templates"],
  });

  const { data: companySettings } = useQuery<CompanySettings>({
    queryKey: ["/api/company-settings"],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/invoices", data);
      return res.json();
    },
    onSuccess: (invoice) => {
      toast({ title: "Invoice created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      return invoice;
    },
    onError: () => {
      toast({ title: "Failed to create invoice", variant: "destructive" });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/invoices/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Invoice updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setShowCreateDialog(false);
      setEditingInvoice(null);
    },
    onError: () => {
      toast({ title: "Failed to update invoice", variant: "destructive" });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Invoice deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: () => {
      toast({ title: "Failed to delete invoice", variant: "destructive" });
    },
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/invoices/${id}/send`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Invoice sent successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    },
    onError: () => {
      toast({ title: "Failed to send invoice", variant: "destructive" });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async ({ invoiceId, data }: { invoiceId: string; data: any }) => {
      const res = await apiRequest("POST", `/api/invoices/${invoiceId}/items`, data);
      return res.json();
    },
  });

  const deleteItemsMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const items = await fetch(`/api/invoices/${invoiceId}/items`, { credentials: "include" }).then(r => r.json());
      for (const item of items) {
        await apiRequest("DELETE", `/api/invoice-items/${item.id}`);
      }
    },
  });

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData({
        ...formData,
        clientId,
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        clientAddress: client.address || "",
      });
    }
  };

  const handleEventSelect = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setFormData({
        ...formData,
        eventId,
        title: formData.title || `Invoice for ${event.name}`,
      });
      if (event.clientId) {
        handleClientSelect(event.clientId);
      }
    }
  };

  const calculateLineItemAmount = (item: LineItem): number => {
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = Math.round((baseAmount * item.discount) / 100);
    return Math.round(baseAmount - discountAmount);
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], ...updates };
    newItems[index].amount = calculateLineItemAmount(newItems[index]);
    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { name: "", description: "", quantity: 1, unit: "unit", unitPrice: 0, discount: 0, taxable: true, hsnCode: "", sacCode: "", amount: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = (items: LineItem[] = lineItems) => {
    const subtotal = Math.round(items.reduce((sum, item) => sum + item.amount, 0));
    const taxableAmount = items.filter(item => item.taxable).reduce((sum, item) => sum + item.amount, 0);
    
    let discountAmount = 0;
    if (formData.discountType === "percentage") {
      discountAmount = Math.round((subtotal * formData.discountValue) / 100);
    } else {
      discountAmount = Math.round(formData.discountValue);
    }
    
    const afterDiscount = subtotal - discountAmount;
    
    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
    if (formData.taxType === "gst") {
      cgstAmount = Math.round((taxableAmount * formData.cgstRate) / 100);
      sgstAmount = Math.round((taxableAmount * formData.sgstRate) / 100);
    } else if (formData.taxType === "igst") {
      igstAmount = Math.round((taxableAmount * formData.igstRate) / 100);
    }
    
    const totalTax = Math.round(cgstAmount + sgstAmount + igstAmount);
    const totalAmount = Math.round(afterDiscount + totalTax);
    
    return { subtotal, discountAmount, cgstAmount, sgstAmount, igstAmount, totalTax, totalAmount };
  };

  const handleSaveInvoice = async () => {
    const validItems = lineItems.filter(item => item.name.trim() !== "");
    if (validItems.length === 0) {
      toast({ title: "Please add at least one line item", variant: "destructive" });
      return;
    }
    
    const totals = calculateTotals(validItems);
    
    const invoiceData = {
      ...formData,
      invoiceNumber: "",
      subtotal: totals.subtotal,
      discountValue: Math.round(formData.discountValue),
      discountAmount: totals.discountAmount,
      cgstRate: Math.round(formData.cgstRate),
      sgstRate: Math.round(formData.sgstRate),
      igstRate: Math.round(formData.igstRate),
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      totalTax: totals.totalTax,
      totalAmount: totals.totalAmount,
      balanceDue: totals.totalAmount,
      status: "draft",
    };

    try {
      let invoiceId: string;
      
      if (editingInvoice) {
        invoiceId = editingInvoice.id;
        try {
          await deleteItemsMutation.mutateAsync(editingInvoice.id);
        } catch (err) {
          console.error("Error deleting items:", err);
          toast({ title: "Failed to update invoice items", variant: "destructive" });
          return;
        }
        await updateInvoiceMutation.mutateAsync({ id: editingInvoice.id, data: invoiceData });
      } else {
        const numberRes = await fetch("/api/invoices/generate-number", { credentials: "include" });
        if (!numberRes.ok) {
          throw new Error("Failed to generate invoice number");
        }
        const { invoiceNumber } = await numberRes.json();
        invoiceData.invoiceNumber = invoiceNumber;
        
        const invoice = await createInvoiceMutation.mutateAsync(invoiceData);
        invoiceId = invoice.id;
      }
      
      let itemErrors = 0;
      for (const item of validItems) {
        try {
          const itemData = {
            ...item,
            quantity: Math.round(item.quantity),
            unitPrice: Math.round(item.unitPrice),
            discount: Math.round(item.discount),
            amount: Math.round(item.amount),
          };
          await createItemMutation.mutateAsync({ invoiceId, data: itemData });
        } catch (err) {
          console.error("Error creating item:", err);
          itemErrors++;
        }
      }
      
      if (itemErrors > 0) {
        toast({ 
          title: `Invoice saved with ${itemErrors} item(s) failed`, 
          description: "Some line items could not be saved",
          variant: "destructive" 
        });
      } else {
        toast({ title: editingInvoice ? "Invoice updated successfully" : "Invoice created successfully" });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error("Save invoice error:", error);
      toast({ title: "Failed to save invoice", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: null,
      eventId: null,
      templateId: null,
      title: "",
      description: "",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      clientGst: "",
      notes: "",
      termsAndConditions: "",
      discountType: "percentage",
      discountValue: 0,
      taxType: "gst",
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 18,
    });
    setLineItems([
      { name: "", description: "", quantity: 1, unit: "unit", unitPrice: 0, discount: 0, taxable: true, hsnCode: "", sacCode: "", amount: 0 },
    ]);
    setEditingInvoice(null);
    setClientMode("existing");
    setActiveTab("details");
  };

  const handleEditInvoice = async (invoice: InvoiceWithDetails) => {
    const itemsRes = await fetch(`/api/invoices/${invoice.id}/items`, { credentials: "include" });
    const items = await itemsRes.json();
    
    setFormData({
      clientId: invoice.clientId,
      eventId: invoice.eventId,
      templateId: invoice.templateId,
      title: invoice.title,
      description: invoice.description || "",
      issueDate: format(new Date(invoice.issueDate), "yyyy-MM-dd"),
      dueDate: format(new Date(invoice.dueDate), "yyyy-MM-dd"),
      clientName: invoice.clientName || "",
      clientEmail: invoice.clientEmail || "",
      clientPhone: invoice.clientPhone || "",
      clientAddress: invoice.clientAddress || "",
      clientGst: invoice.clientGst || "",
      notes: invoice.notes || "",
      termsAndConditions: invoice.termsAndConditions || "",
      discountType: invoice.discountType || "percentage",
      discountValue: invoice.discountValue || 0,
      taxType: invoice.taxType || "gst",
      cgstRate: invoice.cgstRate || 9,
      sgstRate: invoice.sgstRate || 9,
      igstRate: invoice.igstRate || 18,
    });
    
    if (items.length > 0) {
      setLineItems(items.map((item: InvoiceItem) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        quantity: item.quantity,
        unit: item.unit || "unit",
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        taxable: item.taxable,
        hsnCode: item.hsnCode || "",
        sacCode: item.sacCode || "",
        amount: item.amount,
      })));
    }
    
    setClientMode(invoice.clientId ? "existing" : "new");
    setEditingInvoice(invoice);
    setShowCreateDialog(true);
  };

  const handlePreviewInvoice = async (invoice: InvoiceWithDetails) => {
    const itemsRes = await fetch(`/api/invoices/${invoice.id}/items`, { credentials: "include" });
    const items = await itemsRes.json();
    setPreviewInvoice({ ...invoice, items });
    setShowPreviewDialog(true);
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to generate PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Failed to download PDF", variant: "destructive" });
    }
  };

  const handleSendEmail = async (invoice: InvoiceWithDetails) => {
    if (!invoice.clientEmail) {
      toast({ title: "No client email address", variant: "destructive" });
      return;
    }
    sendInvoiceMutation.mutate(invoice.id);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.title.toLowerCase().includes(query) ||
        invoice.clientName?.toLowerCase().includes(query) ||
        invoice.client?.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totals = calculateTotals();

  return (
    <AdminLayout title="Invoice Generator" description="Create and manage professional invoices">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">Invoice Generator</h1>
            <p className="text-sm text-slate-500 mt-1">Create and manage professional invoices</p>
          </div>
          <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} data-testid="button-create-invoice">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Invoices</p>
                  <p className="text-xl font-bold" data-testid="text-total-invoices">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pending</p>
                  <p className="text-xl font-bold" data-testid="text-pending-amount">{formatCurrency(stats?.pendingAmount || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Paid</p>
                  <p className="text-xl font-bold" data-testid="text-paid-amount">{formatCurrency(stats?.paidAmount || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Overdue</p>
                  <p className="text-xl font-bold" data-testid="text-overdue-count">{stats?.overdue || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Invoices</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                    data-testid="input-search-invoices"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingInvoices ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No invoices found</h3>
                <p className="text-sm text-slate-500 mb-4">Create your first invoice to get started</p>
                <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.client?.name || invoice.clientName || "-"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{invoice.title}</TableCell>
                      <TableCell>{format(new Date(invoice.issueDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status]}>
                          {statusLabels[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${invoice.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreviewInvoice(invoice)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSendEmail(invoice)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send via Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
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

      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowCreateDialog(open); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingInvoice ? "update" : "create"} an invoice
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="items">Line Items</TabsTrigger>
              <TabsTrigger value="taxes">Taxes & Discounts</TabsTrigger>
              <TabsTrigger value="notes">Notes & Terms</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(90vh-220px)] mt-4">
              <TabsContent value="details" className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Event (Optional)</Label>
                      <Select value={formData.eventId || ""} onValueChange={handleEventSelect}>
                        <SelectTrigger data-testid="select-event">
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Invoice Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Invoice for Wedding Event"
                        data-testid="input-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the invoice"
                        data-testid="input-description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Issue Date *</Label>
                        <Input
                          type="date"
                          value={formData.issueDate}
                          onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                          data-testid="input-issue-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date *</Label>
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          data-testid="input-due-date"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Invoice Template</Label>
                      <Select value={formData.templateId || ""} onValueChange={(v) => setFormData({ ...formData, templateId: v })}>
                        <SelectTrigger data-testid="select-template">
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} {template.isDefault && "(Default)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-base font-medium">Client Information</Label>
                      <div className="flex border rounded-md">
                        <Button
                          type="button"
                          variant={clientMode === "existing" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setClientMode("existing")}
                          className="rounded-r-none"
                        >
                          Existing Client
                        </Button>
                        <Button
                          type="button"
                          variant={clientMode === "new" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setClientMode("new")}
                          className="rounded-l-none"
                        >
                          New Client
                        </Button>
                      </div>
                    </div>

                    {clientMode === "existing" ? (
                      <div className="space-y-2">
                        <Label>Select Client</Label>
                        <Select value={formData.clientId || ""} onValueChange={handleClientSelect}>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name} - {client.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label>Client Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          placeholder="Client name"
                          className="pl-9"
                          data-testid="input-client-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="email"
                          value={formData.clientEmail}
                          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                          placeholder="client@example.com"
                          className="pl-9"
                          data-testid="input-client-email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={formData.clientPhone}
                          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          className="pl-9"
                          data-testid="input-client-phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Textarea
                          value={formData.clientAddress}
                          onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                          placeholder="Full billing address"
                          className="pl-9 min-h-[80px]"
                          data-testid="input-client-address"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>GST Number</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={formData.clientGst}
                          onChange={(e) => setFormData({ ...formData, clientGst: e.target.value })}
                          placeholder="GSTIN"
                          className="pl-9"
                          data-testid="input-client-gst"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4 pr-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Line Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem} data-testid="button-add-item">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="w-[250px]">Item</TableHead>
                          <TableHead className="w-[80px]">Qty</TableHead>
                          <TableHead className="w-[80px]">Unit</TableHead>
                          <TableHead className="w-[120px]">Rate</TableHead>
                          <TableHead className="w-[80px]">Disc %</TableHead>
                          <TableHead className="w-[100px]">HSN/SAC</TableHead>
                          <TableHead className="w-[120px] text-right">Amount</TableHead>
                          <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                value={item.name}
                                onChange={(e) => updateLineItem(index, { name: e.target.value })}
                                placeholder="Item name"
                                className="text-sm"
                                data-testid={`input-item-name-${index}`}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, { quantity: parseInt(e.target.value) || 1 })}
                                className="text-sm text-center"
                                min={1}
                                data-testid={`input-item-qty-${index}`}
                              />
                            </TableCell>
                            <TableCell>
                              <Select value={item.unit} onValueChange={(v) => updateLineItem(index, { unit: v })}>
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unit">Unit</SelectItem>
                                  <SelectItem value="hour">Hour</SelectItem>
                                  <SelectItem value="day">Day</SelectItem>
                                  <SelectItem value="piece">Piece</SelectItem>
                                  <SelectItem value="service">Service</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateLineItem(index, { unitPrice: parseInt(e.target.value) || 0 })}
                                className="text-sm"
                                min={0}
                                data-testid={`input-item-rate-${index}`}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.discount}
                                onChange={(e) => updateLineItem(index, { discount: parseInt(e.target.value) || 0 })}
                                className="text-sm text-center"
                                min={0}
                                max={100}
                                data-testid={`input-item-discount-${index}`}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.hsnCode || item.sacCode}
                                onChange={(e) => updateLineItem(index, { hsnCode: e.target.value, sacCode: e.target.value })}
                                placeholder="Code"
                                className="text-sm"
                                data-testid={`input-item-hsn-${index}`}
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLineItem(index)}
                                disabled={lineItems.length === 1}
                                data-testid={`button-remove-item-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-end">
                    <div className="w-64 space-y-2 bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                      </div>
                      {totals.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(totals.discountAmount)}</span>
                        </div>
                      )}
                      {formData.taxType === "gst" && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>CGST ({formData.cgstRate}%):</span>
                            <span>{formatCurrency(totals.cgstAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>SGST ({formData.sgstRate}%):</span>
                            <span>{formatCurrency(totals.sgstAmount)}</span>
                          </div>
                        </>
                      )}
                      {formData.taxType === "igst" && (
                        <div className="flex justify-between text-sm">
                          <span>IGST ({formData.igstRate}%):</span>
                          <span>{formatCurrency(totals.igstAmount)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(totals.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="taxes" className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Discount</Label>
                      <div className="flex gap-2">
                        <Select value={formData.discountType} onValueChange={(v) => setFormData({ ...formData, discountType: v })}>
                          <SelectTrigger className="w-40" data-testid="select-discount-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="flex-1"
                          min={0}
                          data-testid="input-discount-value"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Tax Type</Label>
                      <Select value={formData.taxType} onValueChange={(v) => setFormData({ ...formData, taxType: v })}>
                        <SelectTrigger data-testid="select-tax-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gst">GST (CGST + SGST)</SelectItem>
                          <SelectItem value="igst">IGST</SelectItem>
                          <SelectItem value="none">No Tax</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.taxType === "gst" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>CGST Rate (%)</Label>
                          <Input
                            type="number"
                            value={formData.cgstRate}
                            onChange={(e) => setFormData({ ...formData, cgstRate: parseInt(e.target.value) || 0 })}
                            min={0}
                            max={50}
                            data-testid="input-cgst-rate"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>SGST Rate (%)</Label>
                          <Input
                            type="number"
                            value={formData.sgstRate}
                            onChange={(e) => setFormData({ ...formData, sgstRate: parseInt(e.target.value) || 0 })}
                            min={0}
                            max={50}
                            data-testid="input-sgst-rate"
                          />
                        </div>
                      </div>
                    )}

                    {formData.taxType === "igst" && (
                      <div className="space-y-2">
                        <Label>IGST Rate (%)</Label>
                        <Input
                          type="number"
                          value={formData.igstRate}
                          onChange={(e) => setFormData({ ...formData, igstRate: parseInt(e.target.value) || 0 })}
                          min={0}
                          max={50}
                          data-testid="input-igst-rate"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Notes (Visible to client)</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes or payment instructions..."
                      className="min-h-[150px]"
                      data-testid="input-notes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Terms & Conditions</Label>
                    <Textarea
                      value={formData.termsAndConditions}
                      onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                      placeholder="Payment terms, cancellation policy, etc..."
                      className="min-h-[150px]"
                      data-testid="input-terms"
                    />
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveInvoice}
              disabled={!formData.title || !formData.clientName || createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
              data-testid="button-save-invoice"
            >
              {(createInvoiceMutation.isPending || updateInvoiceMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingInvoice ? "Update Invoice" : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          
          {previewInvoice && (
            <ScrollArea className="h-[calc(90vh-150px)]">
              <div className="bg-white p-8 rounded-lg border">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    {companySettings?.logo && (
                      <img src={companySettings.logo} alt="Company Logo" className="h-16 mb-4 object-contain" />
                    )}
                    <h2 className="text-2xl font-bold text-slate-900">{companySettings?.name || "Company Name"}</h2>
                    <p className="text-sm text-slate-600">{companySettings?.address}</p>
                    <p className="text-sm text-slate-600">{companySettings?.phone}</p>
                    <p className="text-sm text-slate-600">{companySettings?.email}</p>
                    {companySettings?.taxId && (
                      <p className="text-sm text-slate-600">GSTIN: {companySettings.taxId}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <h1 className="text-3xl font-bold text-primary mb-2">INVOICE</h1>
                    <p className="text-lg font-medium">{previewInvoice.invoiceNumber}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Issue Date: {format(new Date(previewInvoice.issueDate), "dd MMM yyyy")}
                    </p>
                    <p className="text-sm text-slate-500">
                      Due Date: {format(new Date(previewInvoice.dueDate), "dd MMM yyyy")}
                    </p>
                    <Badge className={`mt-2 ${statusColors[previewInvoice.status]}`}>
                      {statusLabels[previewInvoice.status]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-700 mb-2">Bill To:</h3>
                    <p className="font-medium">{previewInvoice.clientName}</p>
                    <p className="text-sm text-slate-600">{previewInvoice.clientEmail}</p>
                    <p className="text-sm text-slate-600">{previewInvoice.clientPhone}</p>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{previewInvoice.clientAddress}</p>
                    {previewInvoice.clientGst && (
                      <p className="text-sm text-slate-600 mt-1">GSTIN: {previewInvoice.clientGst}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-700 mb-2">Invoice Details:</h3>
                    <p className="font-medium">{previewInvoice.title}</p>
                    {previewInvoice.description && (
                      <p className="text-sm text-slate-600 mt-1">{previewInvoice.description}</p>
                    )}
                    {previewInvoice.event && (
                      <p className="text-sm text-slate-600 mt-1">Event: {previewInvoice.event.name}</p>
                    )}
                  </div>
                </div>

                <Table className="mb-6">
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewInvoice.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-slate-500">{item.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end mb-8">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(previewInvoice.subtotal)}</span>
                    </div>
                    {previewInvoice.discountAmount && previewInvoice.discountAmount > 0 && (
                      <div className="flex justify-between py-2 border-b text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(previewInvoice.discountAmount)}</span>
                      </div>
                    )}
                    {previewInvoice.cgstAmount && previewInvoice.cgstAmount > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span>CGST ({previewInvoice.cgstRate}%):</span>
                        <span>{formatCurrency(previewInvoice.cgstAmount)}</span>
                      </div>
                    )}
                    {previewInvoice.sgstAmount && previewInvoice.sgstAmount > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span>SGST ({previewInvoice.sgstRate}%):</span>
                        <span>{formatCurrency(previewInvoice.sgstAmount)}</span>
                      </div>
                    )}
                    {previewInvoice.igstAmount && previewInvoice.igstAmount > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span>IGST ({previewInvoice.igstRate}%):</span>
                        <span>{formatCurrency(previewInvoice.igstAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 bg-slate-100 px-3 rounded font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(previewInvoice.totalAmount)}</span>
                    </div>
                    {previewInvoice.paidAmount > 0 && (
                      <>
                        <div className="flex justify-between py-2 text-green-600">
                          <span>Paid:</span>
                          <span>{formatCurrency(previewInvoice.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold text-red-600">
                          <span>Balance Due:</span>
                          <span>{formatCurrency(previewInvoice.balanceDue)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {previewInvoice.notes && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-1">Notes:</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{previewInvoice.notes}</p>
                  </div>
                )}

                {previewInvoice.termsAndConditions && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-1">Terms & Conditions:</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{previewInvoice.termsAndConditions}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            {previewInvoice && (
              <>
                <Button variant="outline" onClick={() => handleDownloadPdf(previewInvoice.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={() => handleSendEmail(previewInvoice)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
