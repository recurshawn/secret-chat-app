'use client';

import { useState } from 'react';
import Entrance from './Entrance';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#00FF00] font-mono p-4">
      <div className="w-full max-w-2xl border border-[#00FF00] p-6">
        <h1 className="text-xl mb-4 border-b border-[#00FF00] pb-2">
          &gt; SECURE CHANNEL: {session.room}
        </h1>
        <p>[SYSTEM] LOGGED IN AS: {session.name}</p>
        <p className="mt-8 animate-pulse text-sm">
          &gt; CHAT INTERFACE INITIALIZING... (PHASE 3)
        </p>
      </div>
    </div>
  );
}