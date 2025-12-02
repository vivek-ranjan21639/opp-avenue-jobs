import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Users, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header, { FilterState } from '@/components/Header';
import AdvertisePage from '@/components/AdvertisePage';
import Footer from '@/components/Footer';

const About = () => {
  const navigate = useNavigate();
  const [showAdvertise, setShowAdvertise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    experience: [],
    salaryRange: [],
    domain: [],
    skills: [],
    companies: [],
    workMode: []
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Header
        onAdvertiseClick={() => setShowAdvertise(true)}
        onSearchChange={setSearchQuery}
        onFiltersChange={setActiveFilters}
        searchQuery={searchQuery}
        activeFilters={activeFilters}
      />

      <main className="container mx-auto px-4 pt-4 pb-12 max-w-6xl">
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              About Opp Avenue
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your trusted platform for discovering exciting career opportunities and connecting talented professionals with leading companies.
            </p>
          </section>

          {/* Mission Section */}
          <section className="grid md:grid-cols-2 gap-8">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Our Mission</CardTitle>
                <CardDescription>
                  To simplify the job search process and make quality opportunities accessible to everyone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We believe that finding the right job should be straightforward and empowering. Our platform brings together job seekers and employers in a seamless, efficient way.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Our Vision</CardTitle>
                <CardDescription>
                  Building the future of work through innovation and technology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We envision a world where every professional can easily find opportunities that match their skills, passions, and career goals.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Values Section */}
          <section>
            <h2 className="text-xl md:text-3xl font-bold text-center mb-8">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">People First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We prioritize the needs of job seekers and employers, ensuring a user-friendly experience for all.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We curate high-quality job listings from reputable companies to ensure the best opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-xl">Innovation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We continuously improve our platform with the latest technology to serve you better.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-xl md:text-3xl font-bold text-center mb-8">Platform Highlights</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Active Job Listings</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">50+</div>
                <div className="text-muted-foreground">Partner Companies</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10k+</div>
                <div className="text-muted-foreground">Job Seekers</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <AdvertisePage isOpen={showAdvertise} onClose={() => setShowAdvertise(false)} />
    </div>
  );
};

export default About;
