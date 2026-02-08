import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  FolderTree,
  GripVertical
} from "lucide-react";

interface MainCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
}

interface SubCategory {
  id: string;
  main_category_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

const AdminCategories = () => {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isAddMainOpen, setIsAddMainOpen] = useState(false);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<MainCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    seo_title: "",
    seo_description: ""
  });
  const queryClient = useQueryClient();

  // Fetch main categories
  const { data: mainCategories, isLoading } = useQuery({
    queryKey: ["admin-main-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("main_categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as MainCategory[];
    }
  });

  // Fetch sub categories
  const { data: subCategories } = useQuery({
    queryKey: ["admin-sub-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sub_categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as SubCategory[];
    }
  });

  // Add main category
  const addMainCategory = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("main_categories")
        .insert({
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
          description: data.description || null,
          icon: data.icon || null,
          seo_title: data.seo_title || null,
          seo_description: data.seo_description || null,
          display_order: (mainCategories?.length || 0) + 1
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-main-categories"] });
      setIsAddMainOpen(false);
      setFormData({ name: "", slug: "", description: "", icon: "", seo_title: "", seo_description: "" });
      toast.success("Category created");
    },
    onError: () => {
      toast.error("Failed to create category");
    }
  });

  // Add sub category
  const addSubCategory = useMutation({
    mutationFn: async ({ mainCategoryId, name, slug }: { mainCategoryId: string; name: string; slug: string }) => {
      const { error } = await supabase
        .from("sub_categories")
        .insert({
          main_category_id: mainCategoryId,
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          display_order: subCategories?.filter(s => s.main_category_id === mainCategoryId).length || 0
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sub-categories"] });
      setIsAddSubOpen(false);
      setSelectedMainCategory(null);
      setFormData({ name: "", slug: "", description: "", icon: "", seo_title: "", seo_description: "" });
      toast.success("Sub-category created");
    },
    onError: () => {
      toast.error("Failed to create sub-category");
    }
  });

  // Toggle category active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive, isMain }: { id: string; isActive: boolean; isMain: boolean }) => {
      const table = isMain ? "main_categories" : "sub_categories";
      const { error } = await supabase
        .from(table)
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-main-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sub-categories"] });
      toast.success("Status updated");
    }
  });

  // Delete category
  const deleteCategory = useMutation({
    mutationFn: async ({ id, isMain }: { id: string; isMain: boolean }) => {
      const table = isMain ? "main_categories" : "sub_categories";
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-main-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sub-categories"] });
      toast.success("Category deleted");
    },
    onError: () => {
      toast.error("Failed to delete category");
    }
  });

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id) 
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-muted-foreground">
            Manage main categories and sub-categories
          </p>
        </div>
        <Dialog open={isAddMainOpen} onOpenChange={setIsAddMainOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Main Category</DialogTitle>
              <DialogDescription>Create a new main category for listings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Vehicles"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input 
                    value={formData.slug}
                    onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                    placeholder="vehicles"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Category description..."
                />
              </div>
              <div className="space-y-2">
                <Label>Icon (Lucide icon name)</Label>
                <Input 
                  value={formData.icon}
                  onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))}
                  placeholder="car"
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input 
                  value={formData.seo_title}
                  onChange={e => setFormData(p => ({ ...p, seo_title: e.target.value }))}
                  placeholder="Buy & Sell Vehicles in Kenya"
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea 
                  value={formData.seo_description}
                  onChange={e => setFormData(p => ({ ...p, seo_description: e.target.value }))}
                  placeholder="Meta description for search engines..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMainOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => addMainCategory.mutate(formData)}
                disabled={!formData.name}
              >
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {mainCategories?.map(category => (
          <Card key={category.id}>
            <Collapsible 
              open={openCategories.includes(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <FolderTree className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          /{category.slug} • {subCategories?.filter(s => s.main_category_id === category.id).length || 0} sub-categories
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openCategories.includes(category.id) ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Category Actions */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={category.is_active || false}
                        onCheckedChange={() => toggleActive.mutate({ 
                          id: category.id, 
                          isActive: category.is_active || false,
                          isMain: true 
                        })}
                      />
                      <Label>Active</Label>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedMainCategory(category.id);
                        setIsAddSubOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub-category
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Delete this category?")) {
                          deleteCategory.mutate({ id: category.id, isMain: true });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                  {/* Sub-categories */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sub-categories</Label>
                    {subCategories?.filter(s => s.main_category_id === category.id).length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">No sub-categories yet</p>
                    ) : (
                      <div className="space-y-2">
                        {subCategories?.filter(s => s.main_category_id === category.id).map(sub => (
                          <div 
                            key={sub.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <div>
                                <span className="font-medium">{sub.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">/{sub.slug}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={sub.is_active || false}
                                onCheckedChange={() => toggleActive.mutate({ 
                                  id: sub.id, 
                                  isActive: sub.is_active || false,
                                  isMain: false 
                                })}
                              />
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  if (confirm("Delete this sub-category?")) {
                                    deleteCategory.mutate({ id: sub.id, isMain: false });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Add Sub-category Dialog */}
      <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sub-category</DialogTitle>
            <DialogDescription>
              Add a new sub-category to {mainCategories?.find(c => c.id === selectedMainCategory)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Sedans"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input 
                  value={formData.slug}
                  onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                  placeholder="sedans"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => addSubCategory.mutate({
                mainCategoryId: selectedMainCategory!,
                name: formData.name,
                slug: formData.slug
              })}
              disabled={!formData.name || !selectedMainCategory}
            >
              Create Sub-category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;