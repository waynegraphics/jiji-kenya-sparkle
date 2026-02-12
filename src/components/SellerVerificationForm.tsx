import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerVerification, useSubmitVerification } from "@/hooks/useSellerVerification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, CheckCircle, Clock, XCircle, Shield, Loader2, X, ImageIcon } from "lucide-react";

const SellerVerificationForm = () => {
  const { user } = useAuth();
  const { data: verification, isLoading } = useSellerVerification();
  const submitVerification = useSubmitVerification();

  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Preview URLs
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);

  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    file: File | undefined,
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void,
    oldPreview: string | null
  ) => {
    if (!file) return;
    if (oldPreview) URL.revokeObjectURL(oldPreview);
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearFile = (
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void,
    preview: string | null
  ) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

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

  // For rejected status, we show the rejection reason AND the upload form below (no early return)

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${folder}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("verifications").upload(path, file, { upsert: true });
    if (error) throw error;
    return path; // Store the path, not public URL, so admin can generate signed URLs
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

  const renderUploadArea = (
    label: string,
    file: File | null,
    preview: string | null,
    inputRef: React.RefObject<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void
  ) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label} *</label>
      <div
        onClick={() => !file && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg overflow-hidden transition-colors ${
          file ? "border-primary/30" : "cursor-pointer hover:border-primary/50"
        }`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt={label} className="w-full h-40 object-cover" />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="w-7 h-7 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card shadow-sm"
              >
                <ImageIcon className="h-3.5 w-3.5 text-foreground" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile(setFile, setPreview, preview);
                }}
                className="w-7 h-7 bg-destructive/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-destructive shadow-sm"
              >
                <X className="h-3.5 w-3.5 text-destructive-foreground" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-xs text-white truncate">{file?.name}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <Upload className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Click to upload</p>
            <p className="text-xs mt-1">JPG, PNG up to 5MB</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          handleFileChange(e.target.files?.[0], setFile, setPreview, preview)
        }
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Seller Verification</CardTitle>
            <CardDescription>
              {verification?.status === "rejected"
                ? "Your previous submission was rejected. Please re-upload your documents."
                : "Upload your ID and passport photo to get verified. This protects our community against spam and fraud."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {verification?.status === "rejected" && (
        <CardContent className="pt-0 pb-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-destructive">Verification Rejected</p>
                {verification.admin_notes && (
                  <p className="text-sm text-muted-foreground mt-1">Reason: {verification.admin_notes}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">Please re-upload your documents below to try again.</p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
      <CardContent className="space-y-4">
        {renderUploadArea("National ID - Front Side", idFront, idFrontPreview, idFrontRef, setIdFront, setIdFrontPreview)}
        {renderUploadArea("National ID - Back Side", idBack, idBackPreview, idBackRef, setIdBack, setIdBackPreview)}
        {renderUploadArea("Passport Photo", passportPhoto, passportPreview, passportRef, setPassportPhoto, setPassportPreview)}

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
