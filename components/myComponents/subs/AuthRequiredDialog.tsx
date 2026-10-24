"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, LogIn, UserPlus, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAppContext } from "@/hooks/useAppContext";
import { googleSignIn } from "./googlesignin";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export const AuthRequiredDialog: React.FC<AuthRequiredDialogProps> = ({
  open,
  onOpenChange,
  title = "Account Required",
  description = "Only logged in cathedral members can create posts, events, or testimonies. Please sign in or create an account to proceed.",
}) => {
  const { setUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Sign Up Form State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDepartment, setSignupDepartment] = useState("member");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await axios.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      const userData = res.data;
      setUser({
        ...userData,
        username: userData.username || userData.name || "visitor",
        avatarUrl: userData.avatarUrl || "",
        role: userData.role || "user",
        department: userData.department || "nil",
        contact: userData.contact || "xxxx",
      });

      toast.success(`Welcome back, ${userData.username || userData.name || "Beloved"}!`);
      onOpenChange(false);
    } catch (err: any) {
      setLoginError(err?.response?.data?.error || "Invalid credentials. Please check your details.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);

    try {
      await axios.post("/api/dbhandler?model=users", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        department: signupDepartment,
      });

      const loginResponse = await axios.post("/api/auth/login", {
        email: signupEmail,
        password: signupPassword,
      });

      const createdUser = loginResponse.data;
      setUser({
        ...createdUser,
        username: createdUser.username || createdUser.name || signupName || "visitor",
        avatarUrl: createdUser.avatarUrl || "",
        role: createdUser.role || "user",
        department: createdUser.department || signupDepartment,
        contact: createdUser.contact || "xxxx",
      });

      toast.success(`Hallelujah! Account created for ${signupName || "Beloved"}.`);
      onOpenChange(false);
    } catch (err: any) {
      setSignupError(err?.response?.data?.error || "Could not create account. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-accent mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Cathedral Access
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Segmented Auth Selector */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-secondary/50 rounded-xl my-2 border border-border/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setLoginError("");
              setSignupError("");
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200",
              activeTab === "signin"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LogIn className="w-3.5 h-3.5 text-accent" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setLoginError("");
              setSignupError("");
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200",
              activeTab === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserPlus className="w-3.5 h-3.5 text-accent" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Tab 1: Sign In */}
        {activeTab === "signin" && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 mt-1">
            {loginError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground/80 block mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="bg-background/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 block mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="bg-background/60"
              />
            </div>

            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center justify-center gap-2 shadow-md shadow-accent/20 transition-all mt-2"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </form>
        )}

        {/* Tab 2: Create Account */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignupSubmit} className="space-y-3 mt-1">
            {signupError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-medium">
                {signupError}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground/80 block mb-1">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Sister Mary / Brother John"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
                className="bg-background/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 block mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                className="bg-background/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 block mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                className="bg-background/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 block mb-1">
                Department / Fellowship
              </label>
              <select
                value={signupDepartment}
                onChange={(e) => setSignupDepartment(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background/60 text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="member">Cathedral Member</option>
                <option value="choir">Choir / Drummers</option>
                <option value="youth">Youth Fellowship</option>
                <option value="worker">Church Worker</option>
                <option value="parochial">Parochial Committee</option>
                <option value="elder">Cathedral Elder</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={signupLoading}
              className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center justify-center gap-2 shadow-md shadow-accent/20 transition-all mt-2"
            >
              {signupLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </Button>
          </form>
        )}

        {/* Social Google Auth Option */}
        <div className="pt-2 border-t border-border/60">
          <form action={googleSignIn}>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-10 rounded-xl flex items-center justify-center gap-2 border-border/80 hover:bg-muted/60 text-xs sm:text-sm font-medium"
            >
              <FcGoogle className="h-4 w-4 shrink-0" />
              <span>Continue with Google</span>
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredDialog;
