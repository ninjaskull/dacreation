import { 
  type User, type InsertUser, type Lead, type InsertLead, type UpdateLead,
  type Appointment, type InsertAppointment, type UpdateAppointment,
  type ActivityLog, type InsertActivityLog,
  type LeadNote, type InsertLeadNote,
  type TeamMember, type InsertTeamMember,
  type PortfolioItem, type InsertPortfolioItem,
  type Testimonial, type InsertTestimonial,
  type Career, type InsertCareer,
  type PressArticle, type InsertPressArticle,
  type PageContent, type InsertPageContent,
  type Client, type InsertClient, type UpdateClient,
  type Event, type InsertEvent, type UpdateEvent,
  type Vendor, type InsertVendor, type UpdateVendor,
  type CompanySettings, type InsertCompanySettings,
  type UserSettings, type InsertUserSettings, type UpdateUserSettings,
  type InvoiceTemplate, type InsertInvoiceTemplate, type UpdateInvoiceTemplate,
  type Invoice, type InsertInvoice, type UpdateInvoice,
  type InvoiceItem, type InsertInvoiceItem, type UpdateInvoiceItem,
  type InvoicePayment, type InsertInvoicePayment,
  type CallbackRequest, type InsertCallbackRequest, type UpdateCallbackRequest,
  type Conversation, type InsertConversation, type UpdateConversation,
  type ChatMessage, type InsertChatMessage,
  type AgentStatus, type InsertAgentStatus, type UpdateAgentStatus,
  type SmtpSettings, type InsertSmtpSettings, type UpdateSmtpSettings,
  type EmailTypeSettings, type InsertEmailTypeSettings, type UpdateEmailTypeSettings,
  type EmailTemplate, type InsertEmailTemplate, type UpdateEmailTemplate,
  type EmailLog, type InsertEmailLog,
  type BlogPost, type InsertBlogPost, type UpdateBlogPost,
  type Subscriber, type InsertSubscriber, type UpdateSubscriber,
  type VendorRegistration, type InsertVendorRegistration, type UpdateVendorRegistration,
  type VendorDocument, type InsertVendorDocument, type UpdateVendorDocument,
  type VendorApprovalLog, type InsertVendorApprovalLog,
  type VendorServiceOffering, type InsertVendorServiceOffering,
  type VendorPerformanceReview, type InsertVendorPerformanceReview,
  users, leads, appointments, activityLogs, leadNotes,
  teamMembers, portfolioItems, testimonials, careers, pressArticles, pageContent,
  clients, events, vendors, companySettings, userSettings,
  invoiceTemplates, invoices, invoiceItems, invoicePayments,
  callbackRequests, conversations, chatMessages, agentStatus,
  smtpSettings, emailTypeSettings, emailTemplates, emailLogs, blogPosts, subscribers,
  vendorRegistrations, vendorDocuments, vendorApprovalLogs, vendorServiceOfferings, vendorPerformanceReviews
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, or, sql, asc, inArray } from "drizzle-orm";

// Sanitize user input for LIKE queries to prevent SQL injection
// Escapes special characters: %, _, \
function sanitizeLikePattern(input: string): string {
  return input
    .replace(/\\/g, '\\\\')  // Escape backslash first
    .replace(/%/g, '\\%')     // Escape percent
    .replace(/_/g, '\\_');    // Escape underscore
}

export interface LeadWithAssignee extends Lead {
  assignee?: { id: string; name: string | null; username: string } | null;
}

export interface AppointmentWithDetails extends Appointment {
  lead?: { id: string; name: string; email: string; phone: string } | null;
  assignee?: { id: string; name: string | null; username: string } | null;
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: { id: string; name: string | null; username: string } | null;
}

export interface LeadNoteWithUser extends LeadNote {
  user?: { id: string; name: string | null; username: string } | null;
}

export interface LeadFilters {
  status?: string;
  eventType?: string;
  location?: string;
  budgetRange?: string;
  assignedTo?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  leadSource?: string;
}

export interface ClientFilters {
  status?: string;
  search?: string;
  city?: string;
  source?: string;
}

export interface ClientWithDetails extends Client {
  referrer?: { id: string; name: string } | null;
}

export interface ClientStats {
  total: number;
  active: number;
  vip: number;
  new: number;
  totalRevenue: number;
  byStatus: Record<string, number>;
}

export interface EventFilters {
  status?: string;
  type?: string;
  paymentStatus?: string;
  clientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface EventWithDetails extends Event {
  client?: { id: string; name: string; email: string } | null;
  lead?: { id: string; name: string } | null;
  assignee?: { id: string; name: string | null; username: string } | null;
}

export interface EventStats {
  total: number;
  upcoming: number;
  inProgress: number;
  completed: number;
  totalRevenue: number;
  pendingPayments: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface VendorFilters {
  category?: string;
  status?: string;
  city?: string;
  search?: string;
  minRating?: number;
}

export interface VendorStats {
  total: number;
  active: number;
  byCategory: Record<string, number>;
  topRated: number;
}

export interface InvoiceFilters {
  status?: string;
  clientId?: string;
  eventId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface InvoiceWithDetails extends Invoice {
  client?: { id: string; name: string; email: string } | null;
  event?: { id: string; name: string } | null;
  template?: { id: string; name: string; layout: string } | null;
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
}

export interface InvoiceStats {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface ReportData {
  revenue: {
    total: number;
    byMonth: { month: string; amount: number }[];
    byEventType: { type: string; amount: number }[];
  };
  leads: {
    total: number;
    converted: number;
    conversionRate: number;
    bySource: { source: string; count: number }[];
    byStatus: { status: string; count: number }[];
  };
  events: {
    total: number;
    completed: number;
    upcoming: number;
    byType: { type: string; count: number }[];
  };
  clients: {
    total: number;
    new: number;
    returning: number;
  };
}

export interface CallbackRequestFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CallbackRequestWithAssignee extends CallbackRequest {
  assignee?: { id: string; name: string | null; username: string } | null;
}

export interface CallbackRequestStats {
  total: number;
  pending: number;
  called: number;
  scheduled: number;
  completed: number;
  byPriority: Record<string, number>;
}

export interface ConversationFilters {
  status?: string;
  assignedTo?: string;
  search?: string;
}

export interface ConversationWithDetails extends Conversation {
  assignee?: { id: string; name: string | null; username: string } | null;
  lastMessage?: ChatMessage | null;
}

export interface ConversationStats {
  total: number;
  active: number;
  waiting: number;
  resolved: number;
  unreadCount: number;
}

export interface BlogFilters {
  status?: string;
  category?: string;
  search?: string;
  isFeatured?: boolean;
}

export interface SubscriberFilters {
  status?: string;
  source?: string;
  search?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SubscriberStats {
  total: number;
  active: number;
  unsubscribed: number;
  pending: number;
  bounced: number;
  complained: number;
  thisWeek: number;
  thisMonth: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface EmailLogFilters {
  status?: string;
  type?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface EmailLogStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  successRate: number;
}

export interface VendorRegistrationFilters {
  status?: string;
  category?: string;
  city?: string;
  state?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface VendorRegistrationWithDetails extends VendorRegistration {
  reviewer?: { id: string; name: string | null; username: string } | null;
  approver?: { id: string; name: string | null; username: string } | null;
  documents?: VendorDocument[];
}

export interface VendorRegistrationStats {
  total: number;
  draft: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getActiveTeamMembers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  createLead(lead: InsertLead): Promise<Lead>;
  findLeadByEmailOrPhone(email?: string | null, phone?: string | null): Promise<Lead | undefined>;
  getAllLeads(filters?: LeadFilters): Promise<LeadWithAssignee[]>;
  getLeadById(id: string): Promise<LeadWithAssignee | undefined>;
  updateLead(id: string, data: UpdateLead): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  getLeadsByAssignee(assigneeId: string): Promise<LeadWithAssignee[]>;
  getLeadStats(): Promise<{
    total: number;
    newToday: number;
    pendingFollowUp: number;
    bySource: Record<string, number>;
    byStatus: Record<string, number>;
    byEventType: Record<string, number>;
  }>;
  
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAllAppointments(filters?: { from?: Date; to?: Date; assignedTo?: string; status?: string }): Promise<AppointmentWithDetails[]>;
  getAppointmentById(id: string): Promise<AppointmentWithDetails | undefined>;
  getAppointmentsByLead(leadId: string): Promise<AppointmentWithDetails[]>;
  updateAppointment(id: string, data: UpdateAppointment): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
  getUpcomingAppointments(limit?: number): Promise<AppointmentWithDetails[]>;
  
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogsByLead(leadId: string): Promise<ActivityLogWithUser[]>;
  
  createLeadNote(note: InsertLeadNote): Promise<LeadNote>;
  getLeadNotes(leadId: string): Promise<LeadNoteWithUser[]>;
  updateLeadNote(id: string, content: string, isPinned?: boolean): Promise<LeadNote | undefined>;
  deleteLeadNote(id: string): Promise<boolean>;
  
  updateLeadStatus(id: string, status: string, notes?: string): Promise<Lead | undefined>;
  
  getAllTeamMembers(activeOnly?: boolean): Promise<TeamMember[]>;
  getTeamMemberById(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;
  
  getAllPortfolioItems(activeOnly?: boolean): Promise<PortfolioItem[]>;
  getPortfolioItemById(id: string): Promise<PortfolioItem | undefined>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  updatePortfolioItem(id: string, data: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined>;
  deletePortfolioItem(id: string): Promise<boolean>;
  
  getAllTestimonials(activeOnly?: boolean): Promise<Testimonial[]>;
  getTestimonialById(id: string): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: string, data: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string): Promise<boolean>;
  
  getAllCareers(activeOnly?: boolean): Promise<Career[]>;
  getCareerById(id: string): Promise<Career | undefined>;
  createCareer(career: InsertCareer): Promise<Career>;
  updateCareer(id: string, data: Partial<InsertCareer>): Promise<Career | undefined>;
  deleteCareer(id: string): Promise<boolean>;
  
  getAllPressArticles(activeOnly?: boolean): Promise<PressArticle[]>;
  getPressArticleById(id: string): Promise<PressArticle | undefined>;
  createPressArticle(article: InsertPressArticle): Promise<PressArticle>;
  updatePressArticle(id: string, data: Partial<InsertPressArticle>): Promise<PressArticle | undefined>;
  deletePressArticle(id: string): Promise<boolean>;
  
  getPageContent(pageKey: string): Promise<PageContent | undefined>;
  getAllPageContent(): Promise<PageContent[]>;
  upsertPageContent(content: InsertPageContent): Promise<PageContent>;
  
  getAllClients(filters?: ClientFilters): Promise<ClientWithDetails[]>;
  getClientById(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, data: UpdateClient): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  getClientStats(): Promise<ClientStats>;
  
  getAllEvents(filters?: EventFilters): Promise<EventWithDetails[]>;
  getEventById(id: string): Promise<EventWithDetails | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, data: UpdateEvent): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  getEventStats(): Promise<EventStats>;
  
  getAllVendors(filters?: VendorFilters): Promise<Vendor[]>;
  getVendorById(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, data: UpdateVendor): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<boolean>;
  getVendorStats(): Promise<VendorStats>;
  
  getCompanySettings(): Promise<CompanySettings | undefined>;
  upsertCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;
  
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(userId: string, settings: UpdateUserSettings): Promise<UserSettings>;
  
  getReportData(dateFrom?: Date, dateTo?: Date): Promise<ReportData>;
  
  getAllInvoiceTemplates(activeOnly?: boolean): Promise<InvoiceTemplate[]>;
  getInvoiceTemplateById(id: string): Promise<InvoiceTemplate | undefined>;
  getDefaultInvoiceTemplate(): Promise<InvoiceTemplate | undefined>;
  createInvoiceTemplate(template: InsertInvoiceTemplate): Promise<InvoiceTemplate>;
  updateInvoiceTemplate(id: string, data: UpdateInvoiceTemplate): Promise<InvoiceTemplate | undefined>;
  deleteInvoiceTemplate(id: string): Promise<boolean>;
  setDefaultTemplate(id: string): Promise<InvoiceTemplate | undefined>;
  
  getAllInvoices(filters?: InvoiceFilters): Promise<InvoiceWithDetails[]>;
  getInvoiceById(id: string): Promise<InvoiceWithDetails | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: UpdateInvoice): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getInvoiceStats(): Promise<InvoiceStats>;
  generateInvoiceNumber(): Promise<string>;
  
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: string, data: UpdateInvoiceItem): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: string): Promise<boolean>;
  deleteInvoiceItems(invoiceId: string): Promise<boolean>;
  
  getInvoicePayments(invoiceId: string): Promise<InvoicePayment[]>;
  createInvoicePayment(payment: InsertInvoicePayment): Promise<InvoicePayment>;
  deleteInvoicePayment(id: string): Promise<boolean>;
  
  getSmtpSettings(): Promise<SmtpSettings | undefined>;
  upsertSmtpSettings(settings: InsertSmtpSettings): Promise<SmtpSettings>;
  updateSmtpSettings(id: string, data: UpdateSmtpSettings): Promise<SmtpSettings | undefined>;
  updateSmtpTestResult(id: string, result: string): Promise<SmtpSettings | undefined>;
  
  getEmailTypeSettings(): Promise<EmailTypeSettings | undefined>;
  upsertEmailTypeSettings(settings: InsertEmailTypeSettings | UpdateEmailTypeSettings): Promise<EmailTypeSettings>;
  
  getAllEmailTemplates(activeOnly?: boolean): Promise<EmailTemplate[]>;
  getEmailTemplateById(id: string): Promise<EmailTemplate | undefined>;
  getEmailTemplateByKey(templateKey: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, data: UpdateEmailTemplate): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: string): Promise<boolean>;
  
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  updateEmailLogStatus(id: string, status: string, errorMessage?: string): Promise<EmailLog | undefined>;
  getEmailLogs(limit?: number): Promise<EmailLog[]>;
  getEmailLogById(id: string): Promise<EmailLog | undefined>;
  getEmailLogsFiltered(filters: EmailLogFilters): Promise<{ logs: EmailLog[]; total: number }>;
  getEmailLogStats(): Promise<EmailLogStats>;
  deleteEmailLog(id: string): Promise<boolean>;
  bulkDeleteEmailLogs(ids: string[]): Promise<number>;
  
  getAgentStatus(userId: string): Promise<AgentStatus | undefined>;
  getAllAgentStatuses(): Promise<(AgentStatus & { user: { id: string; name: string | null; username: string } })[]>;
  upsertAgentStatus(userId: string, data: InsertAgentStatus | UpdateAgentStatus): Promise<AgentStatus>;
  updateAgentActiveConversations(userId: string, increment: number): Promise<AgentStatus | undefined>;
  getOnlineAgents(): Promise<(AgentStatus & { user: { id: string; name: string | null; username: string } })[]>;
  
  getAllBlogPosts(filters?: BlogFilters): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, data: UpdateBlogPost): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  incrementBlogViewCount(id: string): Promise<BlogPost | undefined>;
  
  getAllSubscribers(filters?: SubscriberFilters): Promise<Subscriber[]>;
  getActiveSubscribers(): Promise<Subscriber[]>;
  getSubscriberById(id: string): Promise<Subscriber | undefined>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  updateSubscriber(id: string, data: UpdateSubscriber): Promise<Subscriber | undefined>;
  deleteSubscriber(id: string): Promise<boolean>;
  bulkDeleteSubscribers(ids: string[]): Promise<number>;
  bulkUpdateSubscriberStatus(ids: string[], status: string): Promise<number>;
  bulkAddTags(ids: string[], tags: string[]): Promise<number>;
  unsubscribeByEmail(email: string, reason?: string): Promise<Subscriber | undefined>;
  getSubscriberStats(): Promise<SubscriberStats>;
  incrementEmailStats(id: string, field: 'sent' | 'opened' | 'clicked'): Promise<Subscriber | undefined>;
  
  getAllVendorRegistrations(filters?: VendorRegistrationFilters): Promise<VendorRegistrationWithDetails[]>;
  getVendorRegistrationById(id: string): Promise<VendorRegistrationWithDetails | undefined>;
  createVendorRegistration(registration: InsertVendorRegistration): Promise<VendorRegistration>;
  updateVendorRegistration(id: string, data: UpdateVendorRegistration): Promise<VendorRegistration | undefined>;
  deleteVendorRegistration(id: string): Promise<boolean>;
  submitVendorRegistration(id: string): Promise<VendorRegistration | undefined>;
  approveVendorRegistration(id: string, userId: string, notes?: string): Promise<VendorRegistration | undefined>;
  rejectVendorRegistration(id: string, userId: string, reason: string, notes?: string): Promise<VendorRegistration | undefined>;
  getVendorRegistrationStats(): Promise<VendorRegistrationStats>;
  
  getVendorDocuments(vendorRegistrationId: string): Promise<VendorDocument[]>;
  createVendorDocument(document: InsertVendorDocument): Promise<VendorDocument>;
  updateVendorDocument(id: string, data: UpdateVendorDocument): Promise<VendorDocument | undefined>;
  deleteVendorDocument(id: string): Promise<boolean>;
  verifyVendorDocument(id: string, userId: string, status: string, notes?: string): Promise<VendorDocument | undefined>;
  
  getVendorApprovalLogs(vendorRegistrationId: string): Promise<VendorApprovalLog[]>;
  createVendorApprovalLog(log: InsertVendorApprovalLog): Promise<VendorApprovalLog>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.username));
  }

  async getActiveTeamMembers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(asc(users.name));
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const leadData: typeof leads.$inferInsert = {
      eventType: insertLead.eventType,
      name: insertLead.name,
      phone: insertLead.phone,
      email: insertLead.email,
      contactMethod: insertLead.contactMethod,
      leadSource: insertLead.leadSource,
      date: insertLead.date ? new Date(insertLead.date as string | Date) : null,
      guestCount: insertLead.guestCount ?? null,
      location: insertLead.location ?? null,
      budgetRange: insertLead.budgetRange ?? null,
      leadMagnet: insertLead.leadMagnet ?? null,
      message: insertLead.message ?? null,
      consentGiven: insertLead.consentGiven ?? true,
    };
    
    const [lead] = await db
      .insert(leads)
      .values(leadData)
      .returning();
    return lead;
  }

  async findLeadByEmailOrPhone(email?: string | null, phone?: string | null): Promise<Lead | undefined> {
    const conditions = [];
    
    if (email && email.trim()) {
      conditions.push(eq(leads.email, email.trim()));
    }
    
    if (phone && phone.trim()) {
      const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
      conditions.push(eq(leads.phone, phone.trim()));
      if (normalizedPhone !== phone.trim()) {
        conditions.push(eq(leads.phone, normalizedPhone));
      }
    }
    
    if (conditions.length === 0) {
      return undefined;
    }
    
    const [lead] = await db
      .select()
      .from(leads)
      .where(or(...conditions))
      .orderBy(desc(leads.createdAt))
      .limit(1);
    return lead;
  }

  async getAllLeads(filters?: LeadFilters): Promise<LeadWithAssignee[]> {
    const conditions = [];
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(leads.status, filters.status));
    }
    if (filters?.eventType && filters.eventType !== 'all') {
      conditions.push(eq(leads.eventType, filters.eventType));
    }
    if (filters?.location) {
      conditions.push(like(leads.location, `%${sanitizeLikePattern(filters.location)}%`));
    }
    if (filters?.budgetRange && filters.budgetRange !== 'all') {
      conditions.push(eq(leads.budgetRange, filters.budgetRange));
    }
    if (filters?.assignedTo && filters.assignedTo !== 'all') {
      conditions.push(eq(leads.assignedTo, filters.assignedTo));
    }
    if (filters?.leadSource && filters.leadSource !== 'all') {
      conditions.push(eq(leads.leadSource, filters.leadSource));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(leads.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(leads.createdAt, filters.dateTo));
    }
    if (filters?.search) {
      const searchTerm = `%${sanitizeLikePattern(filters.search)}%`;
      conditions.push(
        or(
          like(leads.name, searchTerm),
          like(leads.email, searchTerm),
          like(leads.phone, searchTerm)
        )
      );
    }

    const result = await db
      .select({
        lead: leads,
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(leads)
      .leftJoin(users, eq(leads.assignedTo, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(leads.createdAt));

    return result.map(r => ({
      ...r.lead,
      assignee: r.assignee?.id ? r.assignee : null,
    }));
  }

  async getLeadById(id: string): Promise<LeadWithAssignee | undefined> {
    const [result] = await db
      .select({
        lead: leads,
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(leads)
      .leftJoin(users, eq(leads.assignedTo, users.id))
      .where(eq(leads.id, id));

    if (!result) return undefined;

    return {
      ...result.lead,
      assignee: result.assignee?.id ? result.assignee : null,
    };
  }

  async updateLead(id: string, data: UpdateLead): Promise<Lead | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const [lead] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();
    return lead || undefined;
  }

  async deleteLead(id: string): Promise<boolean> {
    // First, delete related records to avoid foreign key constraint violations
    // Delete lead notes
    await db.delete(leadNotes).where(eq(leadNotes.leadId, id));
    
    // Delete activity logs
    await db.delete(activityLogs).where(eq(activityLogs.leadId, id));
    
    // Delete appointments
    await db.delete(appointments).where(eq(appointments.leadId, id));
    
    // Set leadId to null in events (don't delete events, just unlink them)
    await db.update(events).set({ leadId: null }).where(eq(events.leadId, id));
    
    // Now delete the lead
    await db.delete(leads).where(eq(leads.id, id));
    return true;
  }

  async getLeadsByAssignee(assigneeId: string): Promise<LeadWithAssignee[]> {
    const result = await db
      .select({
        lead: leads,
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(leads)
      .leftJoin(users, eq(leads.assignedTo, users.id))
      .where(eq(leads.assignedTo, assigneeId))
      .orderBy(desc(leads.createdAt));

    return result.map(r => ({
      ...r.lead,
      assignee: r.assignee?.id ? r.assignee : null,
    }));
  }

  async getLeadStats(): Promise<{
    total: number;
    newToday: number;
    pendingFollowUp: number;
    bySource: Record<string, number>;
    byStatus: Record<string, number>;
    byEventType: Record<string, number>;
  }> {
    const allLeads = await db.select().from(leads);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bySource: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byEventType: Record<string, number> = {};
    
    let newToday = 0;
    let pendingFollowUp = 0;
    
    for (const lead of allLeads) {
      bySource[lead.leadSource] = (bySource[lead.leadSource] || 0) + 1;
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
      byEventType[lead.eventType] = (byEventType[lead.eventType] || 0) + 1;
      
      if (new Date(lead.createdAt) >= today) {
        newToday++;
      }
      
      if (lead.status === 'follow-up' || lead.status === 'contacted') {
        pendingFollowUp++;
      }
    }
    
    return {
      total: allLeads.length,
      newToday,
      pendingFollowUp,
      bySource,
      byStatus,
      byEventType,
    };
  }

  async updateLeadStatus(id: string, status: string, notes?: string): Promise<Lead | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const [lead] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();
    return lead || undefined;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointmentData = {
      ...insertAppointment,
      scheduledAt: new Date(insertAppointment.scheduledAt),
    };
    
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData as any)
      .returning();
    return appointment;
  }

  async getAllAppointments(filters?: { from?: Date; to?: Date; assignedTo?: string; status?: string }): Promise<AppointmentWithDetails[]> {
    const conditions = [];
    
    if (filters?.from) {
      conditions.push(gte(appointments.scheduledAt, filters.from));
    }
    if (filters?.to) {
      conditions.push(lte(appointments.scheduledAt, filters.to));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(appointments.assignedTo, filters.assignedTo));
    }
    if (filters?.status) {
      conditions.push(eq(appointments.status, filters.status));
    }

    const result = await db
      .select({
        appointment: appointments,
        lead: {
          id: leads.id,
          name: leads.name,
          email: leads.email,
          phone: leads.phone,
        },
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(appointments)
      .leftJoin(leads, eq(appointments.leadId, leads.id))
      .leftJoin(users, eq(appointments.assignedTo, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(appointments.scheduledAt));

    return result.map(r => ({
      ...r.appointment,
      lead: r.lead?.id ? r.lead : null,
      assignee: r.assignee?.id ? r.assignee : null,
    }));
  }

  async getAppointmentById(id: string): Promise<AppointmentWithDetails | undefined> {
    const [result] = await db
      .select({
        appointment: appointments,
        lead: {
          id: leads.id,
          name: leads.name,
          email: leads.email,
          phone: leads.phone,
        },
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(appointments)
      .leftJoin(leads, eq(appointments.leadId, leads.id))
      .leftJoin(users, eq(appointments.assignedTo, users.id))
      .where(eq(appointments.id, id));

    if (!result) return undefined;

    return {
      ...result.appointment,
      lead: result.lead?.id ? result.lead : null,
      assignee: result.assignee?.id ? result.assignee : null,
    };
  }

  async getAppointmentsByLead(leadId: string): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select({
        appointment: appointments,
        lead: {
          id: leads.id,
          name: leads.name,
          email: leads.email,
          phone: leads.phone,
        },
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(appointments)
      .leftJoin(leads, eq(appointments.leadId, leads.id))
      .leftJoin(users, eq(appointments.assignedTo, users.id))
      .where(eq(appointments.leadId, leadId))
      .orderBy(desc(appointments.scheduledAt));

    return result.map(r => ({
      ...r.appointment,
      lead: r.lead?.id ? r.lead : null,
      assignee: r.assignee?.id ? r.assignee : null,
    }));
  }

  async updateAppointment(id: string, data: UpdateAppointment): Promise<Appointment | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }

    const [appointment] = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();
    return appointment || undefined;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    await db.delete(appointments).where(eq(appointments.id, id));
    return true;
  }

  async getUpcomingAppointments(limit: number = 5): Promise<AppointmentWithDetails[]> {
    const now = new Date();
    
    const result = await db
      .select({
        appointment: appointments,
        lead: {
          id: leads.id,
          name: leads.name,
          email: leads.email,
          phone: leads.phone,
        },
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(appointments)
      .leftJoin(leads, eq(appointments.leadId, leads.id))
      .leftJoin(users, eq(appointments.assignedTo, users.id))
      .where(and(
        gte(appointments.scheduledAt, now),
        eq(appointments.status, 'scheduled')
      ))
      .orderBy(asc(appointments.scheduledAt))
      .limit(limit);

    return result.map(r => ({
      ...r.appointment,
      lead: r.lead?.id ? r.lead : null,
      assignee: r.assignee?.id ? r.assignee : null,
    }));
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [activityLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return activityLog;
  }

  async getActivityLogsByLead(leadId: string): Promise<ActivityLogWithUser[]> {
    const result = await db
      .select({
        log: activityLogs,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.leadId, leadId))
      .orderBy(desc(activityLogs.createdAt));

    return result.map(r => ({
      ...r.log,
      user: r.user?.id ? r.user : null,
    }));
  }

  async createLeadNote(note: InsertLeadNote): Promise<LeadNote> {
    const [leadNote] = await db
      .insert(leadNotes)
      .values(note)
      .returning();
    return leadNote;
  }

  async getLeadNotes(leadId: string): Promise<LeadNoteWithUser[]> {
    const result = await db
      .select({
        note: leadNotes,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(leadNotes)
      .leftJoin(users, eq(leadNotes.userId, users.id))
      .where(eq(leadNotes.leadId, leadId))
      .orderBy(desc(leadNotes.isPinned), desc(leadNotes.createdAt));

    return result.map(r => ({
      ...r.note,
      user: r.user?.id ? r.user : null,
    }));
  }

  async updateLeadNote(id: string, content: string, isPinned?: boolean): Promise<LeadNote | undefined> {
    const updateData: any = { content, updatedAt: new Date() };
    if (isPinned !== undefined) {
      updateData.isPinned = isPinned;
    }

    const [note] = await db
      .update(leadNotes)
      .set(updateData)
      .where(eq(leadNotes.id, id))
      .returning();
    return note || undefined;
  }

  async deleteLeadNote(id: string): Promise<boolean> {
    await db.delete(leadNotes).where(eq(leadNotes.id, id));
    return true;
  }

  async getAllTeamMembers(activeOnly: boolean = false): Promise<TeamMember[]> {
    const conditions = activeOnly ? eq(teamMembers.isActive, true) : undefined;
    return await db
      .select()
      .from(teamMembers)
      .where(conditions)
      .orderBy(asc(teamMembers.displayOrder), asc(teamMembers.name));
  }

  async getTeamMemberById(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member || undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [created] = await db.insert(teamMembers).values(member).returning();
    return created;
  }

  async updateTeamMember(id: string, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updated] = await db
      .update(teamMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return true;
  }

  async getAllPortfolioItems(activeOnly: boolean = false): Promise<PortfolioItem[]> {
    const conditions = activeOnly ? eq(portfolioItems.isActive, true) : undefined;
    return await db
      .select()
      .from(portfolioItems)
      .where(conditions)
      .orderBy(desc(portfolioItems.isFeatured), asc(portfolioItems.displayOrder));
  }

  async getPortfolioItemById(id: string): Promise<PortfolioItem | undefined> {
    const [item] = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id));
    return item || undefined;
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [created] = await db.insert(portfolioItems).values(item).returning();
    return created;
  }

  async updatePortfolioItem(id: string, data: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const [updated] = await db
      .update(portfolioItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(portfolioItems.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePortfolioItem(id: string): Promise<boolean> {
    await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
    return true;
  }

  async getAllTestimonials(activeOnly: boolean = false): Promise<Testimonial[]> {
    const conditions = activeOnly ? eq(testimonials.isActive, true) : undefined;
    return await db
      .select()
      .from(testimonials)
      .where(conditions)
      .orderBy(desc(testimonials.isFeatured), asc(testimonials.displayOrder));
  }

  async getTestimonialById(id: string): Promise<Testimonial | undefined> {
    const [item] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return item || undefined;
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [created] = await db.insert(testimonials).values(testimonial).returning();
    return created;
  }

  async updateTestimonial(id: string, data: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [updated] = await db
      .update(testimonials)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(testimonials.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    return true;
  }

  async getAllCareers(activeOnly: boolean = false): Promise<Career[]> {
    const conditions = activeOnly ? eq(careers.isActive, true) : undefined;
    return await db
      .select()
      .from(careers)
      .where(conditions)
      .orderBy(desc(careers.createdAt));
  }

  async getCareerById(id: string): Promise<Career | undefined> {
    const [item] = await db.select().from(careers).where(eq(careers.id, id));
    return item || undefined;
  }

  async createCareer(career: InsertCareer): Promise<Career> {
    const [created] = await db.insert(careers).values(career).returning();
    return created;
  }

  async updateCareer(id: string, data: Partial<InsertCareer>): Promise<Career | undefined> {
    const [updated] = await db
      .update(careers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(careers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCareer(id: string): Promise<boolean> {
    await db.delete(careers).where(eq(careers.id, id));
    return true;
  }

  async getAllPressArticles(activeOnly: boolean = false): Promise<PressArticle[]> {
    const conditions = activeOnly ? eq(pressArticles.isActive, true) : undefined;
    return await db
      .select()
      .from(pressArticles)
      .where(conditions)
      .orderBy(desc(pressArticles.isFeatured), asc(pressArticles.displayOrder));
  }

  async getPressArticleById(id: string): Promise<PressArticle | undefined> {
    const [item] = await db.select().from(pressArticles).where(eq(pressArticles.id, id));
    return item || undefined;
  }

  async createPressArticle(article: InsertPressArticle): Promise<PressArticle> {
    const [created] = await db.insert(pressArticles).values(article).returning();
    return created;
  }

  async updatePressArticle(id: string, data: Partial<InsertPressArticle>): Promise<PressArticle | undefined> {
    const [updated] = await db
      .update(pressArticles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pressArticles.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePressArticle(id: string): Promise<boolean> {
    await db.delete(pressArticles).where(eq(pressArticles.id, id));
    return true;
  }

  async getPageContent(pageKey: string): Promise<PageContent | undefined> {
    const [content] = await db.select().from(pageContent).where(eq(pageContent.pageKey, pageKey));
    return content || undefined;
  }

  async getAllPageContent(): Promise<PageContent[]> {
    return await db.select().from(pageContent).orderBy(asc(pageContent.pageKey));
  }

  async upsertPageContent(content: InsertPageContent): Promise<PageContent> {
    const existing = await this.getPageContent(content.pageKey);
    
    if (existing) {
      const [updated] = await db
        .update(pageContent)
        .set({ ...content, updatedAt: new Date() })
        .where(eq(pageContent.pageKey, content.pageKey))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(pageContent).values(content).returning();
      return created;
    }
  }

  async getAllClients(filters?: ClientFilters): Promise<ClientWithDetails[]> {
    const conditions = [];
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(clients.status, filters.status));
    }
    if (filters?.city) {
      conditions.push(like(clients.city, `%${sanitizeLikePattern(filters.city)}%`));
    }
    if (filters?.source && filters.source !== 'all') {
      conditions.push(eq(clients.source, filters.source));
    }
    if (filters?.search) {
      const searchTerm = `%${sanitizeLikePattern(filters.search)}%`;
      conditions.push(
        or(
          like(clients.name, searchTerm),
          like(clients.email, searchTerm),
          like(clients.phone, searchTerm),
          like(clients.company, searchTerm)
        )
      );
    }

    const result = await db
      .select()
      .from(clients)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(clients.createdAt));

    return result.map(client => ({
      ...client,
      referrer: null,
    }));
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient as any).returning();
    return client;
  }

  async updateClient(id: string, data: UpdateClient): Promise<Client | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.lastContactDate) {
      updateData.lastContactDate = new Date(data.lastContactDate);
    }

    const [client] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: string): Promise<boolean> {
    // First, handle related records to avoid foreign key constraint violations
    // Set referredBy to null for any clients that reference this client
    await db.update(clients).set({ referredBy: null }).where(eq(clients.referredBy, id));
    
    // Set clientId to null in events (don't delete events, just unlink them)
    await db.update(events).set({ clientId: null }).where(eq(events.clientId, id));
    
    // Set clientId to null in invoices (don't delete invoices, just unlink them)
    await db.update(invoices).set({ clientId: null }).where(eq(invoices.clientId, id));
    
    // Now delete the client
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  }

  async getClientStats(): Promise<ClientStats> {
    const allClients = await db.select().from(clients);
    
    const byStatus: Record<string, number> = {};
    let totalRevenue = 0;
    let active = 0;
    let vip = 0;
    let newClients = 0;
    
    for (const client of allClients) {
      byStatus[client.status] = (byStatus[client.status] || 0) + 1;
      totalRevenue += client.totalSpent || 0;
      
      if (client.status === 'active') active++;
      if (client.status === 'vip') vip++;
      if (client.status === 'new') newClients++;
    }
    
    return {
      total: allClients.length,
      active,
      vip,
      new: newClients,
      totalRevenue,
      byStatus,
    };
  }

  async getAllEvents(filters?: EventFilters): Promise<EventWithDetails[]> {
    const conditions = [];
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(events.status, filters.status));
    }
    if (filters?.type && filters.type !== 'all') {
      conditions.push(eq(events.type, filters.type));
    }
    if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
      conditions.push(eq(events.paymentStatus, filters.paymentStatus));
    }
    if (filters?.clientId) {
      conditions.push(eq(events.clientId, filters.clientId));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(events.date, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(events.date, filters.dateTo));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(events.name, searchTerm),
          like(events.venue, searchTerm)
        )
      );
    }

    const result = await db
      .select({
        event: events,
        client: {
          id: clients.id,
          name: clients.name,
          email: clients.email,
        },
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(events)
      .leftJoin(clients, eq(events.clientId, clients.id))
      .leftJoin(users, eq(events.assignedTo, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(events.date));

    return result.map(r => ({
      ...r.event,
      client: r.client?.id ? r.client : null,
      lead: null,
      assignee: r.assignee?.id ? r.assignee : null,
    }));
  }

  async getEventById(id: string): Promise<EventWithDetails | undefined> {
    const [result] = await db
      .select({
        event: events,
        client: {
          id: clients.id,
          name: clients.name,
          email: clients.email,
        },
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(events)
      .leftJoin(clients, eq(events.clientId, clients.id))
      .leftJoin(users, eq(events.assignedTo, users.id))
      .where(eq(events.id, id));

    if (!result) return undefined;

    return {
      ...result.event,
      client: result.client?.id ? result.client : null,
      lead: null,
      assignee: result.assignee?.id ? result.assignee : null,
    };
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const eventData = {
      ...insertEvent,
      date: new Date(insertEvent.date),
      endDate: insertEvent.endDate ? new Date(insertEvent.endDate) : null,
    };
    
    const [event] = await db.insert(events).values(eventData as any).returning();
    return event;
  }

  async updateEvent(id: string, data: UpdateEvent): Promise<Event | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    const [event] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true;
  }

  async getEventStats(): Promise<EventStats> {
    const allEvents = await db.select().from(events);
    const now = new Date();
    
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalRevenue = 0;
    let pendingPayments = 0;
    let upcoming = 0;
    let inProgress = 0;
    let completed = 0;
    
    for (const event of allEvents) {
      byType[event.type] = (byType[event.type] || 0) + 1;
      byStatus[event.status] = (byStatus[event.status] || 0) + 1;
      totalRevenue += event.paidAmount || 0;
      
      if (event.paymentStatus === 'pending' || event.paymentStatus === 'partial') {
        pendingPayments += (event.contractAmount || 0) - (event.paidAmount || 0);
      }
      
      if (event.status === 'completed') completed++;
      if (event.status === 'in_progress') inProgress++;
      if (new Date(event.date) > now && event.status !== 'completed' && event.status !== 'cancelled') {
        upcoming++;
      }
    }
    
    return {
      total: allEvents.length,
      upcoming,
      inProgress,
      completed,
      totalRevenue,
      pendingPayments,
      byType,
      byStatus,
    };
  }

  async getAllVendors(filters?: VendorFilters): Promise<Vendor[]> {
    const conditions = [];
    
    if (filters?.category && filters.category !== 'all') {
      conditions.push(eq(vendors.category, filters.category));
    }
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(vendors.status, filters.status));
    }
    if (filters?.city) {
      conditions.push(like(vendors.city, `%${sanitizeLikePattern(filters.city)}%`));
    }
    if (filters?.minRating) {
      conditions.push(gte(vendors.rating, filters.minRating));
    }
    if (filters?.search) {
      const searchTerm = `%${sanitizeLikePattern(filters.search)}%`;
      conditions.push(
        or(
          like(vendors.name, searchTerm),
          like(vendors.contactName, searchTerm),
          like(vendors.email, searchTerm)
        )
      );
    }

    return await db
      .select()
      .from(vendors)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(vendors.rating), asc(vendors.name));
  }

  async getVendorById(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(insertVendor as any).returning();
    return vendor;
  }

  async updateVendor(id: string, data: UpdateVendor): Promise<Vendor | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  async deleteVendor(id: string): Promise<boolean> {
    await db.delete(vendors).where(eq(vendors.id, id));
    return true;
  }

  async getVendorStats(): Promise<VendorStats> {
    const allVendors = await db.select().from(vendors);
    
    const byCategory: Record<string, number> = {};
    let active = 0;
    let topRated = 0;
    
    for (const vendor of allVendors) {
      byCategory[vendor.category] = (byCategory[vendor.category] || 0) + 1;
      if (vendor.status === 'active') active++;
      if (vendor.rating >= 4) topRated++;
    }
    
    return {
      total: allVendors.length,
      active,
      byCategory,
      topRated,
    };
  }

  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const [settings] = await db.select().from(companySettings);
    return settings || undefined;
  }

  async upsertCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    const existing = await this.getCompanySettings();
    
    if (existing) {
      const [updated] = await db
        .update(companySettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(companySettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(companySettings).values(settings).returning();
      return created;
    }
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings || undefined;
  }

  async upsertUserSettings(userId: string, settings: UpdateUserSettings): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(userSettings.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userSettings)
        .values({ userId, ...settings } as any)
        .returning();
      return created;
    }
  }

  async getReportData(dateFrom?: Date, dateTo?: Date): Promise<ReportData> {
    const conditions: any[] = [];
    if (dateFrom) conditions.push(gte(events.createdAt, dateFrom));
    if (dateTo) conditions.push(lte(events.createdAt, dateTo));

    const allEvents = await db
      .select()
      .from(events)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const leadConditions: any[] = [];
    if (dateFrom) leadConditions.push(gte(leads.createdAt, dateFrom));
    if (dateTo) leadConditions.push(lte(leads.createdAt, dateTo));

    const allLeads = await db
      .select()
      .from(leads)
      .where(leadConditions.length > 0 ? and(...leadConditions) : undefined);

    const allClients = await db.select().from(clients);

    const revenueByMonth: Record<string, number> = {};
    const revenueByEventType: Record<string, number> = {};
    let totalRevenue = 0;
    let completedEvents = 0;
    let upcomingEvents = 0;
    const eventsByType: Record<string, number> = {};
    const now = new Date();

    for (const event of allEvents) {
      const revenue = event.paidAmount || 0;
      totalRevenue += revenue;
      
      const monthKey = new Date(event.date).toISOString().substring(0, 7);
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + revenue;
      revenueByEventType[event.type] = (revenueByEventType[event.type] || 0) + revenue;
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      
      if (event.status === 'completed') completedEvents++;
      if (new Date(event.date) > now && event.status !== 'completed' && event.status !== 'cancelled') {
        upcomingEvents++;
      }
    }

    const leadsBySource: Record<string, number> = {};
    const leadsByStatus: Record<string, number> = {};
    let convertedLeads = 0;

    for (const lead of allLeads) {
      leadsBySource[lead.leadSource] = (leadsBySource[lead.leadSource] || 0) + 1;
      leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
      if (lead.status === 'converted') convertedLeads++;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newClients = allClients.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length;
    const returningClients = allClients.filter(c => (c.eventsCount || 0) > 1).length;

    return {
      revenue: {
        total: totalRevenue,
        byMonth: Object.entries(revenueByMonth)
          .map(([month, amount]) => ({ month, amount }))
          .sort((a, b) => a.month.localeCompare(b.month)),
        byEventType: Object.entries(revenueByEventType)
          .map(([type, amount]) => ({ type, amount })),
      },
      leads: {
        total: allLeads.length,
        converted: convertedLeads,
        conversionRate: allLeads.length > 0 ? (convertedLeads / allLeads.length) * 100 : 0,
        bySource: Object.entries(leadsBySource)
          .map(([source, count]) => ({ source, count })),
        byStatus: Object.entries(leadsByStatus)
          .map(([status, count]) => ({ status, count })),
      },
      events: {
        total: allEvents.length,
        completed: completedEvents,
        upcoming: upcomingEvents,
        byType: Object.entries(eventsByType)
          .map(([type, count]) => ({ type, count })),
      },
      clients: {
        total: allClients.length,
        new: newClients,
        returning: returningClients,
      },
    };
  }

  async getAllInvoiceTemplates(activeOnly?: boolean): Promise<InvoiceTemplate[]> {
    if (activeOnly) {
      return await db
        .select()
        .from(invoiceTemplates)
        .where(eq(invoiceTemplates.isActive, true))
        .orderBy(desc(invoiceTemplates.isDefault), asc(invoiceTemplates.name));
    }
    return await db
      .select()
      .from(invoiceTemplates)
      .orderBy(desc(invoiceTemplates.isDefault), asc(invoiceTemplates.name));
  }

  async getInvoiceTemplateById(id: string): Promise<InvoiceTemplate | undefined> {
    const [template] = await db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.id, id));
    return template || undefined;
  }

  async getDefaultInvoiceTemplate(): Promise<InvoiceTemplate | undefined> {
    const [template] = await db
      .select()
      .from(invoiceTemplates)
      .where(and(eq(invoiceTemplates.isDefault, true), eq(invoiceTemplates.isActive, true)));
    return template || undefined;
  }

  async createInvoiceTemplate(template: InsertInvoiceTemplate): Promise<InvoiceTemplate> {
    if (template.isDefault) {
      await db.update(invoiceTemplates).set({ isDefault: false });
    }
    const [created] = await db
      .insert(invoiceTemplates)
      .values(template)
      .returning();
    return created;
  }

  async updateInvoiceTemplate(id: string, data: UpdateInvoiceTemplate): Promise<InvoiceTemplate | undefined> {
    if (data.isDefault) {
      await db.update(invoiceTemplates).set({ isDefault: false });
    }
    const [updated] = await db
      .update(invoiceTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoiceTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteInvoiceTemplate(id: string): Promise<boolean> {
    await db.delete(invoiceTemplates).where(eq(invoiceTemplates.id, id));
    return true;
  }

  async setDefaultTemplate(id: string): Promise<InvoiceTemplate | undefined> {
    await db.update(invoiceTemplates).set({ isDefault: false });
    const [updated] = await db
      .update(invoiceTemplates)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(invoiceTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllInvoices(filters?: InvoiceFilters): Promise<InvoiceWithDetails[]> {
    const conditions: any[] = [];
    
    if (filters?.status) conditions.push(eq(invoices.status, filters.status));
    if (filters?.clientId) conditions.push(eq(invoices.clientId, filters.clientId));
    if (filters?.eventId) conditions.push(eq(invoices.eventId, filters.eventId));
    if (filters?.dateFrom) conditions.push(gte(invoices.issueDate, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lte(invoices.issueDate, filters.dateTo));
    if (filters?.search) {
      const searchTerm = `%${sanitizeLikePattern(filters.search)}%`;
      conditions.push(
        or(
          like(invoices.invoiceNumber, searchTerm),
          like(invoices.title, searchTerm),
          like(invoices.clientName, searchTerm)
        )
      );
    }

    const allInvoices = await db
      .select()
      .from(invoices)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(invoices.createdAt));

    const result: InvoiceWithDetails[] = [];
    for (const invoice of allInvoices) {
      let client = null;
      let event = null;
      let template = null;

      if (invoice.clientId) {
        const [c] = await db
          .select({ id: clients.id, name: clients.name, email: clients.email })
          .from(clients)
          .where(eq(clients.id, invoice.clientId));
        client = c || null;
      }

      if (invoice.eventId) {
        const [e] = await db
          .select({ id: events.id, name: events.name })
          .from(events)
          .where(eq(events.id, invoice.eventId));
        event = e || null;
      }

      if (invoice.templateId) {
        const [t] = await db
          .select({ id: invoiceTemplates.id, name: invoiceTemplates.name, layout: invoiceTemplates.layout })
          .from(invoiceTemplates)
          .where(eq(invoiceTemplates.id, invoice.templateId));
        template = t || null;
      }

      result.push({ ...invoice, client, event, template });
    }

    return result;
  }

  async getInvoiceById(id: string): Promise<InvoiceWithDetails | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;

    let client = null;
    let event = null;
    let template = null;

    if (invoice.clientId) {
      const [c] = await db
        .select({ id: clients.id, name: clients.name, email: clients.email })
        .from(clients)
        .where(eq(clients.id, invoice.clientId));
      client = c || null;
    }

    if (invoice.eventId) {
      const [e] = await db
        .select({ id: events.id, name: events.name })
        .from(events)
        .where(eq(events.id, invoice.eventId));
      event = e || null;
    }

    if (invoice.templateId) {
      const [t] = await db
        .select({ id: invoiceTemplates.id, name: invoiceTemplates.name, layout: invoiceTemplates.layout })
        .from(invoiceTemplates)
        .where(eq(invoiceTemplates.id, invoice.templateId));
      template = t || null;
    }

    const items = await this.getInvoiceItems(id);
    const payments = await this.getInvoicePayments(id);

    return { ...invoice, client, event, template, items, payments };
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const invoiceData = {
      ...invoice,
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate),
    };
    
    const [created] = await db
      .insert(invoices)
      .values(invoiceData as any)
      .returning();
    return created;
  }

  async updateInvoice(id: string, data: UpdateInvoice): Promise<Invoice | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.issueDate) updateData.issueDate = new Date(data.issueDate);
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.status === 'sent' && !updateData.sentAt) updateData.sentAt = new Date();
    if (data.status === 'paid' && !updateData.paidAt) updateData.paidAt = new Date();
    if (data.status === 'cancelled' && !updateData.cancelledAt) updateData.cancelledAt = new Date();

    const [updated] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    await db.delete(invoicePayments).where(eq(invoicePayments.invoiceId, id));
    await db.delete(invoices).where(eq(invoices.id, id));
    return true;
  }

  async getInvoiceStats(): Promise<InvoiceStats> {
    const allInvoices = await db.select().from(invoices);
    
    let draft = 0, sent = 0, paid = 0, overdue = 0;
    let totalAmount = 0, paidAmount = 0;
    const now = new Date();

    for (const inv of allInvoices) {
      totalAmount += inv.totalAmount || 0;
      paidAmount += inv.paidAmount || 0;

      switch (inv.status) {
        case 'draft': draft++; break;
        case 'sent': case 'viewed': sent++; break;
        case 'paid': paid++; break;
        case 'overdue': overdue++; break;
      }

      if (['sent', 'viewed', 'partially_paid'].includes(inv.status) && 
          inv.dueDate && new Date(inv.dueDate) < now) {
        overdue++;
      }
    }

    return {
      total: allInvoices.length,
      draft,
      sent,
      paid,
      overdue,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
    };
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    
    const [lastInvoice] = await db
      .select({ invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .where(like(invoices.invoiceNumber, `${prefix}%`))
      .orderBy(desc(invoices.invoiceNumber))
      .limit(1);

    let nextNum = 1;
    if (lastInvoice?.invoiceNumber) {
      const numPart = lastInvoice.invoiceNumber.replace(prefix, '');
      nextNum = parseInt(numPart) + 1;
    }

    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId))
      .orderBy(asc(invoiceItems.displayOrder));
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [created] = await db
      .insert(invoiceItems)
      .values(item)
      .returning();
    return created;
  }

  async updateInvoiceItem(id: string, data: UpdateInvoiceItem): Promise<InvoiceItem | undefined> {
    const [updated] = await db
      .update(invoiceItems)
      .set(data)
      .where(eq(invoiceItems.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteInvoiceItem(id: string): Promise<boolean> {
    await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
    return true;
  }

  async deleteInvoiceItems(invoiceId: string): Promise<boolean> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
    return true;
  }

  async getInvoicePayments(invoiceId: string): Promise<InvoicePayment[]> {
    return await db
      .select()
      .from(invoicePayments)
      .where(eq(invoicePayments.invoiceId, invoiceId))
      .orderBy(desc(invoicePayments.paymentDate));
  }

  async createInvoicePayment(payment: InsertInvoicePayment): Promise<InvoicePayment> {
    const paymentData = {
      ...payment,
      paymentDate: new Date(payment.paymentDate),
    };
    
    const [created] = await db
      .insert(invoicePayments)
      .values(paymentData as any)
      .returning();

    const allPayments = await this.getInvoicePayments(payment.invoiceId);
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, payment.invoiceId));
    if (invoice) {
      let newStatus = invoice.status;
      if (totalPaid >= (invoice.totalAmount || 0)) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partially_paid';
      }
      
      await db.update(invoices)
        .set({ 
          paidAmount: totalPaid, 
          balanceDue: (invoice.totalAmount || 0) - totalPaid,
          status: newStatus,
          paidAt: newStatus === 'paid' ? new Date() : invoice.paidAt,
          updatedAt: new Date() 
        })
        .where(eq(invoices.id, payment.invoiceId));
    }

    return created;
  }

  async deleteInvoicePayment(id: string): Promise<boolean> {
    const [payment] = await db.select().from(invoicePayments).where(eq(invoicePayments.id, id));
    if (!payment) return false;

    await db.delete(invoicePayments).where(eq(invoicePayments.id, id));

    const allPayments = await this.getInvoicePayments(payment.invoiceId);
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, payment.invoiceId));
    if (invoice) {
      let newStatus = invoice.status;
      if (totalPaid === 0 && ['paid', 'partially_paid'].includes(invoice.status)) {
        newStatus = 'sent';
      } else if (totalPaid > 0 && totalPaid < (invoice.totalAmount || 0)) {
        newStatus = 'partially_paid';
      }

      await db.update(invoices)
        .set({ 
          paidAmount: totalPaid, 
          balanceDue: (invoice.totalAmount || 0) - totalPaid,
          status: newStatus,
          updatedAt: new Date() 
        })
        .where(eq(invoices.id, payment.invoiceId));
    }

    return true;
  }

  // Callback Requests
  async createCallbackRequest(request: InsertCallbackRequest): Promise<CallbackRequest> {
    const [created] = await db.insert(callbackRequests).values(request).returning();
    return created;
  }

  async getAllCallbackRequests(filters?: CallbackRequestFilters): Promise<CallbackRequestWithAssignee[]> {
    const conditions: any[] = [];
    
    if (filters?.status) {
      conditions.push(eq(callbackRequests.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(callbackRequests.priority, filters.priority));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(callbackRequests.assignedTo, filters.assignedTo));
    }
    if (filters?.search) {
      const searchTerm = `%${sanitizeLikePattern(filters.search)}%`;
      conditions.push(
        or(
          like(callbackRequests.name, searchTerm),
          like(callbackRequests.phone, searchTerm),
          like(callbackRequests.email, searchTerm)
        )
      );
    }
    if (filters?.dateFrom) {
      conditions.push(gte(callbackRequests.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(callbackRequests.createdAt, filters.dateTo));
    }

    const results = await db
      .select({
        request: callbackRequests,
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(callbackRequests)
      .leftJoin(users, eq(callbackRequests.assignedTo, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(callbackRequests.createdAt));

    return results.map(r => ({
      ...r.request,
      assignee: r.assignee?.id ? r.assignee : null,
    }));
  }

  async getCallbackRequestById(id: string): Promise<CallbackRequestWithAssignee | undefined> {
    const [result] = await db
      .select({
        request: callbackRequests,
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(callbackRequests)
      .leftJoin(users, eq(callbackRequests.assignedTo, users.id))
      .where(eq(callbackRequests.id, id));

    if (!result) return undefined;

    return {
      ...result.request,
      assignee: result.assignee?.id ? result.assignee : null,
    };
  }

  async updateCallbackRequest(id: string, data: UpdateCallbackRequest): Promise<CallbackRequest | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.calledAt) updateData.calledAt = new Date(data.calledAt);
    if (data.scheduledCallAt) updateData.scheduledCallAt = new Date(data.scheduledCallAt);

    const [updated] = await db
      .update(callbackRequests)
      .set(updateData)
      .where(eq(callbackRequests.id, id))
      .returning();
    return updated;
  }

  async deleteCallbackRequest(id: string): Promise<boolean> {
    await db.delete(callbackRequests).where(eq(callbackRequests.id, id));
    return true;
  }

  async getCallbackRequestStats(): Promise<CallbackRequestStats> {
    const allRequests = await db.select().from(callbackRequests);
    
    const stats: CallbackRequestStats = {
      total: allRequests.length,
      pending: 0,
      called: 0,
      scheduled: 0,
      completed: 0,
      byPriority: {},
    };

    allRequests.forEach(request => {
      if (request.status === 'pending') stats.pending++;
      if (request.status === 'called' || request.status === 'no_answer') stats.called++;
      if (request.status === 'scheduled') stats.scheduled++;
      if (request.status === 'completed') stats.completed++;

      const priority = request.priority || 'normal';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    });

    return stats;
  }

  // Conversations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const conversationData = {
      ...conversation,
      lastMessageAt: conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : new Date(),
    };
    const [created] = await db.insert(conversations).values(conversationData as any).returning();
    return created;
  }

  async getConversationByVisitorId(visitorId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.visitorId, visitorId),
        or(
          eq(conversations.status, 'active'),
          eq(conversations.status, 'waiting')
        )
      ))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(1);
    return conversation;
  }

  async getAllConversations(filters?: ConversationFilters): Promise<ConversationWithDetails[]> {
    const conditions: any[] = [];
    
    if (filters?.status) {
      conditions.push(eq(conversations.status, filters.status));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(conversations.assignedTo, filters.assignedTo));
    }
    if (filters?.search) {
      const searchTerm = `%${sanitizeLikePattern(filters.search)}%`;
      conditions.push(
        or(
          like(conversations.visitorName, searchTerm),
          like(conversations.visitorPhone, searchTerm),
          like(conversations.visitorEmail, searchTerm)
        )
      );
    }

    const results = await db
      .select({
        conversation: conversations,
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(conversations)
      .leftJoin(users, eq(conversations.assignedTo, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(conversations.lastMessageAt));

    const conversationsWithDetails: ConversationWithDetails[] = [];
    
    for (const r of results) {
      const [lastMessage] = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, r.conversation.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1);

      conversationsWithDetails.push({
        ...r.conversation,
        assignee: r.assignee?.id ? r.assignee : null,
        lastMessage: lastMessage || null,
      });
    }

    return conversationsWithDetails;
  }

  async getConversationById(id: string): Promise<ConversationWithDetails | undefined> {
    const [result] = await db
      .select({
        conversation: conversations,
        assignee: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(conversations)
      .leftJoin(users, eq(conversations.assignedTo, users.id))
      .where(eq(conversations.id, id));

    if (!result) return undefined;

    const [lastMessage] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(1);

    return {
      ...result.conversation,
      assignee: result.assignee?.id ? result.assignee : null,
      lastMessage: lastMessage || null,
    };
  }

  async updateConversation(id: string, data: UpdateConversation): Promise<Conversation | undefined> {
    // Convert date strings to Date objects for proper DB handling
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.liveAgentRequestedAt && typeof data.liveAgentRequestedAt === 'string') {
      updateData.liveAgentRequestedAt = new Date(data.liveAgentRequestedAt);
    }
    if (data.lastMessageAt && typeof data.lastMessageAt === 'string') {
      updateData.lastMessageAt = new Date(data.lastMessageAt);
    }
    
    const [updated] = await db
      .update(conversations)
      .set(updateData)
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }

  async deleteConversation(id: string): Promise<boolean> {
    await db.delete(chatMessages).where(eq(chatMessages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
    return true;
  }

  async getConversationStats(): Promise<ConversationStats> {
    const allConversations = await db.select().from(conversations);
    
    const stats: ConversationStats = {
      total: allConversations.length,
      active: 0,
      waiting: 0,
      resolved: 0,
      unreadCount: 0,
    };

    allConversations.forEach(conv => {
      if (conv.status === 'active') stats.active++;
      if (conv.status === 'waiting') stats.waiting++;
      if (conv.status === 'resolved' || conv.status === 'closed') stats.resolved++;
      stats.unreadCount += conv.unreadCount || 0;
    });

    return stats;
  }

  // Chat Messages
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(message).returning();
    
    await db.update(conversations)
      .set({ 
        lastMessageAt: new Date(),
        unreadCount: message.senderType === 'visitor' 
          ? sql`${conversations.unreadCount} + 1`
          : conversations.unreadCount,
        status: message.senderType === 'visitor' ? 'waiting' : 'active',
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, message.conversationId));

    return created;
  }

  async getMessagesByConversationId(conversationId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async markMessagesAsRead(conversationId: string, senderType?: string): Promise<void> {
    const conditions = [eq(chatMessages.conversationId, conversationId)];
    if (senderType) {
      conditions.push(eq(chatMessages.senderType, senderType));
    }

    await db.update(chatMessages)
      .set({ isRead: true })
      .where(and(...conditions));

    if (senderType === 'visitor') {
      await db.update(conversations)
        .set({ unreadCount: 0 })
        .where(eq(conversations.id, conversationId));
    }
  }

  async getUnreadMessageCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.isRead, false),
        eq(chatMessages.senderType, 'visitor')
      ));
    return result[0]?.count || 0;
  }

  async getSmtpSettings(): Promise<SmtpSettings | undefined> {
    const [settings] = await db.select().from(smtpSettings).limit(1);
    return settings;
  }

  async upsertSmtpSettings(settings: InsertSmtpSettings): Promise<SmtpSettings> {
    const existing = await this.getSmtpSettings();
    
    if (existing) {
      const [updated] = await db
        .update(smtpSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(smtpSettings.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(smtpSettings).values(settings).returning();
    return created;
  }

  async updateSmtpSettings(id: string, data: UpdateSmtpSettings): Promise<SmtpSettings | undefined> {
    const [updated] = await db
      .update(smtpSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(smtpSettings.id, id))
      .returning();
    return updated;
  }

  async updateSmtpTestResult(id: string, result: string): Promise<SmtpSettings | undefined> {
    const [updated] = await db
      .update(smtpSettings)
      .set({ lastTestedAt: new Date(), lastTestResult: result, updatedAt: new Date() })
      .where(eq(smtpSettings.id, id))
      .returning();
    return updated;
  }

  async getEmailTypeSettings(): Promise<EmailTypeSettings | undefined> {
    const [settings] = await db.select().from(emailTypeSettings).limit(1);
    return settings;
  }

  async upsertEmailTypeSettings(settings: InsertEmailTypeSettings | UpdateEmailTypeSettings): Promise<EmailTypeSettings> {
    const existing = await this.getEmailTypeSettings();
    
    if (existing) {
      const [updated] = await db
        .update(emailTypeSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(emailTypeSettings.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(emailTypeSettings).values(settings as InsertEmailTypeSettings).returning();
    return created;
  }

  async getAllEmailTemplates(activeOnly?: boolean): Promise<EmailTemplate[]> {
    if (activeOnly) {
      return await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.isActive, true))
        .orderBy(asc(emailTemplates.name));
    }
    return await db.select().from(emailTemplates).orderBy(asc(emailTemplates.name));
  }

  async getEmailTemplateById(id: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async getEmailTemplateByKey(templateKey: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.templateKey, templateKey));
    return template;
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [created] = await db.insert(emailTemplates).values(template).returning();
    return created;
  }

  async updateEmailTemplate(id: string, data: UpdateEmailTemplate): Promise<EmailTemplate | undefined> {
    const [updated] = await db
      .update(emailTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return true;
  }

  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const [created] = await db.insert(emailLogs).values(log).returning();
    return created;
  }

  async updateEmailLogStatus(id: string, status: string, errorMessage?: string): Promise<EmailLog | undefined> {
    const updateData: any = { status };
    if (status === 'sent') {
      updateData.sentAt = new Date();
    }
    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }
    
    const [updated] = await db
      .update(emailLogs)
      .set(updateData)
      .where(eq(emailLogs.id, id))
      .returning();
    return updated;
  }

  async getEmailLogs(limit: number = 100): Promise<EmailLog[]> {
    return await db
      .select()
      .from(emailLogs)
      .orderBy(desc(emailLogs.createdAt))
      .limit(limit);
  }

  async getEmailLogById(id: string): Promise<EmailLog | undefined> {
    const [log] = await db.select().from(emailLogs).where(eq(emailLogs.id, id));
    return log;
  }

  async getEmailLogsFiltered(filters: EmailLogFilters): Promise<{ logs: EmailLog[]; total: number }> {
    const conditions: any[] = [];
    
    if (filters.status) {
      conditions.push(eq(emailLogs.status, filters.status));
    }
    if (filters.type) {
      conditions.push(eq(emailLogs.type, filters.type));
    }
    if (filters.search) {
      const sanitizedSearch = sanitizeLikePattern(filters.search);
      conditions.push(
        or(
          like(emailLogs.recipientEmail, `%${sanitizedSearch}%`),
          like(emailLogs.subject, `%${sanitizedSearch}%`),
          like(emailLogs.recipientName, `%${sanitizedSearch}%`)
        )
      );
    }
    if (filters.dateFrom) {
      conditions.push(gte(emailLogs.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(emailLogs.createdAt, filters.dateTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    const [logs, countResult] = await Promise.all([
      db
        .select()
        .from(emailLogs)
        .where(whereClause)
        .orderBy(desc(emailLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(emailLogs)
        .where(whereClause)
    ]);

    return { logs, total: countResult[0]?.count || 0 };
  }

  async getEmailLogStats(): Promise<EmailLogStats> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allLogs] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailLogs);
    
    const [sentLogs] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailLogs)
      .where(eq(emailLogs.status, 'sent'));
    
    const [failedLogs] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailLogs)
      .where(eq(emailLogs.status, 'failed'));
    
    const [pendingLogs] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailLogs)
      .where(eq(emailLogs.status, 'pending'));

    const [todayLogs] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailLogs)
      .where(gte(emailLogs.createdAt, startOfToday));

    const [weekLogs] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailLogs)
      .where(gte(emailLogs.createdAt, startOfWeek));

    const [monthLogs] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emailLogs)
      .where(gte(emailLogs.createdAt, startOfMonth));

    const byTypeResult = await db
      .select({
        type: emailLogs.type,
        count: sql<number>`count(*)::int`
      })
      .from(emailLogs)
      .groupBy(emailLogs.type);

    const byStatusResult = await db
      .select({
        status: emailLogs.status,
        count: sql<number>`count(*)::int`
      })
      .from(emailLogs)
      .groupBy(emailLogs.status);

    const byType: Record<string, number> = {};
    byTypeResult.forEach(r => { byType[r.type] = r.count; });

    const byStatus: Record<string, number> = {};
    byStatusResult.forEach(r => { byStatus[r.status] = r.count; });

    const total = allLogs?.count || 0;
    const sent = sentLogs?.count || 0;
    const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    return {
      total,
      sent,
      failed: failedLogs?.count || 0,
      pending: pendingLogs?.count || 0,
      today: todayLogs?.count || 0,
      thisWeek: weekLogs?.count || 0,
      thisMonth: monthLogs?.count || 0,
      byType,
      byStatus,
      successRate
    };
  }

  async deleteEmailLog(id: string): Promise<boolean> {
    await db.delete(emailLogs).where(eq(emailLogs.id, id));
    return true;
  }

  async bulkDeleteEmailLogs(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(emailLogs).where(inArray(emailLogs.id, ids));
    return ids.length;
  }

  async getAgentStatus(userId: string): Promise<AgentStatus | undefined> {
    const [status] = await db
      .select()
      .from(agentStatus)
      .where(eq(agentStatus.userId, userId));
    return status;
  }

  async getAllAgentStatuses(): Promise<(AgentStatus & { user: { id: string; name: string | null; username: string } })[]> {
    const result = await db
      .select({
        agentStatus: agentStatus,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(agentStatus)
      .innerJoin(users, eq(agentStatus.userId, users.id))
      .orderBy(desc(agentStatus.lastActiveAt));

    return result.map(r => ({
      ...r.agentStatus,
      user: r.user,
    }));
  }

  async upsertAgentStatus(userId: string, data: InsertAgentStatus | UpdateAgentStatus): Promise<AgentStatus> {
    const existing = await this.getAgentStatus(userId);
    
    if (existing) {
      const [updated] = await db
        .update(agentStatus)
        .set({ ...data, updatedAt: new Date(), lastActiveAt: new Date() })
        .where(eq(agentStatus.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(agentStatus)
        .values({ userId, ...data } as any)
        .returning();
      return created;
    }
  }

  async updateAgentActiveConversations(userId: string, increment: number): Promise<AgentStatus | undefined> {
    const existing = await this.getAgentStatus(userId);
    if (!existing) return undefined;

    const newCount = Math.max(0, existing.activeConversations + increment);
    const [updated] = await db
      .update(agentStatus)
      .set({ activeConversations: newCount, updatedAt: new Date(), lastActiveAt: new Date() })
      .where(eq(agentStatus.userId, userId))
      .returning();
    return updated;
  }

  async getOnlineAgents(): Promise<(AgentStatus & { user: { id: string; name: string | null; username: string } })[]> {
    const result = await db
      .select({
        agentStatus: agentStatus,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
        },
      })
      .from(agentStatus)
      .innerJoin(users, eq(agentStatus.userId, users.id))
      .where(eq(agentStatus.status, "online"))
      .orderBy(asc(agentStatus.activeConversations));

    return result.map(r => ({
      ...r.agentStatus,
      user: r.user,
    }));
  }

  async getAllBlogPosts(filters?: BlogFilters): Promise<BlogPost[]> {
    const conditions = [];
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(blogPosts.status, filters.status));
    }
    if (filters?.category && filters.category !== 'all') {
      conditions.push(eq(blogPosts.category, filters.category));
    }
    if (filters?.isFeatured !== undefined) {
      conditions.push(eq(blogPosts.isFeatured, filters.isFeatured));
    }
    if (filters?.search) {
      const searchTerm = `%${sanitizeLikePattern(filters.search)}%`;
      conditions.push(
        or(
          like(blogPosts.title, searchTerm),
          like(blogPosts.excerpt, searchTerm),
          like(blogPosts.content, searchTerm)
        )
      );
    }

    return await db
      .select()
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt));
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostById(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const postData = {
      ...post,
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : (post.status === 'published' ? new Date() : null),
    };
    
    const [created] = await db.insert(blogPosts).values(postData as any).returning();
    return created;
  }

  async updateBlogPost(id: string, data: UpdateBlogPost): Promise<BlogPost | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    
    if (data.status === 'published') {
      const existing = await this.getBlogPostById(id);
      if (existing && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    
    if (data.publishedAt) {
      updateData.publishedAt = new Date(data.publishedAt);
    }

    const [updated] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return true;
  }

  async incrementBlogViewCount(id: string): Promise<BlogPost | undefined> {
    const existing = await this.getBlogPostById(id);
    if (!existing) return undefined;

    const [updated] = await db
      .update(blogPosts)
      .set({ viewCount: existing.viewCount + 1 })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async getAllSubscribers(filters?: SubscriberFilters): Promise<Subscriber[]> {
    const conditions = [];
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(subscribers.status, filters.status));
    }
    if (filters?.source && filters.source !== 'all') {
      conditions.push(eq(subscribers.source, filters.source));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(subscribers.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(subscribers.createdAt, filters.dateTo));
    }
    if (filters?.search) {
      const searchTerm = `%${sanitizeLikePattern(filters.search)}%`;
      conditions.push(
        or(
          like(subscribers.email, searchTerm),
          like(subscribers.name, searchTerm)
        )
      );
    }

    return await db
      .select()
      .from(subscribers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(subscribers.createdAt));
  }

  async getActiveSubscribers(): Promise<Subscriber[]> {
    return await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.status, 'active'))
      .orderBy(desc(subscribers.createdAt));
  }

  async getSubscriberById(id: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, id));
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email.toLowerCase()));
    return subscriber;
  }

  async createSubscriber(data: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db
      .insert(subscribers)
      .values({ ...data, email: data.email.toLowerCase() } as any)
      .returning();
    return subscriber;
  }

  async updateSubscriber(id: string, data: UpdateSubscriber): Promise<Subscriber | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.email) {
      updateData.email = data.email.toLowerCase();
    }
    
    const [subscriber] = await db
      .update(subscribers)
      .set(updateData)
      .where(eq(subscribers.id, id))
      .returning();
    return subscriber;
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    await db.delete(subscribers).where(eq(subscribers.id, id));
    return true;
  }

  async bulkDeleteSubscribers(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(subscribers).where(
      sql`${subscribers.id} = ANY(ARRAY[${sql.join(ids.map(id => sql`${id}`), sql`, `)}]::text[])`
    );
    return ids.length;
  }

  async bulkUpdateSubscriberStatus(ids: string[], status: string): Promise<number> {
    if (ids.length === 0) return 0;
    await db
      .update(subscribers)
      .set({ status, updatedAt: new Date() })
      .where(sql`${subscribers.id} = ANY(ARRAY[${sql.join(ids.map(id => sql`${id}`), sql`, `)}]::text[])`);
    return ids.length;
  }

  async bulkAddTags(ids: string[], tags: string[]): Promise<number> {
    if (ids.length === 0 || tags.length === 0) return 0;
    
    for (const id of ids) {
      const existing = await this.getSubscriberById(id);
      if (existing) {
        const currentTags = existing.tags || [];
        const newTags = Array.from(new Set([...currentTags, ...tags]));
        await this.updateSubscriber(id, { tags: newTags });
      }
    }
    return ids.length;
  }

  async unsubscribeByEmail(email: string, reason?: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db
      .update(subscribers)
      .set({ 
        status: 'unsubscribed', 
        unsubscribedAt: new Date(),
        unsubscribeReason: reason,
        updatedAt: new Date() 
      })
      .where(eq(subscribers.email, email.toLowerCase()))
      .returning();
    return subscriber;
  }

  async getSubscriberStats(): Promise<SubscriberStats> {
    const allSubscribers = await db.select().from(subscribers);
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const bySource: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let thisWeek = 0;
    let thisMonth = 0;
    let active = 0;
    let unsubscribed = 0;
    let pending = 0;
    let bounced = 0;
    let complained = 0;
    
    for (const sub of allSubscribers) {
      bySource[sub.source] = (bySource[sub.source] || 0) + 1;
      byStatus[sub.status] = (byStatus[sub.status] || 0) + 1;
      
      if (new Date(sub.createdAt) >= weekAgo) thisWeek++;
      if (new Date(sub.createdAt) >= monthAgo) thisMonth++;
      
      if (sub.status === 'active') active++;
      else if (sub.status === 'unsubscribed') unsubscribed++;
      else if (sub.status === 'pending') pending++;
      else if (sub.status === 'bounced') bounced++;
      else if (sub.status === 'complained') complained++;
    }
    
    return {
      total: allSubscribers.length,
      active,
      unsubscribed,
      pending,
      bounced,
      complained,
      thisWeek,
      thisMonth,
      bySource,
      byStatus,
    };
  }

  async incrementEmailStats(id: string, field: 'sent' | 'opened' | 'clicked'): Promise<Subscriber | undefined> {
    const existing = await this.getSubscriberById(id);
    if (!existing) return undefined;

    const updateData: any = { updatedAt: new Date() };
    if (field === 'sent') {
      updateData.emailsSentCount = existing.emailsSentCount + 1;
      updateData.lastEmailSentAt = new Date();
    } else if (field === 'opened') {
      updateData.emailsOpenedCount = existing.emailsOpenedCount + 1;
    } else if (field === 'clicked') {
      updateData.emailsClickedCount = existing.emailsClickedCount + 1;
    }

    const [subscriber] = await db
      .update(subscribers)
      .set(updateData)
      .where(eq(subscribers.id, id))
      .returning();
    return subscriber;
  }

  async getAllVendorRegistrations(filters?: VendorRegistrationFilters): Promise<VendorRegistrationWithDetails[]> {
    const conditions = [];
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(vendorRegistrations.status, filters.status));
    }
    if (filters?.category && filters.category !== 'all') {
      conditions.push(sql`${filters.category} = ANY(${vendorRegistrations.categories})`);
    }
    if (filters?.city) {
      conditions.push(
        or(
          like(vendorRegistrations.registeredCity, `%${sanitizeLikePattern(filters.city)}%`),
          like(vendorRegistrations.operationalCity, `%${sanitizeLikePattern(filters.city)}%`)
        )
      );
    }
    if (filters?.state) {
      conditions.push(
        or(
          like(vendorRegistrations.registeredState, `%${sanitizeLikePattern(filters.state)}%`),
          like(vendorRegistrations.operationalState, `%${sanitizeLikePattern(filters.state)}%`)
        )
      );
    }
    if (filters?.search) {
      const searchTerm = `%${sanitizeLikePattern(filters.search)}%`;
      conditions.push(
        or(
          like(vendorRegistrations.businessName, searchTerm),
          like(vendorRegistrations.brandName, searchTerm),
          like(vendorRegistrations.contactPersonName, searchTerm),
          like(vendorRegistrations.contactEmail, searchTerm),
          like(vendorRegistrations.contactPhone, searchTerm)
        )
      );
    }
    if (filters?.dateFrom) {
      conditions.push(gte(vendorRegistrations.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(vendorRegistrations.createdAt, filters.dateTo));
    }

    const reviewerAlias = db.select({
      id: users.id,
      name: users.name,
      username: users.username,
    }).from(users).as('reviewer');

    const approverAlias = db.select({
      id: users.id,
      name: users.name,
      username: users.username,
    }).from(users).as('approver');

    const result = await db
      .select({
        registration: vendorRegistrations,
        reviewer: {
          id: sql<string>`reviewer.id`,
          name: sql<string | null>`reviewer.name`,
          username: sql<string>`reviewer.username`,
        },
        approver: {
          id: sql<string>`approver.id`,
          name: sql<string | null>`approver.name`,
          username: sql<string>`approver.username`,
        },
      })
      .from(vendorRegistrations)
      .leftJoin(sql`(SELECT id, name, username FROM users) AS reviewer`, sql`${vendorRegistrations.reviewedBy} = reviewer.id`)
      .leftJoin(sql`(SELECT id, name, username FROM users) AS approver`, sql`${vendorRegistrations.approvedBy} = approver.id`)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(vendorRegistrations.createdAt));

    return result.map(r => ({
      ...r.registration,
      reviewer: r.reviewer?.id ? r.reviewer : null,
      approver: r.approver?.id ? r.approver : null,
    }));
  }

  async getVendorRegistrationById(id: string): Promise<VendorRegistrationWithDetails | undefined> {
    const result = await db
      .select({
        registration: vendorRegistrations,
        reviewer: {
          id: sql<string>`reviewer.id`,
          name: sql<string | null>`reviewer.name`,
          username: sql<string>`reviewer.username`,
        },
        approver: {
          id: sql<string>`approver.id`,
          name: sql<string | null>`approver.name`,
          username: sql<string>`approver.username`,
        },
      })
      .from(vendorRegistrations)
      .leftJoin(sql`(SELECT id, name, username FROM users) AS reviewer`, sql`${vendorRegistrations.reviewedBy} = reviewer.id`)
      .leftJoin(sql`(SELECT id, name, username FROM users) AS approver`, sql`${vendorRegistrations.approvedBy} = approver.id`)
      .where(eq(vendorRegistrations.id, id));

    if (!result[0]) return undefined;

    const documents = await this.getVendorDocuments(id);

    return {
      ...result[0].registration,
      reviewer: result[0].reviewer?.id ? result[0].reviewer : null,
      approver: result[0].approver?.id ? result[0].approver : null,
      documents,
    };
  }

  async createVendorRegistration(registration: InsertVendorRegistration): Promise<VendorRegistration> {
    const registrationData = {
      ...registration,
      insuranceExpiryDate: registration.insuranceExpiryDate ? new Date(registration.insuranceExpiryDate) : null,
    };

    const [result] = await db
      .insert(vendorRegistrations)
      .values(registrationData as any)
      .returning();
    return result;
  }

  async updateVendorRegistration(id: string, data: UpdateVendorRegistration): Promise<VendorRegistration | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.insuranceExpiryDate) {
      updateData.insuranceExpiryDate = new Date(data.insuranceExpiryDate);
    }

    const [result] = await db
      .update(vendorRegistrations)
      .set(updateData)
      .where(eq(vendorRegistrations.id, id))
      .returning();
    return result;
  }

  async deleteVendorRegistration(id: string): Promise<boolean> {
    await db.delete(vendorDocuments).where(eq(vendorDocuments.vendorRegistrationId, id));
    await db.delete(vendorApprovalLogs).where(eq(vendorApprovalLogs.vendorRegistrationId, id));
    await db.delete(vendorRegistrations).where(eq(vendorRegistrations.id, id));
    return true;
  }

  async submitVendorRegistration(id: string): Promise<VendorRegistration | undefined> {
    const [result] = await db
      .update(vendorRegistrations)
      .set({ status: 'submitted', submittedAt: new Date(), updatedAt: new Date() })
      .where(eq(vendorRegistrations.id, id))
      .returning();

    if (result) {
      await this.createVendorApprovalLog({
        vendorRegistrationId: id,
        action: 'submitted',
        fromStatus: 'draft',
        toStatus: 'submitted',
        notes: 'Registration submitted for review',
      });
    }

    return result;
  }

  async approveVendorRegistration(id: string, userId: string, notes?: string): Promise<VendorRegistration | undefined> {
    const existing = await db.select().from(vendorRegistrations).where(eq(vendorRegistrations.id, id));
    if (!existing[0]) return undefined;

    const [result] = await db
      .update(vendorRegistrations)
      .set({
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
        updatedAt: new Date(),
        internalNotes: notes || existing[0].internalNotes,
      })
      .where(eq(vendorRegistrations.id, id))
      .returning();

    if (result) {
      const user = await this.getUser(userId);
      await this.createVendorApprovalLog({
        vendorRegistrationId: id,
        action: 'approved',
        fromStatus: existing[0].status,
        toStatus: 'approved',
        performedBy: userId,
        performedByName: user?.name || user?.username,
        notes,
      });
    }

    return result;
  }

  async rejectVendorRegistration(id: string, userId: string, reason: string, notes?: string): Promise<VendorRegistration | undefined> {
    const existing = await db.select().from(vendorRegistrations).where(eq(vendorRegistrations.id, id));
    if (!existing[0]) return undefined;

    const [result] = await db
      .update(vendorRegistrations)
      .set({
        status: 'rejected',
        rejectionReason: reason,
        rejectionNotes: notes,
        reviewedBy: userId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vendorRegistrations.id, id))
      .returning();

    if (result) {
      const user = await this.getUser(userId);
      await this.createVendorApprovalLog({
        vendorRegistrationId: id,
        action: 'rejected',
        fromStatus: existing[0].status,
        toStatus: 'rejected',
        performedBy: userId,
        performedByName: user?.name || user?.username,
        notes: `Reason: ${reason}. ${notes || ''}`,
      });
    }

    return result;
  }

  async getVendorRegistrationStats(): Promise<VendorRegistrationStats> {
    const allRegistrations = await db.select().from(vendorRegistrations);
    
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let draft = 0;
    let submitted = 0;
    let underReview = 0;
    let approved = 0;
    let rejected = 0;
    
    for (const reg of allRegistrations) {
      byStatus[reg.status] = (byStatus[reg.status] || 0) + 1;
      
      if (reg.categories) {
        for (const cat of reg.categories) {
          byCategory[cat] = (byCategory[cat] || 0) + 1;
        }
      }
      
      if (reg.status === 'draft') draft++;
      else if (reg.status === 'submitted') submitted++;
      else if (reg.status === 'under_review') underReview++;
      else if (reg.status === 'approved') approved++;
      else if (reg.status === 'rejected') rejected++;
    }
    
    return {
      total: allRegistrations.length,
      draft,
      submitted,
      underReview,
      approved,
      rejected,
      byCategory,
      byStatus,
    };
  }

  async getVendorDocuments(vendorRegistrationId: string): Promise<VendorDocument[]> {
    return await db
      .select()
      .from(vendorDocuments)
      .where(eq(vendorDocuments.vendorRegistrationId, vendorRegistrationId))
      .orderBy(asc(vendorDocuments.documentType));
  }

  async createVendorDocument(document: InsertVendorDocument): Promise<VendorDocument> {
    const documentData = {
      ...document,
      issueDate: document.issueDate ? new Date(document.issueDate) : null,
      expiryDate: document.expiryDate ? new Date(document.expiryDate) : null,
    };

    const [result] = await db
      .insert(vendorDocuments)
      .values(documentData as any)
      .returning();
    return result;
  }

  async updateVendorDocument(id: string, data: UpdateVendorDocument): Promise<VendorDocument | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.issueDate) {
      updateData.issueDate = new Date(data.issueDate);
    }
    if (data.expiryDate) {
      updateData.expiryDate = new Date(data.expiryDate);
    }

    const [result] = await db
      .update(vendorDocuments)
      .set(updateData)
      .where(eq(vendorDocuments.id, id))
      .returning();
    return result;
  }

  async deleteVendorDocument(id: string): Promise<boolean> {
    await db.delete(vendorDocuments).where(eq(vendorDocuments.id, id));
    return true;
  }

  async verifyVendorDocument(id: string, userId: string, status: string, notes?: string): Promise<VendorDocument | undefined> {
    const [result] = await db
      .update(vendorDocuments)
      .set({
        verificationStatus: status,
        verifiedBy: userId,
        verifiedAt: new Date(),
        verificationNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(vendorDocuments.id, id))
      .returning();
    return result;
  }

  async getVendorApprovalLogs(vendorRegistrationId: string): Promise<VendorApprovalLog[]> {
    return await db
      .select()
      .from(vendorApprovalLogs)
      .where(eq(vendorApprovalLogs.vendorRegistrationId, vendorRegistrationId))
      .orderBy(desc(vendorApprovalLogs.createdAt));
  }

  async createVendorApprovalLog(log: InsertVendorApprovalLog): Promise<VendorApprovalLog> {
    const [result] = await db
      .insert(vendorApprovalLogs)
      .values(log)
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
