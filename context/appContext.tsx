"use client";
import { UserProps } from "@/types/user";
import { VideoType } from "@/types/videoType";
import React, { createContext, useState, ReactNode } from "react";

interface Comment {
  id: number | string;
  contentId: string; // videoId
  userId: number | string;
  username: string;
  comment: string;
  createdAt: string | Date;
}

interface AppContextProps {
  origin: string;
  isList: boolean;
  setIsList: (isList: boolean) => void;
  videos: VideoType[];
  setVideos: (videos: VideoType[]) => void;
  selectedVideo: VideoType | null;
  setSelectedVideo: (selVideo: VideoType) => void;
  user: UserProps;
  setUser: (user: UserProps) => void;
  isModal: boolean;
  setIsModal: (isModal: boolean) => void;
  useMock: boolean;
  setUseMock: (useMock: boolean) => void;
  comments: Comment[];
  setComments: (comments: Comment[]) => void;
}

export const AppContext = createContext<AppContextProps | null>(null);

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [isList, setIsList] = useState(true);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [user, setUser] = useState<UserProps>({ 
    username: "visitor", 
    id: "nil", 
    email: "nil", 
    avatarUrl: "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png", 
    role: "user", 
    department: "nil", 
    contact: "xxxx" 
  });
  const [isModal, setIsModal] = useState(false);
  const [useMock, setUseMock] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const origin = 'http://localhost:3000';

  const appContextValues: AppContextProps = {
    origin,
    isList,
    setIsList,
    videos,
    setVideos,
    comments,
    setComments,
    selectedVideo,
    setSelectedVideo,
    user,
    setUser,
    isModal,
    setIsModal,
    useMock,
    setUseMock,
  };

  return (
    <AppContext.Provider value={appContextValues}>
      {children}
    </AppContext.Provider>
  );
};
