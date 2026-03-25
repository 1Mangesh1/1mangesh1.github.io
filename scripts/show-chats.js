#!/usr/bin/env node

/**
 * Quick D1 Chat Viewer
 * Generates an instant HTML report of recent chats
 * Usage: node scripts/show-chats.js [limit] [time-filter]
 *   - limit: number of chats to show (default: 20)
 *   - time-filter: 'today', 'week', 'month' or number of days (default: all)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const limit = process.argv[2] || '20';
const timeFilter = process.argv[3] || 'all';

// Build the SQL query
let sqlQuery = `SELECT question, answer, country, city, visitor_hash, created_at FROM chat_logs`;

if (timeFilter === 'today') {
  sqlQuery += ` WHERE created_at >= date('now')`;
} else if (timeFilter === 'week') {
  sqlQuery += ` WHERE created_at >= datetime('now', '-7 days')`;
} else if (timeFilter === 'month') {
  sqlQuery += ` WHERE created_at >= datetime('now', '-30 days')`;
} else if (timeFilter !== 'all' && !isNaN(timeFilter)) {
  sqlQuery += ` WHERE created_at >= datetime('now', '-${timeFilter} days')`;
}

sqlQuery += ` ORDER BY created_at DESC LIMIT ${limit};`;

console.log(`📊 Fetching ${limit} recent chats (${timeFilter})...`);

try {
  const output = execSync(`wrangler d1 execute mangesh-chatbot-db --command="${sqlQuery.replace(/"/g, '\\"')}"`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Parse the output
  let chats = [];
  try {
    const lines = output.split('\n').filter(l => l.trim() && !l.includes('wrangler'));
    const dataStart = lines.findIndex(l => l.includes('question'));
    
    if (dataStart !== -1) {
      for (let i = dataStart + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && line.includes('|')) {
          const parts = line.split('|').map(p => p.trim());
          if (parts.length >= 6) {
            chats.push({
              question: parts[0],
              answer: parts[1],
              country: parts[2] || 'unknown',
              city: parts[3] || 'unknown',
              hash: parts[4] || 'anon',
              time: parts[5] || 'now'
            });
          }
        }
      }
    }
  } catch (e) {
    // Fallback parsing
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        chats = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Could not parse response');
        process.exit(1);
      }
    }
  }

  // Generate HTML
  const html = generateHTML(chats, limit, timeFilter);
  
  // Write to file
  const outputPath = path.join(__dirname, '../chats-viewer.html');
  fs.writeFileSync(outputPath, html);
  
  console.log(`✅ Report generated: ${outputPath}`);
  console.log(`📈 Found ${chats.length} chats`);
  console.log(`\n💡 Open in browser: open ${outputPath}`);
  
} catch (error) {
  console.error('❌ Error fetching chats:', error.message);
  console.error('\n💡 Make sure:');
  console.error('1. You have wrangler installed');
  console.error('2. You\'re logged in (wrangler login)');
  console.error('3. Your D1 database is created and configured');
  process.exit(1);
}

function generateHTML(chats, limit, timeFilter) {
  const chatRows = chats
    .map(chat => `
      <tr class="border-b border-gray-200 hover:bg-blue-50 transition">
        <td class="px-4 py-3 text-sm text-gray-700">
          <span class="inline-block max-w-xs truncate" title="${escapeHtml(chat.question)}">
            ${escapeHtml(chat.question.substring(0, 50))}${chat.question.length > 50 ? '...' : ''}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700">
          <span class="inline-block max-w-xs truncate" title="${escapeHtml(chat.answer)}">
            ${escapeHtml(chat.answer.substring(0, 50))}${chat.answer.length > 50 ? '...' : ''}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-500">
          <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
            ${chat.country}${chat.city !== 'unknown' ? ', ' + chat.city : ''}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-500">
          ${formatTime(chat.time)}
        </td>
      </tr>
    `)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mangesh's AI Chat Logs</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-6">
  <div class="max-w-6xl mx-auto fade-in">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">💬 Chat Activity</h1>
          <p class="text-gray-600">Showing ${chats.length} recent ${timeFilter === 'all' ? 'chats' : timeFilter + ' chats'}</p>
        </div>
        <div class="text-right">
          <div class="text-4xl font-bold text-blue-600">${chats.length}</div>
          <div class="text-sm text-gray-600 mt-1">conversations logged</div>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-4 border-b-2 border-green-500">
        <div class="text-sm font-semibold text-gray-600 mb-1">Top Country</div>
        <div class="text-2xl font-bold text-green-600">
          ${getTopCountry(chats) || 'N/A'}
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4 border-b-2 border-purple-500">
        <div class="text-sm font-semibold text-gray-600 mb-1">Unique Visitors</div>
        <div class="text-2xl font-bold text-purple-600">
          ${getUniqueVisitors(chats)}
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4 border-b-2 border-orange-500">
        <div class="text-sm font-semibold text-gray-600 mb-1">Avg Response</div>
        <div class="text-2xl font-bold text-orange-600">
          ${getAvgLength(chats)} chars
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Question</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Answer (preview)</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
            </tr>
          </thead>
          <tbody>
            ${chatRows || '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">No chats found</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-6 text-center text-sm text-gray-600">
      <p>📊 Generated at ${new Date().toLocaleString()}</p>
      <p class="mt-2 text-xs text-gray-500">
        🔄 Run <code class="bg-gray-100 px-2 py-1 rounded">make chats</code> to refresh
      </p>
    </div>
  </div>

  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => {
      location.reload();
    }, 30000);

    // Copy chat on click
    document.querySelectorAll('tbody tr').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const cells = row.querySelectorAll('td');
        const text = \`Q: \${cells[0].innerText}\\nA: \${cells[1].innerText}\\nLocation: \${cells[2].innerText}\`;
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      });
    });
  </script>
</body>
</html>`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatTime(timeStr) {
  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  } catch (e) {
    return 'recently';
  }
}

function getTopCountry(chats) {
  const counts = {};
  chats.forEach(c => {
    counts[c.country] = (counts[c.country] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'N/A';
}

function getUniqueVisitors(chats) {
  const unique = new Set(chats.map(c => c.hash));
  return unique.size;
}

function getAvgLength(chats) {
  const avg = chats.reduce((sum, c) => sum + (c.answer?.length || 0), 0) / chats.length;
  return Math.round(avg);
}
