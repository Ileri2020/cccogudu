"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Plus,
  History,
  Trash2,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/hooks/useAppContext";
import { ProfileCard, ProfileCardTransparentBG } from "@/components/myComponents/subs/profileCards";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================
export interface Member {
  id: string;
  sectionId: string;
  name: string;
  position?: string;
  year: string;
  pictureUrl?: string;
  isCurrent?: boolean;
  createdAt?: string;
}

export interface SectionData {
  id: string;
  name: string;
  order?: number;
  members: Member[];
}

// 6 Default Groups requested by user (plus Shepherds for pastoral tracking)
const DEFAULT_GROUPS = [
  "Parochial Committee",
  "Youth",
  "Media",
  "Prophet & Prophetess",
  "Sidemen & Sidewomen",
  "Goodwomen",
];

const About = () => {
  const { user } = useAppContext();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // DIALOG STATES
  // --------------------------------------------------------------------------
  // 1. Shepherd dialog
  const [isShepherdDialogOpen, setIsShepherdDialogOpen] = useState(false);
  const [oldShepherdEndDate, setOldShepherdEndDate] = useState("");
  const [oldViceEndDate, setOldViceEndDate] = useState("");
  const [newShepherdName, setNewShepherdName] = useState("");
  const [newShepherdTenure, setNewShepherdTenure] = useState(
    `${new Date().getFullYear()} - Present`
  );
  const [newShepherdFile, setNewShepherdFile] = useState<File | null>(null);
  const [newViceName, setNewViceName] = useState("");
  const [newViceTenure, setNewViceTenure] = useState(
    `${new Date().getFullYear()} - Present`
  );
  const [newViceFile, setNewViceFile] = useState<File | null>(null);
  const [isSubmittingShepherd, setIsSubmittingShepherd] = useState(false);
  const [showPastShepherds, setShowPastShepherds] = useState(false);

  // 2. Create Group dialog
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [initialMemberName, setInitialMemberName] = useState("");
  const [initialMemberPosition, setInitialMemberPosition] = useState("");
  const [initialMemberTenure, setInitialMemberTenure] = useState(
    `${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`
  );
  const [initialMemberFile, setInitialMemberFile] = useState<File | null>(null);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // 3. Add Member to Group dialog
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [targetSection, setTargetSection] = useState<SectionData | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberPosition, setMemberPosition] = useState("");
  const [memberTenure, setMemberTenure] = useState(
    `${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`
  );
  const [memberFile, setMemberFile] = useState<File | null>(null);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // 4. Change / Retire Member dialog
  const [isChangeMemberOpen, setIsChangeMemberOpen] = useState(false);
  const [retiringMemberId, setRetiringMemberId] = useState("");
  const [retiringEndDate, setRetiringEndDate] = useState("");
  const [replacementName, setReplacementName] = useState("");
  const [replacementPosition, setReplacementPosition] = useState("");
  const [replacementTenure, setReplacementTenure] = useState(
    `${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`
  );
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);

  // Track expanded past member histories per section: { [sectionId]: boolean }
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  // --------------------------------------------------------------------------
  // FETCH & SEED DEFAULT GROUPS
  // --------------------------------------------------------------------------
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/dbhandler?model=churchsections");
      let data: SectionData[] = Array.isArray(res.data) ? res.data : [];

      // Check for missing default groups and automatically seed them in DB
      const existingNames = new Set(
        data.map((s) => s.name.trim().toLowerCase())
      );

      let seeded = false;

      // Ensure Shepherds section exists
      if (!existingNames.has("shepherds")) {
        try {
          await axios.post("/api/dbhandler?model=churchsections", {
            name: "Shepherds",
            order: 0,
          });
          seeded = true;
        } catch (e) {
          console.error("Failed to seed Shepherds", e);
        }
      }

      // Ensure all 6 default groups exist
      for (let i = 0; i < DEFAULT_GROUPS.length; i++) {
        const groupName = DEFAULT_GROUPS[i];
        if (!existingNames.has(groupName.trim().toLowerCase())) {
          try {
            await axios.post("/api/dbhandler?model=churchsections", {
              name: groupName,
              order: i + 1,
            });
            seeded = true;
          } catch (e) {
            console.error(`Failed to seed ${groupName}`, e);
          }
        }
      }

      // Re-fetch if we seeded any new groups
      if (seeded) {
        const refreshed = await axios.get("/api/dbhandler?model=churchsections");
        if (Array.isArray(refreshed.data)) {
          data = refreshed.data;
        }
      }

      setSections(data);
    } catch (err) {
      console.error("Failed to fetch church sections", err);
      toast.error("Failed to load church hierarchy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // --------------------------------------------------------------------------
  // DERIVED LEADERSHIP (SHEPHERDS & VICE SHEPHERD)
  // --------------------------------------------------------------------------
  const shepherdSection = sections.find(
    (s) => s.name.trim().toLowerCase() === "shepherds"
  );
  const shepherdMembers = shepherdSection?.members || [];

  // Current active Shepherd & Vice Shepherd
  const currentShepherd =
    shepherdMembers.find(
      (m) =>
        m.isCurrent !== false &&
        (m.position?.toLowerCase().includes("shepherd-in-charge") ||
          m.position?.toLowerCase() === "shepherd")
    ) ||
    shepherdMembers.find((m) => m.isCurrent !== false) ||
    null;

  const currentViceShepherd =
    shepherdMembers.find(
      (m) =>
        m.isCurrent !== false &&
        m.id !== currentShepherd?.id &&
        (m.position?.toLowerCase().includes("vice") ||
          m.position?.toLowerCase().includes("asst") ||
          m.position?.toLowerCase().includes("assistant"))
    ) ||
    shepherdMembers.filter((m) => m.isCurrent !== false && m.id !== currentShepherd?.id)[0] ||
    null;

  // Past / Retired Shepherds
  const pastShepherds = shepherdMembers.filter((m) => m.isCurrent === false);

  // --------------------------------------------------------------------------
  // HANDLERS: SHEPHERD & VICE SHEPHERD
  // --------------------------------------------------------------------------
  const handleShepherdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShepherdName.trim()) {
      toast.error("Please provide the new Shepherd's full name");
      return;
    }
    if (!newViceName.trim()) {
      toast.error("Please provide the new Vice Shepherd's full name");
      return;
    }

    if (currentShepherd && !oldShepherdEndDate.trim()) {
      toast.error("Please enter the ending date of the outgoing Shepherd's tenure");
      return;
    }

    setIsSubmittingShepherd(true);

    try {
      let targetSectionId = shepherdSection?.id;
      if (!targetSectionId) {
        const createSec = await axios.post("/api/dbhandler?model=churchsections", {
          name: "Shepherds",
          order: 0,
        });
        targetSectionId = createSec.data?.id;
      }

      if (!targetSectionId) {
        toast.error("Unable to locate Shepherds section in database.");
        return;
      }
      const sectionIdStr = String(targetSectionId);

      // 1. If old shepherd exists, update their record: isCurrent = false, record ending date
      if (currentShepherd) {
        const updatedTenure = `${currentShepherd.year || "Past"} (Tenure ended: ${oldShepherdEndDate.trim()})`;
        await axios.put(`/api/dbhandler?model=churchmembers&id=${currentShepherd.id}`, {
          isCurrent: false,
          year: updatedTenure,
        });
      }

      // 2. If old vice shepherd exists, update their record
      if (currentViceShepherd) {
        const viceEnd = oldViceEndDate.trim() || oldShepherdEndDate.trim();
        const updatedViceTenure = `${currentViceShepherd.year || "Past"} (Tenure ended: ${viceEnd})`;
        await axios.put(`/api/dbhandler?model=churchmembers&id=${currentViceShepherd.id}`, {
          isCurrent: false,
          year: updatedViceTenure,
        });
      }

      // 3. Create New Shepherd
      const fdShepherd = new FormData();
      fdShepherd.append("name", newShepherdName.trim());
      fdShepherd.append("position", "Shepherd-in-Charge");
      fdShepherd.append("year", newShepherdTenure.trim() || `${new Date().getFullYear()} - Present`);
      fdShepherd.append("sectionId", sectionIdStr);
      fdShepherd.append("isCurrent", "true");
      if (newShepherdFile) {
        fdShepherd.append("picture", newShepherdFile);
      }

      await axios.post("/api/dbhandler?model=churchmembers", fdShepherd);

      // 4. Create New Vice Shepherd
      const fdVice = new FormData();
      fdVice.append("name", newViceName.trim());
      fdVice.append("position", "Vice Shepherd");
      fdVice.append("year", newViceTenure.trim() || `${new Date().getFullYear()} - Present`);
      fdVice.append("sectionId", sectionIdStr);
      fdVice.append("isCurrent", "true");
      if (newViceFile) {
        fdVice.append("picture", newViceFile);
      }

      await axios.post("/api/dbhandler?model=churchmembers", fdVice);

      toast.success("Hallelujah! New Shepherd and Vice Shepherd successfully updated in database.");
      setIsShepherdDialogOpen(false);
      setNewShepherdName("");
      setNewShepherdFile(null);
      setNewViceName("");
      setNewViceFile(null);
      setOldShepherdEndDate("");
      setOldViceEndDate("");
      fetchSections();
    } catch (err) {
      console.error("Failed to update shepherd", err);
      toast.error("Failed to update Shepherd. Please try again.");
    } finally {
      setIsSubmittingShepherd(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: CREATE GROUP
  // --------------------------------------------------------------------------
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast.error("Please enter a group or committee name");
      return;
    }

    setIsSubmittingGroup(true);

    try {
      const res = await axios.post("/api/dbhandler?model=churchsections", {
        name: newGroupName.trim(),
        order: sections.length + 1,
      });

      const createdSectionId = res.data?.id;

      // Optional initial member
      if (initialMemberName.trim() && createdSectionId) {
        const fd = new FormData();
        fd.append("name", initialMemberName.trim());
        fd.append("position", initialMemberPosition.trim() || "Leader / Chairperson");
        fd.append("year", initialMemberTenure.trim() || `${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`);
        fd.append("sectionId", createdSectionId);
        fd.append("isCurrent", "true");
        if (initialMemberFile) {
          fd.append("picture", initialMemberFile);
        }
        await axios.post("/api/dbhandler?model=churchmembers", fd);
      }

      toast.success(`Group "${newGroupName.trim()}" successfully created!`);
      setIsCreateGroupOpen(false);
      setNewGroupName("");
      setInitialMemberName("");
      setInitialMemberPosition("");
      setInitialMemberFile(null);
      fetchSections();
    } catch (err) {
      console.error("Failed to create group", err);
      toast.error("Failed to create group. Please try again.");
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: ADD MEMBER TO EXISTING GROUP
  // --------------------------------------------------------------------------
  const handleOpenAddMember = (section: SectionData) => {
    setTargetSection(section);
    setMemberName("");
    setMemberPosition("");
    setMemberFile(null);
    setMemberTenure(`${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`);
    setIsAddMemberOpen(true);
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !targetSection) {
      toast.error("Please provide member name");
      return;
    }

    setIsSubmittingMember(true);

    try {
      const fd = new FormData();
      fd.append("name", memberName.trim());
      fd.append("position", memberPosition.trim() || "Executive Member");
      fd.append("year", memberTenure.trim() || `${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`);
      fd.append("sectionId", targetSection.id);
      fd.append("isCurrent", "true");
      if (memberFile) {
        fd.append("picture", memberFile);
      }

      await axios.post("/api/dbhandler?model=churchmembers", fd);
      toast.success(`Member added to ${targetSection.name}!`);
      setIsAddMemberOpen(false);
      setMemberName("");
      setMemberPosition("");
      setMemberFile(null);
      fetchSections();
    } catch (err) {
      console.error("Failed to add member", err);
      toast.error("Failed to add member.");
    } finally {
      setIsSubmittingMember(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: CHANGE / RETIRE MEMBER (KEEPS TRACK OF OLD MEMBERS IN DB)
  // --------------------------------------------------------------------------
  const handleOpenChangeMember = (section: SectionData) => {
    setTargetSection(section);
    setRetiringMemberId("");
    setRetiringEndDate("");
    setReplacementName("");
    setReplacementPosition("");
    setReplacementFile(null);
    setReplacementTenure(`${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`);
    setIsChangeMemberOpen(true);
  };

  const handleChangeMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSection) return;
    if (!retiringMemberId) {
      toast.error("Please select the member whose tenure has concluded");
      return;
    }
    if (!retiringEndDate.trim()) {
      toast.error("Please provide the tenure completion date for the retiring member");
      return;
    }
    if (!replacementName.trim()) {
      toast.error("Please provide the incoming replacement member's name");
      return;
    }

    setIsSubmittingChange(true);

    try {
      const currentMemberToRetire = targetSection.members.find(
        (m) => m.id === retiringMemberId
      );

      // 1. Archive retiring member in DB (sets isCurrent = false, updates tenure year string)
      const updatedTenure = `${currentMemberToRetire?.year || "Past"} (Tenure ended: ${retiringEndDate.trim()})`;
      await axios.put(`/api/dbhandler?model=churchmembers&id=${retiringMemberId}`, {
        isCurrent: false,
        year: updatedTenure,
      });

      // 2. Insert incoming replacement member (isCurrent = true)
      const fd = new FormData();
      fd.append("name", replacementName.trim());
      fd.append(
        "position",
        replacementPosition.trim() || currentMemberToRetire?.position || "Executive Member"
      );
      fd.append(
        "year",
        replacementTenure.trim() || `${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`
      );
      fd.append("sectionId", targetSection.id);
      fd.append("isCurrent", "true");
      if (replacementFile) {
        fd.append("picture", replacementFile);
      }

      await axios.post("/api/dbhandler?model=churchmembers", fd);

      toast.success("Member tenure updated! Old member archived and new member appointed.");
      setIsChangeMemberOpen(false);
      fetchSections();
    } catch (err) {
      console.error("Failed to change member", err);
      toast.error("Failed to update membership tenure.");
    } finally {
      setIsSubmittingChange(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLER: DELETE SECTION / MEMBER
  // --------------------------------------------------------------------------
  const handleDeleteSection = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" section and all its records?`)) return;
    try {
      await axios.delete(`/api/dbhandler?model=churchsections&id=${id}`);
      toast.success(`"${name}" section deleted.`);
      fetchSections();
    } catch (err) {
      console.error("Delete section error", err);
      toast.error("Failed to delete section.");
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} from records?`)) return;
    try {
      await axios.delete(`/api/dbhandler?model=churchmembers&id=${id}`);
      toast.success("Member record removed.");
      fetchSections();
    } catch (err) {
      console.error("Delete member error", err);
      toast.error("Failed to delete member.");
    }
  };

  const toggleHistory = (sectionId: string) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Filter groups: exclude Shepherds from regular groups loop (Shepherds are featured prominently above)
  const regularGroups = sections.filter(
    (s) => s.name.trim().toLowerCase() !== "shepherds"
  );

  const oguduhistory = [
    `CCC Ogudu Expressway Cathedral was founded in 1977 through divine intervention and prophetic messages. The word of God came to Superior Leader Asooto in the third quarter of 1977, directing the establishment of a parish in Ogudu, a village at the time. The land, formerly used for a poultry farm belonging to Superior Leader Asooto, was converted into a place of worship. A young girl prophesied that the church would bear the torch, and Senior Evangelist Oladapo, along with Superior Leader Asooto, fulfilled the word of God by establishing the parish.`,
    `The parish was initially erected with temporary structures like bamboo, poles, and palm fronds, in obedience to the divine directive. Despite the makeshift nature of the building, God assured that it would not rain on the site in a way that would disturb worshippers until a more permanent structure could be built. This promise was dramatically fulfilled when it rained heavily around the town but not on the church site. The parish experienced rapid growth and miracles, attracting attention and support from both members and well-wishers.`,
    `Under the leadership of various shepherds, including Senior Evangelist Oladapo, Superior Evangelist J.B. Adelaja, and others, the church flourished. Chief Bola Adewunmi, who was approached by a prophet of the church, single-handedly completed the first permanent structure and became a worshipper in the parish. The church has since grown, with notable contributions from members and the fulfillment of prophecies about its future. Today, the CCC Ogudu Expressway Cathedral stands as a testament to faith and divine providence, with a rich history and a vibrant community.`,
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
      className="w-full overflow-hidden flex flex-col justify-center"
    >
      {/* -------------------------------------------------------------------- */}
      {/* 1. HERO & FOUNDATIONAL HISTORY                                       */}
      {/* -------------------------------------------------------------------- */}
      <section className="md:max-w-[1240px] md:mx-auto mb-16 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:justify-between mt-6 mb-8">
          <span className="text-4xl md:text-5xl font-bold tracking-tight">
            About <span className="text-accent">Us</span>
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* History Text */}
          <div className="flex-1 space-y-4 text-justify leading-relaxed text-secondary-foreground/90">
            <div className="text-xs uppercase tracking-widest font-bold text-accent mb-2">
              Brief history of the foundation of celestial church of christ
            </div>
            {oguduhistory.map((paragraph, index) => (
              <p key={index} className="indent-6 text-sm md:text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Leadership Grid: Pastor Founder, Pastor Worldwide, Shepherd, Vice Shepherd */}
          <div className="w-full lg:w-[580px] shrink-0">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center lg:text-left flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Pastoral & Cathedral Leadership</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Permanent Worldwide Leaders */}
              <ProfileCard
                name="Papa S.B.J. Oshoffa"
                title="Pastor Founder"
                profileImage="./papaoshofa.jpg"
              />
              <ProfileCard
                name="Rev. EMF Oshoffa"
                title="Current Pastor Worldwide"
                profileImage="./pastor.jpg"
              />

              {/* Dynamic Cathedral Shepherd */}
              <div className="relative group">
                <ProfileCard
                  name={currentShepherd?.name || "Shepherd Name"}
                  title={currentShepherd?.position || "Shepherd-in-Charge"}
                  profileImage={currentShepherd?.pictureUrl || "./shephard.jpg"}
                />
                {currentShepherd?.year && (
                  <div className="text-[10px] text-center font-semibold text-accent/80 -mt-2">
                    {currentShepherd.year}
                  </div>
                )}
              </div>

              {/* Dynamic Cathedral Vice Shepherd */}
              <div className="relative group">
                <ProfileCard
                  name={currentViceShepherd?.name || "Asst Shepherd Name"}
                  title={currentViceShepherd?.position || "Vice Shepherd"}
                  profileImage={currentViceShepherd?.pictureUrl || "./shephardasst.jpg"}
                />
                {currentViceViceTenure(currentViceShepherd)}
              </div>
            </div>

            {/* ACTION BUTTON UNDER SHEPHERD & VICE SHEPHERD */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <Button
                type="button"
                onClick={() => setIsShepherdDialogOpen(true)}
                className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 py-2 text-xs shadow-md shadow-accent/20 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add / Change Shepherd & Vice Shepherd</span>
              </Button>

              {pastShepherds.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPastShepherds(!showPastShepherds)}
                  className="rounded-full border-border/80 text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5 text-accent" />
                  <span>
                    {showPastShepherds ? "Hide History" : `Former Shepherds (${pastShepherds.length})`}
                  </span>
                  {showPastShepherds ? (
                    <ChevronUp className="w-3.5 h-3.5 ml-1" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 ml-1" />
                  )}
                </Button>
              )}
            </div>

            {/* EXPANDABLE FORMER SHEPHERDS HISTORY */}
            {showPastShepherds && pastShepherds.length > 0 && (
              <div className="mt-5 p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Historical Shepherds Archive</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {pastShepherds.map((past) => (
                    <div
                      key={past.id}
                      className="p-2.5 rounded-xl bg-card border border-border/70 text-center relative group"
                    >
                      <img
                        src={past.pictureUrl || "./placeholderMale.jpg"}
                        alt={past.name}
                        className="w-14 h-14 rounded-full mx-auto object-cover border border-accent/30 mb-2"
                      />
                      <div className="font-bold text-xs truncate">{past.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {past.position || "Shepherd"}
                      </div>
                      <div className="text-[10px] text-accent/80 font-semibold mt-1">
                        {past.year}
                      </div>
                      <button
                        onClick={() => handleDeleteMember(past.id, past.name)}
                        className="absolute top-1 right-1 p-1 bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete past shepherd record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 2. CHURCH GROUPS / COMMITTEES HEADER WITH "CREATE GROUP" BUTTON       */}
      {/* -------------------------------------------------------------------- */}
      <section className="w-full max-w-6xl mx-auto px-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-accent/15 via-background to-secondary/30 border border-border/80 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-accent" />
              <span>Cathedral Groups & Committees</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Parochial committee, youth, media, and church departments driving the parish vision.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsCreateGroupOpen(true)}
            className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-2.5 text-sm shadow-md shadow-accent/25 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </Button>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 3. GROUP SECTIONS (PAROCHIAL, YOUTH, MEDIA, GOODWOMEN, ETC.)         */}
      {/* -------------------------------------------------------------------- */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-accent mb-2" />
          <p className="text-sm font-semibold text-muted-foreground">
            Loading church groups and committees...
          </p>
        </div>
      ) : (
        <div className="space-y-20 max-w-6xl mx-auto px-4 mb-28">
          {regularGroups.map((section) => {
            const currentMembers = section.members.filter(
              (m) => m.isCurrent !== false
            );
            const pastMembers = section.members.filter(
              (m) => m.isCurrent === false
            );

            // Tenure duration preview
            const activeTenure =
              currentMembers[0]?.year ||
              `${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`;
            const isHistoryOpen = Boolean(expandedHistory[section.id]);

            return (
              <section
                key={section.id}
                className="flex flex-col items-center justify-center w-full relative bg-card/40 rounded-3xl p-6 sm:p-8 border border-border/70 shadow-sm"
              >
                {/* SECTION HEADER & ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 pb-6 border-b border-border/60">
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl sm:text-3xl font-bold">
                      Meet the <span className="text-accent">{section.name}</span>
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold border border-accent/25">
                        Tenure: {activeTenure}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({currentMembers.length} active member{currentMembers.length === 1 ? "" : "s"})
                      </span>
                    </div>
                  </div>

                  {/* Group Action Buttons: Add Member, Change/Retire, History, Delete */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenAddMember(section)}
                      className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-4 text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </Button>

                    {currentMembers.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenChangeMember(section)}
                        className="rounded-full text-xs font-semibold px-3.5 flex items-center gap-1.5 border-border/80 hover:bg-muted"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-accent" />
                        <span>Change Member</span>
                      </Button>
                    )}

                    {pastMembers.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleHistory(section.id)}
                        className="rounded-full text-xs font-semibold px-3 flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <History className="w-3.5 h-3.5 text-accent" />
                        <span>Past Members ({pastMembers.length})</span>
                        {isHistoryOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteSection(section.id, section.name)}
                      className="rounded-full h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      title="Delete this section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* CURRENT MEMBERS LIST */}
                <div className="w-full pt-8">
                  {currentMembers.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-6">
                      {currentMembers.map((member) => (
                        <div
                          key={member.id}
                          className="w-[170px] md:w-[220px] relative group/member flex flex-col items-center"
                        >
                          <ProfileCardTransparentBG
                            name={member.name}
                            title={member.position || "Member"}
                            profileImage={member.pictureUrl || "./placeholderMale.jpg"}
                          />
                          <div className="text-[11px] font-semibold text-accent/80 mt-1">
                            {member.year}
                          </div>
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover/member:opacity-100 transition-opacity shadow-sm"
                            title="Remove member"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 px-4 text-center rounded-2xl bg-secondary/20 border border-dashed border-border/80 max-w-md mx-auto">
                      <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm font-semibold text-foreground">
                        No members currently assigned to {section.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Click below to appoint executives and committee leadership.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleOpenAddMember(section)}
                        className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        <span>Add First Member</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* PAST / RETIRED MEMBERS ARCHIVE */}
                {isHistoryOpen && pastMembers.length > 0 && (
                  <div className="w-full mt-10 p-6 rounded-2xl bg-muted/40 border border-border/70 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                      <History className="w-4 h-4" />
                      <span>Past Executive Members & Historical Archives</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-5">
                      {pastMembers.map((past) => (
                        <div
                          key={past.id}
                          className="w-[150px] md:w-[190px] p-3 rounded-xl bg-card border border-border/80 flex flex-col items-center text-center relative group"
                        >
                          <img
                            src={past.pictureUrl || "./placeholderMale.jpg"}
                            alt={past.name}
                            className="w-16 h-16 rounded-full object-cover border border-accent/30 mb-2"
                          />
                          <div className="font-bold text-xs truncate w-full">{past.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate w-full">
                            {past.position || "Former Member"}
                          </div>
                          <span className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-muted font-semibold text-accent/80 border border-border/60">
                            {past.year}
                          </span>
                          <button
                            onClick={() => handleDeleteMember(past.id, past.name)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete record"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. DIALOG: ADD / CHANGE SHEPHERD & VICE SHEPHERD                     */}
      {/* -------------------------------------------------------------------- */}
      <Dialog open={isShepherdDialogOpen} onOpenChange={setIsShepherdDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-accent mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Cathedral Leadership Form
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold">
              Add / Change Shepherd & Vice Shepherd
            </DialogTitle>
            <DialogDescription>
              Appoint new pastoral leadership. When appointing new shepherds, the tenure completion date for the outgoing leadership is preserved in the database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleShepherdSubmit} className="space-y-6 mt-3">
            {/* Outgoing Shepherd Ending Date Notice */}
            {currentShepherd && (
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-accent">
                  <Clock className="w-4 h-4" />
                  <span>Outgoing Leadership Tenure Completion</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current Shepherd: <strong>{currentShepherd.name}</strong> ({currentShepherd.year})
                  {currentViceShepherd && (
                    <> | Vice Shepherd: <strong>{currentViceShepherd.name}</strong></>
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-medium text-foreground/90 mb-1 block">
                      Outgoing Shepherd Ending Date <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g. October 2026 or 2024 - 2026"
                      value={oldShepherdEndDate}
                      onChange={(e) => setOldShepherdEndDate(e.target.value)}
                      required
                      className="bg-background/80 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground/90 mb-1 block">
                      Outgoing Vice Shepherd Ending Date
                    </label>
                    <Input
                      placeholder="e.g. October 2026 (Optional)"
                      value={oldViceEndDate}
                      onChange={(e) => setOldViceEndDate(e.target.value)}
                      className="bg-background/80 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* New Shepherd Section */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>New Shepherd-in-Charge</span>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">
                  Full Name & Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. V/S/E Samuel Adeleke"
                  value={newShepherdName}
                  onChange={(e) => setNewShepherdName(e.target.value)}
                  required
                  className="bg-background/80 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    Tenure Duration
                  </label>
                  <Input
                    placeholder="e.g. 2026 - Present"
                    value={newShepherdTenure}
                    onChange={(e) => setNewShepherdTenure(e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    Shepherd Portrait / Photo
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewShepherdFile(e.target.files?.[0] || null)}
                    className="bg-background/80 text-xs cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* New Vice Shepherd Section */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>New Vice Shepherd (Assistant Shepherd)</span>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">
                  Full Name & Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Superior Evangelist David Alabi"
                  value={newViceName}
                  onChange={(e) => setNewViceName(e.target.value)}
                  required
                  className="bg-background/80 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    Tenure Duration
                  </label>
                  <Input
                    placeholder="e.g. 2026 - Present"
                    value={newViceTenure}
                    onChange={(e) => setNewViceTenure(e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    Vice Shepherd Portrait / Photo
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewViceFile(e.target.files?.[0] || null)}
                    className="bg-background/80 text-xs cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsShepherdDialogOpen(false)}
                disabled={isSubmittingShepherd}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingShepherd}
                className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 shadow-md shadow-accent/20"
              >
                {isSubmittingShepherd ? (
                  <span>Saving to DB...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    <span>Appoint Shepherds</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------------- */}
      {/* 5. DIALOG: CREATE NEW GROUP                                          */}
      {/* -------------------------------------------------------------------- */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-accent mb-1">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Parish Department / Committee
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold">Create New Group</DialogTitle>
            <DialogDescription>
              Create a new church group, committee, or fellowship department with initial member details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroupSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">
                Group Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Sanctuary Choir, Welfare Committee, Youth Ministry"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                className="bg-background/70 text-sm"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Initial Executive Member (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    Member Name
                  </label>
                  <Input
                    placeholder="Full name"
                    value={initialMemberName}
                    onChange={(e) => setInitialMemberName(e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    Position / Role
                  </label>
                  <Input
                    placeholder="e.g. Chairperson, Secretary"
                    value={initialMemberPosition}
                    onChange={(e) => setInitialMemberPosition(e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    Tenure Duration
                  </label>
                  <Input
                    placeholder="e.g. 2025 - 2027"
                    value={initialMemberTenure}
                    onChange={(e) => setInitialMemberTenure(e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    Member Photo
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setInitialMemberFile(e.target.files?.[0] || null)}
                    className="bg-background/80 text-xs cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateGroupOpen(false)}
                disabled={isSubmittingGroup}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingGroup}
                className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 shadow-md shadow-accent/20"
              >
                {isSubmittingGroup ? "Creating..." : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------------- */}
      {/* 6. DIALOG: ADD MEMBER TO EXISTING GROUP                              */}
      {/* -------------------------------------------------------------------- */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-accent mb-1">
              <UserPlus className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {targetSection?.name || "Group"}
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold">
              Add Member to {targetSection?.name}
            </DialogTitle>
            <DialogDescription>
              Appoint an executive or active committee member to this church section.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMemberSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">
                Member Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Sister Grace Adeleke"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                required
                className="bg-background/80 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">
                Position / Role
              </label>
              <Input
                placeholder="e.g. General Secretary, Youth Leader, Chorister"
                value={memberPosition}
                onChange={(e) => setMemberPosition(e.target.value)}
                className="bg-background/80 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">
                Tenure Duration
              </label>
              <Input
                placeholder="e.g. 2025 - 2027"
                value={memberTenure}
                onChange={(e) => setMemberTenure(e.target.value)}
                className="bg-background/80 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block">
                Member Photo (Optional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setMemberFile(e.target.files?.[0] || null)}
                className="bg-background/80 text-xs cursor-pointer"
              />
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMemberOpen(false)}
                disabled={isSubmittingMember}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingMember}
                className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6"
              >
                {isSubmittingMember ? "Saving..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------------- */}
      {/* 7. DIALOG: CHANGE / RETIRE MEMBER (PRESERVES OLD MEMBER IN DB)       */}
      {/* -------------------------------------------------------------------- */}
      <Dialog open={isChangeMemberOpen} onOpenChange={setIsChangeMemberOpen}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-accent mb-1">
              <RefreshCw className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {targetSection?.name || "Group"}
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold">
              Change / Retire Group Member
            </DialogTitle>
            <DialogDescription>
              Select the member whose term of service has finished, record their completion date, and appoint the incoming member. The database will preserve the old member in the historical records.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangeMemberSubmit} className="space-y-4 mt-2">
            {/* Outgoing Member Selection */}
            <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/25 space-y-3">
              <div className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Outgoing Member Finishing Tenure</span>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">
                  Select Outgoing Member <span className="text-destructive">*</span>
                </label>
                <Select
                  value={retiringMemberId}
                  onValueChange={setRetiringMemberId}
                >
                  <SelectTrigger className="bg-background/80 text-xs">
                    <SelectValue placeholder="Choose current member" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetSection?.members
                      .filter((m) => m.isCurrent !== false)
                      .map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} — {m.position || "Member"} ({m.year})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">
                  Tenure Ending Date <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. December 2026 or 2024 - 2026"
                  value={retiringEndDate}
                  onChange={(e) => setRetiringEndDate(e.target.value)}
                  required
                  className="bg-background/80 text-xs"
                />
              </div>
            </div>

            {/* Incoming Replacement Member */}
            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                <span>Incoming Replacement Member</span>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">
                  Replacement Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Brother Emmanuel Adele"
                  value={replacementName}
                  onChange={(e) => setReplacementName(e.target.value)}
                  required
                  className="bg-background/80 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    Position / Role
                  </label>
                  <Input
                    placeholder="e.g. Secretary, Leader"
                    value={replacementPosition}
                    onChange={(e) => setReplacementPosition(e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1 block">
                    New Tenure Duration
                  </label>
                  <Input
                    placeholder="e.g. 2026 - 2028"
                    value={replacementTenure}
                    onChange={(e) => setReplacementTenure(e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">
                  Replacement Photo (Optional)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReplacementFile(e.target.files?.[0] || null)}
                  className="bg-background/80 text-xs cursor-pointer"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangeMemberOpen(false)}
                disabled={isSubmittingChange}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingChange}
                className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6"
              >
                {isSubmittingChange ? "Updating Tenure..." : "Change Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
};

// Helper: safe tenure display
function currentViceViceTenure(vice: Member | null) {
  if (!vice?.year) return null;
  return (
    <div className="text-[10px] text-center font-semibold text-accent/80 -mt-2">
      {vice.year}
    </div>
  );
}

export default About;
