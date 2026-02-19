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
          <p>We believe that finding the right job should be straightforward and empowering. Our platform brings together job seekers and employers in a seamless, efficient way.</p>
        </section>
        <section>
          <h2>Our Vision</h2>
          <p>Building the future of work through innovation and technology.</p>
          <p>We envision a world where every professional can easily find opportunities that match their skills, passions, and career goals.</p>
        </section>
        <section>
          <h2>Our Values</h2>
          <ul>
            <li><strong>People First</strong> - We prioritize the needs of job seekers and employers, ensuring a user-friendly experience for all.</li>
            <li><strong>Quality</strong> - We curate high-quality job listings from reputable companies to ensure the best opportunities.</li>
            <li><strong>Innovation</strong> - We continuously improve our platform with the latest technology to serve you better.</li>
          </ul>
        </section>
        <section>
          <h2>Platform Highlights</h2>
          <ul>
            <li><strong>500+</strong> Active Job Listings</li>
            <li><strong>50+</strong> Partner Companies</li>
            <li><strong>10k+</strong> Job Seekers</li>
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
      description = "Professional resume templates tailored for railway industry positions. Download free templates to create a standout resume.";
      bodyContent = `<h1>Resume Templates</h1>
        <p>Professional resume templates tailored for railway industry positions.</p>`;
    } else if (path === '/resources/interview-tips') {
      title = "Interview Tips";
      description = "Video tutorials and articles to help you ace your railway job interviews. Expert tips and strategies for interview success.";
      bodyContent = `<h1>Interview Tips</h1>
        <p>Video tutorials and articles to help you ace your railway job interviews.</p>`;
    } else if (path === '/resources/industry-reports') {
      title = "Industry Reports";
      description = "Latest reports and insights about the railway industry trends. Download comprehensive industry analysis and market research.";
      bodyContent = `<h1>Industry Reports</h1>
        <p>Latest reports and insights about the railway industry trends.</p>`;
    } else if (path === '/contact') {
      title = "Contact Us";
      description = "Have questions or need assistance? Contact the Opp Avenue team. We're here to help you find your dream job.";
      bodyContent = `
        <h1>Contact Us</h1>
        <p>Have questions or need assistance? We're here to help. Reach out to us through any of the channels below.</p>
        <section>
          <h2>Send us a message</h2>
          <p>Fill out the form on our website and we'll get back to you soon.</p>
        </section>
        <section>
          <h2>Email Us</h2>
          <p>Send us an email anytime: <a href="mailto:contact@oppavenue.com">contact@oppavenue.com</a></p>
        </section>
        <section>
          <h2>Call Us</h2>
          <p>Mon-Fri from 9am to 6pm: <a href="tel:+1234567890">+1 (234) 567-890</a></p>
        </section>
        <section>
          <h2>Visit Us</h2>
          <p>123 Business Street, Suite 100, New York, NY 10001</p>
        </section>`;
    } else if (path === '/privacy-policy') {
      title = "Privacy Policy";
      description = "Learn how Opp Avenue handles and protects your personal data. Our commitment to your privacy and data security.";
      bodyContent = `
        <h1>Privacy Policy</h1>
        <section>
          <h2>1. Introduction</h2>
          <p>Welcome to Opp Avenue. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
        </section>
        <section>
          <h2>2. Information We Collect</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
          <ul>
            <li>Identity Data: includes first name, last name, username or similar identifier</li>
            <li>Contact Data: includes email address and telephone numbers</li>
            <li>Technical Data: includes internet protocol (IP) address, browser type and version</li>
            <li>Usage Data: includes information about how you use our website and services</li>
          </ul>
        </section>
        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul>
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our service</li>
            <li>To monitor the usage of our service</li>
          </ul>
        </section>
        <section>
          <h2>4. Data Security</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
        </section>
        <section>
          <h2>5. Your Legal Rights</h2>
          <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
          <ul>
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
          </ul>
        </section>
        <section>
          <h2>6. Contact Us</h2>
          <p>If you have any questions about this privacy policy, please contact us at privacy@oppavenue.com</p>
        </section>`;
    } else if (path === '/terms') {
      title = "Terms & Conditions";
      description = "Read the terms and conditions for using Opp Avenue. Understand your rights and responsibilities as a user.";
      bodyContent = `
        <h1>Terms and Conditions</h1>
        <section>
          <h2>1. Agreement to Terms</h2>
          <p>By accessing and using Opp Avenue, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.</p>
        </section>
        <section>
          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily access the materials on Opp Avenue for personal, non-commercial transitory viewing only. Under this license you may not:</p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on Opp Avenue</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>
        <section>
          <h2>3. User Accounts</h2>
          <p>When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>
        </section>
        <section>
          <h2>4. Job Listings</h2>
          <p>Opp Avenue provides a platform for employers to post job listings and for job seekers to find opportunities. We do not guarantee the accuracy, completeness, or quality of any job listings. Users are responsible for verifying the legitimacy of job postings.</p>
        </section>
        <section>
          <h2>5. Prohibited Uses</h2>
          <p>You may not use Opp Avenue:</p>
          <ul>
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
          </ul>
        </section>
        <section>
          <h2>6. Limitation of Liability</h2>
          <p>In no event shall Opp Avenue or its suppliers be liable for any damages arising out of the use or inability to use the materials on Opp Avenue.</p>
        </section>
        <section>
          <h2>7. Modifications</h2>
          <p>Opp Avenue may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
        </section>
        <section>
          <h2>8. Contact Information</h2>
          <p>If you have any questions about these Terms and Conditions, please contact us at legal@oppavenue.com</p>
        </section>`;
    } else if (path === '/disclaimer') {
      title = "Disclaimer";
      description = "Important disclaimers and notices about using Opp Avenue job portal.";
      bodyContent = `
        <h1>Disclaimer</h1>
        <section>
          <h2>General Information</h2>
          <p>The information provided by Opp Avenue on our website is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.</p>
        </section>
        <section>
          <h2>External Links Disclaimer</h2>
          <p>Our website may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.</p>
          <p>We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site.</p>
        </section>
        <section>
          <h2>Job Listings Disclaimer</h2>
          <p>Opp Avenue acts as a platform connecting job seekers with employers. We do not:</p>
          <ul>
            <li>Verify the accuracy of job postings</li>
            <li>Guarantee the legitimacy of employers or job offers</li>
            <li>Endorse any particular employer or job listing</li>
            <li>Guarantee employment or interview opportunities</li>
            <li>Take responsibility for the hiring process or employment outcomes</li>
          </ul>
          <p>Users are advised to conduct their own due diligence and research before applying for any position or engaging with any employer through our platform.</p>
        </section>
        <section>
          <h2>Professional Disclaimer</h2>
          <p>The site cannot and does not contain professional career advice. The career information is provided for general informational and educational purposes only and is not a substitute for professional advice.</p>
        </section>
        <section>
          <h2>Errors and Omissions Disclaimer</h2>
          <p>While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources, Opp Avenue is not responsible for any errors or omissions. All information is provided "as is", with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information.</p>
        </section>
        <section>
          <h2>Fair Use Disclaimer</h2>
          <p>This site may contain copyrighted material, the use of which has not always been specifically authorized by the copyright owner. We believe this constitutes a "fair use" of any such copyrighted material as provided for in section 107 of the US Copyright Law.</p>
        </section>
        <section>
          <h2>Contact Us</h2>
          <p>If you have any questions about this Disclaimer, please contact us at legal@oppavenue.com</p>
        </section>`;
    } else if (path === '/cookie-policy') {
      title = "Cookie Policy";
      description = "Learn how Opp Avenue uses cookies to enhance your browsing experience.";
      bodyContent = `
        <h1>Cookie Policy</h1>
        <section>
          <h2>What Are Cookies</h2>
          <p>Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the website or a third-party to recognize you and make your next visit easier and the website more useful to you.</p>
          <p>Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your personal computer or mobile device when you go offline, while session cookies are deleted as soon as you close your web browser.</p>
        </section>
        <section>
          <h2>How We Use Cookies</h2>
          <p>When you use and access Opp Avenue, we may place a number of cookies files in your web browser. We use cookies for the following purposes:</p>
          <ul>
            <li>To enable certain functions of the website</li>
            <li>To provide analytics</li>
            <li>To store your preferences</li>
            <li>To enable advertisements delivery, including behavioral advertising</li>
          </ul>
        </section>
        <section>
          <h2>Types of Cookies We Use</h2>
          <h3>Essential Cookies</h3>
          <p>These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services.</p>
          <h3>Analytics Cookies</h3>
          <p>These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</p>
          <h3>Functionality Cookies</h3>
          <p>These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.</p>
          <h3>Advertising Cookies</h3>
          <p>These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.</p>
        </section>
        <section>
          <h2>Third-Party Cookies</h2>
          <p>In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the website, deliver advertisements on and through the website, and so on.</p>
        </section>
        <section>
          <h2>Your Choices Regarding Cookies</h2>
          <p>If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer.</p>
        </section>
        <section>
          <h2>More Information</h2>
          <p>For more information about cookies and how we use them, please contact us at privacy@oppavenue.com</p>
        </section>`;
    } else if (path === '/advertise') {
      title = "Advertise with Us";
      description = "Reach over 1 lakh daily users by advertising on Opp Avenue. Connect with professionals actively seeking career opportunities.";
      bodyContent = `
        <h1>Advertise with Opp Avenue</h1>
        <p>Reach out to 1lakh+ daily users by advertising at our platform.</p>
        <section>
          <h2>Why Advertise at Our Platform</h2>
          <ul>
            <li><strong>Total Page Views:</strong> 53 Lakhs/monthly</li>
            <li><strong>Unique Visitors:</strong> 17.84 Lakhs/monthly</li>
            <li><strong>WhatsApp Subscribers:</strong> 4.47 Lakhs over 750+ groups</li>
            <li><strong>LinkedIn Followers:</strong> 1.80 Lakhs</li>
          </ul>
        </section>
        <section>
          <h2>Advertising Benefits</h2>
          <ul>
            <li><strong>Massive Reach</strong> - Connect with over 1 lakh daily active users seeking opportunities.</li>
            <li><strong>Targeted Audience</strong> - Reach professionals actively looking for career opportunities.</li>
            <li><strong>Multi-Channel</strong> - Leverage our website, WhatsApp groups, and LinkedIn presence.</li>
          </ul>
        </section>
        <section>
          <h2>Get Started Today</h2>
          <p><strong>Call us at:</strong> +91 98765 43210</p>
          <p><strong>Email us at:</strong> ads@oppavenue.com</p>
          <p>We will contact you within 24 hours to discuss your advertising needs.</p>
        </section>`;
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
