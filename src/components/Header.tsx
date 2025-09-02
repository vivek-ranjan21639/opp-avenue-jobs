import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, GraduationCap, DollarSign, Building, Users, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onAdvertiseClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdvertiseClick }) => {
  const [showFilters, setShowFilters] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualToggle, setManualToggle] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const scrolled = window.scrollY > 150;
        setIsScrolled(scrolled);
        
        // Only auto-hide/show filters if user hasn't manually toggled them
        if (!manualToggle) {
          if (scrolled && showFilters) {
            setShowFilters(false);
          } else if (!scrolled && !showFilters) {
            setShowFilters(true);
          }
        }
        
        // Reset manual toggle flag when scrolling back to top
        if (!scrolled && manualToggle) {
          setManualToggle(false);
        }
      }, 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [showFilters, manualToggle]);

  const handleFilterToggle = () => {
    setManualToggle(true);
    setShowFilters(prev => !prev);
  };

  const filterOptions = [
    { icon: MapPin, label: 'Location', options: ['Remote', 'Austin, TX', 'New York', 'San Francisco'] },
    { icon: Briefcase, label: 'Job Type', options: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
    { icon: GraduationCap, label: 'Experience', options: ['Entry Level', '1-3 years', '3-5 years', '5+ years'] },
    { icon: DollarSign, label: 'Salary range', options: ['$50k-$70k', '$70k-$100k', '$100k-$150k', '$150k+'] },
    { icon: Building, label: 'Sector', options: ['Technology', 'Finance', 'Healthcare', 'Education'] },
    { icon: Users, label: 'Companies', options: ['Amazon', 'Google', 'Microsoft', 'Meta'] },
  ];

  return (
    <header className="sticky-header border-none">
      <div className="ml-20 px-8 py-2">
        {/* Top Row: Logo + Menu Buttons (Search hidden on mobile) */}
        <div className="flex items-center justify-between gap-6 mb-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Opp Avenue</h1>
          </div>

          {/* Search Bar - Desktop Only */}
          <div className={`relative items-center gap-3 hidden md:flex ${isScrolled ? 'flex-1 max-w-lg' : 'flex-1 max-w-2xl'}`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for jobs, companies, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm bg-card border-input-border focus:border-primary focus:ring-primary rounded-xl"
              />
            </div>
            {isScrolled && (
              <Button
                onClick={handleFilterToggle}
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-xl border-input-border hover:bg-secondary hover:border-primary flex-shrink-0"
              >
                <Filter className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Navigation Menu Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-lg bg-card text-card-foreground border-border hover:bg-secondary hover:border-primary text-sm shadow-sm"
            >
              <Home className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button
              onClick={onAdvertiseClick}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-lg bg-primary text-primary-foreground border-primary hover:bg-primary-hover advertise-pulse text-sm shadow-sm"
            >
              <span className="hidden sm:inline">Advertise</span>
              <span className="sm:hidden">Ad</span>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar - Below Title */}
        <div className="flex md:hidden items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for jobs, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm bg-card border-input-border focus:border-primary focus:ring-primary rounded-xl"
            />
          </div>
          <Button
            onClick={handleFilterToggle}
            variant="outline"
            size="sm"
            className="h-10 w-10 rounded-xl border-input-border hover:bg-secondary hover:border-primary flex-shrink-0"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Buttons Row */}
        {(!isScrolled || showFilters) && (
          <div className="space-y-2">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {filterOptions.map((filter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-full border-input-border hover:bg-secondary hover:border-primary text-muted-foreground hover:text-foreground text-xs"
                >
                  <filter.icon className="w-3 h-3 mr-1" />
                  {filter.label}
                </Button>
              ))}
              {showFilters && (
                <Button
                  onClick={() => console.log('Applying filters...')}
                  variant="default"
                  size="sm"
                  className="h-8 px-3 rounded-full ml-1 text-xs"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Apply Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;