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
    navigate(`/blog/${slug}`);
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
            className="flex-shrink-0 w-[320px] cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
            onClick={() => handleBlogClick(blog.slug)}
          >
            {blog.thumbnail_url && (
              <div className="h-40 overflow-hidden">
                <img
                  src={blog.thumbnail_url}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{blog.title}</h3>
              {blog.authors && (
                <div className="flex items-center gap-2">
                  {blog.authors.profile_pic_url && (
                    <img
                      src={blog.authors.profile_pic_url}
                      alt={blog.authors.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-muted-foreground">{blog.authors.name}</span>
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
