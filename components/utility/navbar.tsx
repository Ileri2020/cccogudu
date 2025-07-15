"use client"
import Link from 'next/link';
import Nav from './nav';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Sidenav from './sidenav';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Suspense } from "react"
import {AiOutlineSearch, AiOutlineHome, AiOutlineShop, AiOutlineMan, AiOutlineContacts} from "react-icons/ai"
import { Advert } from "@/components/myComponents/subs"
import logo from "@/public/logo.png"
import Image from "next/image";

const Navbar = () : JSX.Element => {
  return (
    <div className="w-[100vw] overflow-clip flex flex-col m-0 p-0 relative shadow-md shadow-accent/40">
      <header className="w-[100%] py-4 bg-background sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center h-[50px] overflow-clip">
            <div className="lg:hidden">
              <Sidenav />
            </div>
            <Link href={"/"} className="flex-1 md:flex-none max-h-[43px] md:max-h-[50px] overflow-clip flex justify-center items-center py-5 rounded-full overflow-clip">
                <img src="https://res.cloudinary.com/dc5khnuiu/image/upload/v1752566428/rny8qegs3nn2aslv77z0.jpg" alt="" className="w-[100px] h-auto rounded-full"/>
            </Link>
            
            
            <Button variant={"outline"} className="lg:hidden relative flex justify-center items-center rounded-full w-[35px] h-[35px] overflow-clip text-accent text-xl"><AiOutlineSearch /></Button>

          {/*
          <div className="hidden lg:flex w-[23%] relative flex-row justify-center items-center my-10">
                <Input placeholder="search" className="flex-1 border-0 dark:border-2" />
                <Button className="absolute right-0 h-full rounded-sm text-background text-xl"><AiOutlineSearch /></Button>
            </div>
          */}


            <div className="hidden lg:flex items-center gap-8">

              <Nav/>
              {/*
                <Link to="/contact">
                  <Button className="">Hire me</Button>
                </Link>
              */}
              <ModeToggle />
            </div>
        </div>
        {/* <Advert /> */}
      </header>
    </div>
  )
}

export default Navbar
