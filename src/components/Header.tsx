import React, { useState } from 'react';
import { Search, Filter, MapPin, Briefcase, GraduationCap, DollarSign, Building, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onAdvertiseClick: () => void;
  onCareerClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdvertiseClick, onCareerClick }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = [
    { icon: MapPin, label: 'Location', options: ['Remote', 'Austin, TX', 'New York', 'San Francisco'] },
    { icon: Briefcase, label: 'Job Type', options: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
    { icon: GraduationCap, label: 'Experience', options: ['Entry Level', '1-3 years', '3-5 years', '5+ years'] },
    { icon: DollarSign, label: 'Salary range', options: ['$50k-$70k', '$70k-$100k', '$100k-$150k', '$150k+'] },
    { icon: Building, label: 'Sector', options: ['Technology', 'Finance', 'Healthcare', 'Education'] },
    { icon: Users, label: 'Companies', options: ['Amazon', 'Google', 'Microsoft', 'Meta'] },
  ];

  return (
    <header className="sticky-header">
      <div className="ml-20 px-8 py-4">
        {/* Top Row: Logo + Search + Menu Buttons */}
        <div className="flex items-center justify-between gap-6 mb-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">O</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Opp Avenue</h1>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for jobs, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-card border-input-border focus:border-primary focus:ring-primary rounded-xl"
            />
          </div>

          {/* Circular Menu Buttons */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <button
              onClick={onAdvertiseClick}
              className="circular-menu advertise-pulse"
            >
              Advertise
            </button>
            <button
              onClick={onCareerClick}
              className="circular-menu"
            >
              Career
            </button>
          </div>
        </div>

        {/* Filter Buttons Row */}
        <div className="space-y-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {filterOptions.map((filter, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-10 px-4 rounded-full border-input-border hover:bg-secondary hover:border-primary text-muted-foreground hover:text-foreground"
              >
                <filter.icon className="w-4 h-4 mr-2" />
                {filter.label}
              </Button>
            ))}
            <Button
              onClick={() => console.log('Applying filters...')}
              variant="default"
              size="sm"
              className="h-10 px-4 rounded-full ml-2"
            >
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;