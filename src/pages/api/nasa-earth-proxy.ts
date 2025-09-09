import type { APIRoute } from 'astro';

import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  // Try multiple ways to access parameters
  const { url, request, params } = context;
  
  console.log('=== DEBUG API CALL ===');
  console.log('Context keys:', Object.keys(context));
  console.log('URL object:', url);
  console.log('Request object URL:', request.url);
  
  // Try both URL sources
  const reqUrl = new URL(request.url);
  const lat = reqUrl.searchParams.get('lat') || url?.searchParams?.get('lat');
  const lon = reqUrl.searchParams.get('lon') || url?.searchParams?.get('lon');
  const date = reqUrl.searchParams.get('date') || url?.searchParams?.get('date');
  const dim = reqUrl.searchParams.get('dim') || url?.searchParams?.get('dim') || '0.4';
  
  console.log('Search params from request URL:', Array.from(reqUrl.searchParams.entries()));
  console.log('Search params from Astro URL:', url ? Array.from(url.searchParams.entries()) : 'No URL object');
  console.log('Extracted params:', { lat, lon, date, dim });
  
  if (!lat || !lon) {
    console.log('Missing parameters error');
    return new Response(JSON.stringify({ 
      error: 'Missing required parameters: lat, lon',
      debug: {
        received: { lat, lon, date, dim },
        requestUrl: request.url,
        astroUrl: url?.href || 'no url object',
        searchParamsRequest: Array.from(reqUrl.searchParams.entries()),
        searchParamsAstro: url ? Array.from(url.searchParams.entries()) : 'no url object'
      }
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const API_KEY = "ZHQlfyfHdYSYnzRjUaRhWHMgRRtWo66ourOBYChp";
    const nasaUrl = `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=${date}&dim=${dim}&api_key=${API_KEY}`;
    
    const response = await fetch(nasaUrl);
    
    if (!response.ok) {
      throw new Error(`NASA API returned ${response.status}: ${response.statusText}`);
    }
    
    // Get the image data as a buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Return the image with proper headers
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching NASA Earth imagery:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch Earth imagery',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};