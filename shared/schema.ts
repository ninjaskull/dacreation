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

// Password validation: minimum 8 chars, at least one uppercase, lowercase, number, and special char
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  role: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be at most 50 characters"),
  password: passwordSchema,
  email: z.string().email("Invalid email format").optional().nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const updateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be at most 50 characters").optional(),
  password: passwordSchema.optional(),
  name: z.string().nullable().optional(),
  email: z.string().email("Invalid email format").nullable().optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(userRoles).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUser = z.infer<typeof updateUserSchema>;

export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

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
  referredBy: varchar("referred_by").references(() => clients.id, { onDelete: "set null" }),
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
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  website: text("website"),
  taxId: text("tax_id"),
  logo: text("logo"),
  logoWhite: text("logo_white"),
  currency: text("currency").notNull().default("INR"),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  fiscalYearStart: text("fiscal_year_start").notNull().default("04"),
  whatsappNumber: text("whatsapp_number"),
  mapEmbedCode: text("map_embed_code"),
  topBarAddress: text("top_bar_address"),
  secondaryAddress: text("secondary_address"),
  socialMedia: jsonb("social_media").default(sql`'[]'`),
  numberOfEventsHeld: integer("number_of_events_held").default(0),
  ratings: text("ratings").default("0"),
  weddingsCount: integer("weddings_count").default(0),
  corporateCount: integer("corporate_count").default(0),
  socialCount: integer("social_count").default(0),
  awardsCount: integer("awards_count").default(0),
  destinationsCount: integer("destinations_count").default(0),
  happyGuestsCount: integer("happy_guests_count").default(0),
  clientSatisfaction: integer("client_satisfaction").default(0),
  showPreferredBy: boolean("show_preferred_by").notNull().default(true),
  showTrustedBy: boolean("show_trusted_by").notNull().default(true),
  tagline: text("tagline"),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  foundedYear: integer("founded_year"),
  teamMembersCount: integer("team_members_count"),
  businessHoursWeekdays: text("business_hours_weekdays"),
  businessHoursSunday: text("business_hours_sunday"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  primaryColor: text("primary_color"),
  primaryColorDark: text("primary_color_dark"),
  primaryColorLight: text("primary_color_light"),
  secondaryColor: text("secondary_color"),
  accentColor: text("accent_color"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
}).extend({
  name: z.string().optional(),
  socialMedia: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    icon: z.string().optional(),
  })).optional(),
  numberOfEventsHeld: z.number().optional(),
  ratings: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  weddingsCount: z.number().optional(),
  corporateCount: z.number().optional(),
  socialCount: z.number().optional(),
  awardsCount: z.number().optional(),
  destinationsCount: z.number().optional(),
  happyGuestsCount: z.number().optional(),
  clientSatisfaction: z.number().optional(),
  showPreferredBy: z.boolean().optional(),
  showTrustedBy: z.boolean().optional(),
  tagline: z.string().optional(),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  foundedYear: z.number().optional(),
  teamMembersCount: z.number().optional(),
  businessHoursWeekdays: z.string().optional(),
  businessHoursSunday: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  primaryColor: z.string().optional(),
  primaryColorDark: z.string().optional(),
  primaryColorLight: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
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

export const invoiceStatuses = ["draft", "sent", "viewed", "paid", "partially_paid", "overdue", "cancelled", "refunded"] as const;
export type InvoiceStatus = typeof invoiceStatuses[number];

export const invoiceTemplates = pgTable("invoice_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  layout: text("layout").notNull().default("modern"),
  primaryColor: text("primary_color").notNull().default("#3B82F6"),
  secondaryColor: text("secondary_color").notNull().default("#1E40AF"),
  accentColor: text("accent_color").notNull().default("#60A5FA"),
  fontFamily: text("font_family").notNull().default("Inter"),
  logoUrl: text("logo_url"),
  companyName: text("company_name"),
  companyAddress: text("company_address"),
  companyPhone: text("company_phone"),
  companyEmail: text("company_email"),
  companyWebsite: text("company_website"),
  companyGst: text("company_gst"),
  companyPan: text("company_pan"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: text("bank_ifsc"),
  bankBranch: text("bank_branch"),
  upiId: text("upi_id"),
  headerText: text("header_text"),
  footerText: text("footer_text"),
  termsAndConditions: text("terms_and_conditions"),
  notes: text("notes"),
  showLogo: boolean("show_logo").notNull().default(true),
  showGst: boolean("show_gst").notNull().default(true),
  showBankDetails: boolean("show_bank_details").notNull().default(true),
  showUpi: boolean("show_upi").notNull().default(true),
  showSignature: boolean("show_signature").notNull().default(true),
  signatureUrl: text("signature_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInvoiceTemplateSchema = createInsertSchema(invoiceTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateInvoiceTemplateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  layout: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
  logoUrl: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().optional(),
  companyWebsite: z.string().optional(),
  companyGst: z.string().optional(),
  companyPan: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankBranch: z.string().optional(),
  upiId: z.string().optional(),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  termsAndConditions: z.string().optional(),
  notes: z.string().optional(),
  showLogo: z.boolean().optional(),
  showGst: z.boolean().optional(),
  showBankDetails: z.boolean().optional(),
  showUpi: z.boolean().optional(),
  showSignature: z.boolean().optional(),
  signatureUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type InsertInvoiceTemplate = z.infer<typeof insertInvoiceTemplateSchema>;
export type UpdateInvoiceTemplate = z.infer<typeof updateInvoiceTemplateSchema>;
export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  templateId: varchar("template_id").references(() => invoiceTemplates.id),
  clientId: varchar("client_id").references(() => clients.id),
  eventId: varchar("event_id").references(() => events.id),
  title: text("title").notNull(),
  description: text("description"),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("draft"),
  subtotal: integer("subtotal").notNull().default(0),
  discountType: text("discount_type").default("percentage"),
  discountValue: integer("discount_value").default(0),
  discountAmount: integer("discount_amount").default(0),
  taxType: text("tax_type").default("gst"),
  cgstRate: integer("cgst_rate").default(9),
  sgstRate: integer("sgst_rate").default(9),
  igstRate: integer("igst_rate").default(18),
  cgstAmount: integer("cgst_amount").default(0),
  sgstAmount: integer("sgst_amount").default(0),
  igstAmount: integer("igst_amount").default(0),
  totalTax: integer("total_tax").default(0),
  totalAmount: integer("total_amount").notNull().default(0),
  paidAmount: integer("paid_amount").notNull().default(0),
  balanceDue: integer("balance_due").notNull().default(0),
  currency: text("currency").notNull().default("INR"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  termsAndConditions: text("terms_and_conditions"),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  clientAddress: text("client_address"),
  clientGst: text("client_gst"),
  billingAddress: text("billing_address"),
  shippingAddress: text("shipping_address"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  paidAt: timestamp("paid_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  viewedAt: true,
  paidAt: true,
  cancelledAt: true,
}).extend({
  issueDate: z.date().or(z.string()),
  dueDate: z.date().or(z.string()),
});

export const updateInvoiceSchema = z.object({
  templateId: z.string().optional(),
  clientId: z.string().nullable().optional(),
  eventId: z.string().nullable().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  issueDate: z.date().or(z.string()).optional(),
  dueDate: z.date().or(z.string()).optional(),
  status: z.enum(invoiceStatuses).optional(),
  subtotal: z.number().optional(),
  discountType: z.string().optional(),
  discountValue: z.number().optional(),
  discountAmount: z.number().optional(),
  taxType: z.string().optional(),
  cgstRate: z.number().optional(),
  sgstRate: z.number().optional(),
  igstRate: z.number().optional(),
  cgstAmount: z.number().optional(),
  sgstAmount: z.number().optional(),
  igstAmount: z.number().optional(),
  totalTax: z.number().optional(),
  totalAmount: z.number().optional(),
  paidAmount: z.number().optional(),
  balanceDue: z.number().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  clientGst: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  cancelReason: z.string().optional(),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof updateInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  unit: text("unit").default("unit"),
  unitPrice: integer("unit_price").notNull().default(0),
  discount: integer("discount").default(0),
  taxable: boolean("taxable").notNull().default(true),
  hsnCode: text("hsn_code"),
  sacCode: text("sac_code"),
  amount: integer("amount").notNull().default(0),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  createdAt: true,
});

export const updateInvoiceItemSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  unitPrice: z.number().optional(),
  discount: z.number().optional(),
  taxable: z.boolean().optional(),
  hsnCode: z.string().optional(),
  sacCode: z.string().optional(),
  amount: z.number().optional(),
  displayOrder: z.number().optional(),
});

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type UpdateInvoiceItem = z.infer<typeof updateInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

export const invoicePayments = pgTable("invoice_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  amount: integer("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  paymentMethod: text("payment_method").notNull().default("bank_transfer"),
  transactionId: text("transaction_id"),
  notes: text("notes"),
  receivedBy: varchar("received_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvoicePaymentSchema = createInsertSchema(invoicePayments).omit({
  id: true,
  createdAt: true,
}).extend({
  paymentDate: z.date().or(z.string()),
});

export type InsertInvoicePayment = z.infer<typeof insertInvoicePaymentSchema>;
export type InvoicePayment = typeof invoicePayments.$inferSelect;

export const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "net_banking", label: "Net Banking" },
  { value: "other", label: "Other" },
] as const;

export const invoiceLayouts = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "professional", label: "Professional" },
  { value: "elegant", label: "Elegant" },
] as const;

// Callback Requests Schema
export const callbackRequestStatuses = ["pending", "called", "no_answer", "scheduled", "completed", "cancelled"] as const;
export type CallbackRequestStatus = typeof callbackRequestStatuses[number];

export const callbackRequests = pgTable("callback_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  eventType: text("event_type"),
  message: text("message"),
  source: text("source").notNull().default("floating_cta"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("normal"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  notes: text("notes"),
  calledAt: timestamp("called_at"),
  scheduledCallAt: timestamp("scheduled_call_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCallbackRequestSchema = createInsertSchema(callbackRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  assignedTo: true,
  notes: true,
  calledAt: true,
  scheduledCallAt: true,
});

export const updateCallbackRequestSchema = z.object({
  status: z.enum(callbackRequestStatuses).optional(),
  priority: z.string().optional(),
  assignedTo: z.string().nullable().optional(),
  notes: z.string().optional(),
  calledAt: z.date().or(z.string()).optional(),
  scheduledCallAt: z.date().or(z.string()).nullable().optional(),
});

export type InsertCallbackRequest = z.infer<typeof insertCallbackRequestSchema>;
export type UpdateCallbackRequest = z.infer<typeof updateCallbackRequestSchema>;
export type CallbackRequest = typeof callbackRequests.$inferSelect;

// Agent Status Schema
export const agentStatusTypes = ["online", "away", "offline"] as const;
export type AgentStatusType = typeof agentStatusTypes[number];

export const agentStatus = pgTable("agent_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  status: text("status").notNull().default("offline"),
  statusMessage: text("status_message"),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
  activeConversations: integer("active_conversations").notNull().default(0),
  maxConversations: integer("max_conversations").notNull().default(5),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgentStatusSchema = createInsertSchema(agentStatus).omit({
  id: true,
  updatedAt: true,
  lastActiveAt: true,
  activeConversations: true,
});

export const updateAgentStatusSchema = z.object({
  status: z.enum(agentStatusTypes).optional(),
  statusMessage: z.string().nullable().optional(),
  maxConversations: z.number().min(1).max(20).optional(),
});

export type InsertAgentStatus = z.infer<typeof insertAgentStatusSchema>;
export type UpdateAgentStatus = z.infer<typeof updateAgentStatusSchema>;
export type AgentStatus = typeof agentStatus.$inferSelect;

// Chat Conversations Schema
export const conversationStatuses = ["active", "waiting", "live_agent", "resolved", "closed"] as const;
export type ConversationStatus = typeof conversationStatuses[number];

export const conversationPhases = ["collecting", "submitted", "live", "ended"] as const;
export type ConversationPhase = typeof conversationPhases[number];

export const conversationPriorities = ["low", "normal", "high", "urgent"] as const;
export type ConversationPriority = typeof conversationPriorities[number];

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorId: text("visitor_id").notNull(),
  visitorName: text("visitor_name"),
  visitorPhone: text("visitor_phone"),
  visitorEmail: text("visitor_email"),
  eventType: text("event_type"),
  eventDate: text("event_date"),
  eventLocation: text("event_location"),
  budgetRange: text("budget_range"),
  guestCount: integer("guest_count"),
  leadId: varchar("lead_id").references(() => leads.id),
  phase: text("phase").notNull().default("collecting"),
  status: text("status").notNull().default("active"),
  priority: text("priority").notNull().default("normal"),
  wantsLiveAgent: boolean("wants_live_agent").notNull().default(false),
  liveAgentRequestedAt: timestamp("live_agent_requested_at"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  unreadCount: integer("unread_count").notNull().default(0),
  firstResponseTime: integer("first_response_time"),
  avgResponseTime: integer("avg_response_time"),
  totalMessages: integer("total_messages").notNull().default(0),
  visitorRating: integer("visitor_rating"),
  visitorFeedback: text("visitor_feedback"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  assignedTo: true,
  unreadCount: true,
  wantsLiveAgent: true,
  liveAgentRequestedAt: true,
}).extend({
  lastMessageAt: z.date().or(z.string()).optional(),
});

export const updateConversationSchema = z.object({
  visitorName: z.string().optional(),
  visitorPhone: z.string().optional(),
  visitorEmail: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  budgetRange: z.string().optional(),
  guestCount: z.number().optional(),
  leadId: z.string().nullable().optional(),
  phase: z.enum(conversationPhases).optional(),
  status: z.enum(conversationStatuses).optional(),
  priority: z.enum(conversationPriorities).optional(),
  wantsLiveAgent: z.boolean().optional(),
  liveAgentRequestedAt: z.date().or(z.string()).nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  unreadCount: z.number().optional(),
  lastMessageAt: z.date().or(z.string()).optional(),
  firstResponseTime: z.number().optional(),
  avgResponseTime: z.number().optional(),
  totalMessages: z.number().optional(),
  visitorRating: z.number().min(1).max(5).optional(),
  visitorFeedback: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type UpdateConversation = z.infer<typeof updateConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Chat Messages Schema
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  senderId: text("sender_id").notNull(),
  senderType: text("sender_type").notNull().default("visitor"),
  senderName: text("sender_name"),
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"),
  isRead: boolean("is_read").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export const senderTypes = ["visitor", "admin", "system"] as const;
export type SenderType = typeof senderTypes[number];

export const messageTypes = ["text", "image", "file", "system"] as const;
export type MessageType = typeof messageTypes[number];

// SMTP Settings Schema
export const encryptionTypes = ["none", "tls", "ssl"] as const;
export type EncryptionType = typeof encryptionTypes[number];

export const smtpSettings = pgTable("smtp_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  host: text("host").notNull(),
  port: integer("port").notNull().default(587),
  encryption: text("encryption").notNull().default("tls"),
  username: text("username").notNull(),
  password: text("password").notNull(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastTestedAt: timestamp("last_tested_at"),
  lastTestResult: text("last_test_result"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSmtpSettingsSchema = createInsertSchema(smtpSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastTestedAt: true,
  lastTestResult: true,
}).extend({
  encryption: z.enum(encryptionTypes),
  port: z.number().min(1).max(65535),
});

export const updateSmtpSettingsSchema = z.object({
  host: z.string().optional(),
  port: z.number().min(1).max(65535).optional(),
  encryption: z.enum(encryptionTypes).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export type InsertSmtpSettings = z.infer<typeof insertSmtpSettingsSchema>;
export type UpdateSmtpSettings = z.infer<typeof updateSmtpSettingsSchema>;
export type SmtpSettings = typeof smtpSettings.$inferSelect;

// Email Type Settings Schema
export const emailTypeSettings = pgTable("email_type_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  transactionalEnabled: boolean("transactional_enabled").notNull().default(true),
  internalEnabled: boolean("internal_enabled").notNull().default(true),
  marketingEnabled: boolean("marketing_enabled").notNull().default(false),
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmailTypeSettingsSchema = createInsertSchema(emailTypeSettings).omit({
  id: true,
  updatedAt: true,
});

export const updateEmailTypeSettingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  transactionalEnabled: z.boolean().optional(),
  internalEnabled: z.boolean().optional(),
  marketingEnabled: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
});

export type InsertEmailTypeSettings = z.infer<typeof insertEmailTypeSettingsSchema>;
export type UpdateEmailTypeSettings = z.infer<typeof updateEmailTypeSettingsSchema>;
export type EmailTypeSettings = typeof emailTypeSettings.$inferSelect;

// Email Templates Schema
export const emailTemplateTypes = ["notification", "transactional", "internal", "marketing", "reminder"] as const;
export type EmailTemplateType = typeof emailTemplateTypes[number];

export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  templateKey: text("template_key").notNull().unique(),
  type: text("type").notNull().default("notification"),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  designerData: text("designer_data"),
  variables: text("variables").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(emailTemplateTypes),
  variables: z.array(z.string()).optional(),
  designerData: z.string().optional(),
});

export const updateEmailTemplateSchema = z.object({
  name: z.string().optional(),
  templateKey: z.string().optional(),
  type: z.enum(emailTemplateTypes).optional(),
  subject: z.string().optional(),
  htmlContent: z.string().optional(),
  textContent: z.string().optional(),
  designerData: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type UpdateEmailTemplate = z.infer<typeof updateEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

// Email Logs Schema for tracking sent emails
export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name"),
  subject: text("subject").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  status: true,
  errorMessage: true,
});

export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;

// Blog Posts Schema
export const blogPostStatuses = ["draft", "published", "archived"] as const;
export type BlogPostStatus = typeof blogPostStatuses[number];

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  author: text("author"),
  category: text("category"),
  tags: text("tags").array(),
  status: text("status").notNull().default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
}).extend({
  publishedAt: z.date().or(z.string()).nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateBlogPostSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().nullable().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(blogPostStatuses).optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  publishedAt: z.date().or(z.string()).nullable().optional(),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof updateBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Newsletter Subscribers Schema
export const subscriberStatuses = ["active", "unsubscribed", "bounced", "complained", "pending"] as const;
export type SubscriberStatus = typeof subscriberStatuses[number];

export const subscriberSources = ["footer", "popup", "lead_magnet", "import", "manual", "api"] as const;
export type SubscriberSource = typeof subscriberSources[number];

export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  status: text("status").notNull().default("active"),
  source: text("source").notNull().default("footer"),
  tags: text("tags").array(),
  preferences: jsonb("preferences"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  confirmationToken: text("confirmation_token"),
  confirmedAt: timestamp("confirmed_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  unsubscribeReason: text("unsubscribe_reason"),
  bouncedAt: timestamp("bounced_at"),
  bounceType: text("bounce_type"),
  complainedAt: timestamp("complained_at"),
  lastEmailSentAt: timestamp("last_email_sent_at"),
  emailsSentCount: integer("emails_sent_count").notNull().default(0),
  emailsOpenedCount: integer("emails_opened_count").notNull().default(0),
  emailsClickedCount: integer("emails_clicked_count").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  confirmedAt: true,
  unsubscribedAt: true,
  bouncedAt: true,
  complainedAt: true,
  lastEmailSentAt: true,
  emailsSentCount: true,
  emailsOpenedCount: true,
  emailsClickedCount: true,
}).extend({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  status: z.enum(subscriberStatuses).optional(),
  source: z.enum(subscriberSources).optional(),
  tags: z.array(z.string()).optional(),
  preferences: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  confirmationToken: z.string().optional(),
  metadata: z.any().optional(),
});

export const updateSubscriberSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  status: z.enum(subscriberStatuses).optional(),
  tags: z.array(z.string()).optional(),
  preferences: z.any().optional(),
  unsubscribeReason: z.string().optional(),
  bounceType: z.string().optional(),
  metadata: z.any().optional(),
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type UpdateSubscriber = z.infer<typeof updateSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

// ==================== VENDOR MANAGEMENT SYSTEM ====================

// Vendor Categories for Indian Event Market
export const vendorCategoryTypes = [
  "catering",
  "decoration",
  "photography",
  "videography",
  "venue",
  "florist",
  "mehendi",
  "makeup",
  "entertainment",
  "dj",
  "band",
  "choreographer",
  "lighting",
  "sound",
  "tent_house",
  "invitation_cards",
  "transportation",
  "security",
  "hospitality",
  "pandit_priest",
  "wedding_planner",
  "anchor_emcee",
  "fireworks",
  "destination_services",
  "travel_agent",
  "hotel_accommodation",
  "jewellery",
  "bridal_wear",
  "groom_wear",
  "gifting",
  "other"
] as const;
export type VendorCategoryType = typeof vendorCategoryTypes[number];

// Business Entity Types (India)
export const businessEntityTypes = [
  "sole_proprietor",
  "partnership",
  "llp",
  "private_limited",
  "public_limited",
  "opc",
  "huf",
  "trust",
  "society",
  "other"
] as const;
export type BusinessEntityType = typeof businessEntityTypes[number];

// Vendor Registration Statuses
export const vendorRegistrationStatuses = [
  "draft",
  "submitted",
  "under_review",
  "documents_pending",
  "verification_pending",
  "approved",
  "rejected",
  "suspended",
  "blacklisted"
] as const;
export type VendorRegistrationStatus = typeof vendorRegistrationStatuses[number];

// Vendor Document Types
export const vendorDocumentTypes = [
  "pan_card",
  "gst_certificate",
  "msme_certificate",
  "incorporation_certificate",
  "partnership_deed",
  "llp_agreement",
  "trade_license",
  "fssai_license",
  "fire_safety_certificate",
  "pollution_certificate",
  "shop_establishment",
  "cancelled_cheque",
  "bank_letter",
  "liability_insurance",
  "company_profile",
  "portfolio",
  "price_list",
  "reference_letter",
  "other"
] as const;
export type VendorDocumentType = typeof vendorDocumentTypes[number];

// Document Verification Statuses
export const documentVerificationStatuses = [
  "pending",
  "verified",
  "rejected",
  "expired"
] as const;
export type DocumentVerificationStatus = typeof documentVerificationStatuses[number];

// Vendor Registration Table (Comprehensive for Indian Market)
export const vendorRegistrations = pgTable("vendor_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic Business Information
  businessName: text("business_name").notNull(),
  brandName: text("brand_name"),
  entityType: text("entity_type").notNull(),
  yearEstablished: integer("year_established"),
  employeeCount: text("employee_count"),
  annualTurnover: text("annual_turnover"),
  
  // Indian Statutory Information
  panNumber: text("pan_number"),
  gstNumber: text("gst_number"),
  gstState: text("gst_state"),
  msmeNumber: text("msme_number"),
  udyamNumber: text("udyam_number"),
  cinNumber: text("cin_number"),
  fssaiNumber: text("fssai_number"),
  
  // Primary Contact Information
  contactPersonName: text("contact_person_name").notNull(),
  contactPersonDesignation: text("contact_person_designation"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactWhatsapp: text("contact_whatsapp"),
  
  // Secondary Contact
  secondaryContactName: text("secondary_contact_name"),
  secondaryContactPhone: text("secondary_contact_phone"),
  secondaryContactEmail: text("secondary_contact_email"),
  
  // Escalation Contact
  escalationContactName: text("escalation_contact_name"),
  escalationContactPhone: text("escalation_contact_phone"),
  
  // Address Information
  registeredAddress: text("registered_address"),
  registeredCity: text("registered_city"),
  registeredState: text("registered_state"),
  registeredPincode: text("registered_pincode"),
  operationalAddress: text("operational_address"),
  operationalCity: text("operational_city"),
  operationalState: text("operational_state"),
  operationalPincode: text("operational_pincode"),
  
  // Service Information
  categories: text("categories").array(),
  primaryCategory: text("primary_category"),
  serviceDescription: text("service_description"),
  specializations: text("specializations").array(),
  serviceAreas: text("service_areas").array(),
  serviceCities: text("service_cities").array(),
  serviceStates: text("service_states").array(),
  panIndiaService: boolean("pan_india_service").default(false),
  internationalService: boolean("international_service").default(false),
  internationalLocations: text("international_locations").array(),
  
  // Capacity & Capabilities
  minimumGuestCapacity: integer("minimum_guest_capacity"),
  maximumGuestCapacity: integer("maximum_guest_capacity"),
  eventsPerMonth: integer("events_per_month"),
  staffStrength: integer("staff_strength"),
  equipmentOwned: boolean("equipment_owned").default(true),
  equipmentDetails: text("equipment_details"),
  
  // Pricing Information
  minimumBudget: integer("minimum_budget"),
  averageEventValue: integer("average_event_value"),
  pricingTier: text("pricing_tier"),
  paymentTerms: text("payment_terms"),
  advancePercentage: integer("advance_percentage"),
  acceptsOnlinePayment: boolean("accepts_online_payment").default(true),
  acceptedPaymentModes: text("accepted_payment_modes").array(),
  
  // Banking Information
  bankName: text("bank_name"),
  bankBranch: text("bank_branch"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  accountHolderName: text("account_holder_name"),
  upiId: text("upi_id"),
  
  // Experience & Portfolio
  yearsInBusiness: integer("years_in_business"),
  eventsCompleted: integer("events_completed"),
  majorClients: text("major_clients").array(),
  portfolioLinks: text("portfolio_links").array(),
  websiteUrl: text("website_url"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  youtubeUrl: text("youtube_url"),
  
  // Certifications & Compliance
  hasLiabilityInsurance: boolean("has_liability_insurance").default(false),
  insuranceCoverage: integer("insurance_coverage"),
  insuranceExpiryDate: timestamp("insurance_expiry_date"),
  hasFireSafetyCertificate: boolean("has_fire_safety_certificate").default(false),
  hasPollutionCertificate: boolean("has_pollution_certificate").default(false),
  
  // Declarations & Agreements
  hasNoPendingLitigation: boolean("has_no_pending_litigation").default(true),
  hasNeverBlacklisted: boolean("has_never_blacklisted").default(true),
  declarationNotes: text("declaration_notes"),
  agreesToTerms: boolean("agrees_to_terms").default(false),
  agreesToNda: boolean("agrees_to_nda").default(false),
  agreesToExclusivity: boolean("agrees_to_exclusivity").default(false),
  
  // Registration Status & Workflow
  status: text("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  rejectionNotes: text("rejection_notes"),
  
  // Internal Notes & Ratings
  internalNotes: text("internal_notes"),
  internalRating: integer("internal_rating"),
  verificationScore: integer("verification_score"),
  riskLevel: text("risk_level"),
  
  // Converted Vendor Reference
  vendorId: varchar("vendor_id").references(() => vendors.id),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVendorRegistrationSchema = createInsertSchema(vendorRegistrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
  reviewedBy: true,
  reviewedAt: true,
  approvedBy: true,
  approvedAt: true,
  vendorId: true,
  verificationScore: true,
}).extend({
  businessName: z.string().min(2, "Business name is required"),
  entityType: z.enum(businessEntityTypes),
  contactPersonName: z.string().min(2, "Contact person name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal("")),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format").optional().or(z.literal("")),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  primaryCategory: z.enum(vendorCategoryTypes).optional(),
  insuranceExpiryDate: z.date().or(z.string()).optional(),
});

export const updateVendorRegistrationSchema = z.object({
  businessName: z.string().optional(),
  brandName: z.string().optional(),
  entityType: z.enum(businessEntityTypes).optional(),
  yearEstablished: z.number().optional(),
  employeeCount: z.string().optional(),
  annualTurnover: z.string().optional(),
  panNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  gstState: z.string().optional(),
  msmeNumber: z.string().optional(),
  udyamNumber: z.string().optional(),
  cinNumber: z.string().optional(),
  fssaiNumber: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonDesignation: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  secondaryContactName: z.string().optional(),
  secondaryContactPhone: z.string().optional(),
  secondaryContactEmail: z.string().optional(),
  escalationContactName: z.string().optional(),
  escalationContactPhone: z.string().optional(),
  registeredAddress: z.string().optional(),
  registeredCity: z.string().optional(),
  registeredState: z.string().optional(),
  registeredPincode: z.string().optional(),
  operationalAddress: z.string().optional(),
  operationalCity: z.string().optional(),
  operationalState: z.string().optional(),
  operationalPincode: z.string().optional(),
  categories: z.array(z.string()).optional(),
  primaryCategory: z.string().optional(),
  serviceDescription: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
  serviceCities: z.array(z.string()).optional(),
  serviceStates: z.array(z.string()).optional(),
  panIndiaService: z.boolean().optional(),
  internationalService: z.boolean().optional(),
  internationalLocations: z.array(z.string()).optional(),
  minimumGuestCapacity: z.number().optional(),
  maximumGuestCapacity: z.number().optional(),
  eventsPerMonth: z.number().optional(),
  staffStrength: z.number().optional(),
  equipmentOwned: z.boolean().optional(),
  equipmentDetails: z.string().optional(),
  minimumBudget: z.number().optional(),
  averageEventValue: z.number().optional(),
  pricingTier: z.string().optional(),
  paymentTerms: z.string().optional(),
  advancePercentage: z.number().optional(),
  acceptsOnlinePayment: z.boolean().optional(),
  acceptedPaymentModes: z.array(z.string()).optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  accountHolderName: z.string().optional(),
  upiId: z.string().optional(),
  yearsInBusiness: z.number().optional(),
  eventsCompleted: z.number().optional(),
  majorClients: z.array(z.string()).optional(),
  portfolioLinks: z.array(z.string()).optional(),
  websiteUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  hasLiabilityInsurance: z.boolean().optional(),
  insuranceCoverage: z.number().optional(),
  insuranceExpiryDate: z.date().or(z.string()).nullable().optional(),
  hasFireSafetyCertificate: z.boolean().optional(),
  hasPollutionCertificate: z.boolean().optional(),
  hasNoPendingLitigation: z.boolean().optional(),
  hasNeverBlacklisted: z.boolean().optional(),
  declarationNotes: z.string().optional(),
  agreesToTerms: z.boolean().optional(),
  agreesToNda: z.boolean().optional(),
  agreesToExclusivity: z.boolean().optional(),
  status: z.enum(vendorRegistrationStatuses).optional(),
  internalNotes: z.string().optional(),
  internalRating: z.number().min(1).max(5).optional(),
  riskLevel: z.string().optional(),
  rejectionReason: z.string().optional(),
  rejectionNotes: z.string().optional(),
});

export type InsertVendorRegistration = z.infer<typeof insertVendorRegistrationSchema>;
export type UpdateVendorRegistration = z.infer<typeof updateVendorRegistrationSchema>;
export type VendorRegistration = typeof vendorRegistrations.$inferSelect;

// Vendor Documents Table
export const vendorDocuments = pgTable("vendor_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorRegistrationId: varchar("vendor_registration_id").references(() => vendorRegistrations.id).notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  documentType: text("document_type").notNull(),
  documentName: text("document_name").notNull(),
  documentNumber: text("document_number"),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  issuingAuthority: text("issuing_authority"),
  verificationStatus: text("verification_status").notNull().default("pending"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  verificationNotes: text("verification_notes"),
  rejectionReason: text("rejection_reason"),
  isRequired: boolean("is_required").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVendorDocumentSchema = createInsertSchema(vendorDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedBy: true,
  verifiedAt: true,
}).extend({
  documentType: z.enum(vendorDocumentTypes),
  issueDate: z.date().or(z.string()).optional(),
  expiryDate: z.date().or(z.string()).optional(),
});

export const updateVendorDocumentSchema = z.object({
  documentName: z.string().optional(),
  documentNumber: z.string().optional(),
  fileUrl: z.string().optional(),
  issueDate: z.date().or(z.string()).optional(),
  expiryDate: z.date().or(z.string()).optional(),
  issuingAuthority: z.string().optional(),
  verificationStatus: z.enum(documentVerificationStatuses).optional(),
  verificationNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type InsertVendorDocument = z.infer<typeof insertVendorDocumentSchema>;
export type UpdateVendorDocument = z.infer<typeof updateVendorDocumentSchema>;
export type VendorDocument = typeof vendorDocuments.$inferSelect;

// Vendor Approval Workflow Logs
export const vendorApprovalLogs = pgTable("vendor_approval_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorRegistrationId: varchar("vendor_registration_id").references(() => vendorRegistrations.id).notNull(),
  action: text("action").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  performedBy: varchar("performed_by").references(() => users.id),
  performedByName: text("performed_by_name"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVendorApprovalLogSchema = createInsertSchema(vendorApprovalLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertVendorApprovalLog = z.infer<typeof insertVendorApprovalLogSchema>;
export type VendorApprovalLog = typeof vendorApprovalLogs.$inferSelect;

// Vendor Service Offerings / Rate Cards
export const vendorServiceOfferings = pgTable("vendor_service_offerings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  serviceName: text("service_name").notNull(),
  serviceCategory: text("service_category"),
  description: text("description"),
  basePrice: integer("base_price"),
  maxPrice: integer("max_price"),
  priceUnit: text("price_unit"),
  minimumOrder: text("minimum_order"),
  deliveryTime: text("delivery_time"),
  inclusions: text("inclusions").array(),
  exclusions: text("exclusions").array(),
  terms: text("terms"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVendorServiceOfferingSchema = createInsertSchema(vendorServiceOfferings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVendorServiceOffering = z.infer<typeof insertVendorServiceOfferingSchema>;
export type VendorServiceOffering = typeof vendorServiceOfferings.$inferSelect;

// Vendor Performance Reviews
export const vendorPerformanceReviews = pgTable("vendor_performance_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  eventId: varchar("event_id").references(() => events.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  qualityRating: integer("quality_rating"),
  punctualityRating: integer("punctuality_rating"),
  communicationRating: integer("communication_rating"),
  valueRating: integer("value_rating"),
  overallRating: integer("overall_rating"),
  strengths: text("strengths"),
  improvements: text("improvements"),
  internalNotes: text("internal_notes"),
  wouldRecommend: boolean("would_recommend").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVendorPerformanceReviewSchema = createInsertSchema(vendorPerformanceReviews).omit({
  id: true,
  createdAt: true,
});

export type InsertVendorPerformanceReview = z.infer<typeof insertVendorPerformanceReviewSchema>;
export type VendorPerformanceReview = typeof vendorPerformanceReviews.$inferSelect;

// Helper arrays for UI dropdowns
export const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
  "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
] as const;

export const pricingTiers = [
  { value: "budget", label: "Budget (Under ₹50,000)" },
  { value: "economy", label: "Economy (₹50,000 - ₹2 Lakhs)" },
  { value: "mid_range", label: "Mid-Range (₹2 - 5 Lakhs)" },
  { value: "premium", label: "Premium (₹5 - 15 Lakhs)" },
  { value: "luxury", label: "Luxury (₹15 - 50 Lakhs)" },
  { value: "ultra_luxury", label: "Ultra Luxury (Above ₹50 Lakhs)" },
] as const;

export const vendorCategoryLabels: Record<string, string> = {
  catering: "Catering & Food Services",
  decoration: "Decoration & Event Styling",
  photography: "Photography",
  videography: "Videography & Films",
  venue: "Venue & Banquet Hall",
  florist: "Florist & Floral Design",
  mehendi: "Mehendi Artist",
  makeup: "Makeup & Hair Styling",
  entertainment: "Entertainment & Artists",
  dj: "DJ & Music",
  band: "Band & Orchestra",
  choreographer: "Choreographer & Dance",
  lighting: "Lighting & Effects",
  sound: "Sound & Audio",
  tent_house: "Tent House & Furniture",
  invitation_cards: "Invitation Cards & Printing",
  transportation: "Transportation & Logistics",
  security: "Security Services",
  hospitality: "Hospitality & Guest Management",
  pandit_priest: "Pandit / Priest Services",
  wedding_planner: "Wedding Planner",
  anchor_emcee: "Anchor / Emcee",
  fireworks: "Fireworks & Pyrotechnics",
  destination_services: "Destination Event Services",
  travel_agent: "Travel Agent",
  hotel_accommodation: "Hotel & Accommodation",
  jewellery: "Jewellery & Accessories",
  bridal_wear: "Bridal Wear & Lehenga",
  groom_wear: "Groom Wear & Sherwani",
  gifting: "Gifting & Favors",
  other: "Other Services",
};
