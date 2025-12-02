import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import { Video, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResources } from "@/hooks/useResources";

const InterviewTips = () => {
  const navigate = useNavigate();
  const { data: tips, isLoading } = useResources('content');

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
          workMode: []
        }}
        onFiltersChange={() => {}}
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <Video className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Interview Tips</h1>
            <p className="text-muted-foreground text-lg">Video tutorials and articles to help you ace your railway job interviews</p>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading interview tips...</p>
          ) : tips && tips.length > 0 ? (
            tips.map((tip, index) => (
              <>
                <Card key={tip.id}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{tip.title}</CardTitle>
                    {tip.description && <CardDescription>{tip.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    {tip.content_text && (
                      <p className="text-muted-foreground mb-4">{tip.content_text}</p>
                    )}
                    {tip.video_url && (
                      <div className="mb-4">
                        <video 
                          controls 
                          className="w-full rounded-lg"
                          poster={tip.thumbnail_url || undefined}
                        >
                          <source src={tip.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    {tip.external_url && (
                      <a 
                        href={tip.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Learn More →
                      </a>
                    )}
                  </CardContent>
                </Card>
                {/* Ad after every 3rd tip */}
                {(index + 1) % 3 === 0 && index < tips.length - 1 && (
                  <div className="my-6">
                    <AdUnit size="rectangle" label={`In-content Ad ${Math.floor((index + 1) / 3)}`} />
                  </div>
                )}
              </>
            ))
          ) : (
            <p className="text-muted-foreground">No interview tips available yet.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InterviewTips;
