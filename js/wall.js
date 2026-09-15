/* ==========================================================================
   The sticker wall at Hotel Utah Saloon
   Renders the stickers from data/stickers.json onto a fixed-size stage, then
   provides pan / zoom / navigator on top of it.
   ========================================================================== */

const DATA = 'data/stickers.json';

/* ---------- render the stickers ---------- */
async function build() {
  const res = await fetch(DATA);
  if (!res.ok) throw new Error('could not load ' + DATA);
  const { stickers } = await res.json();
  const host = document.getElementById('stickers');
  const frag = document.createDocumentFragment();

  for (const s of stickers) {
    const linked = Boolean(s.url);
    const el = document.createElement(linked ? 'a' : 'span');
    el.className = 'pin' + (linked ? '' : ' nolink');
    if (linked) {
      el.href = s.url;
      el.target = '_blank';
      el.rel = 'noopener';
    }
    if (s.uncertain) el.dataset.unsure = '1';

    const label = s.name + (s.uncertain ? ' (?)' : '');
    const title = [label, s.note].filter(Boolean).join(' \u2014 ')
                + (s.uncertain ? ' \u00b7 identification uncertain' : '');
    if (title.trim()) el.title = title;

    el.style.cssText =
      `left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px;transform:rotate(${s.rot}deg)`;

    const img = document.createElement('img');
    img.className = 's ' + s.shape;
    img.src = 'img/' + s.img;
    img.alt = s.name || 'sticker';
    img.loading = 'lazy';
    img.decoding = 'async';
    el.appendChild(img);

    if (s.name) {
      const lbl = document.createElement('span');
      lbl.className = 'lbl';
      lbl.textContent = label;
      el.appendChild(lbl);
    }
    /* a drag should never navigate; the sheet handles opening links */
    el.addEventListener('click', e => e.preventDefault());
    frag.appendChild(el);
  }
  host.appendChild(frag);
}

/* ---------- pan / zoom ---------- */
const W=952,H=1265;
const stage=document.getElementById('stage'), vp=document.getElementById('viewport');
let scale=1,minScale=1,maxScale=6,tx=0,ty=0;

function clamp(){
  minScale=Math.min(innerWidth/W,innerHeight/H);
  maxScale=Math.max(minScale*6,3);
  scale=Math.max(minScale,Math.min(maxScale,scale));
  const sw=W*scale, sh=H*scale;
  tx = sw<=innerWidth  ? (innerWidth-sw)/2  : Math.min(0,Math.max(innerWidth-sw,tx));
  ty = sh<=innerHeight ? (innerHeight-sh)/2 : Math.min(0,Math.max(innerHeight-sh,ty));
}
function apply(){
  clamp();
  stage.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;
  const bw=Math.min(1,innerWidth/(W*scale)), bh=Math.min(1,innerHeight/(H*scale));
  const bx=(-tx/scale)/W, by=(-ty/scale)/H;
  const nb=document.getElementById('navbox'), nv=document.getElementById('nav');
  const nw=nv.clientWidth, nh=nv.clientHeight;
  nb.style.left=(Math.max(0,bx)*nw)+'px'; nb.style.top=(Math.max(0,by)*nh)+'px';
  nb.style.width=(bw*nw)+'px'; nb.style.height=(bh*nh)+'px';
}
function zoomAt(cx,cy,factor){
  const ns=Math.max(minScale,Math.min(maxScale,scale*factor));
  const k=ns/scale;
  tx=cx-(cx-tx)*k; ty=cy-(cy-ty)*k; scale=ns; apply();
}
function centerOn(px,py,s){ scale=s; tx=innerWidth/2-px*s; ty=innerHeight/2-py*s; apply(); }

/* wheel + trackpad */
vp.addEventListener('wheel',e=>{e.preventDefault();
  zoomAt(e.clientX,e.clientY,Math.pow(0.9992,e.deltaY*(e.ctrlKey?4:1)));},{passive:false});

/* pointer drag + pinch */
const pts=new Map(); let last=null,pinch=null,moved=0,downT=0,downTarget=null;
vp.addEventListener('pointerdown',e=>{
  vp.setPointerCapture(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  moved=0; downT=Date.now(); downTarget=e.target.closest('.pin');
  if(pts.size===1){last={x:e.clientX,y:e.clientY};vp.classList.add('grabbing');}
  else if(pts.size===2){const[a,b]=[...pts.values()];
    pinch={d:Math.hypot(a.x-b.x,a.y-b.y),cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};last=null;}
});
vp.addEventListener('pointermove',e=>{
  if(!pts.has(e.pointerId))return;
  pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===2&&pinch){
    const[a,b]=[...pts.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y);
    const cx=(a.x+b.x)/2, cy=(a.y+b.y)/2;
    zoomAt(cx,cy,d/pinch.d);
    tx+=cx-pinch.cx; ty+=cy-pinch.cy;
    pinch={d,cx,cy}; moved=99; apply();
  } else if(last){
    const dx=e.clientX-last.x, dy=e.clientY-last.y;
    moved+=Math.abs(dx)+Math.abs(dy);
    tx+=dx; ty+=dy; last={x:e.clientX,y:e.clientY}; apply();
  }
});
function up(e){
  pts.delete(e.pointerId);
  if(pts.size<2)pinch=null;
  if(pts.size===0){
    vp.classList.remove('grabbing');
    if(moved<8&&Date.now()-downT<450) tap(e,downTarget);
    last=null;
  } else { const[a]=[...pts.values()]; last={x:a.x,y:a.y}; }
}
vp.addEventListener('pointerup',up); vp.addEventListener('pointercancel',up);

/* tap: on a sticker open the sheet; on empty wall toggle zoom */
const coarse=matchMedia('(pointer:coarse)').matches;
let lastTap=0;
function tap(e,pin){
  if(pin){ openSheet(pin); return; }
  const now=Date.now();
  if(now-lastTap<320){ zoomAt(e.clientX,e.clientY, scale>minScale*1.8?0.45:2.2); }
  lastTap=now;
}
function openSheet(pin){
  const t=(pin.getAttribute('title')||'').split(' \u2014 ');
  document.getElementById('snm').textContent=t[0]||'';
  document.getElementById('sds').textContent=t.slice(1).join(' \u2014 ');
  const go=document.getElementById('sgo');
  if(pin.tagName==='A'){go.href=pin.href;go.style.display='inline-block';}
  else{go.removeAttribute('href');go.style.display='none';}
  document.getElementById('sheet').classList.add('up');
}
document.getElementById('sx').onclick=()=>document.getElementById('sheet').classList.remove('up');

/* keyboard */
addEventListener('keydown',e=>{
  const step=90/scale*scale;
  if(e.key==='ArrowLeft'){tx+=step;apply();e.preventDefault();}
  if(e.key==='ArrowRight'){tx-=step;apply();e.preventDefault();}
  if(e.key==='ArrowUp'){ty+=step;apply();e.preventDefault();}
  if(e.key==='ArrowDown'){ty-=step;apply();e.preventDefault();}
  if(e.key==='+'||e.key==='='){zoomAt(innerWidth/2,innerHeight/2,1.3);}
  if(e.key==='-'||e.key==='_'){zoomAt(innerWidth/2,innerHeight/2,0.77);}
  if(e.key==='0'){fit();}
  if(e.key==='Escape'){document.getElementById('sheet').classList.remove('up');}
});

/* buttons */
document.getElementById('zin').onclick=()=>zoomAt(innerWidth/2,innerHeight/2,1.45);
document.getElementById('zout').onclick=()=>zoomAt(innerWidth/2,innerHeight/2,0.69);
document.getElementById('zfit').onclick=()=>fit();
function fit(){clamp();scale=minScale;apply();}

/* navigator: drag the box, or tap to jump */
const nav=document.getElementById('nav');
function navTo(e){
  const r=nav.getBoundingClientRect();
  const px=((e.clientX-r.left)/r.width)*W, py=((e.clientY-r.top)/r.height)*H;
  centerOn(px,py,scale);
}
let navDrag=false;
nav.addEventListener('pointerdown',e=>{navDrag=true;nav.setPointerCapture(e.pointerId);navTo(e);e.stopPropagation();});
nav.addEventListener('pointermove',e=>{if(navDrag){navTo(e);e.stopPropagation();}});
nav.addEventListener('pointerup',e=>{navDrag=false;e.stopPropagation();});

/* paint the navigator thumbnail from the live DOM, once images are in */
function paintNav(){
  const c=document.getElementById('navc'), g=c.getContext('2d');
  const k=c.width/W;
  g.fillStyle='#5e4530'; g.fillRect(0,0,c.width,c.height);
  g.fillStyle='#3a2616'; g.fillRect(0,0,c.width,70*k);
  g.fillStyle='#231409'; g.fillRect(0,982*k,c.width,283*k);
  g.fillStyle='#6a5138'; g.fillRect(498*k,112*k,392*k,325*k);
  g.fillStyle='#7a4a2a'; g.fillRect(55*k,300*k,360*k,300*k);
  g.fillStyle='#ffdca0'; g.beginPath(); g.ellipse(490*k,300*k,26*k,40*k,0,0,7); g.fill();
  document.querySelectorAll('#stickers img, .pin').forEach(el=>{
    if(el.classList.contains('lbl'))return;
    const img=el.tagName==='IMG'?el:el.querySelector('img'); if(!img)return;
    const host=el.tagName==='IMG'?el:el;
    const x=parseFloat(host.style.left)||0, y=parseFloat(host.style.top)||0;
    const w=parseFloat(host.style.width)||img.width, hh=parseFloat(host.style.height)||img.height;
    try{ g.drawImage(img,x*k,y*k,Math.max(1,w*k),Math.max(1,hh*k)); }catch(err){}
  });
}

addEventListener('resize',()=>{clamp();apply();});

/* ---------- boot ---------- */
build().catch(err => {
  console.error(err);
  document.getElementById('hint').textContent =
    'Could not load the stickers \u2014 serve this folder over http, not file://';
}).finally(() => {
  document.querySelectorAll('.pin').forEach(p =>
    p.addEventListener('click', e => e.preventDefault()));
  clamp();
  /* open zoomed into the sticker cluster rather than fitted to the screen */
  centerOn(700, 640, Math.min(maxScale, minScale * (innerWidth < 600 ? 2.5 : 1.9)));
  setTimeout(paintNav, 400);
  addEventListener('load', () => setTimeout(paintNav, 200));
});
