import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Settings, 
  Globe, 
  Mail, 
  Shield, 
  CreditCard,
  Bell,
  Palette,
  Save
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

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

        {/* Payment Settings */}
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Configure payment integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">M-Pesa</h4>
                      <p className="text-sm text-muted-foreground">Mobile money payments</p>
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>
                <p className="text-sm text-muted-foreground">
                  M-Pesa integration is configured via Cloud secrets. Contact support to update credentials.
                </p>
              </div>
              
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
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to upload
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        32x32 or 64x64 PNG
                      </p>
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