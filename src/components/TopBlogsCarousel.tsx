import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { TopBlog } from '@/hooks/useTopBlogs';

interface TopBlogsCarouselProps {
  blogs: TopBlog[];
}

const TopBlogsCarousel: React.FC<TopBlogsCarouselProps> = ({ blogs }) => {
  const navigate = useNavigate();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleBlogClick = (slug: string) => {
    window.open(`/blog/${slug}`, '_blank');
  };

  if (!blogs || blogs.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Top Blogs</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {blogs.map((blog) => (
          <Card
            key={blog.id}
            className="flex-shrink-0 w-[320px] cursor-pointer hover:shadow-lg transition-shadow overflow-hidden relative"
            onClick={() => handleBlogClick(blog.slug)}
          >
            {/* Background Image - always show, use thumbnail or placeholder */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${blog.thumbnail_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop'})` 
              }}
            >
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-4 h-[200px] flex flex-col justify-end">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white">{blog.title}</h3>
              {blog.authors && (
                <div className="flex items-center gap-2">
                  {blog.authors.profile_pic_url && (
                    <img
                      src={blog.authors.profile_pic_url}
                      alt={blog.authors.name}
                      className="w-6 h-6 rounded-full border border-white/30"
                    />
                  )}
                  <span className="text-sm text-white/80">{blog.authors.name}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TopBlogsCarousel;