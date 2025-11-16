// @ts-nocheck
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

import Comments from "@/components/comments";
import TextArea from "@/components/textArea";
import axios from "axios";
import { useAppContext } from "@/hooks/useAppContext";
import { Skeleton } from "@/components/ui/skeleton";

const Post = ({ post }) => {
  const { user } = useAppContext();
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [deleted, setDeleted] = useState(false);
  const [comment, setComment] = useState("");
  const [reload, setReload] = useState(false);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const mediaRef = useRef(null);
  const observerRef = useRef(null);
  const isPlaying = useRef(false);

  const postUrl = `${process.env.NEXT_PUBLIC_ORIGIN_URL}/blog/${post.id}?page=${post.for}`;

  const fetchLikeCount = async () => {
    try {
      const response = await axios.get(`/api/dbhandler?model=likes&id=${post.id}`);
      if (response.status === 200) {
        setLikeCount(response.data.length);

        const userLike = response.data.find(like => like.userId === user.id);
        if (userLike) {
          setLikeId(userLike.id);
          setLiked(true);
        } else {
          setLikeId(null);
          setLiked(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLikeCount();

    if (mediaRef.current && "IntersectionObserver" in window) {
      observerRef.current = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !isPlaying.current) {
              mediaRef.current.play().catch(e => console.log("Error playing:", e));
              isPlaying.current = true;
            } else if (!entry.isIntersecting && isPlaying.current) {
              mediaRef.current.pause();
              isPlaying.current = false;
            }
          });
        },
        { threshold: 0.5 }
      );

      observerRef.current.observe(mediaRef.current);
      return () => observerRef.current.disconnect();
    }
  }, []);

  const handleLike = async () => {
    if (user.username === "visitor") {
      alert("Login to react");
      return;
    }

    try {
      if (!liked) {
        const res = await axios.post("/api/dbhandler?model=likes", {
          userId: user.id,
          contentId: post.id
        });

        setLikeId(res.data.id);
        setLiked(true);
      } else {
        await axios.delete(`/api/dbhandler?model=likes&id=${likeId}`);
        setLiked(false);
        setLikeId(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveComment = async () => {
    if (user.username === "visitor") {
      alert("Login to comment");
      return;
    }

    try {
      const res = await axios.post("/api/dbhandler?model=comments", {
        userId: user.id,
        username: user.username,
        contentId: post.id,
        comment: comment
      });

      if (res.status === 200) {
        setComment("");
        setReload(!reload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/dbhandler?model=posts&id=${post.id}`);
      setDeleted(true);
      alert("Post deleted");
    } catch (error) {
      console.error(error);
    }
  };

  function formatDate(dateString) {
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

  return (
    <div className="mt-10 flex flex-col rounded-sm w-[100vw] max-w-sm overflow-clip">

      {/** DELETE BUTTON FOR ADMINS */}
      {(user.role === "admin" || user.role === "moderator") && (
        <Button
          variant="destructive"
          className="ml-2"
          onClick={handleDelete}
          disabled={deleted}
        >
          {deleted ? "Deleted" : "Delete"}
        </Button>
      )}

      <div className="w-full flex flex-col justify-center items-center">
        <div className="w-full flex flex-row">
          <img
            src={
              post?.user?.avatarUrl ??
              "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png"
            }
            className="w-10 h-10 rounded-full m-1"
          />
          <div className="flex flex-row w-full">
            <div className="flex-1 text-xl font-semibold px-3">
              {post.user?.username || "User"}
            </div>
            <div className="flex flex-col text-xs">
              <div>{formatDate(post.updatedAt)}</div>
            </div>
          </div>
        </div>

        {/** MEDIA */}
        <div className="w-full flex flex-col items-center">
          {post.type === "image" && <img src={post.url} className="w-full" />}

          {post.type === "video" && (
            <video
              ref={mediaRef}
              src={post.url}
              className="w-full max-w-[360px]"
              onCanPlay={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          )}

          {post.type === "audio" &&
            (isLoading ? (
              <Skeleton className="w-full h-[50px]" />
            ) : (
              <audio ref={mediaRef} src={post.url} controls />
            ))}
        </div>

        {/** TEXT SECTION */}
        <div className="w-full bg-secondary pb-2">

          <div className="p-2">
            {post.for !== "post" && (
              <div className="font-semibold text-lg">{post.title}</div>
            )}
            <div>{post.post}</div>
          </div>

          <div className="px-2 flex gap-2 items-center">{likeCount} <BiSolidLike /></div>

          {/** ACTION BUTTONS */}
          <div className="w-full flex gap-2 px-2 mt-1">
            <Button className={`flex-1 text-2xl ${liked ? "bg-blue-500 text-white" : ""}`} onClick={handleLike}>
              {liked ? <BiSolidLike /> : <BiLike />}
            </Button>

            {/* DRAWER TRIGGER */}
            <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 text-2xl text-accent border-2 border-accent"
                >
                  <BiComment />
                </Button>
              </DrawerTrigger>

              {/** COMMENT DRAWER */}
              <DrawerContent className="max-w-lg mx-auto pb-10">

                <DrawerHeader>
                  <DrawerTitle className="text-center text-xl">
                    Comments
                  </DrawerTitle>
                </DrawerHeader>

                {/** COMMENTS LIST FIRST */}
                <div className="max-h-[55vh] overflow-y-auto px-4">
                  <Comments videoId={post.id} reload={reload} />
                </div>

                {/** FORM AT THE BOTTOM */}
                <div className="flex flex-col gap-3 px-4 mt-4">
                  <div className="font-semibold">@{user.username}</div>

                  <TextArea
                    onChange={e => setComment(e.target.value)}
                    value={comment}
                    className="h-[120px]"
                  />

                  <DrawerFooter className="flex flex-row gap-2">
                    <DrawerClose asChild>
                      <Button variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </DrawerClose>

                    <Button
                      className="flex-1"
                      disabled={comment.length < 1}
                      onClick={saveComment}
                    >
                      Send
                    </Button>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
