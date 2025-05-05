import { supabase } from './supabase';

// This file contains functions to create and set up Supabase tables for the support system

// Create support categories table
export async function createSupportCategoriesTable() {
  // Check if table exists first
  const { error: checkError } = await supabase
    .from('support_categories')
    .select('count')
    .limit(1);
    
  // If there's an error, log it - it's likely that the table doesn't exist
  if (checkError) {
    console.error('Error checking support_categories table:', checkError);
  }
  
  // If table doesn't exist or any error occurs, try to create/recreate it
  // (Note: In an actual production environment, we would use Supabase migrations)
  try {
    // Insert a record to force table creation with appropriate schema
    const { data, error } = await supabase
      .from('support_categories')
      .insert({
        name: 'General',
        description: 'General questions and information',
        icon: 'help-circle'
      })
      .select()
      .maybeSingle();
      
    if (error) {
      console.error('Error creating support_categories table:', error);
    } else {
      console.log('Support categories table initialized successfully');
    }
  } catch (err) {
    console.error('Error during support_categories table creation attempt:', err);
  }
  
  console.log('Support categories table setup complete');
}

// Create support tickets table
export async function createSupportTicketsTable() {
  // Check if table exists first
  const { error: checkError } = await supabase
    .from('support_tickets')
    .select('count')
    .limit(1);
    
  // If there's an error, log it - it's likely that the table doesn't exist
  if (checkError) {
    console.error('Error checking support_tickets table:', checkError);
  }
  
  // Try to create the table by inserting a record (this will automatically create the table with appropriate schema)
  try {
    // First get a category id to use as foreign key
    const { data: category, error: catError } = await supabase
      .from('support_categories')
      .select('id')
      .limit(1)
      .single();
      
    if (catError) {
      console.error('Error getting category for support_tickets table initialization:', catError);
    }
      
    const categoryId = category?.id;
    
    // Try to insert a record to create the table
    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: 1,
        subject: 'Table Initialization',
        status: 'open',
        priority: 'medium',
        ...(categoryId && { category_id: categoryId })
      });
      
    if (error) {
      console.error('Error creating support_tickets table:', error);
    } else {
      console.log('Support tickets table initialized successfully');
      
      // Clean up the test record if created
      try {
        await supabase
          .from('support_tickets')
          .delete()
          .eq('subject', 'Table Initialization');
      } catch (cleanupError) {
        console.error('Error cleaning up test ticket:', cleanupError);
      }
    }
  } catch (err) {
    console.error('Error during support_tickets table creation attempt:', err);
  }
  
  console.log('Support tickets table setup complete');
}

// Create support messages table
export async function createSupportMessagesTable() {
  // Check if table exists first
  const { error: checkError } = await supabase
    .from('support_messages')
    .select('count')
    .limit(1);
    
  // If there's an error, log it - it's likely that the table doesn't exist
  if (checkError) {
    console.error('Error checking support_messages table:', checkError);
  }
  
  // Try to create the table by inserting a record (this will automatically create the table with appropriate schema)
  try {
    // First get a ticket id to use as foreign key
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('id')
      .limit(1)
      .single();
      
    if (ticketError) {
      console.error('Error getting ticket for support_messages table initialization:', ticketError);
    }
    
    if (ticket) {
      // Try to insert a record to create the table
      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          user_id: 1,
          is_staff: false,
          message: 'Table Initialization'
        });
        
      // It's okay if this fails with "already exists"
      if (error && !error.message.includes('already exists')) {
        console.error('Error creating support_messages table:', error);
      } else {
        console.log('Support messages table initialized successfully');
        
        // Clean up the test record if created
        try {
          await supabase
            .from('support_messages')
            .delete()
            .eq('message', 'Table Initialization');
        } catch (cleanupError) {
          console.error('Error cleaning up test message:', cleanupError);
        }
      }
    }
  } catch (err) {
    console.error('Error during support_messages table creation attempt:', err);
  }
  
  console.log('Support messages table setup complete');
}

// Create help articles table
export async function createHelpArticlesTable() {
  // Check if table exists first
  const { error: checkError } = await supabase
    .from('help_articles')
    .select('count')
    .limit(1);
    
  // If there's an error, log it - it's likely that the table doesn't exist
  if (checkError) {
    console.error('Error checking help_articles table:', checkError);
  }
  
  // Try to create the table by inserting a record
  try {
    // First get a category id to use as foreign key
    const { data: category, error: catError } = await supabase
      .from('support_categories')
      .select('id')
      .limit(1)
      .single();
      
    if (catError) {
      console.error('Error getting category for help_articles table initialization:', catError);
    }
    
    const categoryId = category?.id;
    
    // Try to insert a record to create the table
    const { error } = await supabase
      .from('help_articles')
      .insert({
        title: 'Table Initialization',
        content: 'This is a test article for table initialization.',
        slug: 'table-initialization',
        is_published: false,
        ...(categoryId && { category_id: categoryId })
      });
      
    // It's okay if this fails with "already exists"
    if (error && !error.message.includes('already exists')) {
      console.error('Error creating help_articles table:', error);
    } else {
      console.log('Help articles table initialized successfully');
      
      // Clean up the test record
      try {
        await supabase
          .from('help_articles')
          .delete()
          .eq('slug', 'table-initialization');
      } catch (cleanupError) {
        console.error('Error cleaning up test article:', cleanupError);
      }
    }
  } catch (err) {
    console.error('Error during help_articles table creation attempt:', err);
  }
  
  console.log('Help articles table setup complete');
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