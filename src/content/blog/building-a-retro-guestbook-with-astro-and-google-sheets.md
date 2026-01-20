---
title: "Building a Retro Guestbook with Astro & Google Sheets (No Database Required!)"
description: "How I built a nostalgic 90s-style guestbook using Astro, vanilla JavaScript, and Google Sheets as a free backend. Complete with spam moderation and zero hosting costs."
pubDate: 2026-01-20T00:00:00Z
tags: ["Astro", "Google Sheets", "Tutorial", "JavaScript", "Web Development", "Serverless"]
heroImage: "/images/blog/guestbook-hero.png"
draft: false
---

Remember the good old days of the internet? When every personal website had a guestbook where visitors would leave messages like *"Cool site! Check out mine!"* or *"First!!!1!"*?

Well, I decided to bring that nostalgia back—but with a modern twist. No PHP, no MySQL, no server costs. Just Astro, vanilla JavaScript, and... *Google Sheets*?

Yep. Let me show you how I built a fully functional guestbook that costs exactly **$0/month** to run.

![Guestbook Preview](/images/blog/guestbook-preview.png)
*The final result: A clean, modern guestbook that would make 2003 proud*

---

## The Architecture (Or: How to Overthink a Simple Feature)

Here's the beautiful chaos of this setup:

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Astro Page    │────▶│  Google Apps Script  │────▶│  Google Sheets  │
│  (Frontend)     │◀────│  (Serverless API)    │◀────│  (Database)     │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
         │
         ▼
   localStorage
   (Fallback/Cache)
```

**Why Google Sheets?**
- Free forever (until Google decides otherwise, but let's not think about that)
- Built-in UI for moderating messages
- No database setup, migrations, or maintenance
- You can literally open a spreadsheet and approve/delete messages

![Architecture Diagram](/images/blog/guestbook-architecture.png)
*When your database has conditional formatting and pivot table support*

---

## Part 1: The Frontend (Astro + Vanilla JS)

The guestbook lives in a single Astro file. Here's the skeleton:

```astro
---
import Layout from '../layouts/Layout.astro';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
---

<Layout title="Guestbook" description="Sign my guestbook!">
  <!-- The magic happens here -->
</Layout>
```

### The Form

Nothing fancy—just good old HTML that actually works:

```html
<form id="guestbook-form" class="space-y-4">
  <input type="text" id="name" required maxlength="50"
         placeholder="Your name" />
  <input type="url" id="website" maxlength="100"
         placeholder="Website (optional)" />
  <textarea id="message" required maxlength="280" rows="3"
            placeholder="Write something..."></textarea>
  <button type="submit">Post message</button>
</form>
```

Notice the `maxlength="280"`? That's intentional. If Twitter taught us anything, it's that character limits make people more creative (or at least more concise).

![Form Screenshot](/images/blog/guestbook-form.png)
*Clean, minimal, and impossible to mess up*

### The Character Counter

Because watching numbers count down is oddly satisfying:

```javascript
const messageInput = document.getElementById('message');
const charCount = document.getElementById('char-count');

messageInput.addEventListener('input', () => {
  charCount.textContent = `${messageInput.value.length}/280`;
});
```

### Dynamic Avatar Colors

Instead of boring gray circles, each user gets a unique avatar color based on their name:

```javascript
function getAvatarColor(name) {
  const colors = [
    'from-rose-400 to-pink-500',
    'from-violet-400 to-purple-500',
    'from-blue-400 to-indigo-500',
    'from-cyan-400 to-teal-500',
    'from-emerald-400 to-green-500',
    'from-amber-400 to-orange-500',
    'from-slate-400 to-slate-500'
  ];

  // Generate consistent hash from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
```

This means "Alice" will always get the same color gradient, creating visual consistency without storing any extra data.

![Avatar Colors](/images/blog/guestbook-avatars.png)
*Every visitor gets their own signature gradient*

### Relative Time Formatting

Nobody wants to see "2025-01-20T14:32:00.000Z". They want "5m ago":

```javascript
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
```

---

## Part 2: The "Backend" (Google Apps Script)

This is where it gets spicy. Google Apps Script is basically free serverless functions that can talk to Google Sheets. You write JavaScript, deploy it as a web app, and boom—you have an API.

### Setting Up The Sheet

First, create a Google Sheet with these columns:

| A | B | C | D | E |
|---|---|---|---|---|
| Timestamp | Name | Website | Message | Draft |

The **Draft** column is crucial—it's our spam filter. New entries come in as `TRUE` (draft), and only `FALSE` entries show up on the site.

![Google Sheet Setup](/images/blog/guestbook-sheet.png)
*Your database admin panel is literally a spreadsheet*

### The doPost Function (Receiving Messages)

This handles incoming form submissions:

```javascript
function doPost(e) {
  // Get the active spreadsheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Parse the incoming JSON data
  const data = JSON.parse(e.postData.contents);

  // Append a new row with draft = TRUE (needs approval)
  sheet.appendRow([
    new Date(),           // Timestamp
    data.name,            // Name
    data.website || '',   // Website (optional)
    data.message,         // Message
    true                  // Draft status - TRUE means "needs review"
  ]);

  // Return success response
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**What's happening here:**
1. `e.postData.contents` contains the raw JSON from the frontend
2. `JSON.parse()` converts it to a usable object
3. `sheet.appendRow()` adds a new row to the spreadsheet
4. The `true` at the end marks it as a draft (pending approval)

![doPost Flow](/images/blog/guestbook-dopost-flow.png)
*From browser to spreadsheet in ~500ms*

### The doGet Function (Fetching Messages)

This returns approved messages to display on the site:

```javascript
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Get all data from the sheet
  const data = sheet.getDataRange().getValues();

  // Filter and transform the data
  const rows = data.slice(1)  // Skip header row
    .filter(row => {
      // Only show approved messages (draft = FALSE or empty)
      return row[4] === false || row[4] === '' || row[4] === 'FALSE';
    })
    .map(row => ({
      timestamp: row[0],
      name: row[1],
      website: row[2],
      message: row[3]
    }));

  // Return as JSON
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**The filtering logic:**
- `row[4] === false` - Boolean FALSE in the sheet
- `row[4] === ''` - Empty cell (legacy entries)
- `row[4] === 'FALSE'` - String "FALSE" (because Google Sheets is fun like that)

Only rows matching these conditions are returned. Everything else stays hidden.

![Moderation Flow](/images/blog/guestbook-moderation.png)
*Approve messages by changing TRUE to FALSE. That's it. That's the admin panel.*

---

## Part 3: Deploying the Apps Script

Here's how to get your script online:

### Step 1: Create the Script
1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Paste the `doPost` and `doGet` functions
4. Save the project

### Step 2: Connect to Your Sheet
1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. This links the script to that specific sheet

### Step 3: Deploy as Web App
1. Click **Deploy > New deployment**
2. Select **Web app**
3. Set **Execute as**: "Me"
4. Set **Who has access**: "Anyone"
5. Click **Deploy**
6. Copy the URL (this is your API endpoint!)

![Deploy Settings](/images/blog/guestbook-deploy.png)
*The settings that make the magic work*

### Step 4: Handle CORS (The Annoying Part)

Google Apps Script doesn't handle CORS well with POST requests. The solution? Use `mode: 'no-cors'`:

```javascript
await fetch(GOOGLE_SCRIPT_URL, {
  method: 'POST',
  mode: 'no-cors',  // This is the secret sauce
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(entry)
});
```

The tradeoff: You won't get a response body. But you can assume success if no error is thrown (it's fine, trust me).

---

## Part 4: The Fallback System

What if Google is down? What if the script URL isn't configured? The guestbook still works thanks to localStorage:

```javascript
const STORAGE_KEY = 'guestbook_messages';

function loadLocalMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : getDefaultMessages();
  } catch {
    return getDefaultMessages();
  }
}

function saveLocalMessage(entry) {
  const messages = loadLocalMessages();
  messages.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}
```

This creates a graceful degradation:
1. **Google Sheet works** → Messages saved to cloud + localStorage
2. **Google Sheet fails** → Messages saved to localStorage only
3. **Fresh visitor** → Shows default welcome message

![Fallback System](/images/blog/guestbook-fallback.png)
*When your database is down but the vibes are still up*

---

## Part 5: Security Considerations

### XSS Prevention

Never trust user input. Always escape HTML:

```javascript
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Usage
<p>${escapeHtml(entry.message)}</p>
```

This converts `<script>alert('hacked')</script>` into harmless text.

### Input Validation

Both frontend and "backend" validate inputs:
- **Frontend**: `maxlength` attributes, `required` fields
- **Backend**: Google Sheets naturally limits cell sizes

### Rate Limiting?

Honestly? No. This is a personal site. If someone wants to spam my guestbook, they're only wasting their own time. Plus, the moderation system means spam never goes public anyway.

![Security Meme](/images/blog/guestbook-security.png)
*My spam prevention strategy: just don't approve spam*

---

## The Complete Message Lifecycle

Let's trace a message from submission to display:

```
1. User fills out form
   ↓
2. JavaScript validates input
   ↓
3. POST request to Google Apps Script
   ↓
4. doPost() adds row with draft=TRUE
   ↓
5. Message appears in Google Sheet (invisible on site)
   ↓
6. I manually change TRUE to FALSE (approving it)
   ↓
7. doGet() now includes this message
   ↓
8. Frontend fetches and displays it
   ↓
9. Visitor sees the message with fancy avatar gradient
```

![Message Lifecycle](/images/blog/guestbook-lifecycle.png)
*The journey of a guestbook message*

---

## Why This Approach?

### Pros
- **Free**: Google Sheets and Apps Script cost nothing
- **Simple**: No server management, no database migrations
- **Moderation**: Built-in via the Draft column
- **Portable**: Easy to export data as CSV anytime
- **Offline-capable**: localStorage fallback works without internet

### Cons
- **Google dependency**: If Google kills Apps Script, I'm toast
- **Latency**: ~500ms for the round trip to Google
- **CORS headaches**: `no-cors` mode has limitations
- **Scaling**: Won't handle viral traffic (but my blog won't go viral, so...)

---

## Try It Yourself!

Want to add a guestbook to your site? Here's the TL;DR:

1. Create a Google Sheet with columns: Timestamp, Name, Website, Message, Draft
2. Add the `doPost` and `doGet` functions to Apps Script
3. Deploy as a web app (anyone can access)
4. Build your frontend form
5. Fetch and display approved messages
6. Moderate by toggling the Draft column

![Final Result](/images/blog/guestbook-final.png)
*The nostalgia is real*

---

## Wrapping Up

Building this guestbook was a fun exercise in creative problem-solving. Could I have used a "proper" backend? Sure. Firebase, Supabase, PlanetScale—there are countless options. But sometimes the best solution is the one that:

1. Costs nothing
2. Requires no maintenance
3. Solves the problem
4. Makes you smile

A Google Sheet as a database definitely makes me smile.

Now go sign my guestbook. I promise I'll approve your message (unless you're a bot).

---

**Links:**
- [Check out the live guestbook](/guestbook)
- [Google Apps Script documentation](https://developers.google.com/apps-script)
- [Astro documentation](https://astro.build)

*Got questions? Drop a message in the guestbook (obviously).*
