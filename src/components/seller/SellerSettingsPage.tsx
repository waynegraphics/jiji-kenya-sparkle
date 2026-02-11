import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LocationSelector from "@/components/LocationSelector";
import { toast } from "sonner";
import { Camera, Loader2, Settings, Lock, Trash2, AlertTriangle, Building2, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SellerSettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Account type fields
  const [accountType, setAccountType] = useState((profile as any)?.account_type || "customer");
  const [businessName, setBusinessName] = useState((profile as any)?.business_name || "");
  const [whatsappNumber, setWhatsappNumber] = useState((profile as any)?.whatsapp_number || "");

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sync with profile on load
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setAccountType((profile as any).account_type || "customer");
      setBusinessName((profile as any).business_name || "");
      setWhatsappNumber((profile as any).whatsapp_number || "");
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error } = await supabase.storage.from("listings").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("listings").getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl);
      toast.success("Avatar uploaded");
    } catch { toast.error("Failed to upload avatar"); }
    finally { setUploadingAvatar(false); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updateData: any = {
        display_name: displayName,
        phone,
        location,
        bio,
        avatar_url: avatarUrl,
        account_type: accountType,
        whatsapp_number: whatsappNumber || null,
        business_name: accountType === "business" ? businessName : null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user!.id);

      if (error) throw error;
      toast.success("Profile updated");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(newPassword)) { toast.error("Password must contain at least one uppercase letter"); return; }
    if (!/[0-9]/.test(newPassword)) { toast.error("Password must contain at least one number"); return; }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password changed successfully");
      setNewPassword(""); setConfirmPassword("");
    } catch (e: any) { toast.error(e.message || "Failed to change password"); }
    finally { setChangingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' to confirm");
      return;
    }
    if (!deletePassword || deletePassword.length < 6) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }
    setDeletingAccount(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: deletePassword,
      });
      if (signInError) {
        toast.error("Incorrect password. Account deletion cancelled.");
        return;
      }

      await supabase.from("profiles").update({
        display_name: "Deleted User",
        bio: null,
        phone: null,
        avatar_url: null,
        location: null,
        business_name: null,
        whatsapp_number: null,
      }).eq("user_id", user!.id);

      await supabase.from("base_listings").update({ status: "deleted" }).eq("user_id", user!.id);
      await supabase.auth.signOut();
      toast.success("Your account has been deleted.");
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Account Settings</h2>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><Settings className="h-4 w-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="account"><Building2 className="h-4 w-4 mr-2" />Account Type</TabsTrigger>
          <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2" />Security</TabsTrigger>
          <TabsTrigger value="danger"><Trash2 className="h-4 w-4 mr-2" />Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl">{displayName?.charAt(0) || "S"}</AvatarFallback>
                  </Avatar>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5">
                    {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div>
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Display Name</Label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
                <div><Label>Phone Number</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254..." /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>WhatsApp Number</Label><Input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+254..." /></div>
              </div>
              <div>
                <Label>Location</Label>
                <LocationSelector
                  onLocationChange={(county, town) => setLocation(town ? `${county}, ${town}` : county)}
                  compact
                />
              </div>
              <div><Label>Bio</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell buyers about yourself..." /></div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Type Tab */}
        <TabsContent value="account" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Type</CardTitle>
              <CardDescription>Choose whether you're a customer, individual seller, or business.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: "customer", label: "Customer", desc: "Browse and buy items", icon: <User className="h-5 w-5" /> },
                  { value: "seller", label: "Individual Seller", desc: "Sell as a private individual", icon: <User className="h-5 w-5" /> },
                  { value: "business", label: "Business", desc: "Sell as a registered business", icon: <Building2 className="h-5 w-5" /> },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAccountType(opt.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      accountType === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {opt.icon}
                      <span className="font-semibold">{opt.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {accountType === "business" && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label>Business Name *</Label>
                    <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your business name" />
                    <p className="text-xs text-muted-foreground mt-1">This will be displayed publicly on your listings and profile.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Business Phone</Label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254..." />
                    </div>
                    <div>
                      <Label>Business WhatsApp</Label>
                      <Input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+254..." />
                    </div>
                  </div>
                </div>
              )}

              {accountType === "seller" && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Phone Number</Label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254..." />
                    </div>
                    <div>
                      <Label>WhatsApp Number</Label>
                      <Input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+254..." />
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Account Type
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Password must be at least 8 characters with one uppercase letter and one number.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div>
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
              {newPassword && (
                <div className="text-xs space-y-1">
                  <p className={newPassword.length >= 8 ? "text-green-600" : "text-destructive"}>
                    {newPassword.length >= 8 ? "✓" : "✗"} At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(newPassword) ? "text-green-600" : "text-destructive"}>
                    {/[A-Z]/.test(newPassword) ? "✓" : "✗"} One uppercase letter
                  </p>
                  <p className={/[0-9]/.test(newPassword) ? "text-green-600" : "text-destructive"}>
                    {/[0-9]/.test(newPassword) ? "✓" : "✗"} One number
                  </p>
                  <p className={newPassword === confirmPassword && confirmPassword ? "text-green-600" : "text-destructive"}>
                    {newPassword === confirmPassword && confirmPassword ? "✓" : "✗"} Passwords match
                  </p>
                </div>
              )}
              <Button onClick={handlePasswordChange} disabled={changingPassword}>
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Sign out of all other devices.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={async () => {
                await supabase.auth.signOut({ scope: "others" });
                toast.success("Signed out of all other sessions");
              }}>
                Sign Out Other Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="mt-4">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Delete Account
              </CardTitle>
              <CardDescription>
                This action is permanent. All your listings will be removed and your profile data will be erased.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div>
                <Label>Enter your password to confirm</Label>
                <Input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Your current password" />
              </div>
              <div>
                <Label>Type "DELETE MY ACCOUNT" to confirm</Label>
                <Input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="DELETE MY ACCOUNT" className="font-mono" />
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleteConfirmText !== "DELETE MY ACCOUNT" || !deletePassword}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account, remove all your listings, and sign you out.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deletingAccount}>
                      {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerSettingsPage;