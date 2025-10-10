import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User } from "lucide-react";

const Blogs = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Railway Technology",
      excerpt: "Exploring the latest innovations shaping the future of rail transport...",
      author: "John Smith",
      date: "March 15, 2024",
      category: "Technology"
    },
    {
      id: 2,
      title: "Career Growth in Railway Industry",
      excerpt: "Tips and strategies for advancing your career in the railway sector...",
      author: "Sarah Johnson",
      date: "March 12, 2024",
      category: "Career"
    },
    {
      id: 3,
      title: "Railway Safety Best Practices",
      excerpt: "Essential safety protocols every railway professional should know...",
      author: "Michael Brown",
      date: "March 10, 2024",
      category: "Safety"
    },
  ];

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
      
      <main className="container mx-auto px-4 py-12 mt-20">
        <h1 className="text-4xl font-bold mb-6 text-foreground">Blog</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Stay updated with the latest news, insights, and trends in the railway industry.
        </p>

        <div className="grid gap-8">
          {blogPosts.map((post) => (
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
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
                className="inline-block mt-4 text-primary hover:underline font-medium"
              >
                Read More →
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">More articles coming soon!</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blogs;
