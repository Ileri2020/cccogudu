
'use client';
// @ts-nocheck


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
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useAppContext } from '@/hooks/useAppContext';
import { Label } from '@/components/ui/label';
import axios from 'axios';


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
  const [meetings, setMeetings] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`/api/dbhandler?model=meetings`);
      if (response.status === 200) {
        setMeetings(response.data)
      }
    } catch (error) {
      console.error(error);
    }
  };

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
    fetchMeetings()
    return () => {
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  return (
    <RoomContext.Provider value={roomInstance}>
      <div>
        {
          (meetings.length < 1) ? <div>no scheduled service or meeting</div> :  <div>
            {meetings.map((meeting, index)=>{
              return <div>
                <div>{meeting.roomName}</div>
                <div>{meeting.description}</div>
                <div>
                  {!meeting.password ? (
                    <div>🔓</div> // Open padlock emoji/icon
                  ) : (
                    <div>🔒</div> // Locked padlock emoji/icon for meetings with password
                  )}
                </div>
              </div>
            })}
          </div>
        }
      </div>
      <div>
        {/* <form onSubmit={handleSubmit} className='flex flex-col gap-2 p-2 m-2 bg-secondary w-[300px] rounded-lg'>
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
        </form> */}
        <Schedule />
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






const Schedule = () => {
  const { user } = useAppContext();
  const [room, setRoom] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [save, setSave] = useState('false');
  const [roomPassword, setRoomPassword] = useState('');
  const [description, setDescription] = useState('');

  // if(user.username === "visitor" && user.email === "nil"){
  //   alert("Login to react schedule a service")
  //   return
  // }
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const meetingData = {
        roomName: room,
        roomId: `room-${Date.now()}`,
        dateTime: dateTime.toISOString(),
        adminId: user.id,
        save,
        description,
        ...(roomPassword ? { roomPassword } : {}), // Include roomPassword only if not empty
      };
      
      // if (editId) {
    //   await axios.put(`/api/dbhandler?model=users&id=${editId}`, formData);
    // } else 
      const response = await axios.post('/api/token', meetingData);
      console.log('Meeting scheduled:', response.data);
      resetForm();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };
  

  // const handleEdit = (item) => {
  //   setFormData(item);
  //   setEditId(item.id);
  // };

  const resetForm = () => {
    setRoom('')
    setDateTime(new Date())
    setRoomPassword('')
    setSave('false')
    setDescription('')
    // setEditId(null);
  };

  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Schedule Meeting</Button>
        </DrawerTrigger>
        <DrawerContent className='flex flex-col justify-center items-center py-10 /bg-red-500 max-w-5xl mx-auto'>

          <DrawerHeader>
            <DrawerTitle className='w-full text-center'>Schedule a meeting or service</DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="text- flex flex-col gap-4 p-10 bg-secondary rounded-xl max-w-xl">
            <Label>Meeting Name</Label>
            <Input
              type="text"
              placeholder="Room"
              value={room || ''}
              onChange={(e) => setRoom(e.target.value)}
            />
            <Label>Meeting Date & Time</Label>
            <Input
              type="datetime-local"
              placeholder="Room"
              value={dateTime.toISOString().slice(0, 16)}
              onChange={(e) => setDateTime(new Date(e.target.value))}
            />
            <Label>Meeting Description</Label>
            <Input
              type="text"
              placeholder="Meeting Description"
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Label>Meeting Password <span className='text-xs text-secondary-foreground/50'>(only for private meetings)</span></Label>
            <Input
              type="password"
              placeholder="Room Password"
              value={roomPassword || ''}
              onChange={(e) => setRoomPassword(e.target.value)}
            />
            <Label>Save Meeting<span className='text-xs text-secondary-foreground/50'>(save meeting stream as service)</span></Label>
            <select
              value={save}
              onChange={(e) => setSave(e.target.value)}
            >
              <option value="false">False</option>
              <option value="true">True</option>
            </select>
            
            <DrawerFooter className="flex flex-row w-full gap-2 mt-2">
              {/* <Button>Submit</Button> */}
              <DrawerClose className='flex-1' asChild>
                <Button className='flex-1' variant="outline">Cancel</Button>
              </DrawerClose>
              <Button type="submit" className="flex-1 before:ani-shadow w-full">Create &rarr;</Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
