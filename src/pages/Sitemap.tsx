import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Info, Mail, FileText, Shield, Cookie, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header, { FilterState } from '@/components/Header';
import AdvertisePage from '@/components/AdvertisePage';
import Footer from '@/components/Footer';

const Sitemap = () => {
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

  const siteStructure = [
    {
      category: 'Main Pages',
      icon: Home,
      pages: [
        { name: 'Home', path: '/', description: 'Browse job listings and opportunities' },
        { name: 'About', path: '/about', description: 'Learn more about Opp Avenue' },
        { name: 'Resources', path: '/resources', description: 'Helpful resources for your career' },
        { name: 'Blogs', path: '/blogs', description: 'Latest news and insights' },
        { name: 'Advertise', path: '/advertise', description: 'Advertise your job openings with us' },
      ]
    },
    {
      category: 'Legal & Policies',
      icon: Shield,
      pages: [
        { name: 'Privacy Policy', path: '/privacy-policy', description: 'How we handle your data' },
        { name: 'Terms & Conditions', path: '/terms', description: 'Terms of service and usage' },
        { name: 'Disclaimer', path: '/disclaimer', description: 'Important disclaimers and notices' },
        { name: 'Cookie Policy', path: '/cookie-policy', description: 'How we use cookies' },
      ]
    },
    {
      category: 'Contact & Support',
      icon: Mail,
      pages: [
        { name: 'Contact Us', path: '/contact', description: 'Get in touch with our team' },
        { name: 'Sitemap', path: '/sitemap', description: 'Navigate our website structure' },
      ]
    }
  ];

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
              Sitemap
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Navigate through all pages and sections of Opp Avenue
            </p>
          </section>

          <div className="space-y-8">
            {siteStructure.map((section, index) => (
              <Card key={index} className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{section.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {section.pages.map((page, pageIndex) => (
                      <div
                        key={pageIndex}
                        onClick={() => navigate(page.path)}
                        className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                      >
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {page.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {page.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <AdvertisePage isOpen={showAdvertise} onClose={() => setShowAdvertise(false)} />
    </div>
  );
};

export default Sitemap;
