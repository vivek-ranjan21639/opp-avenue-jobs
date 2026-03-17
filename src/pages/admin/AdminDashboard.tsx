import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, BookOpen, FolderOpen, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ jobs: 0, staging: 0, blogs: 0, resources: 0 });

  useEffect(() => {
    const load = async () => {
      const [jobsRes, stagingRes, blogsRes, resourcesRes] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("staging_jobs").select("id", { count: "exact", head: true }).eq("review_status", "pending_review"),
        supabase.from("blogs").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        jobs: jobsRes.count ?? 0,
        staging: stagingRes.count ?? 0,
        blogs: blogsRes.count ?? 0,
        resources: resourcesRes.count ?? 0,
      });
    };
    load();
  }, []);

  const cards = [
    { title: "Live Jobs", value: stats.jobs, icon: Briefcase, color: "text-primary" },
    { title: "Pending Review", value: stats.staging, icon: Clock, color: "text-accent" },
    { title: "Blogs", value: stats.blogs, icon: BookOpen, color: "text-success" },
    { title: "Resources", value: stats.resources, icon: FolderOpen, color: "text-muted-foreground" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
