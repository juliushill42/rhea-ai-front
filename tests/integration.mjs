import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const port=53000+Math.floor(Math.random()*4000);
const srv=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),RHEA_GATEWAY_URL:'',RHEA_ACCESS_KEY:''},stdio:'pipe'});
try {
  let healthy=false;
  for(let i=0;i<50;i++) { await delay(60); try{const r=await fetch(`http://127.0.0.1:${port}/healthz`);if(r.ok){healthy=true;break}}catch{}}
  assert.ok(healthy,'server did not start');
  const home=await fetch(`http://127.0.0.1:${port}/`);assert.equal(home.status,200);const markup=await home.text();
  for(const key of ['Talk to RHEA','Give RHEA work','Helpers','History','Settings','/api/rhea','Not connected'])assert.ok(markup.includes(key),'missing UI capability '+key);
  const offline=await fetch(`http://127.0.0.1:${port}/api/rhea?action=status`);assert.equal(offline.status,200);assert.equal((await offline.json()).connected,false);
  const post=await fetch(`http://127.0.0.1:${port}/api/rhea?action=ask`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({prompt:'test'})});assert.equal(post.status,200);assert.equal((await post.json()).configured,false);
  const missing=await fetch(`http://127.0.0.1:${port}/wrong`);assert.equal(missing.status,404);
  console.log('PASS 5 checks: boot, interface controls, backend status, no fake replies, 404.');
} finally {srv.kill('SIGTERM')}
