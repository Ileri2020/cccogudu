"use client"
import React, { useEffect, useState } from 'react'
import { BiLike, BiSolidLike, BiComment, BiDownload } from 'react-icons/bi'
import { Button } from '@/components/ui/button'
import Comments from '@/components/comments'
import axios from 'axios'
import { useAppContext } from '@/hooks/useAppContext'
// import Modal from '@/components/modal'
import TextArea from '@/components/textArea'


const Post = ({post})=>{
  // ownerurl : 'https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png',  // owner : "Visitor",) 
  const { user, isModal, setIsModal } = useAppContext();
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [deleted, setDeleted] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [reload, setReload] = useState(false);
  // const {ownerurl, post, event} = props




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
    console.log('post id', post.id)
  }, [liked, reload]);


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
      console.log('about to post for comment id', post, 'comment', comment, 'index', post.index)
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
            <div className='text-sm w-14'>{formatDate(post.updatedAt)}</div>
          </div>
        </div>
        <div className='w-full flex flex-col justify-center items-center'>
          {post.type === 'image' && <img src={post.url} alt="" className='w-full m-1'/>}
          {post.type === 'video' && (
            <video controls src={post.url} className="w-full max-w-[360px] my-2" />
          )}
          {post.type === 'audio' && (
            <audio controls>
              <source src={post.url} type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>
          )}
        </div>
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
          <Modal
            close={() => setIsModal(false)}
            save={()=>{console.log('modal postId', post.id);saveComment(post.id)}}
            isSaveAllowed={comment.length > 0}
            className="bg-secondary overflow-clip"
          >
            <h3 className="text-base my-2">
              <span className="font-semibold">@{user.username}</span>
              {/* {", "}
              <span>
                a comment will be created
                 for the video &quot;
                {selectedVideo.title}
                &quot;
              </span> */}
            </h3>
            <TextArea onChange={(e) => setComment(e.target.value)} className="h-[15%]" />
          </Modal>
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

