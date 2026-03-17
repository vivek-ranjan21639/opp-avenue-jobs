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
import { Plus, Edit, Loader2, RefreshCw, Upload } from "lucide-react";

export default function AdminResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editRes, setEditRes] = useState<any | null>(null);
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [newRes, setNewRes] = useState({
    title: "", description: "", type: "resource" as const, parent_id: "",
    content_type: "none" as const, external_url: "", doc_file_path: "",
  });
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("resources")
      .select("*")
      .order("display_order", { ascending: true });
    setResources(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createResource = async () => {
    const { error } = await supabase.from("resources").insert({
      title: newRes.title,
      description: newRes.description || null,
      type: newRes.type,
      parent_id: newRes.parent_id || null,
      content_type: newRes.content_type,
      external_url: newRes.external_url || null,
      doc_file_path: newRes.doc_file_path || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resource created" });
      setShowCreate(false);
      setNewRes({ title: "", description: "", type: "resource", parent_id: "", content_type: "none", external_url: "", doc_file_path: "" });
      load();
    }
  };

  const updateResource = async () => {
    if (!editRes) return;
    const { error } = await supabase
      .from("resources")
      .update({
        title: editRes.title,
        description: editRes.description,
        type: editRes.type,
        parent_id: editRes.parent_id || null,
        content_type: editRes.content_type,
        external_url: editRes.external_url || null,
        doc_file_path: editRes.doc_file_path || null,
        file_url: editRes.file_url || null,
        video_url: editRes.video_url || null,
        thumbnail_url: editRes.thumbnail_url || null,
        highlight_type: editRes.highlight_type,
        display_order: editRes.display_order,
      })
      .eq("id", editRes.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resource updated" });
      setEditRes(null);
      load();
    }
  };

  const uploadAndConvert = async (resourceId: string) => {
    if (!docxFile) return;
    const fileName = docxFile.name;
    const { error: uploadErr } = await supabase.storage
      .from("resource-docs")
      .upload(fileName, docxFile, { upsert: true });
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      return;
    }
    // Update doc_file_path
    await supabase.from("resources").update({ doc_file_path: fileName }).eq("id", resourceId);

    setConverting(true);
    const { data, error } = await supabase.functions.invoke("convert-resource-doc", {
      body: { resource_id: resourceId, file_path: fileName },
    });
    setConverting(false);
    if (error) {
      toast({ title: "Conversion failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content converted", description: `${data?.html_length || 0} chars` });
      setDocxFile(null);
      load();
    }
  };

  const batchConvert = async () => {
    setConverting(true);
    const { data, error } = await supabase.functions.invoke("convert-resource-doc", {
      body: { mode: "batch" },
    });
    setConverting(false);
    if (error) {
      toast({ title: "Batch failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Batch done", description: `${data?.newly_processed || 0} resources converted` });
      load();
    }
  };

  const categories = resources.filter((r) => r.type === "category");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Resources</h1>
        <div className="flex gap-2">
          <Button onClick={batchConvert} variant="outline" disabled={converting}>
            {converting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Batch Convert
          </Button>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Resource</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Resource</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={newRes.title} onChange={(e) => setNewRes({ ...newRes, title: e.target.value })} />
                <Textarea placeholder="Description" value={newRes.description} onChange={(e) => setNewRes({ ...newRes, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="border rounded px-3 py-2 text-sm" value={newRes.type} onChange={(e) => setNewRes({ ...newRes, type: e.target.value as any })}>
                    <option value="category">Category</option>
                    <option value="resource">Resource</option>
                    <option value="content">Content</option>
                  </select>
                  <select className="border rounded px-3 py-2 text-sm" value={newRes.content_type} onChange={(e) => setNewRes({ ...newRes, content_type: e.target.value as any })}>
                    <option value="none">None</option>
                    <option value="text">Text</option>
                    <option value="file">File</option>
                    <option value="external">External</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <select className="border rounded px-3 py-2 text-sm w-full" value={newRes.parent_id} onChange={(e) => setNewRes({ ...newRes, parent_id: e.target.value })}>
                  <option value="">No Parent</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <Input placeholder="External URL" value={newRes.external_url} onChange={(e) => setNewRes({ ...newRes, external_url: e.target.value })} />
                <Button onClick={createResource} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {resources.map((res) => (
            <Card key={res.id} className={res.type === "category" ? "border-l-4 border-l-primary" : ""}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{res.title}</h3>
                    <Badge variant="secondary">{res.type}</Badge>
                    <Badge variant="outline">{res.content_type}</Badge>
                    {res.highlight_type !== "general" && <Badge>{res.highlight_type}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {res.description || "No description"} · Order: {res.display_order}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => { setEditRes({ ...res }); setDocxFile(null); }}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit Resource</DialogTitle></DialogHeader>
                    {editRes && editRes.id === res.id && (
                      <div className="space-y-3">
                        <Input placeholder="Title" value={editRes.title} onChange={(e) => setEditRes({ ...editRes, title: e.target.value })} />
                        <Textarea placeholder="Description" value={editRes.description || ""} onChange={(e) => setEditRes({ ...editRes, description: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                          <select className="border rounded px-3 py-2 text-sm" value={editRes.type} onChange={(e) => setEditRes({ ...editRes, type: e.target.value })}>
                            <option value="category">Category</option>
                            <option value="resource">Resource</option>
                            <option value="content">Content</option>
                          </select>
                          <select className="border rounded px-3 py-2 text-sm" value={editRes.content_type || "none"} onChange={(e) => setEditRes({ ...editRes, content_type: e.target.value })}>
                            <option value="none">None</option>
                            <option value="text">Text</option>
                            <option value="file">File</option>
                            <option value="external">External</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select className="border rounded px-3 py-2 text-sm" value={editRes.highlight_type || "general"} onChange={(e) => setEditRes({ ...editRes, highlight_type: e.target.value })}>
                            <option value="general">General</option>
                            <option value="featured">Featured</option>
                            <option value="new">New</option>
                          </select>
                          <Input type="number" placeholder="Display order" value={editRes.display_order ?? 0} onChange={(e) => setEditRes({ ...editRes, display_order: Number(e.target.value) })} />
                        </div>
                        <Input placeholder="External URL" value={editRes.external_url || ""} onChange={(e) => setEditRes({ ...editRes, external_url: e.target.value })} />
                        <Input placeholder="Thumbnail URL" value={editRes.thumbnail_url || ""} onChange={(e) => setEditRes({ ...editRes, thumbnail_url: e.target.value })} />
                        <Input placeholder="File URL" value={editRes.file_url || ""} onChange={(e) => setEditRes({ ...editRes, file_url: e.target.value })} />
                        <Input placeholder="Video URL" value={editRes.video_url || ""} onChange={(e) => setEditRes({ ...editRes, video_url: e.target.value })} />

                        <div className="border rounded-lg p-4 space-y-3">
                          <p className="text-sm font-medium">Upload DOCX Content</p>
                          <input type="file" accept=".docx" onChange={(e) => setDocxFile(e.target.files?.[0] || null)} />
                          <Button size="sm" variant="outline" disabled={!docxFile || converting} onClick={() => uploadAndConvert(editRes.id)}>
                            {converting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                            Upload & Convert
                          </Button>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button onClick={updateResource}>Save Changes</Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
