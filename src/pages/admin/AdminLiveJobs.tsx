import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export default function AdminLiveJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select("id, title, human_id, created_at, deadline, job_type, work_mode, companies(name)")
      .order("created_at", { ascending: false })
      .limit(100);
    setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteJob = async (id: string) => {
    await supabase.from("jobs").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "Job soft-deleted" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Live Jobs</h1>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">{job.human_id}</span>
                    <h3 className="font-semibold">{job.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.companies?.name} · {job.job_type} · {job.work_mode}
                    {job.deadline && ` · Deadline: ${job.deadline}`}
                  </p>
                </div>
                <Button size="sm" variant="destructive" onClick={() => deleteJob(job.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
