import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import { Calendar, User, Tag, ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBlog } from "@/hooks/useBlogs";
import { format } from "date-fns";

const BlogDetail = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { data: blog, isLoading } = useBlog(blogId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onAdvertiseClick={() => {}}
          searchQuery=""
          onSearchChange={() => {}}
          activeFilters={{
            location: [],
            jobType: [],
            experience: [],
            salaryRange: [],
            domain: [],
            skills: [],
            companies: [],
          }}
          onFiltersChange={() => {}}
        />
        <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
          <p className="text-muted-foreground">Loading blog...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onAdvertiseClick={() => {}}
          searchQuery=""
          onSearchChange={() => {}}
          activeFilters={{
            location: [],
            jobType: [],
            experience: [],
            salaryRange: [],
            domain: [],
            skills: [],
            companies: [],
          }}
          onFiltersChange={() => {}}
        />
        <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
          <p className="text-muted-foreground">Blog not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAdvertiseClick={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        activeFilters={{
          location: [],
          jobType: [],
          experience: [],
          salaryRange: [],
          domain: [],
          skills: [],
          companies: [],
        }}
        onFiltersChange={() => {}}
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Blogs
        </button>

        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-4 text-foreground">{blog.title}</h1>

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            {blog.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {blog.author.profile_url ? (
                  <a 
                    href={blog.author.profile_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline transition-colors"
                  >
                    {blog.author.name}
                  </a>
                ) : (
                  <span>{blog.author.name}</span>
                )}
              </div>
            )}
            {blog.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(blog.published_at), 'MMM dd, yyyy')}</span>
              </div>
            )}
            {blog.read_time_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blog.read_time_minutes} min read</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                <Tag className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>

          {blog.content && (
            <>
              <div 
                className="text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content.split('</p>').slice(0, 3).join('</p>') + '</p>' }}
                style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.75rem'
                }}
              />
              
              {/* First Ad - After 3 paragraphs */}
              <div className="my-8">
                <AdUnit size="rectangle" label="In-content Ad 1" />
              </div>
              
              <div 
                className="text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: '<p>' + blog.content.split('</p>').slice(3).join('</p>') }}
                style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.75rem'
                }}
              />
            </>
          )}
        </article>
        
        {/* Bottom Ad - Before Footer */}
        <div className="mt-12">
          <AdUnit size="rectangle" label="Bottom Ad" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
