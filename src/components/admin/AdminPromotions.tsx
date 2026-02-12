import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PromotionType {
  id: string; name: string; placement: string; duration_days: number; price: number;
  currency: string; max_ads: number; is_active: boolean; display_order: number;
}

const placements = [
  { value: "homepage_top", label: "Homepage Top" },
  { value: "category_top", label: "Category Top" },
  { value: "sidebar", label: "Sidebar" },
  { value: "search_boost", label: "Search Priority Boost" },
];

const defaultForm = { name: "", placement: "homepage_top", duration_days: 7, price: 0, currency: "KES", max_ads: 10, is_active: true, display_order: 0 };

const AdminPromotions = () => {
  const qc = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<PromotionType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: types, isLoading } = useQuery({
    queryKey: ["promotion-types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotion_types").select("*").order("display_order");
      if (error) throw error;
      return data as PromotionType[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: typeof defaultForm) => {
      if (editing) {
        const { error } = await supabase.from("promotion_types").update(d).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promotion_types").insert(d);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["promotion-types"] }); toast.success("Saved"); setIsFormOpen(false); setEditing(null); },
    onError: (e) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("promotion_types").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["promotion-types"] }); toast.success("Deleted"); setDeleteId(null); },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("promotion_types").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotion-types"] }),
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setIsFormOpen(true); };
  const openEdit = (p: PromotionType) => {
    setEditing(p);
    setForm({ name: p.name, placement: p.placement, duration_days: p.duration_days, price: p.price, currency: p.currency, max_ads: p.max_ads, is_active: p.is_active, display_order: p.display_order });
    setIsFormOpen(true);
  };
  const fmt = (p: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(p);
  const getPlacementLabel = (v: string) => placements.find(p => p.value === v)?.label || v;

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold">Promotion Types</h2><p className="text-muted-foreground text-sm">Define ad promotion placements — promotions override all other ranking</p></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Promotion Type</Button>
      </div>
      <div className="space-y-3">
        {types?.length === 0 && <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground mb-4">No promotion types yet</p><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create First</Button></CardContent></Card>}
        {types?.map(t => (
          <Card key={t.id} className={!t.is_active ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-orange-500" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 className="font-semibold">{t.name}</h3><Badge variant="outline">{getPlacementLabel(t.placement)}</Badge>{!t.is_active && <Badge variant="secondary">Inactive</Badge>}</div>
                  <p className="text-sm text-muted-foreground">{fmt(t.price)} for {t.duration_days} days • Max {t.max_ads} ads per slot</p>
                </div>
                <Switch checked={t.is_active} onCheckedChange={(v) => toggle.mutate({ id: t.id, active: v })} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Create"} Promotion Type</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Homepage Top" /></div>
            <div><Label>Placement</Label>
              <Select value={form.placement} onValueChange={v => setForm(f => ({ ...f, placement: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{placements.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Duration (days)</Label><Input type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: parseInt(e.target.value) || 7 }))} /></div>
              <div><Label>Price (KES)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Max Ads per Slot</Label><Input type="number" value={form.max_ads} onChange={e => setForm(f => ({ ...f, max_ads: parseInt(e.target.value) || 10 }))} /></div>
              <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.name}>{save.isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Promotion Type</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPromotions;
