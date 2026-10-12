'use strict';
const crypto = require('node:crypto');

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-content-type-options', 'nosniff');
  res.end(JSON.stringify(data));
}
function verifyKey(req) {
  const expected = process.env.RHEA_ACCESS_KEY || '';
  if (expected.length < 16) return false;
  const actual = req.headers['x-rhea-key'] || '';
  if (typeof actual !== 'string') return false;
  const a = crypto.createHash('sha256').update(actual).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}
function gateway() {
  const s = process.env.RHEA_GATEWAY_URL;
  if (!s) return null;
  try {
    const u = new URL(s);
    if (!(u.protocol === 'https:' || (u.protocol === 'http:' && ['localhost','127.0.0.1','::1'].includes(u.hostname)))) return null;
    if (u.username || u.password || u.search || u.hash) return null;
    return u.origin;
  } catch { return null; }
}
async function readJSON(req) {
  let text = '';
  for await (const chunk of req) {
    text += chunk.toString();
    if (text.length > 1024 * 1024) throw Object.assign(new Error('Request too large.'), { status: 413 });
  }
  try { return JSON.parse(text || '{}'); }
  catch { throw Object.assign(new Error('Invalid request.'), { status: 400 }); }
}
async function forward(base, path, method = 'GET', body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), method === 'GET' ? 9000 : 115000);
  try {
    const r = await fetch(base + path, {
      method,
      signal: controller.signal,
      headers: { 'content-type': 'application/json', ...(process.env.RHEA_UPSTREAM_TOKEN ? {'authorization':'Bearer '+process.env.RHEA_UPSTREAM_TOKEN} : {}) },
      ...(method !== 'GET' ? { body: JSON.stringify(body) } : {}),
    });
    const txt = await r.text();
    let value;
    try { value = JSON.parse(txt); } catch { value = { message: txt.slice(0, 500) }; }
    if (!r.ok) throw Object.assign(new Error(value.detail || value.error || 'RHEA rejected this request.'), {status:r.status});
    return value;
  } finally { clearTimeout(timeout); }
}
function errorResult(err) {
  const status = err?.status || 502;
  if (err?.name === 'AbortError') return { status: 504, message: 'RHEA took too long to answer.' };
  if (status === 502) return { status, message: 'Cannot reach the RHEA server. Check its connection.' };
  return { status: status >= 400 && status < 600 ? status : 502, message: String(err?.message || 'Request failed.').slice(0, 240) };
}
module.exports = async function handler(req, res) {
  const action = new URL(req.url, 'http://localhost').searchParams.get('action') || 'status';
  const base = gateway();
  if (!base) return send(res, 200, { connected:false, configured:false, message:'RHEA server not connected. Add RHEA_GATEWAY_URL and RHEA_ACCESS_KEY on the server.' });
  if (!verifyKey(req)) return send(res, 401, { error:'Enter your access key to connect to RHEA.' });
  try {
    if (req.method === 'GET' && action === 'status') {
      const [health, nodes] = await Promise.allSettled([forward(base,'/health'),forward(base,'/nodes')]);
      return send(res,200,{connected:health.status==='fulfilled',configured:true,health:health.status==='fulfilled'?health.value:null,nodes:nodes.status==='fulfilled'?nodes.value:null,message:health.status==='fulfilled'?'RHEA answered.':'RHEA is not responding.'});
    }
    if (req.method === 'GET' && action === 'helpers') {
      return send(res,200,{helpers:await forward(base,'/blueprints'),description:'These are saved helper plans, not running workers.'});
    }
    if (req.method === 'POST' && action === 'ask') {
      const body = await readJSON(req);
      if (typeof body.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 8000) return send(res,400,{error:'Enter a request of 1 to 8,000 characters.'});
      return send(res,200,await forward(base,'/query','POST',{ prompt:body.prompt.trim(),top_k:5,max_tokens:1024,temperature:0.5,store_response:true }));
    }
    if (req.method === 'POST' && action === 'remember') {
      const body = await readJSON(req);
      if (typeof body.content !== 'string' || !body.content.trim() || body.content.length > 100000) return send(res,400,{error:'Enter text up to 100,000 characters.'});
      return send(res,200,await forward(base,'/ingest','POST',{documents:[body.content.trim()]}));
    }
    if (req.method === 'POST' && action === 'create-helper') {
      const body = await readJSON(req);
      if (typeof body.child_name !== 'string' || !/^[A-Za-z0-9_-]{3,50}$/.test(body.child_name) || typeof body.role !== 'string' || body.role.length < 2 || body.role.length > 100) return send(res,400,{error:'Use a short helper name (3–50 letters/numbers) and a role (2–100 characters).'});
      const result = await forward(base,'/spawn','POST',{child_name:body.child_name,role:body.role});
      return send(res,200,{...result,notice:'Helper plan saved. This does not start a worker.'});
    }
    return send(res,404,{error:'This action is not available.'});
  } catch(e) { const {status,message} = errorResult(e); return send(res,status,{error:message}); }
};
