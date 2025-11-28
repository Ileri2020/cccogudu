"use client";

import React, { useEffect, useRef, useState } from "react";
import { BiLike, BiSolidLike, BiComment } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TextArea from "@/components/textArea";
import axios from "axios";
import { useAppContext } from "@/hooks/useAppContext";
import { Skeleton } from "@/components/ui/skeleton";
import Login from "@/components/myComponents/subs/login";
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy, FaRegCopy } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";

// ---------------------- COMMENTS COMPONENT ----------------------
const Comments = ({ videoId, reload }: { videoId: string; reload: boolean }) => {
  const { comments, setComments } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [compComments, setCompComments] = useState<any[]>([]);

  const getComments = async (id: string) => {
    try {
      const res = await axios.get(`/api/dbhandler?model=comments&id=${id}`);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!videoId) return;

    getComments(videoId)
      .then((res) => {
        setComments(res);
        setCompComments(res.filter((c: any) => c.contentId === videoId));
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, [videoId, reload]);

  if (!videoId) return null;

  return (
    <div className="space-y-3">
      {loading && <div className="text-sm opacity-70">Loading comments...</div>}
      {!loading && compComments.length < 1 && (
        <div className="text-sm opacity-70">No comments yet...</div>
      )}
      {compComments.map((comment) => (
        <div key={comment.id} className="border rounded-md p-2 bg-secondary">
          <div className="font-semibold">@{comment.username}</div>
          <div>{comment.comment}</div>
          <div className="text-xs opacity-60">{comment.createdAt}</div>
        </div>
      ))}
    </div>
  );
};

// ---------------------- MAIN POST COMPONENT ----------------------
const Post = ({ post, onSwipeLeft, onSwipeRight }) => {
  const { user } = useAppContext();
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isPlaying = useRef(false);

  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");
  const [reload, setReload] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  // Double tap & tap state
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef<any>(null);
  const [showHeart, setShowHeart] = useState(false);

  // Horizontal swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const SWIPE_THRESHOLD = 50;

  // Progress bar
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);

  const postUrl = `${process.env.NEXT_PUBLIC_ORIGIN_URL}/blog/${post.id}?page=${post.for}`;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  // ---------------------- LIKE FETCH ----------------------
  const fetchLikeCount = async () => {
    try {
      const response = await axios.get(`/api/dbhandler?model=likes&id=${post.id}`);
      if (response.status === 200) {
        setLikeCount(response.data.length);
        const userLike = response.data.find((like) => like.userId === user?.id);
        if (userLike) {
          setLikeId(userLike.id);
          setLiked(true);
        } else {
          setLikeId(null);
          setLiked(false);
        }
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchLikeCount();
    if (mediaRef.current && "IntersectionObserver" in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isPlaying.current) {
              mediaRef.current?.play().catch(() => {});
              isPlaying.current = true;
            } else if (!entry.isIntersecting && isPlaying.current) {
              mediaRef.current?.pause();
              isPlaying.current = false;
            }
          });
        },
        { threshold: 0.6 }
      );
      observerRef.current.observe(mediaRef.current);
      return () => observerRef.current?.disconnect();
    }
  }, []);

  // ---------------------- LIKE ACTION ----------------------
  const handleLike = async () => {
    if (!user || user.username === "visitor") {
      setOpenLoginDialog(true);
      return;
    }
    try {
      if (!liked) {
        const res = await axios.post("/api/dbhandler?model=likes", {
          userId: user.id,
          contentId: post.id,
        });
        setLiked(true);
        setLikeId(res.data.id);
        setLikeCount((c) => c + 1);
      } else {
        await axios.delete(`/api/dbhandler?model=likes&id=${likeId}`);
        setLiked(false);
        setLikeId(null);
        setLikeCount((c) => c - 1);
      }
    } catch (err) {}
  };

  // ---------------------- TAP / DOUBLE TAP ----------------------
  const togglePlayPause = () => {
    if (!mediaRef.current) return;
    if (mediaRef.current.paused) {
      mediaRef.current.play();
      isPlaying.current = true;
    } else {
      mediaRef.current.pause();
      isPlaying.current = false;
    }
  };

  const handleDoubleTap = () => {
    if (!user || user.username === "visitor") {
      setOpenLoginDialog(true);
      return;
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 700);
    handleLike();
  };

  const handleTap = () => {
    const now = Date.now();
    const delta = now - lastTapRef.current;
    if (delta < 250) {
      clearTimeout(tapTimeoutRef.current);
      handleDoubleTap();
    } else {
      tapTimeoutRef.current = setTimeout(() => togglePlayPause(), 220);
    }
    lastTapRef.current = now;
  };

  // ---------------------- HORIZONTAL SWIPE ----------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0 && onSwipeLeft) onSwipeLeft(post);
      else if (diff < 0 && onSwipeRight) onSwipeRight(post);
    }
  };

  // ---------------------- COMMENT ----------------------
  const saveComment = async () => {
    if (!user || user.username === "visitor") {
      setOpenLoginDialog(true);
      return;
    }
    try {
      const res = await axios.post("/api/dbhandler?model=comments", {
        userId: user.id,
        username: user.username,
        contentId: post.id,
        comment,
      });
      if (res.status === 200) {
        setComment("");
        setReload((r) => !r);
      }
    } catch (err) {}
  };

  // ---------------------- DELETE ----------------------
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/dbhandler?model=posts&id=${post.id}`);
      alert("Post deleted");
    } catch (err) {}
  };

  // ---------------------- PROGRESS BAR ----------------------
  useEffect(() => {
    if (!mediaRef.current) return;
    const el = mediaRef.current;

    const updateProgress = () => {
      progressRef.current = el.currentTime / (el.duration || 1);
      setProgress(progressRef.current);
      requestAnimationFrame(updateProgress);
    };
    updateProgress();
  }, [mediaRef.current]);

  // ---------------------- DATE FORMAT ----------------------
  const formatDate = (dateString: string) => {
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
  };

  return (
    <div className="mt-10 flex flex-col rounded-sm w-[100vw] max-w-sm overflow-clip relative">

      {/* ADMIN DELETE */}
      {(user.role === "admin" || user.role === "moderator") && (
        <Button variant="destructive" className="ml-2" onClick={handleDelete}>
          Delete
        </Button>
      )}

      {/* USER ROW */}
      <div className="w-full flex flex-row items-center px-2 mb-2">
        <img
          src={post?.user?.avatarUrl ?? "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png"}
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-2 flex-1">
          <div className="font-semibold">{post.user?.username}</div>
          <div className="text-xs opacity-70">{formatDate(post.updatedAt)}</div>
        </div>
        <div>
          <ShareButton textToCopy={postUrl} />
          {/* DOWNLOAD BUTTON */}
          <a
            href={post.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-2 rounded-md text-sm"
          >
            <MdOutlineFileDownload />
          </a>
        </div>
      </div>

      {/* MEDIA */}
      <div className="relative w-full flex justify-center">
        {post.type === "image" && (
          <img src={post.url} className="w-full max-w-[360px]" />
        )}

        {(post.type === "video" || post.type === "audio") && (
          <div
            className="w-full max-w-[360px] relative"
            onClick={handleTap}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {post.type === "video" ? (
              <video
                ref={videoRef}
                src={post.url}
                className="w-full"
                controls
              />
            ) : (
              <audio
                ref={audioRef}
                src={post.url}
                controls
                className="w-full"
              />
            )}

            {/* HEART ANIMATION */}
            <AnimatePresence>
              {showHeart && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1.4, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <BiSolidLike className="text-white drop-shadow-xl" size={80} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* PROGRESS BAR */}
        <div className="absolute top-0 left-0 w-full h-1 bg-black/20 z-20">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>


      {/* TEXT */}
      <div className="bg-secondary p-2">
        {post.for !== "post" && <div className="font-semibold text-lg">{post.title}</div>}
        <div>{post.post}</div>

        <div className="flex items-center gap-2 mt-2">
          {likeCount} <BiSolidLike />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 mt-1">
          <Button
            className={`flex-1 text-2xl ${liked ? "bg-blue-500 text-white" : ""}`}
            onClick={handleLike}
          >
            {liked ? <BiSolidLike /> : <BiLike />}
          </Button>

          <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="flex-1 text-2xl text-accent border-2 border-accent">
                <BiComment />
              </Button>
            </DrawerTrigger>

            <DrawerContent className="max-w-lg mx-auto pb-10">
              <DrawerHeader>
                <DrawerTitle className="text-center text-xl">Comments</DrawerTitle>
              </DrawerHeader>

              <div className="max-h-[55vh] overflow-y-auto px-4">
                <Comments videoId={post.id} reload={reload} />
              </div>

              <div className="flex flex-col gap-3 px-4 mt-4">
                {(!user || user.username === "visitor") ? (
                  <Login />
                ) : (
                  <>
                    <div className="font-semibold">@{user.username}</div>
                    <TextArea
                      onChange={(e) => setComment(e.target.value)}
                      value={comment}
                      className="h-[120px]"
                    />
                    <DrawerFooter className="flex gap-2">
                      <DrawerClose asChild>
                        <Button variant="outline" className="flex-1">Cancel</Button>
                      </DrawerClose>
                      <Button className="flex-1" disabled={comment.length < 1} onClick={saveComment}>Send</Button>
                    </DrawerFooter>
                  </>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* LOGIN DIALOG */}
      <Dialog open={openLoginDialog} onOpenChange={setOpenLoginDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Login Required</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex justify-center">
            <Login />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Post;

// ---------------------- COMPACT SHARE BUTTON ----------------------
const ShareButton = ({ textToCopy }: { textToCopy: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Button variant="outline" onClick={handleCopy} className="h-6 px-2 text-sm">
      {isCopied ? <FaCopy /> : <FaRegCopy />}
    </Button>
  );
};
