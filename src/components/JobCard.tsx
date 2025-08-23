import React from 'react';
import { MapPin, Clock, DollarSign, Building, Bookmark, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  return (
    <div className="job-card cursor-pointer" onClick={() => onClick(job)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">
              {job.company.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-card-foreground mb-1">{job.title}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="w-4 h-4" />
              <span className="text-sm">{job.company}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-accent">
          <Bookmark className="w-4 h-4" />
        </Button>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
            {job.remote && <Badge variant="secondary" className="ml-2 text-xs">Remote</Badge>}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{job.salary}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{job.postedTime}</span>
          </div>
          <Badge variant="outline" className="text-xs">{job.type}</Badge>
          <Badge variant="outline" className="text-xs">{job.experience}</Badge>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 3).map((skill, index) => (
          <Badge key={index} variant="secondary" className="text-xs px-2 py-1 rounded-full">
            {skill}
          </Badge>
        ))}
        {job.skills.length > 3 && (
          <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full">
            +{job.skills.length - 3}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button 
          className="bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent text-accent-foreground px-6 py-2 rounded-full font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick(job);
          }}
        >
          Apply
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          <ExternalLink className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>
    </div>
  );
};

export default JobCard;