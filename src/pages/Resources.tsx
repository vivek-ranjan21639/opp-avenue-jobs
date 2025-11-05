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
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">You might like</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredResources.map((resource) => (
                <Card 
                  key={resource.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border hover:border-primary"
                  onClick={() => {
                    if (resource.external_url) {
                      window.open(resource.external_url, '_blank');
                    } else if (resource.file_url) {
                      window.open(resource.file_url, '_blank');
                    }
                  }}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base mb-1 line-clamp-2">{resource.title}</CardTitle>
                        {resource.description && (
                          <CardDescription className="text-xs line-clamp-2">{resource.description}</CardDescription>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {resource.type === 'category' ? 'Guide' : resource.type}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
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
                onClick={() => navigate(category.path)}
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
