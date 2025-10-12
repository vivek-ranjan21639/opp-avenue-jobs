import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Download, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const IndustryReports = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const reports = [
    {
      title: "Railway Industry Trends 2024",
      description: "Comprehensive analysis of current trends and future predictions.",
      date: "March 2024",
      pages: 45,
      highlights: ["Digital transformation initiatives", "Sustainability goals", "Market growth projections", "Technology adoption rates"]
    },
    {
      title: "Salary Benchmarking Report",
      description: "Detailed salary information across various railway positions and regions.",
      date: "February 2024",
      pages: 32,
      highlights: ["Position-wise salary ranges", "Regional variations", "Benefits comparison", "Career progression impact"]
    },
    {
      title: "Skills Gap Analysis",
      description: "Understanding the current and future skills requirements in the industry.",
      date: "January 2024",
      pages: 28,
      highlights: ["Emerging skill requirements", "Training needs assessment", "Talent acquisition challenges", "Upskilling recommendations"]
    },
    {
      title: "Railway Safety Statistics & Insights",
      description: "Annual safety performance review and improvement strategies.",
      date: "December 2023",
      pages: 38,
      highlights: ["Incident analysis", "Safety improvement metrics", "Best practices review", "Regulatory compliance trends"]
    },
    {
      title: "Infrastructure Investment Report",
      description: "Analysis of railway infrastructure investments and development projects.",
      date: "November 2023",
      pages: 52,
      highlights: ["Investment trends", "Major projects overview", "Economic impact analysis", "Future development plans"]
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Resources
        </button>

        <div className="flex items-center gap-4 mb-6">
          <Download className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Industry Reports</h1>
            <p className="text-muted-foreground text-lg">Latest reports and insights about the railway industry trends</p>
          </div>
        </div>

        <div className="space-y-6">
          {reports.map((report, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end ml-4">
                    <Badge variant="outline">{report.date}</Badge>
                    <Badge variant="secondary">{report.pages} pages</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-3">Key Highlights:</h3>
                <ul className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
                  {report.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
                <Button className="gap-2">
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IndustryReports;
