const p="ZHQlfyfHdYSYnzRjUaRhWHMgRRtWo66ourOBYChp",g=[{name:"Grand Canyon",lat:36.0986,lon:-112.0978},{name:"Mount Everest",lat:27.9881,lon:86.925},{name:"New York City",lat:40.7128,lon:-74.006},{name:"London",lat:51.5074,lon:-.1278},{name:"Tokyo",lat:35.6762,lon:139.6503},{name:"Sydney Opera House",lat:-33.8568,lon:151.2153},{name:"Sahara Desert",lat:23.8061,lon:11.2888},{name:"Amazon Rainforest",lat:-3.4653,lon:-62.2159},{name:"Niagara Falls",lat:43.0799,lon:-79.0747},{name:"Las Vegas",lat:36.1699,lon:-115.1398}];function h(){const t=g[Math.floor(Math.random()*g.length)],a=document.getElementById("latitude"),e=document.getElementById("longitude");a&&e&&(a.value=t.lat.toString(),e.value=t.lon.toString())}async function d(){const t=document.getElementById("latitude"),a=document.getElementById("longitude"),e=document.getElementById("earth-content"),n=document.getElementById("fetch-earth-btn");if(!t||!a||!e||!n)return;const r=t.value,l=a.value;if(!r||!l){e.innerHTML=`
        <div class="text-center py-8">
          <div class="text-4xl mb-2">📍</div>
          <p class="text-gray-600 dark:text-gray-400">Please enter both latitude and longitude coordinates</p>
        </div>
      `;return}n.disabled=!0,n.textContent="🔄 Loading...";try{const o=new Date;o.setMonth(o.getMonth()-6);const s=o.toISOString().split("T")[0],c=`https://api.nasa.gov/planetary/earth/imagery?lon=${l}&lat=${r}&date=${s}&dim=0.4&api_key=${p}`,i=new Image;i.crossOrigin="anonymous",i.onload=function(){e.innerHTML=`
          <div class="space-y-4">
            <div class="relative group">
              <img 
                src="${c}" 
                alt="Earth imagery from NASA"
                class="w-full h-64 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                loading="lazy"
                crossorigin="anonymous"
              />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
            </div>
            
            <div class="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              <div class="text-sm">
                <div class="font-medium mb-1">📍 Location Details</div>
                <div class="text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Latitude: ${r}°</div>
                  <div>Longitude: ${l}°</div>
                  <div>Date: ${s}</div>
                  <div>Resolution: 400m per pixel</div>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              <button 
                onclick="fetchEarthImagery()" 
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors duration-200"
              >
                🔄 Refresh Image
              </button>
            </div>
          </div>
        `,n.disabled=!1,n.textContent="📡 Get Satellite View"},i.onerror=function(){throw new Error("No imagery available for this location")},i.src=c}catch(o){console.error("Error fetching Earth imagery:",o),e.innerHTML=`
        <div class="text-center py-8">
          <div class="text-4xl mb-2">🌍</div>
          <p class="text-gray-600 dark:text-gray-400 mb-4">No satellite imagery available for these coordinates.</p>
          <p class="text-sm text-gray-500 dark:text-gray-500">Try coordinates like:</p>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
            <div>• Grand Canyon: 36.0986, -112.0978</div>
            <div>• Mount Everest: 27.9881, 86.9250</div>
            <div>• New York City: 40.7128, -74.0060</div>
          </div>
        </div>
      `,n.disabled=!1,n.textContent="📡 Get Satellite View"}}const m=document.getElementById("fetch-earth-btn"),u=document.getElementById("random-location-btn"),v=document.getElementById("latitude"),y=document.getElementById("longitude");m&&m.addEventListener("click",d);u&&u.addEventListener("click",h);v&&v.addEventListener("keypress",t=>{t.key==="Enter"&&d()});y&&y.addEventListener("keypress",t=>{t.key==="Enter"&&d()});window.addEventListener("load",()=>{setTimeout(()=>{h(),d()},1e3)});
