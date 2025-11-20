"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useEffect, useState } from 'react'
import Posts from '@/components/myComponents/subs/posts'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppContext } from '@/hooks/useAppContext'
import { PostButton } from '@/components/myComponents/subs/fileupload'

const Blog = () => {
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();

  const [initialTab, setInitialTab] = useState("praisevideo");  // default

  useEffect(() => {
    // Only run client-side
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");

      if (tab) {
        setInitialTab(tab);
      }
    }
  }, []);

  return (
    <Tabs defaultValue={initialTab} className="flex flex-col lg:flex-row gap-[60px] mt-5">
      <TabsList className="flex flex-row lg:flex-col w-full max-w-sm lg:max-w-[280px] xl:max-w-[340px] max-h-[300px] mx-auto xl:mx-0 gap-2 lg:gap-6 ">
        <TabsTrigger value="praisevideo" className='rounded-full flex-1'>Praise</TabsTrigger>
        <TabsTrigger value="worshipvideo" className='rounded-full flex-1'>Worship</TabsTrigger>
        <TabsTrigger value="post" className='rounded-full flex-1'>Posts</TabsTrigger>
        <TabsTrigger value="event" className='rounded-full flex-1'>Event</TabsTrigger>
        <TabsTrigger value="project" className='rounded-full flex-1'>Projects</TabsTrigger>
        <PostButton />
      </TabsList>

      <ScrollArea className="lg:h-[80vh] w-full">
        <TabsContent value="praisevideo" className="w-full">
          <Posts page="praisevideo" />
        </TabsContent>

        <TabsContent value="worshipvideo" className="w-full">
          <Posts page="worshipvideo" />
        </TabsContent>

        <TabsContent value="post" className="w-full">
          <Posts page="post" />
        </TabsContent>

        <TabsContent value="event" className="w-full">
          <Posts page="event" />
        </TabsContent>

        <TabsContent value="project" className="w-full">
          <Posts page="project" />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}

export default Blog





// Visiting /blog/?tab=praisevideo → “Praise” tab opens

// Visiting /blog/?tab=worshipvideo → “Worship” opens

// Visiting /blog?tab=event → “Event” opens

// No tab param → defaults to "praisevideo"