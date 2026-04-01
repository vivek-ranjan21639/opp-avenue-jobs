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
import { Plus, Edit, Loader2, ArrowUp, ArrowDown, Trash2, Upload } from "lucide-react";
import ResourceEditor from "@/components/admin/ResourceEditor";

export default function AdminResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editRes, setEditRes] = useState<any | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParent, setNewCategoryParent] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [downloadableFile, setDownloadableFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newRes, setNewRes] = useState({
    title: "", description: "", parent_id: "",
    content_type: "text" as string, external_url: "", highlight_type: "general" as string,
    content_text: "",
  });
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
    setResources(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const categories = resources.filter((r) => r.type === "category");

  // Build category label with parent hierarchy
  const getCategoryLabel = (cat: any): string => {
    if (!cat.parent_id) return cat.title;
    const parent = categories.find(c => c.id === cat.parent_id);
    return parent ? `${getCategoryLabel(parent)} › ${cat.title}` : cat.title;
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    const { error } = await supabase.from("resources").insert({
      title: newCategoryName.trim(),
      type: "category" as const,
      content_type: "none" as const,
      parent_id: newCategoryParent || null,
    });
    setCreatingCategory(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category created" });
      setNewCategoryName("");
      setNewCategoryParent("");
      load();
    }
  };

  const createResource = async () => {
    // Auto-determine type: if parent_id is set → "resource", if content_type is "none" and no parent → could be category
    // But since we have explicit category creation, all resources created here are "resource" or "content"
    const resolvedType = newRes.content_type === "none" ? "resource" : "content";

    const { error } = await supabase.from("resources").insert({
      title: newRes.title,
      description: newRes.description || null,
      type: resolvedType as any,
      parent_id: newRes.parent_id || null,
      content_type: newRes.content_type as any,
      external_url: newRes.external_url || null,
      highlight_type: newRes.highlight_type as any,
      content_text: newRes.content_type === "text" ? newRes.content_text || null : null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resource created" });
      setShowCreate(false);
      setNewRes({ title: "", description: "", parent_id: "", content_type: "text", external_url: "", highlight_type: "general", content_text: "" });
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
        file_url: editRes.file_url || null,
        video_url: editRes.video_url || null,
        thumbnail_url: editRes.thumbnail_url || null,
        highlight_type: editRes.highlight_type,
        display_order: editRes.display_order,
        content_text: editRes.content_type === "text" ? editRes.content_text || null : null,
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

  const deleteResource = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resource deleted" });
      load();
    }
  };

  const uploadFile = async (resourceId: string, purpose: "downloadable" | "attachment") => {
    if (!downloadableFile) return;
    setUploadingFile(true);
    const fileName = `${resourceId}/${downloadableFile.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("resource-files")
      .upload(fileName, downloadableFile, { upsert: true });
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setUploadingFile(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("resource-files").getPublicUrl(fileName);
    await supabase.from("resources").update({ file_url: urlData.publicUrl }).eq("id", resourceId);
    setUploadingFile(false);
    setDownloadableFile(null);
    toast({ title: "File uploaded" });
    if (editRes?.id === resourceId) setEditRes({ ...editRes, file_url: urlData.publicUrl });
    load();
  };

  // Upload file during resource creation (before resource exists)
  const [createAttachmentFile, setCreateAttachmentFile] = useState<File | null>(null);
  const [uploadingCreateFile, setUploadingCreateFile] = useState(false);

  const createResourceWithFile = async () => {
    const resolvedType = newRes.content_type === "none" ? "resource" : "content";

    const { data: inserted, error } = await supabase.from("resources").insert({
      title: newRes.title,
      description: newRes.description || null,
      type: resolvedType as any,
      parent_id: newRes.parent_id || null,
      content_type: newRes.content_type as any,
      external_url: newRes.external_url || null,
      highlight_type: newRes.highlight_type as any,
      content_text: newRes.content_type === "text" ? newRes.content_text || null : null,
    }).select().single();

    if (error || !inserted) {
      toast({ title: "Error", description: error?.message || "Failed to create", variant: "destructive" });
      return;
    }

    // Upload file if present
    if (createAttachmentFile) {
      setUploadingCreateFile(true);
      const fileName = `${inserted.id}/${createAttachmentFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("resource-files")
        .upload(fileName, createAttachmentFile, { upsert: true });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("resource-files").getPublicUrl(fileName);
        await supabase.from("resources").update({ file_url: urlData.publicUrl }).eq("id", inserted.id);
      }
      setUploadingCreateFile(false);
    }

    toast({ title: "Resource created" });
    setShowCreate(false);
    setCreateAttachmentFile(null);
    setNewRes({ title: "", description: "", parent_id: "", content_type: "text", external_url: "", highlight_type: "general", content_text: "" });
    load();
  };

  const moveOrder = async (res: any, direction: "up" | "down") => {
    const newOrder = direction === "up" ? (res.display_order ?? 0) - 1 : (res.display_order ?? 0) + 1;
    await supabase.from("resources").update({ display_order: newOrder }).eq("id", res.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Resources</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Resource</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Resource</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={newRes.title} onChange={(e) => setNewRes({ ...newRes, title: e.target.value })} />
              <Textarea placeholder="Description" value={newRes.description} onChange={(e) => setNewRes({ ...newRes, description: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Content Type</label>
                  <select className="border rounded px-3 py-2 text-sm w-full" value={newRes.content_type} onChange={(e) => setNewRes({ ...newRes, content_type: e.target.value as any })}>
                    <option value="text">Text (Editor)</option>
                    <option value="file">File</option>
                    <option value="external">External Link</option>
                    <option value="video">Video</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Highlight</label>
                  <select className="border rounded px-3 py-2 text-sm w-full" value={newRes.highlight_type} onChange={(e) => setNewRes({ ...newRes, highlight_type: e.target.value })}>
                    <option value="general">General</option>
                    <option value="featured">You Should Go Through</option>
                    <option value="new">What's New</option>
                  </select>
                </div>
              </div>

              {/* Category selection + inline create */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Parent Category</label>
                <select className="border rounded px-3 py-2 text-sm w-full mb-2" value={newRes.parent_id} onChange={(e) => setNewRes({ ...newRes, parent_id: e.target.value })}>
                  <option value="">No Parent</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{getCategoryLabel(c)}</option>)}
                </select>
                <div className="flex gap-2">
                  <select className="border rounded px-3 py-2 text-sm w-28" value={newCategoryParent} onChange={(e) => setNewCategoryParent(e.target.value)}>
                    <option value="">Top-level</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <Input placeholder="New category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="text-sm flex-1" />
                  <Button size="sm" variant="outline" onClick={createCategory} disabled={creatingCategory || !newCategoryName.trim()}>
                    {creatingCategory ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <Input placeholder="External URL" value={newRes.external_url} onChange={(e) => setNewRes({ ...newRes, external_url: e.target.value })} />

              {/* File attachment from local computer */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Attach File (from computer)</label>
                <input type="file" onChange={(e) => setCreateAttachmentFile(e.target.files?.[0] || null)} className="text-sm" />
                {createAttachmentFile && <p className="text-xs text-muted-foreground mt-1">Selected: {createAttachmentFile.name}</p>}
              </div>

              {/* TipTap editor for text content */}
              {newRes.content_type === "text" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Content</label>
                  <ResourceEditor content={newRes.content_text} onChange={(html) => setNewRes({ ...newRes, content_text: html })} />
                </div>
              )}

              <Button onClick={createResourceWithFile} className="w-full" disabled={!newRes.title.trim() || uploadingCreateFile}>
                {uploadingCreateFile && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {resources.map((res) => (
            <Card key={res.id} className={res.type === "category" ? "border-l-4 border-l-primary" : ""}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold truncate">{res.title}</h3>
                    <Badge variant="secondary">{res.type}</Badge>
                    <Badge variant="outline">{res.content_type}</Badge>
                    {res.highlight_type === "featured" && <Badge className="bg-amber-500/10 text-amber-700 border-amber-300">You Should Go Through</Badge>}
                    {res.highlight_type === "new" && <Badge className="bg-green-500/10 text-green-700 border-green-300">What's New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {res.description || "No description"} · Order: {res.display_order ?? 0}
                    {res.file_url && " · 📎 File attached"}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveOrder(res, "up")}><ArrowUp className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveOrder(res, "down")}><ArrowDown className="h-3 w-3" /></Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => { setEditRes({ ...res }); setDownloadableFile(null); }}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Edit Resource</DialogTitle></DialogHeader>
                      {editRes && editRes.id === res.id && (
                        <div className="space-y-3">
                          <Input placeholder="Title" value={editRes.title} onChange={(e) => setEditRes({ ...editRes, title: e.target.value })} />
                          <Textarea placeholder="Description" value={editRes.description || ""} onChange={(e) => setEditRes({ ...editRes, description: e.target.value })} />
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                              <select className="border rounded px-3 py-2 text-sm w-full" value={editRes.type} onChange={(e) => setEditRes({ ...editRes, type: e.target.value })}>
                                <option value="category">Category</option>
                                <option value="resource">Resource</option>
                                <option value="content">Content</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Content Type</label>
                              <select className="border rounded px-3 py-2 text-sm w-full" value={editRes.content_type || "none"} onChange={(e) => setEditRes({ ...editRes, content_type: e.target.value })}>
                                <option value="none">None</option>
                                <option value="text">Text (Editor)</option>
                                <option value="file">File</option>
                                <option value="external">External</option>
                                <option value="video">Video</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Highlight</label>
                              <select className="border rounded px-3 py-2 text-sm w-full" value={editRes.highlight_type || "general"} onChange={(e) => setEditRes({ ...editRes, highlight_type: e.target.value })}>
                                <option value="general">General</option>
                                <option value="featured">You Should Go Through</option>
                                <option value="new">What's New</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Parent Category</label>
                              <select className="border rounded px-3 py-2 text-sm w-full" value={editRes.parent_id || ""} onChange={(e) => setEditRes({ ...editRes, parent_id: e.target.value })}>
                                <option value="">No Parent</option>
                                {categories.filter(c => c.id !== editRes.id).map((c) => <option key={c.id} value={c.id}>{getCategoryLabel(c)}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Display Order</label>
                              <Input type="number" value={editRes.display_order ?? 0} onChange={(e) => setEditRes({ ...editRes, display_order: Number(e.target.value) })} />
                            </div>
                          </div>

                          <Input placeholder="External URL" value={editRes.external_url || ""} onChange={(e) => setEditRes({ ...editRes, external_url: e.target.value })} />
                          <Input placeholder="Thumbnail URL" value={editRes.thumbnail_url || ""} onChange={(e) => setEditRes({ ...editRes, thumbnail_url: e.target.value })} />
                          <Input placeholder="Video URL" value={editRes.video_url || ""} onChange={(e) => setEditRes({ ...editRes, video_url: e.target.value })} />

                          {/* TipTap editor for text content */}
                          {editRes.content_type === "text" && (
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Content</label>
                              <ResourceEditor content={editRes.content_text || ""} onChange={(html) => setEditRes({ ...editRes, content_text: html })} />
                            </div>
                          )}

                          {/* File upload from local computer */}
                          <div className="border rounded-lg p-4 space-y-3">
                            <p className="text-sm font-medium">Attached File</p>
                            {editRes.file_url && (
                              <p className="text-xs text-muted-foreground break-all">Current: <a href={editRes.file_url} target="_blank" rel="noopener noreferrer" className="underline">{editRes.file_url}</a></p>
                            )}
                            <input type="file" onChange={(e) => setDownloadableFile(e.target.files?.[0] || null)} />
                            <Button size="sm" variant="outline" disabled={!downloadableFile || uploadingFile} onClick={() => uploadFile(editRes.id, "downloadable")}>
                              {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                              Upload File
                            </Button>
                          </div>

                          <div className="flex gap-2 justify-end">
                            <Button onClick={updateResource}>Save Changes</Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteResource(res.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
