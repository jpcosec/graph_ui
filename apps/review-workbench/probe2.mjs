import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
const info = await p.evaluate(()=>{
  const vp = document.querySelector('.react-flow__viewport');
  const t = vp ? getComputedStyle(vp).transform : 'none';
  const groups=[...document.querySelectorAll('.react-flow__node-group')].slice(0,3).map(g=>{
    const r=g.getBoundingClientRect();
    return { w:Math.round(r.width), h:Math.round(r.height), styleH:g.style.height, text:(g.textContent||'').trim().slice(0,40), htmlLen:g.innerHTML.length };
  });
  return {viewportTransform:t, groups};
});
console.log('RESULT '+JSON.stringify(info));
await b.close();
