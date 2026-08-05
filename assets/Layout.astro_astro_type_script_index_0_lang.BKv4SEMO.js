const c=document.getElementById("theme-toggle"),l=document.documentElement,m=localStorage.getItem("theme"),v=window.matchMedia("(prefers-color-scheme: dark)").matches;(m==="dark"||!m&&v)&&l.classList.add("dark");c?.addEventListener("click",()=>{l.classList.toggle("dark");const e=l.classList.contains("dark");localStorage.setItem("theme",e?"dark":"light"),c.style.transform="scale(0.95)",setTimeout(()=>{c.style.transform=""},150)});const u=document.getElementById("mobile-menu-btn"),s=document.getElementById("mobile-menu"),n=document.getElementById("menu-open-icon"),r=document.getElementById("menu-close-icon");u?.addEventListener("click",()=>{s?.classList.contains("hidden")?(s?.classList.remove("hidden"),s?.classList.add("mobile-menu-enter"),n?.classList.add("hidden"),r?.classList.remove("hidden")):(s?.classList.add("hidden"),s?.classList.remove("mobile-menu-enter"),n?.classList.remove("hidden"),r?.classList.add("hidden"))});const b=s?.querySelectorAll("a");b?.forEach(e=>{e.addEventListener("click",()=>{s?.classList.add("hidden"),s?.classList.remove("mobile-menu-enter"),n?.classList.remove("hidden"),r?.classList.add("hidden")})});document.addEventListener("click",e=>{const t=e.target;!s?.contains(t)&&!u?.contains(t)&&(s?.classList.add("hidden"),s?.classList.remove("mobile-menu-enter"),n?.classList.remove("hidden"),r?.classList.add("hidden"))});const h=document.getElementById("reading-progress"),o=document.getElementById("navbar");let g=window.scrollY,d=!1;const p=()=>{const e=window.scrollY,t=window.innerHeight,i=document.documentElement.scrollHeight,a=Math.min(100,Math.max(0,e/(i-t)*100));if(h&&(h.style.width=`${a}%`),o){const f=e>g,y=e>100;f&&y?o.style.transform="translateY(-100%)":o.style.transform="translateY(0)",e>20?o.classList.add("backdrop-blur-md"):o.classList.remove("backdrop-blur-md")}g=e,d=!1},w=()=>{d||(requestAnimationFrame(p),d=!0)},E={threshold:.1,rootMargin:"0px 0px -50px 0px"},L=new IntersectionObserver(e=>{e.forEach(t=>{t.isIntersecting&&(t.target.classList.add("in-view"),L.unobserve(t.target))})},E),k=document.querySelectorAll(".animate-on-scroll");k.forEach(e=>L.observe(e));const T=document.querySelectorAll("[data-stagger]");T.forEach(e=>{const t=e.children;Array.from(t).forEach((i,a)=>{i.style.animationDelay=`${a*.1}s`})});window.addEventListener("scroll",w);p();console.log(`
        🎨 Welcome to Mangesh's Blog!
        
        ✨ Now with smooth animations and enhanced UX!
        
        🔍 Developer Tools Detected!
        Since you're here, you might enjoy these easter eggs:
        
        🎮 Try the Konami Code: ↑↑↓↓←→←→BA
        🖱️ Triple click anywhere for a surprise
        ⌨️ Type "rainbow" for rainbow mode
        ⌨️ Type "surprise" for a random surprise  
        ⌨️ Type "dev" for developer mode
        🔤 Type "mangesh", "hello", or "awesome"
        
        💡 There might be a secret page somewhere... 👀
        
        🎭 Notice the smooth animations? They respect your motion preferences!
        
        Happy exploring! 🚀
      `);
