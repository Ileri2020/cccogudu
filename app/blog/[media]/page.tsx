"use client";

import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import Posts from "@/components/myComponents/subs/posts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const categories = [
  { value: "worship", label: "Worship" },
  { value: "praise", label: "Praise" },
  { value: "ccc", label: "CCC" },
  { value: "bible", label: "Bible" },
  { value: "hymns", label: "Hymns" },
  { value: "dance", label: "Dance" },
  { value: "musical", label: "Musical" },
  { value: "post", label: "Posts" },
];

const normalizePage = (value: string | null) => {
  if (value === "praisevideo") return "praise";
  if (value === "worshipvideo") return "worship";
  return value;
};

const Blog = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  // FIX: ensure it is always a string
  const media = Array.isArray(params.media) ? params.media[0] : params.media;

  const requestedPage = normalizePage(searchParams.get("page"));
  const page = categories.some((category) => category.value === requestedPage) ? requestedPage! : "praise";

  return (
    <Tabs key={page} defaultValue={page} className="flex flex-col lg:flex-row gap-[60px] mt-5">
      <TabsList className="flex flex-row flex-wrap lg:flex-col w-full max-w-sm lg:max-w-[280px] xl:max-w-[340px] max-h-[70vh] overflow-y-auto mx-auto xl:mx-0 gap-2 lg:gap-4 ">
        {categories.map((category) => (
          <TabsTrigger key={category.value} value={category.value}>
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <ScrollArea className="lg:h-[80vh] w-full">
        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value}>
            {categories.slice(0, 7).some((item) => item.value === category.value) ? (
              <Posts page="media" category={category.value} media={media} />
            ) : (
              <Posts page={category.value} media={media} />
            )}
          </TabsContent>
        ))}
      </ScrollArea>
    </Tabs>
  );
};

export default Blog;
