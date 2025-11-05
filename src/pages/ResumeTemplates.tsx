import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, ArrowLeft, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResources } from "@/hooks/useResources";

const ResumeTemplates = () => {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useResources('content');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Resources
        </button>

        <div className="flex items-center gap-4 mb-6">
          <FileText className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Resume Templates</h1>
            <p className="text-muted-foreground text-lg">Professional resume templates tailored for railway industry positions</p>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading resume templates...</p>
          ) : templates && templates.length > 0 ? (
            templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-2xl">{template.title}</CardTitle>
                  {template.description && <CardDescription>{template.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {template.content_text && (
                    <div className="mb-4">
                      <p className="text-muted-foreground">{template.content_text}</p>
                    </div>
                  )}
                  {template.file_url && (
                    <Button className="gap-2" asChild>
                      <a href={template.file_url} download>
                        <Download className="w-4 h-4" />
                        Download Template
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">No resume templates available yet.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResumeTemplates;
