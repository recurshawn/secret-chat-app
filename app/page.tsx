'use client';

import { useRouter } from 'next/navigation';
import Entrance from './Entrance';

export default function Home() {
  const router = useRouter();

  return (
    <Entrance 
      onJoin={(data) => {
        console.log('Redirecting to room:', data);
        router.push(`/room/${encodeURIComponent(data.room)}?name=${encodeURIComponent(data.name)}`);
      }} 
    />
  );
}