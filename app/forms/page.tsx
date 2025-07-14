"use client"

import AudioForm from '@/prisma/forms/AudioForm'
import BillboardForm from '@/prisma/forms/BillboardForm'
import BookForm from '@/prisma/forms/BookForm'
import CommentForm from '@/prisma/forms/CommentForm'
import DepartmentForm from '@/prisma/forms/DepartmentForm'
import LikeForm from '@/prisma/forms/LikeForm'
import MinistryForm from '@/prisma/forms/MinistryForm'
import UserForm from '@/prisma/forms/UserForm'
import VideoForm from '@/prisma/forms/VideoForm'
import CrudForm from '@/prisma/forms/forms'
import React, { useState } from 'react'
import { CldUploadButton, CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/hooks/useAppContext'



const page = () => {
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();
  const [resource, setResource] = useState();
  return (
    <div className='flex flex-col justify-center items-center w-full'>
        <div className='flex flex-col justify-center items-center my-2'>
          {/* <CldUploadButton uploadPreset="v4zhm5t2" /> */}

          {/* <CldUploadWidget uploadPreset="v4zhm5t2">
            {({ open }) => {
              return (
                <button onClick={() => open()}>
                  Upload an Image
                </button>
              );
            }}
          </CldUploadWidget> */}
          <CldUploadWidget
            uploadPreset="v4zhm5t2"
            onSuccess={(result, { widget }) => {
              // setResource(result?.info);  // { public_id, secure_url, etc }
            }}
            onQueuesEnd={(result, { widget }) => {
              widget.close();
            }}
          >
            {({ open }) => {
              function handleOnClick() {
                setResource(undefined);
                open();
              }
              return (
                <Button onClick={handleOnClick}>
                  Upload an Image
                </Button>
              );
            }}
          </CldUploadWidget>
        </div>

        <div className='grid grid-cols-3 gap-2 my-4 mx-2'>
          <VideoForm />
          <AudioForm />
          <BookForm />
          <UserForm />
          <DepartmentForm />
          <MinistryForm />
          <BillboardForm />
          <LikeForm />
          <CommentForm />

           
          <CrudForm model="departments" />
        </div>
    </div>
  )
}

export default page