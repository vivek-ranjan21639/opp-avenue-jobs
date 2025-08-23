import React, { useState, useEffect, useCallback } from 'react';
import FloatingBubbles from '@/components/FloatingBubbles';
import SocialSidebar from '@/components/SocialSidebar';
import Header from '@/components/Header';
import JobCard, { Job } from '@/components/JobCard';
import JobDetailModal from '@/components/JobDetailModal';
import AdvertisePage from '@/components/AdvertisePage';
import { getJobsPage } from '@/data/mockJobs';

const Index = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showAdvertise, setShowAdvertise] = useState(false);

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

  // Scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 1000
      ) {
        loadMoreJobs();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreJobs]);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  const handleAdvertiseClick = () => {
    setShowAdvertise(true);
  };

  const handleCareerClick = () => {
    // Navigate to career page or show career modal
    console.log('Career clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary relative">
      {/* Floating Bubbles Background */}
      <FloatingBubbles />
      
      {/* Social Sidebar */}
      <SocialSidebar />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <Header 
          onAdvertiseClick={handleAdvertiseClick}
          onCareerClick={handleCareerClick}
        />
        
        {/* Job Listings */}
        <main className="ml-20 px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      
      {/* Modals */}
      <JobDetailModal 
        job={selectedJob}
        isOpen={showJobDetail}
        onClose={() => {
          setShowJobDetail(false);
          setSelectedJob(null);
        }}
      />
      
      <AdvertisePage 
        isOpen={showAdvertise}
        onClose={() => setShowAdvertise(false)}
      />
    </div>
  );
};

export default Index;
