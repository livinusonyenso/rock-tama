/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS is required to install the TypeScript config loading hook. */
// Exercise the actual Next config without building/deploying or sending enquiries.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
const config = require(path.join(root, 'next.config.ts')).default;
const { claims } = require(path.join(root, 'content/claims.ts'));
const launch = require(path.join(root, 'content/launch.ts'));
const { PHASE_PRODUCTION_BUILD } = require('next/constants');
const keys = ['VERCEL_ENV','DEPLOY_MODE','ENQUIRY_DELIVERY','RESEND_API_KEY','ENQUIRY_TO','ENQUIRY_FROM','PAYSTACK_SECRET_KEY','ADMIN_EMAIL','ADMIN_PASSWORD','ADMIN_SESSION_SECRET'];
const originalEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
const originalStatuses = Object.fromEntries(Object.entries(claims).map(([key, value]) => [key, value.status]));
const originalWarn = console.warn;
const originalLaunchPlaceholders = launch.launchPlaceholders;
launch.launchPlaceholders = () => ['test launch placeholder'];
const warnings = [];
console.warn = message => warnings.push(message);
const reset = () => { for (const key of keys) delete process.env[key]; process.env.VERCEL_ENV = 'production'; warnings.length = 0; };
(async () => {
  try {
    reset();
    const automatic = config(PHASE_PRODUCTION_BUILD);
    for (const issue of [/enquiry delivery/, /lack evidence/, /placeholder content/, /online payments/, /admin portal/]) {
      assert(warnings.some(message => issue.test(message)), `Expected staging warning for ${issue}`);
    }
    assert.match((await automatic.headers())[0].headers[0].value, /noindex/);
    reset(); process.env.DEPLOY_MODE = 'staging';
    assert.equal(typeof config(PHASE_PRODUCTION_BUILD).headers, 'function');
    reset(); process.env.DEPLOY_MODE = 'production';
    assert.throws(() => config(PHASE_PRODUCTION_BUILD), /enquiry delivery is not configured/);
    Object.assign(process.env, { ENQUIRY_DELIVERY: 'resend', RESEND_API_KEY: 'test-only', ENQUIRY_TO: 'test@example.com', ENQUIRY_FROM: 'test@example.com' });
    assert.throws(() => config(PHASE_PRODUCTION_BUILD), /claim\(s\) lack evidence/);
    // In-memory test fixture only; no real claim files/statuses are changed.
    for (const claim of Object.values(claims)) claim.status = 'verified';
    assert.throws(() => config(PHASE_PRODUCTION_BUILD), /placeholder content still present/);
    launch.launchPlaceholders = () => [];
    assert.throws(() => config(PHASE_PRODUCTION_BUILD), /online payments are not live/);
    process.env.PAYSTACK_SECRET_KEY = 'sk_live_fixture';
    assert.throws(() => config(PHASE_PRODUCTION_BUILD), /admin portal not secured/);
    Object.assign(process.env, { ADMIN_EMAIL: 'admin@example.com', ADMIN_PASSWORD: 'fixture', ADMIN_SESSION_SECRET: 'fixture' });
    assert.equal(config(PHASE_PRODUCTION_BUILD).headers, undefined);
    delete process.env.DEPLOY_MODE;
    assert.equal(config(PHASE_PRODUCTION_BUILD).headers, undefined);
    console.log('PASS: staging warnings and noindex, all five strict launch gates, and indexing for a ready launch.');
  } finally {
    console.warn = originalWarn;
    launch.launchPlaceholders = originalLaunchPlaceholders;
    for (const key of keys) { if (originalEnv[key] === undefined) delete process.env[key]; else process.env[key] = originalEnv[key]; }
    for (const [key, status] of Object.entries(originalStatuses)) claims[key].status = status;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
