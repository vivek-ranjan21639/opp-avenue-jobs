
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, IndianRupee, Building, Users, Calendar, ExternalLink, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header, { FilterState } from '@/components/Header';
import AdUnit from '@/components/AdUnit';
import FloatingBubbles from '@/components/FloatingBubbles';
import Footer from '@/components/Footer';
import { useJob } from '@/hooks/useJobs';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(jobId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    experience: [],
    salaryRange: [],
    domain: [],
    skills: [],
    companies: []
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary relative">
        <FloatingBubbles />
        <div className="relative z-10">
          <Header 
            onAdvertiseClick={() => navigate('/advertise')}
            onSearchChange={setSearchQuery}
            onFiltersChange={setActiveFilters}
            searchQuery={searchQuery}
            activeFilters={activeFilters}
          />
          <main className="px-4 md:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl shadow-primary p-6 animate-pulse">
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-muted rounded w-1/2 mb-6"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary relative">
        <FloatingBubbles />
        <div className="relative z-10">
          <Header 
            onAdvertiseClick={() => navigate('/advertise')}
            onSearchChange={setSearchQuery}
            onFiltersChange={setActiveFilters}
            searchQuery={searchQuery}
            activeFilters={activeFilters}
          />
          <main className="px-4 md:px-8 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
              <Button onClick={() => navigate('/')} className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary relative">
      <FloatingBubbles />
      
      
      <div className="relative z-10">
        <Header 
          onAdvertiseClick={() => navigate('/advertise')}
          onSearchChange={setSearchQuery}
          onFiltersChange={setActiveFilters}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
        />
        
        <main className="px-4 md:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Top Job Detail Ad */}
            <div className="mb-6">
              <AdUnit size="banner" label="Job Detail Header Ad" />
            </div>

            {/* Job Header */}
            <div className="bg-card rounded-2xl shadow-primary p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                {job.companyLogo ? (
                  <img 
                    src={job.companyLogo} 
                    alt={`${job.company_name} logo`}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-2xl">
                      {job.company_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="w-5 h-5" />
                    <span className="text-lg">{job.company_name}</span>
                  </div>
                </div>
              </div>

              {/* Job Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{job.location}</p>
                    {job.remote && <Badge variant="secondary" className="mt-1 text-xs">Remote</Badge>}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                  <IndianRupee className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-medium">{job.salary}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                  <Clock className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium">{job.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{job.experience}</p>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-3 text-muted-foreground mb-6">
                {job.companyDescription && (
                  <p className="mb-4">{job.companyDescription}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-card-foreground mb-2">Company Stats</h4>
                    <div className="space-y-1 text-sm">
                      {job.companyEmployeeCount && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{job.companyEmployeeCount} employees</span>
                        </div>
                      )}
                      {job.companyFoundedYear && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Founded in {job.companyFoundedYear}</span>
                        </div>
                      )}
                      {job.companyOfficeLocations && job.companyOfficeLocations.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>{job.companyOfficeLocations.length}+ office locations</span>
                        </div>
                      )}
                      {job.companyHqLocation && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>HQ: {job.companyHqLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {job.culture_points && job.culture_points.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-2">Company Culture</h4>
                      <div className="space-y-1 text-sm">
                        {job.culture_points.map((point, index) => (
                          <p key={index}>• {point}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm pt-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Posted {job.postedTime}</span>
                  </div>
                  {job.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {job.application_link ? (
                  <Button 
                    onClick={() => window.open(job.application_link, '_blank')}
                    className="bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent text-accent-foreground px-6 sm:px-8 py-2 sm:py-3 rounded-full font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Apply Now
                  </Button>
                ) : (
                  <Button 
                    onClick={() => window.open(`mailto:hr@${job.company_name.toLowerCase().replace(/\s+/g, '')}.com?subject=Application for ${job.title} Position&body=Dear Hiring Manager,%0D%0A%0D%0AI am interested in applying for the ${job.title} position at ${job.company_name}. Please find my details below and let me know the next steps.%0D%0A%0D%0AThank you for your consideration.`, '_blank')}
                    className="bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent text-accent-foreground px-6 sm:px-8 py-2 sm:py-3 rounded-full font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Apply via Email
                  </Button>
                )}
                {job.companyWebsite && (
                  <Button 
                    onClick={() => window.open(job.companyWebsite, '_blank')}
                    variant="outline" 
                    className="rounded-full flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Company
                  </Button>
                )}
              </div>
            </div>

            {/* Skills Required */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-card rounded-2xl shadow-primary p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1 rounded-full">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Job Description */}
            <div className="bg-card rounded-2xl shadow-primary p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">About the Role</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {job.description && <p className="mb-4">{job.description}</p>}
                
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <>
                    <h3 className="font-semibold text-card-foreground mt-6 mb-3">Key Responsibilities:</h3>
                    <ul className="space-y-2 mb-6">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index}>• {resp}</li>
                      ))}
                    </ul>
                  </>
                )}

                {job.qualifications && job.qualifications.length > 0 && (
                  <>
                    <h3 className="font-semibold text-card-foreground mt-6 mb-3">Qualifications & Requirements:</h3>
                    <ul className="space-y-2">
                      {job.qualifications.map((qual, index) => (
                        <li key={index}>• {qual}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
            
            {/* Mid-content Ad */}
            <div className="mb-6">
              <AdUnit size="rectangle" label="Mid-content Rectangle Ad" />
            </div>

            {/* Eligibility Criteria */}
            {job.eligibility && (
              <div className="bg-card rounded-2xl shadow-primary p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Eligibility Criteria</h2>
                <div className="space-y-4 text-muted-foreground">
                  {job.eligibility.education_level && (
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-2">Education Requirements:</h3>
                      <p>{job.eligibility.education_level}</p>
                    </div>
                  )}
                  {(job.eligibility.min_experience || job.eligibility.max_experience) && (
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-2">Experience Level:</h3>
                      <p>
                        {job.eligibility.min_experience && job.eligibility.max_experience
                          ? `${job.eligibility.min_experience}-${job.eligibility.max_experience} years of experience`
                          : job.eligibility.min_experience
                          ? `Minimum ${job.eligibility.min_experience} years of experience`
                          : job.eligibility.max_experience
                          ? `Maximum ${job.eligibility.max_experience} years of experience`
                          : 'Experience level not specified'}
                      </p>
                    </div>
                  )}
                  {job.eligibility.age_limit && (
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-2">Age Limit:</h3>
                      <p>Maximum {job.eligibility.age_limit} years</p>
                    </div>
                  )}
                  {job.eligibility.other_criteria && (
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-2">Other Criteria:</h3>
                      <p>{job.eligibility.other_criteria}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Benefits & Perks */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-card rounded-2xl shadow-primary p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Benefits & Perks</h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 rounded-full">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="flex justify-center mb-6">
              {job.application_link ? (
                <Button 
                  onClick={() => window.open(job.application_link, '_blank')}
                  className="bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent text-accent-foreground px-8 py-3 rounded-full font-medium"
                >
                  Apply Now
                </Button>
              ) : (
                <Button 
                  onClick={() => window.open(`mailto:hr@${job.company_name.toLowerCase().replace(/\s+/g, '')}.com?subject=Application for ${job.title} Position&body=Dear Hiring Manager,%0D%0A%0D%0AI am interested in applying for the ${job.title} position at ${job.company_name}. Please find my details below and let me know the next steps.%0D%0A%0D%0AThank you for your consideration.`, '_blank')}
                  className="bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent text-accent-foreground px-8 py-3 rounded-full font-medium"
                >
                  Apply via Email
                </Button>
              )}
            </div>
            
            {/* Bottom Ad */}
            <div className="mb-6">
              <AdUnit size="banner" label="Bottom Banner Ad" />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default JobDetail;
