import { supabase } from './supabase';
import { IStorage } from './types';
import { 
  insertUserSchema, insertCompanySchema, 
  insertEmissionSchema, insertReportSchema,
  insertSupportTicketSchema, insertSupportMessageSchema
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'user_sessions'
    });
  }

  // User methods
  async getUser(id: number) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*, company:companies(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return user;
  }

  async getUserByUsername(username: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*, company:companies(*)')
      .eq('username', username)
      .single();

    if (error) throw error;
    return user;
  }

  async getUserByEmail(email: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return user;
  }

  async createUser(userData: any) {
    const validatedData = insertUserSchema.parse(userData);
    const { data: user, error } = await supabase
      .from('users')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  async updateUser(id: number, userData: any) {
    const { data: user, error } = await supabase
      .from('users')
      .update({ ...userData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  // Company methods
  async getCompany(id: number) {
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return company;
  }

  async createCompany(companyData: any) {
    const validatedData = insertCompanySchema.parse(companyData);
    const { data: company, error } = await supabase
      .from('companies')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    return company;
  }

  async updateCompany(id: number, companyData: any) {
    const { data: company, error } = await supabase
      .from('companies')
      .update({ ...companyData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return company;
  }

  // Emissions methods
  async getEmissions(companyId: number, filters?: { startDate?: Date, endDate?: Date, scope?: string }) {
    let query = supabase
      .from('emissions')
      .select('*, category:emission_categories(*), creator:users(*), verifier:users(*)')
      .eq('company_id', companyId)
      .order('date', { ascending: false });

    if (filters) {
      if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString());
      }
      if (filters.scope) {
        query = query.eq('scope', filters.scope);
      }
    }

    const { data: emissions, error } = await query;
    if (error) throw error;
    return emissions;
  }

  async getEmissionById(id: number) {
    const { data: emission, error } = await supabase
      .from('emissions')
      .select('*, category:emission_categories(*), creator:users(*), verifier:users(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return emission;
  }

  async createEmission(emissionData: any) {
    const validatedData = insertEmissionSchema.parse(emissionData);
    const { data: emission, error } = await supabase
      .from('emissions')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    return emission;
  }

  async updateEmission(id: number, emissionData: any) {
    const { data: emission, error } = await supabase
      .from('emissions')
      .update({ ...emissionData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return emission;
  }

  // Categories methods
  async getEmissionCategories() {
    const { data: categories, error } = await supabase
      .from('emission_categories')
      .select('*');

    if (error) throw error;
    return categories;
  }

  // Reports methods
  async getReports(companyId: number) {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*, creator:users(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return reports;
  }

  async getReportById(id: number) {
    const { data: report, error } = await supabase
      .from('reports')
      .select('*, creator:users(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return report;
  }

  async createReport(reportData: any) {
    const validatedData = insertReportSchema.parse(reportData);
    const { data: report, error } = await supabase
      .from('reports')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    return report;
  }

  // Subscription methods
  async getSubscriptionPlans() {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*');
    if (error) throw error;
    return plans;
  }

  async getCompanySubscription(companyId: number) {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single();
    if (error) throw error;
    return subscription;
  }

  // Support methods
  async getSupportCategories() {
    const { data: categories, error } = await supabase
      .from('support_categories')
      .select('*');

    if (error) throw error;
    return categories;
  }

  async getSupportTickets(userId: number, filters?: { status?: string }) {
    let query = supabase
      .from('support_tickets')
      .select('*, category:support_categories(*), user:users(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data: tickets, error } = await query;
    if (error) throw error;
    return tickets;
  }

  async getSupportTicketById(id: number) {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        category:support_categories(*),
        user:users(*),
        messages:support_messages(
          *,
          user:users(*)
        )
      `)
      .eq('id', id)
      .order('created_at', { foreignTable: 'messages', ascending: true })
      .single();

    if (error) throw error;
    return ticket;
  }

  async createSupportTicket(ticketData: any) {
    const validatedData = insertSupportTicketSchema.parse(ticketData);
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    return ticket;
  }

  async updateSupportTicket(id: number, ticketData: any) {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update({ ...ticketData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return ticket;
  }

  async getSupportMessages(ticketId: number) {
    const { data: messages, error } = await supabase
      .from('support_messages')
      .select('*, user:users(*)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return messages;
  }

  async createSupportMessage(messageData: any) {
    const validatedData = insertSupportMessageSchema.parse(messageData);
    const { data: message, error } = await supabase
      .from('support_messages')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;

    // Update ticket's updated_at
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date() })
      .eq('id', messageData.ticket_id);

    return message;
  }

  // Help articles methods
  async getHelpArticles(filters?: { categoryId?: number, isPublished?: boolean }) {
    let query = supabase
      .from('help_articles')
      .select('*, category:support_categories(*)')
      .order('updated_at', {ascending: false})
      .order('created_at', {ascending: false});

    if (filters) {
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }
    }
    const {data: articles, error} = await query;
    if (error) throw error;
    return articles;
  }

  async getHelpArticleBySlug(slug: string) {
    const { data: article, error } = await supabase
      .from('help_articles')
      .select('*, category:support_categories(*)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return article;
  }

  async getHelpArticleById(id: number) {
    const { data: article, error } = await supabase
      .from('help_articles')
      .select('*, category:support_categories(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return article;
  }

  async incrementArticleViews(id: number) {
    const { data: article, error } = await supabase
      .from('help_articles')
      .update({ views: sql`views + 1` })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return article;
  }
}

export const storage = new DatabaseStorage();