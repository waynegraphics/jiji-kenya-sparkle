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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Globe, 
  Shield, 
  CreditCard,
  Bell,
  Palette,
  Save,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Smartphone
} from "lucide-react";

const AdminSettings = () => {
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Jiji Kenya",
    siteUrl: "https://jiji-kenya-sparkle.lovable.app",
    supportEmail: "support@jiji.co.ke",
    currency: "KES"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewUser: true,
    emailNewListing: false,
    emailNewOrder: true,
    emailSupportTicket: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    enableTwoFactor: false,
    autoSuspendReportedUsers: false,
    maxLoginAttempts: 5
  });

  // Daraja / M-Pesa settings
  const [mpesaSettings, setMpesaSettings] = useState({
    id: "",
    consumer_key: "",
    consumer_secret: "",
    passkey: "",
    shortcode: "",
    callback_url: "",
    environment: "sandbox",
    is_enabled: false,
  });
  const [mpesaLoading, setMpesaLoading] = useState(true);
  const [mpesaSaving, setMpesaSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    consumer_key: false,
    consumer_secret: false,
    passkey: false,
  });

  useEffect(() => {
    fetchMpesaSettings();
  }, []);

  const fetchMpesaSettings = async () => {
    setMpesaLoading(true);
    const { data, error } = await supabase
      .from("mpesa_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setMpesaSettings({
        id: data.id,
        consumer_key: data.consumer_key,
        consumer_secret: data.consumer_secret,
        passkey: data.passkey,
        shortcode: data.shortcode,
        callback_url: data.callback_url,
        environment: data.environment,
        is_enabled: data.is_enabled,
      });
    }
    setMpesaLoading(false);
  };

  const handleSaveMpesa = async () => {
    setMpesaSaving(true);
    const { error } = await supabase
      .from("mpesa_settings")
      .update({
        consumer_key: mpesaSettings.consumer_key,
        consumer_secret: mpesaSettings.consumer_secret,
        passkey: mpesaSettings.passkey,
        shortcode: mpesaSettings.shortcode,
        callback_url: mpesaSettings.callback_url,
        environment: mpesaSettings.environment,
        is_enabled: mpesaSettings.is_enabled,
      })
      .eq("id", mpesaSettings.id);

    if (error) {
      toast.error("Failed to save M-Pesa settings: " + error.message);
    } else {
      toast.success("M-Pesa / Daraja settings saved successfully");
    }
    setMpesaSaving(false);
  };

  const toggleSecretVisibility = (field: "consumer_key" | "consumer_secret" | "passkey") => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const isConfigured = mpesaSettings.consumer_key && mpesaSettings.consumer_secret && mpesaSettings.passkey && mpesaSettings.shortcode;

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">Configure platform settings and preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input 
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings(p => ({ ...p, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Site URL</Label>
                  <Input 
                    value={siteSettings.siteUrl}
                    onChange={(e) => setSiteSettings(p => ({ ...p, siteUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input 
                    type="email"
                    value={siteSettings.supportEmail}
                    onChange={(e) => setSiteSettings(p => ({ ...p, supportEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Input 
                    value={siteSettings.currency}
                    onChange={(e) => setSiteSettings(p => ({ ...p, currency: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("General")}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure which events trigger email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New User Registration</Label>
                  <p className="text-sm text-muted-foreground">Send email when new user signs up</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailNewUser}
                  onCheckedChange={(checked) => setNotificationSettings(p => ({ ...p, emailNewUser: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Listing</Label>
                  <p className="text-sm text-muted-foreground">Send email when new listing is created</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailNewListing}
                  onCheckedChange={(checked) => setNotificationSettings(p => ({ ...p, emailNewListing: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Order/Subscription</Label>
                  <p className="text-sm text-muted-foreground">Send email for new purchases</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailNewOrder}
                  onCheckedChange={(checked) => setNotificationSettings(p => ({ ...p, emailNewOrder: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Support Ticket</Label>
                  <p className="text-sm text-muted-foreground">Send email when support ticket is created</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailSupportTicket}
                  onCheckedChange={(checked) => setNotificationSettings(p => ({ ...p, emailSupportTicket: checked }))}
                />
              </div>
              <Button onClick={() => handleSave("Notification")}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure authentication and security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify email before accessing features</p>
                </div>
                <Switch 
                  checked={securitySettings.requireEmailVerification}
                  onCheckedChange={(checked) => setSecuritySettings(p => ({ ...p, requireEmailVerification: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Allow users to enable 2FA</p>
                </div>
                <Switch 
                  checked={securitySettings.enableTwoFactor}
                  onCheckedChange={(checked) => setSecuritySettings(p => ({ ...p, enableTwoFactor: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Suspend Reported Users</Label>
                  <p className="text-sm text-muted-foreground">Automatically suspend users with multiple reports</p>
                </div>
                <Switch 
                  checked={securitySettings.autoSuspendReportedUsers}
                  onCheckedChange={(checked) => setSecuritySettings(p => ({ ...p, autoSuspendReportedUsers: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Login Attempts</Label>
                <Input 
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings(p => ({ ...p, maxLoginAttempts: parseInt(e.target.value) }))}
                  className="w-32"
                />
              </div>
              <Button onClick={() => handleSave("Security")}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings - Daraja / M-Pesa */}
        <TabsContent value="payments" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>M-Pesa Daraja API</CardTitle>
                    <CardDescription>Configure Safaricom Daraja API for M-Pesa payments</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConfigured ? (
                    <Badge variant="default" className="bg-green-600 gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Configured
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {mpesaLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="text-base font-medium">Enable M-Pesa Payments</Label>
                      <p className="text-sm text-muted-foreground">
                        When enabled, sellers can pay for subscriptions and add-ons via M-Pesa
                      </p>
                    </div>
                    <Switch
                      checked={mpesaSettings.is_enabled}
                      onCheckedChange={(checked) => setMpesaSettings(p => ({ ...p, is_enabled: checked }))}
                    />
                  </div>

                  <Separator />

                  {/* Environment Selection */}
                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Select
                      value={mpesaSettings.environment}
                      onValueChange={(value) => setMpesaSettings(p => ({ ...p, environment: value }))}
                    >
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">🧪 Sandbox (Testing)</SelectItem>
                        <SelectItem value="production">🚀 Production (Live)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {mpesaSettings.environment === "sandbox"
                        ? "Uses sandbox.safaricom.co.ke — no real money is charged"
                        : "Uses api.safaricom.co.ke — real transactions will be processed"}
                    </p>
                  </div>

                  <Separator />

                  {/* API Credentials */}
                  <div>
                    <h4 className="text-sm font-semibold mb-4">API Credentials</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Consumer Key</Label>
                        <div className="relative">
                          <Input
                            type={showSecrets.consumer_key ? "text" : "password"}
                            value={mpesaSettings.consumer_key}
                            onChange={(e) => setMpesaSettings(p => ({ ...p, consumer_key: e.target.value }))}
                            placeholder="Enter consumer key from Daraja portal"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility("consumer_key")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showSecrets.consumer_key ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Consumer Secret</Label>
                        <div className="relative">
                          <Input
                            type={showSecrets.consumer_secret ? "text" : "password"}
                            value={mpesaSettings.consumer_secret}
                            onChange={(e) => setMpesaSettings(p => ({ ...p, consumer_secret: e.target.value }))}
                            placeholder="Enter consumer secret from Daraja portal"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility("consumer_secret")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showSecrets.consumer_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Lipa Na M-Pesa Passkey</Label>
                        <div className="relative">
                          <Input
                            type={showSecrets.passkey ? "text" : "password"}
                            value={mpesaSettings.passkey}
                            onChange={(e) => setMpesaSettings(p => ({ ...p, passkey: e.target.value }))}
                            placeholder="Enter Lipa Na M-Pesa passkey"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility("passkey")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showSecrets.passkey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Business Shortcode</Label>
                        <Input
                          value={mpesaSettings.shortcode}
                          onChange={(e) => setMpesaSettings(p => ({ ...p, shortcode: e.target.value }))}
                          placeholder="e.g. 174379"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Callback URL */}
                  <div className="space-y-2">
                    <Label>Callback URL</Label>
                    <Input
                      value={mpesaSettings.callback_url}
                      onChange={(e) => setMpesaSettings(p => ({ ...p, callback_url: e.target.value }))}
                      placeholder="https://your-project.supabase.co/functions/v1/mpesa-callback"
                    />
                    <p className="text-xs text-muted-foreground">
                      The URL Safaricom will call after payment. This should point to your mpesa-callback backend function.
                    </p>
                  </div>

                  <Separator />

                  {/* Linked Info */}
                  <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      Linked to Subscription Packages
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      These Daraja settings are used for all subscription package payments and add-on purchases. 
                      When a seller subscribes or purchases add-ons, an STK push will be sent to their phone using these credentials.
                    </p>
                  </div>

                  <Button onClick={handleSaveMpesa} disabled={mpesaSaving} className="w-full sm:w-auto">
                    {mpesaSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Daraja Settings
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Other Gateways */}
          <Card>
            <CardHeader>
              <CardTitle>Other Payment Gateways</CardTitle>
              <CardDescription>Additional payment integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border opacity-60">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Stripe</h4>
                      <p className="text-sm text-muted-foreground">Card payments</p>
                    </div>
                  </div>
                  <Switch checked={false} disabled />
                </div>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary border" />
                      <Input value="hsl(142.1 76.2% 36.3%)" disabled className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground">32x32 or 64x64 PNG</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSave("Appearance")}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
