"use client";
import { useAppContext } from "@/hooks/useAppContext";
import { VideoType } from "@/types/videoType";
import React, { useEffect, useState } from "react";
// import { PencilIcon } from "@heroicons/react/24/outline";
import { PencilIcon } from "lucide-react";
// import { TrashIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface VideoProps {
  video: VideoType;
}
interface VideoDataProps {
  video: VideoType;
  children?: React.ReactNode;
}

const Video: React.FC<VideoProps> = ({ video }) => {
  const { isList } = useAppContext();
  const [classes, setClasses] = useState("");

  useEffect(() => {
    const newClasses =
      "w-full text-nowrap " +
      (isList
        ? "flex flex-row items-center justify-between gap-2 p-2"
        : "border border-gray-400 rounded-lg p-4");
    setClasses(newClasses);
  }, [isList]);

  if (!video?.id) return null;

  return (
    <div className={classes}>
      {isList ? (
        <VideoRow video={video}>
          <VideoActions id={video.id} />
        </VideoRow>
      ) : (
        <VideoCard video={video}>
          <VideoActions id={video.id} />
        </VideoCard>
      )}
    </div>
  );
};

const VideoCard: React.FC<VideoDataProps> = ({ video, children }) => {
  return (
    <>
      <Link href={`/videos/${video.id}`}>
        <h3 className="overflow-hidden text-blue-500 font-medium">
          {video.title}
        </h3>
      </Link>
      <p className="overflow-hidden">{video.description}</p>
      <div className="w-full overflow-hidden">
        <a href={video.video_url} target="_blank" rel="noopener noreferrer">
          {video.video_url}
        </a>
      </div>
      <div className="w-full flex justify-between pt-2">
        <h6 className="text-xs text-gray-400 italic">{video.user_id}</h6>
        {children}
      </div>
    </>
  );
};

const VideoRow: React.FC<VideoDataProps> = ({ video, children }) => {
  return (
    <>
      <Link href={`/videos/${video.id}`} className="w-1/4 overflow-hidden">
        <h3 className="overflow-hidden text-blue-500 font-medium">
          {video.title}
        </h3>
      </Link>
      <p className="w-5/6 md:w-4/6 overflow-hidden">{video.description}</p>
      <h6 className="text-xs text-gray-400 italic hidden md:block md:w-1/12">
        {video.user_id}
      </h6>
      {children}
    </>
  );
};

const VideoActions: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  return (
    <div className="flex space-x-3">
      <PencilIcon
        width={20}
        className="hover:cursor-pointer text-green-600"
        onClick={() => router.push(`/videos/${id}?edit=true`)}
      />
      <TrashIcon width={20} className="hover:cursor-pointer text-red-600" />
    </div>
  );
};

export default Video;
