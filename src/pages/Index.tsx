
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import FloatingBubbles from '@/components/FloatingBubbles';

import Header from '@/components/Header';
import JobCard, { Job } from '@/components/JobCard';
import { Button } from '@/components/ui/button';
import { getJobsPage } from '@/data/mockJobs';

const Index = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Load initial jobs
  useEffect(() => {
    const initialJobs = getJobsPage(0, 6);
    setJobs(initialJobs);
  }, []);

  // Infinite scroll handler
  const loadMoreJobs = useCallback(() => {
    if (loading) return;

    setLoading(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const newJobs = getJobsPage(nextPage, 6);
      setJobs(prevJobs => [...prevJobs, ...newJobs]);
      setCurrentPage(nextPage);
      setLoading(false);
    }, 1000); // Simulate API delay
  }, [currentPage, loading]);

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
        />
        
        {/* Job Listings */}
        <main className="ml-20 px-8 py-8">
          <div className="max-w-[1008px] mx-auto">
            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
              {jobs.map((job, index) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onClick={handleJobClick}
                />
              ))}
            </div>
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-muted-foreground">Loading more opportunities...</span>
              </div>
            )}
            
            {/* Load More Trigger */}
            <div className="h-20"></div>
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
