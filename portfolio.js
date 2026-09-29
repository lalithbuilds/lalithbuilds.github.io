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
    const labels=(items)=>items.map(([x,y,value])=>`<text x="${x}" y="${y}" fill="#c2d0bc" stroke="none" font-family="ui-monospace,Menlo,monospace" font-size="10" letter-spacing="1">${value}</text>`).join('');
    if(index===0){
      geometry.innerHTML=`<path d="M45 200H150M150 200L245 83M150 200H245M150 200L245 317M245 83H355M245 200H355M245 317H355M355 83L460 200M355 200H460M355 317L460 200" stroke="#7f987f"/><circle cx="150" cy="200" r="10" fill="#d9e4d2" stroke="none"/><circle cx="460" cy="200" r="10" fill="#e7b37e" stroke="none"/><circle cx="245" cy="83" r="6" fill="#b6c8b0" stroke="none"/><circle cx="245" cy="200" r="6" fill="#b6c8b0" stroke="none"/><circle cx="245" cy="317" r="6" fill="#b6c8b0" stroke="none"/>${labels([[45,180,'CONTEXT'],[219,65,'VECTOR'],[225,184,'TRIGRAM'],[226,345,'GRAPH'],[399,180,'RECALL']])}`;
    }else if(index===1){
      geometry.innerHTML=`<path d="M50 200H165M165 200H260M260 200H370M370 200H465M260 200V100H370M260 200V300H370" stroke="#7f987f"/><rect x="147" y="182" width="36" height="36" fill="#d9e4d2" stroke="none"/><rect x="245" y="185" width="30" height="30" fill="#a4bba0" stroke="none"/><circle cx="370" cy="100" r="7" fill="#e7b37e" stroke="none"/><circle cx="370" cy="200" r="7" fill="#e7b37e" stroke="none"/><circle cx="370" cy="300" r="7" fill="#e7b37e" stroke="none"/>${labels([[47,175,'MCP'],[208,175,'SQLITE'],[386,104,'FTS5'],[386,204,'BM25'],[386,304,'LOCAL']])}`;
    }else{
      let grid='';for(let x=0;x<6;x++)for(let y=0;y<4;y++){const px=95+x*64,py=92+y*63;grid+=`<rect x="${px}" y="${py}" width="39" height="36" stroke="#648267"/><circle cx="${px+19}" cy="${py+18}" r="3" fill="${(x+y)%3===0?'#e7b37e':'#b3c7ae'}" stroke="none"/>`;}
      geometry.innerHTML=grid+`<path d="M60 340H462" stroke="#7f987f"/>${labels([[95,70,'AGENTS / SECTORS / GOVERNANCE'],[95,365,'SIMULATION STATE → WEBGL WORLD']])}`;
    }
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
  const canvas=document.getElementById('sculpture');
  const ctx=canvas.getContext('2d');
  if(!ctx)return;
  const motion=document.getElementById('motion-toggle');
  let w=1,h=1,phase=0,paused=reduced.matches,visible=true,raf=0,lastTime=0;
  const routes=[
    {name:'UWOF 7B',detail:'VERIFIER / MLX',x:.73,y:.19,offset:0},
    {name:'TOAST 1.5B',detail:'DRAFT / MLX',x:.73,y:.40,offset:.22},
    {name:'RAY 135M',detail:'REFLEX / MLX',x:.73,y:.61,offset:.45},
    {name:'TOOLS + MEMORY',detail:'WEB / OLLAMA / SQLITE',x:.73,y:.82,offset:.68}
  ];
  function label(){motion.textContent=paused?'Play motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused));}
  function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);draw();}
  function roundRect(x,y,bw,bh,r){ctx.beginPath();ctx.roundRect(x,y,bw,bh,r);}
  function textLine(str,x,y,size,color,weight='400'){ctx.font=`${weight} ${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;ctx.fillStyle=color;ctx.fillText(str,x,y);}
  function draw(){
    ctx.clearRect(0,0,w,h);
    const compact=w<390, left=compact?20:32, coreW=compact?100:136, coreH=compact?71:92;
    const coreX=left, coreY=h*.5-coreH*.5;
    const cardW=compact?126:168, cardH=compact?62:72, cardX=w-cardW-left;
    ctx.strokeStyle='rgba(163,179,161,.07)';ctx.lineWidth=1;
    for(let x=0;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    routes.forEach((route,i)=>{
      const y=h*route.y, startX=coreX+coreW, startY=coreY+coreH/2, endX=cardX, midX=(startX+endX)/2;
      ctx.beginPath();ctx.moveTo(startX,startY);ctx.lineTo(midX,startY);ctx.lineTo(midX,y);ctx.lineTo(endX,y);
      ctx.strokeStyle='rgba(169,187,168,.35)';ctx.lineWidth=1;ctx.stroke();
      const t=(phase+route.offset)%1;
      const pathLength=(midX-startX)+Math.abs(y-startY)+(endX-midX);
      let distance=t*pathLength,px,py;
      if(distance<midX-startX){px=startX+distance;py=startY;}
      else if(distance<midX-startX+Math.abs(y-startY)){px=midX;py=startY+Math.sign(y-startY)*(distance-(midX-startX));}
      else{px=midX+distance-(midX-startX)-Math.abs(y-startY);py=y;}
      ctx.beginPath();ctx.arc(px,py,compact?3:4,0,Math.PI*2);ctx.fillStyle='#e7b37e';ctx.shadowBlur=18;ctx.shadowColor='#e7b37e';ctx.fill();ctx.shadowBlur=0;
      roundRect(cardX,y-cardH/2,cardW,cardH,3);ctx.fillStyle='#1c2720';ctx.fill();ctx.strokeStyle='rgba(164,185,160,.48)';ctx.stroke();
      textLine(String(i+1).padStart(2,'0'),cardX+12,y-cardH/2+17,9,'#b3bdad');
      textLine(route.name,cardX+12,y+3,compact?10:12,'#f1f2e9','600');
      if(!compact)textLine(route.detail,cardX+12,y+22,9,'#a7b5a1');
    });
    roundRect(coreX,coreY,coreW,coreH,3);ctx.fillStyle='#d7e1d1';ctx.fill();
    textLine('00 / CONTROL',coreX+12,coreY+20,9,'#536650');
    textLine('RAY',coreX+12,coreY+(compact?47:56),compact?22:30,'#1a261d','600');
    if(!compact)textLine('RULE-BASED ROUTER',coreX+12,coreY+75,8,'#536650');
    canvas.dataset.phase=phase.toFixed(3);
  }
  function loop(time){raf=0;if(paused||!visible||document.hidden)return;phase=(phase+Math.min(Math.max(time-lastTime,0),80)*.00046)%1;lastTime=time;draw();raf=requestAnimationFrame(loop);}
  function start(){if(!raf&&!paused&&visible&&!document.hidden){lastTime=performance.now();raf=requestAnimationFrame(loop);}}
  motion.addEventListener('click',()=>{paused=!paused;label();start();});
  reduced.addEventListener('change',e=>{paused=e.matches;label();start();});
  document.addEventListener('visibilitychange',start);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();}).observe(canvas);
  new ResizeObserver(resize).observe(canvas);label();resize();start();
})();
