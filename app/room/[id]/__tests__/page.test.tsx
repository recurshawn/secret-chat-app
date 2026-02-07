import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoomPage from '../page';

// Mock React's use hook
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    use: (promise: Promise<any>) => {
      // We can't synchronously unwrap a promise here unless we cheat.
      // But for testing purposes, if we pass a special object or just assume the promise 
      // holds the value we want.
      // Let's rely on a helper or just return the known test value since we control the test.
      return { id: 'secret-room' };
    },
  };
});

// Mock Next.js navigation hooks
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

// Mock Chat and Entrance components to simplify testing
vi.mock('../../../Chat', () => ({
  default: ({ name, room, onExit }: any) => (
    <div data-testid="chat-mock">
      Chat: {name} in {room}
      <button onClick={onExit}>Exit</button>
    </div>
  ),
}));

vi.mock('../../../Entrance', () => ({
  default: ({ initialRoom, onJoin }: any) => (
    <div data-testid="entrance-mock">
      Entrance: Room {initialRoom}
      <button onClick={() => onJoin({ name: 'NewUser', room: initialRoom || 'NewRoom' })}>
        Join
      </button>
    </div>
  ),
}));

describe('Room Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    mockSearchParams.delete('name');
  });

  it('renders Entrance with pre-filled room when no name provided', async () => {
    const params = Promise.resolve({ id: 'secret-room' });
    
    render(<RoomPage params={params} />);
    
    // We don't need async findBy anymore since 'use' returns immediately
    expect(screen.getByTestId('entrance-mock')).toBeInTheDocument();
    expect(screen.getByText('Entrance: Room secret-room')).toBeInTheDocument();
  });

  it('renders Chat immediately when name is provided in query params', async () => {
    const params = Promise.resolve({ id: 'secret-room' });
    mockSearchParams.set('name', 'Agent007');
    
    render(<RoomPage params={params} />);
    
    expect(screen.getByTestId('chat-mock')).toBeInTheDocument();
    expect(screen.getByText('Chat: Agent007 in secret-room')).toBeInTheDocument();
  });

  it('clears name from URL after mounting', async () => {
    const params = Promise.resolve({ id: 'secret-room' });
    mockSearchParams.set('name', 'Agent007');
    
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    render(<RoomPage params={params} />);
    
    await waitFor(() => {
        expect(replaceStateSpy).toHaveBeenCalledWith({}, '', '/room/secret-room');
    });
  });
});
