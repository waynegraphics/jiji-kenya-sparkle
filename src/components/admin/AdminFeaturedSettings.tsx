import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Star, Save } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface FeaturedSettings {
  id: string; is_enabled: boolean; eligible_tier_ids: string[];
  default_duration_days: number; ribbon_text: string; highlight_bg: string;
  border_accent: string; badge_label: string;
}

interface FeaturedDuration {
  id: string; duration_days: number; price: number; currency: string;
  is_active: boolean; display_order: number;
}

interface ListingTier {
  id: string; name: string; is_active: boolean; priority_weight: number;
}

const AdminFeaturedSettings = () => {
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["featured-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("featured_settings").select("*").limit(1).single();
      if (error) throw error;
      return data as FeaturedSettings;
    },
  });

  const { data: durations } = useQuery({
    queryKey: ["featured-durations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("featured_durations").select("*").order("display_order");
      if (error) throw error;
      return data as FeaturedDuration[];
    },
  });

  const { data: tiers } = useQuery({
    queryKey: ["listing-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listing_tiers").select("*").order("priority_weight", { ascending: false });
      if (error) throw error;
      return data as ListingTier[];
    },
  });

  const [form, setForm] = useState<Partial<FeaturedSettings>>({});
  const [durForm, setDurForm] = useState({ duration_days: 7, price: 0, currency: "KES", is_active: true, display_order: 0 });
  const [durDialogOpen, setDurDialogOpen] = useState(false);
  const [editingDur, setEditingDur] = useState<FeaturedDuration | null>(null);
  const [deleteDurId, setDeleteDurId] = useState<string | null>(null);

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async (d: Partial<FeaturedSettings>) => {
      if (!settings) return;
      const { error } = await supabase.from("featured_settings").update(d).eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["featured-settings"] }); toast.success("Settings saved"); },
    onError: (e) => toast.error(e.message),
  });

  const saveDur = useMutation({
    mutationFn: async (d: typeof durForm) => {
      if (editingDur) {
        const { error } = await supabase.from("featured_durations").update(d).eq("id", editingDur.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("featured_durations").insert(d);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["featured-durations"] }); toast.success("Saved"); setDurDialogOpen(false); setEditingDur(null); },
    onError: (e) => toast.error(e.message),
  });

  const delDur = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("featured_durations").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["featured-durations"] }); toast.success("Deleted"); setDeleteDurId(null); },
  });

  const toggleTierEligibility = (tierId: string) => {
    const current = form.eligible_tier_ids || [];
    const next = current.includes(tierId) ? current.filter(id => id !== tierId) : [...current, tierId];
    setForm(f => ({ ...f, eligible_tier_ids: next }));
  };

  const fmt = (p: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(p);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold">Featured Listings Settings</h2><p className="text-muted-foreground text-sm">Configure featured system — works inside tiers, not as a tier itself</p></div>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" /> Global Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={form.is_enabled ?? true} onCheckedChange={v => setForm(f => ({ ...f, is_enabled: v }))} />
            <Label>Featured system enabled</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Ribbon Text</Label><Input value={form.ribbon_text || ""} onChange={e => setForm(f => ({ ...f, ribbon_text: e.target.value }))} /></div>
            <div><Label>Badge Label</Label><Input value={form.badge_label || ""} onChange={e => setForm(f => ({ ...f, badge_label: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Highlight Background</Label><Input type="color" value={form.highlight_bg || "#FFF8E1"} onChange={e => setForm(f => ({ ...f, highlight_bg: e.target.value }))} /></div>
            <div><Label>Border Accent</Label><Input type="color" value={form.border_accent || "#FFD700"} onChange={e => setForm(f => ({ ...f, border_accent: e.target.value }))} /></div>
          </div>
          <div><Label>Default Duration (days)</Label><Input type="number" value={form.default_duration_days || 7} onChange={e => setForm(f => ({ ...f, default_duration_days: parseInt(e.target.value) || 7 }))} /></div>

          {/* Eligible Tiers */}
          <div>
            <Label className="mb-2 block">Eligible Tiers (Free tier cannot be featured)</Label>
            <div className="space-y-2">
              {tiers?.filter(t => t.priority_weight > 0).map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <Checkbox checked={(form.eligible_tier_ids || []).includes(t.id)} onCheckedChange={() => toggleTierEligibility(t.id)} />
                  <span className="text-sm">{t.name} (Priority: {t.priority_weight})</span>
                </div>
              ))}
              {tiers?.filter(t => t.priority_weight > 0).length === 0 && <p className="text-sm text-muted-foreground">Create paid tiers first to enable featured eligibility</p>}
            </div>
          </div>

          <Button onClick={() => updateSettings.mutate(form)} disabled={updateSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />{updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Duration Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Duration Pricing</CardTitle>
            <Button size="sm" onClick={() => { setEditingDur(null); setDurForm({ duration_days: 7, price: 0, currency: "KES", is_active: true, display_order: 0 }); setDurDialogOpen(true); }}>
              <Plus className="h-3 w-3 mr-1" />Add Duration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {durations?.map(d => (
              <div key={d.id} className={`flex items-center gap-4 p-3 rounded-lg bg-muted/50 ${!d.is_active ? "opacity-60" : ""}`}>
                <div className="flex-1">
                  <span className="font-medium">{d.duration_days} days</span>
                  <span className="text-muted-foreground ml-2">— {fmt(d.price)}</span>
                </div>
                <Switch checked={d.is_active} onCheckedChange={v => {
                  supabase.from("featured_durations").update({ is_active: v }).eq("id", d.id).then(() => qc.invalidateQueries({ queryKey: ["featured-durations"] }));
                }} />
                <Button variant="ghost" size="icon" onClick={() => { setEditingDur(d); setDurForm({ duration_days: d.duration_days, price: d.price, currency: d.currency, is_active: d.is_active, display_order: d.display_order }); setDurDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteDurId(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Duration Dialog */}
      <Dialog open={durDialogOpen} onOpenChange={setDurDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingDur ? "Edit" : "Add"} Duration</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Days</Label><Input type="number" value={durForm.duration_days} onChange={e => setDurForm(f => ({ ...f, duration_days: parseInt(e.target.value) || 7 }))} /></div>
              <div><Label>Price (KES)</Label><Input type="number" value={durForm.price} onChange={e => setDurForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDurDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => saveDur.mutate(durForm)} disabled={saveDur.isPending}>{saveDur.isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDurId} onOpenChange={() => setDeleteDurId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Duration</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteDurId && delDur.mutate(deleteDurId)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFeaturedSettings;
