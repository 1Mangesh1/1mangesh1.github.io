function n(){document.querySelectorAll("pre").forEach(t=>{if(t.parentElement?.classList.contains("code-block-wrapper"))return;const o=document.createElement("div");o.className="relative group code-block-wrapper",t.parentNode?.insertBefore(o,t),o.appendChild(t);const e=document.createElement("button");e.className="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 dark:bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500",e.innerHTML=`
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `,e.ariaLabel="Copy code",e.addEventListener("click",async()=>{const i=t.querySelector("code")?.innerText||t.innerText;try{await navigator.clipboard.writeText(i);const r=e.innerHTML;e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `,setTimeout(()=>{e.innerHTML=r},2e3)}catch(r){console.error("Failed to copy:",r)}}),o.appendChild(e)})}n();document.addEventListener("astro:page-load",n);
