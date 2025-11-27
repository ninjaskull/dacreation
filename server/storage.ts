import { 
  type User, type InsertUser, type Lead, type InsertLead, type UpdateLead,
  type Appointment, type InsertAppointment, type UpdateAppointment,
  type ActivityLog, type InsertActivityLog,
  type LeadNote, type InsertLeadNote,
  users, leads, appointments, activityLogs, leadNotes
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, or, sql, asc } from "drizzle-orm";

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

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getActiveTeamMembers(): Promise<User[]>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  createLead(lead: InsertLead): Promise<Lead>;
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
    const leadData = {
      ...insertLead,
      date: insertLead.date ? new Date(insertLead.date) : null,
    };
    
    const [lead] = await db
      .insert(leads)
      .values(leadData as any)
      .returning();
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
      conditions.push(like(leads.location, `%${filters.location}%`));
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
      const searchTerm = `%${filters.search}%`;
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
    const result = await db.delete(leads).where(eq(leads.id, id));
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
}

export const storage = new DatabaseStorage();
