import { BookOpen, FileText, Video, Download, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeaturedResources, useNewResources } from "@/hooks/useResources";
import SEO from "@/components/SEO";
import PageLayout from "@/components/PageLayout";

const Resources = () => {
  const { data: featuredResources, isLoading: loadingFeatured } = useFeaturedResources();
  const { data: newResources, isLoading: loadingNew } = useNewResources();

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
    <PageLayout prerenderReady={!loadingFeatured && !loadingNew}>
      <SEO 
        title="Career Resources"
        description="Explore our collection of helpful resources to advance your career in the railway industry. Career guides, resume templates, interview tips, and more."
        canonical="/resources"
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 text-foreground">Resources</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Explore our collection of helpful resources to advance your career in the railway industry.
        </p>

        {/* What's New Section */}
        {!loadingNew && newResources && newResources.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-lg md:text-2xl font-bold text-foreground">What's New</h2>
            </div>
            
            <div className="space-y-2">
              {newResources.map((resource) => (
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

        {/* Featured Resources */}
        {!loadingFeatured && featuredResources && featuredResources.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-lg md:text-2xl font-bold text-foreground">You should go through</h2>
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
    </PageLayout>
  );
};

export default Resources;
