import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  status: true,
  notes: true,
}).extend({
  date: z.date().optional().or(z.string().optional()),
  guestCount: z.number().optional(),
  location: z.string().optional(),
  budgetRange: z.string().optional(),
  leadMagnet: z.string().optional(),
  message: z.string().optional(),
  consentGiven: z.boolean().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

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
