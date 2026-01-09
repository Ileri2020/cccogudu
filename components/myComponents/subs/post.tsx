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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import TextArea from "@/components/textArea";
import axios from "axios";
import { useAppContext } from "@/hooks/useAppContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy, FaRegCopy } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";






import { Skeleton } from "@/components/ui/skeleton";
import Login from "@/components/myComponents/subs/login";


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

const Post = ({ post }: any) => {
  const { user } = useAppContext();
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isPlaying = useRef(false);

  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState<any>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");
  const [reload, setReload] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef<any>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const SWIPE_THRESHOLD = 50;
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const postUrl = `${process.env.NEXT_PUBLIC_ORIGIN_URL}/blog/${post.id}?page=${post.for}`;

  // ---------------------- FETCH LIKE COUNT ----------------------
  const fetchLikeCount = async () => {
    try {
      const response = await axios.get(`/api/dbhandler?model=likes&id=${post.id}`);
      if (response.status === 200) {
        setLikeCount(response.data.length);
        const userLike = response.data.find((like: any) => like.userId === user?.id);
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

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
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
      const el = mediaRef.current;
      if (el) observerRef.current.observe(el);
      return () => observerRef.current?.disconnect();
    }
  }, []);

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

  const togglePlayPause = () => {
    if (!mediaRef.current) return;
    if ((mediaRef.current as HTMLMediaElement).paused) {
      (mediaRef.current as HTMLMediaElement).play();
      isPlaying.current = true;
    } else {
      (mediaRef.current as HTMLMediaElement).pause();
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      const media = videoRef.current || audioRef.current;
      if (!media) return;
      const mediaEl = media as HTMLMediaElement;
      if (diff > 0) {
        mediaEl.currentTime = Math.min(mediaEl.duration || Infinity, mediaEl.currentTime + 5);
      } else {
        mediaEl.currentTime = Math.max(0, mediaEl.currentTime - 5);
      }
    }
  };

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`/api/dbhandler?model=posts&id=${post.id}`);
      alert("Post deleted");
      window.location.reload();
    } catch (err) {}
  };

  const handleVerify = async () => {
    try {
      await axios.put(`/api/dbhandler?model=posts&id=${post.id}`, {
        isVerified: true
      });
      alert("Post approved!");
      window.location.reload();
    } catch (err) {
      alert("Failed to approve post");
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: post.title,
    description: post.description,
    for: post.for,
  });

  const handleEditSave = async () => {
    try {
      await axios.put(`/api/dbhandler?model=posts&id=${post.id}`, editData);
      alert("Post updated!");
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      alert("Failed to update post");
    }
  };

  useEffect(() => {
    let rafId: number | null = null;
    const el = mediaRef.current;
    if (!el) return;

    const updateProgress = () => {
      const mediaEl = el as HTMLMediaElement;
      progressRef.current = mediaEl.currentTime / (mediaEl.duration || 1);
      setProgress(progressRef.current);
      rafId = requestAnimationFrame(updateProgress);
    };

    rafId = requestAnimationFrame(updateProgress);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [mediaRef.current]);

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

  // ---------------------- RENDER ----------------------
  return (
    <div className="mt-10 flex flex-col rounded-sm w-[100vw] max-w-sm overflow-clip relative">
      {/* Admin actions (Delete moved down) */}

      <div className="w-full flex flex-row items-center px-2 mb-2">
        <img
          src={post?.user?.avatarUrl ?? "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png"}
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-2 flex-1">
          <div className="font-semibold">{post.user?.username}</div>
          <div className="text-xs opacity-70">{formatDate(post.updatedAt)}</div>
        </div>
        <div className="flex flex-col gap-1 mx-2">
          <ShareButton textToCopy={postUrl} />
          <a
            href={post.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black/60 text-white px-2 py-2 rounded-md text-sm"
          >
            <MdOutlineFileDownload />
          </a>
        </div>
      </div>

      {user?.role === "admin" && post.isVerified === false && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-xs mb-2 flex justify-between items-center mx-2 rounded">
          <span>Unverified Post</span>
          <Button size="sm" onClick={handleVerify} className="h-6 bg-yellow-600 hover:bg-yellow-700">Approve</Button>
        </div>
      )}

      {user?.role === "admin" && (
        <div className="flex gap-2 mx-2 mb-2">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="flex-1 h-7 text-xs">Edit Post</Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} className="flex-1 h-7 text-xs">Delete Post</Button>
        </div>
      )}

      {/* MEDIA */}
      <div className="relative w-full flex justify-center">
        {post.for === "service" && post.url?.includes("youtube") ? (
          <iframe
            className="w-full max-w-[360px] aspect-video"
            src={post.url.replace("watch?v=", "embed/")}
            title={post.title || "YouTube video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : post.type === "image" ? (
          <img src={post.url} className="w-full max-w-[360px]" />
        ) : (post.type === "video" || post.type === "audio") && (
          <div
            className="w-full max-w-[360px] relative bg-black/5"
            onClick={handleTap}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {post.type === "video" ? (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  mediaRef.current = el;
                }}
                src={post.url}
                className="w-full min-h-32 bg-secondary"
                playsInline
                preload="metadata"
              />
            ) : (
              <audio
                ref={(el) => {
                  audioRef.current = el;
                  mediaRef.current = el;
                }}
                src={post.url}
                preload="metadata"
              />
            )}

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

            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20 z-20">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* TEXT */}
      <div className="bg-secondary p-2">
        {post.for !== "post" && <div className="font-semibold text-lg">{post.title}</div>}
        <div>{post.post}</div>

        <div className="flex items-center gap-2 mt-2">
          {likeCount} <BiSolidLike />
        </div>

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

      <Dialog open={openLoginDialog} onOpenChange={setOpenLoginDialog}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="text-center">Login Required</DialogTitle>
          <div className="py-6 flex justify-center">
            <Login />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogTitle>Edit Post Parameters</DialogTitle>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <TextArea 
                value={editData.title} 
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <TextArea 
                value={editData.description} 
                onChange={(e) => setEditData({...editData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category (For)</label>
              <select
                className="w-full p-2 border rounded bg-background"
                value={editData.for}
                onChange={(e) => setEditData({...editData, for: e.target.value})}
              >
                <option value="praisevideo">Praise Video</option>
                <option value="worshipvideo">Worship Video</option>
                <option value="post">Post</option>
                <option value="event">Event</option>
                <option value="project">Project</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleEditSave} className="flex-1 bg-accent">Save Changes</Button>
            </div>
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
