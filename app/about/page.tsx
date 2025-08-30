"use client"
import { Button} from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaPhone, FaSearchLocation} from "react-icons/fa"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import Stats from "@/data/stats"
import Countup from "react-countup"
import contact from "@/data/cont"
import Footer from "@/components/myComponents/subs/footer"
import { useAppContext } from "@/hooks/useAppContext"
import { cn } from "@/lib/utils"
import { ProfileCard, ProfileCardTransparentBG } from "@/components/myComponents/subs/profileCards"

const About = () => {
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();
  const oguduhistory = [
  `CCC Ogudu Expressway Cathedral was founded in 1977 through divine intervention and prophetic messages. The word of God came to Superior Leader Asooto in the third quarter of 1977, directing the establishment of a parish in Ogudu, a village at the time. The land, formerly used for a poultry farm belonging to Superior Leader Asooto, was converted into a place of worship. A young girl prophesied that the church would bear the torch, and Senior Evangelist Oladapo, along with Superior Leader Asooto, fulfilled the word of God by establishing the parish.`,

  `The parish was initially erected with temporary structures like bamboo, poles, and palm fronds, in obedience to the divine directive. Despite the makeshift nature of the building, God assured that it would not rain on the site in a way that would disturb worshippers until a more permanent structure could be built. This promise was dramatically fulfilled when it rained heavily around the town but not on the church site. The parish experienced rapid growth and miracles, attracting attention and support from both members and well-wishers.`,

  `Under the leadership of various shepherds, including Senior Evangelist Oladapo, Superior Evangelist J.B. Adelaja, and others, the church flourished. Chief Bola Adewunmi, who was approached by a prophet of the church, single-handedly completed the first permanent structure and became a worshipper in the parish. The church has since grown, with notable contributions from members and the fulfillment of prophecies about its future. Today, the CCC Ogudu Expressway Cathedral stands as a testament to faith and divine providence, with a rich history and a vibrant community.`
];

  return (
    <motion.section 
      initial = {{ opacity: 0 }}
      animate = {{
        opacity : 1,
        transition : { delay: 0.5, duration: 0.6, ease: "easeIn"}
      }}
      className= "justify-center w-[100vw] overflow-clip /px-2"
    >
      <section className="md:max-w-[1200px] md:mx-auto md:h-[80vh] mb-20">
        <div className="flex flex-col md:flex-row md:justify-between mx-5 md:mx-10 mt-5">
          <span className="text-4xl font-semibold">About <span className="text-accent">us</span></span>
        </div>
        {/* <div className="flex flex-col md:flex-row mx-4 md:m-5">
          <div className="flex-1 mx-2 md:mx-10 my-5 text-secondary-foreground text-center md:text-start">{Stats.about}</div>
          <div className="flex-1 grid grid-cols-2 gap-5 max-w-[580px] my-5">
            {Stats.stats.map((stat, index)=>{
              return(
                <div key={index} className="bg-secondary rounded-lg p-5 shadow-md shadow-accent/50">
                  <Countup 
                    end={stat.num}
                    duration={5}
                    delay={2}
                    separator=""
                    className="text-3xl md:text-5xl text-outline font-extrabold text-background hover:text-accent py-5"
                  />
                  <div className="text-lg font-semibold text-secondary-foreground">{stat.text}</div>
                </div>
              )
            })}
          </div>
        </div> */}
        <div className="flex flex-col md:flex-row mx-4 md:m-5">
          <div className="flex flex-1 w-full my-5 flex-col  text-center md:text-start">
            <div className="mx-2 md:mx-10 text-secondary-foreground\r">
              {'Brief history of the foundation of celestial church of christ'}
            </div>
            <div className="mx-2 md:mx-10 text-secondary-foreground text-left">
              {oguduhistory.map((paragraph, index)=>{
                return(
                  <div key={index} className="mb-2">&nbsp;&nbsp;&nbsp;&nbsp;{paragraph}</div>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-5 w-full max-w-[580px] my-5">
            {[{name : 'Papa Oshofa', title : 'Pastor Founder', img : "./papaoshofa.jpg"},
              {name : 'Reverend EMF Oshoffa', title : 'Current pastor', img : "./pastor.jpg"},
              {name : 'Shepherd Name', title : 'Shephard', img : "./shephard.jpg"},
              {name : 'Asst Shepherd Name', title : 'Asst Shepherd', img : "./shephardasst.jpg"},
            ].map((profile, index)=>{
              return(
                <div key={index} >
                  <ProfileCard name={profile.name} title={profile.title} profileImage={profile.img} />
                </div>
              )
            })}
          </div>
        </div>
      </section>
      
      <section className="flex flex-col md:flex-row md:h-[80vh] items-center md:justify-center w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center md:flex-1 mt-10">
          <div className="text-center text-4xl font-semibold md:mb-10">Meet the <span className="text-accent">Parochial</span></div>
          {/* <Button variant={"outline"} className="border-accent text-accent text-lg  bg-transparent hover:text-slate-100 hidden md:flex">volunteer</Button> */}
        </div>
        <ScrollArea className="h-[41vh] /md:h-[45vh] w-full max-w-xl  self-center my-10 md:mx-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full mx-auto px-2 /md:gap-5 items-center">
            {contact.team.map((member, index)=>{
              return (
                <div key={index} className="">
                  <ProfileCardTransparentBG name={member.name} title={member.position} profileImage={'./placeholderMale.jpg'} />
                </div>
              )
            })}
          </div>
        </ScrollArea>
        {/* <Button variant={"outline"} className="border-accent text-accent text-lg  bg-transparent hover:text-slate-100 max-w-[220px] flex md:hidden">volunteer with us</Button> */}
      </section>


      <section className="flex flex-col md:flex-row md:h-[80vh] items-center md:justify-center w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center md:flex-1 mt-10">
          <div className="text-center text-4xl font-semibold md:mb-10">Meet the <span className="text-accent">Ministers</span></div>
          {/* <Button variant={"outline"} className="border-accent text-accent text-lg  bg-transparent hover:text-slate-100 hidden md:flex">volunteer</Button> */}
        </div>
        <ScrollArea className="h-[41vh] /md:h-[45vh] w-full max-w-xl  self-center my-10 md:mx-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full mx-auto px-2 /md:gap-5 items-center">
            {contact.team.map((member, index)=>{
              return (
                <div key={index} className="">
                  <ProfileCardTransparentBG name={member.name} title={member.position} profileImage={'./placeholderMale.jpg'} />
                </div>
              )
            })}
          </div>
        </ScrollArea>
        {/* <Button variant={"outline"} className="border-accent text-accent text-lg  bg-transparent hover:text-slate-100 max-w-[220px] flex md:hidden">volunteer with us</Button> */}
      </section>
      
      
      <section className="flex flex-col md:flex-row md:h-[80vh] items-center md:justify-center w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center md:flex-1 mt-10">
          <div className="text-center text-4xl font-semibold md:mb-10">Meet the <span className="text-accent">Department Leaders</span></div>
          {/* <Button variant={"outline"} className="border-accent text-accent text-lg  bg-transparent hover:text-slate-100 hidden md:flex">volunteer</Button> */}
        </div>
        <ScrollArea className="h-[41vh] /md:h-[45vh] w-full max-w-xl  self-center my-10 md:mx-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full mx-auto px-2 /md:gap-5 items-center">
            {contact.team.map((member, index)=>{
              return (
                <div key={index} className="">
                  <ProfileCardTransparentBG name={member.name} title={member.position} profileImage={'./placeholderMale.jpg'} />
                </div>
              )
            })}
          </div>
        </ScrollArea>
        {/* <Button variant={"outline"} className="border-accent text-accent text-lg  bg-transparent hover:text-slate-100 max-w-[220px] flex md:hidden">volunteer with us</Button> */}
      </section>


      <section className="flex flex-col md:flex-row md:h-[80vh] items-center md:justify-center w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center md:flex-1 mt-10">
          <div className="text-center text-4xl font-semibold md:mb-10">Meet the <span className="text-accent">Harvest Committee</span></div>
          {/* <Button variant={"outline"} className="border-accent text-accent text-lg  bg-transparent hover:text-slate-100 hidden md:flex">volunteer</Button> */}
        </div>
        <ScrollArea className="h-[41vh] /md:h-[45vh] w-full max-w-xl  self-center my-10 md:mx-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full mx-auto px-2 /md:gap-5 items-center">
            {contact.team.map((member, index)=>{
              return (
                <div key={index} className="">
                  <ProfileCardTransparentBG name={member.name} title={member.position} profileImage={'./placeholderMale.jpg'} />
                </div>
              )
            })}
          </div>
        </ScrollArea>
        {/* <Button variant={"outline"} className="border-accent text-accent text-lg  bg-transparent hover:text-slate-100 max-w-[220px] flex md:hidden">volunteer with us</Button> */}
      </section>
    </motion.section>
  )
}

export default About














