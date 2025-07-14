"use client"
// import { Button } from '@/components/ui/button'
import React from 'react'
import content from '../../../data/content';
import { useAppContext } from "@/hooks/useAppContext";
import { useEffect, useState } from "react";
import { getVideos, postVideo } from "../../../app/api/api_videos";
import { Button } from "@/components/button";
import { NewVideoType, VideoType } from "@/types/videoType";
import Video from "@/components/video";
import Modal from "@/components/modal";
import TextArea from "@/components/textArea";
import { videoBlank } from "@/utils/constants";
// import Input from "@/components/input";
import { Input } from '@/components/ui/input';
import { VideoCard } from '@/app/videos/[id]/page';
import { ScrollArea } from '@/components/ui/scroll-area';


const VideoComponent = () => {

  const { videos, setVideos, user, isList, isModal, setIsModal, useMock, selectedVideo, setSelectedVideo } = useAppContext();
  const [classes, setClasses] = useState("");
  const [video, setVideo] = useState<NewVideoType>(videoBlank);

  useEffect(() => {
    // if (!user.userName) return;
    getVideos(user.userName, useMock)
      .then((res) => setVideos(res.videos))
      .catch((err) => console.log(err));
  }, [setVideos, useMock]);//user.userName,

  useEffect(() => {
    const newClasses = isList
      ? "w-full flex flex-col overflow-x-hidden"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4";
    setClasses(newClasses);
  }, [isList]);

  const validate = () =>
    !!(video.title && video.video_url && video.description);

  const showModal = () => {
    setIsModal(true);
  };

  const onChange = (key: string, value: string) => {
    setVideo({ ...video, [key]: value });
  };

  const saveVideo = () => {
    if (!validate()) return;
    const newVideo: NewVideoType = { ...video, user_id: user.userName };

    postVideo(newVideo)
      .then((res) => {
        // request a list of new videos, because there is no ID  in the response
        getVideos(user.userName, useMock)
          .then((res) => setVideos(res.videos))
          .catch((err) => console.log(err));
      })
      .finally(() => setVideo(videoBlank));
    setIsModal(false);
  };





  return (
    <div className="flex flex-col items-center md:justify-center max-w-5xl mx-auto h-full overflow-hidden">
        <div className="flex flex-row items-center justify-between m-10 px-2 md:px-10 w-full">
          <div className="text-center text-4xl font-semibold">Video</div>
          {/* <Button variant={"outline"} className="border-accent text-accent text-lg  bg-transparent hover:text-slate-100 hidden md:flex">add video admin</Button> */}
          <button className="border-accent border-2 rounded-md px-2 text-primary text-lg  bg-transparent hover:text-accent /hover:text-slate-100 hidden md:flex">add video admin</button>
        </div>
        <ScrollArea className="flex flex-col justify-center items-center w-full max-h-[500px]">
          <div className="flex flex-col justify-center items-center mx-5 gap-10 w-full max-w-3xl">
            {videos?.map((video: any)=>{
              return (
                // <video src={video.url} key={index} width="240px" controls autoPlay muted loop></video>
                <div key={video.id}>
                  <VideoCard videoObj={video} useMock={true} portrait={true} />
                </div>
              )
            })}
          </div>
        </ScrollArea>
        
    </div>
  )
}

export default VideoComponent




        // <section className="relative flex flex-col justify-center items-center mx-5 gap-10 w-full max-w-3xl">
        //   <h1 className="w-full text-center text-xl mb-2">
        //     Greetings,{" "}
        //     <span className="font-bold text-blue-600">{user.userName}</span>
        //   </h1>
        //   <h2 className="w-full text-center font text-base mb-4">
        //     Welcome to the Video Player
        //   </h2>
        //   <Button value="Add video" onClick={showModal} />
        //   <div className={classes}>
        //     {videos?.map((video: VideoType) => {
        //       return <Video key={video.id} video={video} />;
        //     })}
        //   </div>



        //   {/*needed when you click the add video button */}
        //   {isModal && (
        //     <Modal
        //       close={() => setIsModal(false)}
        //       save={saveVideo}
        //       isSaveAllowed={validate()}
        //     >
        //       <h3 className="text-base">
        //         <span className="font-semibold">{user.userName}</span>
        //         {", "}
        //         <span>new video will be assigned to you</span>
        //       </h3>
        //       <Input
        //         placeholder="Title"
        //         onChange={(e) => onChange("title", e.target.value)}
        //         value={video.title}
        //       />
        //       <Input
        //         placeholder="URL"
        //         onChange={(e) => onChange("video_url", e.target.value)}
        //         value={video.video_url}
        //       />
        //       <TextArea
        //         placeholder="Description"
        //         onChange={(e) => onChange("description", e.target.value)}
        //         value={video.description}
        //       />
        //     </Modal>
        //   )}
        // </section>