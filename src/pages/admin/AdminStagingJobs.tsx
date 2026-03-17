import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminStagingJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [editJob, setEditJob] = useState<any | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("staging_jobs")
      .select("*")
      .order("created_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    // First set status to approved
    const { error: updateErr } = await supabase
      .from("staging_jobs")
      .update({ review_status: "approved" })
      .eq("id", id);

    if (updateErr) {
      toast({ title: "Error", description: updateErr.message, variant: "destructive" });
      return;
    }

    setApproving(id);
    const { data, error } = await supabase.functions.invoke("approve-staging-job", {
      body: { staging_job_id: id },
    });
    setApproving(null);

    if (error) {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job approved & published", description: `Job ID: ${data?.job_id}` });
      load();
    }
  };

  const reject = async (id: string) => {
    await supabase.from("staging_jobs").update({ review_status: "rejected" }).eq("id", id);
    toast({ title: "Job rejected" });
    load();
  };

  const saveEdit = async () => {
    if (!editJob) return;
    const { error } = await supabase
      .from("staging_jobs")
      .update({
        title: editJob.title,
        description: editJob.description,
        parsed_company_name: editJob.parsed_company_name,
        job_type: editJob.job_type,
        work_mode: editJob.work_mode,
        salary_min: editJob.salary_min,
        salary_max: editJob.salary_max,
        currency: editJob.currency,
        deadline: editJob.deadline,
        application_link: editJob.application_link,
        application_email: editJob.application_email,
      })
      .eq("id", editJob.id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      setEditJob(null);
      load();
    }
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Staging Jobs</h1>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-muted-foreground">No staging jobs found.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <Badge variant={statusColor(job.review_status)}>{job.review_status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.parsed_company_name || "Unknown company"} · {job.job_type || "N/A"} · {job.work_mode || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditJob({ ...job })}>
                        <Eye className="h-4 w-4 mr-1" /> View/Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Staging Job</DialogTitle>
                      </DialogHeader>
                      {editJob && editJob.id === job.id && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Title</label>
                            <Input value={editJob.title} onChange={(e) => setEditJob({ ...editJob, title: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Company</label>
                            <Input value={editJob.parsed_company_name || ""} onChange={(e) => setEditJob({ ...editJob, parsed_company_name: e.target.value })} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">Job Type</label>
                              <Input value={editJob.job_type || ""} onChange={(e) => setEditJob({ ...editJob, job_type: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Work Mode</label>
                              <Input value={editJob.work_mode || ""} onChange={(e) => setEditJob({ ...editJob, work_mode: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-sm font-medium">Salary Min</label>
                              <Input type="number" value={editJob.salary_min || ""} onChange={(e) => setEditJob({ ...editJob, salary_min: e.target.value ? Number(e.target.value) : null })} />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Salary Max</label>
                              <Input type="number" value={editJob.salary_max || ""} onChange={(e) => setEditJob({ ...editJob, salary_max: e.target.value ? Number(e.target.value) : null })} />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Currency</label>
                              <Input value={editJob.currency || ""} onChange={(e) => setEditJob({ ...editJob, currency: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">Deadline</label>
                              <Input type="date" value={editJob.deadline || ""} onChange={(e) => setEditJob({ ...editJob, deadline: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Application Link</label>
                              <Input value={editJob.application_link || ""} onChange={(e) => setEditJob({ ...editJob, application_link: e.target.value })} />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea rows={5} value={editJob.description || ""} onChange={(e) => setEditJob({ ...editJob, description: e.target.value })} />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button onClick={saveEdit}>Save Changes</Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  {job.review_status === "pending_review" && (
                    <>
                      <Button size="sm" onClick={() => approve(job.id)} disabled={approving === job.id}>
                        {approving === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => reject(job.id)}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
