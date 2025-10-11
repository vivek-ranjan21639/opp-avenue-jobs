
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Eye, MessageCircle, Linkedin, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header, { FilterState } from '@/components/Header';
import FloatingBubbles from '@/components/FloatingBubbles';
import Footer from '@/components/Footer';

const Advertise = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    experience: [],
    salaryRange: [],
    sector: [],
    companies: []
  });

  const platformStats = [
    { metric: 'Total Page Views', value: '53 Lakhs/monthly', icon: Eye, color: 'text-blue-600' },
    { metric: 'Unique Visitors', value: '17.84 Lakhs/monthly', icon: Users, color: 'text-green-600' },
    { metric: 'WhatsApp Subscribers', value: '4.47 Lakhs over 750+ groups', icon: MessageCircle, color: 'text-green-500' },
    { metric: 'LinkedIn Followers', value: '1.80 Lakhs', icon: Linkedin, color: 'text-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary relative">
      <FloatingBubbles />
      
      <div className="relative z-10">
        <Header 
          onAdvertiseClick={() => {}} // Already on advertise page
          onSearchChange={setSearchQuery}
          onFiltersChange={setActiveFilters}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
        />
        
        <main className="px-4 sm:px-8 pt-4 pb-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-card rounded-2xl shadow-primary p-4 sm:p-8 mb-6 sm:mb-8">
              <div className="text-center">
                <h1 className="text-2xl sm:text-4xl font-bold text-card-foreground mb-3 sm:mb-4">Advertise with Opp Avenue</h1>
                <p className="text-base sm:text-xl text-muted-foreground">
                  Reach out to 1lakh+ daily users by advertising at our platform
                </p>
              </div>
            </div>

            {/* Platform Statistics */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-card-foreground flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Why advertise at our platform
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {platformStats.map((stat, index) => (
                  <Card key={index} className="p-4 sm:p-6 border border-card-border bg-gradient-to-br from-card to-secondary/20">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`p-2 sm:p-3 rounded-xl bg-secondary ${stat.color}`}>
                        <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-card-foreground mb-1 sm:mb-2">{stat.metric}</h3>
                        <p className="text-lg sm:text-2xl font-bold text-primary break-words">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Advertising Benefits */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-card-foreground">Advertising Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-3 sm:p-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Massive Reach</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Connect with over 1 lakh daily active users seeking opportunities</p>
                </div>
                
                <div className="text-center p-3 sm:p-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent to-accent-hover rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Targeted Audience</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Reach professionals actively looking for career opportunities</p>
                </div>
                
                <div className="text-center p-3 sm:p-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-success-foreground" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Multi-Channel</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Leverage our website, WhatsApp groups, and LinkedIn presence</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-secondary/30 to-accent/10 rounded-2xl p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-card-foreground text-center">Get Started Today</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Call Us */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Call us at:</h3>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm sm:text-base px-3 sm:px-4"
                  >
                    +91 98765 43210
                  </Button>
                </div>
                
                {/* Email Us */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Email us at:</h3>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground text-sm sm:text-base px-3 sm:px-4"
                  >
                    ads@oppavenue.com
                  </Button>
                </div>
                
                {/* Book Meeting */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Book a meeting</h3>
                  <Button 
                    className="bg-gradient-to-r from-success to-green-600 hover:from-green-600 hover:to-success text-success-foreground rounded-full px-4 sm:px-6 text-sm sm:text-base"
                  >
                    Schedule Call
                  </Button>
                </div>
              </div>
              
              <div className="text-center mt-6 sm:mt-8">
                <p className="text-base sm:text-lg text-muted-foreground px-2">
                  We will contact you within 24 hours to discuss your advertising needs
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Advertise;
