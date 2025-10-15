"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
import Posts from '@/components/myComponents/subs/posts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppContext } from '@/hooks/useAppContext';
import { Button } from '@/components/ui/button';
import { PostButton } from '@/components/myComponents/subs/fileupload';
// import { useRouter } from 'next/navigation'; // <-- Use next/navigation for App Router
import { useSearchParams } from 'next/navigation';


const Blog = () => {
  const { origin, user } = useAppContext();
  // const { media, page } = useRouter().query || {}; // Safeguard against undefined
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const media = searchParams.get('media');
  alert(media?.toString())

  let plan = "a tab for community account posts, projects done, testimonies, upcoming event posts date/calendar";

  return (
    <Tabs defaultValue={page?.toString()} className="flex flex-col lg:flex-row gap-[60px] mt-5">
      <TabsList className="flex flex-row lg:flex-col w-full max-w-sm lg:max-w-[280px] xl:max-w-[340px] max-h-[240px] mx-auto xl:mx-0 gap-2 lg:gap-6 ">
        <TabsTrigger value="praisevideo" className='rounded-full flex-1 max-h-12'>Praise</TabsTrigger>
        <TabsTrigger value="worshipvideo" className='rounded-full flex-1 max-h-12'>Worship</TabsTrigger>
        <TabsTrigger value="post" className='rounded-full flex-1 max-h-12'>Posts</TabsTrigger>
      </TabsList>

      <ScrollArea className="lg:h-[80vh] w-full">
        <TabsContent value="praisevideo" className="w-full">
          <Posts page="praisevideo" media={page === 'praisevideo' ? media?.toString() : ''} />
        </TabsContent>
        <TabsContent value="worshipvideo" className="w-full">
          <Posts page="worshipvideo" media={page === 'worshipvideo' ? media?.toString() : ''} />
        </TabsContent>
        <TabsContent value="post" className="w-full">
          <Posts page="post" media={page === 'post' ? media?.toString() : ''} />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};

export default Blog;
