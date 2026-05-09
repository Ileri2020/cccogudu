"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaPhone, FaSearchLocation, FaTrash, FaEdit } from "react-icons/fa"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import Stats from "@/data/stats"
import Countup from "react-countup"
import contact from "@/data/cont"
import Footer from "@/components/myComponents/subs/footer"
import { useAppContext } from "@/hooks/useAppContext"
import { cn } from "@/lib/utils"
import { ProfileCard, ProfileCardTransparentBG } from "@/components/myComponents/subs/profileCards"
import { toast } from "sonner"
import axios from "axios"
import React, { useState, useEffect } from "react"

interface Member {
  id: string;
  name: string;
  position: string;
  year: string;
  pictureUrl?: string;
}

interface SectionData {
  id: string;
  name: string;
  members: Member[];
}

interface AdminHierarchyFormsProps {
  onUpdate: () => void;
  sections: SectionData[];
  selectedSection: string;
  setSelectedSection: (id: string) => void;
}

const AdminHierarchyForms = ({ onUpdate, sections, selectedSection, setSelectedSection }: AdminHierarchyFormsProps) => {
  const [name, setName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [position, setPosition] = useState("");
  const [year, setYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddSection = async () => {
    if (!sectionName) return toast.error("Section name required");
    setLoading(true);
    try {
      await axios.post('/api/dbhandler?model=churchsections', { name: sectionName });
      toast.success("Section added successfully");
      setSectionName("");
      onUpdate();
    } catch (e) { toast.error("Failed to add section"); }
    finally { setLoading(false); }
  };

  const handleAddMember = async () => {
    if (!name || !selectedSection) return toast.error("Name and section required");
    setLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("position", position);
    fd.append("year", String(year)); // Tenure string like "2024-2025"
    fd.append("sectionId", selectedSection);
    if (file) fd.append("picture", file);

    try {
      await axios.post('/api/dbhandler?model=churchmembers', fd);
      toast.success("Member added successfully");
      setName(""); setPosition(""); setFile(null);
      onUpdate();
    } catch (e) { toast.error("Failed to add member"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 bg-secondary/30 rounded-2xl my-10 space-y-8 max-w-5xl mx-auto border-2 border-dashed border-accent/20">
      <h2 className="text-2xl font-bold text-center text-accent">Church Hierarchy Management</h2>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4 bg-background/50 p-4 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg border-b pb-2">Create New Committee/Group</h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold opacity-70">Group Name</label>
            <Input placeholder="e.g. Parochial Committee" value={sectionName} onChange={e => setSectionName(e.target.value)} />
          </div>
          <Button disabled={loading} onClick={handleAddSection} className="w-full">
            {loading ? "Processing..." : "Create Group"}
          </Button>
        </div>
        <div className="space-y-4 bg-background/50 p-4 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg border-b pb-2">Add Member to Existing Group</h3>
          <div className="space-y-2">
            <label className="text-xs font-semibold opacity-70">Target Group</label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger><SelectValue placeholder="Select Group" /></SelectTrigger>
              <SelectContent>
                {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold opacity-70">Full Name</label>
              <Input placeholder="Member Name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold opacity-70">Role/Title</label>
              <Input placeholder="e.g. Secretary" value={position} onChange={e => setPosition(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold opacity-70">Tenure (e.g. 2024-2025)</label>
              <Input type="text" value={year} onChange={e => setYear(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold opacity-70">Member Picture</label>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <Button disabled={loading} onClick={handleAddMember} className="w-full bg-accent text-white">
            {loading ? "Processing..." : "Add Member"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const About = () => {
  const { user } = useAppContext();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("");

  const fetchSections = async () => {
    try {
      const res = await axios.get('/api/dbhandler?model=churchsections');
      setSections(res.data);
    } catch (e) {
      console.error("Fetch hierarchy error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Delete this group and all its members?")) return;
    try {
      await axios.delete(`/api/dbhandler?model=churchsections&id=${id}`);
      toast.success("Section deleted");
      fetchSections();
    } catch (e) { toast.error("Failed to delete section"); }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    try {
      await axios.delete(`/api/dbhandler?model=churchmembers&id=${id}`);
      toast.success("Member deleted");
      fetchSections();
    } catch (e) { toast.error("Failed to delete member"); }
  };

  const oguduhistory = [
    `CCC Ogudu Expressway Cathedral was founded in 1977 through divine intervention and prophetic messages. The word of God came to Superior Leader Asooto in the third quarter of 1977, directing the establishment of a parish in Ogudu, a village at the time. The land, formerly used for a poultry farm belonging to Superior Leader Asooto, was converted into a place of worship. A young girl prophesied that the church would bear the torch, and Senior Evangelist Oladapo, along with Superior Leader Asooto, fulfilled the word of God by establishing the parish.`,

    `The parish was initially erected with temporary structures like bamboo, poles, and palm fronds, in obedience to the divine directive. Despite the makeshift nature of the building, God assured that it would not rain on the site in a way that would disturb worshippers until a more permanent structure could be built. This promise was dramatically fulfilled when it rained heavily around the town but not on the church site. The parish experienced rapid growth and miracles, attracting attention and support from both members and well-wishers.`,

    `Under the leadership of various shepherds, including Senior Evangelist Oladapo, Superior Evangelist J.B. Adelaja, and others, the church flourished. Chief Bola Adewunmi, who was approached by a prophet of the church, single-handedly completed the first permanent structure and became a worshipper in the parish. The church has since grown, with notable contributions from members and the fulfillment of prophecies about its future. Today, the CCC Ogudu Expressway Cathedral stands as a testament to faith and divine providence, with a rich history and a vibrant community.`
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.5, duration: 0.6, ease: "easeIn" }
      }}
      className="justify-center w-full overflow-hidden"
    >
      <section className="md:max-w-[1200px] md:mx-auto mb-20">
        <div className="flex flex-col md:flex-row md:justify-between mx-5 md:mx-10 mt-5">
          <span className="text-4xl font-semibold">About <span className="text-accent">us</span></span>
        </div>

        <div className="flex flex-col md:flex-row mx-4 md:m-5">
          <div className="flex flex-1 w-full my-5 flex-col text-center md:text-start">
            <div className="mx-2 md:mx-10 text-secondary-foreground pb-2">
              {'Brief history of the foundation of celestial church of christ'}
            </div>
            <div className="mx-2 md:mx-10 text-secondary-foreground text-left">
              {oguduhistory.map((paragraph, index) => {
                return (
                  <div key={index} className="mb-2">&nbsp;&nbsp;&nbsp;&nbsp;{paragraph}</div>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-5 w-full max-w-[580px] my-5">
            {[{ name: 'Papa Oshofa', title: 'Pastor Founder', img: "./papaoshofa.jpg" },
            { name: 'Reverend EMF Oshoffa', title: 'Current pastor', img: "./pastor.jpg" },
            { name: 'Shepherd Name', title: 'Shephard', img: "./shephard.jpg" },
            { name: 'Asst Shepherd Name', title: 'Asst Shepherd', img: "./shephardasst.jpg" },
            ].map((profile, index) => {
              return (
                <div key={index} >
                  <ProfileCard name={profile.name} title={profile.title} profileImage={profile.img} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {user?.role === "admin" && (
        <AdminHierarchyForms sections={sections} onUpdate={fetchSections} selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      )}

      {loading ? (
        <div className="text-center py-20 text-xl font-bold opacity-50">Loading Church Hierarchy...</div>
      ) : (
        sections.map((section) => {
          const availableYears = section.members.map((m) => m.year);
          // For string years like "2024-2025", we sort them lexically or by the first 4 chars
          const sortedYears = [...new Set(availableYears)].sort((a, b) => b.localeCompare(a));
          const maxYear = sortedYears[0];
          const latestMembers = section.members.filter((m) => m.year === maxYear);

          if (latestMembers.length === 0 && user?.role !== 'admin') return null;

          return (
            <section key={section.id} className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto mb-24 relative group">
              <div className="text-center text-4xl font-semibold mb-10 w-full px-4 relative">
                Meet the <span className="text-accent">{section.name}</span>
                {maxYear && <span className="text-sm block opacity-50">Tenure {maxYear}</span>}
                
                {user?.role === "admin" && (
                   <div className="absolute top-0 right-4 flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleDeleteSection(section.id)} className="rounded-full text-destructive hover:bg-destructive/10">
                        <FaTrash />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => {
                        setSelectedSection(section.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="rounded-full text-accent hover:bg-accent/10">
                         <FaEdit />
                      </Button>
                   </div>
                )}
              </div>

              <ScrollArea className="h-auto w-full self-center px-4">
                <div className="flex flex-wrap justify-center gap-6 pb-6">
                  {latestMembers.map((member, index) => (
                    <div key={member.id || index} className="w-[170px] md:w-[220px] relative group/member">
                      <ProfileCardTransparentBG
                        name={member.name}
                        title={member.position}
                        profileImage={member.pictureUrl || './placeholderMale.jpg'}
                      />
                      {user?.role === "admin" && (
                        <button 
                          onClick={() => handleDeleteMember(member.id)}
                          className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover/member:opacity-100 transition-opacity"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {latestMembers.length === 0 && (
                    <div className="text-center opacity-30 italic py-10">No members listed for this section.</div>
                  )}
                </div>
              </ScrollArea>
            </section>
          )
        })
      )}

    </motion.section>
  )
}

export default About
