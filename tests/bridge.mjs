import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const key='proof-local-only-123456789';
const mock=http.createServer(async(req,res)=>{
 let input='';for await(const c of req) input+=c;
 const payload=()=>{try{return JSON.parse(input)}catch{return {}}};
 const actions={
 '/health':()=>({status:'healthy',service:'rhea-gateway'}),
 '/nodes':()=>({active:'primary',primary_alive:true,failover_alive:false}),
 '/blueprints':()=>({blueprint_count:1,blueprints:['research_2026.json']}),
 '/query':()=>({response:'Real gateway reply: '+payload().prompt,node_used:'primary',context_docs_used:0}),
 '/ingest':()=>({status:'ingested',documents_added:payload().documents.length}),
 '/spawn':()=>({status:'spawned',blueprint:{child_name:payload().child_name,role:payload().role}})
 };
 if(!actions[req.url]){res.writeHead(404);return res.end('not found')}
 res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(actions[req.url]()));
});
await new Promise(r=>mock.listen(0,'127.0.0.1',r));const mockPort=mock.address().port;
const port=56000+Math.floor(Math.random()*4000);
const srv=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),RHEA_GATEWAY_URL:`http://127.0.0.1:${mockPort}`,RHEA_ACCESS_KEY:key},stdio:'pipe'});
const fetchR=async(action,method='GET',data,auth=key)=>{
 const r=await fetch(`http://127.0.0.1:${port}/api/rhea?action=${action}`,{method,headers:{'content-type':'application/json',...(auth?{'x-rhea-key':auth}:{})},...(data?{body:JSON.stringify(data)}:{})});return {status:r.status,body:await r.json()};
};
try{
 let started=false;for(let i=0;i<60;i++){await sleep(50);try{if((await fetch(`http://127.0.0.1:${port}/healthz`)).ok){started=true;break}}catch{}}assert.ok(started);
 const unauthorized=await fetchR('status','GET',undefined,'bad');assert.equal(unauthorized.status,401);
 const status=await fetchR('status');assert.equal(status.status,200);assert.equal(status.body.connected,true);assert.equal(status.body.nodes.active,'primary');
 const ask=await fetchR('ask','POST',{prompt:'test this'});assert.equal(ask.status,200);assert.equal(ask.body.response,'Real gateway reply: test this');
 const invalid=await fetchR('ask','POST',{prompt:''});assert.equal(invalid.status,400);
 const memory=await fetchR('remember','POST',{content:'Useful document text'});assert.equal(memory.body.documents_added,1);
 const helper=await fetchR('create-helper','POST',{child_name:'research_agent',role:'Research documents'});assert.equal(helper.body.blueprint.child_name,'research_agent');assert.ok(helper.body.notice.includes('does not start'));
 const plans=await fetchR('helpers');assert.equal(plans.body.helpers.blueprint_count,1);
 console.log('PASS 7 connected-server checks: access control, health, live reply, bad input, memory, helper plans, listing.');
}finally{srv.kill('SIGTERM');mock.close()}
