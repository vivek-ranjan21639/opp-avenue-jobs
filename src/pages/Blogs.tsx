import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Blogs = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const blogPosts = [
    {
      id: 1,
      title: "The Future of Railway Technology",
      excerpt: "Exploring the latest innovations shaping the future of rail transport...",
      author: "John Smith",
      date: "March 15, 2024",
      category: "Technology",
      tags: ["Technology", "Innovation", "Future", "AI", "Automation"]
    },
    {
      id: 2,
      title: "Career Growth in Railway Industry",
      excerpt: "Tips and strategies for advancing your career in the railway sector...",
      author: "Sarah Johnson",
      date: "March 12, 2024",
      category: "Career",
      tags: ["Career", "Growth", "Professional Development", "Tips"]
    },
    {
      id: 3,
      title: "Railway Safety Best Practices",
      excerpt: "Essential safety protocols every railway professional should know...",
      author: "Michael Brown",
      date: "March 10, 2024",
      category: "Safety",
      tags: ["Safety", "Best Practices", "Protocols", "Training"]
    },
  ];

  // Get all unique tags
  const allTags = Array.from(
    new Set(blogPosts.flatMap(post => post.tags))
  ).sort();

  // Filter posts by selected tag
  const filteredPosts = selectedTag
    ? blogPosts.filter(post => post.tags.includes(selectedTag))
    : blogPosts;

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
      
      <main className="container mx-auto px-4 pt-4 pb-12">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Blog</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Stay updated with the latest news, insights, and trends in the railway industry.
        </p>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Blog Posts */}
          <div className="space-y-8">
            {filteredPosts.map((post) => (
              <article 
                key={post.id} 
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                    {post.category}
                  </span>
                </div>
                
                <h2 className="text-2xl font-semibold mb-3 hover:text-primary transition-colors">
                  <Link to={`#`}>{post.title}</Link>
                </h2>
                
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                
                {/* Tags for each blog */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setSelectedTag(tag)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
                
                <Link 
                  to={`#`}
                  className="inline-block text-primary hover:underline font-medium"
                >
                  Read More →
                </Link>
              </article>
            ))}

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No blogs found for this tag.</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-muted-foreground">More articles coming soon!</p>
            </div>
          </div>

          {/* Tags Sidebar */}
          <aside className="lg:sticky lg:top-4 h-fit">
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
                {allTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  >
                    {tag}
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
