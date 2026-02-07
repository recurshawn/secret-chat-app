'use client';

import { useState } from 'react';
import Entrance from './Entrance';
import Chat from './Chat';

export default function Home() {
  const [session, setSession] = useState<{ name: string; room: string } | null>(null);

  if (!session) {
    return (
      <Entrance 
        onJoin={(data) => {
          console.log('Joining session:', data);
          setSession(data);
        }} 
      />
    );
  }

  return (
    <Chat 
      name={session.name} 
      room={session.room} 
      onExit={() => setSession(null)} 
    />
  );
}