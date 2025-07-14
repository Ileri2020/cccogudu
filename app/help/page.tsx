"use client"
import { useAppContext } from "@/hooks/useAppContext";
import { motion } from "framer-motion"

const Help = () => {
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();
  return (
    <motion.section
      initial = {{ opacity: 0 }}
      animate = {{
        opacity : 1,
        transition : { delay: 0.5, duration: 0.6, ease: "easeIn"}
      }}
      className="w-[100vw] overflow-clip"
    >
      help
    </motion.section>
  )
}

export default Help
