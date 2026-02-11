import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag } from "lucide-react";
import { toast } from "sonner";

interface ReportAdDialogProps {
  listingId: string;
  onAuthRequired: () => void;
}

const REPORT_REASONS = [
  "Spam or misleading",
  "Prohibited item",
  "Duplicate listing",
  "Wrong category",
  "Offensive content",
  "Suspected fraud/scam",
  "Other",
];

const ReportAdDialog = ({ listingId, onAuthRequired }: ReportAdDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user!.id,
      reported_listing_id: listingId,
      report_type: "listing",
      reason,
      description: description || null,
    });

    if (error) {
      toast.error("Failed to submit report");
    } else {
      toast.success("Report submitted. We'll review it shortly.");
      setOpen(false);
      setReason("");
      setDescription("");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <Flag className="h-4 w-4" />
          Report this ad
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((r) => (
              <div key={r} className="flex items-center space-x-2">
                <RadioGroupItem value={r} id={r} />
                <Label htmlFor={r} className="text-sm cursor-pointer">
                  {r}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div>
            <Label>Additional details (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context..."
              rows={3}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !reason}
            className="w-full"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportAdDialog;
