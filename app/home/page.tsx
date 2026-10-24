// @ts-nocheck

"use client"
import { motion } from "framer-motion"
import { Button } from '@/components/ui/button';
import Social from "@/components/utility/social"
import { Gallery } from "@/components/myComponents/subs"
import { TextAnimations, FlyInText, FlipInText, ZoomInText, ScaleInText, SlideInText, SlideUpText, BounceInText, RotateInText, TypewriterText } from "@/components/myComponents/subs/textctrl";
import Logobg from '@/components/myComponents/subs/logobg';
import gallery from '@/data/gallery';
import testimonials from '@/data/testimonial';
import Similar from '../../components/myComponents/subs/similar';
import Footer from '../../components/myComponents/subs/footer';
import Footer1 from "@/components/myComponents/subs/Footer1";
import Footer2 from "@/components/myComponents/subs/Footer2";
import { useAppContext } from "@/hooks/useAppContext";
import { TestimonialsSection } from "@/components/myComponents/subs/testimonials";
import { CoverCarousel, TextCarousel } from "@/components/myComponents/subs/carrousels";
import Post from "@/components/myComponents/subs/post";
import Posts from "@/components/myComponents/subs/posts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Music from "@/components/sub/music";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Sparkles,
  MessageSquarePlus,
  Send,
  Check,
  CalendarPlus,
} from "lucide-react";
import { PostButton } from "@/components/myComponents/subs/fileupload";
import { AuthRequiredDialog } from "@/components/myComponents/subs/AuthRequiredDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============================================================================
// HERO CATEGORY BUTTONS CAROUSEL
// Physical animated infinite continuous carousel.
// Buttons physically slide into and out of the center.
// The approaching center button smoothly expands, leaving button shrinks to normal.
// Center button prominently features the triangular Play button icon.
// ============================================================================
interface HeroCategoryItem {
  id: string;
  label: string;
  href: string;
  disabled: boolean;
  tag?: string;
}

const HERO_BUTTONS: HeroCategoryItem[] = [
  { id: "all", label: "All", href: "/blog", disabled: false },
  { id: "praise", label: "Praise", href: "/blog/?tab=praisevideo", disabled: false },
  { id: "worship", label: "Worship", href: "/blog/?tab=worshipvideo", disabled: false },
  { id: "ccc-hymns", label: "CCC Hymns", href: "/blog/?tab=ccc", disabled: false },
  { id: "bible", label: "Bible Sermons", href: "/blog/?tab=bible", disabled: true, tag: "Soon" },
  { id: "musical", label: "Choir & Orchestra", href: "/blog/?tab=musical", disabled: true, tag: "Soon" },
  { id: "revival", label: "Revival Feeds", href: "/blog/?tab=revival", disabled: true, tag: "Soon" },
  { id: "dance", label: "Youth Dance", href: "/blog/?tab=dance", disabled: true, tag: "Soon" },
  { id: "lessons", label: "Sunday School", href: "/blog/?tab=post", disabled: true, tag: "Soon" },
];

const HeroButtonCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const total = HERO_BUTTONS.length;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Continuous auto-rotation every 3.2s (pauses on user interaction/hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -30 || info.velocity.x < -200) {
      handleNext();
    } else if (info.offset.x > 30 || info.velocity.x > 200) {
      handlePrev();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 20) {
      if (e.deltaX > 20) handleNext();
      else handlePrev();
    } else if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 30) handleNext();
      else handlePrev();
    }
  };

  // Distance calculation around infinite circle
  const getOffset = (idx: number, current: number, count: number) => {
    let diff = (idx - current) % count;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    return diff;
  };

  const step = isMobile ? 122 : 185;

  return (
    <div
      className="w-full max-w-2xl mx-auto my-6 px-2 flex flex-col items-center gap-3 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="w-full flex items-center justify-between gap-1 sm:gap-3">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          aria-label="Previous category"
          className="h-9 w-9 rounded-full border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 shadow-sm z-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Physical Animated Carousel Track with manual drag and scroll */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onWheel={handleWheel}
          className="relative flex-1 h-16 sm:h-20 flex items-center justify-center overflow-visible cursor-grab active:cursor-grabbing touch-pan-y"
          title="Drag horizontally or scroll to rotate categories"
        >
          {HERO_BUTTONS.map((item, idx) => {
            const diff = getOffset(idx, currentIndex, total);
            const isCenter = diff === 0;
            const isAdjacent = Math.abs(diff) === 1;
            const isVisible = isCenter || isAdjacent;

            const targetX = diff * step;
            const targetScale = isCenter ? 1.18 : isAdjacent ? 0.88 : 0.6;
            const targetOpacity = isCenter ? 1 : isAdjacent ? 0.75 : 0;
            const targetZ = isCenter ? 25 : isAdjacent ? 15 : 0;

            const buttonContent = (
              <div
                className={cn(
                  "flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-colors duration-300 select-none text-center whitespace-nowrap shadow-md min-w-[105px] sm:min-w-[145px]",
                  isCenter
                    ? "bg-accent/25 border-2 border-accent text-accent shadow-xl shadow-accent/30 ring-2 ring-accent/40 font-bold"
                    : "bg-background/85 hover:bg-muted border border-border/80 text-foreground/85 hover:border-accent/50",
                  item.disabled && "opacity-40 cursor-not-allowed border-dashed"
                )}
              >
                {/* Triangular play button smoothly appears on center button */}
                {isCenter && (
                  <Play
                    className={cn(
                      "w-4 h-4 fill-current mr-2 shrink-0 animate-pulse",
                      item.disabled ? "text-muted-foreground opacity-50" : "text-accent"
                    )}
                  />
                )}
                <span className="text-xs sm:text-sm md:text-base font-semibold">{item.label}</span>
                {item.disabled && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-1.5 hidden sm:inline-block">
                    Soon
                  </span>
                )}
              </div>
            );

            return (
              <motion.div
                key={item.id}
                className="absolute flex items-center justify-center"
                animate={{
                  x: targetX,
                  scale: targetScale,
                  opacity: targetOpacity,
                  zIndex: targetZ,
                }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 24,
                  mass: 0.8,
                }}
                style={{
                  pointerEvents: isVisible ? "auto" : "none",
                }}
              >
                {item.disabled ? (
                  <button
                    type="button"
                    disabled
                    onClick={() => (!isCenter ? setCurrentIndex(idx) : null)}
                    className="cursor-not-allowed"
                    title={`${item.label} (Feature disabled)`}
                  >
                    {buttonContent}
                  </button>
                ) : isCenter ? (
                  <Link href={item.href} className="cursor-pointer">
                    {buttonContent}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className="cursor-pointer"
                    aria-label={`Select ${item.label}`}
                  >
                    {buttonContent}
                  </button>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          aria-label="Next category"
          className="h-9 w-9 rounded-full border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 shadow-sm z-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Subtle indicator dots */}
      <div className="flex items-center gap-1.5 mt-2">
        {HERO_BUTTONS.map((btn, idx) => (
          <button
            key={btn.id}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              currentIndex === idx
                ? "w-5 bg-accent"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to ${btn.label}`}
          />
        ))}
      </div>
    </div>
  );
};

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
];

const Home = () => {
  const { selectedVideo, setSelectedVideo, useMock, user } = useAppContext();

  // Testimonials state allowing dynamic addition of user testimonies
  const [testimonyList, setTestimonyList] = useState(testimonials.testimonials);
  const [isTestimonyDialogOpen, setIsTestimonyDialogOpen] = useState(false);
  const [testimonyName, setTestimonyName] = useState("");
  const [testimonyRole, setTestimonyRole] = useState("");
  const [testimonyMessage, setTestimonyMessage] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  const [isSubmittingTestimony, setIsSubmittingTestimony] = useState(false);
  const isLoggedIn = Boolean(
    user &&
    user.id &&
    user.id !== "nil" &&
    user.username !== "visitor" &&
    user.email !== "nil"
  );
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  // Load testimonies from database and localStorage
  useEffect(() => {
    const fetchDbTestimonies = async () => {
      try {
        const res = await axios.get("/api/dbhandler", {
          params: { model: "posts", for: "testimony" },
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          const dbMapped = res.data.map((item: any) => ({
            id: item.id,
            author: {
              name: item.title,
              handle: item.user?.username
                ? `@${item.user.username}`
                : (item.role || `@worshiper_${item.id?.slice(-3) || "ccc"}`),
              avatar: item.url || item.user?.avatarUrl || AVATAR_OPTIONS[0],
            },
            text: item.description || item.post || "",
          }));
          setTestimonyList((prev) => {
            const existingTexts = new Set(prev.map((t) => t.text));
            const fresh = dbMapped.filter((t) => !existingTexts.has(t.text));
            return [...fresh, ...prev];
          });
        }
      } catch (err) {
        console.error("Failed to load testimonies from DB", err);
      }
    };

    fetchDbTestimonies();

    try {
      const saved = localStorage.getItem("ccl_user_testimonies");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTestimonyList((prev) => {
            const existingTexts = new Set(prev.map((t) => t.text));
            const fresh = parsed.filter((t: any) => !existingTexts.has(t.text));
            return [...fresh, ...prev];
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleTestimonySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonyName.trim() || !testimonyMessage.trim()) {
      toast.error("Please provide both your name and testimony message.");
      return;
    }

    setIsSubmittingTestimony(true);

    const avatar = selectedAvatar || user?.avatarUrl || AVATAR_OPTIONS[0];
    const handle = testimonyRole.trim()
      ? (testimonyRole.trim().startsWith("@") ? testimonyRole.trim() : `@${testimonyRole.trim().replace(/\s+/g, "_").toLowerCase()}`)
      : `@worshiper_${Math.floor(100 + Math.random() * 900)}`;

    const newTestimonial = {
      author: {
        name: testimonyName.trim(),
        handle: handle,
        avatar: avatar,
      },
      text: testimonyMessage.trim(),
    };

    // Immediate optimistic update
    setTestimonyList((prev) => [newTestimonial, ...prev]);

    // Save to MongoDB database
    try {
      const authHeaders = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
      await axios.post(
        "/api/dbhandler?model=posts",
        {
          title: testimonyName.trim(),
          description: testimonyMessage.trim(),
          url: avatar,
          for: ["testimony"],
          type: "testimony",
          userId: (user?.id && user.id !== "nil") ? user.id : undefined,
          role: handle,
          isVerified: true,
        },
        { headers: authHeaders }
      );
      toast.success("Hallelujah! Your testimony has been saved to the database and shared with the congregation.");
    } catch (dbErr) {
      console.error("Failed to save testimony to DB:", dbErr);
      try {
        const saved = localStorage.getItem("ccl_user_testimonies");
        const currentSaved = saved ? JSON.parse(saved) : [];
        localStorage.setItem("ccl_user_testimonies", JSON.stringify([newTestimonial, ...currentSaved]));
      } catch (_) {}
      toast.success("Your testimony has been added to the carousel!");
    } finally {
      setIsSubmittingTestimony(false);
      setIsTestimonyDialogOpen(false);
      setTestimonyName("");
      setTestimonyRole("");
      setTestimonyMessage("");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.5, duration: 0.6, ease: "easeIn" },
      }}
      className="w-[100vw] min-h-[100vh] overflow-clip flex flex-col"
    >
      {/* 1. Hero Title & Text Carousel */}
      <div className="flex-1 flex flex-col md:flex-row w-full min-h-[70vh] overflow-visible mx-auto relative max-w-[100vw] items-center justify-between px-4 sm:px-8">
        <div className="flex w-full md:max-w-xl flex-col items-center mt-5 md:mt-28 text-center md:text-start md:translate-x-10 z-10">
          <div className="text-center md:text-start">
            <div className="text-5xl text-accent text-center w-full font-bold">CCC OGUDU</div>
            <div className="text-3xl text-primary/80 font-semibold">EXPRESSWAY CATHEDRAL</div>
          </div>
          <div>
            <ZoomInText />
          </div>
        </div>

        <div className="flex-1 w-full max-w-[100vw] flex items-center justify-center relative min-h-[420px] mt-10 my-4 md:my-0 overflow-visible">
          <TextCarousel
            text="O Good Forever***O Good Forever***O Good Forever***"
            speed={2000}
            image={true}
            imageUrl="/crown.webp"
            direction="left"
            className="w-full max-w-[100vw]"
          />
        </div>
      </div>

      {/* 2. Rotating Hero Category Buttons (Praise, Worship, CCC Hymns, and other video types disabled) */}
      <HeroButtonCarousel />

      {/* 3. In-page Music Component - Under Hero, Above Upcoming Events */}
      <section className="w-full max-w-5xl mx-auto px-4 my-8">
        <Music
          defaultMinimized={true}
          dockedOnMinimize={false}
          defaultRandom={true}
          defaultCategory="ccc"
          fullscreenOnMaximize={false}
          allowMinimize={true}
        />
      </section>

      {/* 4. Upcoming Events Section */}
      <div className="flex flex-col">
        <ScrollArea className="relative max-h-[110vh] w-full mx-auto flex justify-center items-center max-w-md overflow-clip">
          <UpcomingEvents page={"event"} />
        </ScrollArea>
      </div>

      {/* 5. Testimonials Section: "Worship and Pray With Us" */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TestimonialsSection
            className="py-0"
            description="Words from worshipers and prayer request"
            testimonials={testimonyList}
            title="Worship and Pray With Us"
          />

          {/* Button: "Post your testimony" */}
          <div className="mt-8 flex flex-col items-center justify-center text-center">
            <Button
              onClick={() => {
                if (!isLoggedIn) {
                  setIsAuthDialogOpen(true);
                  return;
                }
                setIsTestimonyDialogOpen(true);
              }}
              size="lg"
              className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 shadow-xl shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2.5 text-base"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Post your testimony</span>
            </Button>
            <p className="text-xs text-muted-foreground mt-2.5">
              Has God blessed you? Share your testimony and glorify His Holy name with the congregation!
            </p>
          </div>
        </div>
      </section>

      <AuthRequiredDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        title="Sign In to Share Testimony"
        description="Log in or create an account to post your testimony to the fellowship carousel."
      />

      {/* Testimony Submission Dialog */}
      <Dialog open={isTestimonyDialogOpen} onOpenChange={setIsTestimonyDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-accent mb-1">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Praise Report & Fellowship</span>
            </div>
            <DialogTitle className="text-2xl font-bold">Post Your Testimony</DialogTitle>
            <DialogDescription>
              Share what the Lord has done for you! Your testimony will be added directly to the fellowship carousel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTestimonySubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">Your Name</label>
              <Input
                placeholder="e.g. Sister Grace Adeleke"
                value={testimonyName}
                onChange={(e) => setTestimonyName(e.target.value)}
                required
                className="bg-background/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">Role / Handle (Optional)</label>
              <Input
                placeholder="e.g. @grace_ogudu or Cathedral Choir Member"
                value={testimonyRole}
                onChange={(e) => setTestimonyRole(e.target.value)}
                className="bg-background/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1.5 block">Select Avatar</label>
              <div className="flex items-center gap-3">
                {AVATAR_OPTIONS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={cn(
                      "relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all",
                      selectedAvatar === avatar
                        ? "border-accent ring-2 ring-accent/30 scale-105"
                        : "border-border/60 opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                    {selectedAvatar === avatar && (
                      <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-accent font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">Your Testimony / Prayer Praise</label>
              <Textarea
                rows={4}
                placeholder="Declare the good works and miracles of God in your life..."
                value={testimonyMessage}
                onChange={(e) => setTestimonyMessage(e.target.value)}
                required
                className="bg-background/60 resize-none"
              />
            </div>

            <DialogFooter className="mt-6 flex flex-row gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTestimonyDialogOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-1.5 shadow-md shadow-accent/20"
              >
                <Send className="w-4 h-4" />
                <span>Submit Testimony</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
};

export default Home;






























import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

// ============================================================================
//  UPCOMING EVENTS  (Posts + Post merged, simplified for IMAGES ONLY)
// ============================================================================

const UpcomingEvents = ({ page, media = "" }) => {
  const { user } = useAppContext();
  const [allEvents, setAllEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [sortOrder, setSortOrder] = useState("random");
  const [loading, setLoading] = useState(true);

  // Dialog and form state for event posting
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventFile, setEventFile] = useState<File | null>(null);
  const [eventPreview, setEventPreview] = useState<string | null>(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const isLoggedIn = Boolean(
    user &&
    user.id &&
    user.id !== "nil" &&
    user.username !== "visitor" &&
    user.email !== "nil"
  );

  const handleOpenEventDialog = () => {
    if (!isLoggedIn) {
      setIsAuthDialogOpen(true);
      return;
    }
    setIsEventDialogOpen(true);
  };

  const handleEventFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setEventFile(selected);
      setEventPreview(URL.createObjectURL(selected));
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDescription.trim()) {
      toast.error("Please provide both event title and description.");
      return;
    }
    if (!isLoggedIn) {
      toast.error("Only logged in users can post events. Please log in first.");
      return;
    }

    setIsSubmittingEvent(true);

    try {
      // Default flyer image if user does not upload media (Media is not compulsory)
      let flyerUrl = "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png";

      if (eventFile) {
        try {
          const sigRes = await axios.get("/api/cloudinary-signature");
          const { signature, timestamp, cloudName, apiKey } = sigRes.data;

          const data = new FormData();
          data.append("file", eventFile);
          data.append("api_key", apiKey);
          data.append("timestamp", timestamp);
          data.append("signature", signature);

          const cloudRes = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            data
          );
          if (cloudRes.data?.secure_url) {
            flyerUrl = cloudRes.data.secure_url;
          }
        } catch (uploadErr) {
          console.error("Cloudinary upload failed, using fallback flyer:", uploadErr);
        }
      }

      const authHeaders = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
      await axios.post(
        "/api/dbhandler?model=posts",
        {
          title: eventTitle.trim(),
          description: eventDescription.trim(),
          post: eventDescription.trim(),
          url: flyerUrl,
          for: ["event"],
          type: "image",
          userId: user.id,
          isVerified: true,
        },
        { headers: authHeaders }
      );

      toast.success("Hallelujah! Upcoming event posted successfully.");
      setIsEventDialogOpen(false);
      setEventTitle("");
      setEventDescription("");
      setEventFile(null);
      setEventPreview(null);
      fetchEvents();
    } catch (err: any) {
      console.error("Failed to post event:", err);
      toast.error(err?.response?.data?.error || "Failed to post event. Please try again.");
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const eventsPerChunk = 2;
  const currentChunkRef = useRef(0);
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  // ==========================================================================
  // SORT EVENTS
  // ==========================================================================
  const sortEvents = (events: any[], order: string, mediaId: string) => {
    if (mediaId && order === "random") return events;

    if (order === "asc") {
      return [...events].sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      );
    }

    if (order === "desc") {
      return [...events].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    return [...events].sort(() => Math.random() - 0.5); // random
  };

  // ==========================================================================
  // PRIORITIZE MEDIA IMAGE FIRST
  // ==========================================================================
  const prioritizeMedia = (events, mediaId) => {
    if (!mediaId) return events;

    const index = events.findIndex((e) => String(e.id) === String(mediaId));
    if (index === -1) return events;

    const item = events[index];
    const others = events.filter((e) => String(e.id) !== String(mediaId));

    return [item, ...others];
  };

  // ==========================================================================
  // FETCH EVENTS
  // ==========================================================================
  const fetchEvents = useCallback(async () => {
    if (page !== "event") return;

    try {
      setLoading(true);

      const response = await axios.get("/api/dbhandler", {
        params: { model: "posts" },
      });

      let events = response.data;

      events = events.filter(
        (event) =>
          (event.for === "event" || (Array.isArray(event.for) && event.for.includes("event"))) &&
          event.type === "image"
      );

      events = sortEvents(events, sortOrder, media);
      events = prioritizeMedia(events, media);

      setAllEvents(events);

      currentChunkRef.current = 0;
      setDisplayedEvents(events.slice(0, eventsPerChunk));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, sortOrder, media]);

  // ==========================================================================
  // INFINITE SCROLL LOAD MORE
  // ==========================================================================
  const loadMore = () => {
    const nextChunk = currentChunkRef.current + 1;
    const start = nextChunk * eventsPerChunk;
    const end = start + eventsPerChunk;

    const nextEvents = allEvents.slice(start, end);
    if (nextEvents.length === 0) return;

    currentChunkRef.current = nextChunk;
    setDisplayedEvents((prev) => [...prev, ...nextEvents]);
  };

  // ==========================================================================
  // OBSERVER
  // ==========================================================================
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "150px" }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [allEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ==========================================================================
  // FORMAT DATE
  // ==========================================================================
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const diff = now.getTime() - date.getTime();

    const min = Math.floor(diff / 60000);
    const hrs = Math.floor(min / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `last ${days} d`;
    if (hrs > 0) return `last ${hrs} h`;
    if (min > 0) return `last ${min} m`;
    return "just now";
  }

  // ==========================================================================
  // CONDITIONAL RENDERING FOR NO EVENTS
  // ==========================================================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 w-full text-center">
        <div className="text-2xl font-semibold mb-2">Upcoming Events</div>
        <div className="w-20 mx-auto my-3"><Separator /></div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading cathedral upcoming events...</p>
      </div>
    );
  }

  // If loaded AND no events: render welcoming state with Post Upcoming Event button
  if (!loading && allEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 w-full max-w-sm mx-auto text-center bg-card/60 rounded-2xl border border-border/80 shadow-sm my-4">
        <div className="text-2xl sm:text-3xl font-semibold">Upcoming Events</div>
        <div className="w-20 mx-auto my-3"><Separator /></div>
        <p className="text-xs text-muted-foreground mb-6">
          No cathedral events currently scheduled. Click below to announce an upcoming church program or revival!
        </p>
        <Button
          type="button"
          onClick={handleOpenEventDialog}
          className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-2.5 shadow-md flex items-center gap-2 text-sm"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Post Upcoming Event</span>
        </Button>

        <AuthRequiredDialog
          open={isAuthDialogOpen}
          onOpenChange={setIsAuthDialogOpen}
          title="Sign In to Post Events"
          description="Only logged-in church members can announce upcoming church events."
        />

        {/* Dialog for event posting */}
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-accent mb-1">
                <CalendarPlus className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Cathedral Events</span>
              </div>
              <DialogTitle className="text-2xl font-bold">Post Upcoming Event</DialogTitle>
              <DialogDescription>
                Share details about upcoming church programs, revivals, and services. Only logged in members can announce events.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEventSubmit} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">
                  Event Title <span className="text-accent">*</span>
                </label>
                <Input
                  placeholder="e.g. Annual Adult Harvest Thanksgiving & Revival"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  className="bg-background/60"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">
                  Event Description & Details <span className="text-accent">*</span>
                </label>
                <Textarea
                  rows={3}
                  placeholder="Date: Sunday, Nov 15th | Time: 10:00 AM | Venue: CCC Ogudu Sanctuary..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  required
                  className="bg-background/60 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-foreground/80">
                    Event Flyer / Banner (Optional)
                  </label>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Not Compulsory
                  </span>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleEventFileChange}
                  className="bg-background/60 cursor-pointer"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Media is not compulsory. If left blank, the official cathedral banner will be used automatically.
                </p>
                {eventPreview && (
                  <div className="mt-2 relative rounded-lg overflow-hidden border border-border/70 max-h-48">
                    <img src={eventPreview} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setEventFile(null);
                        setEventPreview(null);
                      }}
                      className="absolute top-2 right-2 h-6 px-2 text-xs rounded-full"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6 flex flex-row gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEventDialogOpen(false)}
                  disabled={isSubmittingEvent}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-1.5 shadow-md shadow-accent/20"
                >
                  {isSubmittingEvent ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <CalendarPlus className="w-4 h-4" />
                      <span>Publish Event</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ==========================================================================
  // UI
  // ==========================================================================
  return (
    <div className="flex flex-col w-fit mx-auto">
      <div className="mt-2 text-3xl sm:text-4xl font-semibold text-center w-full">Upcoming Events</div>
      <div className="w-28 mx-auto my-6"><Separator /></div>

      {/* Action Header: Sort dropdown + Post Upcoming Event button */}
      <div className="flex items-center justify-between w-full max-w-sm mx-auto gap-3 mb-4 px-1">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 text-xs border rounded-lg bg-background text-foreground"
        >
          <option value="random">Random</option>
          <option value="asc">Ascending Date</option>
          <option value="desc">Descending Date</option>
        </select>

        <Button
          size="sm"
          type="button"
          onClick={handleOpenEventDialog}
          className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-3.5 py-1.5 shadow-sm flex items-center gap-1.5 text-xs"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>Post Event</span>
        </Button>
      </div>

      {/* Render Events */}
      {displayedEvents.map((event) => (
        <div
          key={event.id}
          className="mt-6 flex flex-col rounded-xl w-[100vw] max-w-sm overflow-hidden bg-card border border-border/80 shadow-md"
        >
          {/* HEADER */}
          <div className="w-full flex flex-row items-center p-3 border-b border-border/50 bg-muted/20">
            <img
              src={
                event?.user?.avatarUrl ??
                "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png"
              }
              className="w-9 h-9 rounded-full object-cover border border-accent/40"
            />
            <div className="flex flex-row items-center justify-between w-full px-3">
              <div className="text-sm font-semibold text-foreground">
                {event.user?.username || "Cathedral Member"}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(event.updatedAt)}
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <img src={event.url} alt={event.title || "Event Flyer"} className="w-full object-cover" />

          {/* BODY */}
          <div className="p-4 space-y-1.5">
            {event.title && (
              <div className="font-semibold text-base text-foreground">{event.title}</div>
            )}
            <div className="text-sm text-muted-foreground leading-relaxed">
              {event.description || event.post}
            </div>
          </div>
        </div>
      ))}

      {/* Bottom action button */}
      <div className="mt-8 mb-6 flex justify-center">
        <Button
          type="button"
          onClick={handleOpenEventDialog}
          className="rounded-full bg-accent/90 hover:bg-accent text-accent-foreground font-semibold px-6 py-2.5 shadow-md flex items-center gap-2 text-sm"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Post Upcoming Event</span>
        </Button>
      </div>

      {/* Infinite scroll trigger */}
      {displayedEvents.length < allEvents.length && (
        <div ref={loadMoreRef} className="h-10 invisible">
          Loading...
        </div>
      )}

      {/* Event Post Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-accent mb-1">
              <CalendarPlus className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Cathedral Events</span>
            </div>
            <DialogTitle className="text-2xl font-bold">Post Upcoming Event</DialogTitle>
            <DialogDescription>
              Share details about upcoming church programs, revivals, and services. Only logged in members can announce events.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEventSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">
                Event Title <span className="text-accent">*</span>
              </label>
              <Input
                placeholder="e.g. Annual Adult Harvest Thanksgiving & Revival"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
                className="bg-background/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">
                Event Description & Details <span className="text-accent">*</span>
              </label>
              <Textarea
                rows={3}
                placeholder="Date: Sunday, Nov 15th | Time: 10:00 AM | Venue: CCC Ogudu Sanctuary..."
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                required
                className="bg-background/60 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-foreground/80">
                  Event Flyer / Banner (Optional)
                </label>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Not Compulsory
                </span>
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleEventFileChange}
                className="bg-background/60 cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Media is not compulsory. If left blank, the official cathedral banner will be used automatically.
              </p>
              {eventPreview && (
                <div className="mt-2 relative rounded-lg overflow-hidden border border-border/70 max-h-48">
                  <img src={eventPreview} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setEventFile(null);
                      setEventPreview(null);
                    }}
                    className="absolute top-2 right-2 h-6 px-2 text-xs rounded-full"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6 flex flex-row gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEventDialogOpen(false)}
                disabled={isSubmittingEvent}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingEvent}
                className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-1.5 shadow-md shadow-accent/20"
              >
                {isSubmittingEvent ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    <span>Publish Event</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

