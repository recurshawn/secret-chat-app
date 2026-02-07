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
  text?: string;
  imageUrl?: string;
  timestamp: number;
  type: 'text' | 'image';
}

export default function Chat({ name, room, onExit }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    socketRef.current.emit('send-message', {
      room,
      message: newMessage,
      sender: name,
    });

    setInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socketRef.current) return;

    // Limit file size (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Limit is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const newMessage: Message = {
        id: crypto.randomUUID(),
        sender: name,
        imageUrl: base64,
        timestamp: Date.now(),
        type: 'image',
      };

      socketRef.current?.emit('send-message', {
        room,
        message: newMessage,
        sender: name,
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelfDestruct = () => {
    if (confirm('WARNING: This will permanently delete local chat history for this room. Proceed?')) {
      const storageKey = `chat_history_${room}`;
      localStorage.removeItem(storageKey);
      setMessages([]);
      onExit();
    }
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'image' && msg.imageUrl) {
      return (
        <img 
          src={msg.imageUrl} 
          alt="Transmitted Data" 
          className="max-w-full h-auto border border-[#00FF00] opacity-80 hover:opacity-100 transition-opacity" 
        />
      );
    }

    if (msg.text) {
      // Basic URL regex
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = msg.text.split(urlRegex);

      return (
        <p className="whitespace-pre-wrap break-words">
          {parts.map((part, i) => 
            urlRegex.test(part) ? (
              <a 
                key={i} 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline text-[#00AA00] hover:text-[#00FF00]"
              >
                {part}
              </a>
            ) : (
              part
            )
          )}
        </p>
      );
    }

    return null;
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
              {renderMessageContent(msg)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2 items-center">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="border border-[#00FF00] px-3 py-3 hover:bg-[#003300] text-sm"
          title="Upload Image"
        >
          IMG
        </button>

        <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
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
    </div>
  );
}