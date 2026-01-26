import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Briefcase, GraduationCap, IndianRupee, Building, Users, Home, Linkedin, MessageCircle, Phone, Mail, X, Menu, Code, Layers, Building2, Award, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { useJobs } from '@/hooks/useJobs';
import oppAvenueLogo from '@/assets/opp-avenue-logo.png';
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
  domain: string[];
  skills: string[];
  companies: string[];
  workMode: string[];
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
  const { data: allJobs = [], isLoading } = useJobs();

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
      
      // Apply all filters except the one we're excluding
      Object.entries(activeFilters).forEach(([key, values]) => {
        if (key === excludeFilter || values.length === 0) return;
        
        const filterKey = key as keyof FilterState;
        
        if (filterKey === 'location') {
          filtered = filtered.filter(job => {
            // Check if any of the job's locations match any of the filter locations
            return values.some(filterLocation => {
              if (job.locations && Array.isArray(job.locations)) {
                return job.locations.some((loc: any) => 
                  loc.city?.toLowerCase().includes(filterLocation.toLowerCase()) ||
                  loc.state?.toLowerCase().includes(filterLocation.toLowerCase())
                );
              }
              return job.location.toLowerCase().includes(filterLocation.toLowerCase());
            });
          });
        } else if (filterKey === 'workMode') {
          filtered = filtered.filter(job => values.includes(job.work_mode || ''));
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
        } else if (filterKey === 'domain') {
          filtered = filtered.filter(job => job.domains && job.domains.some(d => values.includes(d)));
        } else if (filterKey === 'skills') {
          filtered = filtered.filter(job => job.skills.some(s => values.includes(s)));
        }
      });
      
      return filtered;
    };

    // Calculate dynamic options for each filter
    const locationJobs = getFilteredJobsExcluding('location');
    // Extract individual cities from all job locations
    const allCities = new Set<string>();
    locationJobs.forEach(job => {
      if (job.locations && Array.isArray(job.locations)) {
        job.locations.forEach((loc: any) => {
          if (loc.city) allCities.add(loc.city);
        });
      }
    });
    const locationOptions = Array.from(allCities).sort();

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

    const domainJobs = getFilteredJobsExcluding('domain');
    const domainOptions = Array.from(new Set(domainJobs.flatMap(job => job.domains || []))).sort();

    const skillsJobs = getFilteredJobsExcluding('skills');
    const skillsOptions = Array.from(new Set(skillsJobs.flatMap(job => job.skills))).sort();

    const workModeJobs = getFilteredJobsExcluding('workMode');
    const workModeOptions = Array.from(new Set(
      workModeJobs
        .map(job => job.work_mode)
        .filter(Boolean)
    )).sort();

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
        icon: Building2, 
        label: 'Work Mode', 
        key: 'workMode' as keyof FilterState,
        options: workModeOptions
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
        icon: Layers, 
        label: 'Domain', 
        key: 'domain' as keyof FilterState,
        options: domainOptions
      },
      { 
        icon: Code, 
        label: 'Skills', 
        key: 'skills' as keyof FilterState,
        options: skillsOptions
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
  }, [
    allJobs,
    searchQuery, 
    JSON.stringify(activeFilters.location),
    JSON.stringify(activeFilters.jobType),
    JSON.stringify(activeFilters.experience),
    JSON.stringify(activeFilters.salaryRange),
    JSON.stringify(activeFilters.domain),
    JSON.stringify(activeFilters.skills),
    JSON.stringify(activeFilters.companies),
    JSON.stringify(activeFilters.workMode)
  ]);

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
      domain: [],
      skills: [],
      companies: [],
      workMode: []
    };
    onFiltersChange(emptyFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((count, filters) => count + filters.length, 0);
  };

  return (
    <header className="sticky-header border-none">
      {/* Social Media Links - Mobile Top (Home Page Only) */}
      {isHomePage && (
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
      )}

      <div className="px-8 py-2">
        {/* Top Row: Logo + Menu Buttons (Search hidden on mobile) */}
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <img 
              src={oppAvenueLogo} 
              alt="Opp Avenue Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <h1 className="text-base sm:text-xl font-bold text-foreground truncate">Opp Avenue</h1>
          </div>

          {/* Search Bar - Desktop Only (Home Page) */}
          {isHomePage && (
            <div className={`relative items-center gap-3 hidden md:flex ${isScrolled ? 'flex-1 max-w-md lg:max-w-lg' : 'flex-1 max-w-xl lg:max-w-2xl'}`}>
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
            <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-center">
              <div className="flex items-center gap-2 lg:gap-3 px-2 lg:px-4 py-1 lg:py-1.5 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full border-2 border-primary/20 shadow-lg animate-pulse-subtle">
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                  🌟 Join Us
                </span>
                <div className="flex items-center gap-1.5 lg:gap-2">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : '_self'}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-center w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-card hover:bg-primary hover:scale-125 transition-all duration-300 group shadow-md border-2 border-primary/30"
                      title={link.label}
                    >
                      <link.icon className={`w-3 h-3 lg:w-4 lg:h-4 ${link.color} group-hover:text-primary-foreground transition-colors`} />
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
          <div className="flex md:hidden items-center justify-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full border border-primary/20 shadow-sm">
              <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">
                🌟 Join Us
              </span>
              <div className="flex items-center gap-1">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : '_self'}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-card hover:bg-primary hover:scale-110 transition-all duration-200 group shadow-sm border border-primary/30"
                    title={link.label}
                  >
                    <link.icon className={`w-2.5 h-2.5 ${link.color} group-hover:text-primary-foreground transition-colors`} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters Section for Home Page */}
        {isHomePage && showFilters && (
          <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-8 px-2 py-2">
            {/* Mobile Filters - 3 rows */}
            <div className="md:hidden space-y-1.5">
              <div className="grid grid-cols-3 gap-1.5">
                {filterOptions.slice(0, 3).map((filter) => (
                  <DropdownMenu key={filter.key}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-1.5 text-[10px] ${
                          activeFilters[filter.key].length > 0 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'border-input-border'
                        }`}
                      >
                        <filter.icon className="w-3 h-3 mr-0.5" />
                        <span className="truncate">{filter.label}</span>
                        {activeFilters[filter.key].length > 0 && (
                          <Badge variant="secondary" className="ml-0.5 h-3 w-3 p-0 text-[8px]">
                            {activeFilters[filter.key].length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 max-h-60 overflow-y-auto" align="center">
                      {filter.options.length > 0 ? (
                        filter.options.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option}
                            checked={activeFilters[filter.key].includes(option)}
                            onCheckedChange={() => handleFilterChange(filter.key, option)}
                            className="text-xs"
                          >
                            {option}
                          </DropdownMenuCheckboxItem>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-xs text-muted-foreground">No options</div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {filterOptions.slice(3, 6).map((filter) => (
                  <DropdownMenu key={filter.key}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-1.5 text-[10px] ${
                          activeFilters[filter.key].length > 0 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'border-input-border'
                        }`}
                      >
                        <filter.icon className="w-3 h-3 mr-0.5" />
                        <span className="truncate">{filter.label}</span>
                        {activeFilters[filter.key].length > 0 && (
                          <Badge variant="secondary" className="ml-0.5 h-3 w-3 p-0 text-[8px]">
                            {activeFilters[filter.key].length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 max-h-60 overflow-y-auto" align="center">
                      {filter.options.length > 0 ? (
                        filter.options.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option}
                            checked={activeFilters[filter.key].includes(option)}
                            onCheckedChange={() => handleFilterChange(filter.key, option)}
                            className="text-xs"
                          >
                            {option}
                          </DropdownMenuCheckboxItem>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-xs text-muted-foreground">No options</div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {filterOptions.slice(6).map((filter) => (
                  <DropdownMenu key={filter.key}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-2 text-[10px] ${
                          activeFilters[filter.key].length > 0 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'border-input-border'
                        }`}
                      >
                        <filter.icon className="w-3 h-3 mr-1" />
                        <span className="truncate">{filter.label}</span>
                        {activeFilters[filter.key].length > 0 && (
                          <Badge variant="secondary" className="ml-1 h-3 w-3 p-0 text-[8px]">
                            {activeFilters[filter.key].length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48 max-h-60 overflow-y-auto" align="center">
                      {filter.options.length > 0 ? (
                        filter.options.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option}
                            checked={activeFilters[filter.key].includes(option)}
                            onCheckedChange={() => handleFilterChange(filter.key, option)}
                            className="text-xs"
                          >
                            {option}
                          </DropdownMenuCheckboxItem>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-xs text-muted-foreground">No options</div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
              {getActiveFilterCount() > 0 && (
                <div className="flex justify-center">
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Tablet Filters - Single row */}
            <div className="hidden md:block lg:hidden">
              <div className="grid grid-cols-8 gap-1 px-2">
                {filterOptions.map((filter) => (
                  <DropdownMenu key={filter.key}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 px-1 text-[10px] ${
                          activeFilters[filter.key].length > 0 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'border-input-border'
                        }`}
                      >
                        <filter.icon className="w-3 h-3 mr-0.5" />
                        <span className="truncate">{filter.label}</span>
                        {activeFilters[filter.key].length > 0 && (
                          <Badge variant="secondary" className="ml-0.5 h-3 w-3 p-0 text-[8px]">
                            {activeFilters[filter.key].length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-52 max-h-64 overflow-y-auto" align="center">
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
                        <div className="px-2 py-2 text-sm text-muted-foreground">No options</div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
              {getActiveFilterCount() > 0 && (
                <div className="flex justify-center mt-2">
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:block max-w-7xl mx-auto px-4">
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
                <div className="flex flex-wrap gap-1 items-center justify-center mt-2">
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
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;