import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdUnit from "@/components/AdUnit";
import { BookOpen, FileText, Video, Download } from "lucide-react";

const Resources = () => {
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
        
        {/* Top Ad Space */}
        <div className="mb-8">
          <AdUnit size="banner" label="Top Banner Ad" />
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-8">
            Explore our collection of helpful resources to advance your career in the railway industry.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <BookOpen className="w-8 h-8 text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-3">Career Guides</h2>
              <p className="text-muted-foreground mb-4">
                Comprehensive guides to help you navigate your railway career path.
              </p>
              <Link to="#" className="text-primary hover:underline">
                Explore Guides →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <FileText className="w-8 h-8 text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-3">Resume Templates</h2>
              <p className="text-muted-foreground mb-4">
                Professional resume templates tailored for railway industry positions.
              </p>
              <Link to="#" className="text-primary hover:underline">
                Download Templates →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <Video className="w-8 h-8 text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-3">Interview Tips</h2>
              <p className="text-muted-foreground mb-4">
                Video tutorials and articles to help you ace your railway job interviews.
              </p>
              <Link to="#" className="text-primary hover:underline">
                Watch Videos →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <Download className="w-8 h-8 text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-3">Industry Reports</h2>
              <p className="text-muted-foreground mb-4">
                Latest reports and insights about the railway industry trends.
              </p>
              <Link to="#" className="text-primary hover:underline">
                Download Reports →
              </Link>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Featured Resources</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• Railway Industry Salary Guide 2024</li>
              <li>• Essential Skills for Railway Professionals</li>
              <li>• Understanding Railway Safety Regulations</li>
              <li>• Career Progression in Railway Operations</li>
              <li>• Technical Certifications Guide</li>
            </ul>
          </section>
          
          {/* Bottom Ad Space */}
          <div className="mt-8">
            <AdUnit size="rectangle" label="Bottom Rectangle Ad" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
