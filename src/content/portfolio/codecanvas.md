---
title: "CodeCanvas - Collaborative Code Editor"
description: "A real-time collaborative code editor with syntax highlighting, multi-cursor support, and integrated terminal"
image: "/images/portfolio/codecanvas.jpg"
tech: ["TypeScript", "CRDT", "WebSocket", "Monaco Editor", "Express", "Docker"]
github: "https://github.com/1Mangesh1/codecanvas"
demo: "https://codecanvas.mangeshbide.tech"
featured: true
date: 2026-01-10T00:00:00Z
---

## Motivation

Pair programming over screen-share is painful — laggy, one-person-drives, and you can't independently explore the codebase. Existing collaborative editors either lack real code editor features (syntax highlighting, IntelliSense, terminal) or are locked behind enterprise paywalls. CodeCanvas is a free, open-source alternative that brings the full VS Code editing experience to collaborative coding sessions.

## Architecture

CodeCanvas is built around three pillars: real-time document synchronization, a full-featured code editor, and sandboxed code execution.

**CRDT-Based Sync Engine** — The core of CodeCanvas is a Yjs-based CRDT (Conflict-free Replicated Data Type) implementation that handles concurrent edits without a central authority. Each participant maintains a local replica of the document, and changes are synchronized peer-to-peer via a WebSocket relay server. The CRDT guarantees eventual consistency — no matter the order operations arrive, all participants converge to the same document state.

**Monaco Editor Frontend** — The UI is built on Monaco Editor, the same engine that powers VS Code. This gives CodeCanvas syntax highlighting for 50+ languages, IntelliSense-like autocomplete, code folding, minimap, multi-cursor editing, and keyboard shortcuts that developers already know. The Yjs-Monaco binding translates CRDT operations into Monaco editor operations seamlessly.

**Execution Environment** — Each coding session gets an isolated Docker container with a pre-configured development environment. Users can open an integrated terminal (via xterm.js) that connects to their container over WebSocket. This enables running code, installing packages, and testing — all within the browser.

## Conflict Resolution

The key challenge in collaborative editing is conflict resolution when two users edit the same region simultaneously. Traditional OT (Operational Transformation) approaches are complex and require a central server to determine operation ordering. CRDTs sidestep this entirely.

CodeCanvas uses Yjs's `Y.Text` type, which represents the document as a sequence of items with unique IDs. When two users insert text at the same position, the CRDT's ordering algorithm deterministically resolves the conflict based on the items' unique identifiers — no server arbitration needed.

In practice, this means:
- **No lost edits**: Every keystroke from every participant is preserved
- **Instant local feedback**: Edits appear immediately without waiting for server confirmation
- **Offline support**: Users can edit while disconnected and changes merge cleanly when they reconnect

## Key Features

- **Real-Time Collaboration**: See other participants' cursors, selections, and edits in real-time with sub-100ms latency
- **Multi-Cursor Awareness**: Each collaborator has a uniquely colored cursor with their name label
- **Integrated Terminal**: Full terminal access to a sandboxed Docker environment per session
- **Language Support**: Syntax highlighting and basic IntelliSense for TypeScript, JavaScript, Python, Go, Rust, and more
- **Session Management**: Create rooms with shareable links, set read-only permissions, and cap participant count
- **Chat Sidebar**: A built-in chat panel for discussion without leaving the editor
- **Version Snapshots**: Manual and auto-save snapshots that any participant can restore

## Technical Challenges

**WebSocket Scaling** — Each active session maintains WebSocket connections for document sync, terminal I/O, and awareness (cursor positions). At 50+ concurrent sessions, a single server runs into file descriptor limits. The solution was a Redis-backed WebSocket relay that distributes sessions across multiple server instances, with Redis pub/sub routing messages to the correct instance.

**Container Resource Management** — Giving every session a Docker container is resource-intensive. CodeCanvas uses a container pool with pre-warmed instances, lazy allocation (containers only spin up when a user opens the terminal), and aggressive idle timeouts (containers are paused after 10 minutes of inactivity and resumed on the next terminal interaction).

**Monaco + Yjs Integration** — Binding Yjs documents to Monaco's model required careful handling of undo/redo stacking (each user gets their own undo history), selection awareness decoration, and preventing echo loops where a remote change triggers a local change event.
