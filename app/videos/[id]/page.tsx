"use client";
import { getVideo, putVideo } from "@/app/api/api_videos";
import { Button } from "@/components/button";
import Comments from "@/components/comments";
import Input from "@/components/input";
import VideoSelector from "@/components/videoSelector";
import TextArea from "@/components/textArea";
import { useAppContext } from "@/hooks/useAppContext";
import { VideoType } from "@/types/videoType";
import { videoBlank } from "@/utils/constants";
import { useParams, useSearchParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { BiDownload, BiLike } from "react-icons/bi";

const VideoPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();
  const id = params.id as string;
  const [edit, setEdit] = useState(searchParams.get("edit") === "true");
  const [updVideo, setUpdVideo] = useState<VideoType>({ ...videoBlank, id });

  useEffect(() => {
    if (id)
      getVideo(id, useMock).then((res) => {
        if (res) {
          setSelectedVideo(res.video);
          setUpdVideo(res.video);
        }
      });
  }, [id, setSelectedVideo, useMock]);

  const changeVideoDetails = (
    key: string,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (updVideo) {
      setUpdVideo({
        ...updVideo,
        [key]: e.target.value,
      });
    }
  };

  const editVideoDetails = () => {
    setEdit(true);
  };

  const saveChanges = () => {
    setEdit(false);
    if (updVideo?.title || updVideo?.description) {
      const updatedVideo = { ...selectedVideo, ...updVideo };
      setSelectedVideo(updatedVideo);
      putVideo(updatedVideo);
    }
  };

  if (!selectedVideo?.id) return null;

  return (
    <section className="w-full flex flex-col justify-center items-center">
      {/* responsible for the arrows used to change video ontop */}
      <VideoSelector />

      {/* it is the component with the video name */}
      <Input
        className={`text-base font-semibold ${edit ? "bg-m-contrast" : ""}`}
        disabled={!edit}
        value={edit ? updVideo?.title : selectedVideo.title}
        onChange={(e) => {
          if (edit) changeVideoDetails("title", e);
        }}
      />

      <TextArea
        className={`text-base ${edit ? "bg-m-contrast" : ""}`}
        disabled={!edit}
        value={edit ? updVideo?.description : selectedVideo.description}
        onChange={(e) => {
          if (edit) changeVideoDetails("description", e);
        }}
      />

      {edit ? (
        <Button
          className="block can-hover w-40"
          onClick={saveChanges}
          disabled={!updVideo?.title || !updVideo?.description}
          value="Save changes"
        />
      ) : (
        <Button
          className="block can-hover w-40"
          value="Edit video"
          onClick={editVideoDetails}
        />
      )}

      <video controls src={selectedVideo.video_url} className="w-full my-2 max-w-3xl" />
      <h6 className="text-xs text-gray-400 italic">
        <span>User: </span>
        {selectedVideo.user_id}
      </h6>


      <Comments videoId={selectedVideo.id} />
    </section>
  );
};


export function VideoCard(props : {videoObj : any , useMock : boolean, portrait : boolean}) {
  
  return (
    <div className='mt-10 rounded-sm w-full overflow-clip max-w-lg'>
      <div className='w-full flex flex-col my-2 max-w-[360px] justify-center items-center overflow-clip'>
        <div className='w-full flex flex-row'>
          <img src={"./placeholderMale.jpg"} alt="" className='w-10 h-10 rounded-full m-1'/>
          <div className='flex flex-row w-full'>
            <div className=' flex-1 text-xl font-semibold px-3'>Posters name</div>
            {/* <div className='text-sm w-14'>{props.time}</div> */}
          </div>
        </div>
        <div className="min-h-[450px] flex-1 flex flex-col bg-secondary justify-center items-center">
          <video controls src={props.videoObj.video_url} className="w-full" />
        </div>
        <div className="w-full bg-secondary pb-2">
          <div className='w-full px-1'>{props.videoObj.description}</div>
          <div className='w-full flex flex-row justify-between px-4 mt-1 mb-2 gap-2'>
            <button  className='px-10 rounded-full text-2xl border-2 border-primary'><BiLike /></button>
            {/* <button  className='flex-1 text-2xl'><BiComment /></button> */}
            <button className='px-10 rounded-full text-2xl border-2 border-primary'><BiDownload /></button>
          </div>
          <Comments videoId={props.videoObj.id}  />
        </div>
      </div>
      
    </div>
    // <section className="w-full flex flex-col justify-center items-center">
      
      
    // </section>
  );
}


export default VideoPage;

