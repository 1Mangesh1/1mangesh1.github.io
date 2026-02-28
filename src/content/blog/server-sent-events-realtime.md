---
title: "Building Real-Time Features with Server-Sent Events"
description: "Why SSE might be all you need for real-time features instead of WebSockets"
pubDate: 2026-01-20T00:00:00Z
tags: ["sse", "real-time", "web-apis", "javascript", "node"]
draft: true
---

Every time someone says "real-time," the knee-jerk reaction is WebSockets. But here's the thing — for a huge number of use cases, **Server-Sent Events (SSE)** are simpler, lighter, and perfectly sufficient. Let's break down when SSE shines, how it compares to the alternatives, and build a complete live notification system from scratch.

## The Real-Time Spectrum

Before reaching for any technology, understand the three common approaches:

| Approach | Direction | Complexity | Use Case |
|----------|-----------|------------|----------|
| **Polling** | Client → Server | Low | Dashboards with tolerance for delay |
| **SSE** | Server → Client | Medium | Live feeds, notifications, progress |
| **WebSockets** | Bidirectional | High | Chat, gaming, collaborative editing |

**Polling** hammers your server with repeated requests. **WebSockets** give you full-duplex communication but add protocol complexity, connection management, and load balancer headaches. **SSE** sits in the sweet spot — the server pushes data to the client over a plain HTTP connection. No special protocol, no upgrade handshake, no library needed on the client.

## How SSE Works Under the Hood

SSE uses a standard HTTP response with `Content-Type: text/event-stream`. The server keeps the connection open and writes events in a simple text format:

```
data: {"type": "notification", "message": "New comment on your post"}

event: heartbeat
data: ping

id: 42
event: notification
data: {"user": "alice", "action": "liked your photo"}
retry: 5000
```

Each event can have:
- **`data:`** — the payload (can span multiple lines)
- **`event:`** — a named event type (defaults to `"message"`)
- **`id:`** — an event ID for reconnection tracking
- **`retry:`** — tells the client how long to wait before reconnecting (in ms)

## Building a Live Notification System

### The Node.js Backend

```javascript
// server.js
import express from "express";

const app = express();
const clients = new Map();

// SSE endpoint
app.get("/events", (req, res) => {
  const clientId = crypto.randomUUID();

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Disable Nginx buffering
  });

  // Send initial connection event
  res.write(`id: ${Date.now()}\n`);
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ clientId })}\n\n`);

  // Store client
  clients.set(clientId, { res, lastEventId: 0 });

  // Handle client disconnect
  req.on("close", () => {
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected. Active: ${clients.size}`);
  });

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  req.on("close", () => clearInterval(heartbeat));
});

// Endpoint to trigger notifications
app.post("/notify", express.json(), (req, res) => {
  const { message, type = "notification" } = req.body;
  const eventId = Date.now();

  const payload = `id: ${eventId}\nevent: ${type}\ndata: ${JSON.stringify({
    message,
    timestamp: new Date().toISOString(),
  })}\n\n`;

  let sent = 0;
  for (const [id, client] of clients) {
    client.res.write(payload);
    client.lastEventId = eventId;
    sent++;
  }

  res.json({ sent, total: clients.size });
});

app.listen(3000, () => console.log("SSE server on :3000"));
```

### The Vanilla JS Frontend

```javascript
// notifications.js
class NotificationStream {
  constructor(url, options = {}) {
    this.url = url;
    this.handlers = new Map();
    this.retryCount = 0;
    this.maxRetries = options.maxRetries ?? 10;
    this.connect();
  }

  connect() {
    this.source = new EventSource(this.url);

    this.source.addEventListener("connected", (e) => {
      const { clientId } = JSON.parse(e.data);
      console.log(`Connected as ${clientId}`);
      this.retryCount = 0; // Reset on successful connection
    });

    this.source.addEventListener("notification", (e) => {
      const data = JSON.parse(e.data);
      this.emit("notification", data);
    });

    this.source.addEventListener("progress", (e) => {
      const data = JSON.parse(e.data);
      this.emit("progress", data);
    });

    this.source.onerror = (e) => {
      if (this.source.readyState === EventSource.CLOSED) {
        console.warn("SSE connection closed.");
        this.handleReconnect();
      }
    };
  }

  handleReconnect() {
    if (this.retryCount >= this.maxRetries) {
      console.error("Max reconnection attempts reached.");
      this.emit("maxRetriesReached", {});
      return;
    }
    // Exponential backoff: 1s, 2s, 4s, 8s...
    const delay = Math.min(1000 * 2 ** this.retryCount, 30000);
    this.retryCount++;
    console.log(`Reconnecting in ${delay}ms (attempt ${this.retryCount})`);
    setTimeout(() => this.connect(), delay);
  }

  on(event, callback) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event).push(callback);
    return this; // Allow chaining
  }

  emit(event, data) {
    const callbacks = this.handlers.get(event) || [];
    callbacks.forEach((cb) => cb(data));
  }

  close() {
    this.source?.close();
  }
}

// Usage
const stream = new NotificationStream("/events");

stream
  .on("notification", ({ message, timestamp }) => {
    showToast(message);
  })
  .on("progress", ({ percent, task }) => {
    updateProgressBar(task, percent);
  })
  .on("maxRetriesReached", () => {
    showBanner("Connection lost. Please refresh the page.");
  });
```

### Wiring It Up in HTML

```html
<div id="notifications" aria-live="polite"></div>

<script>
  const container = document.getElementById("notifications");
  const stream = new NotificationStream("/events");

  stream.on("notification", ({ message, timestamp }) => {
    const el = document.createElement("div");
    el.className = "notification fade-in";
    el.textContent = `${new Date(timestamp).toLocaleTimeString()} — ${message}`;
    container.prepend(el);

    // Auto-remove after 10 seconds
    setTimeout(() => el.remove(), 10000);
  });
</script>
```

## Handling Reconnection Gracefully

One of SSE's killer features is **automatic reconnection**. When the connection drops, the browser's `EventSource` automatically reconnects and sends the `Last-Event-ID` header. Your server can use this to replay missed events:

```javascript
app.get("/events", (req, res) => {
  const lastEventId = parseInt(req.headers["last-event-id"] || "0", 10);

  // Replay missed events from a buffer
  const missed = eventBuffer.filter((e) => e.id > lastEventId);
  for (const event of missed) {
    res.write(`id: ${event.id}\nevent: ${event.type}\ndata: ${event.data}\n\n`);
  }

  // Then continue with live events...
});
```

## Best Use Cases for SSE

- **Live dashboards** — metrics, logs, status pages
- **Notification feeds** — social media activity, alerts
- **Progress indicators** — file uploads, CI/CD pipelines, background jobs
- **Stock tickers / sports scores** — one-way data that updates frequently
- **Live blogs / event feeds** — conference live-tweeting, election results

## Limitations to Know

1. **Unidirectional only** — client can't send data back over the same connection. Use regular `fetch()` for that.
2. **Browser connection limits** — HTTP/1.1 limits ~6 connections per domain. HTTP/2 multiplexes, so this is mostly solved.
3. **No binary data** — SSE is text-only. Use WebSockets or fetch for binary.
4. **No IE support** — but who cares in 2026? Polyfills exist if you must.
5. **Load balancer configuration** — you may need to disable response buffering (Nginx: `X-Accel-Buffering: no`).

## SSE vs WebSockets: The Decision Framework

**Choose SSE when:**
- Data flows primarily server → client
- You want simplicity and HTTP compatibility
- You need automatic reconnection with event replay
- You're behind proxies/load balancers that complicate WebSocket upgrades

**Choose WebSockets when:**
- You need true bidirectional communication
- You're sending binary data
- You need sub-millisecond latency in both directions
- You're building multiplayer games or collaborative editors

For a surprisingly large number of "real-time" features, SSE is the pragmatic choice. It's built into every modern browser, works over standard HTTP, reconnects automatically, and requires zero client-side libraries. Next time someone says "we need WebSockets," ask: do we really?
