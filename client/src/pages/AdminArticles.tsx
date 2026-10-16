import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
};

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminArticles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Article | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", imageUrl: "", status: "draft" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/articles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/articles", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch articles");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: { title: string; slug: string; content: string; imageUrl?: string; status: string }) => {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create article");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({ title: "Success", description: "Article created" });
      setIsAddOpen(false);
      setForm({ title: "", slug: "", content: "", imageUrl: "", status: "draft" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Partial<Article> }) => {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update article");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({ title: "Success", description: "Article updated" });
      setIsEditOpen(false);
      setSelected(null);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete article");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({ title: "Success", description: "Article deleted" });
      setDeleteId(null);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = articles.filter(
    (a: Article) =>
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEdit = (article: Article) => {
    setSelected(article);
    setForm({
      title: article.title,
      slug: article.slug,
      content: article.content,
      imageUrl: article.imageUrl || "",
      status: article.status || "draft",
    });
    setIsEditOpen(true);
  };

  const handleAddSubmit = () => {
    const slug = form.slug.trim() || slugFromTitle(form.title);
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Validation", description: "Title and content are required", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      title: form.title.trim(),
      slug,
      content: form.content.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      status: form.status,
    });
  };

  const handleEditSubmit = () => {
    if (!selected) return;
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Validation", description: "Title and content are required", variant: "destructive" });
      return;
    }
    updateMutation.mutate({
      id: selected.id,
      body: {
        title: form.title.trim(),
        slug: form.slug.trim() || slugFromTitle(form.title),
        content: form.content.trim(),
        imageUrl: form.imageUrl.trim() || null,
        status: form.status,
      },
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Articles">
        <div className="flex justify-center items-center py-20 text-muted-foreground">Loading...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Articles">
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <div className="text-destructive font-semibold">Error loading articles</div>
          <div className="text-muted-foreground text-sm">{error instanceof Error ? error.message : "Please try again."}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Articles">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <p className="text-muted-foreground">Manage blog articles (published articles appear on the public Blog page).</p>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
          <Button className="rounded-full px-6" onClick={() => { setForm({ title: "", slug: "", content: "", imageUrl: "", status: "draft" }); setIsAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Article
          </Button>
        </div>
      </div>

      <Card className="border border-border/60">
        <CardContent className="p-0">
          <div className="grid grid-cols-4 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
            <div>Title</div>
            <div>Slug</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No articles yet. Add one to get started.</div>
          ) : (
            filtered.map((article: Article) => (
              <div key={article.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 text-sm items-center">
                <div className="font-medium truncate">{article.title}</div>
                <div className="text-muted-foreground truncate">{article.slug}</div>
                <div className={article.status === "published" ? "text-primary" : "text-muted-foreground"}>{article.status}</div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(article)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(article.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Article Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Article</DialogTitle>
            <DialogDescription>Create a new blog article. Use a unique slug for the URL.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugFromTitle(e.target.value) }))}
                placeholder="Article title"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="url-friendly-slug"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Article content (plain text or HTML)"
                rows={8}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>Update title, content, or status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Article title" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="slug" />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={8}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId != null && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
