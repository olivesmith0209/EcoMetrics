import { supabase } from './supabase';
import { 
  insertSupportTicketSchema, 
  insertSupportMessageSchema 
} from "@shared/schema";

// Class to handle support system storage operations using Supabase
export class SupabaseSupport {
  // Support Categories
  async getSupportCategories() {
    const { data, error } = await supabase
      .from('support_categories')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching support categories:', error);
      throw error;
    }
    
    return data || [];
  }
  
  // Support Tickets
  async getSupportTickets(userId: number, filters?: { status?: string }) {
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        support_categories(*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching support tickets:', error);
      throw error;
    }
    
    return data || [];
  }
  
  async getSupportTicketById(id: number) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_categories(*),
        support_messages(
          *,
          user:user_id(*)
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching support ticket with ID ${id}:`, error);
      throw error;
    }
    
    return data;
  }
  
  async createSupportTicket(ticketData: any) {
    const validatedData = insertSupportTicketSchema.parse({
      ...ticketData,
      user_id: ticketData.userId,
      company_id: ticketData.companyId,
      category_id: ticketData.categoryId
    });
    
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: validatedData.user_id,
        company_id: validatedData.company_id,
        category_id: validatedData.category_id,
        subject: validatedData.subject,
        status: validatedData.status,
        priority: validatedData.priority
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
    
    // Create initial message
    if (ticketData.message) {
      await this.createSupportMessage({
        ticketId: data.id,
        userId: data.user_id,
        message: ticketData.message,
        isStaff: false
      });
    }
    
    return data;
  }
  
  async updateSupportTicket(id: number, ticketData: any) {
    const updateData: any = {};
    
    // Only include valid fields for update
    if ('status' in ticketData) updateData.status = ticketData.status;
    if ('priority' in ticketData) updateData.priority = ticketData.priority;
    if ('subject' in ticketData) updateData.subject = ticketData.subject;
    if ('categoryId' in ticketData) updateData.category_id = ticketData.categoryId;
    if ('closedAt' in ticketData) {
      updateData.closed_at = ticketData.closedAt ? new Date(ticketData.closedAt).toISOString() : null;
    }
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating support ticket with ID ${id}:`, error);
      throw error;
    }
    
    return data;
  }
  
  // Support Messages
  async getSupportMessages(ticketId: number) {
    const { data, error } = await supabase
      .from('support_messages')
      .select(`
        *,
        user:user_id(*)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at');
      
    if (error) {
      console.error(`Error fetching messages for ticket ID ${ticketId}:`, error);
      throw error;
    }
    
    return data || [];
  }
  
  async createSupportMessage(messageData: any) {
    const validatedData = insertSupportMessageSchema.parse({
      ...messageData,
      ticket_id: messageData.ticketId,
      user_id: messageData.userId,
      is_staff: messageData.isStaff || false
    });
    
    // Insert the message
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: validatedData.ticket_id,
        user_id: validatedData.user_id,
        is_staff: validatedData.is_staff,
        message: validatedData.message,
        attachment_url: validatedData.attachment_url
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating support message:', error);
      throw error;
    }
    
    // Update the ticket's updated_at timestamp
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', validatedData.ticket_id);
    
    return data;
  }
  
  // Help Articles
  async getHelpArticles(filters?: { categoryId?: number, isPublished?: boolean }) {
    let query = supabase
      .from('help_articles')
      .select(`
        *,
        category:category_id(*)
      `)
      .order('title');
      
    if (filters) {
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      
      if (filters.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching help articles:', error);
      throw error;
    }
    
    return data || [];
  }
  
  async getHelpArticleBySlug(slug: string) {
    const { data, error } = await supabase
      .from('help_articles')
      .select(`
        *,
        category:category_id(*)
      `)
      .eq('slug', slug)
      .single();
      
    if (error && error.code !== 'PGRST116') { // Not found
      console.error(`Error fetching help article with slug ${slug}:`, error);
      throw error;
    }
    
    return data;
  }
  
  async getHelpArticleById(id: number) {
    const { data, error } = await supabase
      .from('help_articles')
      .select(`
        *,
        category:category_id(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching help article with ID ${id}:`, error);
      throw error;
    }
    
    return data;
  }
  
  async incrementArticleViews(id: number) {
    const { data, error } = await supabase.rpc('increment_article_views', { article_id: id });
    
    if (error) {
      console.error(`Error incrementing views for article ID ${id}:`, error);
      
      // Fall back to direct update if RPC fails
      const { data: updateData, error: updateError } = await supabase
        .from('help_articles')
        .update({ views: await this.getCurrentViews(id) + 1 })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) {
        console.error(`Error directly updating views for article ID ${id}:`, updateError);
        throw updateError;
      }
      
      return updateData;
    }
    
    return data;
  }
  
  // Helper method to get current views count
  private async getCurrentViews(id: number): Promise<number> {
    const { data, error } = await supabase
      .from('help_articles')
      .select('views')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error getting current views for article ID ${id}:`, error);
      return 0;
    }
    
    return data?.views || 0;
  }
}

// Create and export instance
export const supabaseSupport = new SupabaseSupport();