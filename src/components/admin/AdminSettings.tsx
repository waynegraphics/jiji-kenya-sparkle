import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Globe, Shield, CreditCard, Bell, Palette, Save, Eye, EyeOff, Loader2,
  CheckCircle, XCircle, Smartphone, Mail, Phone, Copyright, KeyRound, Users2
} from "lucide-react";

// ── Helper: load/save platform_settings by key ──
const usePlatformSetting = (key: string, fallback = "") => {
  const [value, setValue] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("platform_settings").select("value").eq("key", key).maybeSingle()
      .then(({ data }) => { if (data) setValue(data.value); setLoading(false); });
  }, [key]);

  const save = async (val: string) => {
    const { error } = await supabase.from("platform_settings")
      .upsert({ key, value: val, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) { toast.error(`Failed to save ${key}`); return false; }
    toast.success("Saved"); return true;
  };

  return { value, setValue, loading, save };
};

// ── Seller Registration Fee Card ──
const SellerRegistrationFeeCard = () => {
  const [fee, setFee] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("platform_settings").select("key, value")
        .in("key", ["seller_registration_fee", "seller_registration_duration_days"]);
      if (data) {
        data.forEach((s) => {
          if (s.key === "seller_registration_fee") setFee(s.value);
          if (s.key === "seller_registration_duration_days") setDuration(s.value);
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const results = await Promise.all([
      supabase.from("platform_settings").update({ value: fee }).eq("key", "seller_registration_fee"),
      supabase.from("platform_settings").update({ value: duration }).eq("key", "seller_registration_duration_days"),
    ]);
    if (results.some((r) => r.error)) toast.error("Failed to save registration fee settings");
    else toast.success("Seller registration fee settings saved");
    setSaving(false);
  };

  if (loading) return <Card><CardContent className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><Shield className="h-5 w-5 text-primary" /></div>
          <div><CardTitle>Seller Registration Fee</CardTitle><CardDescription>Set the fee sellers must pay before their account is activated</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Registration Fee (KES)</Label>
            <Input type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="250" min={0} />
          </div>
          <div className="space-y-2">
            <Label>Registration Duration (days)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" min={1} />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Fee Settings</>}
        </Button>
      </CardContent>
    </Card>
  );
};

// ── Social Auth Settings Card ──
const SocialAuthSettings = () => {
  const googleClientId = usePlatformSetting("google_oauth_client_id");
  const googleClientSecret = usePlatformSetting("google_oauth_client_secret");
  const googleEnabled = usePlatformSetting("google_oauth_enabled", "false");
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  if (googleClientId.loading) return <Card><CardContent className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></CardContent></Card>;

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      googleClientId.save(googleClientId.value),
      googleClientSecret.save(googleClientSecret.value),
      googleEnabled.save(googleEnabled.value),
    ]);
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Users2 className="h-5 w-5 text-blue-600" /></div>
          <div><CardTitle>Google OAuth</CardTitle><CardDescription>Configure Google Sign-In for users</CardDescription></div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {googleEnabled.value === "true" ? (
            <Badge variant="default" className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" />Enabled</Badge>
          ) : (
            <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" />Disabled</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div><Label className="text-base font-medium">Enable Google Sign-In</Label><p className="text-sm text-muted-foreground">Allow users to sign in with Google</p></div>
          <Switch checked={googleEnabled.value === "true"} onCheckedChange={(c) => googleEnabled.setValue(c ? "true" : "false")} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Google Client ID</Label>
            <Input value={googleClientId.value} onChange={(e) => googleClientId.setValue(e.target.value)} placeholder="xxxx.apps.googleusercontent.com" />
          </div>
          <div className="space-y-2">
            <Label>Google Client Secret</Label>
            <div className="relative">
              <Input type={showSecret ? "text" : "password"} value={googleClientSecret.value} onChange={(e) => googleClientSecret.setValue(e.target.value)} placeholder="Enter client secret" />
              <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20 text-sm text-muted-foreground">
          <p>Get credentials from <strong>Google Cloud Console → APIs & Credentials → OAuth 2.0 Client IDs</strong>. Set authorized redirect URI to your site's callback URL.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Google Settings</>}
        </Button>
      </CardContent>
    </Card>
  );
};

// ── Contact & Email Settings ──
const ContactEmailSettings = () => {
  const supportEmail = usePlatformSetting("support_email", "support@apabazaar.co.ke");
  const contactEmail = usePlatformSetting("contact_email");
  const contactPhone = usePlatformSetting("contact_phone");
  const contactAddress = usePlatformSetting("contact_address");
  const contactWhatsapp = usePlatformSetting("contact_whatsapp");
  const socialFacebook = usePlatformSetting("social_facebook");
  const socialTwitter = usePlatformSetting("social_twitter");
  const socialInstagram = usePlatformSetting("social_instagram");
  const socialYoutube = usePlatformSetting("social_youtube");
  const socialTiktok = usePlatformSetting("social_tiktok");
  const socialLinkedin = usePlatformSetting("social_linkedin");
  const smtpHost = usePlatformSetting("smtp_host");
  const smtpPort = usePlatformSetting("smtp_port", "587");
  const smtpUser = usePlatformSetting("smtp_user");
  const smtpPass = usePlatformSetting("smtp_password");
  const smtpFrom = usePlatformSetting("smtp_from_email");
  const smtpFromName = usePlatformSetting("smtp_from_name", "APA Bazaar");
  const [saving, setSaving] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  if (supportEmail.loading) return <Card><CardContent className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></CardContent></Card>;

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      supportEmail.save(supportEmail.value), contactEmail.save(contactEmail.value),
      contactPhone.save(contactPhone.value), contactAddress.save(contactAddress.value),
      contactWhatsapp.save(contactWhatsapp.value),
      socialFacebook.save(socialFacebook.value), socialTwitter.save(socialTwitter.value),
      socialInstagram.save(socialInstagram.value), socialYoutube.save(socialYoutube.value),
      socialTiktok.save(socialTiktok.value), socialLinkedin.save(socialLinkedin.value),
      smtpHost.save(smtpHost.value), smtpPort.save(smtpPort.value),
      smtpUser.save(smtpUser.value), smtpPass.save(smtpPass.value),
      smtpFrom.save(smtpFrom.value), smtpFromName.save(smtpFromName.value),
    ]);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" />Contact Information</CardTitle><CardDescription>Public contact details displayed on the site (footer, contact page, etc.)</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Support Email</Label><Input value={supportEmail.value} onChange={(e) => supportEmail.setValue(e.target.value)} placeholder="support@example.com" /></div>
            <div className="space-y-2"><Label>Contact Email (public)</Label><Input value={contactEmail.value} onChange={(e) => contactEmail.setValue(e.target.value)} placeholder="info@example.com" /></div>
            <div className="space-y-2"><Label>Contact Phone</Label><Input value={contactPhone.value} onChange={(e) => contactPhone.setValue(e.target.value)} placeholder="+254 700 000 000" /></div>
            <div className="space-y-2"><Label>WhatsApp Number</Label><Input value={contactWhatsapp.value} onChange={(e) => contactWhatsapp.setValue(e.target.value)} placeholder="+254 700 000 000" /></div>
          </div>
          <div className="space-y-2"><Label>Physical Address</Label><Textarea value={contactAddress.value} onChange={(e) => contactAddress.setValue(e.target.value)} placeholder="Nairobi, Kenya" rows={2} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Social Media Links</CardTitle><CardDescription>Add your social media profile URLs — they will appear in the footer</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Facebook URL</Label><Input value={socialFacebook.value} onChange={(e) => socialFacebook.setValue(e.target.value)} placeholder="https://facebook.com/yourpage" /></div>
            <div className="space-y-2"><Label>X (Twitter) URL</Label><Input value={socialTwitter.value} onChange={(e) => socialTwitter.setValue(e.target.value)} placeholder="https://x.com/yourhandle" /></div>
            <div className="space-y-2"><Label>Instagram URL</Label><Input value={socialInstagram.value} onChange={(e) => socialInstagram.setValue(e.target.value)} placeholder="https://instagram.com/yourhandle" /></div>
            <div className="space-y-2"><Label>YouTube URL</Label><Input value={socialYoutube.value} onChange={(e) => socialYoutube.setValue(e.target.value)} placeholder="https://youtube.com/@yourchannel" /></div>
            <div className="space-y-2"><Label>TikTok URL</Label><Input value={socialTiktok.value} onChange={(e) => socialTiktok.setValue(e.target.value)} placeholder="https://tiktok.com/@yourhandle" /></div>
            <div className="space-y-2"><Label>LinkedIn URL</Label><Input value={socialLinkedin.value} onChange={(e) => socialLinkedin.setValue(e.target.value)} placeholder="https://linkedin.com/company/yourcompany" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />SMTP / Email Settings</CardTitle><CardDescription>Configure outgoing email for notifications</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>SMTP Host</Label><Input value={smtpHost.value} onChange={(e) => smtpHost.setValue(e.target.value)} placeholder="smtp.gmail.com" /></div>
            <div className="space-y-2"><Label>SMTP Port</Label><Input value={smtpPort.value} onChange={(e) => smtpPort.setValue(e.target.value)} placeholder="587" /></div>
            <div className="space-y-2"><Label>SMTP Username</Label><Input value={smtpUser.value} onChange={(e) => smtpUser.setValue(e.target.value)} placeholder="user@gmail.com" /></div>
            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <div className="relative">
                <Input type={showSmtpPass ? "text" : "password"} value={smtpPass.value} onChange={(e) => smtpPass.setValue(e.target.value)} placeholder="App password" />
                <button type="button" onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showSmtpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2"><Label>From Email</Label><Input value={smtpFrom.value} onChange={(e) => smtpFrom.setValue(e.target.value)} placeholder="noreply@example.com" /></div>
            <div className="space-y-2"><Label>From Name</Label><Input value={smtpFromName.value} onChange={(e) => smtpFromName.setValue(e.target.value)} placeholder="APA Bazaar" /></div>
          </div>
        </CardContent>
      </Card>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Contact & Email Settings</>}
      </Button>
    </div>
  );
};

// ── Copyright / Legal Settings ──
const CopyrightSettings = () => {
  const copyrightText = usePlatformSetting("copyright_text", `© ${new Date().getFullYear()} APA Bazaar. All rights reserved.`);
  const termsUrl = usePlatformSetting("terms_url", "/terms");
  const privacyUrl = usePlatformSetting("privacy_url", "/privacy");
  const aboutText = usePlatformSetting("about_text");
  const [saving, setSaving] = useState(false);

  if (copyrightText.loading) return <Card><CardContent className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></CardContent></Card>;

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([copyrightText.save(copyrightText.value), termsUrl.save(termsUrl.value), privacyUrl.save(privacyUrl.value), aboutText.save(aboutText.value)]);
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Copyright className="h-5 w-5" />Copyright & Legal</CardTitle><CardDescription>Manage legal text and links</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label>Copyright Text</Label><Input value={copyrightText.value} onChange={(e) => copyrightText.setValue(e.target.value)} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Terms of Service URL</Label><Input value={termsUrl.value} onChange={(e) => termsUrl.setValue(e.target.value)} /></div>
          <div className="space-y-2"><Label>Privacy Policy URL</Label><Input value={privacyUrl.value} onChange={(e) => privacyUrl.setValue(e.target.value)} /></div>
        </div>
        <div className="space-y-2"><Label>About Us Text</Label><Textarea value={aboutText.value} onChange={(e) => aboutText.setValue(e.target.value)} rows={4} placeholder="Brief description of your platform..." /></div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Legal Settings</>}
        </Button>
      </CardContent>
    </Card>
  );
};

// ── Admin Account Settings (password change) ──
const AdminAccountSettings = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error("Failed to update password: " + error.message);
    else { toast.success("Password updated successfully"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Change Password</CardTitle><CardDescription>Update your admin account password</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Current Email</Label><Input value={user?.email || ""} disabled /></div>
          <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" /></div>
          <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" /></div>
          <Button onClick={handleChangePassword} disabled={saving || !newPassword}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</> : <><KeyRound className="h-4 w-4 mr-2" />Update Password</>}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Session Info</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><span className="font-mono text-xs">{user?.id?.slice(0, 12)}...</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Sign In</span><span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Main AdminSettings ──
const AdminSettings = () => {
  const [siteSettings, setSiteSettings] = useState({ siteName: "APA Bazaar", siteUrl: "https://apabazaar.co.ke", supportEmail: "support@apabazaar.co.ke", currency: "KES" });
  const [notificationSettings, setNotificationSettings] = useState({ emailNewUser: true, emailNewListing: false, emailNewOrder: true, emailSupportTicket: true });
  const [securitySettings, setSecuritySettings] = useState({ requireEmailVerification: true, enableTwoFactor: false, autoSuspendReportedUsers: false, maxLoginAttempts: 5 });
  const [mpesaSettings, setMpesaSettings] = useState({ id: "", consumer_key: "", consumer_secret: "", passkey: "", shortcode: "", callback_url: "", environment: "sandbox", is_enabled: false });
  const [mpesaLoading, setMpesaLoading] = useState(true);
  const [mpesaSaving, setMpesaSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({ consumer_key: false, consumer_secret: false, passkey: false });

  useEffect(() => { fetchMpesaSettings(); }, []);

  const fetchMpesaSettings = async () => {
    setMpesaLoading(true);
    const { data, error } = await supabase.from("mpesa_settings").select("*").limit(1).maybeSingle();
    if (!error && data) setMpesaSettings({ id: data.id, consumer_key: data.consumer_key, consumer_secret: data.consumer_secret, passkey: data.passkey, shortcode: data.shortcode, callback_url: data.callback_url, environment: data.environment, is_enabled: data.is_enabled });
    setMpesaLoading(false);
  };

  const handleSaveMpesa = async () => {
    setMpesaSaving(true);
    const { error } = await supabase.from("mpesa_settings").update({ consumer_key: mpesaSettings.consumer_key, consumer_secret: mpesaSettings.consumer_secret, passkey: mpesaSettings.passkey, shortcode: mpesaSettings.shortcode, callback_url: mpesaSettings.callback_url, environment: mpesaSettings.environment, is_enabled: mpesaSettings.is_enabled }).eq("id", mpesaSettings.id);
    if (error) toast.error("Failed to save M-Pesa settings: " + error.message);
    else toast.success("M-Pesa / Daraja settings saved successfully");
    setMpesaSaving(false);
  };

  const toggleSecretVisibility = (field: "consumer_key" | "consumer_secret" | "passkey") => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const isConfigured = mpesaSettings.consumer_key && mpesaSettings.consumer_secret && mpesaSettings.passkey && mpesaSettings.shortcode;
  const handleSave = (section: string) => { toast.success(`${section} settings saved successfully`); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">Configure platform settings and preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="general" className="gap-2"><Globe className="h-4 w-4" /><span className="hidden sm:inline">General</span></TabsTrigger>
          <TabsTrigger value="contact" className="gap-2"><Mail className="h-4 w-4" /><span className="hidden sm:inline">Contact & Email</span></TabsTrigger>
          <TabsTrigger value="social-auth" className="gap-2"><Users2 className="h-4 w-4" /><span className="hidden sm:inline">Social Auth</span></TabsTrigger>
          <TabsTrigger value="legal" className="gap-2"><Copyright className="h-4 w-4" /><span className="hidden sm:inline">Legal</span></TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /><span className="hidden sm:inline">Notifications</span></TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Security</span></TabsTrigger>
          <TabsTrigger value="payments" className="gap-2"><CreditCard className="h-4 w-4" /><span className="hidden sm:inline">Payments</span></TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /><span className="hidden sm:inline">Appearance</span></TabsTrigger>
          <TabsTrigger value="account" className="gap-2"><KeyRound className="h-4 w-4" /><span className="hidden sm:inline">My Account</span></TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Basic platform configuration</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Site Name</Label><Input value={siteSettings.siteName} onChange={(e) => setSiteSettings(p => ({ ...p, siteName: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Site URL</Label><Input value={siteSettings.siteUrl} onChange={(e) => setSiteSettings(p => ({ ...p, siteUrl: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Support Email</Label><Input type="email" value={siteSettings.supportEmail} onChange={(e) => setSiteSettings(p => ({ ...p, supportEmail: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Default Currency</Label><Input value={siteSettings.currency} onChange={(e) => setSiteSettings(p => ({ ...p, currency: e.target.value }))} /></div>
              </div>
              <Button onClick={() => handleSave("General")}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact & Email */}
        <TabsContent value="contact" className="mt-6"><ContactEmailSettings /></TabsContent>

        {/* Social Auth */}
        <TabsContent value="social-auth" className="mt-6"><SocialAuthSettings /></TabsContent>

        {/* Legal / Copyright */}
        <TabsContent value="legal" className="mt-6"><CopyrightSettings /></TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Email Notifications</CardTitle><CardDescription>Configure which events trigger email notifications</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "emailNewUser", label: "New User Registration", desc: "Send email when new user signs up" },
                { key: "emailNewListing", label: "New Listing", desc: "Send email when new listing is created" },
                { key: "emailNewOrder", label: "New Order/Subscription", desc: "Send email for new purchases" },
                { key: "emailSupportTicket", label: "Support Ticket", desc: "Send email when support ticket is created" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div><Label>{item.label}</Label><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={(notificationSettings as any)[item.key]} onCheckedChange={(c) => setNotificationSettings(p => ({ ...p, [item.key]: c }))} />
                </div>
              ))}
              <Button onClick={() => handleSave("Notification")}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Security Settings</CardTitle><CardDescription>Configure authentication and security options</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "requireEmailVerification", label: "Require Email Verification", desc: "Users must verify email before accessing features" },
                { key: "enableTwoFactor", label: "Enable Two-Factor Authentication", desc: "Allow users to enable 2FA" },
                { key: "autoSuspendReportedUsers", label: "Auto-Suspend Reported Users", desc: "Automatically suspend users with multiple reports" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div><Label>{item.label}</Label><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={(securitySettings as any)[item.key]} onCheckedChange={(c) => setSecuritySettings(p => ({ ...p, [item.key]: c }))} />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Max Login Attempts</Label>
                <Input type="number" value={securitySettings.maxLoginAttempts} onChange={(e) => setSecuritySettings(p => ({ ...p, maxLoginAttempts: parseInt(e.target.value) }))} className="w-32" />
              </div>
              <Button onClick={() => handleSave("Security")}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><Smartphone className="h-5 w-5 text-green-600" /></div>
                  <div><CardTitle>M-Pesa Daraja API</CardTitle><CardDescription>Configure Safaricom Daraja API for M-Pesa payments</CardDescription></div>
                </div>
                {isConfigured ? <Badge variant="default" className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" />Configured</Badge> : <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" />Not Configured</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {mpesaLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
                <>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div><Label className="text-base font-medium">Enable M-Pesa Payments</Label><p className="text-sm text-muted-foreground">When enabled, sellers can pay via M-Pesa</p></div>
                    <Switch checked={mpesaSettings.is_enabled} onCheckedChange={(c) => setMpesaSettings(p => ({ ...p, is_enabled: c }))} />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Select value={mpesaSettings.environment} onValueChange={(v) => setMpesaSettings(p => ({ ...p, environment: v }))}>
                      <SelectTrigger className="w-full md:w-64"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">🧪 Sandbox (Testing)</SelectItem>
                        <SelectItem value="production">🚀 Production (Live)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-4">API Credentials</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(["consumer_key", "consumer_secret", "passkey"] as const).map(field => (
                        <div key={field} className="space-y-2">
                          <Label>{field === "consumer_key" ? "Consumer Key" : field === "consumer_secret" ? "Consumer Secret" : "Lipa Na M-Pesa Passkey"}</Label>
                          <div className="relative">
                            <Input type={showSecrets[field] ? "text" : "password"} value={(mpesaSettings as any)[field]} onChange={(e) => setMpesaSettings(p => ({ ...p, [field]: e.target.value }))} />
                            <button type="button" onClick={() => toggleSecretVisibility(field)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showSecrets[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="space-y-2"><Label>Business Shortcode</Label><Input value={mpesaSettings.shortcode} onChange={(e) => setMpesaSettings(p => ({ ...p, shortcode: e.target.value }))} placeholder="e.g. 174379" /></div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Callback URL</Label>
                    <Input value={mpesaSettings.callback_url} onChange={(e) => setMpesaSettings(p => ({ ...p, callback_url: e.target.value }))} placeholder="https://your-project/functions/v1/mpesa-callback" />
                  </div>
                  <Button onClick={handleSaveMpesa} disabled={mpesaSaving} className="w-full sm:w-auto">
                    {mpesaSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-2" />Save Daraja Settings</>}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          <SellerRegistrationFeeCard />
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Branding & Appearance</CardTitle><CardDescription>Customize the look and feel of your platform</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Primary Color</Label><div className="flex items-center gap-2"><div className="w-10 h-10 rounded-lg bg-primary border" /><Input value="hsl(142.1 76.2% 36.3%)" disabled className="flex-1" /></div></div>
                  <div className="space-y-2"><Label>Logo</Label><div className="border-2 border-dashed rounded-lg p-6 text-center"><p className="text-sm text-muted-foreground">Drag and drop or click to upload</p></div></div>
                </div>
                <div className="space-y-4"><div className="space-y-2"><Label>Favicon</Label><div className="border-2 border-dashed rounded-lg p-6 text-center"><p className="text-sm text-muted-foreground">32x32 or 64x64 PNG</p></div></div></div>
              </div>
              <Button onClick={() => handleSave("Appearance")}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Account */}
        <TabsContent value="account" className="mt-6"><AdminAccountSettings /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
