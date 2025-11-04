import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBlogs, useBlogTags } from "@/hooks/useBlogs";
import { format } from "date-fns";

const Blogs = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { data: blogs, isLoading } = useBlogs(selectedTag);
  const { data: tags } = useBlogTags();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          sector: [],
          companies: [],
        }}
        onFiltersChange={() => {}}
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-4 pb-12">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Blog</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Stay updated with the latest news, insights, and trends in the railway industry.
        </p>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Blog Posts */}
          <div className="space-y-8">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading blogs...</p>
              </div>
            ) : blogs && blogs.length > 0 ? (
              blogs.map((blog) => (
                <article 
                  key={blog.id} 
                  className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-2xl font-semibold mb-3 hover:text-primary transition-colors">
                    <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h2>
                  
                  <p className="text-muted-foreground mb-4">{blog.summary}</p>
                  
                  {/* Tags for each blog */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="tag" 
                        className="cursor-pointer"
                        onClick={() => setSelectedTag(tag.name)}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    {blog.author && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{blog.author.name}</span>
                      </div>
                    )}
                    {blog.published_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(blog.published_at), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to={`/blog/${blog.slug}`}
                    className="inline-block text-primary hover:underline font-medium"
                  >
                    Read More →
                  </Link>
                </article>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {selectedTag ? 'No blogs found for this tag.' : 'No blogs available yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Tags Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit self-start">
            <div className="border rounded-lg p-6 bg-card">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Browse by Tags
              </h3>
              
              {selectedTag && (
                <div className="mb-4">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-sm text-primary hover:underline"
                  >
                    ← Clear filter
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {tags && tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTag === tag.name ? "default" : "tag"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(tag.name === selectedTag ? null : tag.name)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Click on any tag to filter blog posts by topic.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blogs;
