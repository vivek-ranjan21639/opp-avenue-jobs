import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, FileText, Video, Download } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Resources = () => {
  const navigate = useNavigate();

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
          sector: [],
          companies: [],
        }}
        onFiltersChange={() => {}}
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
        <h1 className="text-4xl font-bold mb-6 text-foreground">Resources</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Explore our collection of helpful resources to advance your career in the railway industry.
        </p>

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
