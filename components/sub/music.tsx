"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Heart,
  MessageSquare,
  Copy,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Zap,
  Music as MusicIcon,
  Video as VideoIcon,
  Disc3,
  Sparkles,
  Send,
  ListFilter,
  Radio,
  Loader2,
  X,
  Rocket,
} from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { prioritizeUnseenMedia, markMediaAsSeen } from "@/lib/mediaTracker";

/** ----------------------------------------------------------------
 * CLOUDINARY VIDEO-TO-AUDIO STREAMING TRANSFORMER
 * Since only video media remains in Cloudinary, this tells Cloudinary
 * to deliver ONLY the audio stream (format: MP3, vc_none removes video track)
 * saving bandwidth and optimizing audio playback!
 * ----------------------------------------------------------------*/
export function transformToCloudinaryAudio(url: string): string {
  if (!url) return "";
  const cleanUrl = url.trim();

  // If already an audio file
  if (/\.(mp3|m4a|wav|aac|ogg)(\?.*)?$/i.test(cleanUrl)) {
    return cleanUrl;
  }

  // Cloudinary video URL: instruct Cloudinary to discard video stream and send ONLY audio format
  if (cleanUrl.includes("res.cloudinary.com") && cleanUrl.includes("/video/upload/")) {
    return cleanUrl
      .replace(/\/video\/upload\/(?:[^\/]+\/)?/, (match) => {
        // Strip video stream (vc_none) and format as mp3 with audio quality auto
        return match.includes("f_mp3") ? match : "/video/upload/f_mp3,vc_none,q_auto/";
      })
      .replace(/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i, ".mp3$2");
  }

  return cleanUrl;
}

export function transformToCloudinaryThumbnail(url: string, fallbackThumb?: string): string {
  if (!url && fallbackThumb) return fallbackThumb;
  const cleanUrl = url ? url.trim().replace(/^http:\/\//i, "https://") : "";
  if (cleanUrl.includes("res.cloudinary.com") && cleanUrl.includes("/video/upload/")) {
    // Cloudinary extracts 1st frame image of the video at second 0
    return cleanUrl
      .replace(/\/video\/upload\/(?:[^\/]+\/)?/, "/video/upload/so_0,f_jpg,w_600,c_fill,q_auto/")
      .replace(/\.(mp4|mov|webm|mkv|avi|m4v|mp3)(\?.*)?$/i, ".jpg$2");
  }
  return fallbackThumb || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";
}

export interface CommentItem {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  time: string;
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  category: string;
  audioUrl: string;
  videoUrl?: string;
  thumbnailUrl: string;
  duration?: number;
  likes?: number;
  comments?: CommentItem[];
}

export type PlaybackMode = "play-1" | "play-all" | "loop-all";

export interface MusicProps {
  tracks?: MediaTrack[];
  initialTrackIndex?: number;
  className?: string;
  onTrackChange?: (track: MediaTrack) => void;
  defaultMinimized?: boolean;
  fullscreenOnMaximize?: boolean;
  allowMinimize?: boolean;
  dockedOnMinimize?: boolean;
  defaultRandom?: boolean;
  defaultCategory?: string;
}

// Media Categories matching the blog page tabs and database models
const MEDIA_CATEGORIES = [
  { id: "all", label: "All", badge: "All" },
  { id: "ccc", label: "CCC Hymns", badge: "Hymns" },
  { id: "praise", label: "Praise", badge: "Popular" },
  { id: "worship", label: "Worship", badge: "Spiritual" },
  { id: "ccc ogudu", label: "CCC Ogudu", badge: "Featured" },
  { id: "hymn", label: "Hymns", badge: "Classics" },
  { id: "ccc", label: "CCC", badge: "Heritage" },
  { id: "bible", label: "Bible", badge: "Sermon" },
  { id: "musical", label: "Musical", badge: "Choir" },
  { id: "revival", label: "Revival", badge: "Special" },
  { id: "youth", label: "Youth", badge: "Vibrant" },
];

// Default Cloudinary video media with audio-only transformation
const DEFAULT_TRACKS: MediaTrack[] = [
  {
    id: "cld-praise-1",
    title: "This Kind God Another One Mo Dey (OG Drummer)",
    artist: "CCC Ogudu Choir & Drummers",
    category: "praise",
    videoUrl: "https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149309/this_kind_God_another_one_mo_dey_OG_drummer_ha8sqk.mp4",
    audioUrl: transformToCloudinaryAudio("https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149309/this_kind_God_another_one_mo_dey_OG_drummer_ha8sqk.mp4"),
    thumbnailUrl: transformToCloudinaryThumbnail("https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149309/this_kind_God_another_one_mo_dey_OG_drummer_ha8sqk.mp4"),
    duration: 195,
    likes: 420,
    comments: [
      { id: "c1", user: "Bro Samuel", text: "Celestial percussion at its finest! Hallelujah!", time: "15 mins ago" },
      { id: "c2", user: "Sis Folake", text: "Blessing my soul today.", time: "1 hour ago" },
    ],
  },
  {
    id: "cld-praise-2",
    title: "Nle Atobi Ju (Celestial Praise Video)",
    artist: "Celestial Praise Band",
    category: "praise",
    videoUrl: "https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149289/nle_atobi_ju_izj0mn.mp4",
    audioUrl: transformToCloudinaryAudio("https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149289/nle_atobi_ju_izj0mn.mp4"),
    thumbnailUrl: transformToCloudinaryThumbnail("https://res.cloudinary.com/drgpl4vsj/video/upload/v1770149289/nle_atobi_ju_izj0mn.mp4"),
    duration: 230,
    likes: 388,
    comments: [
      { id: "c3", user: "Bro David", text: "Glory be to Jehovah in the highest!", time: "3 hours ago" },
    ],
  },
  {
    id: "cld-worship-1",
    title: "Olorinmi x2 Iwo Loju Ti Mo Fi Riran",
    artist: "CCC Ogudu Central Choir",
    category: "worship",
    videoUrl: "https://res.cloudinary.com/drgpl4vsj/video/upload/v1756847203/olorinmi_x2_iwo_loju_ti_mo_fi_riran_saxmxv.mp4",
    audioUrl: transformToCloudinaryAudio("https://res.cloudinary.com/drgpl4vsj/video/upload/v1756847203/olorinmi_x2_iwo_loju_ti_mo_fi_riran_saxmxv.mp4"),
    thumbnailUrl: transformToCloudinaryThumbnail("https://res.cloudinary.com/drgpl4vsj/video/upload/v1756847203/olorinmi_x2_iwo_loju_ti_mo_fi_riran_saxmxv.mp4"),
    duration: 215,
    likes: 560,
    comments: [
      { id: "c4", user: "Leader Ezekiel", text: "Sacred echoes touching heavens.", time: "2 hours ago" },
    ],
  },
  {
    id: "cld-hymn-1",
    title: "Olore - Celestial Hymn 420",
    artist: "CCC Ogudu Youth Fellowship",
    category: "hymn",
    videoUrl: "https://res.cloudinary.com/drgpl4vsj/video/upload/v1756847202/olore_dzeew9.mp4",
    audioUrl: transformToCloudinaryAudio("https://res.cloudinary.com/drgpl4vsj/video/upload/v1756847202/olore_dzeew9.mp4"),
    thumbnailUrl: transformToCloudinaryThumbnail("https://res.cloudinary.com/drgpl4vsj/video/upload/v1756847202/olore_dzeew9.mp4"),
    duration: 245,
    likes: 610,
    comments: [
      { id: "c5", user: "Mother Bola", text: "Touching spiritual hymn. Amen.", time: "Yesterday" },
    ],
  },
];

export const Music: React.FC<MusicProps> = ({
  tracks: propTracks,
  initialTrackIndex = 0,
  className = "",
  onTrackChange,
  defaultMinimized = false,
  fullscreenOnMaximize = false,
  allowMinimize = true,
  dockedOnMinimize = true,
  defaultRandom = false,
  defaultCategory = "all",
}) => {
  // Mode: "audio" (default) or "video"
  const [mediaMode, setMediaMode] = useState<"audio" | "video">("audio");

  // Minimized / Maximized state
  const [isMinimized, setIsMinimized] = useState<boolean>(allowMinimize ? defaultMinimized : false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Active Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);

  // Cloudinary / DB Fetched Tracks
  const [cloudinaryTracks, setCloudinaryTracks] = useState<MediaTrack[]>(propTracks || DEFAULT_TRACKS);
  const [isLoadingMedia, setIsLoadingMedia] = useState<boolean>(false);

  // Track Playlist State
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(initialTrackIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(215);

  // Playback Order & Modes
  const [isShuffle, setIsShuffle] = useState<boolean>(defaultRandom);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("play-all");

  // Bass Boost Mode
  const [bassMode, setBassMode] = useState<boolean>(false);

  // Volume & 1.5x App Volume Boost
  // Volume ranges from 0.0 to 1.5 (100% is normal max, up to 1.5 is +150% boost via Web Audio GainNode)
  const [volume, setVolume] = useState<number>(1.2);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Social interactions (Like, Comment, Copy)
  const [likedTrackIds, setLikedTrackIds] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [isPlaylistSheetOpen, setIsPlaylistSheetOpen] = useState(false);

  // Amplitude Visualizer Data State
  const [amplitudeData, setAmplitudeData] = useState<number[]>(new Array(36).fill(10));

  // Audio & Video Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null); // For 1.5x volume amplification
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /** ----------------------------------------------------------------
   * FETCH CLOUDINARY MEDIA FROM DATABASE
   * Since only video media remains in Cloudinary, we tell Cloudinary
   * to send only the audio format (f_mp3,vc_none) to the music player!
   * ----------------------------------------------------------------*/
  useEffect(() => {
    if (propTracks && propTracks.length > 0) return;

    let isMounted = true;
    const fetchCloudinaryMedia = async () => {
      setIsLoadingMedia(true);
      try {
        const res = await axios.get("/api/dbhandler", {
          params: { model: "posts" },
        });

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // All media stored in Cloudinary are video posts
          const videoPosts = res.data.filter(
            (p: any) => p.url && (p.type === "video" || p.url.includes("/video/upload/"))
          );

          if (videoPosts.length > 0 && isMounted) {
            const mappedTracks: MediaTrack[] = videoPosts.map((post: any, idx: number) => {
              const postCategory = Array.isArray(post.for)
                ? post.for[0] || "praise"
                : typeof post.for === "string"
                ? post.for
                : "worship";

              // Tell Cloudinary to transcode and stream audio only (no video data)
              const audioStreamUrl = transformToCloudinaryAudio(post.url);
              // Extract the first video frame thumbnail for the rotating vinyl disk
              const thumbnailUrl = transformToCloudinaryThumbnail(
                post.url,
                post.user?.avatarUrl || DEFAULT_TRACKS[idx % DEFAULT_TRACKS.length].thumbnailUrl
              );

              return {
                id: String(post.id || `cld-${idx}`),
                title: post.title || post.post || `Celestial Praise Track #${idx + 1}`,
                artist: post.user?.username ? `CCC Ogudu (${post.user.username})` : "CCC Ogudu Parish",
                category: postCategory.toLowerCase().replace("video", ""),
                audioUrl: audioStreamUrl,
                videoUrl: post.url,
                thumbnailUrl,
                duration: post.duration && !isNaN(Number(post.duration)) ? Number(post.duration) : 210,
                likes: 120 + (idx * 37) % 500,
                comments: [],
              };
            });

            // Combine mapped Cloudinary tracks with default library
            setCloudinaryTracks([...mappedTracks, ...DEFAULT_TRACKS]);
          }
        }
      } catch (err) {
        console.warn("Using Cloudinary asset catalogue for audio streaming:", err);
      } finally {
        if (isMounted) setIsLoadingMedia(false);
      }
    };

    fetchCloudinaryMedia();
    return () => {
      isMounted = false;
    };
  }, [propTracks]);

  const filteredTracks = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all") return cloudinaryTracks;
    const cat = selectedCategory.toLowerCase().replace("video", "").trim();

    // Specific match for CCC Hymns playlist
    if (cat === "ccc hymns" || cat === "ccchymns" || cat === "ccc-hymns" || cat === "hymn" || cat === "hymns") {
      const results = cloudinaryTracks.filter((t) => {
        const trackCat = t.category.toLowerCase();
        return trackCat.includes("hymn") || trackCat.includes("ccc");
      });
      if (results.length > 0) return results;
    }

    return cloudinaryTracks.filter((t) => {
      const trackCat = t.category.toLowerCase().replace("video", "");
      return trackCat.includes(cat) || cat.includes(trackCat);
    });
  }, [cloudinaryTracks, selectedCategory]);

  const rawPlaylist = filteredTracks.length > 0 ? filteredTracks : cloudinaryTracks;
  const playlist = useMemo(() => {
    return prioritizeUnseenMedia(rawPlaylist);
  }, [rawPlaylist]);

  const currentTrack = useMemo(() => {
    if (playlist.length === 0) return DEFAULT_TRACKS[0];
    return playlist[currentTrackIndex % playlist.length] || playlist[0];
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    if (currentTrack) {
      if (isPlaying) {
        markMediaAsSeen(currentTrack.id);
      }
      setLikeCounts((prev) => ({
        ...prev,
        [currentTrack.id]: prev[currentTrack.id] ?? (currentTrack.likes || 140),
      }));
      setCommentsMap((prev) => ({
        ...prev,
        [currentTrack.id]: prev[currentTrack.id] || currentTrack.comments || [],
      }));
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (onTrackChange && currentTrack) {
      onTrackChange(currentTrack);
    }
  }, [currentTrack, onTrackChange]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  /** ----------------------------------------------------------------
   * Web Audio API: 1.5x Volume Boost GainNode + Bass Filter + Analyser
   * ----------------------------------------------------------------*/
  const setupWebAudio = useCallback(() => {
    const mediaEl = mediaMode === "video" ? videoRef.current : audioRef.current;
    if (!mediaEl || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      // AnalyserNode
      if (!analyserRef.current) {
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
      }

      // Bass EQ Filter
      if (!bassFilterRef.current) {
        const filter = audioContextRef.current.createBiquadFilter();
        filter.type = "lowshelf";
        filter.frequency.setValueAtTime(120, audioContextRef.current.currentTime);
        filter.gain.setValueAtTime(bassMode ? 10 : 0, audioContextRef.current.currentTime);
        bassFilterRef.current = filter;
      }

      // GainNode for 1.5x Volume Boost (Amplify audio volume above standard 1.0)
      if (!gainNodeRef.current) {
        const gain = audioContextRef.current.createGain();
        gain.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
        gainNodeRef.current = gain;
      }

      // Connect Graph: Source -> Bass Filter -> GainNode (Up to 1.5x) -> Analyser -> Destination
      if (!sourceRef.current) {
        const source = audioContextRef.current.createMediaElementSource(mediaEl);
        source.connect(bassFilterRef.current);
        bassFilterRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        sourceRef.current = source;
      }
    } catch {
      // Audio element already routed
    }
  }, [mediaMode, bassMode, volume]);

  // Update GainNode whenever volume changes (amplifying up to 1.5x)
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      const targetGain = isMuted ? 0 : volume;
      gainNodeRef.current.gain.setTargetAtTime(
        targetGain,
        audioContextRef.current.currentTime,
        0.02
      );
    }
  }, [volume, isMuted]);

  // Update bass filter gain when bassMode changes
  useEffect(() => {
    if (bassFilterRef.current && audioContextRef.current) {
      const gain = bassMode ? 10 : 0;
      bassFilterRef.current.gain.setTargetAtTime(
        gain,
        audioContextRef.current.currentTime,
        0.05
      );
    }
  }, [bassMode]);

  // Amplitude animation loop
  useEffect(() => {
    let phase = 0;
    const barCount = 36;
    const frequencyData = new Uint8Array(64);

    const updateVisualizer = () => {
      phase += 0.08;
      let newAmplitudes: number[] = [];

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(frequencyData);
        let hasData = false;
        for (let i = 0; i < barCount; i++) {
          const val = frequencyData[i] || 0;
          if (val > 0) hasData = true;
          const boost = bassMode && i < 8 ? 1.4 : 1.0;
          const normalized = Math.min(100, Math.max(10, Math.round((val / 255) * 100 * boost)));
          newAmplitudes.push(normalized);
        }
        if (!hasData) newAmplitudes = [];
      }

      if (newAmplitudes.length === 0) {
        for (let i = 0; i < barCount; i++) {
          if (!isPlaying) {
            newAmplitudes.push(8);
          } else {
            const bassKick = bassMode ? Math.sin(phase * 2.5) * 25 : 0;
            const primaryWave = Math.sin(phase + i * 0.3) * 28;
            const subWave = Math.cos(phase * 1.5 + i * 0.15) * 20;
            const randomJitter = Math.random() * 12;
            const combined = 25 + primaryWave + subWave + bassKick + randomJitter;
            newAmplitudes.push(Math.min(98, Math.max(12, Math.round(combined))));
          }
        }
      }

      setAmplitudeData(newAmplitudes);
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, bassMode]);

  /** ----------------------------------------------------------------
   * Playback Sync & Controls
   * ----------------------------------------------------------------*/
  const getActiveMedia = useCallback(() => {
    return mediaMode === "video" ? videoRef.current : audioRef.current;
  }, [mediaMode]);

  const togglePlayPause = useCallback(async () => {
    const media = getActiveMedia();
    if (!media) return;

    setupWebAudio();

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      try {
        await media.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Media playback error:", err);
      }
    }
  }, [getActiveMedia, isPlaying, setupWebAudio]);

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
    setTimeout(() => {
      const media = getActiveMedia();
      if (media) {
        media.currentTime = 0;
        media.play().catch(() => {});
      }
    }, 50);
  };

  const handleNextTrack = useCallback(() => {
    if (playlist.length === 0) return;

    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
      if (nextIndex === currentTrackIndex && playlist.length > 1) {
        nextIndex = (currentTrackIndex + 1) % playlist.length;
      }
    } else {
      if (currentTrackIndex >= playlist.length - 1) {
        if (playbackMode === "play-all") {
          setIsPlaying(false);
          setCurrentTime(0);
          return;
        }
        nextIndex = 0;
      } else {
        nextIndex = currentTrackIndex + 1;
      }
    }
    selectTrack(nextIndex);
  }, [playlist, currentTrackIndex, isShuffle, playbackMode]);

  const handlePrevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const media = getActiveMedia();
    if (media && media.currentTime > 3) {
      media.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    selectTrack(prevIndex);
  }, [playlist, currentTrackIndex, getActiveMedia]);

  const handleTrackEnded = useCallback(() => {
    if (playbackMode === "play-1") {
      const media = getActiveMedia();
      if (media) {
        media.currentTime = 0;
        media.play().catch(() => {});
      }
    } else {
      handleNextTrack();
    }
  }, [playbackMode, getActiveMedia, handleNextTrack]);

  const handleSeek = (value: number[]) => {
    const target = value[0];
    const media = getActiveMedia();
    if (media) {
      media.currentTime = target;
      setCurrentTime(target);
    }
  };

  // Volume change with 1.5x App Volume Boost
  const handleVolumeChange = (value: number[]) => {
    const val = value[0];
    setVolume(val);
    setupWebAudio();

    const media = getActiveMedia();
    if (media) {
      // Standard element volume caps at 1.0; GainNode amplifies further up to 1.5
      media.volume = Math.min(1.0, val);
    }

    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // One-click 1.5x Volume Boost toggle
  const toggleMaxVolumeBoost = () => {
    setupWebAudio();
    if (volume >= 1.45) {
      setVolume(1.0);
      toast.info("Audio Volume: 100% (Standard Max)");
    } else {
      setVolume(1.5);
      toast.success("1.5x Audio Volume Boost Activated! 🚀", {
        description: "+150% Amplification above hardware volume limit",
      });
    }
    if (isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    setupWebAudio();
    const media = getActiveMedia();
    if (!media) return;
    if (isMuted) {
      media.volume = Math.min(1.0, volume);
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  const cyclePlaybackMode = () => {
    if (playbackMode === "play-all") {
      setPlaybackMode("loop-all");
      toast.info("Playlist mode: Loop All Playlist");
    } else if (playbackMode === "loop-all") {
      setPlaybackMode("play-1");
      toast.info("Playlist mode: Repeat Single Track (Play 1)");
    } else {
      setPlaybackMode("play-all");
      toast.info("Playlist mode: Play All Playlist Sequentially");
    }
  };

  const toggleShuffle = () => {
    const nextVal = !isShuffle;
    setIsShuffle(nextVal);
    toast.info(nextVal ? "Shuffle: Enabled (Random Order)" : "Shuffle: Disabled (Linear Order)");
  };

  const toggleBassMode = () => {
    setupWebAudio();
    const nextVal = !bassMode;
    setBassMode(nextVal);
    if (nextVal) {
      toast.success("Bass Boost Mode: ACTIVATED 🔊", {
        description: "+10dB Low-end resonance tuned for church praise & organ",
      });
    } else {
      toast.info("Bass Boost Mode: Normal EQ");
    }
  };

  const toggleLike = (trackId: string) => {
    setLikedTrackIds((prev) => {
      const isCurrentlyLiked = !!prev[trackId];
      const nextState = !isCurrentlyLiked;
      setLikeCounts((c) => ({
        ...c,
        [trackId]: (c[trackId] || 0) + (nextState ? 1 : -1),
      }));
      if (nextState) toast.success("Added to your Liked Praises! ❤️");
      return { ...prev, [trackId]: nextState };
    });
  };

  const handleCopyTrack = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/blog/media?track=${currentTrack.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Link copied to clipboard!", {
          description: `Sharing "${currentTrack.title}"`,
        });
      });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: "c-" + Date.now(),
      user: "You",
      text: newCommentText.trim(),
      time: "Just now",
    };

    setCommentsMap((prev) => ({
      ...prev,
      [currentTrack.id]: [newComment, ...(prev[currentTrack.id] || [])],
    }));

    setNewCommentText("");
    toast.success("Comment posted!");
  };

  const handleModeSwitch = (mode: "audio" | "video") => {
    setMediaMode(mode);
    const prevMedia = mode === "video" ? audioRef.current : videoRef.current;
    const newMedia = mode === "video" ? videoRef.current : audioRef.current;

    if (prevMedia && newMedia) {
      const currentPos = prevMedia.currentTime;
      prevMedia.pause();
      newMedia.currentTime = currentPos;
      if (isPlaying) {
        setTimeout(() => {
          newMedia.play().catch(() => {});
        }, 100);
      }
    }
  };

  const isCurrentTrackLiked = !!likedTrackIds[currentTrack.id];
  const currentLikes = likeCounts[currentTrack.id] ?? (currentTrack.likes || 0);
  const currentComments = commentsMap[currentTrack.id] || [];

  /** ----------------------------------------------------------------
   * Minimized Dock Player Render (App Home Screen Dock)
   * ----------------------------------------------------------------*/
  if (isMinimized && allowMinimize) {
    return (
      <div
        className={cn(
          dockedOnMinimize
            ? "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl"
            : "relative w-full max-w-3xl mx-auto z-20 my-2",
          "bg-background/95 dark:bg-card/95 backdrop-blur-2xl border border-border/80",
          "shadow-[0_12px_40px_rgba(0,0,0,0.25)] rounded-2xl p-2.5 sm:p-3 transition-all duration-300 ease-out",
          "flex flex-col gap-2 ring-1 ring-primary/20",
          className
        )}
      >
        {/* Hidden Audio Element (playing Cloudinary audio stream) */}
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || currentTrack.duration || 215)}
          onEnded={handleTrackEnded}
          crossOrigin="anonymous"
        />

        <div className="flex items-center justify-between gap-3 px-1">
          {/* Mini Rotating Disk */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 flex-shrink-0">
              <div
                className={cn(
                  "w-12 h-12 rounded-full overflow-hidden border-2 border-accent/60 shadow-md",
                  "bg-black flex items-center justify-center relative",
                  isPlaying ? "animate-[spin_6s_linear_infinite]" : ""
                )}
                style={{
                  animationPlayState: isPlaying ? "running" : "paused",
                }}
              >
                <Image
                  src={currentTrack.thumbnailUrl}
                  alt={currentTrack.title}
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-cover rounded-full opacity-80"
                />
                <div className="absolute w-3.5 h-3.5 rounded-full bg-background border border-accent/80" />
              </div>
            </div>

            <div className="min-w-0 flex flex-col">
              <span className="font-semibold text-sm truncate max-w-[150px] sm:max-w-xs text-foreground">
                {currentTrack.title}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                <span className="truncate">{currentTrack.artist}</span>
                <Badge variant="outline" className="text-[10px] uppercase px-1 py-0 h-4 border-accent text-accent">
                  {currentTrack.category}
                </Badge>
                {isShuffle && (
                  <span className="text-[9px] font-bold text-accent bg-accent/15 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                    <Shuffle className="w-2.5 h-2.5" />
                    Random
                  </span>
                )}
                {volume > 1.0 && (
                  <span className="text-[9px] font-bold text-accent bg-accent/15 px-1 py-0.2 rounded-full flex items-center gap-0.5">
                    <Rocket className="w-2.5 h-2.5" />
                    {Math.round(volume * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mini Amplitude Waves */}
          <div className="hidden sm:flex items-center gap-0.5 h-6 px-2">
            {amplitudeData.slice(0, 14).map((amp, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-1 rounded-full transition-all duration-75",
                  bassMode ? "bg-accent" : "bg-primary"
                )}
                style={{ height: `${Math.max(15, amp * 0.6)}%` }}
              />
            ))}
          </div>

          {/* Mini Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handlePrevTrack}
              aria-label="Previous Track"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleNextTrack}
              aria-label="Next Track"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Maximize Toggle Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full border-border hover:bg-accent/10 hover:text-accent ml-1"
                    onClick={() => setIsMinimized(false)}
                    aria-label="Maximize Player to Full Screen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Maximize to Full Screen</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Mini Progress Slider */}
        <div className="w-full px-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer h-1.5"
          />
        </div>
      </div>
    );
  }

  /** ----------------------------------------------------------------
   * Maximized Full View / Fullscreen Modal Cover
   * ----------------------------------------------------------------*/
  const playerCard = (
    <Card
      className={cn(
        "relative w-full max-w-4xl mx-auto overflow-hidden",
        "bg-gradient-to-b from-card via-card/95 to-background border-border/80 shadow-2xl rounded-3xl",
        "backdrop-blur-xl transition-all duration-300",
        fullscreenOnMaximize ? "my-auto border-accent/20" : "",
        className
      )}
    >
      {/* Background Ambience Glow */}
      <div
        className={cn(
          "absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-20",
          bassMode ? "bg-accent" : "bg-primary"
        )}
      />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[120px] bg-secondary/50 pointer-events-none" />

      {/* Hidden Audio and Video Elements (Audio element receives Cloudinary audio-only stream) */}
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || currentTrack.duration || 215)}
        onEnded={handleTrackEnded}
        crossOrigin="anonymous"
      />

      {/* TOP HEADER */}
      <CardHeader className="px-5 sm:px-8 pt-5 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-4">
          {/* App Branding */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-accent/80 to-primary p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="CCC Ogudu Emblem"
                  width={34}
                  height={34}
                  className="object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
                <Radio className="w-5 h-5 text-accent absolute inset-0 m-auto pointer-events-none opacity-20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                  CCC OGUDU
                </span>
                <Badge variant="secondary" className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 bg-accent/15 text-accent border border-accent/30">
                  Media Station
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Cloudinary Audio Feeds • 1.5x Audio Booster Enabled
              </p>
            </div>
          </div>

          {/* Mode Switcher & Minimize Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Tabs
              value={mediaMode}
              onValueChange={(val) => handleModeSwitch(val as "audio" | "video")}
              className="w-auto"
            >
              <TabsList className="bg-muted/60 p-1 border border-border/60 rounded-full h-10">
                <TabsTrigger
                  value="audio"
                  className="rounded-full px-3 sm:px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-1.5"
                >
                  <MusicIcon className="w-3.5 h-3.5 text-accent" />
                  <span>Audio Mode</span>
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="rounded-full px-3 sm:px-4 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-1.5"
                >
                  <VideoIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Video Mode</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Minimize / Close Fullscreen Toggle Button */}
            {allowMinimize ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm"
                      onClick={() => setIsMinimized(true)}
                      aria-label="Minimize Player"
                    >
                      {fullscreenOnMaximize ? <X className="h-5 w-5" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {fullscreenOnMaximize ? "Close Full Screen" : "Minimize to Dock"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                    >
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-8 space-y-6">
        {/* 1. CONTINUOUS CATEGORIES CAROUSEL */}
        <div className="relative w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent" />
              Cloudinary Categories & Media Tabs
            </span>
            <div className="flex items-center gap-2">
              {isLoadingMedia && (
                <span className="text-xs text-accent flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Syncing...
                </span>
              )}
              <span className="text-xs text-muted-foreground font-mono">
                {playlist.length} Tracks
              </span>
            </div>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative px-1"
          >
            <CarouselContent className="-ml-2">
              {MEDIA_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                return (
                  <CarouselItem key={cat.id} className="pl-2 basis-auto">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentTrackIndex(0);
                      }}
                      className={cn(
                        "rounded-full text-xs font-medium px-3.5 py-1.5 h-8 transition-all flex items-center gap-2",
                        isSelected
                          ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/20"
                          : "bg-background/80 hover:bg-accent/10 border-border text-foreground hover:border-accent/40"
                      )}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={cn(
                          "text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-full",
                          isSelected
                            ? "bg-black/20 text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {cat.badge}
                      </span>
                    </Button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-3 h-7 w-7 rounded-full bg-background/80 border-border shadow-sm hidden sm:flex" />
            <CarouselNext className="-right-3 h-7 w-7 rounded-full bg-background/80 border-border shadow-sm hidden sm:flex" />
          </Carousel>
        </div>

        {/* 2. MAIN MEDIA STAGE: Audio (Turntable Rotating Disk) or Video Screen */}
        <div className="relative w-full min-h-[340px] sm:min-h-[380px] rounded-3xl bg-gradient-to-b from-muted/30 via-muted/10 to-transparent border border-border/60 p-4 sm:p-6 flex flex-col items-center justify-center">
          {mediaMode === "audio" ? (
            /* AUDIO MODE: Rotating Circular Disk with Cloudinary First-Frame Image */
            <div className="relative flex items-center justify-center w-full max-w-lg py-2">
              {/* TOP APP ICON */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/80 shadow-md">
                <Image
                  src="/logo.png"
                  alt="CCC Ogudu"
                  width={18}
                  height={18}
                  className="rounded-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-[11px] font-bold tracking-wider uppercase text-foreground">
                  CCC OGUDU PARISH
                </span>
              </div>

              {/* ROTATING DISK CONTAINER */}
              <div className="relative group my-4">
                <div
                  className={cn(
                    "absolute -inset-4 rounded-full transition-all duration-700 pointer-events-none",
                    bassMode && isPlaying
                      ? "animate-pulse bg-gradient-to-tr from-accent/30 via-primary/20 to-accent/40 blur-xl opacity-90 scale-105"
                      : "opacity-0"
                  )}
                />

                {/* Vinyl Body */}
                <div
                  className={cn(
                    "relative w-64 h-64 sm:w-72 sm:h-72 rounded-full",
                    "bg-[radial-gradient(circle,_#242424_0%,_#151515_45%,_#0a0a0a_70%,_#000000_100%)]",
                    "border-4 border-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.6)]",
                    "flex items-center justify-center overflow-hidden",
                    isPlaying ? "animate-[spin_10s_linear_infinite]" : ""
                  )}
                  style={{
                    animationPlayState: isPlaying ? "running" : "paused",
                  }}
                >
                  <div className="absolute inset-2 rounded-full border border-neutral-800/80 pointer-events-none" />
                  <div className="absolute inset-6 rounded-full border border-neutral-800/50 pointer-events-none" />
                  <div className="absolute inset-10 rounded-full border border-neutral-800/70 pointer-events-none" />
                  <div className="absolute inset-16 rounded-full border border-neutral-800/60 pointer-events-none" />

                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/5 to-transparent pointer-events-none" />

                  {/* Center Label Holding Cloudinary Thumbnail */}
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-amber-600/40 shadow-inner flex items-center justify-center bg-black">
                    <Image
                      src={currentTrack.thumbnailUrl}
                      alt={currentTrack.title}
                      fill
                      unoptimized
                      className="object-cover opacity-90 scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]" />

                    {/* Centre Play/Pause Button */}
                    <div className="relative z-10 flex items-center justify-center">
                      <Button
                        size="icon"
                        onClick={togglePlayPause}
                        className={cn(
                          "w-14 h-14 rounded-full shadow-2xl transition-all duration-200",
                          "bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-background/60",
                          "hover:scale-105 active:scale-95"
                        )}
                        aria-label={isPlaying ? "Pause Track" : "Play Track"}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 ml-0.5 fill-current" />
                        )}
                      </Button>
                    </div>

                    <div className="absolute w-2.5 h-2.5 rounded-full bg-background border border-border shadow-inner z-20 pointer-events-none" />
                  </div>
                </div>

                {/* Stylus / Arm Accent */}
                <div
                  className={cn(
                    "absolute -top-3 -right-6 sm:-right-8 w-16 h-28 pointer-events-none transition-transform duration-700 origin-top-right",
                    isPlaying ? "rotate-12 translate-x-1" : "-rotate-12 translate-x-0"
                  )}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-accent border-2 border-background shadow-md absolute right-0 top-0" />
                  <div className="w-1 h-24 bg-gradient-to-b from-accent to-neutral-400 absolute right-1 top-2 rounded-full" />
                  <div className="w-3 h-5 bg-neutral-800 rounded-sm absolute right-0 bottom-0 border border-neutral-600 shadow-sm" />
                </div>
              </div>

              {/* SIDE ACTION RAIL: Like, Comment, Copy */}
              <div className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleLike(currentTrack.id)}
                        className={cn(
                          "h-11 w-11 rounded-full border-border/80 shadow-md backdrop-blur-md transition-all",
                          isCurrentTrackLiked
                            ? "bg-red-500/10 text-red-500 border-red-500/40 hover:bg-red-500/20"
                            : "bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                        aria-label="Like Track"
                      >
                        <Heart
                          className={cn(
                            "w-5 h-5 transition-transform active:scale-125",
                            isCurrentTrackLiked ? "fill-current" : ""
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {isCurrentTrackLiked ? "Liked" : "Like"} ({currentLikes})
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Sheet open={isCommentSheetOpen} onOpenChange={setIsCommentSheetOpen}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-full bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80 shadow-md backdrop-blur-md"
                            aria-label="View Comments"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </Button>
                        </SheetTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        Comments ({currentComments.length})
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-accent" />
                        Community Testimonies & Comments
                      </SheetTitle>
                      <SheetDescription>
                        Reactions to &ldquo;{currentTrack.title}&rdquo;
                      </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto space-y-3 my-4 pr-1">
                      {currentComments.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                          No comments yet. Share your spiritual reflections below!
                        </div>
                      ) : (
                        currentComments.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-sm space-y-1"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-foreground">{item.user}</span>
                              <span className="text-muted-foreground">{item.time}</span>
                            </div>
                            <p className="text-foreground/90">{item.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-border">
                      <input
                        type="text"
                        placeholder="Share a blessing or testimony..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 bg-muted/60 text-sm px-3.5 py-2.5 rounded-full border border-border focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <Button type="submit" size="sm" className="rounded-full px-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Send className="w-4 h-4 mr-1" />
                        Post
                      </Button>
                    </form>
                  </SheetContent>
                </Sheet>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyTrack}
                        className="h-11 w-11 rounded-full bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80 shadow-md backdrop-blur-md"
                        aria-label="Copy Track Link"
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Copy Song Link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            /* VIDEO MODE */
            <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-border flex items-center justify-center">
              <video
                ref={videoRef}
                src={currentTrack.videoUrl || currentTrack.audioUrl}
                poster={currentTrack.thumbnailUrl}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || currentTrack.duration || 215)}
                onEnded={handleTrackEnded}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                playsInline
              />

              <div
                onClick={togglePlayPause}
                className={cn(
                  "absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity",
                  isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                )}
              >
                <Button
                  size="icon"
                  className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl scale-110"
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </Button>
              </div>

              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                <VideoIcon className="w-3.5 h-3.5 text-accent" />
                <span>Video Live Feed</span>
              </div>
            </div>
          )}

          {/* Current Track Metadata Title */}
          <div className="text-center mt-3 max-w-md">
            <h3 className="font-bold text-lg sm:text-xl text-foreground tracking-tight truncate">
              {currentTrack.title}
            </h3>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 mt-0.5">
              <span>{currentTrack.artist}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs uppercase px-2 py-0 border-accent/40 text-accent font-semibold">
                {currentTrack.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* 3. AMPLITUDE VISUALIZER & BASS MODE TOGGLE */}
        <div className="w-full bg-muted/30 rounded-2xl p-3 sm:p-4 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full flex items-center justify-center gap-1 sm:gap-1.5 h-12 px-2">
            {amplitudeData.map((amp, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-1 sm:w-1.5 rounded-full transition-all duration-75",
                  bassMode
                    ? idx < 10
                      ? "bg-accent shadow-sm shadow-accent/40"
                      : "bg-primary/80"
                    : "bg-primary/70"
                )}
                style={{
                  height: `${Math.max(14, amp)}%`,
                  opacity: Math.max(0.4, amp / 100),
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={bassMode ? "default" : "outline"}
                    size="sm"
                    onClick={toggleBassMode}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 h-9 font-semibold text-xs transition-all flex items-center gap-1.5",
                      bassMode
                        ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/30 animate-pulse"
                        : "bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                    )}
                    aria-label="Toggle Bass Mode"
                  >
                    <Zap className={cn("w-4 h-4", bassMode ? "fill-current" : "")} />
                    <span>Bass Mode</span>
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.2 rounded-full uppercase font-bold",
                        bassMode ? "bg-black/20 text-accent-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {bassMode ? "ON" : "OFF"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Toggle Bass Boost (+10dB Low-end resonance)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* 4. DOWN / BOTTOM PLAY CONTROLLER WITH 1.5x VOLUME BOOST */}
        <div className="w-full space-y-4 pt-2">
          {/* Seek Slider and Timestamps */}
          <div className="space-y-1.5">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Bottom Controller Buttons Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Left Controls: Shuffle & Playlist Queue Drawer */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      pressed={isShuffle}
                      onPressedChange={toggleShuffle}
                      className={cn(
                        "h-9 w-9 rounded-full border border-border/60 transition-all",
                        isShuffle
                          ? "bg-accent/15 text-accent border-accent/40"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      aria-label="Random / Shuffle Mode"
                    >
                      <Shuffle className="w-4 h-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {isShuffle ? "Shuffle: Active (Random)" : "Shuffle: Off (Linear)"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Sheet open={isPlaylistSheetOpen} onOpenChange={setIsPlaylistSheetOpen}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                          aria-label="View Queue"
                        >
                          <ListFilter className="w-4 h-4" />
                        </Button>
                      </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">Playlist Queue ({playlist.length})</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <SheetContent side="left" className="w-full sm:max-w-md p-6 flex flex-col">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <ListMusic className="w-5 h-5 text-accent" />
                      Worship & Praise Playlist
                    </SheetTitle>
                    <SheetDescription>
                      Cloudinary audio feeds ({playlist.length} available).
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto space-y-2 my-4 pr-1">
                    {playlist.map((trk, idx) => {
                      const isCurrent = idx === currentTrackIndex;
                      return (
                        <div
                          key={trk.id}
                          onClick={() => selectTrack(idx)}
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border",
                            isCurrent
                              ? "bg-accent/15 border-accent text-foreground font-medium"
                              : "bg-muted/30 border-transparent hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                            <Image
                              src={trk.thumbnailUrl}
                              alt={trk.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            {isCurrent && isPlaying && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Disc3 className="w-4 h-4 text-accent animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground">{trk.title}</p>
                            <p className="text-xs text-muted-foreground">{trk.artist}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {trk.category}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Center Controls: Prev, Play/Pause, Next */}
            <div className="flex items-center gap-3 mx-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevTrack}
                      className="h-10 w-10 rounded-full text-foreground hover:bg-muted transition-all active:scale-95"
                      aria-label="Previous Song"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Previous Song</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                size="icon"
                onClick={togglePlayPause}
                className={cn(
                  "h-14 w-14 rounded-full shadow-xl transition-all duration-200",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "hover:scale-105 active:scale-95"
                )}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 ml-0.5 fill-current" />
                )}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNextTrack}
                      className="h-10 w-10 rounded-full text-foreground hover:bg-muted transition-all active:scale-95"
                      aria-label="Next Song"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Next Song</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Right Controls: Play 1 / Loop All + 1.5x VOLUME BOOSTER */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={cyclePlaybackMode}
                      className={cn(
                        "h-9 w-9 rounded-full border-border/60 transition-all",
                        playbackMode !== "play-all" ? "text-accent border-accent/40 bg-accent/10" : "text-muted-foreground"
                      )}
                      aria-label="Playback Mode"
                    >
                      {playbackMode === "play-1" && <Repeat1 className="w-4 h-4 text-accent" />}
                      {playbackMode === "loop-all" && <Repeat className="w-4 h-4 text-accent" />}
                      {playbackMode === "play-all" && <ListMusic className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {playbackMode === "play-1" && "Mode: Play 1 (Repeat One Track)"}
                    {playbackMode === "loop-all" && "Mode: Loop All Playlist"}
                    {playbackMode === "play-all" && "Mode: Play All Playlist Sequentially"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Volume Slider & 1.5x Volume Boost Section */}
              <div className="flex items-center gap-2 pl-2 border-l border-border/60">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className={cn("w-4 h-4", volume > 1.0 ? "text-accent" : "")} />
                  )}
                </Button>

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>Vol</span>
                    <span className={cn("font-bold", volume > 1.0 ? "text-accent" : "")}>
                      {isMuted ? "Muted" : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>
                  {/* Slider ranges from 0 to 1.5 (allowing +150% volume boost via Web Audio GainNode) */}
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1.5}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-20 sm:w-24 cursor-pointer"
                  />
                </div>

                {/* Quick 1.5x Volume Boost Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={volume >= 1.45 ? "default" : "outline"}
                        size="sm"
                        onClick={toggleMaxVolumeBoost}
                        className={cn(
                          "h-8 px-2 rounded-full text-[10px] font-bold tracking-wider transition-all flex items-center gap-1",
                          volume >= 1.45
                            ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/30 animate-pulse"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                        aria-label="1.5x Volume Booster"
                      >
                        <Rocket className="w-3 h-3" />
                        <span>1.5x</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Boost audio volume to 1.5x (150% output power)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isFullscreen || (fullscreenOnMaximize && !isMinimized)) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {playerCard}
      </div>
    );
  }

  return playerCard;
};

export default Music;
