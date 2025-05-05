import { db } from "@db";
import { 
  users, insertUserSchema, 
  companies, insertCompanySchema,
  emissions, insertEmissionSchema,
  emissionCategories,
  reports, insertReportSchema,
  subscriptionPlans, subscriptions
} from "@shared/schema";
import { eq, desc, and, between, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser: (id: number) => Promise<any>;
  getUserByUsername: (username: string) => Promise<any>;
  getUserByEmail: (email: string) => Promise<any>;
  createUser: (userData: any) => Promise<any>;
  updateUser: (id: number, userData: any) => Promise<any>;

  // Company methods
  getCompany: (id: number) => Promise<any>;
  createCompany: (companyData: any) => Promise<any>;
  updateCompany: (id: number, companyData: any) => Promise<any>;
  
  // Emissions methods
  getEmissions: (companyId: number, filters?: { startDate?: Date, endDate?: Date, scope?: string }) => Promise<any[]>;
  getEmissionById: (id: number) => Promise<any>;
  createEmission: (emissionData: any) => Promise<any>;
  updateEmission: (id: number, emissionData: any) => Promise<any>;
  
  // Categories methods
  getEmissionCategories: () => Promise<any[]>;
  
  // Reports methods
  getReports: (companyId: number) => Promise<any[]>;
  getReportById: (id: number) => Promise<any>;
  createReport: (reportData: any) => Promise<any>;
  
  // Subscription methods
  getSubscriptionPlans: () => Promise<any[]>;
  getCompanySubscription: (companyId: number) => Promise<any>;
  
  // Session store
  sessionStore: session.SessionStore;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'user_sessions'
    });
  }

  // User methods
  async getUser(id: number) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        company: true
      }
    });
  }

  async getUserByUsername(username: string) {
    return await db.query.users.findFirst({
      where: eq(users.username, username),
      with: {
        company: true
      }
    });
  }

  async getUserByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email)
    });
  }

  async createUser(userData: any) {
    const validatedData = insertUserSchema.parse(userData);
    const [user] = await db.insert(users).values(validatedData).returning();
    return user;
  }

  async updateUser(id: number, userData: any) {
    const [updatedUser] = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Company methods
  async getCompany(id: number) {
    return await db.query.companies.findFirst({
      where: eq(companies.id, id)
    });
  }

  async createCompany(companyData: any) {
    const validatedData = insertCompanySchema.parse(companyData);
    const [company] = await db.insert(companies).values(validatedData).returning();
    return company;
  }

  async updateCompany(id: number, companyData: any) {
    const [updatedCompany] = await db.update(companies)
      .set({ ...companyData, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  // Emissions methods
  async getEmissions(companyId: number, filters?: { startDate?: Date, endDate?: Date, scope?: string }) {
    let query = db.query.emissions.findMany({
      where: eq(emissions.companyId, companyId),
      with: {
        category: true,
        creator: true,
        verifier: true
      },
      orderBy: desc(emissions.date)
    });

    // Apply filters if provided
    if (filters) {
      if (filters.startDate && filters.endDate) {
        query = db.query.emissions.findMany({
          where: and(
            eq(emissions.companyId, companyId),
            between(emissions.date, filters.startDate, filters.endDate)
          ),
          with: {
            category: true,
            creator: true,
            verifier: true
          },
          orderBy: desc(emissions.date)
        });
      } else if (filters.startDate) {
        query = db.query.emissions.findMany({
          where: and(
            eq(emissions.companyId, companyId),
            gte(emissions.date, filters.startDate)
          ),
          with: {
            category: true,
            creator: true,
            verifier: true
          },
          orderBy: desc(emissions.date)
        });
      } else if (filters.endDate) {
        query = db.query.emissions.findMany({
          where: and(
            eq(emissions.companyId, companyId),
            lte(emissions.date, filters.endDate)
          ),
          with: {
            category: true,
            creator: true,
            verifier: true
          },
          orderBy: desc(emissions.date)
        });
      }
    }

    return await query;
  }

  async getEmissionById(id: number) {
    return await db.query.emissions.findFirst({
      where: eq(emissions.id, id),
      with: {
        category: true,
        creator: true,
        verifier: true
      }
    });
  }

  async createEmission(emissionData: any) {
    const validatedData = insertEmissionSchema.parse(emissionData);
    const [emission] = await db.insert(emissions).values(validatedData).returning();
    return emission;
  }

  async updateEmission(id: number, emissionData: any) {
    const [updatedEmission] = await db.update(emissions)
      .set({ ...emissionData, updatedAt: new Date() })
      .where(eq(emissions.id, id))
      .returning();
    return updatedEmission;
  }

  // Categories methods
  async getEmissionCategories() {
    return await db.query.emissionCategories.findMany();
  }

  // Reports methods
  async getReports(companyId: number) {
    return await db.query.reports.findMany({
      where: eq(reports.companyId, companyId),
      with: {
        creator: true
      },
      orderBy: desc(reports.createdAt)
    });
  }

  async getReportById(id: number) {
    return await db.query.reports.findFirst({
      where: eq(reports.id, id),
      with: {
        creator: true
      }
    });
  }

  async createReport(reportData: any) {
    const validatedData = insertReportSchema.parse(reportData);
    const [report] = await db.insert(reports).values(validatedData).returning();
    return report;
  }

  // Subscription methods
  async getSubscriptionPlans() {
    return await db.query.subscriptionPlans.findMany();
  }

  async getCompanySubscription(companyId: number) {
    return await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.companyId, companyId),
        eq(subscriptions.status, 'active')
      ),
      with: {
        plan: true
      }
    });
  }
}

export const storage = new DatabaseStorage();
