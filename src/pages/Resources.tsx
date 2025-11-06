import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, FileText, Video, Download, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeaturedResources } from "@/hooks/useResources";
import { Badge } from "@/components/ui/badge";

const Resources = () => {
  const navigate = useNavigate();
  const { data: featuredResources, isLoading: loadingFeatured } = useFeaturedResources();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const resourceCategories = [
    {
      id: "career-guides",
      title: "Career Guides",
      description: "Comprehensive guides to help you navigate your railway career path",
      icon: BookOpen,
      path: "/resources/career-guides"
    },
    {
      id: "resume-templates",
      title: "Resume Templates",
      description: "Professional resume templates tailored for railway industry positions",
      icon: FileText,
      path: "/resources/resume-templates"
    },
    {
      id: "interview-tips",
      title: "Interview Tips",
      description: "Video tutorials and articles to help you ace your railway job interviews",
      icon: Video,
      path: "/resources/interview-tips"
    },
    {
      id: "industry-reports",
      title: "Industry Reports",
      description: "Latest reports and insights about the railway industry trends",
      icon: Download,
      path: "/resources/industry-reports"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAdvertiseClick={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        activeFilters={{
          location: [],
          jobType: [],
          experience: [],
          salaryRange: [],
          domain: [],
          skills: [],
          companies: [],
        }}
        onFiltersChange={() => {}}
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
        <h1 className="text-4xl font-bold mb-6 text-foreground">Resources</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Explore our collection of helpful resources to advance your career in the railway industry.
        </p>

        {/* Featured Resources - "You might like" */}
        {!loadingFeatured && featuredResources && featuredResources.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">You should go through</h2>
            </div>
            
            <div className="space-y-2">
              {featuredResources.map((resource) => (
                <div key={resource.id} className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                  <a
                    href={resource.external_url || resource.file_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-base font-medium"
                  >
                    {resource.title}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {resourceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary"
                onClick={() => window.open(category.path, '_blank')}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Icon className="w-10 h-10 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">{category.title}</CardTitle>
                      <CardDescription className="mt-2">{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
