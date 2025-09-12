
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, DollarSign, Building, Users, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';

import FloatingBubbles from '@/components/FloatingBubbles';
import { mockJobs } from '@/data/mockJobs';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const job = mockJobs.find(j => j.id === jobId);
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary relative">
        <FloatingBubbles />
        <div className="relative z-10">
          <Header 
            onAdvertiseClick={() => navigate('/advertise')}
          />
          <main className="px-8 py-8">
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
        
        <main className="px-8 py-8">
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

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Button className="bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent text-accent-foreground px-8 py-2 rounded-full font-medium">
                  Apply Now
                </Button>
                <Button variant="outline" className="rounded-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Company
                </Button>
                <Button variant="outline" className="rounded-full">
                  Save Job
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
                
                <h3 className="font-semibold text-card-foreground mt-6 mb-3">Responsibilities:</h3>
                <ul className="space-y-2 mb-6">
                  <li>• Design and develop scalable data pipelines and analytics solutions</li>
                  <li>• Collaborate with cross-functional teams to understand business requirements</li>
                  <li>• Build machine learning models and statistical analyses</li>
                  <li>• Present insights and recommendations to stakeholders</li>
                </ul>

                <h3 className="font-semibold text-card-foreground mt-6 mb-3">Requirements:</h3>
                <ul className="space-y-2">
                  <li>• Bachelor's degree in Computer Science, Statistics, or related field</li>
                  <li>• 3+ years of experience in data science or analytics</li>
                  <li>• Proficiency in Python, R, SQL, and machine learning frameworks</li>
                  <li>• Experience with cloud platforms (AWS, GCP, Azure)</li>
                </ul>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-card rounded-2xl shadow-primary p-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">About {job.company}</h2>
              <p className="text-muted-foreground mb-4">
                {job.company} is a leading technology company focused on innovation and excellence. 
                We provide cutting-edge solutions and foster a collaborative work environment where 
                talented individuals can grow and make a significant impact.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {job.postedTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>50+ employees</span>
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
