import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chat from '../Chat';

// Mock socket.io-client
const socketMock = {
  emit: vi.fn(),
  on: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => socketMock),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Chat Component', () => {
  const defaultProps = {
    name: 'TestUser',
    room: 'TestRoom',
    onExit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage mock store
    localStorageMock.clear();
    
    // Mock window.confirm for self-destruct test
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders chat interface with room and user name', () => {
    render(<Chat {...defaultProps} />);
    expect(screen.getByText(/> ROOM: TestRoom/i)).toBeInTheDocument();
    expect(screen.getByText(/USER: TestUser/i)).toBeInTheDocument();
  });

  it('joins the room on mount', () => {
    render(<Chat {...defaultProps} />);
    // The component connects via io() then listens for 'connect'.
    // In our mock, we don't simulate 'connect' event automatically unless we manually trigger the callback passed to 'on'.
    // However, we can check if io() was called.
    expect(socketMock.on).toHaveBeenCalledWith('connect', expect.any(Function));
    
    // Simulate connection
    const connectCallback = socketMock.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    connectCallback?.();

    expect(socketMock.emit).toHaveBeenCalledWith('join-room', 'TestRoom');
  });

  it('sends a message when form is submitted', () => {
    render(<Chat {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/Enter encrypted message/i);
    const sendButton = screen.getByText('SEND');

    fireEvent.change(input, { target: { value: 'Hello World' } });
    fireEvent.click(sendButton);

    expect(socketMock.emit).toHaveBeenCalledWith('send-message', expect.objectContaining({
      room: 'TestRoom',
      sender: 'TestUser',
      message: expect.objectContaining({
        text: 'Hello World',
        sender: 'TestUser'
      })
    }));
  });

  it('calls onExit when self-destruct is clicked and confirmed', () => {
    render(<Chat {...defaultProps} />);
    
    const destructButton = screen.getByText('[ Self-Destruct ]');
    fireEvent.click(destructButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(defaultProps.onExit).toHaveBeenCalled();
  });
});
