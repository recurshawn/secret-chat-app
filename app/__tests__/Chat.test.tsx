import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    localStorageMock.clear();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders chat interface with room and user name', () => {
    render(<Chat {...defaultProps} />);
    expect(screen.getByText(/> ROOM: TestRoom/i)).toBeInTheDocument();
    expect(screen.getByText(/USER: TestUser/i)).toBeInTheDocument();
  });

  it('joins the room on mount', () => {
    render(<Chat {...defaultProps} />);
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
        sender: 'TestUser',
        type: 'text'
      })
    }));
  });

  it('renders URLs as links', async () => {
    render(<Chat {...defaultProps} />);
    
    const receiveCallback = socketMock.on.mock.calls.find(call => call[0] === 'receive-message')?.[1];
    
    const message = {
      id: '123',
      sender: 'OtherUser',
      text: 'Check this https://example.com link',
      timestamp: Date.now(),
      type: 'text'
    };

    if (receiveCallback) {
        // Wrap in act implicitly by waiting for effect
        receiveCallback({ room: 'TestRoom', message, sender: 'OtherUser' });
    }

    await waitFor(() => {
        expect(screen.getByText(/Check this/i)).toBeInTheDocument();
    });
    
    const link = screen.getByRole('link', { name: /https:\/\/example.com/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('handles image upload', async () => {
    const { container } = render(<Chat {...defaultProps} />);
    
    // Find the hidden file input
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    
    const file = new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' });

    // Mock FileReader as a class
    const mockFileReaderInstance = {
      readAsDataURL: vi.fn(),
      onload: null as ((ev: any) => any) | null,
      result: 'data:image/png;base64,fakebase64string'
    };

    class MockFileReader {
      readAsDataURL = mockFileReaderInstance.readAsDataURL;
      onload = mockFileReaderInstance.onload;
      result = mockFileReaderInstance.result;
      
      constructor() {
          // When the component assigns onload, we need to capture it.
          // Since we can't easily capture the assignment to 'this.onload' from the component 
          // back to our test scope unless we proxy it.
          
          return new Proxy(this, {
              set: (target, prop, value) => {
                  if (prop === 'onload') {
                      mockFileReaderInstance.onload = value;
                  }
                  // @ts-ignore
                  target[prop] = value;
                  return true;
              },
              get: (target, prop) => {
                  if (prop === 'result') return mockFileReaderInstance.result;
                  // @ts-ignore
                  return target[prop];
              }
          });
      }
    }

    const originalFileReader = window.FileReader;
    window.FileReader = MockFileReader as any;

    if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [file] } });
    }
    
    expect(mockFileReaderInstance.readAsDataURL).toHaveBeenCalledWith(file);
    
    // Manually trigger onload
    // We need to wait a tick for the assignment to happen in the component
    await waitFor(() => {
        if (mockFileReaderInstance.onload) {
            mockFileReaderInstance.onload({ target: { result: mockFileReaderInstance.result } });
        }
    });

    await waitFor(() => {
        expect(socketMock.emit).toHaveBeenCalledWith('send-message', expect.objectContaining({
            room: 'TestRoom',
            message: expect.objectContaining({
                type: 'image',
                imageUrl: 'data:image/png;base64,fakebase64string'
            })
        }));
    });

    // Cleanup
    window.FileReader = originalFileReader;
  });
});
