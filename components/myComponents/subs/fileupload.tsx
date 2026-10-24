// @ts-nocheck
"use client"
import React, { FormEvent, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { useAppContext } from '@/hooks/useAppContext'
import { CldUploadWidget } from 'next-cloudinary'
import {cloudUpload, uploadCloudinary} from '@/server/config/cloudinary'
import { CiCamera, CiCirclePlus } from 'react-icons/ci'
import { BiPlus } from 'react-icons/bi'
import { cn } from '@/lib/utils'
import { AuthRequiredDialog } from '@/components/myComponents/subs/AuthRequiredDialog'
import { toast } from 'sonner'


















export const ProfileImg = () => {
  const { selectedVideo, setSelectedVideo, useMock, user, setUser } = useAppContext();
  const [formData, setFormData] = useState({
    description: '',
    type: 'image',
    userId: user.id,
    title: 'profile image',
    for: 'post',
  });

  const [preview, setPreview] = useState(null);
  const [uploadStatus , setUploadStatus] = useState("");

  const [file, setFile] = useState(null);


  const form = useRef<HTMLFormElement>(null);

//   const fetchUsers = async () => {
//     const res = await axios('/api/dbhandler?model=users');
//     setUsers(res.data);
//   };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const pformData = new FormData();
    pformData.append("file", file);
    pformData.append("description", formData.description)
    pformData.append("type", formData.type)
    pformData.append("userId", user.id)
    pformData.append("title", formData.title)
    pformData.append("profileImage", "true")
    pformData.append('for', formData.for)
    
    try {
          const response = await axios.post(
            `/api/dbhandler?model=posts`,
            pformData,
            {
              headers: { "Content-Type": "multipart/form-data" }
            }
          );
      if (response.status === 200) {
        const data = response.data;
        // do something with the data
        console.log(data)
        setUser({...user, avatarUrl : data.url});
      } else {
        alert("wrong input or connection error")
      }
    } catch (error) {
      // handle error
      console.error(error);
    }
    resetForm();
    // fetchUsers();
  };

  // const handleDelete = async (id) => {
  //   await axios.delete(`/api/dbhandler?model=users&id=${id}`);
  //   fetchUsers();
  // };

  const resetForm = () => {
    setPreview(null)
    setFormData({
    description: '',
    type: 'image',
    userId: user.id,
    title: 'profile image',
    for: 'post',
  });
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile.size > 3 * 1024){
      alert("file size greater than 300kb file may not upload")
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }
  

  useEffect(() => {
    // if (file) {
    //     setPreview(URL.createObjectURL(file))
    // }
  }, [preview,]);

  

  return (
    <div className='absolute inline z-10 translate-x-[140px] translate-y-[140px]'>
      <Drawer>
        <DrawerTrigger asChild className='w-12 h-12 flex items-center rounded-full font-bold text-accent text-2xl border-2 border-accent p-2 hover:text-primary hover:bg-accent/40 place-self-end self-end z-10'>
            <CiCamera />
        </DrawerTrigger>
        <DrawerContent className='flex flex-col justify-center items-center py-10 /bg-red-500 max-w-5xl mx-auto'>

          <DrawerHeader>
            <DrawerTitle className='w-full text-center'>Edit your profile image (300kb max)</DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-10 bg-secondary rounded-xl max-w-xl"> 
            
            {preview && (
              <div style={{ marginTop: '1rem' }}>
                <img src={preview} alt="Selected preview" style={{ maxHeight: '300px' }} />
              </div>
            )}
            <div>{user.id}</div>
            <Input
              type="file"
              name='image'
              id='image'
              placeholder="Avatar URL"
              // value={formData.avatarUrl || ''}
              // onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              onChange={handleImageChange}
            />
            
            <DrawerFooter className="flex flex-row w-full gap-2 mt-2">
              {/* <Button>Submit</Button> */}
              <DrawerClose className='flex-1' asChild>
                <Button className='flex-1' variant="outline">Cancel</Button>
              </DrawerClose>
              <Button type="submit" className="flex-1 before:ani-shadow w-full">Upload &rarr;</Button>
            </DrawerFooter>
          </form>
          {/* <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter> */}
        </DrawerContent>
      </Drawer>
    </div>
  )
}










export interface PostButtonProps {
  defaultFor?: string;
  className?: string;
  children?: React.ReactNode;
  onPostSuccess?: () => void;
}

export const PostButton: React.FC<PostButtonProps> = ({
  defaultFor = "post",
  className = "",
  children,
  onPostSuccess,
}) => {
  const { user } = useAppContext();
  const isLoggedIn = Boolean(
    user &&
    user.id &&
    user.id !== "nil" &&
    user.username !== "visitor" &&
    user.email !== "nil"
  );
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    for: defaultFor,
    description: "",
    type: "image",
    userId: user.id,
  });

  const form = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));

    const type = selected.type.split("/")[0];
    setFormData({ ...formData, type });
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
    setFormData({
      title: "",
      for: defaultFor,
      description: "",
      type: "image",
      userId: user.id,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Select a file before posting.");
      return;
    }
    if (!isLoggedIn) {
      toast.error("Login or create an account to make a post.");
      setAuthDialogOpen(true);
      return;
    }

    try {
      // Get Cloudinary signature from server
      const sigRes = await axios.get("/api/cloudinary-signature");
      const { signature, timestamp, cloudName, apiKey } = sigRes.data;

      // Prepare FormData for Cloudinary
      const data = new FormData();
      data.append("file", file);
      data.append("api_key", apiKey);
      data.append("timestamp", timestamp);
      data.append("signature", signature);

      // Upload to Cloudinary
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );

      const fileUrl = cloudRes.data.secure_url;

      // POST to backend
      await axios.post(`/api/dbhandler?model=posts`, {
        ...formData,
        userId: user.id,
        url: fileUrl,
      });

      toast.success("Your post was published successfully.");
      resetForm();
      setDrawerOpen(false);
      if (onPostSuccess) onPostSuccess();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.response?.data?.error || "Upload failed. Please try again.");
    }
  };

  return (
    <div className={cn("z-10", className || "w-full")}>
      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        title="Sign In to Post Media"
        description="You need to be logged in to post videos, songs, and media to the blog playlists."
      />
      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          if (open && !isLoggedIn) {
            setAuthDialogOpen(true);
            return;
          }
          setDrawerOpen(open);
        }}
      >
        <DrawerTrigger
          asChild
          onClick={(e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              e.stopPropagation();
              setAuthDialogOpen(true);
            }
          }}
        >
          {children ? (
            children
          ) : (
            <button className="w-full h-10 border-2 border-accent flex items-center justify-center gap-2 rounded-full font-bold text-accent text-2xl hover:text-accent hover:bg-accent/40">
            <BiPlus />
            </button>
          )}
        </DrawerTrigger>

        <DrawerContent className="flex flex-col justify-center items-center py-10 max-w-5xl mx-auto">
          <DrawerHeader>
            <DrawerTitle className="w-full text-center">
              Create a new post
            </DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>

          <form
            ref={form}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 p-10 bg-secondary rounded-xl max-w-xl"
          >
            {preview && (
              <div style={{ marginTop: "1rem" }}>
                {formData.type === "image" && (
                  <img src={preview} alt="preview" style={{ maxHeight: 300 }} />
                )}
                {formData.type === "video" && (
                  <video src={preview} controls style={{ maxHeight: 300 }} />
                )}
                {formData.type === "audio" && <audio src={preview} controls />}
                {formData.type === "document" && <p>Selected document: {file?.name}</p>}
              </div>
            )}

            <div>{user.username}</div>

            <Input type="file" onChange={handleFileChange} />

            {/* Title input */}
            <Input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            {/* 'For' select input */}
            <select
              value={formData.for}
              onChange={(e) => setFormData({ ...formData, for: e.target.value })}
            >
              <option value="ccc">CCC Hymns & Heritage</option>
              <option value="ccc">CCC Hymns & Heritage</option>
              <option value="praisevideo">Praise Video</option>
              <option value="worshipvideo">Worship Video</option>
              <option value="post">post</option>
              <option value="event">Event</option>
              <option value="project">Projects</option>
              <option value="service">Service</option>
            </select>

            {/* Description input */}
            <Input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            {uploadProgress > 0 && (
              <progress value={uploadProgress} max={100}>
                {uploadProgress}%
              </progress>
            )}

            <DrawerFooter className="flex flex-row w-full gap-2 mt-2">
              <DrawerClose className="flex-1" asChild>
                <Button className="flex-1" variant="outline">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" className="flex-1 before:ani-shadow w-full">
                Upload &rarr;
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
};






