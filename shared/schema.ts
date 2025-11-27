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
