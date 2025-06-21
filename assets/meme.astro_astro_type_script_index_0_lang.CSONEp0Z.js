const p=document.getElementById("load-memes-btn"),v=document.getElementById("subreddit-select"),x=document.getElementById("count-select"),o=document.getElementById("memes-container"),r=document.getElementById("loading"),d=document.getElementById("error-state"),y=document.getElementById("retry-btn"),u=document.getElementById("meme-stats");let n=[];async function i(){if(!o||!r||!d)return;const a=v?.value||"ProgrammerHumor",e=x?.value||"10";r.classList.remove("hidden"),d.classList.add("hidden"),o.innerHTML="",u?.classList.add("hidden");try{const t=await fetch(`https://meme-api.com/gimme/${a}/${e}`);if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);if(n=(await t.json()).memes||[],r.classList.add("hidden"),n.length===0)throw new Error("No memes found");f(n),w(n)}catch(t){console.error("Error loading memes:",t),r.classList.add("hidden"),d.classList.remove("hidden")}}function f(a){o&&(o.innerHTML="",a.forEach((e,t)=>{const s=document.createElement("div");s.className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow",s.innerHTML=`
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
              onclick="shareMeme('${e.postLink}', '${e.title.replace(/'/g,"\\'")}', ${t})"
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
      `,o.appendChild(s),setTimeout(()=>{s.style.opacity="0",s.style.transform="translateY(20px)",s.style.transition="opacity 0.5s ease, transform 0.5s ease",setTimeout(()=>{s.style.opacity="1",s.style.transform="translateY(0)"},t*100)},50)}))}function w(a){const e=document.getElementById("total-memes"),t=document.getElementById("total-upvotes"),s=document.getElementById("unique-authors");if(e&&t&&s){const m=a.reduce((l,h)=>l+h.ups,0),g=new Set(a.map(l=>l.author));e.textContent=a.length.toString(),t.textContent=m.toLocaleString(),s.textContent=g.size.toString(),u?.classList.remove("hidden")}}window.shareMeme=async(a,e,t)=>{try{navigator.share?await navigator.share({title:e,url:a}):(await navigator.clipboard.writeText(a),c("Link copied to clipboard!","success"))}catch(s){console.error("Error sharing:",s),c("Failed to share","error")}};window.openImageModal=(a,e)=>{const t=document.createElement("div");t.className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4",t.innerHTML=`
      <div class="relative max-w-4xl max-h-full">
        <button 
          onclick="this.parentElement.parentElement.remove()"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
        >
          ✕
        </button>
        <img src="${a}" alt="${e}" class="max-w-full max-h-full rounded-lg shadow-2xl" />
      </div>
    `,t.addEventListener("click",s=>{s.target===t&&t.remove()}),document.body.appendChild(t)};function c(a,e){const t=document.createElement("div");t.className=`fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${e==="success"?"bg-green-600":"bg-red-600"}`,t.textContent=a,document.body.appendChild(t),setTimeout(()=>{t.remove()},3e3)}p?.addEventListener("click",i);y?.addEventListener("click",i);i();console.log("🤣 Meme page loaded! Enjoy the programming humor!");
