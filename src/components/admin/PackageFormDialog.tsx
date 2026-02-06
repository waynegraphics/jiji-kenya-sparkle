import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubscriptionPackage, PackageFormData } from "@/types/subscriptions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Constants } from "@/integrations/supabase/types";
import { Checkbox } from "@/components/ui/checkbox";

const packageSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(500, "Description too long"),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().min(1, "Currency is required"),
  duration_days: z.coerce.number().min(1, "Duration must be at least 1 day"),
  max_ads: z.coerce.number().min(1, "Must allow at least 1 ad"),
  analytics_access: z.boolean(),
  allowed_categories: z.array(z.string()),
  is_active: z.boolean(),
  display_order: z.coerce.number().min(0),
  is_popular: z.boolean(),
  bg_color: z.string(),
  text_color: z.string(),
  button_color: z.string(),
  button_text_color: z.string(),
});

interface PackageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: SubscriptionPackage | null;
  onSubmit: (data: PackageFormData) => void;
  isLoading: boolean;
}

const categories = Constants.public.Enums.listing_category;

const PackageFormDialog = ({
  open,
  onOpenChange,
  package: pkg,
  onSubmit,
  isLoading,
}: PackageFormDialogProps) => {
  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "KES",
      duration_days: 30,
      max_ads: 5,
      analytics_access: false,
      allowed_categories: [],
      is_active: true,
      display_order: 0,
      is_popular: false,
      bg_color: "#ffffff",
      text_color: "#1a1a1a",
      button_color: "#16a34a",
      button_text_color: "#ffffff",
    },
  });

  useEffect(() => {
    if (pkg) {
      form.reset({
        name: pkg.name,
        description: pkg.description || "",
        price: pkg.price,
        currency: pkg.currency,
        duration_days: pkg.duration_days,
        max_ads: pkg.max_ads,
        analytics_access: pkg.analytics_access,
        allowed_categories: pkg.allowed_categories || [],
        is_active: pkg.is_active,
        display_order: pkg.display_order,
        is_popular: pkg.is_popular,
        bg_color: pkg.bg_color,
        text_color: pkg.text_color,
        button_color: pkg.button_color,
        button_text_color: pkg.button_text_color,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        currency: "KES",
        duration_days: 30,
        max_ads: 5,
        analytics_access: false,
        allowed_categories: [],
        is_active: true,
        display_order: 0,
        is_popular: false,
        bg_color: "#ffffff",
        text_color: "#1a1a1a",
        button_color: "#16a34a",
        button_text_color: "#ffffff",
      });
    }
  }, [pkg, form]);

  const handleSubmit = (data: PackageFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit Package" : "Create Package"}</DialogTitle>
          <DialogDescription>
            {pkg ? "Update the subscription package details" : "Create a new subscription package for sellers"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="limits">Limits</TabsTrigger>
                <TabsTrigger value="styling">Styling</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Basic, Pro, Enterprise" {...field} />
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
                        <Textarea placeholder="Describe the package benefits..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
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

                  <FormField
                    control={form.control}
                    name="duration_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (days)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
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
                    name="is_popular"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Mark as Popular</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>Lower numbers appear first</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="limits" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="max_ads"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Ads</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>Maximum number of active ads allowed</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="analytics_access"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div>
                        <FormLabel className="!mt-0">Analytics Access</FormLabel>
                        <FormDescription>Allow access to ad performance analytics</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowed_categories"
                  render={() => (
                    <FormItem>
                      <FormLabel>Allowed Categories</FormLabel>
                      <FormDescription>
                        Leave empty to allow all categories
                      </FormDescription>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {categories.map((category) => (
                          <FormField
                            key={category}
                            control={form.control}
                            name="allowed_categories"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(category)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, category]);
                                      } else {
                                        field.onChange(field.value?.filter((v) => v !== category));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="!mt-0 text-sm capitalize">
                                  {category}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="styling" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bg_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                          </FormControl>
                          <Input {...field} className="flex-1" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="text_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Color</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                          </FormControl>
                          <Input {...field} className="flex-1" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="button_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Color</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                          </FormControl>
                          <Input {...field} className="flex-1" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="button_text_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Text Color</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                          </FormControl>
                          <Input {...field} className="flex-1" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : pkg ? "Update Package" : "Create Package"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PackageFormDialog;
