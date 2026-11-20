// D-134: the same-origin auth gateway forwards only what Express needs. Loads the real modules with an injected
// fetch and environment; no server, network or secrets.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as net from "node:net";
import vm from "node:vm";
import ts from "typescript";
const load=(file,modules)=>{const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:id=>{if(id in modules)return modules[id];throw new Error(`unexpected import ${id}`);},process:{env:{}},console:{error(){}},URL,Headers,Request,Response,AbortSignal,JSON,Number,Object,Set});return exports;};
const api=load('lib/server/api.ts',{'server-only':{},'next/headers':{}});
const gateway=load('lib/server/auth-gateway.ts',{'server-only':{},'node:net':net,'@/lib/server/api':api});
const env={API_URL:'http://api.internal:4000'};
const origin='http://127.0.0.1:3100';
let seen;
const upstream=(status,{body='{"ok":true}',headers={}}={})=>async(url,init)=>{seen={url,init,headers:Object.fromEntries(init.headers)};const h=new Headers({'content-type':'application/json','x-powered-by':'internal',...headers});for(const c of ['rocktama_session=t; Path=/; HttpOnly; SameSite=Lax','tracking=1; Path=/'])h.append('set-cookie',c);return new Response(status===204?null:body,{status,headers:h});};
const req=(action,{method='POST',headers={},body='{}'}={})=>gateway.forwardAuthRequest(new Request(`${origin}/api/v1/auth/${action}`,{method,headers:{origin,'content-type':'application/json',...headers},body:method==='POST'?body:undefined}),action,{env,fetchImpl:upstream(200)});

// API_URL: server-only origin, validated.
assert.equal(api.apiBaseUrl({API_URL:'http://127.0.0.1:4000'}),'http://127.0.0.1:4000');
for(const bad of [undefined,'','api:4000','ftp://x','http://u:p@x','http://x/path','http://x?q=1']) assert.equal(api.apiBaseUrl({API_URL:bad}),null,String(bad));
// Only session cookies are forwarded.
assert.equal(api.sessionCookieHeader('rt_admin=a; rocktama_session=s; rocktama-distributor-demo=d; __Host-rocktama_session=h'),'rocktama_session=s; __Host-rocktama_session=h');
assert.equal(api.sessionCookieHeader('rt_admin=a'),null);

// Allow-list of actions and methods.
assert.equal((await req('admin')).status,404);
assert.equal((await req('../users')).status,404);
assert.equal((await req('constructor')).status,404);
assert.equal((await req('me',{method:'POST'})).status,405);
assert.equal((await req('login',{method:'GET'})).status,405);

// Request headers: Origin, Content-Type and the session cookie only; client X-Forwarded-For dropped by default.
let response=await req('login',{headers:{cookie:'rt_admin=secret; rocktama_session=abc','x-forwarded-for':'203.0.113.9','x-real-ip':'203.0.113.10',authorization:'Bearer x',host:'evil'}});
assert.equal(seen.url,'http://api.internal:4000/api/v1/auth/login');
assert.deepEqual(Object.keys(seen.headers).sort(),['accept','content-type','cookie','origin']);
assert.equal(seen.headers.origin,origin);
assert.equal(seen.headers.cookie,'rocktama_session=abc');
assert.equal(seen.init.redirect,'manual');
// Response headers: only Content-Type, Retry-After and the session Set-Cookie; always no-store.
assert.deepEqual(response.headers.getSetCookie(),['rocktama_session=t; Path=/; HttpOnly; SameSite=Lax']);
assert.equal(response.headers.get('x-powered-by'),null);
assert.equal(response.headers.get('cache-control'),'no-store');

// Client address only when a front proxy is declared; then the right-most entry.
assert.equal(gateway.forwardedFor(new Headers({'x-forwarded-for':'203.0.113.9'}),{}),null);
assert.equal(gateway.forwardedFor(new Headers({'x-forwarded-for':'203.0.113.9'}),{AUTH_CLIENT_IP_SOURCE:'true'}),null);
assert.equal(gateway.forwardedFor(new Headers({'x-forwarded-for':'198.51.100.1, 203.0.113.9'}),{AUTH_CLIENT_IP_SOURCE:'x-forwarded-for'}),'203.0.113.9');
assert.equal(gateway.forwardedFor(new Headers({'x-forwarded-for':'not-an-ip'}),{AUTH_CLIENT_IP_SOURCE:'x-forwarded-for'}),null);

// Limits and failures fail closed with the API's error shape.
assert.equal((await req('register',{body:'x'.repeat(9000)})).status,413);
const chunked=new Request(`${origin}/api/v1/auth/register`,{method:'POST',headers:{origin},body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array(5000));controller.enqueue(new Uint8Array(5000));controller.close();}}),duplex:'half'});
assert.equal((await gateway.forwardAuthRequest(chunked,'register',{env,fetchImpl:async()=>{throw new Error('oversized body must not be forwarded')}})).status,413);
response=await gateway.forwardAuthRequest(new Request(`${origin}/api/v1/auth/me`),'me',{env:{},fetchImpl:upstream(200)});
assert.equal(response.status,503);
response=await gateway.forwardAuthRequest(new Request(`${origin}/api/v1/auth/me`),'me',{env,fetchImpl:async()=>{throw new TypeError('connect ECONNREFUSED')}});
assert.equal(response.status,503);assert.equal((await response.json()).error.code,'service_unavailable');
response=await gateway.forwardAuthRequest(new Request(`${origin}/api/v1/auth/me`),'me',{env,fetchImpl:upstream(302,{headers:{location:'https://unexpected.example'}})});
assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);
response=await gateway.forwardAuthRequest(new Request(`${origin}/api/v1/auth/logout`,{method:'POST',headers:{origin}}),'logout',{env,fetchImpl:upstream(204)});
assert.equal(response.status,204);assert.equal(await response.text(),'');
response=await gateway.forwardAuthRequest(new Request(`${origin}/api/v1/auth/login`,{method:'POST',headers:{origin}}),'login',{env,fetchImpl:upstream(429,{headers:{'retry-after':'900'}})});
assert.equal(response.headers.get('retry-after'),'900');
console.log('PASS auth gateway: 4-endpoint allow-list, header allow-lists both ways, session-only cookies, no client IP unless declared, 413/503 fail closed.');
