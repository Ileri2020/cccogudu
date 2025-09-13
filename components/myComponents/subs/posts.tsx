"use client";
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BiLike, BiSolidLike, BiComment, BiDownload } from 'react-icons/bi'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/hooks/useAppContext'
// import Modal from '@/components/modal'
import TextArea from '@/components/textArea'
import { ChevronsUpDown } from "lucide-react";
import { commentsObject } from "@/mock/comments";
import { BASE_URL, headers } from "@/utils/constants";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CommentCard from '@/components/commentCard';
import { PrismaClient } from '@prisma/client';
import deletemanypost, { createManyPosts } from './postaction';
import { Skeleton } from '@/components/ui/skeleton';
import Post from './post';






const Posts = ({ page, media='' }) => {
  const [allPosts, setAllPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('random');
  const [postTypes, setPostTypes] = useState({
    video: true,
    audio: true,
    image: true,
  });
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [currentChunk, setCurrentChunk] = useState(0);
  const postsPerChunk = 2;
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  const fetchAllPosts = () => {
    axios.get('/api/dbhandler', {
      params: { model: 'posts' },
    })
      .then(response => {
        const posts = response.data;
        let filteredPosts = posts.filter(post => post.for === page && postTypes[post.type]);
        filteredPosts = sortPosts(filteredPosts, sortOrder);

        // If media is not empty, prioritize the post with id matching media
        if (media !== '') {
          const mediaPostIndex = filteredPosts.findIndex(post => post.id === media);
          if (mediaPostIndex !== -1) {
            const mediaPost = filteredPosts.splice(mediaPostIndex, 1)[0];
            filteredPosts = [mediaPost, ...filteredPosts]; // Place media post at top
          }
        }

        setAllPosts(filteredPosts);
        setDisplayedPosts(filteredPosts.slice(0, postsPerChunk));
        setCurrentChunk(0);
      })
      .catch(error => console.error(error));
  };
  

  const sortPosts = (posts, order) => {
    if (order === 'asc') {
      return posts.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    } else if (order === 'desc') {
      return posts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (order === 'random') {
      return [...posts].sort(() => Math.random() - 0.5); // Fisher-Yates shuffle alternative
    }
    return posts;
  };


  useEffect(() => {
    fetchAllPosts();
  }, [sortOrder, postTypes, page]);


  useEffect(() => {
    if ('IntersectionObserver' in window && loadMoreRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && displayedPosts.length < allPosts.length) {
          handleLoadMore();
        }
      }, {
        rootMargin: '100px', // Load when 100px from viewport
      });
      observerRef.current.observe(loadMoreRef.current);
      return () => observerRef.current.disconnect();
    }
  }, [displayedPosts, allPosts]);

  const handleSortChange = (e) => setSortOrder(e.target.value);
  const handlePostTypeChange = (e) => {
    setPostTypes({ ...postTypes, [e.target.name]: e.target.checked });
  };

  const handleLoadMore = () => {
    const nextChunk = currentChunk + 1;
    const start = nextChunk * postsPerChunk;
    const end = start + postsPerChunk;
    const newDisplayedPosts = [...displayedPosts, ...allPosts.slice(start, end)];
    setDisplayedPosts(newDisplayedPosts);
    setCurrentChunk(nextChunk);
  };

  if (!allPosts.length) return <div>Loading...</div>;

  return (
    <div className='flex flex-col w-fit mx-auto'>
      {/* Controls */}
      <div className="flex flex-row justify-between">
        <select value={sortOrder} onChange={handleSortChange}>
          <option value="random">Random</option>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <div>
          <label>
            <input type="checkbox" name="video" checked={postTypes.video} onChange={handlePostTypeChange} />
            Video
          </label>
          <label className="ml-4">
            <input type="checkbox" name="audio" checked={postTypes.audio} onChange={handlePostTypeChange} />
            Audio
          </label>
          <label className="ml-4">
            <input type="checkbox" name="image" checked={postTypes.image} onChange={handlePostTypeChange} />
            Image
          </label>
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

      {/* Load Trigger */}
      {displayedPosts.length < allPosts.length && (
        <div ref={loadMoreRef}>
          {'IntersectionObserver' in window ? (
            <div className="invisible">Loading...</div> // Trigger for observer
          ) : (
            <button onClick={handleLoadMore}>Load More</button> // Fallback button
          )}
        </div>
      )}
    </div>
  );
};


export default Posts;















const Comments = ( props : {videoId : string}) => {
  const { user } = useAppContext();
  const [compComments, setCompComments] = useState([]); //<CommentType[]>

  const getComments = async (videoId: string) => {
    try {
      const res = await axios.get(`/api/dbhandler?model=comments&id=${videoId}`);
      //console.log(res.data)
      setCompComments(res.data)
     return;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getComments(props.videoId)
  }, []);
  

  if (!props.videoId) return;
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2 px-2"
    >
      <div className="flex items-center justify-between space-x-4 px-4">
        <CollapsibleTrigger asChild>
          <div className="w-full rounded-md border px-2 py-1 /hover:bg-secondary/90">
            {compComments?.length<1 ? <div>... no comment</div> : <div>
              <CommentCard 
                username={compComments?.at(0)?.username} 
                createdAt={compComments?.at(0)?.createdAt} 
                comment={compComments?.at(0)?.comment}
                id={compComments?.at(0)?.id}
              />
              <div className="text-sm text-foreground/50">...more</div>
            </div>}
            {/* <div><ChevronsUpDown className="h-4 w-4" /></div> */}
          </div>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-2">
        {/* <Button onClick={showModal}>Add comment</Button> */}

        {compComments?.map((comment) => (
          <div key={comment.id}>
            <CommentCard 
              username={comment.username} 
              createdAt={comment.createdAt} 
              comment={comment.comment} 
              id={comment.id}
            />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

