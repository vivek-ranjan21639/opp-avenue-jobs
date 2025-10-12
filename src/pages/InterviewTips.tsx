import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Video, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const InterviewTips = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tips = [
    {
      title: "Common Railway Interview Questions",
      description: "Prepare for the most frequently asked questions in railway interviews.",
      content: "Master the essential interview questions about safety protocols, technical knowledge, and situational responses. Includes sample answers and tips for articulating your experience effectively.",
      topics: ["Safety commitment questions", "Technical knowledge assessment", "Behavioral scenarios", "Company-specific inquiries"]
    },
    {
      title: "Technical Assessment Preparation",
      description: "Tips for succeeding in technical assessments and practical tests.",
      content: "Get ready for hands-on technical evaluations. Learn what to expect in practical tests, how to demonstrate your technical competence, and strategies for staying calm under pressure.",
      topics: ["Equipment operation tests", "Safety procedure demonstrations", "Problem-solving exercises", "Technical drawing interpretation"]
    },
    {
      title: "Behavioral Interview Strategies",
      description: "Master the STAR method for behavioral interview questions.",
      content: "Learn how to structure your responses using the STAR (Situation, Task, Action, Result) method. Prepare compelling stories that showcase your skills and experience.",
      topics: ["STAR method framework", "Conflict resolution examples", "Leadership demonstrations", "Team collaboration stories"]
    },
    {
      title: "First Impression and Professional Presence",
      description: "Make a strong first impression in your railway industry interview.",
      content: "Understand the importance of professional appearance, punctuality, and communication in the railway sector. Learn industry-specific etiquette and how to present yourself confidently.",
      topics: ["Professional attire guidelines", "Body language tips", "Communication skills", "Following up after interviews"]
    },
    {
      title: "Salary Negotiation Techniques",
      description: "Navigate salary discussions with confidence and professionalism.",
      content: "Learn when and how to discuss compensation, how to research industry standards, and strategies for negotiating a fair package that reflects your value.",
      topics: ["Market research strategies", "Timing your negotiation", "Total compensation packages", "Professional negotiation tactics"]
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
          <Video className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Interview Tips</h1>
            <p className="text-muted-foreground text-lg">Video tutorials and articles to help you ace your railway job interviews</p>
          </div>
        </div>

        <div className="space-y-6">
          {tips.map((tip, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-2xl">{tip.title}</CardTitle>
                <CardDescription>{tip.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{tip.content}</p>
                <h3 className="font-semibold mb-3">Key Topics Covered:</h3>
                <ul className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
                  {tip.topics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
                <button className="text-primary hover:underline font-medium">
                  Learn More →
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

export default InterviewTips;
