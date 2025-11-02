import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Briefcase, GraduationCap, IndianRupee, Building, Users, Home, Linkedin, MessageCircle, Phone, Mail, X, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockJobs } from '@/data/mockJobs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onAdvertiseClick: () => void;
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: FilterState) => void;
  searchQuery: string;
  activeFilters: FilterState;
}

export interface FilterState {
  location: string[];
  jobType: string[];
  experience: string[];
  salaryRange: string[];
  sector: string[];
  companies: string[];
}

const Header: React.FC<HeaderProps> = ({ 
  onAdvertiseClick, 
  onSearchChange, 
  onFiltersChange, 
  searchQuery, 
  activeFilters 
}) => {
  const [showFilters, setShowFilters] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
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

  const socialLinks = [
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/company/your-company',
      label: 'LinkedIn',
      color: 'text-blue-600'
    },
    {
      icon: MessageCircle,
      href: 'https://wa.me/1234567890',
      label: 'WhatsApp',
      color: 'text-green-600'
    },
    {
      icon: Phone,
      href: 'tel:+1234567890',
      label: 'Call Us',
      color: 'text-purple-600'
    },
    {
      icon: Mail,
      href: 'mailto:contact@example.com',
      label: 'Email',
      color: 'text-red-600'
    }
  ];

  // Get dynamic filter options based on current selections and available jobs
  const filterOptions = useMemo(() => {
    const getDynamicFilterOptions = () => {
    // Get all jobs that match current filters (excluding the filter we're calculating options for)
    const getFilteredJobsExcluding = (excludeFilter: keyof FilterState) => {
      let filtered = [...mockJobs];
      
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
      
      // Apply all filters except the one we're excluding
      Object.entries(activeFilters).forEach(([key, values]) => {
        if (key === excludeFilter || values.length === 0) return;
        
        const filterKey = key as keyof FilterState;
        
        if (filterKey === 'location') {
          filtered = filtered.filter(job => {
            if (values.includes('Remote') && job.remote) return true;
            return values.some(location => job.location.toLowerCase().includes(location.toLowerCase()));
          });
        } else if (filterKey === 'jobType') {
          filtered = filtered.filter(job => values.includes(job.type));
        } else if (filterKey === 'experience') {
          filtered = filtered.filter(job => values.includes(job.experience));
        } else if (filterKey === 'salaryRange') {
          filtered = filtered.filter(job => {
            const jobSalary = job.salary.toLowerCase();
            return values.some(range => {
              const rangeKey = range.toLowerCase().replace(/[k₹-]/g, '');
              const jobSalaryKey = jobSalary.replace(/[k₹-]/g, '');
              return jobSalaryKey.includes(rangeKey.slice(0, 2)) || 
                     jobSalaryKey.includes(rangeKey.slice(-2));
            });
          });
        } else if (filterKey === 'companies') {
          filtered = filtered.filter(job => values.includes(job.company));
        } else if (filterKey === 'sector') {
          const sectorCompanyMap: Record<string, string[]> = {
            'Technology': ['Amazon', 'Google', 'Microsoft', 'Meta', 'Tesla'],
            'Entertainment': ['Netflix', 'Spotify'],
            'Legal': ['National Legal Services Authority'],
            'Transportation': ['Uber'],
            'E-commerce': ['Amazon']
          };
          filtered = filtered.filter(job => {
            return values.some(sector => {
              const companies = sectorCompanyMap[sector] || [];
              return companies.includes(job.company);
            });
          });
        }
      });
      
      return filtered;
    };

    // Calculate dynamic options for each filter
    const locationJobs = getFilteredJobsExcluding('location');
    const locationOptions = Array.from(new Set([
      'Remote',
      ...locationJobs.map(job => job.location)
    ])).filter(location => {
      if (location === 'Remote') {
        return locationJobs.some(job => job.remote);
      }
      return locationJobs.some(job => job.location === location);
    }).sort();

    const jobTypeJobs = getFilteredJobsExcluding('jobType');
    const jobTypeOptions = Array.from(new Set(jobTypeJobs.map(job => job.type))).sort();

    const experienceJobs = getFilteredJobsExcluding('experience');
    const experienceOptions = Array.from(new Set(experienceJobs.map(job => job.experience))).sort();

    const salaryJobs = getFilteredJobsExcluding('salaryRange');
    const availableSalaryRanges = ['₹15k-₹30k', '₹50k-₹100k', '₹100k-₹150k', '₹150k-₹200k'];
    const salaryOptions = availableSalaryRanges.filter(range => {
      return salaryJobs.some(job => {
        const jobSalary = job.salary.toLowerCase();
        const rangeKey = range.toLowerCase().replace(/[k₹-]/g, '');
        const jobSalaryKey = jobSalary.replace(/[k₹-]/g, '');
        return jobSalaryKey.includes(rangeKey.slice(0, 2)) || 
               jobSalaryKey.includes(rangeKey.slice(-2));
      });
    });

    const companyJobs = getFilteredJobsExcluding('companies');
    const companyOptions = Array.from(new Set(companyJobs.map(job => job.company))).sort();

    const sectorJobs = getFilteredJobsExcluding('sector');
    const sectorCompanyMap: Record<string, string[]> = {
      'Technology': ['Amazon', 'Google', 'Microsoft', 'Meta', 'Tesla'],
      'Entertainment': ['Netflix', 'Spotify'],
      'Legal': ['National Legal Services Authority'],
      'Transportation': ['Uber'],
      'E-commerce': ['Amazon']
    };
    const sectorOptions = Object.keys(sectorCompanyMap).filter(sector => {
      const sectorCompanies = sectorCompanyMap[sector];
      return sectorJobs.some(job => sectorCompanies.includes(job.company));
    }).sort();

    return [
      { 
        icon: MapPin, 
        label: 'Location', 
        key: 'location' as keyof FilterState,
        options: locationOptions
      },
      { 
        icon: Briefcase, 
        label: 'Job Type', 
        key: 'jobType' as keyof FilterState,
        options: jobTypeOptions
      },
      { 
        icon: GraduationCap, 
        label: 'Experience', 
        key: 'experience' as keyof FilterState,
        options: experienceOptions
      },
      { 
        icon: IndianRupee, 
        label: 'Salary', 
        key: 'salaryRange' as keyof FilterState,
        options: salaryOptions
      },
      { 
        icon: Building, 
        label: 'Sector', 
        key: 'sector' as keyof FilterState,
        options: sectorOptions
      },
      { 
        icon: Users, 
        label: 'Companies', 
        key: 'companies' as keyof FilterState,
        options: companyOptions
      },
    ];
    };
    
    return getDynamicFilterOptions();
  }, [searchQuery, activeFilters]);

  const handleFilterChange = (filterKey: keyof FilterState, option: string) => {
    const currentValues = activeFilters[filterKey];
    const newValues = currentValues.includes(option)
      ? currentValues.filter(item => item !== option)
      : [...currentValues, option];
    
    const newFilters = {
      ...activeFilters,
      [filterKey]: newValues
    };
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterState = {
      location: [],
      jobType: [],
      experience: [],
      salaryRange: [],
      sector: [],
      companies: []
    };
    onFiltersChange(emptyFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((count, filters) => count + filters.length, 0);
  };

  return (
    <header className="sticky-header border-none">
      {/* Social Media Links - Mobile Top */}
      <div className="flex justify-center gap-3 py-2 md:hidden border-b border-border/20">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : '_self'}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-card hover:bg-primary hover:scale-110 transition-all duration-200 group shadow-sm border border-border/50"
            title={link.label}
          >
            <link.icon className={`w-4 h-4 ${link.color} group-hover:text-primary-foreground transition-colors`} />
          </a>
        ))}
      </div>

      <div className="px-8 py-2">
        {/* Top Row: Logo + Menu Buttons (Search hidden on mobile) */}
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">Opp Avenue</h1>
          </div>

          {/* Search Bar - Desktop Only (Home Page) */}
          {isHomePage && (
            <div className={`relative items-center gap-3 hidden md:flex ${isScrolled ? 'flex-1 max-w-lg' : 'flex-1 max-w-2xl'}`}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search for jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 h-10 text-sm bg-card border-input-border focus:border-primary focus:ring-primary rounded-xl"
                />
              </div>
              {isScrolled && (
                <Button
                  onClick={handleFilterToggle}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-xl border-input-border hover:bg-primary hover:text-primary-foreground hover:border-primary flex-shrink-0"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Eye-catching Social Handles - Desktop (Non-Home Pages) */}
          {!isHomePage && (
            <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
              <div className="flex items-center gap-4 px-6 py-2 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full border-2 border-primary/20 shadow-lg animate-pulse-subtle">
                <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                  🌟 Join Our Community
                </span>
                <div className="flex items-center gap-2">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : '_self'}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-card hover:bg-primary hover:scale-125 transition-all duration-300 group shadow-md border-2 border-primary/30"
                      title={link.label}
                    >
                      <link.icon className={`w-4 h-4 ${link.color} group-hover:text-primary-foreground transition-colors`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Social Media Links - Desktop Only (Home Page) */}
          {isHomePage && (
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : '_self'}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-card hover:bg-primary hover:scale-110 transition-all duration-200 group shadow-sm border border-border/50"
                  title={link.label}
                >
                  <link.icon className={`w-4 h-4 ${link.color} group-hover:text-primary-foreground transition-colors`} />
                </a>
              ))}
            </div>
          )}

          {/* Navigation Menu Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={() => navigate('/')}
              variant={location.pathname === '/' ? 'default' : 'outline'}
              size="sm"
              className={`h-9 px-2 sm:px-3 rounded-lg text-sm shadow-sm transition-all ${
                location.pathname === '/' 
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                  : 'bg-card text-card-foreground border-border hover:bg-primary hover:text-primary-foreground hover:border-primary'
              }`}
            >
              <Home className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button
              onClick={() => navigate('/advertise')}
              variant="outline"
              size="sm"
              className="h-9 px-2 sm:px-3 rounded-lg bg-gradient-to-r from-accent/20 to-accent-hover/20 text-accent border-accent/50 hover:from-accent hover:to-accent-hover hover:text-accent-foreground text-sm shadow-sm font-medium"
            >
              <span className="hidden sm:inline">Advertise</span>
              <span className="sm:hidden">Ads</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-lg"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card z-50">
                <DropdownMenuItem onClick={() => navigate('/about')} className="cursor-pointer mb-2 hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary">
                  About
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/resources')} className="cursor-pointer mb-2 hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary">
                  Resources
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/blogs')} className="cursor-pointer mb-2 hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary">
                  Blogs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar - Below Title (Home Page Only) */}
        {isHomePage && (
          <div className="flex md:hidden items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for jobs, companies, or skills..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
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
        )}

        {/* Eye-catching Social Handles - Mobile (Non-Home Pages) */}
        {!isHomePage && (
          <div className="flex md:hidden justify-center mb-3">
            <div className="flex flex-col items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border-2 border-primary/20 shadow-lg w-full animate-pulse-subtle">
              <span className="text-sm font-semibold text-foreground">
                🌟 Join Our Community
              </span>
              <div className="flex items-center gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : '_self'}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-card hover:bg-primary hover:scale-125 transition-all duration-300 group shadow-md border-2 border-primary/30"
                    title={link.label}
                  >
                    <link.icon className={`w-5 h-5 ${link.color} group-hover:text-primary-foreground transition-colors`} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* Filter Buttons Row (Home Page Only) */}
        {isHomePage && (!isScrolled || showFilters) && (
          <div className="space-y-3">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {filterOptions.map((filter, index) => (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 px-3 rounded-full border-input-border hover:bg-secondary hover:border-primary text-xs ${
                        activeFilters[filter.key].length > 0 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <filter.icon className="w-3 h-3 mr-1" />
                      {filter.label}
                      {activeFilters[filter.key].length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                          {activeFilters[filter.key].length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto bg-card border-border shadow-lg" align="center">
                    {filter.options.length > 0 ? (
                      filter.options.map((option) => (
                        <DropdownMenuCheckboxItem
                          key={option}
                          checked={activeFilters[filter.key].includes(option)}
                          onCheckedChange={() => handleFilterChange(filter.key, option)}
                          className="text-sm"
                        >
                          {option}
                        </DropdownMenuCheckboxItem>
                      ))
                    ) : (
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        No options available
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
              
              {getActiveFilterCount() > 0 && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-full border-input-border hover:bg-destructive hover:text-destructive-foreground text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            
            {/* Active Filter Tags */}
            {getActiveFilterCount() > 0 && (
              <div className="flex flex-wrap gap-1 items-center justify-center">
                {Object.entries(activeFilters).map(([key, values]) =>
                  values.map((value) => (
                    <Badge
                      key={`${key}-${value}`}
                      variant="secondary"
                      className="text-xs px-2 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleFilterChange(key as keyof FilterState, value)}
                    >
                      {value}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;