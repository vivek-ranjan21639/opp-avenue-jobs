/**
 * Route Generator Script for Prerendering
 * 
 * This script fetches all dynamic routes from Supabase database
 * and generates a routes.json file used by vite-plugin-prerender.
 * 
 * Run with: npx tsx scripts/generate-routes.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase configuration - uses service role key for build-time access
const SUPABASE_URL = "https://nudjyemktgioxmxwnxev.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function generateRoutes(): Promise<string[]> {
  console.log('🔍 Starting route discovery...\n');
  
  // 1. Static routes that always exist
  const staticRoutes = [
    '/',
    '/about',
    '/advertise',
    '/blogs',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
    '/cookie-policy',
    '/sitemap',
    '/resources',
    '/resources/career-guides',
    '/resources/resume-templates',
    '/resources/interview-tips',
    '/resources/industry-reports'
  ];
  console.log(`📄 Static routes: ${staticRoutes.length}`);
  
  // 2. Fetch all active jobs (non-deleted, non-expired)
  const today = new Date().toISOString().split('T')[0];
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id')
    .is('deleted_at', null)
    .or(`deadline.is.null,deadline.gte.${today}`);
  
  if (jobsError) {
    console.error('Error fetching jobs:', jobsError);
    throw jobsError;
  }
  
  const jobRoutes = (jobs || []).map(job => `/job/${job.id}`);
  console.log(`💼 Job routes: ${jobRoutes.length}`);
  
  // 3. Fetch all published blogs
  const { data: blogs, error: blogsError } = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published');
  
  if (blogsError) {
    console.error('Error fetching blogs:', blogsError);
    throw blogsError;
  }
  
  const blogRoutes = (blogs || []).map(blog => `/blog/${blog.slug}`);
  console.log(`📝 Blog routes: ${blogRoutes.length}`);
  
  // Combine all routes
  const allRoutes = [...staticRoutes, ...jobRoutes, ...blogRoutes];
  
  console.log(`\n✅ Total routes to prerender: ${allRoutes.length}\n`);
  
  return allRoutes;
}

async function main() {
  try {
    const routes = await generateRoutes();
    
    // Write routes to JSON file
    const outputPath = path.join(__dirname, 'routes.json');
    fs.writeFileSync(outputPath, JSON.stringify(routes, null, 2));
    
    console.log(`📁 Routes written to: ${outputPath}`);
    console.log('\nRoute breakdown:');
    console.log('  - Static pages:', routes.filter(r => !r.startsWith('/job/') && !r.startsWith('/blog/')).length);
    console.log('  - Job pages:', routes.filter(r => r.startsWith('/job/')).length);
    console.log('  - Blog pages:', routes.filter(r => r.startsWith('/blog/')).length);
    
  } catch (error) {
    console.error('Failed to generate routes:', error);
    process.exit(1);
  }
}

main();
