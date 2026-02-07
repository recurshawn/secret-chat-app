# Specification: Terminal Chat MVP

## Overview
This track implements the core functionality of a "secret" terminal-themed chat application. It allows users to join rooms using a code, chat in real-time via WebSockets, and persist history locally.

## Functional Requirements
- **Entrance Screen:**
    - Input for Display Name (ephemeral).
    - Input for Room Code.
    - "Join Mission" button.
- **Chat Screen:**
    - Real-time messaging using Socket.io.
    - Support for Text, URLs (rendered as links), and Images (URL-based or uploaded).
    - Room history persisted in LocalStorage.
    - "Self-Destruct" button to clear local history.
    - Mobile-friendly responsive layout.
- **Socket Backend:**
    - Basic socket server to handle room joining and message broadcasting.

## Non-Functional Requirements
- **Theme:** Retro Terminal (Green on Black).
- **Responsiveness:** Must work seamlessly on mobile and desktop.
- **Privacy:** No server-side storage of messages.
