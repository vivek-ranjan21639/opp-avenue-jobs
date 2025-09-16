
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, DollarSign, Building, Users, Calendar, ExternalLink, Mail, Phone, Globe, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';

import FloatingBubbles from '@/components/FloatingBubbles';
import { mockJobs } from '@/data/mockJobs';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const normalizedId = (jobId || '').split('-page-')[0];
  const job = mockJobs.find(j => j.id === normalizedId);
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary relative">
        <FloatingBubbles />
        <div className="relative z-10">
          <Header 
            onAdvertiseClick={() => navigate('/advertise')}
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
        />
        
        <main className="px-4 md:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="mb-6 rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>

            {/* Job Header */}
            <div className="bg-card rounded-2xl shadow-primary p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">
                    {job.company.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="w-5 h-5" />
                    <span className="text-lg">{job.company}</span>
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
                  <DollarSign className="w-5 h-5 text-success" />
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
                <p className="mb-4">
                  A state-of-the-art technology company with the necessary 
                  knowledge and skills that enable it to act with speed, promote research and innovation, provide 
                  strategic vision, and deal with emerging challenges in the industry.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-card-foreground mb-2">Company Stats</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>500+ employees globally</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Founded in 2015</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>15+ office locations</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground mb-2">Company Culture</h4>
                    <div className="space-y-1 text-sm">
                      <p>• Innovation-driven environment</p>
                      <p>• Collaborative team spirit</p>
                      <p>• Continuous learning culture</p>
                      <p>• Work-life balance focused</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm pt-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Posted {job.postedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Multiple locations available</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button 
                  onClick={() => window.open(`mailto:hr@${job.company.toLowerCase().replace(/\s+/g, '')}.com?subject=Application for ${job.title} Position&body=Dear Hiring Manager,%0D%0A%0D%0AI am interested in applying for the ${job.title} position at ${job.company}. Please find my details below and let me know the next steps.%0D%0A%0D%0AThank you for your consideration.`, '_blank')}
                  className="bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent text-accent-foreground px-6 sm:px-8 py-2 sm:py-3 rounded-full font-medium flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Apply via Email
                </Button>
                <Button 
                  onClick={() => window.open(`https://www.${job.company.toLowerCase().replace(/\s+/g, '')}.com/careers`, '_blank')}
                  variant="outline" 
                  className="rounded-full flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Company
                </Button>
              </div>
            </div>

            {/* Skills Required */}
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

            {/* Job Description */}
            <div className="bg-card rounded-2xl shadow-primary p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">About the Role</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="mb-4">{job.description}</p>
                
                <h3 className="font-semibold text-card-foreground mt-6 mb-3">Key Responsibilities:</h3>
                <ul className="space-y-2 mb-6">
                  <li>• Design and develop scalable data pipelines and analytics solutions</li>
                  <li>• Collaborate with cross-functional teams to understand business requirements</li>
                  <li>• Build machine learning models and statistical analyses</li>
                  <li>• Present insights and recommendations to stakeholders</li>
                  <li>• Mentor junior team members and contribute to best practices</li>
                </ul>

                <h3 className="font-semibold text-card-foreground mt-6 mb-3">Qualifications & Requirements:</h3>
                <ul className="space-y-2">
                  <li>• Bachelor's degree in Computer Science, Statistics, or related field</li>
                  <li>• 3+ years of experience in data science or analytics</li>
                  <li>• Proficiency in Python, R, SQL, and machine learning frameworks</li>
                  <li>• Experience with cloud platforms (AWS, GCP, Azure)</li>
                  <li>• Strong analytical and problem-solving skills</li>
                </ul>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-card rounded-2xl shadow-primary p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">Eligibility Criteria</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Education Requirements:</h3>
                  <ul className="space-y-2">
                    <li>• Bachelor's degree holders with minimum 70% or equivalent marks</li>
                    <li>• Master's degree candidates currently pursuing or completed</li>
                    <li>• Fresh graduates within 6 months of completion are welcome</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Experience Level:</h3>
                  <p>Entry to mid-level professionals with 0-5 years of relevant experience</p>
                </div>
              </div>
            </div>

            {/* Benefits & Perks */}
            <div className="bg-card rounded-2xl shadow-primary p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">Benefits & Perks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-card-foreground">Health & Wellness</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Comprehensive health insurance</li>
                    <li>• Mental health support</li>
                    <li>• Wellness programs</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-card-foreground">Work-Life Balance</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Flexible working hours</li>
                    <li>• Remote work options</li>
                    <li>• Paid time off</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-card-foreground">Growth & Development</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Learning & development budget</li>
                    <li>• Conference attendance</li>
                    <li>• Career advancement opportunities</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-card-foreground">Additional Benefits</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Performance bonuses</li>
                    <li>• Employee stock options</li>
                    <li>• Team events & activities</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Application Process */}
            <div className="bg-card rounded-2xl shadow-primary p-4 sm:p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">How to Apply</h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Quick Apply Options:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button 
                      onClick={() => window.open(`mailto:hr@${job.company.toLowerCase().replace(/\s+/g, '')}.com?subject=Application for ${job.title} Position&body=Dear Hiring Manager,%0D%0A%0D%0AI am interested in applying for the ${job.title} position at ${job.company}. Please find my details below and let me know the next steps.%0D%0A%0D%0AThank you for your consideration.`, '_blank')}
                      variant="outline" 
                      className="w-full justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Apply via Email
                    </Button>
                    <Button 
                      onClick={() => window.open('tel:+1-800-CAREERS', '_blank')}
                      variant="outline" 
                      className="w-full justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call HR: +1-800-CAREERS
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Application Steps:</h3>
                  <ol className="space-y-2 list-decimal list-inside text-sm">
                    <li>Click "Apply via Email" above or send your resume to hr@{job.company.toLowerCase().replace(/\s+/g, '')}.com</li>
                    <li>Include "Application for {job.title} Position" in the subject line</li>
                    <li>Attach your resume, cover letter, and portfolio (if applicable)</li>
                    <li>Wait for initial screening and review (2-3 business days)</li>
                    <li>Complete technical assessment or coding challenge if invited</li>
                    <li>Participate in virtual or in-person interviews with the team</li>
                    <li>Receive final decision and discuss offer details</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Required Documents:</h3>
                  <ul className="space-y-1">
                    <li>• Updated resume/CV</li>
                    <li>• Cover letter (optional but recommended)</li>
                    <li>• Portfolio or work samples (if applicable)</li>
                    <li>• Academic transcripts</li>
                  </ul>
                </div>
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <p className="text-sm">
                    <strong>Application Deadline:</strong> Applications are reviewed on a rolling basis. 
                    Apply early for the best chance of consideration.
                  </p>
                </div>
              </div>
            </div>


            {/* Contact Information */}
            <div className="bg-card rounded-2xl shadow-primary p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-sm sm:text-base">Have questions about this position? Get in touch with our recruitment team:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <a 
                        href={`mailto:hr@${job.company.toLowerCase().replace(/\s+/g, '')}.com`}
                        className="text-primary hover:text-primary-hover underline"
                      >
                        hr@{job.company.toLowerCase().replace(/\s+/g, '')}.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <a 
                        href="tel:+1-800-CAREERS"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        +1-800-CAREERS
                      </a>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-primary" />
                      <a 
                        href={`https://www.${job.company.toLowerCase().replace(/\s+/g, '')}.com/careers`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        www.{job.company.toLowerCase().replace(/\s+/g, '')}.com/careers
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Response: 3-5 business days</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs sm:text-sm text-card-foreground">
                    💡 <strong>Quick Tip:</strong> Mention this job posting reference when contacting us: {job.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobDetail;
