// Theme toggle (remembered)
const root=document.documentElement,tb=document.getElementById("theme");
try{const s=localStorage.getItem("theme");if(s)root.dataset.theme=s}catch(e){}
function isLight(){return root.dataset.theme==="light"||(!root.dataset.theme&&matchMedia("(prefers-color-scheme:light)").matches)}
function icon(){tb.textContent=isLight()?"☾":"☀"}
icon();
tb.onclick=()=>{root.dataset.theme=isLight()?"dark":"light";try{localStorage.setItem("theme",root.dataset.theme)}catch(e){}icon()};

// Mobile menu
const burger=document.getElementById("burger"),links=document.getElementById("links");
burger.onclick=()=>{const o=links.classList.toggle("open");burger.setAttribute("aria-expanded",o)};
links.querySelectorAll("a").forEach(a=>a.onclick=()=>{links.classList.remove("open");burger.setAttribute("aria-expanded",false)});

// Active nav link + back to top
const secs=[...document.querySelectorAll("[data-sec]")],topBtn=document.getElementById("top");
addEventListener("scroll",()=>{
  let cur="home";secs.forEach(s=>{if(s.getBoundingClientRect().top<=140)cur=s.id});
  links.querySelectorAll("a:not(.pillbtn)").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+cur));
  topBtn.classList.toggle("show",scrollY>600);
},{passive:true});

// Certificate viewer
const viewer=document.getElementById("viewer"),vimg=document.getElementById("vimg");
document.querySelectorAll(".view").forEach(b=>b.onclick=()=>{vimg.src=b.dataset.img;vimg.alt=b.dataset.alt;viewer.showModal()});
document.getElementById("vclose").onclick=()=>viewer.close();
viewer.addEventListener("click",e=>{if(e.target===viewer)viewer.close()});
document.getElementById("yr").textContent=new Date().getFullYear();

// Network background inside the hero card
(function(){
  const c=document.getElementById("net"),hd=document.getElementById("hero"),x=c.getContext("2d");
  const calm=matchMedia("(prefers-reduced-motion:reduce)").matches;
  let w,h,nodes=[],packets=[],mouse=null,D=110;
  function size(){
    const r=hd.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    w=r.width;h=r.height;c.width=w*dpr;c.height=h*dpr;x.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.min(45,Math.round(w*h/9000));
    nodes=Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:1.5+Math.random()*2}));
    packets=[];
  }
  hd.addEventListener("pointermove",e=>{const r=hd.getBoundingClientRect();mouse={x:e.clientX-r.left,y:e.clientY-r.top}});
  hd.addEventListener("pointerleave",()=>mouse=null);
  function frame(){
    x.clearRect(0,0,w,h);
    const pts=mouse?nodes.concat([{x:mouse.x,y:mouse.y,r:4,m:1}]):nodes;
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y),m=a.m||b.m,lim=m?D*1.5:D;
      if(d<lim){x.strokeStyle=`rgba(255,154,46,${(1-d/lim)*(m?.8:.4)})`;x.lineWidth=m?1.4:1;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}
    }
    pts.forEach(n=>{x.fillStyle=n.m?"#ee3f8a":"#f6ead2";x.beginPath();x.arc(n.x,n.y,n.r,0,7);x.fill()});
    if(!calm){
      nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>w)n.vx*=-1;if(n.y<0||n.y>h)n.vy*=-1});
      if(Math.random()<.06&&packets.length<10){const a=nodes[Math.random()*nodes.length|0],b=nodes[Math.random()*nodes.length|0];if(a!==b&&Math.hypot(a.x-b.x,a.y-b.y)<D)packets.push({a,b,t:0})}
      packets=packets.filter(p=>{p.t+=.03;if(p.t>=1)return false;x.fillStyle="#ee3f8a";x.beginPath();x.arc(p.a.x+(p.b.x-p.a.x)*p.t,p.a.y+(p.b.y-p.a.y)*p.t,3.5,0,7);x.fill();return true});
      requestAnimationFrame(frame);
    }
  }
  size();frame();
  let t;addEventListener("resize",()=>{clearTimeout(t);t=setTimeout(()=>{size();if(calm)frame()},150)});
})();

// Typing terminal
(function(){
  const el=document.getElementById("typed");
  const lines=["show vlan brief","ping portfolio.bt  (4/4 replies)","ssh dorji@linux-server","systemctl status portfolio  (active)","show ip route  (inter-VLAN ok)"];
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){el.textContent=lines[0];return}
  let i=0,j=0,del=false;
  (function tick(){
    const s=lines[i];el.textContent=s.slice(0,j);
    if(!del&&j===s.length){del=true;return setTimeout(tick,1600)}
    if(del&&j===0){del=false;i=(i+1)%lines.length}
    j+=del?-1:1;setTimeout(tick,del?20:55);
  })();
})();

// Custom cursor: dot + ring that grows and shows a label over clickable things
(function(){
  if(!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
  const dot=document.createElement("div"),ring=document.createElement("div"),lab=document.createElement("span");
  dot.className="cdot";ring.className="cring";ring.appendChild(lab);
  dot.setAttribute("aria-hidden","true");ring.setAttribute("aria-hidden","true");
  document.body.append(dot,ring);
  let x=0,y=0,rx=0,ry=0,on=false;
  const HOT="a,button,.view,[data-cursor],.hobby,.round,.filters button,input,textarea,label";
  addEventListener("pointermove",e=>{
    x=e.clientX;y=e.clientY;
    if(!on){on=true;rx=x;ry=y;root.classList.add("has-cursor")}
    dot.style.transform=`translate(${x}px,${y}px)`;
    const t=e.target.closest&&e.target.closest(HOT);
    const text=t&&t.dataset.cursor||"";
    ring.classList.toggle("hot",!!t);
    ring.classList.toggle("lbl",!!text);
    lab.textContent=text;
    dot.classList.toggle("hide",!!t&&!!text);
  },{passive:true});
  addEventListener("pointerdown",()=>ring.style.scale=".8");
  addEventListener("pointerup",()=>ring.style.scale="1");
  root.addEventListener("pointerleave",()=>{dot.style.opacity=0;ring.style.opacity=0});
  root.addEventListener("pointerenter",()=>{dot.style.opacity="";ring.style.opacity=""});
  (function loop(){rx+=(x-rx)*.2;ry+=(y-ry)*.2;ring.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(loop)})();
  // dialogs sit in the top layer, so move the cursor inside while a certificate is open
  const show=viewer.showModal.bind(viewer);
  viewer.showModal=()=>{show();viewer.append(dot,ring)};
  viewer.addEventListener("close",()=>document.body.append(dot,ring));
})();

// Count-up numbers when achievements scroll into view
(function(){
  const nums=document.querySelectorAll("[data-count]");
  if(!nums.length||matchMedia("(prefers-reduced-motion:reduce)").matches||!("IntersectionObserver" in window))return;
  const io=new IntersectionObserver((es,o)=>es.forEach(e=>{
    if(!e.isIntersecting)return;o.unobserve(e.target);
    const end=+e.target.dataset.count;let n=0;
    const t=setInterval(()=>{n++;e.target.textContent=n;if(n>=end)clearInterval(t)},350);
    e.target.textContent=0;
  }),{threshold:.6});
  nums.forEach(n=>io.observe(n));
})();
