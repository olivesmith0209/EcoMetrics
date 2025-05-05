import { supabase } from './supabase';

// This file contains functions to create and set up Supabase tables for the support system

// Create support categories table
export async function createSupportCategoriesTable() {
  const { error } = await supabase.rpc('create_support_categories_table');
  
  if (error) {
    console.error('Error creating support_categories table:', error);
    
    // If the RPC doesn't exist, create the table directly
    const { error: createError } = await supabase
      .query(`
        CREATE TABLE IF NOT EXISTS support_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
        );
      `);
      
    if (createError) {
      console.error('Error directly creating support_categories table:', createError);
      throw createError;
    }
  }
  
  console.log('Support categories table created or already exists');
}

// Create support tickets table
export async function createSupportTicketsTable() {
  const { error } = await supabase.rpc('create_support_tickets_table');
  
  if (error) {
    console.error('Error creating support_tickets table:', error);
    
    // If the RPC doesn't exist, create the table directly
    const { error: createError } = await supabase
      .query(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          company_id INTEGER,
          category_id INTEGER REFERENCES support_categories(id),
          subject TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          priority TEXT NOT NULL DEFAULT 'medium',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
          closed_at TIMESTAMP WITH TIME ZONE
        );
      `);
      
    if (createError) {
      console.error('Error directly creating support_tickets table:', createError);
      throw createError;
    }
  }
  
  console.log('Support tickets table created or already exists');
}

// Create support messages table
export async function createSupportMessagesTable() {
  const { error } = await supabase.rpc('create_support_messages_table');
  
  if (error) {
    console.error('Error creating support_messages table:', error);
    
    // If the RPC doesn't exist, create the table directly
    const { error: createError } = await supabase
      .query(`
        CREATE TABLE IF NOT EXISTS support_messages (
          id SERIAL PRIMARY KEY,
          ticket_id INTEGER REFERENCES support_tickets(id) NOT NULL,
          user_id INTEGER NOT NULL,
          is_staff BOOLEAN DEFAULT FALSE NOT NULL,
          message TEXT NOT NULL,
          attachment_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
        );
      `);
      
    if (createError) {
      console.error('Error directly creating support_messages table:', createError);
      throw createError;
    }
  }
  
  console.log('Support messages table created or already exists');
}

// Create help articles table
export async function createHelpArticlesTable() {
  const { error } = await supabase.rpc('create_help_articles_table');
  
  if (error) {
    console.error('Error creating help_articles table:', error);
    
    // If the RPC doesn't exist, create the table directly
    const { error: createError } = await supabase
      .query(`
        CREATE TABLE IF NOT EXISTS help_articles (
          id SERIAL PRIMARY KEY,
          category_id INTEGER REFERENCES support_categories(id),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          is_published BOOLEAN DEFAULT TRUE NOT NULL,
          views INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
        );
      `);
      
    if (createError) {
      console.error('Error directly creating help_articles table:', createError);
      throw createError;
    }
  }
  
  console.log('Help articles table created or already exists');
}

// Create all support system tables
export async function createSupportTables() {
  try {
    await createSupportCategoriesTable();
    await createSupportTicketsTable();
    await createSupportMessagesTable();
    await createHelpArticlesTable();
    console.log('All support system tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating support system tables:', error);
    return false;
  }
}

// Seed initial support categories if needed
export async function seedSupportCategories() {
  const categories = [
    { name: 'Account', description: 'Questions related to your account settings and profile', icon: 'user' },
    { name: 'Billing', description: 'Questions about payments, subscriptions, and invoices', icon: 'credit-card' },
    { name: 'Technical', description: 'Technical issues and questions about the platform', icon: 'code' },
    { name: 'Data', description: 'Questions about emissions data and reporting', icon: 'database' },
    { name: 'Other', description: 'Any other questions or issues', icon: 'help-circle' }
  ];
  
  for (const category of categories) {
    const { data, error } = await supabase
      .from('support_categories')
      .select('name')
      .eq('name', category.name)
      .maybeSingle();
      
    if (error) {
      console.error(`Error checking if category '${category.name}' exists:`, error);
      continue;
    }
    
    if (!data) {
      const { error: insertError } = await supabase
        .from('support_categories')
        .insert(category);
        
      if (insertError) {
        console.error(`Error inserting category '${category.name}':`, insertError);
      } else {
        console.log(`Category '${category.name}' created successfully`);
      }
    }
  }
  
  console.log('Support categories seeded');
}

// Seed initial help articles if needed
export async function seedHelpArticles() {
  // Check if articles exist
  const { data, error } = await supabase
    .from('help_articles')
    .select('id')
    .limit(1);
    
  if (error) {
    console.error('Error checking if help articles exist:', error);
    return;
  }
  
  // Only seed if no articles exist
  if (data && data.length > 0) {
    console.log('Help articles already exist, skipping seed');
    return;
  }
  
  // Get category IDs
  const { data: categories, error: catError } = await supabase
    .from('support_categories')
    .select('id, name');
    
  if (catError || !categories) {
    console.error('Error fetching categories for seeding articles:', catError);
    return;
  }
  
  const getCategoryId = (name: string) => {
    const category = categories.find(c => c.name === name);
    return category ? category.id : null;
  };
  
  const articles = [
    {
      title: 'Getting Started with EcoMetrics',
      slug: 'getting-started',
      category_id: getCategoryId('Technical'),
      content: `# Welcome to EcoMetrics

EcoMetrics is your comprehensive solution for tracking, analyzing, and improving your carbon footprint. This guide will help you get started with the platform.

## First Steps

1. **Complete your profile**: Update your user profile and company information
2. **Set up your emissions categories**: Customize the categories that are relevant to your business
3. **Enter initial data**: Begin by entering historical emissions data if available
4. **Generate your first report**: Use the reporting tools to see your baseline emissions

## Key Features

- **Real-time dashboard**: Monitor your emissions with up-to-date visualizations
- **Detailed reporting**: Generate reports for internal use or compliance requirements
- **Reduction strategies**: Get AI-powered recommendations to reduce your carbon footprint
- **Collaboration tools**: Invite team members to contribute to your sustainability efforts

Need more help? Contact our support team through the Support Center.`,
      is_published: true
    },
    {
      title: 'Importing Emissions Data',
      slug: 'importing-emissions-data',
      category_id: getCategoryId('Data'),
      content: `# Importing Your Emissions Data

EcoMetrics makes it easy to import your existing emissions data. Follow this guide to get started.

## Supported File Formats

- CSV (Comma Separated Values)
- Excel spreadsheets (.xlsx)
- JSON data files

## Import Process

1. **Prepare your data**: Make sure your data follows our template format
2. **Upload your file**: Go to the Emissions page and click "Import Data"
3. **Map columns**: Match your data columns to our system fields
4. **Verify**: Review the imported data for accuracy
5. **Confirm**: Complete the import process

## Data Requirements

For successful imports, your data should include:

- Date of emission
- Emission category
- Amount of emission
- Unit of measurement (default is tCO2e)
- Source description (optional)

## Common Issues

- **Unrecognized units**: Make sure to use standard units or provide conversion factors
- **Missing dates**: All emissions must have an associated date
- **Category mismatches**: Map your categories to our system categories

For large datasets or custom import needs, please contact our support team.`,
      is_published: true
    }
  ];
  
  for (const article of articles) {
    const { error: insertError } = await supabase
      .from('help_articles')
      .insert(article);
      
    if (insertError) {
      console.error(`Error inserting article '${article.title}':`, insertError);
    } else {
      console.log(`Article '${article.title}' created successfully`);
    }
  }
  
  console.log('Help articles seeded');
}

// Initialize support system tables and data
export async function initializeSupportSystem() {
  try {
    const tablesCreated = await createSupportTables();
    if (tablesCreated) {
      await seedSupportCategories();
      await seedHelpArticles();
    }
    console.log('Support system initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing support system:', error);
    return false;
  }
}