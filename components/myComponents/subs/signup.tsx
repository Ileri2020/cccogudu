"use client"
import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
// const AlertDialog = dynamic(() => import('@/components/ui/alert-dialog').then((e) => e.AlertDialog),{ssr: false,})
// const AlertDialogAction = dynamic(() => import('@/components/ui/alert-dialog').then((e) => e.AlertDialogAction),{ssr: false,})
// const AlertDialogCancel = dynamic(() => import('@/components/ui/alert-dialog').then((e) => e.AlertDialogCancel),{ssr: false,})
// const AlertDialogContent = dynamic(() => import('@/components/ui/alert-dialog').then((e) => e.AlertDialogContent),{ssr: false,})
// const AlertDialogDescription = dynamic(() => import('@/components/ui/alert-dialog').then((e) => e.AlertDialogDescription),{ssr: false,})
// const AlertDialogFooter = dynamic(() => import('@/components/ui/alert-dialog').then((e) => e.AlertDialogFooter),{ssr: false,})
// const AlertDialogHeader = dynamic(() => import('@/components/ui/alert-dialog').then((e) => e.AlertDialogHeader),{ssr: false,})
// const AlertDialogTitle = dynamic(() => import('@/components/ui/alert-dialog').then((e) => e.AlertDialogTitle),{ssr: false,})
// const AlertDialogTrigger = dynamic(() => import('@/components/ui/alert-dialog').then((e) => e.AlertDialogTrigger),{ssr: false,})
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { FcGoogle } from 'react-icons/fc'
import { googleSignIn } from './googlesignin'
import { useAppContext } from '@/hooks/useAppContext'
import { useSession } from 'next-auth/react'

interface SignupProps {
  trigger?: React.ReactNode;
  onDrawerOpen?: () => void;
}

const Signup: React.FC<SignupProps> = ({ trigger, onDrawerOpen }) => {
  const { setUser, user } = useAppContext();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    avatarUrl: '',
    department: 'member',
    role: 'user',
    sex: 'male'
  });
  const [editId, setEditId] = useState(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        username: (session.user as any).username || session.user.name || "visitor",
        id: (session.user as any).id || "nil",
        email: session.user.email || "nil",
        avatarUrl: (session.user as any).avatarUrl || session.user.image || "",
        role: (session.user as any).role || "user",
        department: (session.user as any).department || "nil",
        contact: (session.user as any).contact || "xxxx",
      });
      setOpen(false);
    }
  }, [status, session, setUser]);

  useEffect(() => {
    if (user?.id && user.id !== "nil" && user.email !== "nil") setOpen(false);
  }, [user]);

  const form = useRef<HTMLFormElement>(null);

  useEffect(() => () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
  }, []);

  const handleTriggerClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onDrawerOpen) {
      onDrawerOpen();
    }
    setOpen(true);
  };

  const signupTrigger = trigger || <Button variant="outline">Sign up</Button>;
  const triggerWithHandoff = React.isValidElement(signupTrigger)
    ? React.cloneElement(signupTrigger as React.ReactElement<any>, {
        onClick: (event: React.MouseEvent) => {
          (signupTrigger.props as any).onClick?.(event);
          if (!event.defaultPrevented) handleTriggerClick(event);
        },
      })
    : <button type="button" onClick={handleTriggerClick}>Sign up</button>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editId) {
        await axios.put(`/api/dbhandler?model=users&id=${editId}`, formData);
        resetForm();
        setOpen(false);
        return;
      }

      await axios.post('/api/dbhandler?model=users', formData);
      const loginResponse = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      const createdUser = loginResponse.data;
      setUser({
        ...createdUser,
        username: createdUser.username || createdUser.name || formData.name || "visitor",
        avatarUrl: createdUser.avatarUrl || "",
        role: createdUser.role || "user",
        department: createdUser.department || formData.department,
        contact: createdUser.contact || "xxxx",
      });
      resetForm();
      setOpen(false);
    } catch (signupError: any) {
      setError(signupError?.response?.data?.error || "Unable to create your account. Please try again.");
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/dbhandler?model=users&id=${id}`);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      avatarUrl: '',
      department: '',
      role: 'user',
      sex: 'male'
    });
    setEditId(null);
  };

  return (
    <div className='inline'>
      <Drawer
        open={open}
        onOpenChange={setOpen}
      >
        {triggerWithHandoff}
        <DrawerContent className='flex flex-col justify-center items-center py-10 /bg-red-500 max-w-5xl mx-auto'>

          <DrawerHeader>
            <DrawerTitle className='w-full text-center'>Create an account with <span className='text-accent'>CCC Ogudu</span></DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-10 bg-secondary rounded-xl max-w-xl"> 
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department : e.target.value })}
            >
              <option value="member">Member</option>
              <option value="choir">Choir</option>
              <option value="youth">Youth</option>
              <option value="worker">Worker</option>
              <option value="parochial">Parochial</option>
              <option value="elder">Elder</option>
            </select>
            <select
              value={formData.sex}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            
            <DrawerFooter className="flex flex-row w-full gap-2 mt-2">
              {/* <Button>Submit</Button> */}
              <DrawerClose className='flex-1' asChild>
                <Button className='flex-1' variant="outline">Cancel</Button>
              </DrawerClose>
              <Button type="submit" className="flex-1 before:ani-shadow w-full">{editId ? 'Update' : 'Sign up'} &rarr;</Button>
            </DrawerFooter>
          </form>
          {/* <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter> */}
          <div className="w-full my-2">
            <form
              action={googleSignIn}
            >
              <Button
                className=" relative w-full max-w-[300px] mx-auto flex /space-x-2 items-center justify-center text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                type="submit"
              >
                <FcGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                  Google
                </span>
              </Button>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default Signup


