import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePrerenderReady } from '@/hooks/usePrerenderReady';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import { Download, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useResources } from "@/hooks/useResources";
import { format } from "date-fns";
import SEO from "@/components/SEO";

const IndustryReports = () => {
  const navigate = useNavigate();
  const { data: reports, isLoading } = useResources('resource');
  usePrerenderReady(!isLoading);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Industry Reports"
        description="Latest reports and insights about the railway industry trends. Download comprehensive industry analysis and market research."
        canonical="/resources/industry-reports"
      />
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
          workMode: []
        }}
        onFiltersChange={() => {}}
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <Download className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Industry Reports</h1>
            <p className="text-muted-foreground text-lg">Latest reports and insights about the railway industry trends</p>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading industry reports...</p>
          ) : reports && reports.length > 0 ? (
            reports.map((report, index) => (
              <>
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{report.title}</CardTitle>
                        {report.description && <CardDescription>{report.description}</CardDescription>}
                      </div>
                      <div className="flex flex-col gap-2 items-end ml-4">
                        <Badge variant="outline">
                          {format(new Date(report.created_at), 'MMM yyyy')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {report.content_text && (
                      <div className="mb-4">
                        <p className="text-muted-foreground">{report.content_text}</p>
                      </div>
                    )}
                    {report.file_url && (
                      <Button className="gap-2" asChild>
                        <a href={report.file_url} download>
                          <Download className="w-4 h-4" />
                          Download Report
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
                {/* Ad after every 3rd report */}
                {(index + 1) % 3 === 0 && index < reports.length - 1 && (
                  <div className="my-6">
                    <AdUnit size="rectangle" label={`In-content Ad ${Math.floor((index + 1) / 3)}`} />
                  </div>
                )}
              </>
            ))
          ) : (
            <p className="text-muted-foreground">No industry reports available yet.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IndustryReports;
