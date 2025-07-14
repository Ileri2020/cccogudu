"use client"
import { useAppContext } from '@/hooks/useAppContext';
import React from 'react'

const Updates = () => {
  const { selectedVideo, setSelectedVideo, useMock } = useAppContext();
  return (
    <div>
      Post of event calendar/date and upcoming events
    </div>
  )
}

export default Updates
