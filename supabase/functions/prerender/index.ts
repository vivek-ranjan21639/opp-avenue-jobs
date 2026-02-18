import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SITE_URL = "https://oppavenue.netlify.app";
const SITE_NAME = "Opp Avenue";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtml(
  title: string,
  description: string,
  canonical: string,
  bodyContent: string,
  ogType = "website",
  ogImage = "",
  structuredData = "",
  extraMeta = ""
): string {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const fullCanonical = `${SITE_URL}${canonical}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="author" content="${SITE_NAME}" />
  <link rel="canonical" href="${fullCanonical}" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <meta property="og:title" content="${escapeHtml(fullTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${fullCanonical}" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${extraMeta}
  ${structuredData ? `<script type="application/ld+json">${structuredData}</script>` : ''}
</head>
<body>
  <div id="root">
    <header>
      <nav>
        <a href="/">${SITE_NAME}</a>
        <a href="/about">About</a>
        <a href="/blogs">Blogs</a>
        <a href="/resources">Resources</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
    <main>${bodyContent}</main>
    <footer>
      <p>&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
      <nav>
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/terms">Terms &amp; Conditions</a>
        <a href="/disclaimer">Disclaimer</a>
        <a href="/cookie-policy">Cookie Policy</a>
        <a href="/sitemap">Sitemap</a>
      </nav>
    </footer>
  </div>
</body>
</html>`;
}

function formatSalary(min: number | null, max: number | null, currency: string | null): string {
  const cur = currency || 'INR';
  if (min && max) return `${cur} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min) return `${cur} ${min.toLocaleString()}+`;
  if (max) return `Up to ${cur} ${max.toLocaleString()}`;
  return 'Not disclosed';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '/';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let title = `${SITE_NAME} - Find Your Dream Job Today`;
    let description = "Discover thousands of job opportunities on Opp Avenue. Connect with top companies, explore remote positions, and advance your career.";
    let bodyContent = '';
    let ogType = 'website';
    let ogImage = '';
    let structuredData = '';
    let extraMeta = '';
    let canonical = path;

    // Route matching
    const jobMatch = path.match(/^\/job\/([a-f0-9-]+)$/i);
    const blogMatch = path.match(/^\/blog\/(.+)$/);

    if (path === '/') {
      // ===== HOME PAGE =====
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, job_type, work_mode, salary_min, salary_max, currency, created_at, companies(name, logo_url, sector)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      bodyContent = `
        <h1>Find Your Dream Job Today</h1>
        <p>Discover exciting career opportunities from top companies. Browse ${jobs?.length || 0}+ job listings and find your perfect role.</p>
        <section>
          <h2>Latest Job Openings</h2>`;

      if (jobs && jobs.length > 0) {
        bodyContent += '<ul>';
        for (const job of jobs) {
          const company = (job.companies as any)?.name || 'Company';
          bodyContent += `
            <li>
              <a href="/job/${job.id}">
                <h3>${escapeHtml(job.title)}</h3>
                <p>${escapeHtml(company)} · ${job.job_type || ''} · ${job.work_mode || ''}</p>
                <p>Salary: ${formatSalary(job.salary_min, job.salary_max, job.currency)}</p>
              </a>
            </li>`;
        }
        bodyContent += '</ul>';
      }
      bodyContent += '</section>';

      // WebSite schema
      structuredData = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": SITE_URL,
        "description": description,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${SITE_URL}/?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      });

    } else if (jobMatch) {
      // ===== JOB DETAIL =====
      const jobId = jobMatch[1];
      const { data: job } = await supabase
        .from('jobs')
        .select(`
          id, title, description, job_type, work_mode, salary_min, salary_max, currency, 
          created_at, deadline, responsibilities, qualifications, application_link,
          companies(name, logo_url, sector, website, employee_count, founded_year, hq_location, culture_summary),
          job_locations(locations(city, state, country)),
          job_skills(skills(name)),
          job_benefits(benefits(name)),
          eligibility_criteria(education_level, min_experience, max_experience, age_limit, other_criteria)
        `)
        .eq('id', jobId)
        .is('deleted_at', null)
        .single();

      if (job) {
        const company = job.companies as any;
        const companyName = company?.name || 'Company';
        const locations = (job.job_locations as any[])?.map((jl: any) => {
          const l = jl.locations;
          return [l?.city, l?.state].filter(Boolean).join(', ');
        }).filter(Boolean) || [];
        const skills = (job.job_skills as any[])?.map((js: any) => js.skills?.name).filter(Boolean) || [];
        const benefits = (job.job_benefits as any[])?.map((jb: any) => jb.benefits?.name).filter(Boolean) || [];
        const eligibility = (job.eligibility_criteria as any[])?.[0] || null;

        title = `${job.title} at ${companyName}`;
        description = job.description?.slice(0, 160) || `Apply for ${job.title} at ${companyName}. ${job.job_type || ''} ${job.work_mode || ''} role${locations.length ? ' in ' + locations[0] : ''}.`;
        ogType = 'article';
        if (company?.logo_url) ogImage = company.logo_url;

        bodyContent = `
          <article>
            <h1>${escapeHtml(job.title)}</h1>
            <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
            ${locations.length ? `<p><strong>Location:</strong> ${locations.map(l => escapeHtml(l)).join(' | ')}</p>` : ''}
            <p><strong>Job Type:</strong> ${job.job_type || 'N/A'}</p>
            <p><strong>Work Mode:</strong> ${job.work_mode || 'N/A'}</p>
            <p><strong>Salary:</strong> ${formatSalary(job.salary_min, job.salary_max, job.currency)}</p>
            ${job.deadline ? `<p><strong>Deadline:</strong> ${job.deadline}</p>` : ''}
            
            ${job.description ? `<section><h2>About the Role</h2><p>${escapeHtml(job.description)}</p></section>` : ''}
            
            ${job.responsibilities?.length ? `
              <section>
                <h2>Key Responsibilities</h2>
                <ul>${job.responsibilities.map((r: string) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
              </section>` : ''}
            
            ${job.qualifications?.length ? `
              <section>
                <h2>Qualifications</h2>
                <ul>${job.qualifications.map((q: string) => `<li>${escapeHtml(q)}</li>`).join('')}</ul>
              </section>` : ''}
            
            ${skills.length ? `
              <section>
                <h2>Skills Required</h2>
                <ul>${skills.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
              </section>` : ''}
            
            ${benefits.length ? `
              <section>
                <h2>Benefits</h2>
                <ul>${benefits.map((b: string) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
              </section>` : ''}
            
            ${eligibility ? `
              <section>
                <h2>Eligibility</h2>
                ${eligibility.education_level ? `<p><strong>Education:</strong> ${escapeHtml(eligibility.education_level)}</p>` : ''}
                ${eligibility.min_experience || eligibility.max_experience ? `<p><strong>Experience:</strong> ${eligibility.min_experience || 0}-${eligibility.max_experience || 'N/A'} years</p>` : ''}
                ${eligibility.other_criteria ? `<p>${escapeHtml(eligibility.other_criteria)}</p>` : ''}
              </section>` : ''}
            
            ${job.application_link ? `<p><a href="${escapeHtml(job.application_link)}">Apply Now</a></p>` : ''}
          </article>`;

        // JobPosting schema
        const jobSchema: Record<string, any> = {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": job.title,
          "description": job.description || '',
          "datePosted": job.created_at,
          "hiringOrganization": {
            "@type": "Organization",
            "name": companyName,
            ...(company?.logo_url && { "logo": company.logo_url }),
            ...(company?.website && { "sameAs": company.website }),
          },
          "employmentType": job.job_type?.toUpperCase().replace('-', '_') || 'FULL_TIME',
        };
        if (locations.length) {
          jobSchema.jobLocation = locations.map(loc => ({
            "@type": "Place",
            "address": { "@type": "PostalAddress", "addressLocality": loc }
          }));
        }
        if (job.salary_min || job.salary_max) {
          jobSchema.baseSalary = {
            "@type": "MonetaryAmount",
            "currency": job.currency || "INR",
            "value": {
              "@type": "QuantitativeValue",
              ...(job.salary_min && { "minValue": job.salary_min }),
              ...(job.salary_max && { "maxValue": job.salary_max }),
              "unitText": "YEAR"
            }
          };
        }
        if (job.deadline) jobSchema.validThrough = job.deadline;
        structuredData = JSON.stringify(jobSchema);

      } else {
        title = "Job Not Found";
        description = "The requested job listing could not be found.";
        bodyContent = '<h1>Job Not Found</h1><p>This job listing may have been removed or expired.</p><p><a href="/">Browse all jobs</a></p>';
      }

    } else if (blogMatch) {
      // ===== BLOG DETAIL =====
      const blogSlug = blogMatch[1];
      const { data: blog } = await supabase
        .from('blogs')
        .select('*, authors(name, profile_url, profile_pic_url), blog_tags(tags(name))')
        .eq('slug', blogSlug)
        .eq('status', 'published')
        .single();

      if (blog) {
        const author = blog.authors as any;
        const tags = (blog.blog_tags as any[])?.map((bt: any) => bt.tags?.name).filter(Boolean) || [];

        title = blog.title;
        description = blog.summary || blog.title;
        ogType = 'article';
        if (blog.thumbnail_url) ogImage = blog.thumbnail_url;
        canonical = `/blog/${blogSlug}`;
        
        if (blog.published_at) extraMeta += `<meta property="article:published_time" content="${blog.published_at}" />`;
        if (blog.updated_at) extraMeta += `<meta property="article:modified_time" content="${blog.updated_at}" />`;
        if (author?.name) extraMeta += `<meta property="article:author" content="${escapeHtml(author.name)}" />`;

        bodyContent = `
          <article>
            <h1>${escapeHtml(blog.title)}</h1>
            <div>
              ${author?.name ? `<span>By ${escapeHtml(author.name)}</span>` : ''}
              ${blog.published_at ? `<time datetime="${blog.published_at}">${new Date(blog.published_at).toLocaleDateString()}</time>` : ''}
              ${blog.read_time_minutes ? `<span>${blog.read_time_minutes} min read</span>` : ''}
            </div>
            ${tags.length ? `<p>Tags: ${tags.map(t => escapeHtml(t)).join(', ')}</p>` : ''}
            ${blog.summary ? `<p>${escapeHtml(blog.summary)}</p>` : ''}
            ${blog.content ? `<div>${blog.content}</div>` : ''}
          </article>`;

        // BlogPosting schema
        structuredData = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "description": blog.summary || blog.title,
          "url": `${SITE_URL}/blog/${blogSlug}`,
          ...(blog.thumbnail_url && { "image": blog.thumbnail_url }),
          "datePublished": blog.published_at,
          "dateModified": blog.updated_at,
          ...(author && {
            "author": {
              "@type": "Person",
              "name": author.name,
              ...(author.profile_url && { "url": author.profile_url }),
            }
          }),
          "publisher": { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL }
        });
      } else {
        title = "Blog Not Found";
        description = "The requested blog post could not be found.";
        bodyContent = '<h1>Blog Not Found</h1><p><a href="/blogs">Browse all blogs</a></p>';
      }

    } else if (path === '/blogs') {
      // ===== BLOGS LIST =====
      title = "Career Blogs & Insights";
      description = "Read expert career advice, industry insights, and professional development tips on the Opp Avenue blog.";

      const { data: blogs } = await supabase
        .from('blogs')
        .select('id, title, slug, summary, published_at, thumbnail_url, read_time_minutes, authors(name)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);

      bodyContent = `<h1>Career Blogs &amp; Insights</h1>`;
      if (blogs && blogs.length > 0) {
        bodyContent += '<ul>';
        for (const blog of blogs) {
          const author = (blog.authors as any)?.name || '';
          bodyContent += `
            <li>
              <a href="/blog/${escapeHtml(blog.slug)}">
                <h2>${escapeHtml(blog.title)}</h2>
                ${blog.summary ? `<p>${escapeHtml(blog.summary)}</p>` : ''}
                <p>${author ? `By ${escapeHtml(author)} · ` : ''}${blog.read_time_minutes ? `${blog.read_time_minutes} min read` : ''}</p>
              </a>
            </li>`;
        }
        bodyContent += '</ul>';
      }

    } else if (path === '/about') {
      title = "About Us";
      description = "Learn about Opp Avenue - your trusted platform for discovering exciting career opportunities and connecting talented professionals with leading companies.";
      bodyContent = `
        <h1>About Opp Avenue</h1>
        <p>Your trusted platform for discovering exciting career opportunities and connecting talented professionals with leading companies.</p>
        <section>
          <h2>Our Mission</h2>
          <p>To simplify the job search process and make quality opportunities accessible to everyone.</p>
        </section>
        <section>
          <h2>Our Vision</h2>
          <p>Building the future of work through innovation and technology.</p>
        </section>
        <section>
          <h2>Our Values</h2>
          <ul>
            <li><strong>People First</strong> - We prioritize the needs of job seekers and employers.</li>
            <li><strong>Quality</strong> - We curate high-quality job listings from reputable companies.</li>
            <li><strong>Innovation</strong> - We continuously improve our platform with the latest technology.</li>
          </ul>
        </section>`;

      structuredData = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": SITE_NAME,
        "url": SITE_URL,
        "description": description,
      });

    } else if (path === '/resources') {
      title = "Career Resources";
      description = "Access comprehensive career resources including guides, resume templates, interview tips, and industry reports.";
      
      const { data: resources } = await supabase
        .from('resources')
        .select('id, title, description, type, thumbnail_url')
        .is('parent_id', null)
        .eq('type', 'category')
        .order('display_order', { ascending: true });

      bodyContent = `<h1>Career Resources</h1><p>Comprehensive resources to help advance your career.</p>`;
      if (resources && resources.length > 0) {
        bodyContent += '<ul>';
        for (const r of resources) {
          bodyContent += `<li><h2>${escapeHtml(r.title)}</h2>${r.description ? `<p>${escapeHtml(r.description)}</p>` : ''}</li>`;
        }
        bodyContent += '</ul>';
      }

    } else if (path === '/resources/career-guides') {
      title = "Career Guides";
      description = "Expert career guides to help you navigate your professional journey.";
      bodyContent = `<h1>Career Guides</h1><p>Expert guides to help you navigate your professional journey and make informed career decisions.</p>`;
    } else if (path === '/resources/resume-templates') {
      title = "Resume Templates";
      description = "Professional resume templates to help you stand out.";
      bodyContent = `<h1>Resume Templates</h1><p>Professional, ATS-friendly resume templates designed to help you land your dream job.</p>`;
    } else if (path === '/resources/interview-tips') {
      title = "Interview Tips";
      description = "Expert interview preparation tips and strategies.";
      bodyContent = `<h1>Interview Tips</h1><p>Comprehensive interview preparation guides, common questions, and expert strategies.</p>`;
    } else if (path === '/resources/industry-reports') {
      title = "Industry Reports";
      description = "In-depth industry reports and market analysis.";
      bodyContent = `<h1>Industry Reports</h1><p>Stay ahead with our in-depth industry analysis, salary trends, and job market reports.</p>`;
    } else if (path === '/contact') {
      title = "Contact Us";
      description = "Get in touch with Opp Avenue. We're here to help with your career journey.";
      bodyContent = `<h1>Contact Us</h1><p>Have questions? Reach out to us at contact@oppavenue.com</p>`;
    } else if (path === '/privacy-policy') {
      title = "Privacy Policy";
      description = "Read Opp Avenue's privacy policy to understand how we collect, use, and protect your information.";
      bodyContent = `<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy outlines how we handle your data.</p>`;
    } else if (path === '/terms') {
      title = "Terms & Conditions";
      description = "Read Opp Avenue's terms and conditions for using our platform.";
      bodyContent = `<h1>Terms &amp; Conditions</h1><p>Please read these terms carefully before using our platform.</p>`;
    } else if (path === '/disclaimer') {
      title = "Disclaimer";
      description = "Read Opp Avenue's disclaimer regarding the information provided on our platform.";
      bodyContent = `<h1>Disclaimer</h1><p>Important information about the content on our platform.</p>`;
    } else if (path === '/cookie-policy') {
      title = "Cookie Policy";
      description = "Learn about how Opp Avenue uses cookies to improve your browsing experience.";
      bodyContent = `<h1>Cookie Policy</h1><p>This policy explains how we use cookies on our platform.</p>`;
    } else if (path === '/advertise') {
      title = "Advertise with Us";
      description = "Promote your company and job openings on Opp Avenue. Reach thousands of job seekers.";
      bodyContent = `<h1>Advertise with Opp Avenue</h1><p>Reach thousands of active job seekers. Promote your company and openings on our platform.</p>`;
    } else if (path === '/sitemap') {
      title = "Sitemap";
      description = "Navigate all pages on Opp Avenue.";
      bodyContent = `<h1>Sitemap</h1>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/blogs">Blogs</a></li>
          <li><a href="/resources">Resources</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/advertise">Advertise</a></li>
        </ul>`;
    } else {
      // Unknown route - 404
      title = "Page Not Found";
      description = "The page you're looking for doesn't exist.";
      bodyContent = `<h1>Page Not Found</h1><p>The page you're looking for doesn't exist. <a href="/">Go to homepage</a></p>`;
    }

    const html = buildHtml(title, description, canonical, bodyContent, ogType, ogImage, structuredData, extraMeta);

    return new Response(html, {
      status: title === "Page Not Found" ? 404 : 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Prerender error:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
