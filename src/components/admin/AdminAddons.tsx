import { useState } from "react";
import { useAddons, useAddonTiers, useCreateAddon, useUpdateAddon, useDeleteAddon, useCreateTier, useUpdateTier, useDeleteTier } from "@/hooks/useSubscriptions";
import { Addon, AddonTier, AddonFormData, TierFormData } from "@/types/subscriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Zap, Star, TrendingUp } from "lucide-react";
import AddonFormDialog from "./AddonFormDialog";
import TierFormDialog from "./TierFormDialog";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const addonTypeIcons = {
  bumping: Zap,
  featured: Star,
  promotion: TrendingUp,
};

const AdminAddons = () => {
  const { data: addons, isLoading } = useAddons();
  const { data: allTiers } = useAddonTiers();
  const createAddon = useCreateAddon();
  const updateAddon = useUpdateAddon();
  const deleteAddon = useDeleteAddon();
  const createTier = useCreateTier();
  const updateTier = useUpdateTier();
  const deleteTier = useDeleteTier();
  
  const [isAddonFormOpen, setIsAddonFormOpen] = useState(false);
  const [isTierFormOpen, setIsTierFormOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [editingTier, setEditingTier] = useState<AddonTier | null>(null);
  const [selectedAddonId, setSelectedAddonId] = useState<string | null>(null);
  const [deleteAddonId, setDeleteAddonId] = useState<string | null>(null);
  const [deleteTierId, setDeleteTierId] = useState<string | null>(null);
  const [expandedAddons, setExpandedAddons] = useState<Set<string>>(new Set());

  const toggleExpanded = (addonId: string) => {
    const newSet = new Set(expandedAddons);
    if (newSet.has(addonId)) {
      newSet.delete(addonId);
    } else {
      newSet.add(addonId);
    }
    setExpandedAddons(newSet);
  };

  const getTiersForAddon = (addonId: string) => {
    return allTiers?.filter(t => t.addon_id === addonId) || [];
  };

  const handleCreateAddon = (data: AddonFormData) => {
    createAddon.mutate(data, {
      onSuccess: () => setIsAddonFormOpen(false),
    });
  };

  const handleUpdateAddon = (data: AddonFormData) => {
    if (!editingAddon) return;
    updateAddon.mutate({ id: editingAddon.id, data }, {
      onSuccess: () => {
        setEditingAddon(null);
        setIsAddonFormOpen(false);
      },
    });
  };

  const handleDeleteAddon = () => {
    if (!deleteAddonId) return;
    deleteAddon.mutate(deleteAddonId, {
      onSuccess: () => setDeleteAddonId(null),
    });
  };

  const handleCreateTier = (data: TierFormData) => {
    createTier.mutate(data, {
      onSuccess: () => {
        setIsTierFormOpen(false);
        setSelectedAddonId(null);
      },
    });
  };

  const handleUpdateTier = (data: TierFormData) => {
    if (!editingTier) return;
    updateTier.mutate({ id: editingTier.id, data }, {
      onSuccess: () => {
        setEditingTier(null);
        setIsTierFormOpen(false);
      },
    });
  };

  const handleDeleteTier = () => {
    if (!deleteTierId) return;
    deleteTier.mutate(deleteTierId, {
      onSuccess: () => setDeleteTierId(null),
    });
  };

  const handleToggleAddonActive = (addon: Addon) => {
    updateAddon.mutate({ id: addon.id, data: { is_active: !addon.is_active } });
  };

  const handleToggleTierActive = (tier: AddonTier) => {
    updateTier.mutate({ id: tier.id, data: { is_active: !tier.is_active } });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Add-ons</h2>
          <p className="text-muted-foreground text-sm">
            Create optional features sellers can purchase (bumping, featured, promotions)
          </p>
        </div>
        <Button onClick={() => { setEditingAddon(null); setIsAddonFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Add-on
        </Button>
      </div>

      {/* Addons List */}
      <div className="space-y-4">
        {addons?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No add-ons created yet</p>
              <Button onClick={() => { setEditingAddon(null); setIsAddonFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Add-on
              </Button>
            </CardContent>
          </Card>
        )}

        {addons?.map((addon) => {
          const Icon = addonTypeIcons[addon.type];
          const tiers = getTiersForAddon(addon.id);
          const isExpanded = expandedAddons.has(addon.id);

          return (
            <Card key={addon.id} className={!addon.is_active ? "opacity-60" : ""}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(addon.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: addon.bg_color }}
                    >
                      <Icon className="h-5 w-5" style={{ color: addon.text_color }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{addon.name}</CardTitle>
                        <Badge variant="outline" className="capitalize">{addon.type}</Badge>
                        {!addon.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <CardDescription>
                        {addon.description || "No description"} • {tiers.length} tier(s)
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={addon.is_active} 
                        onCheckedChange={() => handleToggleAddonActive(addon)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setEditingAddon(addon); setIsAddonFormOpen(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteAddonId(addon.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Pricing Tiers</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => { 
                            setSelectedAddonId(addon.id); 
                            setEditingTier(null);
                            setIsTierFormOpen(true); 
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Tier
                        </Button>
                      </div>

                      {tiers.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No tiers yet. Add pricing tiers for this add-on.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {tiers.map((tier) => (
                            <div 
                              key={tier.id} 
                              className={`flex items-center gap-4 p-3 rounded-lg bg-muted/50 ${!tier.is_active ? "opacity-60" : ""}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{tier.name}</span>
                                  {!tier.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {tier.quantity} {addon.type}(s) for {formatPrice(tier.price, tier.currency)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch 
                                  checked={tier.is_active} 
                                  onCheckedChange={() => handleToggleTierActive(tier)}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => { 
                                    setSelectedAddonId(addon.id);
                                    setEditingTier(tier); 
                                    setIsTierFormOpen(true); 
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setDeleteTierId(tier.id)}
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
          );
        })}
      </div>

      {/* Addon Form Dialog */}
      <AddonFormDialog
        open={isAddonFormOpen}
        onOpenChange={setIsAddonFormOpen}
        addon={editingAddon}
        onSubmit={editingAddon ? handleUpdateAddon : handleCreateAddon}
        isLoading={createAddon.isPending || updateAddon.isPending}
      />

      {/* Tier Form Dialog */}
      <TierFormDialog
        open={isTierFormOpen}
        onOpenChange={setIsTierFormOpen}
        tier={editingTier}
        addonId={selectedAddonId || editingTier?.addon_id || ""}
        onSubmit={editingTier ? handleUpdateTier : handleCreateTier}
        isLoading={createTier.isPending || updateTier.isPending}
      />

      {/* Delete Addon Confirmation */}
      <AlertDialog open={!!deleteAddonId} onOpenChange={() => setDeleteAddonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Add-on</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this add-on? This will also delete all associated pricing tiers.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddon} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tier Confirmation */}
      <AlertDialog open={!!deleteTierId} onOpenChange={() => setDeleteTierId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pricing tier? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTier} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAddons;
