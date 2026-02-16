import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResources } from "@/hooks/useResources";
import AdUnit from "@/components/AdUnit";
import SEO from "@/components/SEO";
import PageLayout from "@/components/PageLayout";

const CareerGuides = () => {
  const { data: guides, isLoading } = useResources('category');

  return (
    <PageLayout prerenderReady={!isLoading}>
      <SEO 
        title="Career Guides"
        description="Comprehensive guides to help you navigate your railway career path. Expert advice on career development and industry insights."
        canonical="/resources/career-guides"
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <BookOpen className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Career Guides</h1>
            <p className="text-muted-foreground text-lg">Comprehensive guides to help you navigate your railway career path</p>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading career guides...</p>
          ) : guides && guides.length > 0 ? (
            guides.map((guide, index) => (
              <>
                <Card key={guide.id}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{guide.title}</CardTitle>
                    {guide.description && <CardDescription>{guide.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    {guide.content_text && (
                      <p className="text-muted-foreground mb-4">{guide.content_text}</p>
                    )}
                    {guide.external_url && (
                      <a 
                        href={guide.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Read Full Guide →
                      </a>
                    )}
                  </CardContent>
                </Card>
                {(index + 1) % 3 === 0 && index < guides.length - 1 && (
                  <div className="my-6">
                    <AdUnit size="rectangle" label={`In-content Ad ${Math.floor((index + 1) / 3)}`} />
                  </div>
                )}
              </>
            ))
          ) : (
            <p className="text-muted-foreground">No career guides available yet.</p>
          )}
        </div>
      </main>
    </PageLayout>
  );
};

export default CareerGuides;
