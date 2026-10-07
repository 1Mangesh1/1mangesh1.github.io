---
title: "Real-time ChatApp"
description: "Node.js and Socket.io chat with a shared room, private messages and typing indicators."
tech:
  [
    "Node.js",
    "Express",
    "Socket.io",
    "WebSockets",
    "JavaScript",
    "Real-time Communication",
  ]
github: "https://github.com/1Mangesh1/chat-app"
demo: ""
featured: false
date: 2024-07-10T00:00:00Z
status: "archived"
---

**What it does.** A real-time chat app on Node.js, Express and Socket.io. Everyone who joins with a name and a username shares one chat room. Private messages go to one user by username, and the server sends back an error if that user is offline or is you. Clients see typing indicators, join and leave notices, and a live list of online users; clicking a name fills in the private-message recipient.

**How it's built.** `server.js` serves the plain HTML and JavaScript client in `public/` through Express and handles the Socket.io events (`join`, `chatMessage`, `privateMessage`, `typing`, `stoppedTyping`, `disconnect`). Connected users live in an in-memory object keyed by socket ID, and messages are not stored. The [Terraform setup](/portfolio/chatapp-infrastructure/) runs it on a single EC2 instance.
