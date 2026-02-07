# Implementation Plan: Terminal Chat MVP

## Phase 1: Infrastructure & Socket Setup [checkpoint: 580f8e4]
- [x] Task: Set up Socket.io server and client integration. fd6e850
    - [x] Install dependencies (`socket.io`, `socket.io-client`).
    - [x] Create a basic custom server or API route for socket handling.
- [x] Task: Conductor - User Manual Verification 'Infrastructure & Socket Setup' (Protocol in workflow.md)

## Phase 2: Entrance & UI Layout [checkpoint: 91d2176]
- [x] Task: Implement the "Entrance" screen with Terminal theme. 47c5d33
    - [x] Create UI for name and room code input.
    - [x] Implement responsive layout using Tailwind CSS.
- [x] Task: Conductor - User Manual Verification 'Entrance & UI Layout' (Protocol in workflow.md)

## Phase 3: Chat Logic & Persistence
- [ ] Task: Implement real-time room communication.
    - [ ] Handle room joining and message broadcasting on the socket.
    - [ ] Implement message display for text, URLs, and images.
- [ ] Task: Implement LocalStorage persistence and Self-Destruct.
    - [ ] Save messages to LocalStorage on receive.
    - [ ] Add "Self-Destruct" button to clear LocalStorage and current chat view.
- [ ] Task: Conductor - User Manual Verification 'Chat Logic & Persistence' (Protocol in workflow.md)
