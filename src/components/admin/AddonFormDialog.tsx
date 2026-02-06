import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Addon, AddonFormData, AddonType } from "@/types/subscriptions";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const addonSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(500, "Description too long"),
  type: z.enum(["bumping", "featured", "promotion"] as const),
  is_active: z.boolean(),
  display_order: z.coerce.number().min(0),
  bg_color: z.string(),
  text_color: z.string(),
});

interface AddonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: Addon | null;
  onSubmit: (data: AddonFormData) => void;
  isLoading: boolean;
}

const addonTypes: { value: AddonType; label: string; description: string }[] = [
  { value: "bumping", label: "Bumping", description: "Push ads to the top of search results" },
  { value: "featured", label: "Featured", description: "Highlight ads with special badge" },
  { value: "promotion", label: "Promotion", description: "Boost visibility across the platform" },
];

const AddonFormDialog = ({
  open,
  onOpenChange,
  addon,
  onSubmit,
  isLoading,
}: AddonFormDialogProps) => {
  const form = useForm<AddonFormData>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "bumping",
      is_active: true,
      display_order: 0,
      bg_color: "#f0f9ff",
      text_color: "#1a1a1a",
    },
  });

  useEffect(() => {
    if (addon) {
      form.reset({
        name: addon.name,
        description: addon.description || "",
        type: addon.type,
        is_active: addon.is_active,
        display_order: addon.display_order,
        bg_color: addon.bg_color,
        text_color: addon.text_color,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        type: "bumping",
        is_active: true,
        display_order: 0,
        bg_color: "#f0f9ff",
        text_color: "#1a1a1a",
      });
    }
  }, [addon, form]);

  const handleSubmit = (data: AddonFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{addon ? "Edit Add-on" : "Create Add-on"}</DialogTitle>
          <DialogDescription>
            {addon ? "Update the add-on details" : "Create a new optional feature for sellers"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add-on Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bump Your Ad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {addonTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Textarea placeholder="Describe what this add-on does..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <FormLabel>Icon Color</FormLabel>
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
                {isLoading ? "Saving..." : addon ? "Update Add-on" : "Create Add-on"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddonFormDialog;
