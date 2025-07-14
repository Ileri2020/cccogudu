"use client";
import { useAppContext } from "@/hooks/useAppContext";
// import {
//   ChevronDoubleLeftIcon,
//   ChevronDoubleRightIcon,
//   ChevronRightIcon,
//   ChevronLeftIcon,
// } from "@heroicons/react/24/outline";
import { BsChevronDoubleLeft, BsChevronDoubleRight, BsChevronRight, BsChevronLeft } from "react-icons/bs";
import Link from "next/link";

const VideoSelector = () => {
  const { videos, selectedVideo } = useAppContext();

  if (!selectedVideo?.id || videos.length === 0) return null;

  const current = videos.findIndex((video) => video.id === selectedVideo?.id);
  const lastIdx = videos.length - 1;

  const prev = current > 0 ? current - 1 : 0;
  const next = current < lastIdx ? current + 1 : lastIdx;

  const renderLink = (index: number, icon: JSX.Element, isSpan: boolean) => {
    if (isSpan)
      return <span className="rounded-full p-1 text-m-base-start">{icon}</span>;
    else
      return (
        <Link
          className="rounded-full p-1 text-blue-500 hover:text-m-base-contrast hover:bg-m-hover transition duration-300 ease-in-out"
          href={`/videos/${videos[index].id}`}
        >
          {icon}
        </Link>
      );
  };

  return (
    <div className="flex items-center justify-center space-x-2 mb-2">
      {renderLink(0, <BsChevronDoubleLeft width={24} />, current === prev)}
      {renderLink(prev, <BsChevronLeft width={20} />, current === prev)}

      <span className="text-blue-500 text-normal font-semibold">
        {current + 1}
      </span>

      {renderLink(next, <BsChevronRight width={20} />, current === next)}
      {renderLink(
        lastIdx,
        <BsChevronDoubleRight width={24} />,
        current === next
      )}
    </div>
  );
};

export default VideoSelector;
