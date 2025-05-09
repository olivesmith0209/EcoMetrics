import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  language: text('language').default('en'),
  role: text('role').default('user').notNull(),
  companyId: integer('company_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Company profile
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  industry: text('industry'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  size: text('size'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscription plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  features: jsonb('features'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Company subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id),
  planId: integer('plan_id').notNull().references(() => subscriptionPlans.id),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Emission categories
export const emissionCategories = pgTable('emission_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  scope: text('scope').notNull(),
  description: text('description'),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Emissions data
export const emissions = pgTable('emissions', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id),
  categoryId: integer('category_id').notNull().references(() => emissionCategories.id),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit').default('tCO2e').notNull(),
  date: timestamp('date').notNull(),
  documentUrl: text('document_url'),
  verified: boolean('verified').default(false),
  verifiedBy: integer('verified_by').references(() => users.id),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reports
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: text('status').default('draft').notNull(),
  type: text('type').notNull(),
  data: jsonb('data'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  emissions: many(emissions),
  subscriptions: many(subscriptions),
  reports: many(reports),
}));

export const emissionsRelations = relations(emissions, ({ one }) => ({
  company: one(companies, {
    fields: [emissions.companyId],
    references: [companies.id],
  }),
  category: one(emissionCategories, {
    fields: [emissions.categoryId],
    references: [emissionCategories.id],
  }),
  creator: one(users, {
    fields: [emissions.createdBy],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [emissions.verifiedBy],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  company: one(companies, {
    fields: [subscriptions.companyId],
    references: [companies.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  company: one(companies, {
    fields: [reports.companyId],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [reports.createdBy],
    references: [users.id],
  }),
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users);

// Custom validation with Zod
export const userValidationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().optional(),
  language: z.string().optional(),
  role: z.string().optional(),
  companyId: z.number().optional(),
});

export const insertCompanySchema = createInsertSchema(companies);

// Custom validation for company
export const companyValidationSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  size: z.string().optional(),
});

export const insertEmissionSchema = createInsertSchema(emissions);

// Custom validation for emissions
export const emissionValidationSchema = z.object({
  companyId: z.number(),
  categoryId: z.number(),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  unit: z.string().optional(),
  date: z.date(),
  documentUrl: z.string().optional(),
  verified: z.boolean().optional(),
  verifiedBy: z.number().optional(),
  createdBy: z.number(),
});

export const insertReportSchema = createInsertSchema(reports);

// Custom validation for reports
export const reportValidationSchema = z.object({
  companyId: z.number(),
  name: z.string().min(3, "Report name must be at least 3 characters"),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.string().optional(),
  type: z.string(),
  data: z.any().optional(),
  createdBy: z.number(),
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type EmissionCategory = typeof emissionCategories.$inferSelect;
export type Emission = typeof emissions.$inferSelect;
export type InsertEmission = z.infer<typeof insertEmissionSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

// Support ticket and helpdesk schemas
export const supportCategories = pgTable('support_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  companyId: integer('company_id').references(() => companies.id),
  categoryId: integer('category_id').references(() => supportCategories.id),
  subject: text('subject').notNull(),
  status: text('status').notNull().default('open'),
  priority: text('priority').notNull().default('medium'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at')
});

export const supportMessages = pgTable('support_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => supportTickets.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  isStaff: boolean('is_staff').default(false).notNull(),
  message: text('message').notNull(),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const helpArticles = pgTable('help_articles', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => supportCategories.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  isPublished: boolean('is_published').default(true).notNull(),
  views: integer('views').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations for support tables
export const supportCategoriesRelations = relations(supportCategories, ({ many }) => ({
  tickets: many(supportTickets),
  articles: many(helpArticles)
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
  company: one(companies, { fields: [supportTickets.companyId], references: [companies.id] }),
  category: one(supportCategories, { fields: [supportTickets.categoryId], references: [supportCategories.id] }),
  messages: many(supportMessages)
}));

export const supportMessagesRelations = relations(supportMessages, ({ one }) => ({
  ticket: one(supportTickets, { fields: [supportMessages.ticketId], references: [supportTickets.id] }),
  user: one(users, { fields: [supportMessages.userId], references: [users.id] })
}));

export const helpArticlesRelations = relations(helpArticles, ({ one }) => ({
  category: one(supportCategories, { fields: [helpArticles.categoryId], references: [supportCategories.id] })
}));

// Validation schemas for support tables
export const insertSupportCategorySchema = createInsertSchema(supportCategories);
export const supportCategoryValidationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  icon: z.string().optional()
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets);
export const supportTicketValidationSchema = z.object({
  userId: z.number().int().positive(),
  companyId: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  status: z.enum(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']).default('open'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

export const insertSupportMessageSchema = createInsertSchema(supportMessages);
export const supportMessageValidationSchema = z.object({
  ticketId: z.number().int().positive(),
  userId: z.number().int().positive(),
  isStaff: z.boolean().default(false),
  message: z.string().min(1, "Message is required"),
  attachmentUrl: z.string().optional()
});

export const insertHelpArticleSchema = createInsertSchema(helpArticles);
export const helpArticleValidationSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  isPublished: z.boolean().default(true)
});

export type SupportCategory = typeof supportCategories.$inferSelect;
export type InsertSupportCategory = z.infer<typeof insertSupportCategorySchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;

export type HelpArticle = typeof helpArticles.$inferSelect;
export type InsertHelpArticle = z.infer<typeof insertHelpArticleSchema>;
