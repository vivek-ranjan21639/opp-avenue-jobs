import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, FileText, Video, Download, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Resources = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const resourcesData = {
    careerGuides: [
      { title: "Getting Started in Railway Operations", description: "A comprehensive guide for beginners entering the railway industry." },
      { title: "Advanced Signal Engineering Career Path", description: "Navigate your career progression in signal engineering roles." },
      { title: "Railway Project Management Guide", description: "Essential skills and certifications for railway project managers." },
    ],
    resumeTemplates: [
      { title: "Railway Engineer Resume Template", description: "Professional template tailored for engineering positions." },
      { title: "Operations Manager CV Template", description: "Optimized format for operations management roles." },
      { title: "Technical Specialist Resume", description: "Highlight your technical expertise with this specialized template." },
    ],
    interviewTips: [
      { title: "Common Railway Interview Questions", description: "Prepare for the most frequently asked questions in railway interviews." },
      { title: "Technical Assessment Preparation", description: "Tips for succeeding in technical assessments and practical tests." },
      { title: "Behavioral Interview Strategies", description: "Master the STAR method for behavioral interview questions." },
    ],
    industryReports: [
      { title: "Railway Industry Trends 2024", description: "Comprehensive analysis of current trends and future predictions." },
      { title: "Salary Benchmarking Report", description: "Detailed salary information across various railway positions and regions." },
      { title: "Skills Gap Analysis", description: "Understanding the current and future skills requirements in the industry." },
    ],
  };

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
      
      <main className="max-w-[1008px] mx-auto px-4 pt-4 pb-12">
        <h1 className="text-4xl font-bold mb-6 text-foreground">Resources</h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Explore our collection of helpful resources to advance your career in the railway industry.
        </p>

        <div className="space-y-6">
          {/* Career Guides */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => toggleSection('careerGuides')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Career Guides</CardTitle>
                    <CardDescription>Comprehensive guides to help you navigate your railway career path</CardDescription>
                  </div>
                </div>
                <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform ${expandedSection === 'careerGuides' ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSection === 'careerGuides' && (
              <CardContent>
                <div className="space-y-4">
                  {resourcesData.careerGuides.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                      <Link to="#" className="text-primary hover:underline text-sm mt-2 inline-block">
                        Read More →
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Resume Templates */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => toggleSection('resumeTemplates')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Resume Templates</CardTitle>
                    <CardDescription>Professional resume templates tailored for railway industry positions</CardDescription>
                  </div>
                </div>
                <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform ${expandedSection === 'resumeTemplates' ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSection === 'resumeTemplates' && (
              <CardContent>
                <div className="space-y-4">
                  {resourcesData.resumeTemplates.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                      <Link to="#" className="text-primary hover:underline text-sm mt-2 inline-block">
                        Download Template →
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Interview Tips */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => toggleSection('interviewTips')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Video className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Interview Tips</CardTitle>
                    <CardDescription>Video tutorials and articles to help you ace your railway job interviews</CardDescription>
                  </div>
                </div>
                <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform ${expandedSection === 'interviewTips' ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSection === 'interviewTips' && (
              <CardContent>
                <div className="space-y-4">
                  {resourcesData.interviewTips.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                      <Link to="#" className="text-primary hover:underline text-sm mt-2 inline-block">
                        Learn More →
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Industry Reports */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => toggleSection('industryReports')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Download className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Industry Reports</CardTitle>
                    <CardDescription>Latest reports and insights about the railway industry trends</CardDescription>
                  </div>
                </div>
                <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform ${expandedSection === 'industryReports' ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSection === 'industryReports' && (
              <CardContent>
                <div className="space-y-4">
                  {resourcesData.industryReports.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                      <Link to="#" className="text-primary hover:underline text-sm mt-2 inline-block">
                        Download Report →
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
