import { db } from './index';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { 
  supportCategories, 
  supportTickets, 
  supportMessages, 
  helpArticles 
} from '../shared/schema';

// Function to create tables directly
async function applySchema() {
  console.log('Creating support tables...');
  
  try {
    // Create support_categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS support_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('Created support_categories table');

    // Create support_tickets table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        company_id INTEGER REFERENCES companies(id),
        category_id INTEGER REFERENCES support_categories(id),
        subject TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        closed_at TIMESTAMP
      )
    `);
    console.log('Created support_tickets table');

    // Create support_messages table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES support_tickets(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        is_staff BOOLEAN DEFAULT false NOT NULL,
        message TEXT NOT NULL,
        attachment_url TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('Created support_messages table');

    // Create help_articles table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS help_articles (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES support_categories(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        is_published BOOLEAN DEFAULT true NOT NULL,
        views INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('Created help_articles table');

    // Seed initial support categories
    const existingCategories = await db.select().from(supportCategories);
    
    if (existingCategories.length === 0) {
      console.log('Seeding support categories...');
      await db.insert(supportCategories).values([
        { name: 'Account', description: 'Account management and profile issues', icon: 'user' },
        { name: 'Billing', description: 'Subscription and payment issues', icon: 'credit-card' },
        { name: 'Technical', description: 'Technical problems with the platform', icon: 'code' },
        { name: 'Feature Request', description: 'Suggestions for new features', icon: 'lightbulb' },
        { name: 'Data', description: 'Issues with data entry or reporting', icon: 'database' }
      ]);
      
      // Seed initial help articles
      console.log('Seeding help articles...');
      await db.insert(helpArticles).values([
        {
          categoryId: 1, // Account
          title: 'Getting Started with EcoMetrics',
          content: `
# Welcome to EcoMetrics

This guide will help you get started with using the EcoMetrics platform effectively.

## Setting Up Your Account

1. **Complete Your Profile**: Add your name, company details, and profile picture.
2. **Set Up Your Company**: Create or join your company to start tracking emissions.
3. **Invite Team Members**: Add colleagues to collaborate on emissions tracking.

## Next Steps

- Start tracking your first emissions data points
- Generate your first environmental report
- Explore recommendations for reducing your carbon footprint
          `,
          slug: 'getting-started',
          isPublished: true,
        },
        {
          categoryId: 3, // Technical
          title: 'Importing Emissions Data',
          content: `
# How to Import Emissions Data

This guide walks you through importing your existing emissions data into EcoMetrics.

## Supported File Formats

EcoMetrics supports importing data from:
- CSV files
- Excel spreadsheets
- API connections to common systems

## Step-by-Step Import Process

1. Navigate to the Emissions section
2. Click "Import Data"
3. Select your file or connect API
4. Map your data fields to our system
5. Review and confirm
          `,
          slug: 'importing-emissions-data',
          isPublished: true,
        }
      ]);
      
      console.log('Seeding completed successfully.');
    } else {
      console.log('Support categories already exist, skipping seed.');
    }

    console.log('Schema applied successfully!');
  } catch (error) {
    console.error('Error applying schema:', error);
  }
}

// Run the function
applySchema()
  .then(() => {
    console.log('Schema update complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to apply schema:', err);
    process.exit(1);
  });