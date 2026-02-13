import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, GripVertical, Crown } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ListingTier {
  id: string;
  name: string;
  priority_weight: number;
  badge_label: string | null;
  badge_color: string;
  border_style: string;
  shadow_intensity: string;
  ribbon_text: string | null;
  price: number;
  currency: string;
  included_featured_days: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const defaultForm = {
  name: "", priority_weight: 0, badge_label: "", badge_color: "#888888",
  border_style: "none", shadow_intensity: "none", ribbon_text: "",
  price: 0, currency: "KES", included_featured_days: 0, is_active: true, display_order: 0,
  max_ads: 5,
};

const AdminTiers = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<ListingTier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: tiers, isLoading } = useQuery({
    queryKey: ["listing-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listing_tiers").select("*").order("display_order");
      if (error) throw error;
      return data as ListingTier[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof defaultForm) => {
      const payload = {
        ...data,
        badge_label: data.badge_label || null,
        ribbon_text: data.ribbon_text || null,
      };
      if (editingTier) {
        const { error } = await supabase.from("listing_tiers").update(payload).eq("id", editingTier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("listing_tiers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing-tiers"] });
      toast.success(editingTier ? "Tier updated" : "Tier created");
      setIsFormOpen(false);
      setEditingTier(null);
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listing_tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing-tiers"] });
      toast.success("Tier deleted");
      setDeleteId(null);
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("listing_tiers").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listing-tiers"] }),
  });

  const openCreate = () => { setEditingTier(null); setForm(defaultForm); setIsFormOpen(true); };
  const openEdit = (t: ListingTier) => {
    setEditingTier(t);
    setForm({
      name: t.name, priority_weight: t.priority_weight, badge_label: t.badge_label || "",
      badge_color: t.badge_color, border_style: t.border_style, shadow_intensity: t.shadow_intensity,
      ribbon_text: t.ribbon_text || "", price: t.price, currency: t.currency,
      included_featured_days: t.included_featured_days, is_active: t.is_active, display_order: t.display_order,
      max_ads: (t as any).max_ads || 5,
    });
    setIsFormOpen(true);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(price);

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ad Tiers</h2>
          <p className="text-muted-foreground text-sm">Define authority ranking tiers (Gold, Silver, Bronze, etc.) — purchased per ad</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Tier</Button>
      </div>

      {/* Preview */}
      {tiers && tiers.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tier Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {tiers.filter(t => t.is_active).map(t => (
                <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border-2" style={{ borderColor: t.badge_color, boxShadow: t.shadow_intensity !== 'none' ? `0 0 12px ${t.badge_color}40` : undefined }}>
                  <Crown className="h-4 w-4" style={{ color: t.badge_color }} />
                  <span className="font-semibold text-sm">{t.badge_label || t.name}</span>
                  {t.ribbon_text && <Badge style={{ backgroundColor: t.badge_color, color: '#fff' }} className="text-[10px]">{t.ribbon_text}</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {tiers?.length === 0 && (
          <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground mb-4">No tiers created yet</p><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create First Tier</Button></CardContent></Card>
        )}
        {tiers?.map(t => (
          <Card key={t.id} className={!t.is_active ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.badge_color }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{t.name}</h3>
                    <Badge variant="outline">Priority: {t.priority_weight}</Badge>
                    {!t.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(t.price)} per ad • Max {(t as any).max_ads || 5} ads • {t.included_featured_days > 0 ? `${t.included_featured_days} featured days included` : "No featured days"}
                  </p>
                </div>
                <Switch checked={t.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: t.id, active: v })} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTier ? "Edit Tier" : "Create Tier"}</DialogTitle>
            <DialogDescription>Configure tier properties — all styling is dynamic from these settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Gold" /></div>
              <div><Label>Priority Weight</Label><Input type="number" value={form.priority_weight} onChange={e => setForm(f => ({ ...f, priority_weight: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Badge Label</Label><Input value={form.badge_label} onChange={e => setForm(f => ({ ...f, badge_label: e.target.value }))} placeholder="GOLD" /></div>
              <div><Label>Badge Color</Label><Input type="color" value={form.badge_color} onChange={e => setForm(f => ({ ...f, badge_color: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Border Style</Label><Input value={form.border_style} onChange={e => setForm(f => ({ ...f, border_style: e.target.value }))} placeholder="2px solid gold" /></div>
              <div><Label>Shadow Intensity</Label><Input value={form.shadow_intensity} onChange={e => setForm(f => ({ ...f, shadow_intensity: e.target.value }))} placeholder="0 0 10px gold" /></div>
            </div>
            <div><Label>Ribbon Text</Label><Input value={form.ribbon_text} onChange={e => setForm(f => ({ ...f, ribbon_text: e.target.value }))} placeholder="⭐ Gold" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price (KES)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label>Included Featured Days</Label><Input type="number" value={form.included_featured_days} onChange={e => setForm(f => ({ ...f, included_featured_days: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Max Ads Allowed</Label><Input type="number" value={form.max_ads} onChange={e => setForm(f => ({ ...f, max_ads: parseInt(e.target.value) || 1 }))} placeholder="e.g. 10 for Gold" /></div>
              <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name}>{saveMutation.isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Tier</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. Ads using this tier will revert to Free.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTiers;
