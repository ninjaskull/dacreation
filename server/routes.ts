import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { 
  insertLeadSchema, insertUserSchema, updateLeadSchema,
  insertAppointmentSchema, updateAppointmentSchema,
  insertActivityLogSchema, insertLeadNoteSchema
} from "@shared/schema";
import { crypto } from "./auth";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
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

function canAccessLead(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.user as Express.User;
  if (user.role === 'admin') {
    return next();
  }
  
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
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

  app.post("/api/auth/register", async (req, res) => {
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

  app.patch("/api/leads/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/leads/:id/notes", isAuthenticated, async (req, res) => {
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

  app.patch("/api/notes/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/notes/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/leads/:id/activity", isAuthenticated, async (req, res) => {
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

  app.post("/api/appointments", isAuthenticated, async (req, res) => {
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

  app.patch("/api/appointments/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAppointment(req.params.id);
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  return httpServer;
}
