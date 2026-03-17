import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Globe, Play, Loader2 } from "lucide-react";

export default function AdminScrapedJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("scraped_jobs")
      .select("*, companies(name)")
      .order("scraped_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runScraper = async () => {
    setScraping(true);
    const { data, error } = await supabase.functions.invoke("scrape-careers");
    setScraping(false);
    if (error) {
      toast({ title: "Scraping failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Scraping complete", description: `${data?.companies_processed || 0} companies processed` });
      load();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("scraped_jobs").update({ status }).eq("id", id);
    toast({ title: `Job ${status}` });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Scraped Jobs</h1>
        <div className="flex gap-2">
          <Button onClick={runScraper} disabled={scraping}>
            {scraping ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Globe className="h-4 w-4 mr-1" />}
            Run Scraper
          </Button>
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-muted-foreground">No scraped jobs found. Run the scraper first.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <Badge variant={job.status === "approved" ? "default" : job.status === "rejected" ? "destructive" : "secondary"}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.companies?.name || "Unknown"} ·{" "}
                    <a href={job.source_url} target="_blank" rel="noopener" className="text-primary underline">
                      Source
                    </a>
                  </p>
                </div>
                {job.status === "pending" && (
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" onClick={() => updateStatus(job.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(job.id, "rejected")}>Reject</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
