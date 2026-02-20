import React from 'react';
import { MapPin, Clock, IndianRupee, Building, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  skills: string[];
  postedTime: string;
  description: string;
  remote: boolean;
  companyLogo?: string;
  sector?: string;
  domains?: string[];
  applicationEmail?: string;
  applicationLink?: string;
  locations?: any[];
  work_mode?: string;
  vacancies?: number | null;
}

interface LocationData {
  city: string;
  state?: string;
  country?: string;
}

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  return (
    <div className="job-card cursor-pointer" onClick={() => onClick(job)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {job.companyLogo ? (
          <img 
            src={job.companyLogo} 
            alt={`${job.company} logo`}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              {job.company.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-lg text-card-foreground mb-1">{job.title}</h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="w-4 h-4" />
            <span className="text-sm">{job.company}</span>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        {/* Row 1: Work Mode + Vacancies */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{job.work_mode || 'NA'}</Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Users className="w-3 h-3" />
            {job.vacancies ? `${job.vacancies} ${job.vacancies === 1 ? 'vacancy' : 'vacancies'}` : 'NA'}
          </Badge>
        </div>

        {/* Row 2: Location and Salary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location || 'NA'}</span>
          </div>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-4 h-4" />
            <span>{job.salary || 'NA'}</span>
          </div>
        </div>

        {/* Row 3: Posted Time, Job Type, Experience */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{job.postedTime || 'NA'}</span>
          </div>
          <Badge variant="outline" className="text-xs whitespace-nowrap shrink-0">{job.type || 'NA'}</Badge>
          <Badge variant="outline" className="text-xs whitespace-nowrap shrink-0">{job.experience || 'NA'}</Badge>
        </div>
      </div>

      {/* Domain */}
      {job.domains && job.domains.length > 0 && (
        <div className="mb-3">
          <Badge variant="default" className="text-xs px-2 py-1">
            {job.domains[0]}
          </Badge>
        </div>
      )}

      {/* Skills */}
      <div className="flex flex-nowrap gap-2 overflow-hidden">
        {job.skills.slice(0, 3).map((skill, index) => (
          <Badge key={index} variant="secondary" className="text-xs px-2 py-1 rounded-full whitespace-nowrap shrink-0">
            {skill}
          </Badge>
        ))}
        {job.skills.length > 3 && (
          <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full whitespace-nowrap shrink-0">
            +{job.skills.length - 3}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default JobCard;