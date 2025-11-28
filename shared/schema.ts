import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoles = ["admin", "staff", "viewer"] as const;
export type UserRole = typeof userRoles[number];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const leadStatuses = ["new", "contacted", "follow-up", "qualified", "converted", "lost"] as const;
export type LeadStatus = typeof leadStatuses[number];

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  date: timestamp("date"),
  guestCount: integer("guest_count"),
  location: text("location"),
  budgetRange: text("budget_range"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  contactMethod: text("contact_method").notNull().default('whatsapp'),
  leadSource: text("lead_source").notNull().default('website'),
  leadMagnet: text("lead_magnet"),
  message: text("message"),
  consentGiven: boolean("consent_given").default(true),
  status: text("status").notNull().default('new'),
  notes: text("notes"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  notes: true,
  assignedTo: true,
}).extend({
  date: z.date().optional().or(z.string().optional()),
  guestCount: z.number().optional(),
  location: z.string().optional(),
  budgetRange: z.string().optional(),
  leadMagnet: z.string().optional(),
  message: z.string().optional(),
  consentGiven: z.boolean().optional(),
});

export const updateLeadSchema = z.object({
  status: z.enum(leadStatuses).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().nullable().optional(),
  eventType: z.string().optional(),
  date: z.date().optional().or(z.string().optional()),
  guestCount: z.number().optional(),
  location: z.string().optional(),
  budgetRange: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  contactMethod: z.string().optional(),
  message: z.string().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull().default(30),
  type: text("type").notNull().default("call"),
  status: text("status").notNull().default("scheduled"),
  reminderSent: boolean("reminder_sent").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reminderSent: true,
}).extend({
  scheduledAt: z.date().or(z.string()),
  duration: z.number().optional(),
});

export const updateAppointmentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  scheduledAt: z.date().or(z.string()).optional(),
  duration: z.number().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().nullable().optional(),
  notes: z.string().optional(),
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  outcome: text("outcome"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export const leadNotes = pgTable("lead_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLeadNoteSchema = createInsertSchema(leadNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLeadNote = z.infer<typeof insertLeadNoteSchema>;
export type LeadNote = typeof leadNotes.$inferSelect;

export const budgetRanges = [
  { value: "under-5l", label: "Under ₹5 Lakhs" },
  { value: "5l-10l", label: "₹5 - 10 Lakhs" },
  { value: "10l-25l", label: "₹10 - 25 Lakhs" },
  { value: "25l-50l", label: "₹25 - 50 Lakhs" },
  { value: "50l-1cr", label: "₹50 Lakhs - 1 Crore" },
  { value: "above-1cr", label: "Above ₹1 Crore" },
  { value: "flexible", label: "Flexible / Not Sure" },
] as const;

export const leadSources = [
  "website",
  "inquiry_form",
  "popup",
  "floating_cta",
  "chatbot",
  "lead_magnet",
  "callback_request",
  "contact_form",
] as const;

export const appointmentTypes = [
  { value: "call", label: "Phone Call" },
  { value: "meeting", label: "In-Person Meeting" },
  { value: "video_call", label: "Video Call" },
  { value: "site_visit", label: "Site Visit" },
] as const;

export const appointmentStatuses = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
] as const;

export const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "social", label: "Social Event" },
  { value: "destination", label: "Destination Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "anniversary", label: "Anniversary" },
  { value: "other", label: "Other" },
] as const;

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio"),
  image: text("image"),
  email: text("email"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  instagram: text("instagram"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export const portfolioItems = pgTable("portfolio_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  location: text("location"),
  date: text("date"),
  client: text("client"),
  images: text("images").array(),
  featuredImage: text("featured_image"),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type PortfolioItem = typeof portfolioItems.$inferSelect;

export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  clientRole: text("client_role"),
  eventType: text("event_type"),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  image: text("image"),
  videoUrl: text("video_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export const careers = pgTable("careers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  experience: text("experience"),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  benefits: text("benefits").array(),
  salary: text("salary"),
  applicationEmail: text("application_email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCareerSchema = createInsertSchema(careers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCareer = z.infer<typeof insertCareerSchema>;
export type Career = typeof careers.$inferSelect;

export const pressArticles = pgTable("press_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  publication: text("publication").notNull(),
  publishedDate: text("published_date"),
  excerpt: text("excerpt"),
  content: text("content"),
  externalUrl: text("external_url"),
  image: text("image"),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPressArticleSchema = createInsertSchema(pressArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPressArticle = z.infer<typeof insertPressArticleSchema>;
export type PressArticle = typeof pressArticles.$inferSelect;

export const pageContent = pgTable("page_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageKey: text("page_key").notNull().unique(),
  title: text("title"),
  subtitle: text("subtitle"),
  content: text("content"),
  heroImage: text("hero_image"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  sections: jsonb("sections"),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPageContentSchema = createInsertSchema(pageContent).omit({
  id: true,
  updatedAt: true,
});

export type InsertPageContent = z.infer<typeof insertPageContentSchema>;
export type PageContent = typeof pageContent.$inferSelect;

export const clientStatuses = ["new", "active", "vip", "inactive"] as const;
export type ClientStatus = typeof clientStatuses[number];

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  status: text("status").notNull().default("new"),
  totalSpent: integer("total_spent").notNull().default(0),
  eventsCount: integer("events_count").notNull().default(0),
  notes: text("notes"),
  tags: text("tags").array(),
  source: text("source"),
  referredBy: varchar("referred_by").references((): any => clients.id),
  lastContactDate: timestamp("last_contact_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalSpent: true,
  eventsCount: true,
});

export const updateClientSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(clientStatuses).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  referredBy: z.string().nullable().optional(),
  lastContactDate: z.date().or(z.string()).optional(),
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type UpdateClient = z.infer<typeof updateClientSchema>;
export type Client = typeof clients.$inferSelect;

export const eventStatuses = ["planning", "confirmed", "in_progress", "completed", "cancelled", "postponed"] as const;
export type EventStatus = typeof eventStatuses[number];

export const paymentStatuses = ["pending", "partial", "paid", "overdue", "refunded"] as const;
export type PaymentStatus = typeof paymentStatuses[number];

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  clientId: varchar("client_id").references(() => clients.id),
  leadId: varchar("lead_id").references(() => leads.id),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  venue: text("venue"),
  venueAddress: text("venue_address"),
  guestCount: integer("guest_count"),
  budget: integer("budget"),
  contractAmount: integer("contract_amount"),
  paidAmount: integer("paid_amount").notNull().default(0),
  paymentStatus: text("payment_status").notNull().default("pending"),
  status: text("status").notNull().default("planning"),
  notes: text("notes"),
  timeline: jsonb("timeline"),
  vendorIds: text("vendor_ids").array(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  paidAmount: true,
}).extend({
  date: z.date().or(z.string()),
  endDate: z.date().or(z.string()).optional(),
});

export const updateEventSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  clientId: z.string().nullable().optional(),
  leadId: z.string().nullable().optional(),
  date: z.date().or(z.string()).optional(),
  endDate: z.date().or(z.string()).nullable().optional(),
  venue: z.string().optional(),
  venueAddress: z.string().optional(),
  guestCount: z.number().optional(),
  budget: z.number().optional(),
  contractAmount: z.number().optional(),
  paidAmount: z.number().optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  status: z.enum(eventStatuses).optional(),
  notes: z.string().optional(),
  timeline: z.any().optional(),
  vendorIds: z.array(z.string()).optional(),
  assignedTo: z.string().nullable().optional(),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;
export type Event = typeof events.$inferSelect;

export const vendorCategories = [
  "florist", "catering", "photography", "videography", "entertainment", 
  "venue", "decor", "lighting", "sound", "transportation", "security",
  "makeup", "mehendi", "invitation", "other"
] as const;
export type VendorCategory = typeof vendorCategories[number];

export const vendorStatuses = ["active", "inactive", "pending", "blacklisted"] as const;
export type VendorStatus = typeof vendorStatuses[number];

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  alternatePhone: text("alternate_phone"),
  address: text("address"),
  city: text("city"),
  website: text("website"),
  rating: integer("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  eventsCompleted: integer("events_completed").notNull().default(0),
  priceRange: text("price_range"),
  description: text("description"),
  services: text("services").array(),
  portfolio: text("portfolio").array(),
  status: text("status").notNull().default("active"),
  contractTerms: text("contract_terms"),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
  eventsCompleted: true,
});

export const updateVendorSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  priceRange: z.string().optional(),
  description: z.string().optional(),
  services: z.array(z.string()).optional(),
  portfolio: z.array(z.string()).optional(),
  status: z.enum(vendorStatuses).optional(),
  contractTerms: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type UpdateVendor = z.infer<typeof updateVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  website: text("website"),
  taxId: text("tax_id"),
  logo: text("logo"),
  currency: text("currency").notNull().default("INR"),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  fiscalYearStart: text("fiscal_year_start").notNull().default("04"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  notifyNewLeads: boolean("notify_new_leads").notNull().default(true),
  notifyAppointments: boolean("notify_appointments").notNull().default(true),
  notifyWeeklyReports: boolean("notify_weekly_reports").notNull().default(false),
  notifyPayments: boolean("notify_payments").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  theme: text("theme").notNull().default("system"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true,
});

export const updateUserSettingsSchema = z.object({
  notifyNewLeads: z.boolean().optional(),
  notifyAppointments: z.boolean().optional(),
  notifyWeeklyReports: z.boolean().optional(),
  notifyPayments: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  theme: z.string().optional(),
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
