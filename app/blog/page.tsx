"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import Posts from '@/components/myComponents/subs/posts'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppContext } from '@/hooks/useAppContext'
import { Button } from '@/components/ui/button'
import { PostButton } from '@/components/myComponents/subs/fileupload'

const Blog = () => {
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();
  let plan = "a tab for community account posts, projects done, testimonies, upcoming event posts date/calendar"
  return (
    <Tabs defaultValue="post" className="flex flex-col lg:flex-row gap-[60px] mt-5">
      <TabsList className="flex flex-row lg:flex-col w-full max-w-[380px] lg:max-w-[280px] xl:max-w-[340px] max-h-[240px] mx-auto xl:mx-0 gap-6 ">
        <TabsTrigger value="post" className='rounded-full flex-1'>Posts</TabsTrigger>
        <TabsTrigger value="event" className='rounded-full flex-1'>Event</TabsTrigger>
        <TabsTrigger value="project" className='rounded-full flex-1'>Projects</TabsTrigger>
        <TabsTrigger value="testimony" className='rounded-full flex-1'>Testimony</TabsTrigger>
        <PostButton />
      </TabsList>
      <ScrollArea className="lg:h-[80vh] w-full">
        <TabsContent value="post" className="w-full">
          <Posts page="post" />
        </TabsContent>
        <TabsContent value="event" className="w-full">
          <Posts page="event" />
        </TabsContent>
        <TabsContent value="project" className="w-full">
          <Posts page="project" />
        </TabsContent>
        <TabsContent value="testimony" className="w-full">
          <Posts page="testimony" />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}

export default Blog
