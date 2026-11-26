// D-133: admin sign-in fails closed. Exercises the real modules with an injected environment; no server, no secrets.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import * as crypto from "node:crypto";
import ts from "typescript";
const load=(file,modules)=>{const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports,require:id=>{if(id in modules)return modules[id];throw new Error(`unexpected import ${id}`);},process:{env:{}},Buffer,Date,JSON});return exports;};
const demoAuth=load('lib/demo-auth.ts',{});
const token=load('lib/server/admin/session-token.ts',{'node:crypto':crypto,'@/lib/demo-auth':demoAuth});
const auth=load('lib/server/admin/auth.ts',{'server-only':{},'node:crypto':crypto,'next/headers':{},'next/server':{},'@/lib/demo-auth':demoAuth,'@/lib/server/admin/session-token':token});
const strong='x'.repeat(32), real={ADMIN_EMAIL:'Owner@Example.com',ADMIN_PASSWORD:'a long unique admin password'};
const cases=[
  ['next dev, nothing set → demo login',{},'demo'],
  ['next start, nothing set → unavailable',{NODE_ENV:'production'},null],
  ['Vercel staging without opt-in → unavailable',{NODE_ENV:'production',VERCEL_ENV:'production'},null],
  ['explicit DEMO_AUTH on a production server → demo login',{NODE_ENV:'production',DEMO_AUTH:'enabled'},'demo'],
  ['DEPLOY_MODE=production ignores DEMO_AUTH → unavailable',{NODE_ENV:'production',DEPLOY_MODE:'production',DEMO_AUTH:'enabled'},null],
  ['real credentials without a secret → unavailable (no public fallback)',{NODE_ENV:'production',...real},null],
  ['real credentials, secret too short → unavailable',{NODE_ENV:'production',...real,ADMIN_SESSION_SECRET:'short'},null],
  ['real credentials with only PAYSTACK/PAYMENT secrets → unavailable',{NODE_ENV:'production',...real,PAYSTACK_SECRET_KEY:'sk_live_x',PAYMENT_TOKEN_SECRET:strong},null],
  ['real credentials in dev with demo on but no secret → unavailable',{...real},null],
  ['real credentials with a 32+ character secret → real login',{NODE_ENV:'production',...real,ADMIN_SESSION_SECRET:strong},'real'],
];
for(const [name,env,expected] of cases){
  const credentials=auth.adminCredentials(env);
  assert.equal(credentials?(credentials.demo?'demo':'real'):null,expected,name);
  const secret=token.adminSessionSecret(env);
  if(expected===null) assert.equal(secret===null||!credentials,true,name);
  console.log(`  ok  ${name}`);
}
assert.equal(token.verifyAdminSession(token.signAdminSession('a@b.c','x'.repeat(32)),null),null,'no secret: every cookie is rejected');
assert.throws(()=>token.signAdminSession('a@b.c',null),/not configured/);
const signed=token.signAdminSession('a@b.c',strong);
assert.equal(token.verifyAdminSession(signed,strong).email,'a@b.c');
assert.equal(token.verifyAdminSession(signed,'rocktama-demo-admin-session'),null,'a cookie signed with the real secret is not accepted under the demo secret');
console.log('PASS admin sign-in fails closed: no demo login on production servers without opt-in, never under DEPLOY_MODE=production, and no secret fallbacks.');
