"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CiMenuFries } from "react-icons/ci";
import { ArrowRight, BookOpen, LogOut, UserRound, Sparkles } from "lucide-react";

import { useTheme } from "next-themes";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useAppContext } from "@/hooks/useAppContext";
import Links from "@/data/links";
import { PostButton } from "../myComponents/subs/fileupload";
import Login from "../myComponents/subs/login";
import Signup from "../myComponents/subs/signup";

const Sidenav = () => {
  const pathname = usePathname();
  const { user, setUser } = useAppContext();
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : "dark";
  const themeLabel = currentTheme === "light" ? "Light Mode" : "Dark Mode";

  const profileImage = user?.avatarUrl || session?.user?.image;
  const displayName =
    user?.username && user.username !== "visitor"
      ? user.username
      : session?.user?.name || "Your Account";
  const isSignedIn = status === "authenticated" || Boolean(
    user?.id && user.id !== "nil" && user.email !== "nil"
  );

  React.useEffect(() => {
    if (isSignedIn) setOpen(false);
  }, [isSignedIn]);

  const handleSignOut = async () => {
    setOpen(false);
    setUser({
      username: "visitor",
      id: "nil",
      email: "nil",
      avatarUrl: "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png",
      role: "user",
      department: "nil",
      contact: "xxxx",
    });
    if (status === "authenticated") await signOut({ callbackUrl: "/" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Sidebar Trigger Button */}
      <SheetTrigger
        aria-label="Open navigation menu"
        className="flex h-10 w-10 justify-center items-center rounded-lg transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <CiMenuFries className="text-[30px] text-accent" />
      </SheetTrigger>

      {/* Sidebar Drawer Content */}
      <SheetContent
        side="right"
        className="flex h-[100dvh] w-[min(88vw,380px)] flex-col gap-0 overflow-hidden border-l border-border/70 bg-background p-0 shadow-2xl sm:max-w-sm"
      >
        {/* HEADER: Extracted Transparent Logo & Project Name */}
        <header className="shrink-0 border-b border-border/70 bg-gradient-to-br from-accent/10 via-background to-background px-5 pb-5 pt-8">
          <SheetClose asChild>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-background shadow-sm overflow-hidden p-1.5">
                <Image
                  src="/sidebar-logo.png"
                  alt="CCC Ogudu Cathedral"
                  width={52}
                  height={52}
                  unoptimized
                  className="h-12 w-12 object-contain"
                />
              </span>
              <span className="min-w-0">
                <SheetTitle className="text-left text-base font-bold leading-tight tracking-tight">
                  CCC Ogudu
                </SheetTitle>
                <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">
                  Expressway Cathedral
                </span>
                <span className="mt-0.5 block text-[11px] font-semibold italic tracking-wide text-accent">
                  Celestial Church of Christ
                </span>
              </span>
            </Link>
          </SheetClose>
        </header>

        {/* NAVIGATION BODY */}
        <nav
          aria-label="Main navigation"
          className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-4"
        >
          {/* Appearance Mode Switcher */}
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-1.5 shadow-xs">
            <span className="text-xs font-semibold text-muted-foreground">{themeLabel}</span>
            <ModeToggle />
          </div>

          {/* Dynamic App Links */}
          <div className="space-y-1.5">
            {Links.Links.map((link) => {
              const isActive =
                pathname === link.path ||
                (link.path !== "/" && pathname.startsWith(`${link.path}/`));
              const IconComponent = link.icon;
              const icon = IconComponent ? (
                <IconComponent className="h-5 w-5" />
              ) : (
                <BookOpen className="h-5 w-5" />
              );

              return (
                <SheetClose asChild key={link.path}>
                  <Link
                    href={link.path}
                    aria-current={isActive ? "page" : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "border-accent/30 bg-accent text-accent-foreground shadow-md shadow-accent/15"
                        : "border-transparent text-foreground/85 hover:border-border hover:bg-accent/10 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-white/15 text-accent-foreground"
                          : "bg-muted/70 text-accent group-hover:bg-accent/15"
                      }`}
                    >
                      {icon}
                    </span>
                    <span className="flex-1 capitalize tracking-wide">{link.name}</span>
                    <ArrowRight
                      className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? "opacity-90" : "opacity-0 group-hover:opacity-60"
                      }`}
                    />
                  </Link>
                </SheetClose>
              );
            })}
          </div>

          {/* Quick Media Shortcuts */}
          <div className="pt-2 pb-1 space-y-2">
            <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Quick Media</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SheetClose asChild>
                <Link
                  href="/blog/?tab=praisevideo"
                  className={`rounded-xl border py-2 text-xs font-semibold text-center transition-all ${
                    pathname.includes("praise")
                      ? "bg-accent text-accent-foreground border-accent shadow-sm"
                      : "border-accent/40 text-accent hover:bg-accent/10 bg-background/50"
                  }`}
                >
                  Praise Feeds
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/blog/?tab=worshipvideo"
                  className={`rounded-xl border py-2 text-xs font-semibold text-center transition-all ${
                    pathname.includes("worship")
                      ? "bg-accent text-accent-foreground border-accent shadow-sm"
                      : "border-accent/40 text-accent hover:bg-accent/10 bg-background/50"
                  }`}
                >
                  Worship Feeds
                </Link>
              </SheetClose>
            </div>

            {/* Post Media to Playlists Trigger */}
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 p-2.5 shadow-xs">
              <span className="text-xs font-semibold text-muted-foreground pl-1">
                Post Media
              </span>
              <PostButton />
            </div>
          </div>
        </nav>

        {/* FOOTER: Profile Account Card & Auth Actions */}
        <footer className="shrink-0 border-t border-border/70 bg-muted/20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <SheetClose asChild>
            <Link
              href="/account"
              className="mb-3 flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-background p-3 transition-colors hover:border-accent/40 hover:bg-accent/5 shadow-xs"
            >
              <Avatar className="h-11 w-11 shrink-0 ring-2 ring-accent/15 ring-offset-2 ring-offset-background">
                {profileImage && (
                  <AvatarImage
                    src={profileImage}
                    alt={displayName}
                  />
                )}
                <AvatarFallback className="bg-accent/10 text-accent font-bold">
                  <UserRound className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {displayName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {isSignedIn
                    ? user?.email || session?.user?.email || "View your profile"
                    : "Sign in to your account"}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </SheetClose>

          {/* Auth Action Buttons */}
          {isSignedIn ? (
            <Button
              type="button"
              variant="outline"
              className="mb-2 h-10 w-full justify-start gap-2 rounded-xl text-muted-foreground hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          ) : (
            <div className="mb-2 grid grid-cols-2 gap-2">
              <Login
                trigger={
                  <Button variant="outline" className="h-10 w-full rounded-xl font-semibold">
                    Sign in
                  </Button>
                }
              />
              <Signup
                trigger={
                  <Button className="h-10 w-full rounded-xl shadow-sm shadow-accent/20 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                    Create account
                  </Button>
                }
              />
            </div>
          )}
        </footer>
      </SheetContent>
    </Sheet>
  );
};

export default Sidenav;
