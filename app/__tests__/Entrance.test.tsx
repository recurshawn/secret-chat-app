import { render, screen, fireEvent } from '@testing-library/react';
import Entrance from '../Entrance';
import { describe, it, expect, vi } from 'vitest';

describe('Entrance Component', () => {
  it('renders display name and room code inputs', () => {
    render(<Entrance onJoin={() => {}} />);
    
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/room code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join mission/i })).toBeInTheDocument();
  });

  it('calls onJoin with input values when button is clicked', () => {
    const mockOnJoin = vi.fn();
    render(<Entrance onJoin={mockOnJoin} />);
    
    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'Agent Smith' } });
    fireEvent.change(screen.getByLabelText(/room code/i), { target: { value: 'SECRET123' } });
    fireEvent.click(screen.getByRole('button', { name: /join mission/i }));
    
    expect(mockOnJoin).toHaveBeenCalledWith({ name: 'Agent Smith', room: 'SECRET123' });
  });
});
