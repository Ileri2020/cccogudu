import {CgProfile} from "react-icons/cg"
import { FaBible, FaChurch, FaPhone, FaPray } from "react-icons/fa"
import {RiChatSmile2Line} from "react-icons/ri"
import {BsChatLeftQuote} from "react-icons/bs"

export default {Links : [
    {
      name: "home",
      path: "/", //with landing page that transitions the word of God
      icon: FaChurch,
    },
    {
      name: "about",
      path: "/about",
      icon: BsChatLeftQuote,
    },
    {
      name: "blog", //blog posts and gallery
      path: "/blog",
      icon: RiChatSmile2Line,
    },
    {
      name: "preaching", //audio, video
      path: "/preach/default",
      icon: FaBible,
    },
    {
      name: "prayergrp", //scheduled prayer meeting
      path: "/pray",
      icon: FaPray,
    },
    // {
    //   name: "projects",
    //   path: "/projects",
    // },
    // {
    //   name: "updates",
    //   path: "/updates",
    // },
    {
      name: "contact", //and support
      path: "/contact",
      icon: FaPhone,
    },
    {
      name: "account",
      path: "/account",
      icon: CgProfile,
    },
  ]
}