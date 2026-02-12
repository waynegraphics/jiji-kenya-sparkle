import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface BumpPackage {
  id: string; name: string; credits: number; price: number; currency: string;
  is_active: boolean; display_order: number; created_at: string;
}

const defaultForm = { name: "", credits: 1, price: 0, currency: "KES", is_active: true, display_order: 0 };

const AdminBumpPackages = () => {
  const qc = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<BumpPackage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["bump-packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bump_packages").select("*").order("display_order");
      if (error) throw error;
      return data as BumpPackage[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: typeof defaultForm) => {
      if (editing) {
        const { error } = await supabase.from("bump_packages").update(d).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bump_packages").insert(d);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bump-packages"] }); toast.success("Saved"); setIsFormOpen(false); setEditing(null); },
    onError: (e) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("bump_packages").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bump-packages"] }); toast.success("Deleted"); setDeleteId(null); },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("bump_packages").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bump-packages"] }),
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setIsFormOpen(true); };
  const openEdit = (p: BumpPackage) => { setEditing(p); setForm({ name: p.name, credits: p.credits, price: p.price, currency: p.currency, is_active: p.is_active, display_order: p.display_order }); setIsFormOpen(true); };
  const fmt = (p: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(p);

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold">Bump Credit Packages</h2><p className="text-muted-foreground text-sm">Sellers purchase bump credits to push ads to the top within their tier</p></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Package</Button>
      </div>
      <div className="space-y-3">
        {packages?.length === 0 && <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground mb-4">No bump packages yet</p><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create First Package</Button></CardContent></Card>}
        {packages?.map(p => (
          <Card key={p.id} className={!p.is_active ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Zap className="h-5 w-5 text-primary" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 className="font-semibold">{p.name}</h3>{!p.is_active && <Badge variant="secondary">Inactive</Badge>}</div>
                  <p className="text-sm text-muted-foreground">{p.credits} bumps for {fmt(p.price)}</p>
                </div>
                <Switch checked={p.is_active} onCheckedChange={(v) => toggle.mutate({ id: p.id, active: v })} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Create"} Bump Package</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="5 Bumps Pack" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Credits</Label><Input type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: parseInt(e.target.value) || 1 }))} /></div>
              <div><Label>Price (KES)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
            <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.name}>{save.isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Package</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && del.mutate(deleteId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBumpPackages;
