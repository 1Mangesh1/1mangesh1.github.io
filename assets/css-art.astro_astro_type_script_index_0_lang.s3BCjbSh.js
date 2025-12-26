const n=document.querySelector(".eye"),s=document.querySelector(".iris");n&&s&&document.addEventListener("mousemove",t=>{const e=n.getBoundingClientRect(),r=e.left+e.width/2,a=e.top+e.height/2,o=Math.atan2(t.clientY-a,t.clientX-r),i=Math.min(10,Math.hypot(t.clientX-r,t.clientY-a)/10),d=Math.cos(o)*i,l=Math.sin(o)*i;s.style.transform=`translate(${d}px, ${l}px)`});const p={coffee:`/* Coffee Cup */
.coffee-cup { position: relative; width: 80px; height: 100px; }
.cup-body {
  position: absolute; bottom: 20px; width: 60px; height: 50px;
  background: linear-gradient(135deg, #8b4513 0%, #5c2e0e 100%);
  border-radius: 0 0 15px 15px; left: 0;
}
.handle {
  position: absolute; bottom: 30px; right: -15px; width: 20px; height: 30px;
  border: 4px solid #8b4513; border-left: none; border-radius: 0 15px 15px 0;
}
.saucer { position: absolute; bottom: 0; left: -10px; width: 80px; height: 10px; background: #d4a574; border-radius: 50%; }
.steam {
  position: absolute; top: 0; left: 15px; width: 8px; height: 20px;
  background: rgba(255, 255, 255, 0.6); border-radius: 50%; animation: steam 2s infinite;
}
@keyframes steam {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-30px) scale(1.5); opacity: 0; }
}`,pacman:`/* Pac-Man */
.pacman-scene { position: relative; width: 150px; height: 60px; display: flex; align-items: center; overflow: hidden; }
.pacman {
  width: 50px; height: 50px; background: #ffcc00; border-radius: 50%;
  position: absolute; left: 0;
  animation: chomp 0.2s infinite linear, move-pacman 3s infinite linear;
}
.pacman::before {
  content: ''; position: absolute; top: 10px; left: 25px;
  width: 8px; height: 8px; background: #000; border-radius: 50%;
}
@keyframes chomp {
  0% { clip-path: polygon(100% 50%, 0% 0%, 0% 100%); }
  50% { clip-path: polygon(100% 50%, 35% 15%, 0% 0%, 0% 100%, 35% 85%); }
  100% { clip-path: polygon(100% 50%, 0% 0%, 0% 100%); }
}
@keyframes move-pacman { 0% { left: 0; } 100% { left: 100px; } }
.dot { position: absolute; width: 12px; height: 12px; background: #ffcc00; border-radius: 50%; top: 50%; transform: translateY(-50%); }
.dot-1 { left: 60px; animation: fade-dot 3s infinite linear 0.6s; }
.dot-2 { left: 90px; animation: fade-dot 3s infinite linear 1.2s; }
.dot-3 { left: 120px; animation: fade-dot 3s infinite linear 1.8s; }
@keyframes fade-dot {
  0%, 10% { opacity: 1; transform: translateY(-50%) scale(1); }
  20%, 100% { opacity: 0; transform: translateY(-50%) scale(0); }
}`,dna:`/* DNA Helix */
.dna-spinner { position: relative; width: 60px; height: 80px; }
.strand { position: absolute; width: 15px; height: 15px; border-radius: 50%; animation: dna 2s infinite ease-in-out; }
.strand-1 { background: #3b82f6; top: 0; animation-delay: 0s; }
.strand-2 { background: #ef4444; top: 20px; animation-delay: 0.2s; }
.strand-3 { background: #10b981; top: 40px; animation-delay: 0.4s; }
.strand-4 { background: #f59e0b; top: 60px; animation-delay: 0.6s; }
@keyframes dna { 0%, 100% { left: 0; } 50% { left: 45px; } }`,heart:`/* Beating Heart */
.heart-container { position: relative; width: 100px; height: 100px; }
.heart {
  position: absolute; top: 20px; left: 20px; width: 60px; height: 60px;
  background: #ef4444; transform: rotate(-45deg); animation: heartbeat 1s infinite;
}
.heart::before, .heart::after {
  content: ''; position: absolute; width: 60px; height: 60px;
  background: #ef4444; border-radius: 50%;
}
.heart::before { top: -30px; left: 0; }
.heart::after { left: 30px; top: 0; }
@keyframes heartbeat {
  0%, 100% { transform: rotate(-45deg) scale(1); }
  50% { transform: rotate(-45deg) scale(1.1); }
}`,sunset:`/* Sunset Scene */
.sunset-scene { position: relative; width: 150px; height: 100px; overflow: hidden; border-radius: 10px; }
.sky { position: absolute; width: 100%; height: 60%; background: linear-gradient(180deg, #ff6b6b 0%, #feca57 50%, #ff9f43 100%); }
.sun {
  position: absolute; top: 25px; left: 50%; transform: translateX(-50%);
  width: 40px; height: 40px; background: #fff5e0; border-radius: 50%; box-shadow: 0 0 20px #feca57;
}
.water { position: absolute; bottom: 0; width: 100%; height: 40%; background: linear-gradient(180deg, #0077b6 0%, #023e8a 100%); }
.reflection { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); width: 30px; height: 25px; background: rgba(255, 245, 224, 0.3); border-radius: 50%; filter: blur(5px); }`,hamburger:`/* Hamburger Menu Animation */
.hamburger-wrapper { position: relative; width: 40px; height: 30px; }
.hamburger-btn { display: flex; flex-direction: column; justify-content: space-between; width: 40px; height: 30px; }
.bar { display: block; width: 100%; height: 4px; background: #333; border-radius: 2px; transition: all 0.3s ease; }
#hamburger-toggle:checked ~ .hamburger-btn .bar-1 { transform: translateY(13px) rotate(45deg); }
#hamburger-toggle:checked ~ .hamburger-btn .bar-2 { opacity: 0; }
#hamburger-toggle:checked ~ .hamburger-btn .bar-3 { transform: translateY(-13px) rotate(-45deg); }`,eye:`/* Watching Eye */
.eye {
  width: 80px; height: 50px; background: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid #333; overflow: hidden;
}
.iris {
  width: 30px; height: 30px; background: #3b82f6; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: transform 0.1s;
}
.pupil { width: 15px; height: 15px; background: #000; border-radius: 50%; }
/* JS: Track mouse movement to move iris */`,cube:`/* 3D Rotating Cube */
.cube-wrapper { perspective: 400px; }
.cube { width: 60px; height: 60px; position: relative; transform-style: preserve-3d; animation: rotate-cube 10s infinite linear; }
.face {
  position: absolute; width: 60px; height: 60px;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; color: white; font-size: 24px;
}
.front { background: rgba(59, 130, 246, 0.8); transform: translateZ(30px); }
.back { background: rgba(239, 68, 68, 0.8); transform: rotateY(180deg) translateZ(30px); }
.left { background: rgba(16, 185, 129, 0.8); transform: rotateY(-90deg) translateZ(30px); }
.right { background: rgba(245, 158, 11, 0.8); transform: rotateY(90deg) translateZ(30px); }
.top { background: rgba(139, 92, 246, 0.8); transform: rotateX(90deg) translateZ(30px); }
.bottom { background: rgba(236, 72, 153, 0.8); transform: rotateX(-90deg) translateZ(30px); }
@keyframes rotate-cube { 0% { transform: rotateX(0) rotateY(0); } 100% { transform: rotateX(360deg) rotateY(360deg); } }`,rain:`/* Rain Cloud */
.rain-scene { position: relative; width: 120px; height: 100px; }
.cloud { position: absolute; top: 10px; left: 20px; width: 80px; height: 30px; background: #9ca3af; border-radius: 20px; }
.cloud::before, .cloud::after { content: ''; position: absolute; background: #9ca3af; border-radius: 50%; }
.cloud::before { width: 40px; height: 40px; top: -20px; left: 10px; }
.cloud::after { width: 30px; height: 30px; top: -10px; left: 40px; }
.raindrop { position: absolute; width: 4px; height: 15px; background: linear-gradient(180deg, transparent, #60a5fa); border-radius: 0 0 5px 5px; animation: rain 1s infinite linear; }
.r1 { left: 25px; animation-delay: 0s; }
.r2 { left: 40px; animation-delay: 0.2s; }
.r3 { left: 55px; animation-delay: 0.4s; }
.r4 { left: 70px; animation-delay: 0.6s; }
.r5 { left: 85px; animation-delay: 0.8s; }
@keyframes rain { 0% { top: 40px; opacity: 1; } 100% { top: 100px; opacity: 0; } }`};document.querySelectorAll(".copy-code-btn").forEach(t=>{t.addEventListener("click",e=>{const r=e.target.closest(".css-art-card");if(!r)return;const a=r.getAttribute("data-art");!a||!p[a]||navigator.clipboard.writeText(p[a]).then(()=>{const o=t.textContent;t.textContent="Copied!",t.classList.add("bg-green-500","text-white"),setTimeout(()=>{t.textContent=o,t.classList.remove("bg-green-500","text-white")},2e3)})})});
