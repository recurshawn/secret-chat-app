'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatProps {
  name: string;
  room: string;
  onExit: () => void;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  type: 'text'; // Future proofing for images
}

export default function Chat({ name, room, onExit }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket and Load History
  useEffect(() => {
    // Load history from LocalStorage
    const storageKey = `chat_history_${room}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }

    // Connect Socket
    // We assume the socket server is on the same origin
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join-room', room);
    });

    socket.on('receive-message', (data: { room: string; message: Message; sender: string }) => {
      // We expect the server to send { room, message, sender }
      // The 'message' property should contain the Message object we created
      const incomingMessage = data.message;
      
      setMessages((prev) => {
        const newMessages = [...prev, incomingMessage];
        // Save to LocalStorage
        localStorage.setItem(storageKey, JSON.stringify(newMessages));
        return newMessages;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [room]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: name,
      text: input.trim(),
      timestamp: Date.now(),
      type: 'text',
    };

    // Emit to server
    // Note: Server implementation in lib/socket-handler.mts uses io.to(room).emit
    // This means the server will broadcast to EVERYONE including the sender.
    // So we don't add it to state here; we wait for 'receive-message'.
    socketRef.current.emit('send-message', {
      room,
      message: newMessage,
      sender: name,
    });

    setInput('');
  };

  const handleSelfDestruct = () => {
    if (confirm('WARNING: This will permanently delete local chat history for this room. Proceed?')) {
      const storageKey = `chat_history_${room}`;
      localStorage.removeItem(storageKey);
      setMessages([]);
      onExit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-[#00FF00] font-mono p-4">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-[#00FF00] pb-4 mb-4">
        <div>
          <h1 className="text-xl">&gt; ROOM: {room}</h1>
          <p className="text-xs opacity-70">USER: {name}</p>
        </div>
        <button
          onClick={handleSelfDestruct}
          className="border border-red-500 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-black transition-colors text-sm uppercase"
        >
          [ Self-Destruct ]
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#00FF00] scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="text-center opacity-30 mt-20">
            &lt; NO TRANSMISSIONS DETECTED &gt;
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === name ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[80%] border ${msg.sender === name ? 'border-[#00FF00]' : 'border-gray-600 text-gray-300'} p-3`}>
              <div className="flex justify-between items-baseline mb-1 gap-4">
                <span className="text-xs font-bold uppercase">{msg.sender}</span>
                <span className="text-[10px] opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <span className="py-3 pl-2">&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter encrypted message..."
          className="flex-1 bg-black border border-[#00FF00] p-3 focus:outline-none focus:ring-1 focus:ring-[#00FF00] text-[#00FF00] placeholder-gray-700"
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-[#00FF00] text-black font-bold px-6 hover:bg-[#00CC00] disabled:opacity-50 disabled:hover:bg-[#00FF00]"
        >
          SEND
        </button>
      </form>
    </div>
  );
}
