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
        <div className="flex w-full md:w-[540px] flex-col items-center mt-5 md:mt-28 text-centers md:translate-x-40 ">
          <div className="text-5xl font-bold text-transparent text-outline text-center md:text-start">Community Soul Fishers</div>
          <div>
            <ZoomInText />
          </div>
        </div>
        <Logobg />
      </div>
      {/* <CoverCarousel numCards={5} /> */}
      <TextCarousel
      text="CCC OGUDU EXPRESS WAY CATHEDRAL***"
      speed={2000}
      image={true}
      imageUrl="https://res.cloudinary.com/dc5khnuiu/image/upload/v1751682480/inhqujbmn3pxu9nefbuj.jpg"
    />
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
