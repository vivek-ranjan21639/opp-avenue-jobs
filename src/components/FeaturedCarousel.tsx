import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobCard, { Job } from '@/components/JobCard';
import { useNavigate } from 'react-router-dom';

interface FeaturedCarouselProps {
  title: string;
  items: any[];
  onJobClick?: (job: Job) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ title, items, onJobClick }) => {
  const navigate = useNavigate();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleItemClick = (item: any) => {
    if (item.content_type === 'job' && item.jobs) {
      const job: Job = {
        id: item.jobs.id,
        title: item.jobs.title,
        company: item.jobs.companies?.name || 'Unknown Company',
        location: item.jobs.job_locations?.[0]?.locations?.city || 'Location not specified',
        salary: item.jobs.salary_min && item.jobs.salary_max
          ? `${item.jobs.currency || 'INR'} ${item.jobs.salary_min} - ${item.jobs.salary_max}`
          : 'Not disclosed',
        type: item.jobs.job_type || 'Full-time',
        experience: 'Not specified',
        skills: item.jobs.job_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [],
        postedTime: 'Recently posted',
        description: '',
        remote: item.jobs.work_mode === 'Remote' || item.jobs.work_mode === 'Hybrid',
        companyLogo: item.jobs.companies?.logo_url,
        sector: item.jobs.companies?.sector,
        domains: item.jobs.job_domains?.map((jd: any) => jd.domains?.name).filter(Boolean) || []
      };
      
      if (onJobClick) {
        onJobClick(job);
      } else {
        navigate(`/job/${job.id}`);
      }
    } else if (item.content_type === 'poster_clickable' && item.link_url) {
      window.open(item.link_url, '_blank');
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
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
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-[350px]">
            {item.content_type === 'job' && item.jobs ? (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-1">
                <JobCard
                  job={{
                    id: item.jobs.id,
                    title: item.jobs.title,
                    company: item.jobs.companies?.name || 'Unknown Company',
                    location: item.jobs.job_locations?.[0]?.locations?.city || 'Location not specified',
                    salary: item.jobs.salary_min && item.jobs.salary_max
                      ? `${item.jobs.currency || 'INR'} ${item.jobs.salary_min} - ${item.jobs.salary_max}`
                      : 'Not disclosed',
                    type: item.jobs.job_type || 'Full-time',
                    experience: 'Not specified',
                    skills: item.jobs.job_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [],
                    postedTime: 'Recently posted',
                    description: '',
                    remote: item.jobs.work_mode === 'Remote' || item.jobs.work_mode === 'Hybrid',
                    companyLogo: item.jobs.companies?.logo_url,
                    sector: item.jobs.companies?.sector,
                    domains: item.jobs.job_domains?.map((jd: any) => jd.domains?.name).filter(Boolean) || []
                  }}
                  onClick={() => handleItemClick(item)}
                />
              </div>
            ) : (
              <div
                className={`relative h-[300px] rounded-lg overflow-hidden ${
                  item.content_type === 'poster_clickable' ? 'cursor-pointer' : ''
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
