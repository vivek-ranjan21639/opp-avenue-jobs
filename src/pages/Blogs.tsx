import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar, User, Tag, ArrowUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlogs, useBlogTags } from "@/hooks/useBlogs";
import { useBlogAuthors } from "@/hooks/useBlogAuthors";
import { format } from "date-fns";
import SEO from "@/components/SEO";
import PageLayout from "@/components/PageLayout";

const Blogs = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { data: allBlogs, isLoading } = useBlogs();
  const { data: tags } = useBlogTags();
  const { data: authors } = useBlogAuthors();

  // Filter blogs by tag and author
  const blogs = allBlogs?.filter(blog => {
    const matchesTag = !selectedTag || blog.tags.some(tag => tag.name === selectedTag);
    const matchesAuthor = !selectedAuthor || blog.author?.name === selectedAuthor;
    return matchesTag && matchesAuthor;
  });

  // Scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout prerenderReady={!isLoading && !!allBlogs}>
      <SEO 
        title="Career Blog & Insights"
        description="Stay updated with the latest news, insights, and trends in the railway industry. Expert career advice and industry updates."
        canonical="/blogs"
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-4 pb-12">
        {/* Filters - Mobile/Tablet (sticky above title) */}
        <div className="lg:hidden mb-6 sticky top-[100px] md:top-[80px] z-20 bg-background pb-2">
          <div className="border rounded-lg p-3 bg-card shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-primary" />
                Filter
              </h3>
              {(selectedTag || selectedAuthor) && (
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setSelectedAuthor(null);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {/* Tags Filter */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1.5">By Tag:</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {tags && tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTag === tag.name ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap flex-shrink-0 text-xs px-2 py-0.5"
                    onClick={() => setSelectedTag(tag.name === selectedTag ? null : tag.name)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Authors Filter */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">By Author:</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {authors && authors.map((author) => (
                  <Badge
                    key={author.id}
                    variant={selectedAuthor === author.name ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap flex-shrink-0 text-xs px-2 py-0.5"
                    onClick={() => setSelectedAuthor(author.name === selectedAuthor ? null : author.name)}
                  >
                    {author.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">Blog</h1>
        
        <p className="text-muted-foreground mb-6 text-lg">
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
                  className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card/80"
                >
                  <h2 className="text-2xl font-semibold mb-3 hover:text-primary transition-colors">
                    <Link to={`/blog/${blog.slug}`} target="_blank">{blog.title}</Link>
                  </h2>
                  
                  <p className="text-muted-foreground mb-4">{blog.summary}</p>
                  
                  {/* Tags for each blog */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
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
                        {blog.author.profile_url ? (
                          <a 
                            href={blog.author.profile_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline transition-colors"
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
                  
                  <Link 
                    to={`/blog/${blog.slug}`}
                    target="_blank"
                    className="inline-block text-primary hover:underline font-medium"
                  >
                    Read More →
                  </Link>
                </article>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {selectedTag || selectedAuthor ? 'No blogs found matching your filters.' : 'No blogs available yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Filters Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:sticky lg:top-24 h-fit self-start space-y-4">
            {/* Tags Box */}
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
                    variant={selectedTag === tag.name ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setSelectedTag(tag.name === selectedTag ? null : tag.name)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Authors Box */}
            <div className="border rounded-lg p-6 bg-card">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Browse by Author
              </h3>
              
              {selectedAuthor && (
                <div className="mb-4">
                  <button
                    onClick={() => setSelectedAuthor(null)}
                    className="text-sm text-primary hover:underline"
                  >
                    ← Clear filter
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {authors && authors.map((author) => (
                  <Badge
                    key={author.id}
                    variant={selectedAuthor === author.name ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setSelectedAuthor(author.name === selectedAuthor ? null : author.name)}
                  >
                    {author.name}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="sm"
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary-hover transition-all duration-300 ease-out animate-fade-in hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </PageLayout>
  );
};

export default Blogs;
