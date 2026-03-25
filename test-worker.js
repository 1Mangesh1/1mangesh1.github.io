#!/usr/bin/env node

/**
 * Test script for Cloudflare Worker AI chatbot
 * Tests: /Referer validation, AI integration, rate limiting
 */

const BASE_URL = 'http://localhost:8788';
const VALID_REFERER = 'https://mangeshbide.tech/';

async function clearCache() {
  try {
    const response = await fetch(`${BASE_URL}/clear-cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.text();
    console.log('✓ Cache cleared:', data);
  } catch (err) {
    console.log('⚠ Could not clear cache (might be first run):', err.message);
  }
}

async function makeRequest(question, referer = VALID_REFERER) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': referer
      },
      body: JSON.stringify({ question })
    });

    // Read body text once, then parse based on content-type
    const bodyText = await response.text();
    let body;
    
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      // If not JSON, return as plain text
      body = bodyText;
    }

    return {
      status: response.status,
      body
    };
  } catch (err) {
    throw err;
  }
}

async function runTests() {
  console.log('🧪 Worker Test Suite\n');
  console.log('='.repeat(60));

  // Clear any existing rate limit cache from previous test runs
  await clearCache();
  console.log('');

  // Test 1: Valid request
  console.log('\n✅ STEP 2: Test chatbot via curl (valid request)\n');
  try {
    const res = await makeRequest('What are your top skills?');
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, res.body);
    
    if (res.status === 200 && res.body.answer) {
      console.log('✓ Received valid AI response');
    } else {
      console.log('✗ Unexpected response format');
    }
  } catch (err) {
    console.error('✗ Request failed:', err.message);
  }

  // Test 2: Invalid Referer
  console.log('\n--- Testing invalid Referer ---\n');
  try {
    const res = await makeRequest('Test query', 'https://evil.com/');
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, res.body);
    
    if (res.status === 403) {
      console.log('✓ Correctly rejected invalid Referer');
    }
  } catch (err) {
    console.error('✗ Request failed:', err.message);
  }

  // Test 3: Rate limiting
  console.log('\n✅ STEP 3: Test rate limiting (16 requests)\n');
  const results = [];
  
  for (let i = 1; i <= 16; i++) {
    try {
      const res = await makeRequest(`Question ${i}`);
      results.push({ num: i, status: res.status });
      console.log(`  Request ${i}: ${res.status}`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      results.push({ num: i, error: err.message });
      console.log(`  Request ${i}: Error - ${err.message}`);
    }
  }

  // Check rate limit results
  console.log('\n--- Rate Limit Summary ---');
  const successful = results.filter(r => r.status === 200).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  
  console.log(`Successful (200): ${successful}`);
  console.log(`Rate Limited (429): ${rateLimited}`);
  
  if (successful >= 14 && rateLimited > 0) {
    console.log(`✓ Rate limiting works correctly (${successful} succeed, then blocked)`);
  } else if (rateLimited === 0) {
    console.log('✗ Rate limiting not triggered');
  } else {
    console.log(`✓ Rate limiting triggered (${successful} success, ${rateLimited} rate-limited)`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test suite completed');
}

// Run tests with a small delay to ensure server is ready
setTimeout(runTests, 1000);
