import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // Create subscription plans
    const basicPlan = await createPlanIfNotExists({
      name: "Basic",
      description: "Access to CO₂ data, report generation, and settings.",
      price: "0",
      features: JSON.stringify([
        "CO₂ data tracking", 
        "Basic reports", 
        "User settings"
      ]),
    });

    const proPlan = await createPlanIfNotExists({
      name: "Pro",
      description: "Extended features like advanced data visualizations, API integration, report templates, and notifications.",
      price: "49.99",
      features: JSON.stringify([
        "All Basic features", 
        "Advanced data visualizations", 
        "API integration", 
        "Report templates", 
        "Notifications"
      ]),
    });

    const enterprisePlan = await createPlanIfNotExists({
      name: "Enterprise",
      description: "Full access to all features, including AI-driven predictions, team management, and custom API integrations.",
      price: "99.99",
      features: JSON.stringify([
        "All Pro features", 
        "AI-driven predictions", 
        "Team management", 
        "Custom API integrations", 
        "Dedicated support"
      ]),
    });

    // Create emission categories
    await createCategoriesIfNotExist();

    // Create demo company
    const demoCompany = await createCompanyIfNotExists({
      name: "EcoMetrics Demo Corp",
      industry: "Technology",
      address: "123 Green Street",
      city: "Sustainable City",
      country: "USA",
      size: "51-200",
    });

    // Create demo users
    const hashedPassword = await hashPassword("password123");

    const adminUser = await createUserIfNotExists({
      username: "admin",
      password: hashedPassword,
      email: "admin@ecometrics.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      companyId: demoCompany.id,
    });

    const regularUser = await createUserIfNotExists({
      username: "user",
      password: hashedPassword,
      email: "user@ecometrics.com",
      firstName: "Regular",
      lastName: "User",
      role: "user",
      companyId: demoCompany.id,
    });

    // Create company subscription
    await createSubscriptionIfNotExists({
      companyId: demoCompany.id,
      planId: proPlan.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: "active",
    });

    // Create sample emissions data
    await createSampleEmissions(demoCompany.id, adminUser.id);

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function createPlanIfNotExists(planData: any) {
  const existingPlan = await db.query.subscriptionPlans.findFirst({
    where: (plans, { eq }) => eq(plans.name, planData.name)
  });

  if (existingPlan) {
    console.log(`Plan ${planData.name} already exists, skipping creation`);
    return existingPlan;
  }

  const [plan] = await db.insert(schema.subscriptionPlans).values(planData).returning();
  console.log(`Created plan: ${plan.name}`);
  return plan;
}

async function createCategoriesIfNotExist() {
  const categories = [
    { name: "Electricity", scope: "Scope 2", description: "Electricity consumption", icon: "ri-flashlight-line" },
    { name: "Natural Gas", scope: "Scope 1", description: "Natural gas consumption", icon: "ri-fire-line" },
    { name: "Fleet Vehicles", scope: "Scope 1", description: "Company fleet vehicles", icon: "ri-car-line" },
    { name: "Heating", scope: "Scope 2", description: "Heating of facilities", icon: "ri-home-heat-line" },
    { name: "Business Travel", scope: "Scope 3", description: "Air travel, hotel stays, etc.", icon: "ri-flight-takeoff-line" },
    { name: "Purchased Goods", scope: "Scope 3", description: "Products and services purchased", icon: "ri-shopping-bag-line" },
    { name: "Waste Generated", scope: "Scope 3", description: "Waste disposal and treatment", icon: "ri-delete-bin-line" },
    { name: "Employee Commuting", scope: "Scope 3", description: "Employee travel to and from work", icon: "ri-road-map-line" },
    { name: "Other", scope: "Scope 1", description: "Other Scope 1 emissions", icon: "ri-more-2-line" },
  ];

  for (const category of categories) {
    const existingCategory = await db.query.emissionCategories.findFirst({
      where: (cats, { eq, and }) => and(eq(cats.name, category.name), eq(cats.scope, category.scope))
    });

    if (existingCategory) {
      console.log(`Category ${category.name} (${category.scope}) already exists, skipping creation`);
      continue;
    }

    await db.insert(schema.emissionCategories).values(category);
    console.log(`Created category: ${category.name} (${category.scope})`);
  }
}

async function createCompanyIfNotExists(companyData: any) {
  const existingCompany = await db.query.companies.findFirst({
    where: (companies, { eq }) => eq(companies.name, companyData.name)
  });

  if (existingCompany) {
    console.log(`Company ${companyData.name} already exists, skipping creation`);
    return existingCompany;
  }

  const [company] = await db.insert(schema.companies).values(companyData).returning();
  console.log(`Created company: ${company.name}`);
  return company;
}

async function createUserIfNotExists(userData: any) {
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, userData.username)
  });

  if (existingUser) {
    console.log(`User ${userData.username} already exists, skipping creation`);
    return existingUser;
  }

  const [user] = await db.insert(schema.users).values(userData).returning();
  console.log(`Created user: ${user.username}`);
  return user;
}

async function createSubscriptionIfNotExists(subscriptionData: any) {
  const existingSubscription = await db.query.subscriptions.findFirst({
    where: (subs, { eq, and }) => and(
      eq(subs.companyId, subscriptionData.companyId),
      eq(subs.planId, subscriptionData.planId),
      eq(subs.status, "active")
    )
  });

  if (existingSubscription) {
    console.log(`Active subscription already exists for company ${subscriptionData.companyId}, skipping creation`);
    return existingSubscription;
  }

  const [subscription] = await db.insert(schema.subscriptions).values(subscriptionData).returning();
  console.log(`Created subscription for company ${subscription.companyId}`);
  return subscription;
}

async function createSampleEmissions(companyId: number, userId: number) {
  // Get all categories
  const categories = await db.query.emissionCategories.findMany();
  const categoriesMap = categories.reduce((acc, cat) => {
    if (!acc[cat.scope]) acc[cat.scope] = [];
    acc[cat.scope].push(cat);
    return acc;
  }, {} as Record<string, typeof categories>);

  // Sample emissions data for the past 6 months
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Check if emissions already exist
  const existingEmissions = await db.query.emissions.findMany({
    where: (emissions, { eq }) => eq(emissions.companyId, companyId)
  });

  if (existingEmissions.length > 0) {
    console.log(`${existingEmissions.length} emissions already exist for company ${companyId}, skipping creation`);
    return;
  }

  // Create 30 sample emissions
  const emissionsData = [];
  for (let i = 0; i < 30; i++) {
    // Random date in the past 6 months
    const date = new Date(
      sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    );
    
    // Select random scope and category
    const scope = ["Scope 1", "Scope 2", "Scope 3"][Math.floor(Math.random() * 3)];
    const scopeCategories = categoriesMap[scope] || categories;
    const category = scopeCategories[Math.floor(Math.random() * scopeCategories.length)];
    
    // Random emission amount between 1 and 20
    const amount = (1 + Math.random() * 19).toFixed(1);
    
    // 70% chance of being verified
    const verified = Math.random() < 0.7;
    
    emissionsData.push({
      companyId,
      categoryId: category.id,
      description: `Sample ${category.name} emission`,
      amount,
      date,
      verified,
      verifiedBy: verified ? userId : null,
      createdBy: userId,
    });
  }

  await db.insert(schema.emissions).values(emissionsData);
  console.log(`Created ${emissionsData.length} sample emissions for company ${companyId}`);
}

seed();
