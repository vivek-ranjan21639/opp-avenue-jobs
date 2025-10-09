import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header, { FilterState } from '@/components/Header';
import AdvertisePage from '@/components/AdvertisePage';
import Footer from '@/components/Footer';

const Contact = () => {
  const navigate = useNavigate();
  const [showAdvertise, setShowAdvertise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    location: [],
    jobType: [],
    experience: [],
    salaryRange: [],
    sector: [],
    companies: []
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

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <Button
          onClick={() => navigate('/about')}
          variant="outline"
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to About
        </Button>

        <div className="space-y-12">
          <section className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help. Reach out to us through any of the channels below.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>Fill out the form and we'll get back to you soon</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Input placeholder="Your Name" className="w-full" />
                  </div>
                  <div>
                    <Input type="email" placeholder="Your Email" className="w-full" />
                  </div>
                  <div>
                    <Input placeholder="Subject" className="w-full" />
                  </div>
                  <div>
                    <Textarea placeholder="Your Message" className="w-full min-h-[150px]" />
                  </div>
                  <Button className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Email Us</CardTitle>
                  <CardDescription>Send us an email anytime</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="mailto:contact@oppavenue.com" className="text-primary hover:underline">
                    contact@oppavenue.com
                  </a>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Call Us</CardTitle>
                  <CardDescription>Mon-Fri from 9am to 6pm</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="tel:+1234567890" className="text-primary hover:underline">
                    +1 (234) 567-890
                  </a>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <CardTitle>Visit Us</CardTitle>
                  <CardDescription>Come say hello at our office</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    123 Business Street<br />
                    Suite 100<br />
                    New York, NY 10001
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <AdvertisePage isOpen={showAdvertise} onClose={() => setShowAdvertise(false)} />
    </div>
  );
};

export default Contact;
