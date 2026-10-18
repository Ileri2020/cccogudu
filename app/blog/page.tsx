"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React, { useEffect, useRef, useState } from 'react'
import Posts from '@/components/myComponents/subs/posts'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppContext } from '@/hooks/useAppContext'
import { PostButton } from '@/components/myComponents/subs/fileupload'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTheme } from 'next-themes'

const mediaCategories = [
  { value: 'worship', label: 'Worship' },
  { value: 'praise', label: 'Praise' },
  { value: 'ccc', label: 'CCC' },
  { value: 'bible', label: 'Bible' },
  { value: 'hymns', label: 'Hymns' },
  { value: 'dance', label: 'Dance' },
  { value: 'musical', label: 'Musical' },
];

const otherFeeds = [
  { value: 'post', label: 'Posts' },
  { value: 'event', label: 'Event' },
  { value: 'project', label: 'Projects' },
];

const normalizeTab = (tab: string | null) => {
  if (tab === 'praisevideo') return 'praise';
  if (tab === 'worshipvideo') return 'worship';
  return tab;
};

const Blog = () => {
  const { selectedVideo, setSelectedVideo, useMock, user } = useAppContext();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const mobileThemeRef = useRef<string | undefined>(undefined);

  const [initialTab, setInitialTab] = useState("praise");

  useEffect(() => {
    if (!isMobile) return;

    mobileThemeRef.current = theme;
    if (theme !== 'dark') setTheme('dark');

    return () => {
      if (mobileThemeRef.current && mobileThemeRef.current !== 'dark') {
        setTheme(mobileThemeRef.current as 'light' | 'system');
      }
      mobileThemeRef.current = undefined;
    };
  }, [isMobile]);

  useEffect(() => {
    // Only run client-side
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = normalizeTab(params.get("tab"));

      if (tab && [...mediaCategories, ...otherFeeds].some((category) => category.value === tab)) {
        setInitialTab(tab);
      }
    }
  }, []);

  const allCategories = [...mediaCategories, ...otherFeeds];
  const carouselCategories = user?.role === 'admin'
    ? [...allCategories, { value: 'unverified', label: 'Review' }]
    : allCategories;
  const carouselItems = [...carouselCategories, ...carouselCategories];

  return (
    <Tabs defaultValue={initialTab} value={initialTab} onValueChange={(value) => setInitialTab(value)} className="mt-5 flex flex-col gap-2 md:flex-row md:gap-[60px]">
      <TabsList className="hidden md:flex md:w-full md:max-w-sm md:flex-row md:flex-wrap md:gap-2 lg:max-h-[300px] lg:max-w-[280px] lg:flex-col lg:gap-6 xl:max-w-[340px] xl:mx-0">
        {[...mediaCategories, ...otherFeeds].map((category) => (
          <TabsTrigger key={category.value} value={category.value} className='rounded-full flex-1'>
            {category.label}
          </TabsTrigger>
        ))}
        {user?.role === "admin" && (
          <TabsTrigger value="unverified" className='rounded-full flex-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30'>Unverified</TabsTrigger>
        )}
        <PostButton />
      </TabsList>

      <div className="relative w-full overflow-hidden bg-background md:hidden">
        <div className="blog-category-marquee" aria-label="Choose a blog category">
          <div className="blog-category-track">
            {carouselItems.map((category, index) => (
              <button
                key={`${category.value}-${index}`}
                type="button"
                aria-pressed={initialTab === category.value}
                onClick={() => setInitialTab(category.value)}
                className={`shrink-0 rounded-full border border-accent px-5 py-2 text-sm font-semibold transition-colors ${
                  initialTab === category.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background text-foreground hover:bg-accent/15'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 p-1 shadow-md">
          <PostButton />
        </div>
      </div>

      <ScrollArea className="w-full lg:h-[80vh]">
        {[...mediaCategories, ...otherFeeds].map((category) => (
          <TabsContent key={category.value} value={category.value} className="w-full">
            {mediaCategories.some((item) => item.value === category.value) ? (
              <Posts page="media" category={category.value} />
            ) : (
              <Posts page={category.value} />
            )}
          </TabsContent>
        ))}

        {user?.role === "admin" && (
          <TabsContent value="unverified" className="w-full">
            <Posts page="unverified" />
          </TabsContent>
        )}
      </ScrollArea>
    </Tabs>
  )
}

export default Blog





// Visiting /blog/?tab=praisevideo → “Praise” tab opens

// Visiting /blog/?tab=worshipvideo → “Worship” opens

// Visiting /blog?tab=event → “Event” opens

// No tab param → defaults to "praisevideo"