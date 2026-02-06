import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AddonTier, TierFormData } from "@/types/subscriptions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const tierSchema = z.object({
  addon_id: z.string().min(1, "Addon ID is required"),
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().min(1, "Currency is required"),
  is_active: z.boolean(),
  display_order: z.coerce.number().min(0),
});

interface TierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: AddonTier | null;
  addonId: string;
  onSubmit: (data: TierFormData) => void;
  isLoading: boolean;
}

const TierFormDialog = ({
  open,
  onOpenChange,
  tier,
  addonId,
  onSubmit,
  isLoading,
}: TierFormDialogProps) => {
  const form = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      addon_id: addonId,
      name: "",
      description: "",
      quantity: 1,
      price: 0,
      currency: "KES",
      is_active: true,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (tier) {
      form.reset({
        addon_id: tier.addon_id,
        name: tier.name,
        description: tier.description || "",
        quantity: tier.quantity,
        price: tier.price,
        currency: tier.currency,
        is_active: tier.is_active,
        display_order: tier.display_order,
      });
    } else {
      form.reset({
        addon_id: addonId,
        name: "",
        description: "",
        quantity: 1,
        price: 0,
        currency: "KES",
        is_active: true,
        display_order: 0,
      });
    }
  }, [tier, addonId, form]);

  const handleSubmit = (data: TierFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tier ? "Edit Tier" : "Create Tier"}</DialogTitle>
          <DialogDescription>
            {tier ? "Update the pricing tier details" : "Create a new pricing tier for this add-on"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Single Bump, Starter Pack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>Number of uses included in this tier</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : tier ? "Update Tier" : "Create Tier"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TierFormDialog;
