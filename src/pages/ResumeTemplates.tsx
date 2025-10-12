import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, ArrowLeft, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ResumeTemplates = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const templates = [
    {
      title: "Railway Engineer Resume Template",
      description: "Professional template tailored for engineering positions.",
      features: ["Technical skills section", "Project highlights", "Certifications showcase", "ATS-friendly format"]
    },
    {
      title: "Operations Manager CV Template",
      description: "Optimized format for operations management roles.",
      features: ["Leadership experience focus", "Operational metrics", "Team management highlights", "Process improvement achievements"]
    },
    {
      title: "Technical Specialist Resume",
      description: "Highlight your technical expertise with this specialized template.",
      features: ["Technical competencies matrix", "Equipment proficiency", "Safety certifications", "Problem-solving examples"]
    },
    {
      title: "Entry-Level Railway Position Template",
      description: "Perfect for graduates and career starters in the railway industry.",
      features: ["Education emphasis", "Internship experience", "Transferable skills", "Career objective statement"]
    },
    {
      title: "Senior Management Executive CV",
      description: "Executive-level template for senior railway management positions.",
      features: ["Strategic achievements", "Budget management", "Stakeholder relations", "Industry recognition"]
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
          <FileText className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Resume Templates</h1>
            <p className="text-muted-foreground text-lg">Professional resume templates tailored for railway industry positions</p>
          </div>
        </div>

        <div className="space-y-6">
          {templates.map((template, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-2xl">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-3">Key Features:</h3>
                <ul className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
                  {template.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <Button className="gap-2">
                  <Download className="w-4 h-4" />
                  Download Template
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

export default ResumeTemplates;
