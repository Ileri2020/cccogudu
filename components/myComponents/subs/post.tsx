"use client"
import React, { useEffect, useRef, useState } from 'react'
import { BiLike, BiSolidLike, BiComment, BiDownload } from 'react-icons/bi'
import { Button } from '@/components/ui/button'
import Comments from '@/components/comments'
import axios from 'axios'
import { useAppContext } from '@/hooks/useAppContext'
// import Modal from '@/components/modal'
import TextArea from '@/components/textArea'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'



const Post = ({post})=>{
  const { user, origin } = useAppContext();
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [deleted, setDeleted] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [reload, setReload] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [postUrl, setPostUrl] = useState(`${origin}/blog/${post.id}?page=${post.for}`);





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
  

  const mediaRef = useRef(null);
  const observerRef = useRef(null);
  const isPlaying = useRef(false);

  useEffect(() => {
    fetchLikeCount()
    if (mediaRef.current && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isPlaying.current) {
            // Play if in viewport and not already playing
            mediaRef.current.play().catch(e => console.log('Play error:', e));
            isPlaying.current = true;
          } else if (!entry.isIntersecting && isPlaying.current) {
            // Pause if out of viewport and playing
            mediaRef.current.pause();
            isPlaying.current = false;
          }
        });
      }, {
        threshold: 0.5, // Trigger when 50% in viewport
      });
      observerRef.current.observe(mediaRef.current);
      return () => observerRef.current.disconnect();
    }
  }, [post.type, post.url]);


  const handleLike = async () => {
    if(user.username === "visitor" && user.email === "nil"){
      alert("Login to react")
      return
    }
    try {
      if (!liked) {
        const response = await axios.post('/api/dbhandler?model=likes', {
          userId: user.id,
          contentId: post.id,
        });
        if (response.status === 200) {
          setLikeId(response.data.id);
          setLiked(true);
        }
      } else {
        const response = await axios.delete(`/api/dbhandler?model=likes&id=${likeId}`);
        if (response.status === 200) {
          setLikeId(null);
          setLiked(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };



  const saveComment = async (id : any) => {
    if(user.username === "visitor" && user.email === "nil") {
      alert("Login to comment")
      return
    }
    try {
      const response = await axios.post('/api/dbhandler?model=comments', {
        userId: user.id,
        username: user.username,
        contentId: post.id,
        comment: comment,
      });
      if (response.status === 200) {
        setIsModal(false);
        setReload(true);
      }
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };



  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `last ${years} y`;
    } else if (months > 0) {
      return `last ${months} m`;
    } else if (days > 0) {
      return `last ${days} d`;
    } else if (hours > 0) {
      return `last ${hours} h`;
    } else if (minutes > 0) {
      return `last ${minutes} m`;
    } else {
      return 'just now';
    }
  }



const handleDelete = async () => {
  try {
    const response = await axios.delete(`/api/dbhandler?model=posts&id=${post.id}`);
    if (response.status === 200) {
      setDeleted(true);
      alert("Post deleted");
    }
  } catch (error) {
    console.error(error);
  }
};

  

  return (
    <div className='mt-10 flex flex-col rounded-sm w-[100vw] overflow-clip max-w-sm /max-h-[512px]'>
      {(user.role === "admin" || user.role === "moderator") && (
        <Button variant={"destructive"} className='ml-2' onClick={handleDelete} disabled={deleted}>
          {deleted ? "Deleted" : "Delete"}
        </Button>
      )}
      {/* {<div> <img src={props.owner} alt="" /> </div>} */}
      <div className='w-full flex flex-col justify-center items-center'>
      <div className='w-full flex flex-row'>
          <img src={(post?.user?.avatarUrl==undefined) ? 'https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png' : post.user.avatarUrl} alt="" className='w-10 h-10 rounded-full m-1'/>
          <div className='flex flex-row w-full'>
            <div className=' flex-1 text-xl font-semibold px-3'>{post?.user?.username == undefined ? "Engr Adepoju" : post.user.username} </div>
            <div className="flex flex-col text-xs">
              <div className='text-sm w-14'>{formatDate(post.updatedAt)}</div>
              <ShareButton textToCopy={postUrl} />
            </div>
          </div>
        </div>
        {/* <Link href={postUrl} className='relative'> */}
          <div className='w-full flex flex-col justify-center items-center'>
            {post.type === 'image' && <img src={post.url} alt="" className='w-full m-1'/>}
            {post.type === 'video' && (
              isLoading ? (
                <Skeleton className="w-full max-w-[360px] h-[200px] my-2" />
              ) : (
                <video
                  ref={mediaRef}
                  src={post.url}
                  className="w-full max-w-[360px] my-2"
                  onLoadedData={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                />
              )
            )}
            {post.type === 'audio' && (
              isLoading ? (
                <Skeleton className="w-full max-w-[360px] h-[50px] my-2" />
              ) : (
                <audio
                  ref={mediaRef}
                  src={post.url}
                  onLoadedData={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                />
              )
            )}
          </div>
        {/* </Link> */}
        <div className="w-full bg-secondary pb-2">
          <div className='w-full flex flex-col p-2'>
            {post.for !== 'post' && (
              <div className="w-full font-semibold text-lg">{post.title}</div>
            )}
            <div className='w-full'>{post.post}</div>
          </div>
          <div className='flex flex-row gap-2 px-2 items-center'>{likeCount} <BiSolidLike /></div>
          <div className='w-full flex flex-row gap-2 px-2 mt-1'>
            <Button className={`flex-1 text-2xl ${liked ? 'bg-blue-500 text-white' : ''}`} onClick={handleLike}>
              {liked ? <BiSolidLike /> : <BiLike />}
            </Button>
            <Button onClick={()=>setIsModal(true)} variant={"outline"} className='bg-transparent flex-1 text-2xl text-accent border-2 border-accent'>
              <BiComment />
            </Button>
            {/* <Button variant={"outline"} className='bg-transparent flex-1 text-2xl text-accent'>
              <BiDownload />
            </Button> */}
          </div>
          <Comments videoId={post.id}  />



          {isModal && (
            <div className="fixed inset-0 flex items-center justify-center z-10 bg-background/50">
              <div className="fixed inset-0 bg-black opacity-25" />
              <div
                className='bg-secondary overflow-clip relative flex flex-col sm:w-full md:w-3/4
                  min-h-[200px] max-h-[40%] p-4 bg-m-base-end border-2 border-accent rounded-lg'
                >
                <div className="font-semibold text-base my-2">@{user.username}</div>
                <TextArea onChange={(e) => setComment(e.target.value)} className="h-[15%]" />
                <div className="absolute flex gap-3 justify-center bottom-2 right-2 w-full max-w-sm">
                  <Button variant="outline" onClick={() => setIsModal(false)} className="flex-1">Cancel</Button>
                  <Button onClick={()=>saveComment(post.id)} disabled={!(comment.length > 0)} className="flex-1">Send</Button>
                </div>
              </div>
          </div>
          )}

        </div>
      </div>
    </div>
  )
}








export default Post






















interface ModalProps {
  children?: React.ReactNode;
  className?: string;
  close: () => void;
  save: () => any
  isSaveAllowed?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  children,
  className,
  isSaveAllowed,
  close,
  save,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-10 bg-background/50">
      <div className="fixed inset-0 bg-black opacity-25" />
      <div
        className={`/fixed relative flex flex-col sm:w-full md:w-3/4 min-h-[200px] max-h-[40%] p-4 bg-m-base-end border-2 border-accent rounded-lg
         ${className ? className : ""}`}
      >
        <div className="flex-1">{children}</div>
        <div className="absolute flex gap-3 justify-center bottom-2 right-2 w-full max-w-sm">
          <Button variant="outline" onClick={close} className="flex-1">Cancel</Button>
          <Button onClick={save} disabled={!isSaveAllowed} className="flex-1">Send</Button>
        </div>
      </div>
    </div>
  );
};






const ShareButton = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <Button variant='outline' onClick={handleCopy} className='/absolute /right-0 /top-[50%] h-4'>
      {isCopied ? 'Copied!' : 'Copy'}
    </Button>
  );
};

