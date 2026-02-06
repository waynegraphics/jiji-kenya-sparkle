import { useState } from "react";
import { useSubscriptionPackages, useCreatePackage, useUpdatePackage, useDeletePackage } from "@/hooks/useSubscriptions";
import { SubscriptionPackage, PackageFormData } from "@/types/subscriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, GripVertical, Eye } from "lucide-react";
import PackageFormDialog from "./PackageFormDialog";
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

const AdminPackages = () => {
  const { data: packages, isLoading } = useSubscriptionPackages();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const deletePackage = useDeletePackage();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleCreate = (data: PackageFormData) => {
    createPackage.mutate(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleUpdate = (data: PackageFormData) => {
    if (!editingPackage) return;
    updatePackage.mutate({ id: editingPackage.id, data }, {
      onSuccess: () => {
        setEditingPackage(null);
        setIsFormOpen(false);
      },
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deletePackage.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  const handleToggleActive = (pkg: SubscriptionPackage) => {
    updatePackage.mutate({ id: pkg.id, data: { is_active: !pkg.is_active } });
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
          <h2 className="text-xl font-semibold">Subscription Packages</h2>
          <p className="text-muted-foreground text-sm">
            Create and manage subscription tiers for sellers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button onClick={() => { setEditingPackage(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && packages && packages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Front-end Preview</CardTitle>
            <CardDescription>This is how packages will appear on the pricing page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {packages.filter(p => p.is_active).map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-xl p-6 border-2 relative"
                  style={{
                    backgroundColor: pkg.bg_color,
                    color: pkg.text_color,
                    borderColor: pkg.is_popular ? pkg.button_color : 'transparent',
                  }}
                >
                  {pkg.is_popular && (
                    <Badge 
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                      style={{ backgroundColor: pkg.button_color, color: pkg.button_text_color }}
                    >
                      Most Popular
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold mb-4">
                    {formatPrice(pkg.price, pkg.currency)}
                    <span className="text-sm font-normal">/{pkg.duration_days} days</span>
                  </p>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li>✓ Up to {pkg.max_ads} ads</li>
                    <li>{pkg.analytics_access ? "✓" : "✗"} Analytics access</li>
                    <li>✓ {pkg.allowed_categories?.length || "All"} categories</li>
                  </ul>
                  <Button 
                    className="w-full"
                    style={{ 
                      backgroundColor: pkg.button_color, 
                      color: pkg.button_text_color 
                    }}
                  >
                    Choose Plan
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packages List */}
      <div className="space-y-3">
        {packages?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No packages created yet</p>
              <Button onClick={() => { setEditingPackage(null); setIsFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Package
              </Button>
            </CardContent>
          </Card>
        )}

        {packages?.map((pkg) => (
          <Card key={pkg.id} className={!pkg.is_active ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="cursor-move text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>
                
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: pkg.button_color }}
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{pkg.name}</h3>
                    {pkg.is_popular && <Badge variant="secondary">Popular</Badge>}
                    {!pkg.is_active && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(pkg.price, pkg.currency)} / {pkg.duration_days} days • 
                    Max {pkg.max_ads} ads • 
                    {pkg.analytics_access ? "Analytics included" : "No analytics"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch 
                    checked={pkg.is_active} 
                    onCheckedChange={() => handleToggleActive(pkg)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => { setEditingPackage(pkg); setIsFormOpen(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setDeleteId(pkg.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <PackageFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        package={editingPackage}
        onSubmit={editingPackage ? handleUpdate : handleCreate}
        isLoading={createPackage.isPending || updatePackage.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this package? This action cannot be undone.
              Sellers with active subscriptions to this package will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPackages;
