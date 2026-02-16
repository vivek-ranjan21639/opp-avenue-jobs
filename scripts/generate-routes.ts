/**
 * Route Generator Script
 * 
 * Fetches all dynamic routes from Supabase and generates routes.json.
 * Falls back to static routes if database is unavailable.
 * 
 * Run with: npx tsx scripts/generate-routes.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://nudjyemktgioxmxwnxev.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const FALLBACK_STATIC_ROUTES = [
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

async function generateRoutes(): Promise<string[]> {
  if (!SUPABASE_KEY) {
    console.warn('⚠️ No Supabase key found. Using static routes only.');
    return FALLBACK_STATIC_ROUTES;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('🔍 Starting route discovery...\n');

  let staticRoutes: string[] = ['/'];
  let jobRoutes: string[] = [];
  let blogRoutes: string[] = [];

  // Fetch static routes from DB
  try {
    const { data: routes, error } = await supabase
      .from('static_routes')
      .select('path')
      .eq('is_active', true)
      .order('path');

    if (error) {
      console.warn('⚠️ Error fetching static routes:', error.message);
      staticRoutes = FALLBACK_STATIC_ROUTES;
    } else {
      staticRoutes = ['/', ...(routes || []).map(r => r.path)];
      console.log(`📄 Static routes: ${staticRoutes.length}`);
    }
  } catch (e) {
    console.warn('⚠️ Failed to fetch static routes, using fallback.');
    staticRoutes = FALLBACK_STATIC_ROUTES;
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .is('deleted_at', null)
      .or(`deadline.is.null,deadline.gte.${today}`);

    if (jobsError) {
      console.warn('⚠️ Error fetching jobs:', jobsError.message);
    } else {
      jobRoutes = (jobs || []).map(job => `/job/${job.id}`);
      console.log(`💼 Job routes: ${jobRoutes.length}`);
    }
  } catch (e) {
    console.warn('⚠️ Failed to fetch jobs, skipping.');
  }

  try {
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select('slug')
      .eq('status', 'published');

    if (blogsError) {
      console.warn('⚠️ Error fetching blogs:', blogsError.message);
    } else {
      blogRoutes = (blogs || []).map(blog => `/blog/${blog.slug}`);
      console.log(`📝 Blog routes: ${blogRoutes.length}`);
    }
  } catch (e) {
    console.warn('⚠️ Failed to fetch blogs, skipping.');
  }

  const allRoutes = [...staticRoutes, ...jobRoutes, ...blogRoutes];
  console.log(`\n✅ Total routes: ${allRoutes.length}`);
  return allRoutes;
}

async function main() {
  try {
    const routes = await generateRoutes();
    const outputPath = path.join(__dirname, 'routes.json');
    fs.writeFileSync(outputPath, JSON.stringify(routes, null, 2));
    console.log(`📁 Routes written to: ${outputPath}`);
  } catch (error) {
    console.error('Failed to generate routes, using static fallback:', error);
    const outputPath = path.join(__dirname, 'routes.json');
    fs.writeFileSync(outputPath, JSON.stringify(FALLBACK_STATIC_ROUTES, null, 2));
    console.log(`📁 Fallback routes written to: ${outputPath}`);
  }
}

main();
