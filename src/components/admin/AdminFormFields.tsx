import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit, Trash2, GripVertical, FormInput, Search as SearchIcon, X } from "lucide-react";

interface FormField {
  id: string;
  category_slug: string;
  field_name: string;
  field_label: string;
  field_type: string;
  options: string[];
  is_required: boolean;
  is_searchable: boolean;
  display_order: number;
  placeholder: string | null;
  help_text: string | null;
  is_active: boolean;
}

const fieldTypes = [
  { value: "text", label: "Text Input" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "textarea", label: "Text Area" },
];

const defaultForm = {
  category_slug: "",
  field_name: "",
  field_label: "",
  field_type: "text",
  options: [] as string[],
  is_required: false,
  is_searchable: false,
  display_order: 0,
  placeholder: "",
  help_text: "",
  is_active: true,
};

const AdminFormFields = () => {
  const qc = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<FormField | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [newOption, setNewOption] = useState("");

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["admin-main-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("main_categories").select("slug, name").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch form fields
  const { data: fields, isLoading } = useQuery({
    queryKey: ["category-form-fields", selectedCategory],
    queryFn: async () => {
      let query = supabase.from("category_form_fields").select("*").order("display_order");
      if (selectedCategory !== "all") query = query.eq("category_slug", selectedCategory);
      const { data, error } = await query;
      if (error) throw error;
      return data as FormField[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: typeof defaultForm) => {
      const payload = {
        ...d,
        field_name: d.field_name || d.field_label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        placeholder: d.placeholder || null,
        help_text: d.help_text || null,
      };
      if (editing) {
        const { error } = await supabase.from("category_form_fields").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("category_form_fields").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-form-fields"] });
      toast.success(editing ? "Field updated" : "Field created");
      setIsFormOpen(false);
      setEditing(null);
      setForm(defaultForm);
    },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("category_form_fields").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-form-fields"] });
      toast.success("Field deleted");
      setDeleteId(null);
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("category_form_fields").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["category-form-fields"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, category_slug: selectedCategory !== "all" ? selectedCategory : "" });
    setIsFormOpen(true);
  };

  const openEdit = (f: FormField) => {
    setEditing(f);
    setForm({
      category_slug: f.category_slug,
      field_name: f.field_name,
      field_label: f.field_label,
      field_type: f.field_type,
      options: f.options || [],
      is_required: f.is_required,
      is_searchable: f.is_searchable,
      display_order: f.display_order,
      placeholder: f.placeholder || "",
      help_text: f.help_text || "",
      is_active: f.is_active,
    });
    setIsFormOpen(true);
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    setForm(f => ({ ...f, options: [...f.options, newOption.trim()] }));
    setNewOption("");
  };

  const removeOption = (idx: number) => {
    setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));
  };

  const getCategoryName = (slug: string) => categories?.find(c => c.slug === slug)?.name || slug;

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Dynamic Form Fields</h2>
          <p className="text-muted-foreground text-sm">Define custom fields per category — they auto-appear in posting, editing, and search</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Field</Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 items-center">
        <Label className="text-sm whitespace-nowrap">Filter by category:</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map(c => (
              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fields list */}
      <div className="space-y-3">
        {fields?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FormInput className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No custom fields defined{selectedCategory !== "all" ? ` for ${getCategoryName(selectedCategory)}` : ""}</p>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Field</Button>
            </CardContent>
          </Card>
        )}
        {fields?.map(f => (
          <Card key={f.id} className={!f.is_active ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{f.field_label}</h3>
                    <Badge variant="outline">{f.field_type}</Badge>
                    <Badge variant="secondary">{getCategoryName(f.category_slug)}</Badge>
                    {f.is_required && <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">Required</Badge>}
                    {f.is_searchable && <Badge className="bg-blue-500/10 text-blue-600 border-blue-200"><SearchIcon className="h-3 w-3 mr-1" />Searchable</Badge>}
                    {!f.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Field: {f.field_name} {f.options?.length > 0 && `• ${f.options.length} options`}
                  </p>
                </div>
                <Switch checked={f.is_active} onCheckedChange={(v) => toggle.mutate({ id: f.id, active: v })} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Create"} Form Field</DialogTitle>
            <DialogDescription>This field will appear on the posting form and product detail page for the selected category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category *</Label>
              <Select value={form.category_slug} onValueChange={v => setForm(f => ({ ...f, category_slug: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Field Label *</Label><Input value={form.field_label} onChange={e => setForm(f => ({ ...f, field_label: e.target.value }))} placeholder="e.g., Color" /></div>
              <div><Label>Field Name (auto)</Label><Input value={form.field_name || form.field_label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')} onChange={e => setForm(f => ({ ...f, field_name: e.target.value }))} placeholder="color" /></div>
            </div>
            <div>
              <Label>Field Type</Label>
              <Select value={form.field_type} onValueChange={v => setForm(f => ({ ...f, field_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fieldTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {(form.field_type === "select") && (
              <div>
                <Label>Options</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={newOption} onChange={e => setNewOption(e.target.value)} placeholder="Add option..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())} />
                  <Button type="button" variant="outline" onClick={addOption}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.options.map((opt, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {opt}
                      <button onClick={() => removeOption(i)}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Placeholder</Label><Input value={form.placeholder} onChange={e => setForm(f => ({ ...f, placeholder: e.target.value }))} placeholder="Enter value..." /></div>
              <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div><Label>Help Text</Label><Input value={form.help_text} onChange={e => setForm(f => ({ ...f, help_text: e.target.value }))} placeholder="Optional guidance for the user" /></div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_required} onCheckedChange={v => setForm(f => ({ ...f, is_required: v }))} />
                <Label>Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_searchable} onCheckedChange={v => setForm(f => ({ ...f, is_searchable: v }))} />
                <Label>Searchable</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.field_label || !form.category_slug}>
              {save.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field</AlertDialogTitle>
            <AlertDialogDescription>This will remove the field and all stored values. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFormFields;
