'use client';

import { useState, use, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Entrance from '../../Entrance';
import Chat from '../../Chat';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = decodeURIComponent(resolvedParams.id);
  
  const searchParams = useSearchParams();
  const initialName = searchParams.get('name');
  
  // Initialize session if name is present in URL
  const [session, setSession] = useState<{ name: string; room: string } | null>(
    initialName ? { name: initialName, room: roomId } : null
  );

  // Clear name from URL after mounting to hide it (optional polish)
  const router = useRouter();
  useEffect(() => {
    if (initialName) {
      // Replace URL without the name param
      const newUrl = `/room/${encodeURIComponent(roomId)}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [initialName, roomId]);

  if (!session) {
    return (
      <Entrance 
        initialRoom={roomId}
        onJoin={(data) => {
          setSession(data);
        }} 
      />
    );
  }

  return (
    <Chat 
      name={session.name} 
      room={session.room} 
      onExit={() => {
        setSession(null);
        router.push('/');
      }} 
    />
  );
}
