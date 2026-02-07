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

## Phase 3: Chat Logic & Persistence [checkpoint: f541485]
- [x] Task: Implement real-time room communication.
    - [x] Handle room joining and message broadcasting on the socket.
    - [x] Implement message display for text, URLs, and images.
- [x] Task: Implement LocalStorage persistence and Self-Destruct.
    - [x] Save messages to LocalStorage on receive.
    - [x] Add "Self-Destruct" button to clear LocalStorage and current chat view.
- [x] Task: Conductor - User Manual Verification 'Chat Logic & Persistence' (Protocol in workflow.md)
