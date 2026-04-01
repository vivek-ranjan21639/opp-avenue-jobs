import { useEffect, useState, useCallback } from "react";
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
import { Plus, Edit, Loader2, X, UserPlus } from "lucide-react";
import BlogEditor from "@/components/admin/BlogEditor";

interface Author {
  id: string;
  name: string;
  profile_url: string | null;
  bio: string | null;
  profile_pic_url: string | null;
}

interface Tag {
  id: string;
  name: string;
}

interface BlogForm {
  title: string;
  slug: string;
  summary: string;
  status: string;
  content: string;
  author_id: string;
  thumbnail_url: string;
  featured: boolean;
  top_blog: boolean;
  selectedTagIds: string[];
}

const emptyForm: BlogForm = {
  title: "", slug: "", summary: "", status: "draft", content: "",
  author_id: "", thumbnail_url: "", featured: false, top_blog: false,
  selectedTagIds: [],
};

function AuthorSelector({ authors, value, onChange, onCreateAuthor }: {
  authors: Author[];
  value: string;
  onChange: (id: string) => void;
  onCreateAuthor: () => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <select className="flex-1 border rounded px-3 py-2 text-sm bg-background" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select Author</option>
        {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <Button type="button" variant="outline" size="sm" onClick={onCreateAuthor}>
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function TagSelector({ allTags, selectedIds, onChange, onCreateTag }: {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreateTag: (name: string) => void;
}) {
  const [newTag, setNewTag] = useState("");

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 border rounded bg-background">
        {selectedIds.map((id) => {
          const tag = allTags.find((t) => t.id === id);
          return tag ? (
            <Badge key={id} variant="secondary" className="gap-1">
              {tag.name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onChange(selectedIds.filter((i) => i !== id))} />
            </Badge>
          ) : null;
        })}
      </div>
      <div className="flex gap-2">
        <select className="flex-1 border rounded px-3 py-2 text-sm bg-background"
          onChange={(e) => { if (e.target.value && !selectedIds.includes(e.target.value)) { onChange([...selectedIds, e.target.value]); } e.target.value = ""; }}>
          <option value="">Add existing tag...</option>
          {allTags.filter((t) => !selectedIds.includes(t.id)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <Input placeholder="New tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="w-36"
          onKeyDown={(e) => { if (e.key === "Enter" && newTag.trim()) { onCreateTag(newTag.trim()); setNewTag(""); } }} />
        <Button type="button" variant="outline" size="sm" disabled={!newTag.trim()} onClick={() => { onCreateTag(newTag.trim()); setNewTag(""); }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function BlogFormFields({ form, setForm, authors, tags, onCreateAuthor, onCreateTag }: {
  form: BlogForm;
  setForm: (f: BlogForm) => void;
  authors: Author[];
  tags: Tag[];
  onCreateAuthor: () => void;
  onCreateTag: (name: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Input placeholder="slug-url" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      <Textarea placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
      <Input placeholder="Thumbnail URL" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />

      <AuthorSelector authors={authors} value={form.author_id} onChange={(id) => setForm({ ...form, author_id: id })} onCreateAuthor={onCreateAuthor} />

      <div className="grid grid-cols-3 gap-3">
        <select className="border rounded px-3 py-2 text-sm bg-background" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.top_blog} onChange={(e) => setForm({ ...form, top_blog: e.target.checked })} /> Top Blog
        </label>
      </div>

      <TagSelector allTags={tags} selectedIds={form.selectedTagIds} onChange={(ids) => setForm({ ...form, selectedTagIds: ids })} onCreateTag={onCreateTag} />

      <BlogEditor content={form.content} onChange={(html) => setForm({ ...form, content: html })} />
    </div>
  );
}

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editBlog, setEditBlog] = useState<any | null>(null);
  const [newBlog, setNewBlog] = useState<BlogForm>({ ...emptyForm });
  const [editForm, setEditForm] = useState<BlogForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [blogTagsMap, setBlogTagsMap] = useState<Record<string, string[]>>({});
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);
  const [newAuthor, setNewAuthor] = useState({ name: "", profile_url: "", bio: "", profile_pic_url: "" });
  const [authorSaving, setAuthorSaving] = useState(false);
  const { toast } = useToast();

  const loadAuthors = useCallback(async () => {
    const { data } = await supabase.from("authors").select("*").order("name");
    setAuthors(data || []);
  }, []);

  const loadTags = useCallback(async () => {
    const { data } = await supabase.from("tags").select("*").order("name");
    setTags(data || []);
  }, []);

  const loadBlogTags = useCallback(async (blogIds: string[]) => {
    if (!blogIds.length) return;
    const { data } = await supabase.from("blog_tags").select("blog_id, tag_id").in("blog_id", blogIds);
    const map: Record<string, string[]> = {};
    (data || []).forEach((bt) => {
      if (!map[bt.blog_id]) map[bt.blog_id] = [];
      map[bt.blog_id].push(bt.tag_id);
    });
    setBlogTagsMap(map);
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    setBlogs(data || []);
    if (data?.length) await loadBlogTags(data.map((b) => b.id));
    setLoading(false);
  };

  useEffect(() => { load(); loadAuthors(); loadTags(); }, []);

  const saveBlogTags = async (blogId: string, tagIds: string[]) => {
    await supabase.from("blog_tags").delete().eq("blog_id", blogId);
    if (tagIds.length) {
      await supabase.from("blog_tags").insert(tagIds.map((tag_id) => ({ blog_id: blogId, tag_id })));
    }
  };

  const createBlog = async () => {
    setSaving(true);
    const { data, error } = await supabase.from("blogs").insert({
      title: newBlog.title,
      slug: newBlog.slug,
      summary: newBlog.summary,
      status: newBlog.status as any,
      content: newBlog.content || null,
      author_id: newBlog.author_id || null,
      thumbnail_url: newBlog.thumbnail_url || null,
      featured: newBlog.featured,
      top_blog: newBlog.top_blog,
    }).select("id").single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      if (data && newBlog.selectedTagIds.length) await saveBlogTags(data.id, newBlog.selectedTagIds);
      toast({ title: "Blog created" });
      setShowCreate(false);
      setNewBlog({ ...emptyForm });
      load();
    }
    setSaving(false);
  };

  const updateBlog = async () => {
    if (!editBlog) return;
    setSaving(true);
    const { error } = await supabase.from("blogs").update({
      title: editForm.title,
      slug: editForm.slug,
      summary: editForm.summary,
      status: editForm.status,
      featured: editForm.featured,
      top_blog: editForm.top_blog,
      thumbnail_url: editForm.thumbnail_url || null,
      content: editForm.content,
      author_id: editForm.author_id || null,
    }).eq("id", editBlog.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await saveBlogTags(editBlog.id, editForm.selectedTagIds);
      toast({ title: "Blog updated" });
      setEditBlog(null);
      load();
    }
    setSaving(false);
  };

  const createAuthor = async () => {
    setAuthorSaving(true);
    const { error } = await supabase.from("authors").insert({
      name: newAuthor.name,
      profile_url: newAuthor.profile_url || null,
      bio: newAuthor.bio || null,
      profile_pic_url: newAuthor.profile_pic_url || null,
    });
    setAuthorSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Author created" });
      setNewAuthor({ name: "", profile_url: "", bio: "", profile_pic_url: "" });
      setShowAuthorDialog(false);
      loadAuthors();
    }
  };

  const createTag = async (name: string) => {
    const { data, error } = await supabase.from("tags").insert({ name }).select("id").single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      await loadTags();
      return data.id as string;
    }
    return null;
  };

  const handleCreateTag = async (name: string, formSetter: "new" | "edit") => {
    const id = await createTag(name);
    if (id) {
      if (formSetter === "new") {
        setNewBlog((prev) => ({ ...prev, selectedTagIds: [...prev.selectedTagIds, id] }));
      } else {
        setEditForm((prev) => ({ ...prev, selectedTagIds: [...prev.selectedTagIds, id] }));
      }
    }
  };

  const openEdit = (blog: any) => {
    setEditBlog(blog);
    setEditForm({
      title: blog.title,
      slug: blog.slug,
      summary: blog.summary || "",
      status: blog.status || "draft",
      content: blog.content || "",
      author_id: blog.author_id || "",
      thumbnail_url: blog.thumbnail_url || "",
      featured: blog.featured || false,
      top_blog: blog.top_blog || false,
      selectedTagIds: blogTagsMap[blog.id] || [],
    });
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
            <BlogFormFields form={newBlog} setForm={setNewBlog} authors={authors} tags={tags}
              onCreateAuthor={() => setShowAuthorDialog(true)}
              onCreateTag={(name) => handleCreateTag(name, "new")} />
            <Button onClick={createBlog} className="w-full" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Create
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Author creation dialog */}
      <Dialog open={showAuthorDialog} onOpenChange={setShowAuthorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Author</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name *" value={newAuthor.name} onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })} />
            <Input placeholder="Profile URL" value={newAuthor.profile_url} onChange={(e) => setNewAuthor({ ...newAuthor, profile_url: e.target.value })} />
            <Input placeholder="Profile Picture URL" value={newAuthor.profile_pic_url} onChange={(e) => setNewAuthor({ ...newAuthor, profile_pic_url: e.target.value })} />
            <Textarea placeholder="Bio" value={newAuthor.bio} onChange={(e) => setNewAuthor({ ...newAuthor, bio: e.target.value })} />
            <Button onClick={createAuthor} className="w-full" disabled={authorSaving || !newAuthor.name.trim()}>
              {authorSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Create Author
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => {
            const author = authors.find((a) => a.id === blog.author_id);
            const bTags = (blogTagsMap[blog.id] || []).map((tid) => tags.find((t) => t.id === tid)).filter(Boolean);
            return (
              <Card key={blog.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold truncate">{blog.title}</h3>
                      <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status}</Badge>
                      {blog.featured && <Badge variant="outline">Featured</Badge>}
                      {blog.top_blog && <Badge variant="outline">Top</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      /{blog.slug} · {author ? author.name : "No author"} · {blog.read_time_minutes || "?"}m read
                      {bTags.length > 0 && <> · {bTags.map((t: any) => t.name).join(", ")}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEdit(blog)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Edit Blog</DialogTitle></DialogHeader>
                        {editBlog && editBlog.id === blog.id && (
                          <>
                            <BlogFormFields form={editForm} setForm={setEditForm} authors={authors} tags={tags}
                              onCreateAuthor={() => setShowAuthorDialog(true)}
                              onCreateTag={(name) => handleCreateTag(name, "edit")} />
                            <div className="flex gap-2 justify-end">
                              <Button onClick={updateBlog} disabled={saving}>
                                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Save Changes
                              </Button>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
