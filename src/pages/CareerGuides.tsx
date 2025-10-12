import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CareerGuides = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const guides = [
    {
      title: "Getting Started in Railway Operations",
      description: "A comprehensive guide for beginners entering the railway industry.",
      content: "Learn the fundamentals of railway operations, including safety protocols, operational procedures, and career pathways. This guide covers everything from entry-level positions to advanced roles in operations management."
    },
    {
      title: "Advanced Signal Engineering Career Path",
      description: "Navigate your career progression in signal engineering roles.",
      content: "Explore the technical requirements and career progression opportunities in signal engineering. From basic signaling principles to advanced automation systems, this guide maps out your journey to becoming a senior signal engineer."
    },
    {
      title: "Railway Project Management Guide",
      description: "Essential skills and certifications for railway project managers.",
      content: "Master the art of managing railway infrastructure projects. Learn about project planning, stakeholder management, risk assessment, and the key certifications that will advance your project management career in the railway sector."
    },
    {
      title: "Technical Specialist Career Development",
      description: "Building expertise in railway technical specializations.",
      content: "Discover how to develop deep technical expertise in areas like rolling stock maintenance, track engineering, or electrical systems. This guide provides insights into certification paths and professional development opportunities."
    },
    {
      title: "Leadership and Management in Railways",
      description: "Transitioning from technical roles to management positions.",
      content: "Learn how to make the transition from technical expert to effective leader. This guide covers essential leadership skills, management techniques, and strategies for building high-performing railway operations teams."
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
          <BookOpen className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Career Guides</h1>
            <p className="text-muted-foreground text-lg">Comprehensive guides to help you navigate your railway career path</p>
          </div>
        </div>

        <div className="space-y-6">
          {guides.map((guide, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-2xl">{guide.title}</CardTitle>
                <CardDescription>{guide.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{guide.content}</p>
                <button className="text-primary hover:underline font-medium">
                  Read Full Guide →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CareerGuides;
