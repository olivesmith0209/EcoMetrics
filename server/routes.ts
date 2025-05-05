import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { format } from "date-fns";
import multer from "multer";
import { z } from "zod";
import { insertEmissionSchema, insertReportSchema } from "@shared/schema";
import fs from "fs";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.originalname.split('.').pop();
      cb(null, `avatar-${uniqueSuffix}.${ext}`);
    }
  }),
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB limit for avatars
  },
  fileFilter: function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      // Instead of passing an error, just return false with a message
      return cb(null, false);
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API prefix
  const apiPrefix = "/api";

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Middleware to check if user has a company
  const requireCompany = async (req: any, res: any, next: any) => {
    if (!req.user.companyId) {
      return res.status(400).json({ message: "Company required to access this resource" });
    }
    next();
  };

  // ===== Company Routes =====
  
  // Get user's company
  app.get(`${apiPrefix}/company`, requireAuth, async (req, res) => {
    try {
      if (!req.user.companyId) {
        return res.status(404).json({ message: "No company associated with user" });
      }
      
      const company = await storage.getCompany(req.user.companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Create company
  app.post(`${apiPrefix}/company`, requireAuth, async (req, res) => {
    try {
      // Create company
      const company = await storage.createCompany(req.body);
      
      // Update user with company ID
      await storage.updateUser(req.user.id, { companyId: company.id });
      
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  // Update company
  app.patch(`${apiPrefix}/company/:id`, requireAuth, requireCompany, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      
      // Verify user belongs to this company
      if (req.user.companyId !== companyId) {
        return res.status(403).json({ message: "Not authorized to update this company" });
      }
      
      const updatedCompany = await storage.updateCompany(companyId, req.body);
      res.json(updatedCompany);
    } catch (error) {
      console.error("Error updating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // ===== Emission Categories Routes =====
  
  // Get all emission categories
  app.get(`${apiPrefix}/emission-categories`, requireAuth, async (req, res) => {
    try {
      const categories = await storage.getEmissionCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching emission categories:", error);
      res.status(500).json({ message: "Failed to fetch emission categories" });
    }
  });

  // ===== Emissions Routes =====
  
  // Get emissions with optional filtering
  app.get(`${apiPrefix}/emissions`, requireAuth, requireCompany, async (req, res) => {
    try {
      const { startDate, endDate, scope } = req.query;
      
      // Parse filter parameters
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (scope) filters.scope = scope as string;
      
      const emissions = await storage.getEmissions(req.user.companyId, filters);
      res.json(emissions);
    } catch (error) {
      console.error("Error fetching emissions:", error);
      res.status(500).json({ message: "Failed to fetch emissions" });
    }
  });

  // Get emissions summary
  app.get(`${apiPrefix}/emissions/summary`, requireAuth, requireCompany, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Parse filter parameters
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const emissions = await storage.getEmissions(req.user.companyId, filters);
      
      // Calculate summary
      const summary = {
        total: 0,
        scope1: 0,
        scope2: 0,
        scope3: 0,
        byCategory: {} as Record<string, { amount: number, name: string, scope: string }>
      };
      
      emissions.forEach(emission => {
        const amount = parseFloat(emission.amount.toString());
        summary.total += amount;
        
        // Add to scope total
        if (emission.category.scope === 'Scope 1') {
          summary.scope1 += amount;
        } else if (emission.category.scope === 'Scope 2') {
          summary.scope2 += amount;
        } else if (emission.category.scope === 'Scope 3') {
          summary.scope3 += amount;
        }
        
        // Add to category breakdown
        const categoryId = emission.category.id;
        if (!summary.byCategory[categoryId]) {
          summary.byCategory[categoryId] = {
            amount: 0,
            name: emission.category.name,
            scope: emission.category.scope
          };
        }
        summary.byCategory[categoryId].amount += amount;
      });
      
      // Convert byCategory to array and calculate percentages
      const categoriesArray = Object.values(summary.byCategory).map(category => {
        return {
          ...category,
          percentage: summary.total > 0 ? (category.amount / summary.total * 100).toFixed(1) : 0
        };
      });
      
      res.json({
        ...summary,
        byCategory: categoriesArray
      });
    } catch (error) {
      console.error("Error calculating emissions summary:", error);
      res.status(500).json({ message: "Failed to calculate emissions summary" });
    }
  });

  // Get a single emission
  app.get(`${apiPrefix}/emissions/:id`, requireAuth, requireCompany, async (req, res) => {
    try {
      const emissionId = parseInt(req.params.id);
      const emission = await storage.getEmissionById(emissionId);
      
      if (!emission) {
        return res.status(404).json({ message: "Emission not found" });
      }
      
      // Check if user's company owns this emission
      if (emission.companyId !== req.user.companyId) {
        return res.status(403).json({ message: "Not authorized to access this emission" });
      }
      
      res.json(emission);
    } catch (error) {
      console.error("Error fetching emission:", error);
      res.status(500).json({ message: "Failed to fetch emission" });
    }
  });

  // Create a new emission
  app.post(
    `${apiPrefix}/emissions`, 
    requireAuth, 
    requireCompany, 
    upload.single('document'),
    async (req, res) => {
      try {
        // Add required fields
        const emissionData = {
          ...req.body,
          amount: parseFloat(req.body.amount),
          date: new Date(req.body.date),
          companyId: req.user.companyId,
          createdBy: req.user.id,
          categoryId: parseInt(req.body.categoryId),
          verified: req.body.verified === 'true'
        };
        
        // If a document was uploaded, process it (in a real app, upload to storage)
        if (req.file) {
          // Simulate storing document URL
          emissionData.documentUrl = `documents/${req.file.originalname}`;
        }
        
        // Validate and create emission
        const validatedData = insertEmissionSchema.parse(emissionData);
        const emission = await storage.createEmission(validatedData);
        
        res.status(201).json(emission);
      } catch (error) {
        console.error("Error creating emission:", error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: "Failed to create emission" });
      }
    }
  );

  // Update an emission
  app.patch(
    `${apiPrefix}/emissions/:id`, 
    requireAuth, 
    requireCompany,
    upload.single('document'),
    async (req, res) => {
      try {
        const emissionId = parseInt(req.params.id);
        const emission = await storage.getEmissionById(emissionId);
        
        if (!emission) {
          return res.status(404).json({ message: "Emission not found" });
        }
        
        // Check if user's company owns this emission
        if (emission.companyId !== req.user.companyId) {
          return res.status(403).json({ message: "Not authorized to update this emission" });
        }
        
        // Parse numeric and date fields
        const emissionData = {
          ...req.body,
          amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
          date: req.body.date ? new Date(req.body.date) : undefined,
          categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
          verified: req.body.verified !== undefined ? req.body.verified === 'true' : undefined
        };
        
        // If a document was uploaded, process it
        if (req.file) {
          // Simulate storing document URL
          emissionData.documentUrl = `documents/${req.file.originalname}`;
        }
        
        // Update emission
        const updatedEmission = await storage.updateEmission(emissionId, emissionData);
        
        res.json(updatedEmission);
      } catch (error) {
        console.error("Error updating emission:", error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: "Failed to update emission" });
      }
    }
  );

  // ===== Reports Routes =====
  
  // Get all reports for a company
  app.get(`${apiPrefix}/reports`, requireAuth, requireCompany, async (req, res) => {
    try {
      const reports = await storage.getReports(req.user.companyId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Get a single report
  app.get(`${apiPrefix}/reports/:id`, requireAuth, requireCompany, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getReportById(reportId);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Check if user's company owns this report
      if (report.companyId !== req.user.companyId) {
        return res.status(403).json({ message: "Not authorized to access this report" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  // Create a new report
  app.post(`${apiPrefix}/reports`, requireAuth, requireCompany, async (req, res) => {
    try {
      // Add required fields
      const reportData = {
        ...req.body,
        companyId: req.user.companyId,
        createdBy: req.user.id,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate)
      };
      
      // Validate and create report
      const validatedData = insertReportSchema.parse(reportData);
      const report = await storage.createReport(validatedData);
      
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // ===== User Routes =====
  
  // Update user profile
  app.patch(`${apiPrefix}/user/:id`, requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verify user is updating their own profile
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Not authorized to update this user" });
      }
      
      // Extract user data from request body 
      // Only include fields that are present in the request
      const userData: Record<string, any> = {};
      
      if (req.body.firstName !== undefined) userData.firstName = req.body.firstName;
      if (req.body.lastName !== undefined) userData.lastName = req.body.lastName;
      if (req.body.email !== undefined) userData.email = req.body.email;
      if (req.body.language !== undefined) userData.language = req.body.language;
      if (req.body.avatarUrl !== undefined) userData.avatarUrl = req.body.avatarUrl;
      
      // Don't update if no data was provided
      if (Object.keys(userData).length === 0) {
        return res.status(400).json({ message: "No valid update fields provided" });
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      // Return a simplified user object to avoid any circular references
      res.json({
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        language: updatedUser.language,
        username: updatedUser.username,
        companyId: updatedUser.companyId,
        avatarUrl: updatedUser.avatarUrl
      });
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Upload avatar image
  app.post(`${apiPrefix}/user/:id/avatar`, requireAuth, upload.single('avatar'), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verify user is updating their own profile
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Not authorized to update this user" });
      }
      
      // Check if file was provided
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // In a real application, we would upload to a proper storage solution
      // For now, we'll just use our local server's URL
      // We need to use a full URL path since it's an absolute URL
      const avatarUrl = `/uploads/${req.file.filename}`;
      
      // Update user with avatar URL
      const userData = { avatarUrl };
      const updatedUser = await storage.updateUser(userId, userData);
      
      res.json({
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        language: updatedUser.language,
        username: updatedUser.username,
        companyId: updatedUser.companyId,
        avatarUrl: updatedUser.avatarUrl
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });

  // ===== Subscription Routes =====
  
  // Get all subscription plans
  app.get(`${apiPrefix}/subscription-plans`, async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Get company's active subscription
  app.get(`${apiPrefix}/subscription`, requireAuth, requireCompany, async (req, res) => {
    try {
      const subscription = await storage.getCompanySubscription(req.user.companyId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
