import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async (context) => {  
  const url = new URL(context.request.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  const date = url.searchParams.get('date');

  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: 'Missing latitude or longitude' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const API_KEY = "ZHQlfyfHdYSYnzRjUaRhWHMgRRtWo66ourOBYChp";
  
  try {
    // Use a date from a few months ago if not provided for better image availability
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() - 3);
    const dateString = date || defaultDate.toISOString().split('T')[0];
    
    const nasaUrl = `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=${dateString}&api_key=${API_KEY}`;
    
    const response = await fetch(nasaUrl);
    
    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: 'No imagery available for this location and date',
        details: `Status: ${response.status} - ${response.statusText}`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the image blob and return it directly
    const imageBuffer = await response.arrayBuffer();
    
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });
    
  } catch (error) {
    console.error('Error fetching Earth imagery:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch imagery',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};