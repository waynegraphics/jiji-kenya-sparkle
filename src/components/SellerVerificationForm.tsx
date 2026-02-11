import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerVerification, useSubmitVerification } from "@/hooks/useSellerVerification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, CheckCircle, Clock, XCircle, Shield, Loader2 } from "lucide-react";

const SellerVerificationForm = () => {
  const { user } = useAuth();
  const { data: verification, isLoading } = useSellerVerification();
  const submitVerification = useSubmitVerification();

  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (verification?.status === "approved") {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Verified Seller</h3>
          <p className="text-muted-foreground">Your identity has been verified. You can now post listings.</p>
        </CardContent>
      </Card>
    );
  }

  if (verification?.status === "pending") {
    return (
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="pt-6 text-center">
          <Clock className="h-12 w-12 text-secondary mx-auto mb-3" />
          <h3 className="text-lg font-semibold">Verification Pending</h3>
          <p className="text-muted-foreground">Your documents are being reviewed. This usually takes 24-48 hours.</p>
        </CardContent>
      </Card>
    );
  }

  if (verification?.status === "rejected") {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Verification Rejected</h3>
            {verification.admin_notes && (
              <p className="text-muted-foreground mt-2">Reason: {verification.admin_notes}</p>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">Please re-upload your documents to try again.</p>
        </CardContent>
      </Card>
    );
  }

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${folder}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("verifications").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("verifications").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!idFront || !idBack || !passportPhoto) {
      toast.error("Please upload all required documents");
      return;
    }

    setUploading(true);
    try {
      const [frontUrl, backUrl, photoUrl] = await Promise.all([
        uploadFile(idFront, "id-front"),
        uploadFile(idBack, "id-back"),
        uploadFile(passportPhoto, "passport"),
      ]);

      await submitVerification.mutateAsync({
        id_front_url: frontUrl,
        id_back_url: backUrl,
        passport_photo_url: photoUrl,
      });

      toast.success("Documents submitted for verification!");
    } catch (error) {
      console.error("Verification upload error:", error);
      toast.error("Failed to submit documents. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Seller Verification</CardTitle>
            <CardDescription>
              Upload your ID and passport photo to get verified. This protects our community against spam and fraud.
              Your documents are stored securely and will only be used for verification purposes.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ID Front */}
        <div>
          <label className="block text-sm font-medium mb-1">National ID - Front Side *</label>
          <div
            onClick={() => idFrontRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {idFront ? (
              <p className="text-sm text-primary font-medium">{idFront.name}</p>
            ) : (
              <div className="text-muted-foreground">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <p className="text-sm">Click to upload front of ID</p>
              </div>
            )}
          </div>
          <input ref={idFrontRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && setIdFront(e.target.files[0])} />
        </div>

        {/* ID Back */}
        <div>
          <label className="block text-sm font-medium mb-1">National ID - Back Side *</label>
          <div
            onClick={() => idBackRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {idBack ? (
              <p className="text-sm text-primary font-medium">{idBack.name}</p>
            ) : (
              <div className="text-muted-foreground">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <p className="text-sm">Click to upload back of ID</p>
              </div>
            )}
          </div>
          <input ref={idBackRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && setIdBack(e.target.files[0])} />
        </div>

        {/* Passport Photo */}
        <div>
          <label className="block text-sm font-medium mb-1">Passport Photo *</label>
          <div
            onClick={() => passportRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {passportPhoto ? (
              <p className="text-sm text-primary font-medium">{passportPhoto.name}</p>
            ) : (
              <div className="text-muted-foreground">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <p className="text-sm">Click to upload passport photo</p>
              </div>
            )}
          </div>
          <input ref={passportRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && setPassportPhoto(e.target.files[0])} />
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 inline mr-1" />
          Your documents are encrypted and stored securely. They will not be displayed publicly or shared with third parties.
          Verification is required to protect all users from spam and fraudulent activities.
        </div>

        <Button
          onClick={handleSubmit}
          disabled={uploading || !idFront || !idBack || !passportPhoto}
          className="w-full"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading Documents...</>
          ) : (
            "Submit for Verification"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SellerVerificationForm;
