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

export default function Pray() {
  // TODO: get user input for room and name
  const room = 'quickstart-room';
  const name = 'quickstart-user';
  const [roomInstance] = useState(() => new Room({
    // Optimize video quality for each participant's screen
    adaptiveStream: true,
    // Enable automatic audio/video quality optimization
    dynacast: true,
  }));
  const [token, setToken] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch(`/api/token?room=${room}&username=${name}`);
        const data = await resp.json();
        console.log('data', `${data.token}`)
        if (!mounted) return;
        if (data.token) {
          await roomInstance.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, `${data.token}`);
        }
        setToken(`${data.token}`)
        console.log('room instance generated token variable set');
      } catch (e) {
        //console.error(e);
        console.log('error generating token', e);
      }
    })();
  
    return () => {
      mounted = false;
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  return (
    <RoomContext.Provider value={roomInstance}>
      <div>
        <div>buttons to schedule prayer meeting, public or private with selected accounts</div>
        <div>prayer schedules for accounts holders on the platform</div>
      </div>
      {
        (token === '') ?
      <div>Getting schedule token...</div>
      :
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
      }
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
