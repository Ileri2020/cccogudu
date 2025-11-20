
"use client"
import { motion } from "framer-motion"
import { Button } from '@/components/ui/button';
import Social from "@/components/utility/social"
import { Gallery } from "@/components/myComponents/subs"
import { TextAnimations, FlyInText, FlipInText, ZoomInText, ScaleInText, SlideInText, SlideUpText, BounceInText, RotateInText, TypewriterText } from "@/components/myComponents/subs/textctrl";
import Logobg from '@/components/myComponents/subs/logobg';
import gallery from '@/data/gallery';
import testimonials from '@/data/testimonial';
import Similar from '../../components/myComponents/subs/similar';
import Footer from '../../components/myComponents/subs/footer';
import Footer1 from "@/components/myComponents/subs/Footer1";
import Footer2 from "@/components/myComponents/subs/Footer2";
import { useAppContext } from "@/hooks/useAppContext";
import { TestimonialsSection } from "@/components/myComponents/subs/testimonials";
import { CoverCarousel, TextCarousel } from "@/components/myComponents/subs/carrousels";
import Post from "@/components/myComponents/subs/post";
import Posts from "@/components/myComponents/subs/posts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from "next/link"


const Home = () => {
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();
  return (
    <motion.section
      initial = {{ opacity: 0 }}
      animate = {{
        opacity : 1,
        transition : { delay: 0.5, duration: 0.6, ease: "easeIn"}
      }}
      className="w-[100vw] min-h-[100vh] overflow-clip flex flex-col"
    >
      <div className="flex-1 flex flex-col md:flex-row w-full md:w-[85%] min-h-[80vh] overflow-clip mx-auto relative max-w-6xl">
        <div className="flex w-full md:max-w-xl /bg-red-500 flex-col items-center mt-5 md:mt-28 text-centers md:translate-x-10 z-10">
          <div className="/text-5xl font-extrabold /text-transparent /text-outline text-center md:text-start">
            <div className="text-5xl text-accent text-center w-full">CCC OGUDU</div>
            <div className="text-4xl text-primary/80">EXPRESSWAY CATHEDRAL</div>
          </div>
          <div>
            <ZoomInText />
          </div>
        </div>
      {/* <CoverCarousel numCards={5} /> */}

    

          <TextCarousel
            text="O Good Forever***O Good Forever***O Good Forever***"
            speed={2000}
            image={true}
            imageUrl="./crown.webp"
            direction="left"
          />
      </div>
      <div className="flex w-full max-w-sm justify-between my-5 items-center text-lg font-semibold gap-2 mx-auto text-center">
                <Link href='/blog/?tab=praisevideo' className='transition-all flex flex-row gap-2 w-full justify-center items-center'>
                    <Button className="flex-1 bg-transparent border-accent border-2 text-accent capitalize font-semibold hover:text-accent/50 ">Praise</Button>
                </Link>
                <Link href='/blog/?tab=worshipvideo' className='transition-all flex flex-row gap-2 w-full justify-center items-center'>
                    <Button className="flex-1 bg-transparent border-accent border-2 text-accent capitalize font-semibold hover:text-accent/50 ">Worship</Button>
                </Link>
          </div>
    {/*
      <div className="h-[80vh] w-full flex justify-center">
        <div className="flex-1 flex flex-col justify-center items-center max-w-4xl">
          <div>
            <div>Audio</div>
            <Similar similar={gallery.stocks} />
          </div>
          <div>
            <div>Video</div>
            <Similar similar={gallery.stocks} />
          </div>
          <div>
            <div>Books</div>
            <Similar similar={gallery.stocks} />
          </div>
        </div>
      </div>
    */}

<div className="flex flex-col">

  
<ScrollArea className="relative max-h-[110vh] /lg:h-[80vh] w-full mx-auto flex justify-center items-center max-w-md overflow-clip" >
        <UpcomingEvents page={"event"} />
      </ScrollArea>
      </div>

      {/* Testimonials */}
      <section
          className={`
            bg-muted/50 py-12
            md:py-16
          `}
      >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <TestimonialsSection
              className="py-0"
              description="Words from worshipers and prayer request"
              testimonials={testimonials.testimonials}
              title="Worship and Pray With Us"
            />
          </div>
      </section>
    </motion.section>
  )
}

export default Home






























import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

// ============================================================================
//  UPCOMING EVENTS  (Posts + Post merged, simplified for IMAGES ONLY)
// ============================================================================

const UpcomingEvents = ({ page, media = "" }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [sortOrder, setSortOrder] = useState("random");
  const [loading, setLoading] = useState(true); // 🔥 added

  const eventsPerChunk = 2;
  const currentChunkRef = useRef(0);
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  // ==========================================================================
  // SORT EVENTS
  // ==========================================================================
 const sortEvents = (events: any[], order: string, mediaId: string) => {
  if (mediaId && order === "random") return events;

  if (order === "asc") {
    return [...events].sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
  }

  if (order === "desc") {
    return [...events].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  return [...events].sort(() => Math.random() - 0.5); // random
};


  // ==========================================================================
  // PRIORITIZE MEDIA IMAGE FIRST
  // ==========================================================================
  const prioritizeMedia = (events, mediaId) => {
    if (!mediaId) return events;

    const index = events.findIndex((e) => String(e.id) === String(mediaId));
    if (index === -1) return events;

    const item = events[index];
    const others = events.filter((e) => String(e.id) !== String(mediaId));

    return [item, ...others];
  };

  // ==========================================================================
  // FETCH EVENTS
  // ==========================================================================
  const fetchEvents = useCallback(async () => {
    if (page !== "event") return;

    try {
      setLoading(true); // 🔥 added

      const response = await axios.get("/api/dbhandler", {
        params: { model: "posts" },
      });

      let events = response.data;

      events = events.filter(
        (event) => event.for === "event" && event.type === "image"
      );

      events = sortEvents(events, sortOrder, media);
      events = prioritizeMedia(events, media);

      setAllEvents(events);

      currentChunkRef.current = 0;
      setDisplayedEvents(events.slice(0, eventsPerChunk));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // 🔥 added
    }
  }, [page, sortOrder, media]);

  // ==========================================================================
  // INFINITE SCROLL LOAD MORE
  // ==========================================================================
  const loadMore = () => {
    const nextChunk = currentChunkRef.current + 1;
    const start = nextChunk * eventsPerChunk;
    const end = start + eventsPerChunk;

    const nextEvents = allEvents.slice(start, end);
    if (nextEvents.length === 0) return;

    currentChunkRef.current = nextChunk;
    setDisplayedEvents((prev) => [...prev, ...nextEvents]);
  };

  // ==========================================================================
  // OBSERVER
  // ==========================================================================
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "150px" }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [allEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ==========================================================================
  // FORMAT DATE
  // ==========================================================================
  function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = now.getTime() - date.getTime(); // FIXED ✅ number - number

  const min = Math.floor(diff / 60000);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);

  if (days > 0) return `last ${days} d`;
  if (hrs > 0) return `last ${hrs} h`;
  if (min > 0) return `last ${min} m`;
  return "just now";
}

  // ==========================================================================
  // CONDITIONAL RENDERING FOR NO EVENTS
  // ==========================================================================
  if (loading) return <div>Loading events...</div>;

  // 🔥 If loaded AND no events: render nothing
  if (!loading && allEvents.length === 0) return null;

  // ==========================================================================
  // UI
  // ==========================================================================
  return (
    <div className="flex flex-col w-fit mx-auto">
      <div className="mt-2 text-4xl font-semibold text-center w-full">Upcoming Events</div>
      <div className="w-28 mx-auto my-10"><Separator /></div>
      {/* Sort dropdown */}
      <div className="flex flex-row mb-4">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="random">Random</option>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {/* Render Events */}
      {displayedEvents.map((event) => (
        <div
          key={event.id}
          className="mt-10 flex flex-col rounded-sm w-[100vw] max-w-sm overflow-hidden bg-secondary"
        >
          {/* HEADER */}
          <div className="w-full flex flex-row">
            <img
              src={
                event?.user?.avatarUrl ??
                "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png"
              }
              className="w-10 h-10 rounded-full m-1"
            />
            <div className="flex flex-row w-full">
              <div className="flex-1 text-lg font-semibold px-3">
                {event.user?.username}
              </div>
              <div className="text-xs opacity-70 pr-3">
                {formatDate(event.updatedAt)}
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <img src={event.url} className="w-full" />

          {/* BODY */}
          <div className="p-3">
            {event.title && (
              <div className="font-semibold text-lg mb-1">{event.title}</div>
            )}
            <div>{event.post}</div>
          </div>
        </div>
      ))}

      {/* Infinite scroll trigger */}
      {displayedEvents.length < allEvents.length && (
        <div ref={loadMoreRef} className="h-10 invisible">
          Loading...
        </div>
      )}
    </div>
  );
};

