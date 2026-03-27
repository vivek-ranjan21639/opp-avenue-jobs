import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Loader2 } from "lucide-react";
import BlogEditor from "@/components/admin/BlogEditor";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editBlog, setEditBlog] = useState<any | null>(null);
  const [newBlog, setNewBlog] = useState({ title: "", slug: "", summary: "", status: "draft", content: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createBlog = async () => {
    setSaving(true);
    const { error } = await supabase.from("blogs").insert({
      title: newBlog.title,
      slug: newBlog.slug,
      summary: newBlog.summary,
      status: newBlog.status as any,
      content: newBlog.content || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Blog created" });
      setShowCreate(false);
      setNewBlog({ title: "", slug: "", summary: "", status: "draft", content: "" });
      load();
    }
  };

  const updateBlog = async () => {
    if (!editBlog) return;
    setSaving(true);
    const { error } = await supabase
      .from("blogs")
      .update({
        title: editBlog.title,
        slug: editBlog.slug,
        summary: editBlog.summary,
        status: editBlog.status,
        featured: editBlog.featured,
        top_blog: editBlog.top_blog,
        thumbnail_url: editBlog.thumbnail_url,
        content: editBlog.content,
      })
      .eq("id", editBlog.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Blog updated" });
      setEditBlog(null);
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Blog</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Blog</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })} />
              <Input placeholder="slug-url" value={newBlog.slug} onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })} />
              <Textarea placeholder="Summary" value={newBlog.summary} onChange={(e) => setNewBlog({ ...newBlog, summary: e.target.value })} />
              <BlogEditor content={newBlog.content} onChange={(html) => setNewBlog({ ...newBlog, content: html })} />
              <Button onClick={createBlog} className="w-full" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <Card key={blog.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{blog.title}</h3>
                    <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status}</Badge>
                    {blog.featured && <Badge variant="outline">Featured</Badge>}
                    {blog.top_blog && <Badge variant="outline">Top</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    /{blog.slug} · {blog.read_time_minutes || "?"}m read · {blog.content ? `${blog.content.length} chars` : "No content"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditBlog({ ...blog })}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Edit Blog</DialogTitle></DialogHeader>
                      {editBlog && editBlog.id === blog.id && (
                        <div className="space-y-3">
                          <Input placeholder="Title" value={editBlog.title} onChange={(e) => setEditBlog({ ...editBlog, title: e.target.value })} />
                          <Input placeholder="Slug" value={editBlog.slug} onChange={(e) => setEditBlog({ ...editBlog, slug: e.target.value })} />
                          <Textarea placeholder="Summary" value={editBlog.summary || ""} onChange={(e) => setEditBlog({ ...editBlog, summary: e.target.value })} />
                          <Input placeholder="Thumbnail URL" value={editBlog.thumbnail_url || ""} onChange={(e) => setEditBlog({ ...editBlog, thumbnail_url: e.target.value })} />
                          <div className="grid grid-cols-3 gap-3">
                            <select className="border rounded px-3 py-2 text-sm" value={editBlog.status} onChange={(e) => setEditBlog({ ...editBlog, status: e.target.value })}>
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                              <option value="archived">Archived</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={editBlog.featured || false} onChange={(e) => setEditBlog({ ...editBlog, featured: e.target.checked })} /> Featured
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={editBlog.top_blog || false} onChange={(e) => setEditBlog({ ...editBlog, top_blog: e.target.checked })} /> Top Blog
                            </label>
                          </div>

                          <BlogEditor
                            content={editBlog.content || ""}
                            onChange={(html) => setEditBlog({ ...editBlog, content: html })}
                          />

                          <div className="flex gap-2 justify-end">
                            <Button onClick={updateBlog} disabled={saving}>
                              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Save Changes
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
