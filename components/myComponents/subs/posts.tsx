// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Post from "./post";

const Posts = ({ page, media = "" }) => {
  const [allPosts, setAllPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState("random");
  const [postTypes, setPostTypes] = useState({
    video: true,
    audio: true,
    image: true,
  });

  const postsPerChunk = 2;
  const currentChunkRef = useRef(0);
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  /** ----------------------------------------------------
   *  SORT POSTS (Stable, respects media priority)
   -----------------------------------------------------*/
  const sortPosts = (posts, order, mediaId) => {
    // keep stable when media is present and order= random
    if (mediaId && order === "random") return posts;

    if (order === "asc") {
      return [...posts].sort(
        (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
      );
    }

    if (order === "desc") {
      return [...posts].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    }

    // Normal random shuffle
    return [...posts].sort(() => Math.random() - 0.5);
  };

  /** ----------------------------------------------------
   *  ENSURE MEDIA POST IS ALWAYS FIRST
   -----------------------------------------------------*/
  const prioritizeMedia = (posts, mediaId) => {
    if (!mediaId) return posts;
    const normalized = String(mediaId);

    const index = posts.findIndex((p) => String(p.id) === normalized);
    if (index === -1) return posts;

    const mediaPost = posts[index];
    const others = posts.filter((p) => String(p.id) !== normalized);

    return [mediaPost, ...others];
  };

  /** ----------------------------------------------------
   *  FETCH ALL POSTS (only runs when relevant)
   -----------------------------------------------------*/
  const fetchAllPosts = useCallback(async () => {
    try {
      const response = await axios.get("/api/dbhandler", {
        params: { model: "posts" },
      });

      let posts = response.data;

      // Filter by page and content type
      posts = posts.filter(
        (post) => post.for === page && postTypes[post.type]
      );

      // Sort
      posts = sortPosts(posts, sortOrder, media);

      // Prioritize selected media
      posts = prioritizeMedia(posts, media);

      setAllPosts(posts);

      // Reset displayed posts to first chunk
      currentChunkRef.current = 0;
      setDisplayedPosts(posts.slice(0, postsPerChunk));
    } catch (error) {
      console.error(error);
    }
  }, [page, sortOrder, postTypes, media]);

  /** ----------------------------------------------------
   *  LOAD MORE POSTS
   -----------------------------------------------------*/
  const loadMore = () => {
    const nextChunk = currentChunkRef.current + 1;
    const start = nextChunk * postsPerChunk;
    const end = start + postsPerChunk;

    const nextPosts = allPosts.slice(start, end);

    if (nextPosts.length === 0) return;

    currentChunkRef.current = nextChunk;
    setDisplayedPosts((prev) => [...prev, ...nextPosts]);
  };

  /** ----------------------------------------------------
   *  OBSERVER FOR INFINITE SCROLL
   -----------------------------------------------------*/
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "120px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [allPosts]);

  /** ----------------------------------------------------
   *  FETCH POSTS WHEN SETTINGS CHANGE
   -----------------------------------------------------*/
  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  /** ----------------------------------------------------
   *  HANDLERS
   -----------------------------------------------------*/
  const handleSortChange = (e) => setSortOrder(e.target.value);
  const handleTypeChange = (e) => {
    setPostTypes((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  if (!allPosts.length) return <div>Loading...</div>;

  /** ----------------------------------------------------
   *  UI
   -----------------------------------------------------*/
  return (
    <div className="flex flex-col w-fit mx-auto">
      {/* Controls */}
      <div className="flex flex-row justify-between mb-4">
        <select value={sortOrder} onChange={handleSortChange}>
          <option value="random">Random</option>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>

        <div className="flex gap-4 ml-4">
          {["video", "audio", "image"].map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                name={type}
                checked={postTypes[type]}
                onChange={handleTypeChange}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Posts */}
      {displayedPosts.length > 0 ? (
        displayedPosts.map((post, index) => (
          <div key={post.id}>
            <Post post={{ ...post, index }} />
          </div>
        ))
      ) : (
        <div>No {page}s available.</div>
      )}

      {/* Infinite scroll trigger */}
      {displayedPosts.length < allPosts.length && (
        <div ref={loadMoreRef} className="h-10 invisible">
          Loading...
        </div>
      )}
    </div>
  );
};

export default Posts;