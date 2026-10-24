"use client"
import info from "@/data/cont"
import { motion } from "framer-motion"
import contact from "@/data/cont"
import Social from "@/components/utility/social"
import ContactForm from "@/components/utility/contactForm"
import Footer from "@/components/myComponents/subs/footer"
import { useAppContext } from "@/hooks/useAppContext"
import { MapPin } from "lucide-react"

const Contact = () => {
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.5, duration: 0.6, ease: "easeIn" }
      }}
      className="w-full overflow-hidden py-8"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col xl:flex-row gap-[40px] items-start">
          {/* Contact Form Column */}
          <div className="w-full xl:w-[54%] order-2 xl:order-none">
            <ContactForm />
          </div>

          {/* Contact Details & Location Column */}
          <div className="flex flex-col flex-1 w-full max-w-[540px]">
            <div className="text-3xl font-bold mb-3 text-center md:text-start">
              Let&apos;s <span className="text-accent">Connect</span>
            </div>
            <div className="my-3 text-muted-foreground leading-relaxed">{contact.description}</div>

            <div className="flex flex-col gap-4 mt-4">
              {contact.contact.map((item, index) => {
                const isLocation =
                  item.text?.toLowerCase().includes("visit") ||
                  item.text?.toLowerCase().includes("location");

                return (
                  <div
                    className="flex flex-col p-4 rounded-2xl bg-secondary/30 border border-border/70 hover:border-accent/40 transition-colors"
                    key={index}
                  >
                    <div className="flex flex-row items-center">
                      <div className="p-2 text-3xl shrink-0">{item.icon}</div>
                      <div className="flex flex-col ml-4">
                        <div className="text-sm font-bold text-accent uppercase tracking-wider">
                          {item.text}
                        </div>
                        <div className="text-sm text-foreground/90 font-medium mt-0.5">
                          {item.value}
                        </div>
                      </div>
                    </div>

                    {/* Location Video under the Visit Us / Location block */}
                    {isLocation && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-border/80 shadow-lg bg-black/40">
                        <div className="px-3 py-1.5 bg-accent/15 border-b border-border/60 flex items-center gap-1.5 text-xs font-semibold text-accent">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Sanctuary Location Video</span>
                        </div>
                        <video
                          src="/location video.mp4"
                          controls
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full max-h-[260px] object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="w-full my-8 flex justify-center items-center">
              <Social
                containerStyles="flex gap-4 md:gap-6 mx-auto"
                iconStyles="w-10 h-10 border border-accent rounded-full flex justify-center items-center text-accent text-base hover:bg-accent hover:text-background transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Dedicated Cathedral Location Feature Section */}
        <div className="w-full max-w-5xl mx-auto mt-16 pt-10 border-t border-border/70">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <MapPin className="w-4 h-4" />
              <span>Sanctuary Directions & Map</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Cathedral Location</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl mx-auto">
              CCC Ogudu Expressway Cathedral, Express Way, Ogudu, Lagos, Nigeria. Come worship with us!
            </p>
          </div>

          <div className="w-full overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-black/50">
            <video
              src="/location video.mp4"
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-h-[520px] object-cover"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;
