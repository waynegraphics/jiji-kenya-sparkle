import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, ShoppingBag, Store, Info } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

const AuthModal = ({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<"customer" | "seller">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
            if (isAdmin) {
              toast.success("Welcome back, Admin!");
              onClose();
              resetForm();
              navigate('/admin');
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {activeTab === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

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
                {accountType === "seller" && (
                  <div className="flex items-start gap-2 p-2 bg-secondary/10 rounded-md text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 mt-0.5 text-secondary flex-shrink-0" />
                    <span>Sellers need to complete ID verification before posting listings.</span>
                  </div>
                )}
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
            <Label htmlFor="password">Password</Label>
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
            className="w-full bg-primary hover:bg-jiji-green-dark"
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
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
