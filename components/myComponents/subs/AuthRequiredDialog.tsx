"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogIn, UserPlus } from "lucide-react";
import Login from "@/components/myComponents/subs/login";
import Signup from "@/components/myComponents/subs/signup";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl">
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

        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/70 my-3 text-center space-y-4">
          <p className="text-xs font-medium text-foreground/85">
            Please sign in to your Cathedral account or register as a new member:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Login
              onDrawerOpen={() => onOpenChange(false)}
              trigger={
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2 border-border hover:bg-muted"
                >
                  <LogIn className="w-4 h-4 text-accent" />
                  <span>Sign In</span>
                </Button>
              }
            />

            <Signup
              onDrawerOpen={() => onOpenChange(false)}
              trigger={
                <Button
                  className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center justify-center gap-2 shadow-md shadow-accent/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Button>
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredDialog;
