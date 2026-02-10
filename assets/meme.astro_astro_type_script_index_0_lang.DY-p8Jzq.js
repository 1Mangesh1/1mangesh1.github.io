const h=document.getElementById("load-memes-btn"),v=document.getElementById("subreddit-select"),x=document.getElementById("count-select"),n=document.getElementById("memes-container"),r=document.getElementById("loading"),i=document.getElementById("error-state"),y=document.getElementById("retry-btn"),u=document.getElementById("meme-stats");let l=[];async function c(){if(!n||!r||!i)return;const t=v?.value||"ProgrammerHumor",a=x?.value||"10";r.classList.remove("hidden"),i.classList.add("hidden"),n.innerHTML="",u?.classList.add("hidden");try{const e=await fetch(`https://meme-api.com/gimme/${t}/${a}`);if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);if(l=(await e.json()).memes||[],r.classList.add("hidden"),l.length===0)throw new Error("No memes found");f(l),w(l)}catch(e){console.error("Error loading memes:",e),r.classList.add("hidden"),i.classList.remove("hidden")}}function f(t){if(!n)return;n.innerHTML="";const a=document.createDocumentFragment();t.forEach((e,s)=>{const o=document.createElement("div");o.className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow",o.innerHTML=`
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">${e.title}</h3>
              <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  r/${e.subreddit}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v5a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 10.586V5z" clip-rule="evenodd"></path>
                  </svg>
                  u/${e.author}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                  </svg>
                  ${e.ups.toLocaleString()} upvotes
                </span>
              </div>
            </div>
            <button 
              onclick="shareMeme('${e.postLink}', '${e.title.replace(/'/g,"\\'")}', ${s})"
              class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Share meme"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
            </button>
          </div>
          
          <div class="mb-4">
            <img 
              src="${e.url}" 
              alt="${e.title}"
              class="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onclick="openImageModal('${e.url}', '${e.title.replace(/'/g,"\\'")}')"
              loading="lazy"
              onerror="this.parentElement.innerHTML='<div class=\\'bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center\\'>🖼️<br>Image failed to load</div>'"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <a 
              href="${e.postLink}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
            >
              View on Reddit
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
            <div class="flex items-center gap-2">
              ${e.spoiler?'<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Spoiler</span>':""}
              ${e.nsfw?'<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">NSFW</span>':""}
            </div>
          </div>
        </div>
      `,a.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(20px)",o.style.transition="opacity 0.5s ease, transform 0.5s ease",setTimeout(()=>{o.style.opacity="1",o.style.transform="translateY(0)"},s*100)},50)}),n.appendChild(a)}function w(t){const a=document.getElementById("total-memes"),e=document.getElementById("total-upvotes"),s=document.getElementById("unique-authors");if(a&&e&&s){const o=t.reduce((d,p)=>d+p.ups,0),g=new Set(t.map(d=>d.author));a.textContent=t.length.toString(),e.textContent=o.toLocaleString(),s.textContent=g.size.toString(),u?.classList.remove("hidden")}}window.shareMeme=async(t,a,e)=>{try{navigator.share?await navigator.share({title:a,url:t}):(await navigator.clipboard.writeText(t),m("Link copied to clipboard!","success"))}catch(s){console.error("Error sharing:",s),m("Failed to share","error")}};window.openImageModal=(t,a)=>{const e=document.createElement("div");e.className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4",e.innerHTML=`
      <div class="relative max-w-4xl max-h-full">
        <button 
          onclick="this.parentElement.parentElement.remove()"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
        >
          ✕
        </button>
        <img src="${t}" alt="${a}" class="max-w-full max-h-full rounded-lg shadow-2xl" />
      </div>
    `,e.addEventListener("click",s=>{s.target===e&&e.remove()}),document.body.appendChild(e)};function m(t,a){const e=document.createElement("div");e.className=`fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${a==="success"?"bg-green-600":"bg-red-600"}`,e.textContent=t,document.body.appendChild(e),setTimeout(()=>{e.remove()},3e3)}h?.addEventListener("click",c);y?.addEventListener("click",c);c();console.log("🤣 Meme page loaded! Enjoy the programming humor!");
