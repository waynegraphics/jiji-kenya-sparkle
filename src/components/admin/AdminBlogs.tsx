import { useState, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, Upload, ImageIcon } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface FAQ {
  question: string;
  answer: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_description: string | null;
  keywords: string[];
  thumbnail_url: string | null;
  category: string | null;
  author_name: string;
  author_id: string;
  faqs: FAQ[];
  status: string;
  read_time: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const AdminBlogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const quillRef = useRef<any>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("");
  const [authorName, setAuthorName] = useState("APA Bazaar Team");
  const [status, setStatus] = useState("draft");
  const [readTime, setReadTime] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  // Upload image to Supabase storage
  const uploadImage = async (file: File, folder: string = "content"): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("blog").upload(fileName, file);
    if (error) throw error;
    return `${SUPABASE_URL}/storage/v1/object/public/blog/${fileName}`;
  };

  // Custom image handler for Quill
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", "true");
    input.click();
    input.onchange = async () => {
      const files = input.files;
      if (!files) return;
      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      for (let i = 0; i < files.length; i++) {
        try {
          toast.loading("Uploading image...", { id: `img-upload-${i}` });
          const url = await uploadImage(files[i]);
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index + i, "image", url);
          quill.setSelection(range.index + i + 1);
          toast.success("Image uploaded", { id: `img-upload-${i}` });
        } catch (err: any) {
          toast.error(`Failed to upload: ${err.message}`, { id: `img-upload-${i}` });
        }
      }
    };
  }, []);

  // Full Quill modules with image handler
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: { matchVisual: false },
  }), [imageHandler]);

  const quillFormats = [
    "font", "header", "size",
    "bold", "italic", "underline", "strike",
    "color", "background",
    "script",
    "list", "indent", "direction", "align",
    "blockquote", "code-block",
    "link", "image", "video",
  ];

  // Thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setThumbnailUploading(true);
      const url = await uploadImage(file, "thumbnails");
      setThumbnailUrl(url);
      toast.success("Thumbnail uploaded");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setThumbnailUploading(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  const removeThumbnail = () => {
    setThumbnailUrl("");
  };

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as BlogPost[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (postData: any) => {
      if (editingPost) {
        const { error } = await supabase.from("blog_posts").update(postData).eq("id", editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(postData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success(editingPost ? "Blog post updated" : "Blog post created");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Blog post deleted");
    },
  });

  const resetForm = () => {
    setShowEditor(false);
    setEditingPost(null);
    setTitle("");
    setSlug("");
    setContent("");
    setExcerpt("");
    setMetaDescription("");
    setKeywords("");
    setThumbnailUrl("");
    setCategory("");
    setAuthorName("APA Bazaar Team");
    setStatus("draft");
    setReadTime("");
    setFaqs([]);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setExcerpt(post.excerpt || "");
    setMetaDescription(post.meta_description || "");
    setKeywords((post.keywords || []).join(", "));
    setThumbnailUrl(post.thumbnail_url || "");
    setCategory(post.category || "");
    setAuthorName(post.author_name);
    setStatus(post.status);
    setReadTime(post.read_time || "");
    setFaqs(post.faqs || []);
    setShowEditor(true);
  };

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = () => {
    if (!title || !slug) {
      toast.error("Title and slug are required");
      return;
    }
    const postData: any = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      meta_description: metaDescription || null,
      keywords: keywords ? keywords.split(",").map((k) => k.trim()) : [],
      thumbnail_url: thumbnailUrl || null,
      category: category || null,
      author_name: authorName,
      status,
      read_time: readTime || null,
      faqs: faqs.length > 0 ? faqs : [],
      published_at: status === "published" ? new Date().toISOString() : null,
    };
    if (!editingPost) postData.author_id = user?.id;
    saveMutation.mutate(postData);
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[i][field] = value;
    setFaqs(updated);
  };

  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{editingPost ? "Edit Blog Post" : "Create Blog Post"}</h2>
          <Button variant="outline" onClick={resetForm}>Cancel</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingPost) setSlug(generateSlug(e.target.value));
                }}
                placeholder="Blog post title"
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-friendly-slug" />
            </div>
            <div>
              <Label className="mb-2 block">Content (WYSIWYG) — Click the image icon in toolbar to upload images</Label>
              <div className="bg-background rounded-md border blog-editor">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  formats={quillFormats}
                  className="min-h-[500px]"
                  placeholder="Start writing your blog post... Use the toolbar to format text, add images, videos, and more."
                />
              </div>
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary for listing cards"
                rows={3}
              />
            </div>

            {/* FAQs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>FAQs</Label>
                <Button type="button" size="sm" variant="outline" onClick={addFaq}>
                  <Plus className="h-3 w-3 mr-1" /> Add FAQ
                </Button>
              </div>
              {faqs.map((faq, i) => (
                <div key={i} className="border rounded-lg p-3 mb-2 space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Question {i + 1}</Label>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeFaq(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                    placeholder="Question"
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                    placeholder="Answer"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <Label>Thumbnail Image</Label>
              {thumbnailUrl ? (
                <div className="relative mt-2 group">
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-40 object-cover rounded-lg border" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Replace
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={removeThumbnail}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  {thumbnailUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload thumbnail</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB</p>
                    </div>
                  )}
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailUpload}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Selling Tips" />
            </div>
            <div>
              <Label>Author Name</Label>
              <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
            </div>
            <div>
              <Label>Read Time</Label>
              <Input value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="e.g. 5 min read" />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO description (max 160 chars)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">{metaDescription.length}/160</p>
            </div>
            <div>
              <Label>Keywords (comma separated)</Label>
              <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="keyword1, keyword2" />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                <TableCell>{post.category || "—"}</TableCell>
                <TableCell>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>{post.views}</TableCell>
                <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Delete this post?")) deleteMutation.mutate(post.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!posts || posts.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No blog posts yet. Create your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminBlogs;
