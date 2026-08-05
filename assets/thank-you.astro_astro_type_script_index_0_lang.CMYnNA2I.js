function o(n,t,e,l,d=""){const a=document.getElementById(n);if(!a)return;const m=Date.now(),s=()=>{const c=Date.now()-m,r=Math.min(c/l,1),f=Math.floor(t+(e-t)*r);a.textContent=f+d,r<1&&requestAnimationFrame(s)};requestAnimationFrame(s)}window.addEventListener("load",()=>{setTimeout(()=>{o("coffee-count",0,3,1e3),o("lines-coded",0,1200,1500,""),o("bugs-fixed",0,7,1200)},500)});function u(){const n=["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#F97316"];for(let t=0;t<30;t++)setTimeout(()=>{const e=document.createElement("div");e.style.position="fixed",e.style.left=Math.random()*100+"%",e.style.top="-10px",e.style.width="8px",e.style.height="8px",e.style.backgroundColor=n[Math.floor(Math.random()*n.length)],e.style.pointerEvents="none",e.style.borderRadius="50%",e.style.zIndex="9999",e.style.animation=`fall ${Math.random()*3+2}s linear forwards`,document.body.appendChild(e),setTimeout(()=>{e.remove()},5e3)},t*100)}const i=document.createElement("style");i.textContent=`
    @keyframes fall {
      0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
  `;document.head.appendChild(i);setTimeout(u,1e3);
