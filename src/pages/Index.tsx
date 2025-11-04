
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import FloatingBubbles from '@/components/FloatingBubbles';

import Header, { FilterState } from '@/components/Header';
import JobCard, { Job } from '@/components/JobCard';
import AdUnit from '@/components/AdUnit';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/hooks/useJobs';

const Index = () => {
  const navigate = useNavigate();
  const { data: allJobs = [], isLoading } = useJobs();
  const [visibleJobs, setVisibleJobs] = useState<Job[]>([]);
  const [displayCount, setDisplayCount] = useState(15);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    experience: [],
    salaryRange: [],
    sector: [],
    companies: []
  });

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    let filtered = [...allJobs];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.skills.some(skill => skill.toLowerCase().includes(query)) ||
        job.description.toLowerCase().includes(query)
      );
    }
    
    // Apply location filter
    if (activeFilters.location.length > 0) {
      filtered = filtered.filter(job => {
        if (activeFilters.location.includes('Remote') && job.remote) {
          return true;
        }
        return activeFilters.location.some(location => 
          job.location.toLowerCase().includes(location.toLowerCase())
        );
      });
    }
    
    // Apply job type filter
    if (activeFilters.jobType.length > 0) {
      filtered = filtered.filter(job =>
        activeFilters.jobType.includes(job.type)
      );
    }
    
    // Apply experience filter
    if (activeFilters.experience.length > 0) {
      filtered = filtered.filter(job =>
        activeFilters.experience.includes(job.experience)
      );
    }
    
    // Apply salary range filter
    if (activeFilters.salaryRange.length > 0) {
      filtered = filtered.filter(job => {
        const jobSalary = job.salary.toLowerCase();
        return activeFilters.salaryRange.some(range => {
          const rangeKey = range.toLowerCase().replace(/[k₹-]/g, '');
          const jobSalaryKey = jobSalary.replace(/[k₹-]/g, '');
          return jobSalaryKey.includes(rangeKey.slice(0, 2)) || 
                 jobSalaryKey.includes(rangeKey.slice(-2));
        });
      });
    }
    
    // Apply companies filter
    if (activeFilters.companies.length > 0) {
      filtered = filtered.filter(job =>
        activeFilters.companies.includes(job.company)
      );
    }
    
    // Apply sector filter
    if (activeFilters.sector.length > 0) {
      filtered = filtered.filter(job => 
        job.sector && activeFilters.sector.includes(job.sector)
      );
    }
    
    return filtered;
  }, [searchQuery, activeFilters, allJobs]);

  // Update visible jobs based on display count
  useEffect(() => {
    setVisibleJobs(filteredJobs.slice(0, displayCount));
  }, [filteredJobs, displayCount]);

  // Infinite scroll handler
  const loadMoreJobs = useCallback(() => {
    if (displayCount >= filteredJobs.length) return;
    setDisplayCount(prev => prev + 15);
  }, [displayCount, filteredJobs.length]);

  // Scroll event listener for infinite scroll and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      // Show scroll-to-top button when scrolled down 300px
      setShowScrollTop(scrollTop > 300);
      
      // Trigger infinite scroll when user is 1000px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        loadMoreJobs();
      }
    };

    const handleResize = () => {
      // Force scroll check after resize to ensure proper calculations
      setTimeout(handleScroll, 100);
    };

    // Initial scroll check after content loads
    const initialCheck = () => {
      setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Force initial scroll check to handle cases where content is already below fold
    initialCheck();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [loadMoreJobs]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleJobClick = (job: Job) => {
    navigate(`/job/${job.id}`);
  };

  const handleAdvertiseClick = () => {
    navigate('/advertise');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary relative">
      {/* Floating Bubbles Background */}
      <FloatingBubbles />
      
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <Header 
          onAdvertiseClick={handleAdvertiseClick}
          onSearchChange={setSearchQuery}
          onFiltersChange={setActiveFilters}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
        />
        
        {/* Job Listings */}
        <main className="px-8 py-8">
          <div className="flex justify-center gap-8">
            {/* Left Sidebar Ad - Hidden on mobile/tablet */}
            <div className="hidden xl:block w-[160px] flex-shrink-0">
              <div className="sticky top-28">
                <AdUnit size="sidebar" label="Left Sidebar Ad" />
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full max-w-[1008px] flex-1">
            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-card rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ))
              ) : visibleJobs.map((job, index) => (
                <React.Fragment key={job.id}>
                  <JobCard 
                    job={job} 
                    onClick={handleJobClick}
                  />
                  {/* Ad after every 15 jobs (5 rows) */}
                  {(index + 1) % 15 === 0 && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <AdUnit size="rectangle" label={`In-content Ad ${Math.floor((index + 1) / 15)}`} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* No results message */}
            {!isLoading && filteredJobs.length === 0 && (
              <div className="text-center py-12 md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground text-lg">No jobs found matching your criteria</p>
                <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            )}
            
            {/* Load More Indicator */}
            {!isLoading && displayCount < filteredJobs.length && (
              <div className="flex justify-center items-center py-12 md:col-span-2 lg:col-span-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-muted-foreground">Loading more opportunities...</span>
              </div>
            )}
            </div>
            
            {/* Right Sidebar Ad - Hidden on mobile/tablet */}
            <div className="hidden xl:block w-[160px] flex-shrink-0">
              <div className="sticky top-28">
                <AdUnit size="sidebar" label="Right Sidebar Ad" />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="sm"
          className={`
            fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50
            h-10 w-10 rounded-full shadow-lg
            bg-primary hover:bg-primary-hover
            transition-all duration-300 ease-out
            animate-fade-in hover:scale-110
          `}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default Index;
