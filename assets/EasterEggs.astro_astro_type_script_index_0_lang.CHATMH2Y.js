let r=[];const T=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","KeyB","KeyA"];document.addEventListener("keydown",e=>{r.push(e.code),r.length>10&&r.shift(),r.length===10&&r.every((t,n)=>t===T[n])&&(E(),r=[])});function E(){window.haptics?.trigger("buzz");const e=document.getElementById("secret-modal"),t=e?.querySelector("div");e&&t&&(e.classList.remove("hidden"),setTimeout(()=>{t.classList.add("scale-100")},100),w())}document.getElementById("close-secret")?.addEventListener("click",()=>{const e=document.getElementById("secret-modal"),t=e?.querySelector("div");t&&(t.classList.remove("scale-100"),setTimeout(()=>{e?.classList.add("hidden")},300))});const f=["✨","🎉","💫","⭐","🌟","💥","🎊","🔥"];let l=0;document.addEventListener("click",e=>{Math.random()<.1&&a(e.clientX,e.clientY),l++,setTimeout(()=>l--,1e3),l>=10&&(h(),l=0)});function a(e,t,n){const i=document.getElementById("floating-emojis");if(!i)return;const s=document.createElement("div");s.textContent=n||f[Math.floor(Math.random()*f.length)],s.className="absolute text-2xl pointer-events-none animate-ping",s.style.left=e+"px",s.style.top=t+"px",s.style.transform="translate(-50%, -50%)",i.appendChild(s),setTimeout(()=>{s.remove()},1e3)}function h(){for(let e=0;e<20;e++)setTimeout(()=>{const t=Math.random()*window.innerWidth,n=Math.random()*window.innerHeight;a(t,n)},e*100)}let g=0,m=0;document.addEventListener("click",e=>{const t=Date.now();t-g<500?m++:m=1,g=t,m>=3&&(y(),m=0)});function y(){window.haptics?.trigger("success");const e=document.getElementById("dancing-cat");e&&(e.classList.remove("hidden"),setTimeout(()=>{e.classList.add("hidden")},3e3))}let o="",v;document.addEventListener("keydown",e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)){if(clearTimeout(v),o+=e.key.toLowerCase(),o.includes("rainbow")){k(),o="";return}if(o.includes("surprise")){M(),o="";return}if(o.includes("dev")){C(),o="";return}v=setTimeout(()=>{o=""},2e3),o.length>10&&(o=o.slice(-10))}});let c=!1;function k(){c=!c;const e=document.body;if(c){window.haptics?.trigger("buzz"),e.style.animation="rainbow 3s infinite",e.style.transition="all 0.3s ease",a(window.innerWidth/2,window.innerHeight/2,"🌈");const t=document.createElement("div");t.innerHTML=`
        <div class="text-center">
          <div class="text-lg">🌈 Rainbow Mode Activated!</div>
          <div class="text-xs opacity-75 mt-1">Type "rainbow" again to toggle</div>
        </div>
      `,t.className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-lg z-50 animate-bounce",document.body.appendChild(t),setTimeout(()=>{t.remove()},2e3),setTimeout(()=>{c&&(e.style.animation="",c=!1)},1e4)}else e.style.animation="",e.style.transition=""}function M(){const e=[()=>{document.body.style.transform="rotate(2deg)",document.body.style.transition="transform 0.3s ease",setTimeout(()=>{document.body.style.transform=""},2e3)},()=>w(),()=>y(),()=>{document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, div").forEach(s=>{const b=s.style.fontFamily;s.style.fontFamily="Comic Sans MS, cursive",s.style.transition="font-family 0.3s ease",setTimeout(()=>{s.style.fontFamily=b},3e3)})},()=>{document.body.style.transform="rotate(180deg)",document.body.style.transition="transform 1s ease",setTimeout(()=>{document.body.style.transform=""},3e3)},()=>{document.body.style.animation="bounce 1s ease-in-out 3",setTimeout(()=>{document.body.style.animation=""},3e3)}],t=e[Math.floor(Math.random()*e.length)];window.haptics?.trigger("nudge"),t();const n=document.createElement("div");n.innerHTML=`
      <div class="text-center">
        <div class="text-lg">🎉 Surprise!</div>
        <div class="text-xs opacity-75 mt-1">Type "surprise" for more surprises</div>
      </div>
    `,n.className="fixed top-20 right-4 bg-pink-600 text-white px-4 py-2 rounded-lg z-50 animate-pulse",document.body.appendChild(n),setTimeout(()=>{n.remove()},2e3)}let u=!1;function C(){if(u=!u,u){const e=document.createElement("div");e.id="debug-info",e.className="fixed top-20 left-4 bg-black text-green-400 p-2 rounded font-mono text-xs z-50",e.innerHTML=`
        <div>🔧 Developer Mode Active</div>
        <div>Screen: ${window.innerWidth}x${window.innerHeight}</div>
        <div>User Agent: ${navigator.userAgent.split(" ")[0]}</div>
        <div>Theme: ${document.documentElement.classList.contains("dark")?"Dark":"Light"}</div>
        <div>Platform: ${navigator.platform}</div>
        <div class="text-yellow-400 mt-1">Type "dev" to toggle</div>
      `,document.body.appendChild(e);let t=0;const n=document.createElement("div");n.id="click-counter",n.className="fixed top-20 right-4 bg-black text-green-400 p-2 rounded font-mono text-xs z-50",n.textContent=`Clicks: ${t}`,document.body.appendChild(n);const i=()=>{t++,n.textContent=`Clicks: ${t}`};document.addEventListener("click",i),window.cleanupDevMode=()=>{document.removeEventListener("click",i),document.getElementById("debug-info")?.remove(),document.getElementById("click-counter")?.remove()}}else window.cleanupDevMode?.()}function w(){const e=["#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff"],t=document.getElementById("floating-emojis");if(t)for(let n=0;n<50;n++)setTimeout(()=>{const i=document.createElement("div");i.className="absolute w-2 h-2 rounded-full pointer-events-none",i.style.backgroundColor=e[Math.floor(Math.random()*e.length)],i.style.left=Math.random()*window.innerWidth+"px",i.style.top="-10px",i.style.animation=`fall ${Math.random()*3+2}s linear`,t.appendChild(i),setTimeout(()=>{i.remove()},5e3)},n*50)}let d="";document.addEventListener("keydown",e=>{e.key.length===1&&(d+=e.key.toLowerCase(),d.length>10&&(d=d.slice(-10)),d.includes("mangesh")?(a(window.innerWidth/2,window.innerHeight/2,"👨‍💻"),d=""):d.includes("hello")?(a(window.innerWidth/2,window.innerHeight/2,"👋"),d=""):d.includes("awesome")&&(h(),d=""))});const x=new Date,p=x.getHours();(p>=23||p<=5)&&setTimeout(()=>{a(window.innerWidth-100,100,"🌙")},5e3);x.getDay()===5&&setTimeout(()=>{a(100,100,"🎉")},3e3);Math.random()<.05&&setTimeout(()=>{const e=document.createElement("div");e.className="fixed bottom-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 cursor-pointer transform transition-all hover:scale-105",e.innerHTML=`
        <div class="flex items-center gap-2">
          <span class="text-xl">🤣</span>
          <div class="text-sm">
            <div class="font-bold">Need a laugh?</div>
            <div class="opacity-90">Check out some programming memes!</div>
          </div>
          <button class="ml-2 text-white hover:text-gray-200">×</button>
        </div>
      `,e.addEventListener("click",t=>{t.target.textContent==="×"?e.remove():window.location.href="/meme"}),document.body.appendChild(e),setTimeout(()=>{document.body.contains(e)&&(e.style.transform="translateX(-100%)",setTimeout(()=>e.remove(),300))},8e3)},Math.random()*3e4+1e4);document.addEventListener("keydown",e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)){if(o.includes("gaming")){const t=document.createElement("div");t.className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg z-50 animate-bounce",t.innerHTML=`
        <div class="text-center">
          <div class="text-lg">🎮 Gaming Mode Activated!</div>
          <div class="text-xs opacity-75 mt-1">Go check out the games section →</div>
        </div>
      `,document.body.appendChild(t),setTimeout(()=>t.remove(),3e3),o=""}if(o.includes("whoami")){const t=document.createElement("div");t.className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black text-green-400 px-4 py-2 rounded font-mono text-sm z-50",t.innerHTML=`
        > whoami<br/>
        <span class="text-yellow-400">mangesh_bide</span><br/>
        <span class="text-gray-500">Software Engineer • Python Enthusiast • Problem Solver</span>
      `,document.body.appendChild(t),setTimeout(()=>t.remove(),4e3),o=""}o.includes("hack")&&(L(),o="")}});function L(){window.haptics?.trigger("buzz");const e=document.createElement("div");e.id="hack-mode",e.className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center",e.innerHTML=`
      <div class="bg-black font-mono text-green-400 p-6 rounded-lg opacity-90 max-w-md text-center">
        <div class="text-lg font-bold mb-4 animate-pulse">🔓 SYSTEM ACCESS GRANTED</div>
        <div class="text-xs space-y-1 mb-4 text-left">
          <div>> Accessing mangeshbide.tech...</div>
          <div>> Algorithms loaded: ✓</div>
          <div>> Magic configured: ✓</div>
          <div>> Coolness level: OVER 9000 ✓</div>
          <div class="text-yellow-400">> Access granted to cool stuff</div>
        </div>
        <div class="animate-pulse">
          [████████████████████] 100%
        </div>
      </div>
    `,document.body.appendChild(e),document.body.style.filter="hue-rotate(20deg)",setTimeout(()=>{document.body.style.filter="",e.remove()},2500)}Math.random()<.02&&setTimeout(()=>{const e=document.createElement("div");e.className="fixed bottom-20 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg z-50 text-sm animate-pulse cursor-pointer",e.textContent="🔊 *beep boop* 👾",e.addEventListener("click",()=>{e.textContent="🎵 You found the sound!",e.style.animation="none",setTimeout(()=>e.remove(),2e3)}),document.body.appendChild(e),setTimeout(()=>e.remove(),5e3)},Math.random()*6e4);
