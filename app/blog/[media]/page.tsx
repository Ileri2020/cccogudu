"use client";

import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import Posts from "@/components/myComponents/subs/posts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const Blog = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  // FIX: ensure it is always a string
  const media = Array.isArray(params.media) ? params.media[0] : params.media;

  const page = searchParams.get("page");

  return (
    <Tabs defaultValue={page ?? "praisevideo"} className="flex flex-col lg:flex-row gap-[60px] mt-5">
      <TabsList className="flex flex-row lg:flex-col w-full max-w-sm lg:max-w-[280px] xl:max-w-[340px] max-h-[240px] mx-auto xl:mx-0 gap-2 lg:gap-6 ">
        <TabsTrigger value="praisevideo">Praise</TabsTrigger>
        <TabsTrigger value="worshipvideo">Worship</TabsTrigger>
        <TabsTrigger value="post">Posts</TabsTrigger>
      </TabsList>

      <ScrollArea className="lg:h-[80vh] w-full">
        <TabsContent value="praisevideo">
          <Posts page="praisevideo" media={media} />
        </TabsContent>
        <TabsContent value="worshipvideo">
          <Posts page="worshipvideo" media={media} />
        </TabsContent>
        <TabsContent value="post">
          <Posts page="post" media={media} />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};

export default Blog;
