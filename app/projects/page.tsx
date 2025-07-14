"use client"
import { useAppContext } from '@/hooks/useAppContext';
import React from 'react'

const page = () => {
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();
  return (
    <div>
      Projects
    </div>
  )
}

export default page
