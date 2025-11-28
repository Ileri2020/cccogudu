"use client";

import Link from "next/link";
import Nav from "./nav";
import { Button } from "@/components/ui/button";
import Sidenav from "./sidenav";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { AiOutlineSearch } from "react-icons/ai";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Post = {
  id: string;
  title: string;
  for?: string;
};

const Navbar = (): JSX.Element => {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch posts from backend
  const fetchPosts = async (search: string) => {
    if (search.length < 3) {
      setPosts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/dbhandler?model=posts&search=${encodeURIComponent(search)}`
      );
      setPosts(res.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!isFocused) return;
    const timeout = setTimeout(() => {
      fetchPosts(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, isFocused]);

  return (
    <TooltipProvider>
      <div className="sticky top-0 z-30 w-[100vw] overflow-clip flex flex-col m-0 p-0 shadow-md shadow-accent/40">
        <header className="w-[100%] py-4 bg-background sticky top-0 z-10">
          <div className="container mx-auto flex justify-between items-center h-[50px] overflow-clip relative">

            <div className="lg:hidden">
              <Sidenav />
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  className="h-[50px] w-[50px] flex justify-center items-center rounded-full overflow-clip bg-red-500"
                >
                  <img
                    src="https://res.cloudinary.com/dc5khnuiu/image/upload/v1752566428/rny8qegs3nn2aslv77z0.jpg"
                    alt="Home"
                    className="h-[50px] w-[50px]"
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to Home</p>
              </TooltipContent>
            </Tooltip>

            {/* Floating Search Input Dropdown */}
            <DropdownMenu open={isFocused} onOpenChange={setIsFocused}>
              
                <div className="relative w-[300px] lg:flex">
                  <Input
                    placeholder="Search posts..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="flex-1 border-0 dark:border-2 bg-accent/10"
                  />
                  <DropdownMenuTrigger asChild>
                    <Button className="absolute right-0 h-full rounded-sm text-background text-xl">
                      <AiOutlineSearch />
                    </Button>
                  </DropdownMenuTrigger>
                </div>
              

              {posts.length > 0 && (
                <DropdownMenuContent
                  ref={dropdownRef}
                  className="absolute left-0 top-[calc(100%+5px)] w-full sm:w-[400px] max-h-[400px] overflow-auto shadow-lg bg-background z-50 rounded-md"
                >
                  <Table className="w-full text-sm sm:text-base">
                    <TableBody>
                      {posts.map((post) => {
                        const postUrl = `${process.env.NEXT_PUBLIC_ORIGIN_URL}/blog/${post.id}?page=${post.for || "default"}`;
                        return (
                          <TableRow key={post.id}>
                            <TableCell className="truncate max-w-[400px] sm:max-w-none">
                              <Link
                                href={postUrl}
                                className="underline text-blue-600 hover:text-blue-800 truncate"
                              >
                                {post.title}
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </DropdownMenuContent>
              )}
            </DropdownMenu>

            <div className="hidden lg:flex items-center gap-8">
              <Nav />
              <ModeToggle />
            </div>

          </div>
        </header>
      </div>
    </TooltipProvider>
  );
};

export default Navbar;
