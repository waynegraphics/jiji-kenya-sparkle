import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Mail, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TeamLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      // Check if user is a team member
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login failed");

      const { data: teamMember } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });

      if (!teamMember && !isAdmin) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You are not authorized to access the team portal. Contact your administrator.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Welcome back!", description: "Redirecting to dashboard..." });
      navigate("/apa/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signUp(regEmail, regPassword, regName);
      if (error) throw error;
      toast({
        title: "Registration Submitted",
        description: "Please check your email to verify your account. An admin must then add you as a team member.",
      });
      setActiveTab("login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">APA Team Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Internal administration access</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="team@apabazaar.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-300">Password</Label>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => setActiveTab("forgot")}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-slate-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="reg-name"
                        placeholder="John Doe"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-slate-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="team@apabazaar.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="reg-password"
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    After registering, an admin must add you as a team member before you can access the portal.
                  </p>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="forgot" className="mt-4">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) throw error;
                    toast({ title: "Reset link sent!", description: "Check your email for the password reset link." });
                    setActiveTab("login");
                    setEmail("");
                  } catch (error: any) {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                  } finally {
                    setIsLoading(false);
                  }
                }} className="space-y-4">
                  <p className="text-sm text-slate-400 text-center">Enter your email and we'll send you a reset link.</p>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-slate-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="team@apabazaar.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : "Send Reset Link"}
                  </Button>
                  <p className="text-center">
                    <button type="button" className="text-sm text-primary hover:underline" onClick={() => setActiveTab("login")}>Back to login</button>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 APA Bazaar Limited — Internal Use Only
        </p>
      </div>
    </div>
  );
};

export default TeamLogin;
