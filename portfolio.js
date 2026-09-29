(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const projects = [
    ['EpisodAI','Memory infrastructure / Python','A local memory layer for AI agents. SQLite persistence, vector and trigram retrieval, and graph workflows help agents retrieve context across sessions.','MCP · SQLite WAL · Hybrid retrieval · Obsidian','episodai','Persistent memory'],
    ['Episoda Core MCP','Agent tooling / Python standard library','A compact offline memory server for coding agents. SQLite FTS5 provides full-text retrieval behind a small MCP interface, with no external Python dependencies.','MCP · SQLite FTS5 · BM25 · Offline storage','episoda-core-mcp','Minimal architecture'],
    ['ALPURIS OS','Multi-agent simulation / Python + WebGL','A simulated city where agents participate in an economy, sectors, and civic governance. Python services manage the world; a 3D WebGL interface makes its activity explorable.','Multi-agent systems · Python · WebGL · Docker','alpuris-os','Agent worlds']
  ];
  const tabs = [...document.querySelectorAll('[data-project]')];
  const geometry = document.querySelector('#project-geometry');
  function projectArt(index) {
    let paths = '';
    if (index === 0) {
      for (let i=0;i<24;i++) {
        const angle=i*Math.PI/24;
        paths+=`<ellipse cx="260" cy="200" rx="${40+i*5}" ry="150" transform="rotate(${angle*180/Math.PI} 260 200)"/>`;
      }
    } else if (index === 1) {
      for(let i=0;i<9;i++){ const y=70+i*27; paths+=`<path d="M260 ${y-35}L405 ${y+25}L260 ${y+85}L115 ${y+25}Z"/>`; }
    } else {
      for(let x=0;x<6;x++)for(let y=0;y<5;y++){
        const px=260+(x-y)*29, py=105+(x+y)*16, h=20+((x*13+y*7)%5)*13;
        paths+=`<path d="M${px} ${py-h}l23 13v${h}l-23 13-23-13v-${h}Z m0 26v${h} m-23 -${h+13}l23 13 23-13"/>`;
      }
    }
    geometry.innerHTML=paths;
  }
  function selectProject(i, focus=false) {
    const p=projects[i];
    ['project-title','project-type','project-description','project-stack'].forEach((id,j)=>document.getElementById(id).textContent=p[j]);
    document.getElementById('project-link').href='https://github.com/lalithbuilds/'+p[4];
    document.getElementById('art-caption').textContent=`0${i+1} / ${p[5]}`;
    document.getElementById('project-panel').setAttribute('aria-labelledby',tabs[i].id);
    tabs.forEach((t,n)=>{t.setAttribute('aria-selected',String(i===n));t.tabIndex=i===n?0:-1;});
    projectArt(i); if(focus) tabs[i].focus();
  }
  tabs.forEach((t,i)=>{
    t.addEventListener('click',()=>selectProject(i));
    t.addEventListener('keydown',e=>{
      let next=i;
      if(e.key==='ArrowRight')next=(i+1)%3;
      else if(e.key==='ArrowLeft')next=(i+2)%3;
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=2;
      else return;
      e.preventDefault();selectProject(next,true);
    });
  });
  projectArt(0);
  if('IntersectionObserver' in window){
    document.documentElement.classList.add('enhanced');
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
  }
  const canvas=document.getElementById('sculpture'), ctx=canvas.getContext('2d');
  if(!ctx)return;
  let w=1,h=1,angle=.5,tilt=.28,paused=reduced.matches,visible=true,drag=false,lastX=0,lastTime=0,raf=0;
  const motion=document.getElementById('motion-toggle');
  function label(){motion.textContent=paused?'Play motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused));}
  function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);draw();}
  function project(x,y,z){const a=x*Math.cos(angle)-z*Math.sin(angle),b=x*Math.sin(angle)+z*Math.cos(angle);const c=y*Math.cos(tilt)-b*Math.sin(tilt),depth=y*Math.sin(tilt)+b*Math.cos(tilt);const scale=Math.min(w*.28,h*.40)/(3.8+depth*.35);return [w*.52+a*scale,h*.56+c*scale,depth];}
  function draw(){
    ctx.clearRect(0,0,w,h);
    const curves=[];
    // A toroidal knot: an original mathematical form, rather than a copied asset.
    for(let strand=0;strand<42;strand++){
      const points=[];let depth=0;
      for(let k=0;k<=180;k++){
        const t=k/180*Math.PI*2, phase=strand/42*Math.PI*2;
        const r=2.7+.75*Math.cos(3*t+phase),x=r*Math.cos(2*t),z=r*Math.sin(2*t),y=1.45*Math.sin(3*t+phase);
        const p=project(x,y,z);points.push(p);depth+=p[2];
      }
      curves.push({points,depth:depth/181});
    }
    curves.sort((a,b)=>b.depth-a.depth);
    curves.forEach(({points,depth})=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=`rgba(206,214,191,${Math.max(.14,Math.min(.7,.39-depth*.09))})`;ctx.lineWidth=.7;ctx.stroke();});
  }
  function loop(time){raf=0;if(paused||!visible||document.hidden)return;angle+=Math.min(time-lastTime,40)*.0001;lastTime=time;draw();raf=requestAnimationFrame(loop);}
  function start(){if(!raf&&!paused&&visible&&!document.hidden){lastTime=performance.now();raf=requestAnimationFrame(loop);}}
  motion.addEventListener('click',()=>{paused=!paused;label();start();});
  canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(drag){angle+=(e.clientX-lastX)*.008;lastX=e.clientX;draw();}});
  ['pointerup','pointercancel'].forEach(event=>canvas.addEventListener(event,()=>drag=false));
  reduced.addEventListener('change',e=>{paused=e.matches;label();start();});
  document.addEventListener('visibilitychange',start);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();}).observe(canvas);
  new ResizeObserver(resize).observe(canvas);label();resize();start();
})();
