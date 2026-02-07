'use client';

import React, { useState } from 'react';

interface EntranceProps {
  onJoin: (data: { name: string; room: string }) => void;
  initialRoom?: string;
}

export default function Entrance({ onJoin, initialRoom = '' }: EntranceProps) {
  const [name, setName] = useState('');
  const [room, setRoom] = useState(initialRoom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && room) {
      onJoin({ name, room });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#00FF00] font-mono p-4">
      <div className="w-full max-w-md border border-[#00FF00] p-6 shadow-[0_0_15px_rgba(0,255,0,0.3)]">
        <h1 className="text-2xl mb-8 text-center animate-pulse">
          &gt; SECURE TERMINAL ACCESS
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label htmlFor="display-name" className="text-sm">
              [SYSTEM] ENTER DISPLAY NAME:
            </label>
            <input
              id="display-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border border-[#00FF00] p-2 focus:outline-none focus:ring-1 focus:ring-[#00FF00] text-[#00FF00]"
              required
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="room-code" className="text-sm">
              [SYSTEM] ENTER ROOM CODE:
            </label>
            <input
              id="room-code"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className={`bg-black border border-[#00FF00] p-2 focus:outline-none focus:ring-1 focus:ring-[#00FF00] text-[#00FF00] ${initialRoom ? 'opacity-50 cursor-not-allowed' : ''}`}
              required
              autoComplete="off"
              readOnly={!!initialRoom}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#00FF00] text-black font-bold py-3 hover:bg-[#00CC00] transition-colors uppercase tracking-widest mt-4"
          >
            Join Mission
          </button>
        </form>

        <div className="mt-8 text-[10px] opacity-50 text-center">
          WARNING: ALL COMMUNICATIONS ARE ENCRYPTED AND EPHEMERAL.
          <br />
          LOCAL HISTORY DESTRUCTION ENABLED.
        </div>
      </div>
    </div>
  );
}
