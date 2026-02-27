import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, ShoppingBag, Store, Info } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

const AuthModal = ({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<"customer" | "seller">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin after OAuth login
  useEffect(() => {
    const checkAdminAfterOAuth = async () => {
      if (user && isOpen) {
        const { data: teamMember } = await supabase
          .from("team_members")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();

        const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });

        if (teamMember || isAdmin) {
          await supabase.auth.signOut();
          toast.error("Admins must login through the admin portal");
          onClose();
          navigate('/apa/login');
        }
      }
    };

    checkAdminAfterOAuth();
  }, [user, isOpen, navigate, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          // Check if user is admin or team member
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: teamMember } = await supabase
              .from("team_members")
              .select("*")
              .eq("user_id", user.id)
              .eq("is_active", true)
              .maybeSingle();

            const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });

            if (teamMember || isAdmin) {
              // Sign out admin/team members who try to login through frontend
              await supabase.auth.signOut();
              toast.error("Admins must login through the admin portal");
              onClose();
              resetForm();
              navigate('/apa/login');
              return;
            }
          }

          toast.success("Welcome back!");
          onClose();
          resetForm();
          navigate('/seller-dashboard');
        }
      } else {
        if (!displayName.trim()) {
          toast.error("Please enter your name");
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast.error(error.message);
        } else {
          // Update the profile with account_type after signup
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("profiles")
              .update({ account_type: accountType })
              .eq("user_id", user.id);
          }

          if (accountType === "seller") {
            toast.success("Account created! Please verify your email, then complete seller verification.");
          } else {
            toast.success("Account created! Check your email to verify.");
          }
          onClose();
          resetForm();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setAccountType("customer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {activeTab === "login" ? "Welcome Back" : activeTab === "register" ? "Create Account" : "Reset Password"}
          </DialogTitle>
        </DialogHeader>

        {activeTab === "forgot" ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              if (error) {
                toast.error(error.message);
              } else {
                toast.success("Password reset link sent! Check your email.");
                setActiveTab("login");
                setEmail("");
              }
            } finally {
              setIsLoading(false);
            }
          }} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Enter your email and we'll send you a link to reset your password.</p>
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="resetEmail" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-apa-green-dark" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : "Send Reset Link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <button type="button" className="text-primary font-medium hover:underline" onClick={() => setActiveTab("login")}>Back to login</button>
            </p>
          </form>
        ) : (
        <>
        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1 mb-4">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "register"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "register" && (
            <>
              {/* Account Type Selection */}
              <div className="space-y-2">
                <Label>I want to join as</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType("customer")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      accountType === "customer"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <ShoppingBag className={`h-6 w-6 mx-auto mb-1 ${accountType === "customer" ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-medium text-sm">Customer</p>
                    <p className="text-xs text-muted-foreground">Browse & buy</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("seller")}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      accountType === "seller"
                        ? "border-secondary bg-secondary/5"
                        : "border-border hover:border-secondary/30"
                    }`}
                  >
                    <Store className={`h-6 w-6 mx-auto mb-1 ${accountType === "seller" ? "text-secondary" : "text-muted-foreground"}`} />
                    <p className="font-medium text-sm">Seller</p>
                    <p className="text-xs text-muted-foreground">List & sell items</p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {activeTab === "login" && (
                <button type="button" className="text-xs text-primary hover:underline" onClick={() => setActiveTab("forgot")}>Forgot password?</button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-apa-green-dark"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {activeTab === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              activeTab === "login" ? "Sign In" : "Create Account"
            )}
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                const { error } = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (error) {
                  toast.error(error.message);
                } else {
                  // Check admin status after OAuth redirect
                  // This will be handled by the auth state change listener
                  // We'll add a check in useEffect to handle this
                }
              } catch (err: any) {
                toast.error(err.message || "Google sign-in failed");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {activeTab === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={() => setActiveTab("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={() => setActiveTab("login")}
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {activeTab === "login" && (
          <p className="text-center text-xs text-muted-foreground">
            Want to sell?{" "}
            <button
              type="button"
              className="text-secondary font-medium hover:underline"
              onClick={() => setActiveTab("register")}
            >
              Apply as a seller
            </button>
          </p>
        )}
        </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
