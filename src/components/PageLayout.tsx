import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdvertisePage from '@/components/AdvertisePage';
import { usePrerenderReady } from '@/hooks/usePrerenderReady';

interface PageLayoutProps {
  children: React.ReactNode;
  prerenderReady?: boolean;
  className?: string;
}

const defaultFilters = {
  location: [] as string[],
  jobType: [] as string[],
  experience: [] as string[],
  salaryRange: [] as string[],
  domain: [] as string[],
  skills: [] as string[],
  companies: [] as string[],
  workMode: [] as string[],
};

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  prerenderReady = true,
  className = "min-h-screen bg-background",
}) => {
  const [showAdvertise, setShowAdvertise] = useState(false);

  usePrerenderReady(prerenderReady);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={className}>
      <Header
        onAdvertiseClick={() => setShowAdvertise(true)}
        searchQuery=""
        onSearchChange={() => {}}
        activeFilters={defaultFilters}
        onFiltersChange={() => {}}
      />
      {children}
      <Footer />
      <AdvertisePage isOpen={showAdvertise} onClose={() => setShowAdvertise(false)} />
    </div>
  );
};

export default PageLayout;
