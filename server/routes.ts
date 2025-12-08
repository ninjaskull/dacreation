import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import passport from "passport";
import { broadcastNewMessage, broadcastConversationUpdate, broadcastAgentStatusChange } from "./websocket";
import { 
  insertLeadSchema, insertUserSchema, updateLeadSchema,
  insertAppointmentSchema, updateAppointmentSchema,
  insertActivityLogSchema, insertLeadNoteSchema,
  insertTeamMemberSchema, insertPortfolioItemSchema,
  insertTestimonialSchema, insertCareerSchema,
  insertPressArticleSchema, insertPageContentSchema,
  insertClientSchema, updateClientSchema,
  insertEventSchema, updateEventSchema,
  insertVendorSchema, updateVendorSchema,
  insertCompanySettingsSchema, updateUserSettingsSchema,
  insertInvoiceTemplateSchema, updateInvoiceTemplateSchema,
  insertInvoiceSchema, updateInvoiceSchema,
  insertInvoiceItemSchema, updateInvoiceItemSchema,
  insertInvoicePaymentSchema,
  insertCallbackRequestSchema, updateCallbackRequestSchema,
  insertConversationSchema, updateConversationSchema,
  insertChatMessageSchema,
  insertSmtpSettingsSchema, insertEmailTemplateSchema,
  insertBlogPostSchema, updateBlogPostSchema
} from "@shared/schema";
import { encryptPassword, isPasswordEncrypted, testSmtpConnection, clearTransporterCache, sendEmail, sendTemplatedEmail } from "./email";
import { crypto } from "./auth";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    }
  }
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
}

function isStaffOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user?.role === 'admin' || req.user?.role === 'staff')) {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Staff access required" });
}

function canAccessLead(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.user as Express.User;
  // Admin can access all leads
  if (user.role === 'admin') {
    return next();
  }
  
  // Staff can only access leads assigned to them - enforced in the route handlers
  // via query filter modification (see /api/leads route)
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        console.error("Passport authentication error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Session login error:", loginErr);
          console.error("Session login error stack:", loginErr.stack);
          return res.status(500).json({ message: "Login failed - session error", error: process.env.NODE_ENV !== 'production' ? loginErr.message : undefined });
        }
        return res.json({ user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Registration endpoint - requires admin authentication to create new users
  // This prevents unauthorized account creation
  app.post("/api/auth/register", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await crypto.hash(result.data.password);
      const user = await storage.createUser({
        ...result.data,
        password: hashedPassword,
      });

      res.status(201).json({ message: "User created successfully", user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/team", isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getActiveTeamMembers();
      res.json(members.map(m => ({
        id: m.id,
        username: m.username,
        name: m.name,
        email: m.email,
        phone: m.phone,
        role: m.role,
        isActive: m.isActive,
      })));
    } catch (error) {
      console.error("Get team error:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(u => ({
        id: u.id,
        username: u.username,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })));
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await crypto.hash(result.data.password);
      const user = await storage.createUser({
        ...result.data,
        password: hashedPassword,
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { password, ...data } = req.body;
      const updateData: any = { ...data };
      
      if (password) {
        updateData.password = await crypto.hash(password);
      }

      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const result = insertLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const lead = await storage.createLead(result.data);
      
      sendTemplatedEmail('inquiry_confirmation', lead.email, lead.name, {
        lead_name: lead.name,
        event_type: lead.eventType || 'Event',
        event_date: lead.date ? new Date(lead.date).toLocaleDateString() : 'TBD',
        guest_count: lead.guestCount?.toString() || 'TBD',
        inquiry_id: lead.id.substring(0, 8).toUpperCase()
      }).catch(err => console.error('Failed to send inquiry confirmation email:', err));
      
      res.status(201).json(lead);
    } catch (error) {
      console.error("Lead creation error:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.get("/api/leads", isAuthenticated, async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.eventType) filters.eventType = req.query.eventType as string;
      if (req.query.location) filters.location = req.query.location as string;
      if (req.query.budgetRange) filters.budgetRange = req.query.budgetRange as string;
      if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.leadSource) filters.leadSource = req.query.leadSource as string;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);

      const user = req.user as Express.User;
      if (user.role === 'staff') {
        filters.assignedTo = user.id;
      }

      const leads = await storage.getAllLeads(filters);
      res.json(leads);
    } catch (error) {
      console.error("Get leads error:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getLeadStats();
      res.json(stats);
    } catch (error) {
      console.error("Get lead stats error:", error);
      res.status(500).json({ message: "Failed to fetch lead stats" });
    }
  });

  app.get("/api/leads/export", isAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getAllLeads();
      
      const format = req.query.format as string || 'csv';
      
      if (format === 'csv') {
        const headers = ['Name', 'Email', 'Phone', 'Event Type', 'Event Date', 'Location', 'Budget Range', 'Status', 'Lead Source', 'Assigned To', 'Created At'];
        const rows = leads.map(lead => [
          lead.name,
          lead.email,
          lead.phone,
          lead.eventType,
          lead.date ? new Date(lead.date).toLocaleDateString() : '',
          lead.location || '',
          lead.budgetRange || '',
          lead.status,
          lead.leadSource,
          lead.assignee?.name || lead.assignee?.username || '',
          new Date(lead.createdAt).toLocaleDateString(),
        ]);
        
        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
        res.send(csv);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=leads.json');
        res.json(leads);
      } else {
        res.status(400).json({ message: "Unsupported format. Use csv or json" });
      }
    } catch (error) {
      console.error("Export leads error:", error);
      res.status(500).json({ message: "Failed to export leads" });
    }
  });

  app.get("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      const lead = await storage.getLeadById(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Get lead error:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.patch("/api/leads/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const lead = await storage.updateLead(req.params.id, result.data);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const user = req.user as Express.User;
      await storage.createActivityLog({
        leadId: req.params.id,
        userId: user.id,
        action: 'updated',
        details: `Lead updated: ${Object.keys(result.data).join(', ')}`,
      });

      res.json(lead);
    } catch (error) {
      console.error("Update lead error:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteLead(req.params.id);
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Delete lead error:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  app.get("/api/leads/:id/notes", isAuthenticated, async (req, res) => {
    try {
      const notes = await storage.getLeadNotes(req.params.id);
      res.json(notes);
    } catch (error) {
      console.error("Get lead notes error:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/leads/:id/notes", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertLeadNoteSchema.safeParse({
        ...req.body,
        leadId: req.params.id,
        userId: (req.user as Express.User).id,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const note = await storage.createLeadNote(result.data);
      
      await storage.createActivityLog({
        leadId: req.params.id,
        userId: (req.user as Express.User).id,
        action: 'note_added',
        details: 'Added a new note',
      });

      res.status(201).json(note);
    } catch (error) {
      console.error("Create note error:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.patch("/api/notes/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const { content, isPinned } = req.body;
      const note = await storage.updateLeadNote(req.params.id, content, isPinned);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Update note error:", error);
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      await storage.deleteLeadNote(req.params.id);
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Delete note error:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  app.get("/api/leads/:id/activity", isAuthenticated, async (req, res) => {
    try {
      const logs = await storage.getActivityLogsByLead(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Get activity logs error:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/leads/:id/activity", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertActivityLogSchema.safeParse({
        ...req.body,
        leadId: req.params.id,
        userId: (req.user as Express.User).id,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const log = await storage.createActivityLog(result.data);
      res.status(201).json(log);
    } catch (error) {
      console.error("Create activity log error:", error);
      res.status(500).json({ message: "Failed to create activity log" });
    }
  });

  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.from) filters.from = new Date(req.query.from as string);
      if (req.query.to) filters.to = new Date(req.query.to as string);
      if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo as string;
      if (req.query.status) filters.status = req.query.status as string;

      const user = req.user as Express.User;
      if (user.role === 'staff') {
        filters.assignedTo = user.id;
      }

      const appointments = await storage.getAllAppointments(filters);
      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/upcoming", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const appointments = await storage.getUpcomingAppointments(limit);
      res.json(appointments);
    } catch (error) {
      console.error("Get upcoming appointments error:", error);
      res.status(500).json({ message: "Failed to fetch upcoming appointments" });
    }
  });

  app.get("/api/leads/:id/appointments", isAuthenticated, async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByLead(req.params.id);
      res.json(appointments);
    } catch (error) {
      console.error("Get lead appointments error:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertAppointmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const appointment = await storage.createAppointment(result.data);
      
      await storage.createActivityLog({
        leadId: result.data.leadId,
        userId: (req.user as Express.User).id,
        action: 'appointment_scheduled',
        details: `Scheduled ${result.data.type}: ${result.data.title}`,
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.get("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointment = await storage.getAppointmentById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Get appointment error:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.patch("/api/appointments/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateAppointmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const appointment = await storage.updateAppointment(req.params.id, result.data);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (result.data.status) {
        await storage.createActivityLog({
          leadId: appointment.leadId,
          userId: (req.user as Express.User).id,
          action: `appointment_${result.data.status}`,
          details: `Appointment marked as ${result.data.status}`,
        });
      }

      res.json(appointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      await storage.deleteAppointment(req.params.id);
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  app.get("/api/cms/team", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const members = await storage.getAllTeamMembers(activeOnly);
      res.json(members);
    } catch (error) {
      console.error("Get team members error:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/cms/team/:id", async (req, res) => {
    try {
      const member = await storage.getTeamMemberById(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Get team member error:", error);
      res.status(500).json({ message: "Failed to fetch team member" });
    }
  });

  app.post("/api/cms/team", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertTeamMemberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const member = await storage.createTeamMember(result.data);
      res.status(201).json(member);
    } catch (error) {
      console.error("Create team member error:", error);
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.patch("/api/cms/team/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const member = await storage.updateTeamMember(req.params.id, req.body);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Update team member error:", error);
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete("/api/cms/team/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteTeamMember(req.params.id);
      res.json({ message: "Team member deleted successfully" });
    } catch (error) {
      console.error("Delete team member error:", error);
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  app.get("/api/cms/portfolio", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const items = await storage.getAllPortfolioItems(activeOnly);
      res.json(items);
    } catch (error) {
      console.error("Get portfolio items error:", error);
      res.status(500).json({ message: "Failed to fetch portfolio items" });
    }
  });

  app.get("/api/cms/portfolio/:id", async (req, res) => {
    try {
      const item = await storage.getPortfolioItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Get portfolio item error:", error);
      res.status(500).json({ message: "Failed to fetch portfolio item" });
    }
  });

  app.post("/api/cms/portfolio", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertPortfolioItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const item = await storage.createPortfolioItem(result.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create portfolio item error:", error);
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.patch("/api/cms/portfolio/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const item = await storage.updatePortfolioItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Update portfolio item error:", error);
      res.status(500).json({ message: "Failed to update portfolio item" });
    }
  });

  app.delete("/api/cms/portfolio/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deletePortfolioItem(req.params.id);
      res.json({ message: "Portfolio item deleted successfully" });
    } catch (error) {
      console.error("Delete portfolio item error:", error);
      res.status(500).json({ message: "Failed to delete portfolio item" });
    }
  });

  app.get("/api/cms/testimonials", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const testimonials = await storage.getAllTestimonials(activeOnly);
      res.json(testimonials);
    } catch (error) {
      console.error("Get testimonials error:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.get("/api/cms/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.getTestimonialById(req.params.id);
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      console.error("Get testimonial error:", error);
      res.status(500).json({ message: "Failed to fetch testimonial" });
    }
  });

  app.post("/api/cms/testimonials", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertTestimonialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const testimonial = await storage.createTestimonial(result.data);
      res.status(201).json(testimonial);
    } catch (error) {
      console.error("Create testimonial error:", error);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  app.patch("/api/cms/testimonials/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const testimonial = await storage.updateTestimonial(req.params.id, req.body);
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      console.error("Update testimonial error:", error);
      res.status(500).json({ message: "Failed to update testimonial" });
    }
  });

  app.delete("/api/cms/testimonials/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteTestimonial(req.params.id);
      res.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
      console.error("Delete testimonial error:", error);
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });

  app.get("/api/cms/careers", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const careers = await storage.getAllCareers(activeOnly);
      res.json(careers);
    } catch (error) {
      console.error("Get careers error:", error);
      res.status(500).json({ message: "Failed to fetch careers" });
    }
  });

  app.get("/api/cms/careers/:id", async (req, res) => {
    try {
      const career = await storage.getCareerById(req.params.id);
      if (!career) {
        return res.status(404).json({ message: "Career not found" });
      }
      res.json(career);
    } catch (error) {
      console.error("Get career error:", error);
      res.status(500).json({ message: "Failed to fetch career" });
    }
  });

  app.post("/api/cms/careers", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertCareerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const career = await storage.createCareer(result.data);
      res.status(201).json(career);
    } catch (error) {
      console.error("Create career error:", error);
      res.status(500).json({ message: "Failed to create career" });
    }
  });

  app.patch("/api/cms/careers/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const career = await storage.updateCareer(req.params.id, req.body);
      if (!career) {
        return res.status(404).json({ message: "Career not found" });
      }
      res.json(career);
    } catch (error) {
      console.error("Update career error:", error);
      res.status(500).json({ message: "Failed to update career" });
    }
  });

  app.delete("/api/cms/careers/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteCareer(req.params.id);
      res.json({ message: "Career deleted successfully" });
    } catch (error) {
      console.error("Delete career error:", error);
      res.status(500).json({ message: "Failed to delete career" });
    }
  });

  app.get("/api/cms/press", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const articles = await storage.getAllPressArticles(activeOnly);
      res.json(articles);
    } catch (error) {
      console.error("Get press articles error:", error);
      res.status(500).json({ message: "Failed to fetch press articles" });
    }
  });

  app.get("/api/cms/press/:id", async (req, res) => {
    try {
      const article = await storage.getPressArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Press article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Get press article error:", error);
      res.status(500).json({ message: "Failed to fetch press article" });
    }
  });

  app.post("/api/cms/press", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertPressArticleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const article = await storage.createPressArticle(result.data);
      res.status(201).json(article);
    } catch (error) {
      console.error("Create press article error:", error);
      res.status(500).json({ message: "Failed to create press article" });
    }
  });

  app.patch("/api/cms/press/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const article = await storage.updatePressArticle(req.params.id, req.body);
      if (!article) {
        return res.status(404).json({ message: "Press article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Update press article error:", error);
      res.status(500).json({ message: "Failed to update press article" });
    }
  });

  app.delete("/api/cms/press/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deletePressArticle(req.params.id);
      res.json({ message: "Press article deleted successfully" });
    } catch (error) {
      console.error("Delete press article error:", error);
      res.status(500).json({ message: "Failed to delete press article" });
    }
  });

  app.get("/api/cms/pages", async (req, res) => {
    try {
      const pages = await storage.getAllPageContent();
      res.json(pages);
    } catch (error) {
      console.error("Get pages error:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.get("/api/cms/pages/:pageKey", async (req, res) => {
    try {
      const page = await storage.getPageContent(req.params.pageKey);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Get page error:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.post("/api/cms/pages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertPageContentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const page = await storage.upsertPageContent(result.data);
      res.status(201).json(page);
    } catch (error) {
      console.error("Create/Update page error:", error);
      res.status(500).json({ message: "Failed to save page content" });
    }
  });

  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.city) filters.city = req.query.city as string;
      if (req.query.source) filters.source = req.query.source as string;

      const clients = await storage.getAllClients(filters);
      res.json(clients);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getClientStats();
      res.json(stats);
    } catch (error) {
      console.error("Get client stats error:", error);
      res.status(500).json({ message: "Failed to fetch client stats" });
    }
  });

  app.get("/api/clients/export", isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const format = req.query.format as string || 'csv';
      
      if (format === 'csv') {
        const headers = ['Name', 'Email', 'Phone', 'Company', 'City', 'Status', 'Total Spent', 'Events Count', 'Source', 'Created At'];
        const rows = clients.map(client => [
          client.name,
          client.email,
          client.phone,
          client.company || '',
          client.city || '',
          client.status,
          client.totalSpent || 0,
          client.eventsCount || 0,
          client.source || '',
          new Date(client.createdAt).toLocaleDateString(),
        ]);
        
        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=clients.csv');
        res.send(csv);
      } else {
        res.json(clients);
      }
    } catch (error) {
      console.error("Export clients error:", error);
      res.status(500).json({ message: "Failed to export clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const client = await storage.getClientById(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Get client error:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertClientSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const client = await storage.createClient(result.data);
      res.status(201).json(client);
    } catch (error) {
      console.error("Create client error:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateClientSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const client = await storage.updateClient(req.params.id, result.data);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Update client error:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  app.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.type) filters.type = req.query.type as string;
      if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus as string;
      if (req.query.clientId) filters.clientId = req.query.clientId as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);

      const events = await storage.getAllEvents(filters);
      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getEventStats();
      res.json(stats);
    } catch (error) {
      console.error("Get event stats error:", error);
      res.status(500).json({ message: "Failed to fetch event stats" });
    }
  });

  app.get("/api/events/export", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      const format = req.query.format as string || 'csv';
      
      if (format === 'csv') {
        const headers = ['Name', 'Type', 'Date', 'Venue', 'Client', 'Status', 'Contract Amount', 'Paid Amount', 'Payment Status', 'Guest Count'];
        const rows = events.map(event => [
          event.name,
          event.type,
          new Date(event.date).toLocaleDateString(),
          event.venue || '',
          event.client?.name || '',
          event.status,
          event.contractAmount || 0,
          event.paidAmount || 0,
          event.paymentStatus,
          event.guestCount || '',
        ]);
        
        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=events.csv');
        res.send(csv);
      } else {
        res.json(events);
      }
    } catch (error) {
      console.error("Export events error:", error);
      res.status(500).json({ message: "Failed to export events" });
    }
  });

  app.get("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Get event error:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const event = await storage.createEvent(result.data);
      res.status(201).json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const event = await storage.updateEvent(req.params.id, result.data);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.get("/api/vendors", isAuthenticated, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.city) filters.city = req.query.city as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.minRating) filters.minRating = parseInt(req.query.minRating as string);

      const vendors = await storage.getAllVendors(filters);
      res.json(vendors);
    } catch (error) {
      console.error("Get vendors error:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getVendorStats();
      res.json(stats);
    } catch (error) {
      console.error("Get vendor stats error:", error);
      res.status(500).json({ message: "Failed to fetch vendor stats" });
    }
  });

  app.get("/api/vendors/export", isAuthenticated, async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      const format = req.query.format as string || 'csv';
      
      if (format === 'csv') {
        const headers = ['Name', 'Category', 'Contact', 'Email', 'Phone', 'City', 'Rating', 'Events Completed', 'Status', 'Price Range'];
        const rows = vendors.map(vendor => [
          vendor.name,
          vendor.category,
          vendor.contactName || '',
          vendor.email || '',
          vendor.phone || '',
          vendor.city || '',
          vendor.rating || 0,
          vendor.eventsCompleted || 0,
          vendor.status,
          vendor.priceRange || '',
        ]);
        
        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=vendors.csv');
        res.send(csv);
      } else {
        res.json(vendors);
      }
    } catch (error) {
      console.error("Export vendors error:", error);
      res.status(500).json({ message: "Failed to export vendors" });
    }
  });

  app.get("/api/vendors/:id", isAuthenticated, async (req, res) => {
    try {
      const vendor = await storage.getVendorById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Get vendor error:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  app.post("/api/vendors", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertVendorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const vendor = await storage.createVendor(result.data);
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Create vendor error:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.patch("/api/vendors/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateVendorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const vendor = await storage.updateVendor(req.params.id, result.data);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Update vendor error:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });

  app.delete("/api/vendors/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteVendor(req.params.id);
      res.json({ message: "Vendor deleted successfully" });
    } catch (error) {
      console.error("Delete vendor error:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  app.get("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
      
      const reportData = await storage.getReportData(dateFrom, dateTo);
      res.json(reportData);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ message: "Failed to fetch report data" });
    }
  });

  app.get("/api/settings/website", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      if (!settings) {
        return res.json({
          address: null,
          phone: null,
          email: null,
          whatsappNumber: null,
          mapEmbedCode: null,
          topBarAddress: null,
          secondaryAddress: null,
          socialMedia: [],
          numberOfEventsHeld: 0,
          ratings: 0,
          weddingsCount: 0,
          corporateCount: 0,
          socialCount: 0,
          awardsCount: 0,
          destinationsCount: 0,
          happyGuestsCount: 0,
          clientSatisfaction: 0,
          showPreferredBy: true,
          showTrustedBy: true,
        });
      }
      res.json({
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        whatsappNumber: settings.whatsappNumber,
        mapEmbedCode: settings.mapEmbedCode,
        topBarAddress: settings.topBarAddress,
        secondaryAddress: settings.secondaryAddress,
        socialMedia: settings.socialMedia || [],
        numberOfEventsHeld: settings.numberOfEventsHeld || 0,
        ratings: settings.ratings || 0,
        weddingsCount: settings.weddingsCount || 0,
        corporateCount: settings.corporateCount || 0,
        socialCount: settings.socialCount || 0,
        awardsCount: settings.awardsCount || 0,
        destinationsCount: settings.destinationsCount || 0,
        happyGuestsCount: settings.happyGuestsCount || 0,
        clientSatisfaction: settings.clientSatisfaction || 0,
        showPreferredBy: settings.showPreferredBy ?? true,
        showTrustedBy: settings.showTrustedBy ?? true,
      });
    } catch (error) {
      console.error("Get website settings error:", error);
      res.status(500).json({ message: "Failed to fetch website settings" });
    }
  });

  app.get("/api/settings/company", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings || {});
    } catch (error) {
      console.error("Get company settings error:", error);
      res.status(500).json({ message: "Failed to fetch company settings" });
    }
  });

  app.post("/api/settings/company", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertCompanySettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const settings = await storage.upsertCompanySettings(result.data);
      res.json(settings);
    } catch (error) {
      console.error("Update company settings error:", error);
      res.status(500).json({ message: "Failed to update company settings" });
    }
  });

  app.get("/api/settings/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as Express.User;
      const settings = await storage.getUserSettings(user.id);
      res.json(settings || {});
    } catch (error) {
      console.error("Get user settings error:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.patch("/api/settings/user", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = updateUserSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const user = req.user as Express.User;
      const settings = await storage.upsertUserSettings(user.id, result.data);
      res.json(settings);
    } catch (error) {
      console.error("Update user settings error:", error);
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  app.patch("/api/settings/profile", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const user = req.user as Express.User;
      const { name, email, phone, currentPassword, newPassword } = req.body;
      
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password is required to change password" });
        }
        const currentUser = await storage.getUser(user.id);
        if (!currentUser) {
          return res.status(404).json({ message: "User not found" });
        }
        const isValid = await crypto.compare(currentPassword, currentUser.password);
        if (!isValid) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        updateData.password = await crypto.hash(newPassword);
      }
      
      const updatedUser = await storage.updateUser(user.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/invoice-templates", isAuthenticated, async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const templates = await storage.getAllInvoiceTemplates(activeOnly);
      res.json(templates);
    } catch (error) {
      console.error("Get invoice templates error:", error);
      res.status(500).json({ message: "Failed to fetch invoice templates" });
    }
  });

  app.get("/api/invoice-templates/default", isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getDefaultInvoiceTemplate();
      res.json(template || null);
    } catch (error) {
      console.error("Get default template error:", error);
      res.status(500).json({ message: "Failed to fetch default template" });
    }
  });

  app.get("/api/invoice-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getInvoiceTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Get invoice template error:", error);
      res.status(500).json({ message: "Failed to fetch invoice template" });
    }
  });

  app.post("/api/invoice-templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertInvoiceTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const template = await storage.createInvoiceTemplate(result.data);
      res.status(201).json(template);
    } catch (error) {
      console.error("Create invoice template error:", error);
      res.status(500).json({ message: "Failed to create invoice template" });
    }
  });

  app.patch("/api/invoice-templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = updateInvoiceTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const template = await storage.updateInvoiceTemplate(req.params.id, result.data);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Update invoice template error:", error);
      res.status(500).json({ message: "Failed to update invoice template" });
    }
  });

  app.post("/api/invoice-templates/:id/set-default", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.setDefaultTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Set default template error:", error);
      res.status(500).json({ message: "Failed to set default template" });
    }
  });

  app.delete("/api/invoice-templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteInvoiceTemplate(req.params.id);
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Delete invoice template error:", error);
      res.status(500).json({ message: "Failed to delete invoice template" });
    }
  });

  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.clientId) filters.clientId = req.query.clientId as string;
      if (req.query.eventId) filters.eventId = req.query.eventId as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);

      const invoices = await storage.getAllInvoices(filters);
      res.json(invoices);
    } catch (error) {
      console.error("Get invoices error:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getInvoiceStats();
      res.json(stats);
    } catch (error) {
      console.error("Get invoice stats error:", error);
      res.status(500).json({ message: "Failed to fetch invoice stats" });
    }
  });

  app.get("/api/invoices/generate-number", isAuthenticated, async (req, res) => {
    try {
      const invoiceNumber = await storage.generateInvoiceNumber();
      res.json({ invoiceNumber });
    } catch (error) {
      console.error("Generate invoice number error:", error);
      res.status(500).json({ message: "Failed to generate invoice number" });
    }
  });

  app.get("/api/invoices/export", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      const format = req.query.format as string || 'csv';
      
      if (format === 'csv') {
        const headers = ['Invoice Number', 'Title', 'Client', 'Issue Date', 'Due Date', 'Status', 'Total Amount', 'Paid Amount', 'Balance Due'];
        const rows = invoices.map(inv => [
          inv.invoiceNumber,
          inv.title,
          inv.clientName || inv.client?.name || '',
          new Date(inv.issueDate).toLocaleDateString(),
          new Date(inv.dueDate).toLocaleDateString(),
          inv.status,
          inv.totalAmount || 0,
          inv.paidAmount || 0,
          inv.balanceDue || 0,
        ]);
        
        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
        res.send(csv);
      } else {
        res.json(invoices);
      }
    } catch (error) {
      console.error("Export invoices error:", error);
      res.status(500).json({ message: "Failed to export invoices" });
    }
  });

  app.get("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoiceById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Get invoice error:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/:id/html", async (req, res) => {
    try {
      const invoice = await storage.getInvoiceById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (invoice.status === 'sent' && !invoice.viewedAt) {
        await storage.updateInvoice(req.params.id, { status: 'viewed' } as any);
      }

      let template = null;
      if (invoice.templateId) {
        template = await storage.getInvoiceTemplateById(invoice.templateId);
      }
      if (!template) {
        template = await storage.getDefaultInvoiceTemplate();
      }

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
      };

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${template?.fontFamily || 'Inter'}, -apple-system, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: ${template?.primaryColor || '#3B82F6'}; color: white; padding: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
    .company-info h1 { font-size: 28px; margin-bottom: 10px; }
    .company-info p { opacity: 0.9; font-size: 14px; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { font-size: 32px; margin-bottom: 10px; }
    .invoice-info p { font-size: 14px; opacity: 0.9; }
    .body { padding: 30px; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .address { flex: 1; }
    .address h3 { color: ${template?.primaryColor || '#3B82F6'}; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
    .address p { font-size: 14px; color: #555; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { background: ${template?.secondaryColor || '#1E40AF'}; color: white; padding: 12px; text-align: left; font-size: 14px; }
    .items-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    .items-table tr:nth-child(even) { background: #f9f9f9; }
    .text-right { text-align: right; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-table { width: 300px; }
    .totals-table td { padding: 8px 12px; font-size: 14px; }
    .totals-table .total-row { background: ${template?.primaryColor || '#3B82F6'}; color: white; font-size: 18px; font-weight: bold; }
    .footer { background: #f9f9f9; padding: 20px 30px; font-size: 12px; color: #666; }
    .footer h4 { color: #333; margin-bottom: 10px; }
    .bank-details { display: flex; gap: 40px; margin-top: 20px; }
    .bank-details div { flex: 1; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .status-paid { background: #10B981; color: white; }
    .status-sent, .status-viewed { background: #3B82F6; color: white; }
    .status-draft { background: #9CA3AF; color: white; }
    .status-overdue { background: #EF4444; color: white; }
    @media print { body { background: white; padding: 0; } .invoice { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="company-info">
        ${template?.showLogo && template?.logoUrl ? `<img src="${template.logoUrl}" alt="Logo" style="height: 60px; margin-bottom: 10px;">` : ''}
        <h1>${template?.companyName || 'Your Company'}</h1>
        <p>${template?.companyAddress || ''}</p>
        <p>${template?.companyPhone || ''} | ${template?.companyEmail || ''}</p>
        ${template?.showGst && template?.companyGst ? `<p>GSTIN: ${template.companyGst}</p>` : ''}
      </div>
      <div class="invoice-info">
        <h2>INVOICE</h2>
        <p><strong>${invoice.invoiceNumber}</strong></p>
        <p>Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-IN')}</p>
        <p>Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
        <p style="margin-top: 10px;"><span class="status-badge status-${invoice.status}">${invoice.status}</span></p>
      </div>
    </div>
    <div class="body">
      <div class="addresses">
        <div class="address">
          <h3>Bill To</h3>
          <p><strong>${invoice.clientName || ''}</strong></p>
          <p>${invoice.clientAddress || ''}</p>
          <p>${invoice.clientEmail || ''}</p>
          <p>${invoice.clientPhone || ''}</p>
          ${invoice.clientGst ? `<p>GSTIN: ${invoice.clientGst}</p>` : ''}
        </div>
        ${invoice.shippingAddress ? `
        <div class="address">
          <h3>Ship To</h3>
          <p>${invoice.shippingAddress}</p>
        </div>
        ` : ''}
      </div>
      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>HSN/SAC</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items?.map((item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${item.name}</strong>${item.description ? `<br><small style="color:#666;">${item.description}</small>` : ''}</td>
            <td>${item.hsnCode || item.sacCode || '-'}</td>
            <td class="text-right">${item.quantity} ${item.unit || ''}</td>
            <td class="text-right">${formatCurrency(item.unitPrice)}</td>
            <td class="text-right">${formatCurrency(item.amount)}</td>
          </tr>
          `).join('') || '<tr><td colspan="6">No items</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <table class="totals-table">
          <tr><td>Subtotal</td><td class="text-right">${formatCurrency(invoice.subtotal || 0)}</td></tr>
          ${invoice.discountAmount ? `<tr><td>Discount</td><td class="text-right">-${formatCurrency(invoice.discountAmount)}</td></tr>` : ''}
          ${invoice.cgstAmount ? `<tr><td>CGST (${invoice.cgstRate}%)</td><td class="text-right">${formatCurrency(invoice.cgstAmount)}</td></tr>` : ''}
          ${invoice.sgstAmount ? `<tr><td>SGST (${invoice.sgstRate}%)</td><td class="text-right">${formatCurrency(invoice.sgstAmount)}</td></tr>` : ''}
          ${invoice.igstAmount ? `<tr><td>IGST (${invoice.igstRate}%)</td><td class="text-right">${formatCurrency(invoice.igstAmount)}</td></tr>` : ''}
          <tr class="total-row"><td>Total</td><td class="text-right">${formatCurrency(invoice.totalAmount || 0)}</td></tr>
          ${invoice.paidAmount ? `<tr><td>Paid</td><td class="text-right">${formatCurrency(invoice.paidAmount)}</td></tr>` : ''}
          ${invoice.balanceDue ? `<tr><td><strong>Balance Due</strong></td><td class="text-right"><strong>${formatCurrency(invoice.balanceDue)}</strong></td></tr>` : ''}
        </table>
      </div>
    </div>
    <div class="footer">
      ${invoice.notes ? `<div style="margin-bottom: 15px;"><h4>Notes</h4><p>${invoice.notes}</p></div>` : ''}
      ${invoice.termsAndConditions || template?.termsAndConditions ? `<div style="margin-bottom: 15px;"><h4>Terms & Conditions</h4><p>${invoice.termsAndConditions || template?.termsAndConditions}</p></div>` : ''}
      ${template?.showBankDetails && (template?.bankName || template?.bankAccountNumber) ? `
      <div class="bank-details">
        <div>
          <h4>Bank Details</h4>
          <p><strong>Bank:</strong> ${template.bankName || ''}</p>
          <p><strong>Account:</strong> ${template.bankAccountNumber || ''}</p>
          <p><strong>IFSC:</strong> ${template.bankIfsc || ''}</p>
          <p><strong>Branch:</strong> ${template.bankBranch || ''}</p>
        </div>
        ${template?.showUpi && template?.upiId ? `
        <div>
          <h4>UPI Payment</h4>
          <p><strong>UPI ID:</strong> ${template.upiId}</p>
        </div>
        ` : ''}
      </div>
      ` : ''}
      ${template?.showSignature && template?.signatureUrl ? `
      <div style="margin-top: 30px; text-align: right;">
        <img src="${template.signatureUrl}" alt="Signature" style="height: 60px;">
        <p><strong>Authorized Signature</strong></p>
      </div>
      ` : ''}
      <p style="margin-top: 20px; text-align: center; color: #999;">${template?.footerText || 'Thank you for your business!'}</p>
    </div>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Get invoice HTML error:", error);
      res.status(500).json({ message: "Failed to generate invoice HTML" });
    }
  });

  app.post("/api/invoices", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertInvoiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      
      const invoiceData = {
        ...result.data,
        createdBy: (req.user as Express.User).id,
      };
      
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Create invoice error:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.patch("/api/invoices/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateInvoiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const invoice = await storage.updateInvoice(req.params.id, result.data);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Update invoice error:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.post("/api/invoices/:id/send", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, { 
        status: 'sent',
      } as any);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Send invoice error:", error);
      res.status(500).json({ message: "Failed to send invoice" });
    }
  });

  app.delete("/api/invoices/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteInvoice(req.params.id);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Delete invoice error:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  app.get("/api/invoices/:id/items", isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getInvoiceItems(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Get invoice items error:", error);
      res.status(500).json({ message: "Failed to fetch invoice items" });
    }
  });

  app.post("/api/invoices/:id/items", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertInvoiceItemSchema.safeParse({
        ...req.body,
        invoiceId: req.params.id,
      });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const item = await storage.createInvoiceItem(result.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create invoice item error:", error);
      res.status(500).json({ message: "Failed to create invoice item" });
    }
  });

  app.patch("/api/invoice-items/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateInvoiceItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const item = await storage.updateInvoiceItem(req.params.id, result.data);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Update invoice item error:", error);
      res.status(500).json({ message: "Failed to update invoice item" });
    }
  });

  app.delete("/api/invoice-items/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      await storage.deleteInvoiceItem(req.params.id);
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Delete invoice item error:", error);
      res.status(500).json({ message: "Failed to delete invoice item" });
    }
  });

  app.get("/api/invoices/:id/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getInvoicePayments(req.params.id);
      res.json(payments);
    } catch (error) {
      console.error("Get invoice payments error:", error);
      res.status(500).json({ message: "Failed to fetch invoice payments" });
    }
  });

  app.post("/api/invoices/:id/payments", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertInvoicePaymentSchema.safeParse({
        ...req.body,
        invoiceId: req.params.id,
        receivedBy: (req.user as Express.User).id,
      });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const payment = await storage.createInvoicePayment(result.data);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Create invoice payment error:", error);
      res.status(500).json({ message: "Failed to create invoice payment" });
    }
  });

  app.delete("/api/invoice-payments/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      await storage.deleteInvoicePayment(req.params.id);
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Delete invoice payment error:", error);
      res.status(500).json({ message: "Failed to delete invoice payment" });
    }
  });

  // ==================== Callback Requests ====================
  
  app.post("/api/callback-requests", async (req, res) => {
    try {
      const result = insertCallbackRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const request = await storage.createCallbackRequest(result.data);
      
      if (request.email) {
        sendTemplatedEmail('callback_request_confirmation', request.email, request.name, {
          customer_name: request.name,
          request_id: request.id.substring(0, 8).toUpperCase(),
          phone_number: request.phone,
          preferred_time: 'As soon as possible'
        }).catch(err => console.error('Failed to send callback confirmation email:', err));
      }
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Create callback request error:", error);
      res.status(500).json({ message: "Failed to create callback request" });
    }
  });

  app.get("/api/callback-requests", isAuthenticated, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.priority) filters.priority = req.query.priority;
      if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;
      if (req.query.search) filters.search = req.query.search;
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);
      
      const requests = await storage.getAllCallbackRequests(filters);
      res.json(requests);
    } catch (error) {
      console.error("Get callback requests error:", error);
      res.status(500).json({ message: "Failed to fetch callback requests" });
    }
  });

  app.get("/api/callback-requests/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getCallbackRequestStats();
      res.json(stats);
    } catch (error) {
      console.error("Get callback request stats error:", error);
      res.status(500).json({ message: "Failed to fetch callback request stats" });
    }
  });

  app.get("/api/callback-requests/:id", isAuthenticated, async (req, res) => {
    try {
      const request = await storage.getCallbackRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Callback request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Get callback request error:", error);
      res.status(500).json({ message: "Failed to fetch callback request" });
    }
  });

  app.patch("/api/callback-requests/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateCallbackRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const request = await storage.updateCallbackRequest(req.params.id, result.data);
      if (!request) {
        return res.status(404).json({ message: "Callback request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Update callback request error:", error);
      res.status(500).json({ message: "Failed to update callback request" });
    }
  });

  app.delete("/api/callback-requests/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      await storage.deleteCallbackRequest(req.params.id);
      res.json({ message: "Callback request deleted successfully" });
    } catch (error) {
      console.error("Delete callback request error:", error);
      res.status(500).json({ message: "Failed to delete callback request" });
    }
  });

  // ==================== Conversations ====================
  
  app.post("/api/conversations", async (req, res) => {
    try {
      const result = insertConversationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      
      const existing = await storage.getConversationByVisitorId(result.data.visitorId);
      if (existing) {
        return res.json(existing);
      }
      
      const conversation = await storage.createConversation(result.data);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;
      if (req.query.search) filters.search = req.query.search;
      
      const conversations = await storage.getAllConversations(filters);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getConversationStats();
      res.json(stats);
    } catch (error) {
      console.error("Get conversation stats error:", error);
      res.status(500).json({ message: "Failed to fetch conversation stats" });
    }
  });

  app.get("/api/conversations/visitor/:visitorId", async (req, res) => {
    try {
      const conversation = await storage.getConversationByVisitorId(req.params.visitorId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Get conversation by visitor error:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.get("/api/conversations/:id", isAuthenticated, async (req, res) => {
    try {
      const conversation = await storage.getConversationById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.patch("/api/conversations/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateConversationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const conversation = await storage.updateConversation(req.params.id, result.data);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Update conversation error:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });

  app.delete("/api/conversations/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      await storage.deleteConversation(req.params.id);
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Delete conversation error:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // ==================== Chat Messages ====================
  
  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const result = insertChatMessageSchema.safeParse({
        ...req.body,
        conversationId: req.params.conversationId,
      });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const message = await storage.createChatMessage(result.data);
      
      broadcastNewMessage(req.params.conversationId, {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderType: message.senderType,
        senderName: message.senderName,
        messageType: message.messageType,
        isRead: message.isRead,
        createdAt: message.createdAt,
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Create chat message error:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversationId(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Get chat messages error:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/conversations/:conversationId/mark-read", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      await storage.markMessagesAsRead(req.params.conversationId, 'visitor');
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      console.error("Mark messages read error:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  app.post("/api/conversations/:conversationId/request-live-agent", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const conversation = await storage.getConversationById(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const now = new Date();
      const updatedConversation = await storage.updateConversation(conversationId, {
        wantsLiveAgent: true,
        liveAgentRequestedAt: now.toISOString(),
        status: 'live_agent',
      });

      await storage.createChatMessage({
        conversationId,
        senderId: 'system',
        senderType: 'system',
        senderName: 'System',
        content: '🔔 Visitor has requested to speak with a live agent. An agent will join shortly.',
        messageType: 'system',
      });

      broadcastNewMessage(conversationId, {
        type: 'status',
        conversationId,
        status: 'live_agent',
      });

      const companySettings = await storage.getCompanySettings();
      const adminEmail = companySettings?.email;
      
      if (adminEmail) {
        const replitDomains = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
        let baseUrl = companySettings?.website || '';
        if (!baseUrl && replitDomains) {
          const primaryDomain = replitDomains.split(',')[0];
          baseUrl = `https://${primaryDomain}`;
        }
        
        const chatUrl = `${baseUrl}/admin/chat`;
        
        sendTemplatedEmail(
          'live_agent_request',
          adminEmail,
          companySettings?.name || 'Admin',
          {
            visitor_name: conversation.visitorName || 'Visitor',
            visitor_phone: conversation.visitorPhone || 'Not provided',
            event_type: conversation.eventType || 'Not specified',
            event_date: (conversation as any).eventDate || 'Not specified',
            event_location: (conversation as any).eventLocation || 'Not specified',
            requested_at: now.toLocaleString('en-IN', { 
              timeZone: 'Asia/Kolkata',
              dateStyle: 'medium',
              timeStyle: 'short'
            }),
            chat_url: chatUrl,
          }
        ).then(result => {
          if (!result.success) {
            console.error("Failed to send live agent email:", result.error);
          }
        }).catch(err => {
          console.error("Error sending live agent email:", err);
        });
      }

      res.json({ 
        message: "Live agent requested successfully",
        conversation: updatedConversation 
      });
    } catch (error) {
      console.error("Request live agent error:", error);
      res.status(500).json({ message: "Failed to request live agent" });
    }
  });

  app.get("/api/messages/unread-count", isAuthenticated, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount();
      res.json({ count });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // ==================== Agent Status ====================

  app.get("/api/agent-status", isAuthenticated, async (req, res) => {
    try {
      const statuses = await storage.getAllAgentStatuses();
      res.json(statuses);
    } catch (error) {
      console.error("Get agent statuses error:", error);
      res.status(500).json({ message: "Failed to fetch agent statuses" });
    }
  });

  app.get("/api/agent-status/online", async (req, res) => {
    try {
      const onlineAgents = await storage.getOnlineAgents();
      res.json(onlineAgents);
    } catch (error) {
      console.error("Get online agents error:", error);
      res.status(500).json({ message: "Failed to fetch online agents" });
    }
  });

  app.get("/api/agent-status/:userId", isAuthenticated, async (req, res) => {
    try {
      const status = await storage.getAgentStatus(req.params.userId);
      res.json(status || { status: "offline", userId: req.params.userId });
    } catch (error) {
      console.error("Get agent status error:", error);
      res.status(500).json({ message: "Failed to fetch agent status" });
    }
  });

  app.put("/api/agent-status", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const user = req.user as User;
      const { status, statusMessage, maxConversations } = req.body;
      
      if (status && !["online", "away", "offline"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be online, away, or offline" });
      }

      const updatedStatus = await storage.upsertAgentStatus(user.id, {
        status: status || "online",
        statusMessage,
        maxConversations,
      });

      broadcastAgentStatusChange(user.id, user.name || user.username, updatedStatus.status, updatedStatus.statusMessage || undefined);
      
      res.json(updatedStatus);
    } catch (error) {
      console.error("Update agent status error:", error);
      res.status(500).json({ message: "Failed to update agent status" });
    }
  });

  // ==================== Email Settings ====================

  app.get("/api/settings/smtp", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSmtpSettings();
      if (!settings) {
        return res.json(null);
      }
      const { password, ...safeSettings } = settings;
      res.json({ ...safeSettings, hasPassword: !!password });
    } catch (error) {
      console.error("Get SMTP settings error:", error);
      res.status(500).json({ message: "Failed to fetch SMTP settings" });
    }
  });

  app.post("/api/settings/smtp", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertSmtpSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      let passwordToStore = result.data.password;
      if (passwordToStore && !isPasswordEncrypted(passwordToStore)) {
        passwordToStore = encryptPassword(passwordToStore);
      }

      const settings = await storage.upsertSmtpSettings({
        ...result.data,
        password: passwordToStore,
      });

      clearTransporterCache();

      const { password, ...safeSettings } = settings;
      res.json({ ...safeSettings, hasPassword: !!password });
    } catch (error) {
      console.error("Save SMTP settings error:", error);
      res.status(500).json({ message: "Failed to save SMTP settings" });
    }
  });

  app.patch("/api/settings/smtp", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const existingSettings = await storage.getSmtpSettings();
      if (!existingSettings) {
        return res.status(404).json({ message: "SMTP settings not found" });
      }

      const { password, id, createdAt, updatedAt, lastTestedAt, lastTestResult, hasPassword, ...updateData } = req.body;
      
      let updates: any = { ...updateData };
      
      if (password && password.trim() !== '') {
        updates.password = isPasswordEncrypted(password) ? password : encryptPassword(password);
      }

      const settings = await storage.updateSmtpSettings(existingSettings.id, updates);
      if (!settings) {
        return res.status(404).json({ message: "SMTP settings not found" });
      }

      clearTransporterCache();

      const { password: pwd, ...safeSettings } = settings;
      res.json({ ...safeSettings, hasPassword: !!pwd });
    } catch (error) {
      console.error("Update SMTP settings error:", error);
      res.status(500).json({ message: "Failed to update SMTP settings" });
    }
  });

  app.post("/api/settings/smtp/test", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { testEmail } = req.body;
      if (!testEmail) {
        return res.status(400).json({ message: "Test email address is required" });
      }

      const result = await testSmtpConnection(testEmail);
      res.json(result);
    } catch (error) {
      console.error("Test SMTP error:", error);
      res.status(500).json({ message: "Failed to test SMTP connection" });
    }
  });

  // ==================== Email Type Settings ====================

  app.get("/api/settings/email-types", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getEmailTypeSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get email type settings error:", error);
      res.status(500).json({ message: "Failed to fetch email type settings" });
    }
  });

  app.post("/api/settings/email-types", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.upsertEmailTypeSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Save email type settings error:", error);
      res.status(500).json({ message: "Failed to save email type settings" });
    }
  });

  // ==================== Email Templates ====================

  app.get("/api/email-templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Get email templates error:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.get("/api/email-templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.getEmailTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Get email template error:", error);
      res.status(500).json({ message: "Failed to fetch email template" });
    }
  });

  app.post("/api/email-templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = insertEmailTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const existing = await storage.getEmailTemplateByKey(result.data.templateKey);
      if (existing) {
        return res.status(400).json({ message: "Template key already exists" });
      }

      const template = await storage.createEmailTemplate(result.data);
      res.status(201).json(template);
    } catch (error) {
      console.error("Create email template error:", error);
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  app.patch("/api/email-templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.updateEmailTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Update email template error:", error);
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  app.delete("/api/email-templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteEmailTemplate(req.params.id);
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Delete email template error:", error);
      res.status(500).json({ message: "Failed to delete email template" });
    }
  });

  app.post("/api/email-templates/:id/preview", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.getEmailTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const { renderTemplate } = await import('./email');
      const companySettings = await storage.getCompanySettings();
      
      const sampleVariables: Record<string, string> = {
        recipient_name: 'John Doe',
        recipient_email: 'john@example.com',
        event_name: 'Sample Wedding',
        event_date: new Date().toLocaleDateString(),
        event_location: 'Beautiful Venue',
        amount: '$5,000',
        invoice_number: 'INV-001',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        ...req.body.variables,
      };

      const rendered = renderTemplate(template, sampleVariables, companySettings);
      res.json(rendered);
    } catch (error) {
      console.error("Preview email template error:", error);
      res.status(500).json({ message: "Failed to preview email template" });
    }
  });

  // ==================== Email Logs ====================

  app.get("/api/email-logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getEmailLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Get email logs error:", error);
      res.status(500).json({ message: "Failed to fetch email logs" });
    }
  });

  // ==================== Send Email ====================

  app.post("/api/send-email", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const { to, toName, subject, html, text, type } = req.body;
      
      if (!to || !subject || !html) {
        return res.status(400).json({ message: "Missing required fields: to, subject, html" });
      }

      const result = await sendEmail({ to, toName, subject, html, text, type });
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Send email error:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // ==================== SEO: Robots.txt ====================

  app.get("/robots.txt", (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    const robotsTxt = `# Robots.txt for ${baseUrl}
User-agent: *
Allow: /

# Disallow admin pages
Disallow: /admin/
Disallow: /admin/*

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional - be nice to servers)
Crawl-delay: 1
`;
    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // ==================== SEO: Sitemap ====================

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { getPublicPages } = await import('../shared/seo-config');
      const pages = getPublicPages();
      const baseUrl = req.protocol + '://' + req.get('host');
      const lastMod = new Date().toISOString().split('T')[0];

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      for (const page of pages) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      }
      
      xml += '</urlset>';

      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // ==================== SEO: API for page SEO data ====================

  app.get("/api/seo/:path(*)", async (req, res) => {
    try {
      const { getPageSEO } = await import('../shared/seo-config');
      const path = '/' + (req.params.path || '');
      const seo = getPageSEO(path === '/' ? '/' : path);
      
      if (seo) {
        res.json(seo);
      } else {
        res.status(404).json({ message: "SEO config not found for this path" });
      }
    } catch (error) {
      console.error("Get SEO config error:", error);
      res.status(500).json({ message: "Failed to fetch SEO config" });
    }
  });

  // ==================== Press Kit PDF Generation ====================
  app.get("/api/press-kit", async (req, res) => {
    try {
      const { BRAND } = await import('../shared/branding');
      const settings = await storage.getCompanySettings();
      
      const companyName = settings?.name || BRAND.company.name;
      const tagline = settings?.tagline || BRAND.company.tagline;
      const description = settings?.fullDescription || BRAND.company.fullDescription;
      const email = settings?.email || BRAND.contact.email;
      const phone = settings?.phone || BRAND.contact.phones[0];
      const website = settings?.website || BRAND.domain.url;
      const address = settings?.address || BRAND.addresses.primary.full;
      const foundedYear = settings?.foundedYear || BRAND.company.foundedYear;
      const eventsCompleted = settings?.numberOfEventsHeld || BRAND.stats.eventsCompleted;
      const rating = settings?.ratings || BRAND.stats.rating;
      const currentYear = new Date().getFullYear();
      const yearsExperience = currentYear - foundedYear;
      
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        info: {
          Title: `${companyName} - Press Kit`,
          Author: companyName,
          Subject: 'Official Press Kit',
          Keywords: 'press kit, media, event management'
        }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${companyName.replace(/\s+/g, '_')}_Press_Kit.pdf"`);
      
      doc.pipe(res);

      const maroon = '#601a29';
      const gold = '#D4AF37';
      const darkText = '#333333';
      const lightText = '#666666';
      
      const pageWidth = doc.page.width - 120;
      
      doc.rect(0, 0, doc.page.width, 200).fill(maroon);
      
      doc.fillColor('white')
         .fontSize(36)
         .font('Helvetica-Bold')
         .text(companyName.toUpperCase(), 60, 70, { width: pageWidth, align: 'center' });
      
      doc.fillColor(gold)
         .fontSize(14)
         .font('Helvetica')
         .text(tagline, 60, 120, { width: pageWidth, align: 'center' });
      
      doc.fillColor('white')
         .fontSize(11)
         .font('Helvetica')
         .text('OFFICIAL PRESS KIT', 60, 155, { width: pageWidth, align: 'center' });

      doc.fillColor(darkText)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('About Us', 60, 240);
      
      doc.moveTo(60, 268).lineTo(140, 268).strokeColor(gold).lineWidth(2).stroke();
      
      doc.fillColor(lightText)
         .fontSize(11)
         .font('Helvetica')
         .text(description, 60, 285, { width: pageWidth, align: 'justify', lineGap: 4 });

      const statsY = 380;
      doc.rect(60, statsY, pageWidth, 80).fillAndStroke('#f9f5f0', gold);
      
      const statWidth = pageWidth / 3;
      
      doc.fillColor(maroon)
         .fontSize(28)
         .font('Helvetica-Bold')
         .text(`${eventsCompleted}+`, 60, statsY + 15, { width: statWidth, align: 'center' });
      doc.fillColor(lightText)
         .fontSize(10)
         .font('Helvetica')
         .text('Events Completed', 60, statsY + 50, { width: statWidth, align: 'center' });
      
      doc.fillColor(maroon)
         .fontSize(28)
         .font('Helvetica-Bold')
         .text(`${yearsExperience}+`, 60 + statWidth, statsY + 15, { width: statWidth, align: 'center' });
      doc.fillColor(lightText)
         .fontSize(10)
         .font('Helvetica')
         .text('Years Experience', 60 + statWidth, statsY + 50, { width: statWidth, align: 'center' });
      
      doc.fillColor(maroon)
         .fontSize(28)
         .font('Helvetica-Bold')
         .text(`${rating}`, 60 + statWidth * 2, statsY + 15, { width: statWidth, align: 'center' });
      doc.fillColor(lightText)
         .fontSize(10)
         .font('Helvetica')
         .text('Star Rating', 60 + statWidth * 2, statsY + 50, { width: statWidth, align: 'center' });

      doc.fillColor(darkText)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('Our Services', 60, 490);
      
      doc.moveTo(60, 518).lineTo(170, 518).strokeColor(gold).lineWidth(2).stroke();

      const services = [
        { name: 'Weddings & Cultural Celebrations', desc: 'Traditional ceremonies, modern celebrations, and destination weddings with cultural understanding.' },
        { name: 'Corporate Events', desc: 'Conferences, product launches, award nights, and corporate retreats that achieve business objectives.' },
        { name: 'Social Events', desc: 'Birthdays, anniversaries, baby showers, and private parties crafted with care.' },
        { name: 'Destination Events', desc: 'Pan-India and international event planning with complete logistics management.' }
      ];

      let serviceY = 535;
      services.forEach((service) => {
        doc.fillColor(maroon)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(`• ${service.name}`, 60, serviceY);
        doc.fillColor(lightText)
           .fontSize(10)
           .font('Helvetica')
           .text(service.desc, 72, serviceY + 16, { width: pageWidth - 12 });
        serviceY += 45;
      });

      doc.addPage();
      
      doc.rect(0, 0, doc.page.width, 60).fill(maroon);
      doc.fillColor('white')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(companyName.toUpperCase(), 60, 22, { width: pageWidth, align: 'center' });

      doc.fillColor(darkText)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('Brand Guidelines', 60, 100);
      
      doc.moveTo(60, 128).lineTo(200, 128).strokeColor(gold).lineWidth(2).stroke();
      
      doc.fillColor(lightText)
         .fontSize(11)
         .font('Helvetica')
         .text('Our brand represents luxury, elegance, and attention to detail. When featuring our company, please adhere to the following guidelines:', 60, 145, { width: pageWidth, lineGap: 4 });

      doc.fillColor(darkText)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Brand Colors', 60, 200);

      const colorBoxY = 225;
      doc.rect(60, colorBoxY, 80, 50).fill(maroon);
      doc.fillColor(lightText).fontSize(9).font('Helvetica').text('Maroon', 60, colorBoxY + 55);
      doc.fillColor(lightText).fontSize(8).text('#601a29', 60, colorBoxY + 67);

      doc.rect(160, colorBoxY, 80, 50).fill(gold);
      doc.fillColor(lightText).fontSize(9).font('Helvetica').text('Gold', 160, colorBoxY + 55);
      doc.fillColor(lightText).fontSize(8).text('#D4AF37', 160, colorBoxY + 67);

      doc.rect(260, colorBoxY, 80, 50).fill('#f9f5f0');
      doc.fillColor(lightText).fontSize(9).font('Helvetica').text('Cream', 260, colorBoxY + 55);
      doc.fillColor(lightText).fontSize(8).text('#F9F5F0', 260, colorBoxY + 67);

      doc.rect(360, colorBoxY, 80, 50).fill('#333333');
      doc.fillColor(lightText).fontSize(9).font('Helvetica').text('Charcoal', 360, colorBoxY + 55);
      doc.fillColor(lightText).fontSize(8).text('#333333', 360, colorBoxY + 67);

      doc.fillColor(darkText)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Typography', 60, 320);
      
      doc.fillColor(lightText)
         .fontSize(11)
         .font('Helvetica')
         .text('Primary Font: Playfair Display (Headings)\nSecondary Font: Montserrat (Body Text)', 60, 340, { lineGap: 4 });

      doc.fillColor(darkText)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('Contact Information', 60, 420);
      
      doc.moveTo(60, 448).lineTo(240, 448).strokeColor(gold).lineWidth(2).stroke();

      doc.rect(60, 470, pageWidth, 140).fillAndStroke('#f9f5f0', gold);
      
      const contactInfo = [
        { label: 'Email', value: email },
        { label: 'Phone', value: phone },
        { label: 'Website', value: website },
        { label: 'Address', value: address },
        { label: 'Press Inquiries', value: `press@${BRAND.domain.primary}` }
      ];

      let contactY = 485;
      contactInfo.forEach((item) => {
        doc.fillColor(maroon)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(`${item.label}:`, 75, contactY);
        doc.fillColor(darkText)
           .fontSize(10)
           .font('Helvetica')
           .text(item.value, 170, contactY);
        contactY += 22;
      });

      doc.fillColor(darkText)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('Social Media', 60, 640);
      
      doc.moveTo(60, 668).lineTo(180, 668).strokeColor(gold).lineWidth(2).stroke();

      const socialLinks = [
        `Instagram: @${BRAND.domain.primary.replace('.in', '')}`,
        `Facebook: facebook.com/${BRAND.domain.primary.replace('.in', '')}`,
        `LinkedIn: linkedin.com/company/${BRAND.domain.primary.replace('.in', '')}`
      ];

      let socialY = 685;
      socialLinks.forEach((link) => {
        doc.fillColor(lightText)
           .fontSize(10)
           .font('Helvetica')
           .text(`• ${link}`, 60, socialY);
        socialY += 18;
      });

      doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(maroon);
      doc.fillColor('white')
         .fontSize(9)
         .font('Helvetica')
         .text(`© ${currentYear} ${companyName}. All Rights Reserved.`, 60, doc.page.height - 32, { width: pageWidth, align: 'center' });

      doc.end();
    } catch (error) {
      console.error("Press kit generation error:", error);
      res.status(500).json({ message: "Failed to generate press kit" });
    }
  });

  // Blog Posts Routes - Public
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Get published blog posts error:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post || post.status !== 'published') {
        return res.status(404).json({ message: "Blog post not found" });
      }
      await storage.incrementBlogViewCount(post.id);
      res.json(post);
    } catch (error) {
      console.error("Get blog post error:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Blog Posts Routes - Admin
  app.get("/api/cms/blog", isAuthenticated, async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.isFeatured) filters.isFeatured = req.query.isFeatured === 'true';
      
      const posts = await storage.getAllBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Get all blog posts error:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/cms/blog/:id", isAuthenticated, async (req, res) => {
    try {
      const post = await storage.getBlogPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Get blog post error:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/cms/blog", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = insertBlogPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      
      const existingBySlug = await storage.getBlogPostBySlug(result.data.slug);
      if (existingBySlug) {
        return res.status(400).json({ message: "A blog post with this slug already exists. Please use a different URL slug." });
      }
      
      const post = await storage.createBlogPost(result.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Create blog post error:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.patch("/api/cms/blog/:id", isAuthenticated, isStaffOrAdmin, async (req, res) => {
    try {
      const result = updateBlogPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      
      if (result.data.slug) {
        const existingBySlug = await storage.getBlogPostBySlug(result.data.slug);
        if (existingBySlug && existingBySlug.id !== req.params.id) {
          return res.status(400).json({ message: "A blog post with this slug already exists. Please use a different URL slug." });
        }
      }
      
      const post = await storage.updateBlogPost(req.params.id, result.data);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Update blog post error:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/cms/blog/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Delete blog post error:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  return httpServer;
}
