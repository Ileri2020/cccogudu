// @ts-nocheck

'use client';

import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


export default function Pray() {
  const [roomInstance] = useState(() => new Room({
    // Optimize video quality for each participant's screen
    adaptiveStream: true,
    // Enable automatic audio/video quality optimization
    dynacast: true,
  }));
  const [token, setToken] = useState('');
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const fetchtoken = async () => {
    try {
      const resp = await fetch(`/api/token?room=${room}&username=${name}`);
      const data = await resp.json();
      console.log('data', `${data.token}`)
      if (data.token) {
        await roomInstance.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, `${data.token}`);
        setIsConnected(true);
      }
      setToken(`${data.token}`)
      console.log('room instance generated token variable set');
    } catch (e) {
      console.log('error generating token', e);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchtoken();
  }

  useEffect(() => {
    return () => {
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  return (
    <RoomContext.Provider value={roomInstance}>
      <div>
        <div>buttons to schedule prayer meeting, public or private with selected accounts</div>
        <div>prayer schedules for accounts holders on the platform</div>
      </div>
      <div>
        <form onSubmit={handleSubmit} className='flex flex-col gap-2 p-2 m-2 bg-secondary w-[300px] rounded-lg'>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <Input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Room"
          />
          <Button type="submit">Join Room</Button>
        </form>
      </div>
      {((token === '')&& !isConnected) ? (
        <div>Please join a room</div>
      ) : (
        <div className='w-full flex justify-center items-center mx-auto'>
          <div data-lk-theme="default" className='h-[50vh] max-w-3xl bg-secondary rounded-lg flex flex-col overflow-clip m-2'>
            {/* Your custom component with basic video conferencing functionality. */}
            <MyVideoConference />
            {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
            <RoomAudioRenderer />
            {/* Controls for the user to start/stop audio, video, and screen share tracks */}
            <ControlBar />
          </div>
        </div>
      )}
    </RoomContext.Provider>
  );
}





function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <div><ParticipantTile /></div>
    </GridLayout>
  );
}
