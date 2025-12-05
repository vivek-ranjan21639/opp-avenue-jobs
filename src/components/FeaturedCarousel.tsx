import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job } from '@/components/JobCard';
import JobCard from '@/components/JobCard';

interface FeaturedItem {
  id: string;
  content_type: 'poster_static' | 'poster_clickable' | 'poster_job_link';
  image_url?: string;
  title?: string;
  link_url?: string;
  job_id?: string;
}

interface FeaturedCarouselProps {
  title: string;
  items?: FeaturedItem[];
  jobs?: Job[];
  jobsOnly?: boolean;
  onJobClick?: (job: Job) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ title, items = [], jobs = [], jobsOnly = false, onJobClick }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const autoScrollRef = React.useRef<NodeJS.Timeout | null>(null);

  const scroll = (direction: 'left' | 'right', smooth = true) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: smooth ? 'smooth' : 'instant'
      });
    }
  };

  // Auto-scroll effect for non-jobsOnly carousels (featured content)
  React.useEffect(() => {
    if (jobsOnly || items.length === 0) return;

    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
          
          if (isAtEnd) {
            // Reset to beginning instantly
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'instant' });
          } else {
            // Scroll right instantly
            scroll('right', false);
          }
        }
      }, 3000);
    };

    startAutoScroll();

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [jobsOnly, items.length]);

  const handleItemClick = (item: FeaturedItem) => {
    if (item.content_type === 'poster_clickable' && item.link_url) {
      // External link
      window.open(item.link_url, '_blank');
    } else if (item.content_type === 'poster_job_link' && item.job_id) {
      // Internal job detail link
      window.open(`/job/${item.job_id}`, '_blank');
    }
    // poster_static does nothing on click
  };

  const handleJobClick = (job: Job) => {
    if (onJobClick) {
      onJobClick(job);
    } else {
      window.open(`/job/${job.id}`, '_blank');
    }
  };

  // Determine what to render
  const displayItems = jobsOnly ? jobs : items;
  
  if (!displayItems || displayItems.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-foreground">{title}</h2>
        {/* Mobile/Tablet navigation buttons - hidden on desktop */}
        <div className="flex gap-2 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8 md:h-10 md:w-10 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8 md:h-10 md:w-10 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>

      {/* Carousel container with side arrows on desktop */}
      <div className="relative">
        {/* Desktop left arrow */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('left')}
          className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-muted/90 border-border/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors shadow-md"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory sm:snap-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {jobsOnly ? (
            // Render jobs directly for "You May Also Like" section
            jobs.map((job) => (
              <div key={job.id} className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px]">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-xl p-1 shadow-md hover:shadow-lg transition-shadow border border-primary/20">
                  <JobCard
                    job={job}
                    onClick={() => handleJobClick(job)}
                  />
                </div>
              </div>
            ))
          ) : (
            // Render featured content items (images only - no jobs)
            items.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[350px] snap-center">
                <div
                  className={`relative h-[300px] rounded-lg overflow-hidden ${
                    item.content_type !== 'poster_static' ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <img
                    src={item.image_url || '/placeholder.svg'}
                    alt={item.title || 'Featured content'}
                    className="w-full h-full object-cover"
                  />
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white font-semibold">{item.title}</h3>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop right arrow */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('right')}
          className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-muted/90 border-border/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors shadow-md"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default FeaturedCarousel;
