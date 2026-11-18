import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import {z} from "zod";
const files=new Map(),emails=[];let responseOk=true,merchantOk=true,merchantCalls=0;
const config={kind:"resend",apiKey:"mock",baseUrl:"https://mock.test",from:"orders@example.com",to:["owner@example.com"]};
function load(file,imports){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:name=>{if(name in imports)return imports[name];throw Error(`Unexpected import ${name}`)},Date,Buffer,AbortSignal,console:{error:()=>{}},fetch:async(url,init)=>{emails.push({url,...init,body:JSON.parse(init.body)});return {ok:responseOk,status:responseOk?200:503}}});return exports;}
const naira=n=>`₦${(n/100).toFixed(2)}`;
const content=load('lib/server/payments/receipt-content.ts',{'server-only':{},'./order':{naira}});
const pdf=load('lib/server/payments/receipt-pdf.ts',{'server-only':{},'./receipt-content':content});
const receipt=load('lib/server/payments/receipt.ts',{'server-only':{},'node:fs/promises':{mkdir:async()=>{},writeFile:async(file,data)=>{if(files.has(file))throw Object.assign(Error(),{code:'EEXIST'});files.set(file,data)}},'node:path':path,zod:{z},'./receipt-content':content,'./receipt-pdf':pdf});
const metadata={customer:{name:'Buyer <script>alert(1)</script>',email:'buyer@example.com',phone:'+2348031234567',address:'12 Test Street',city:'Enugu',state:'Enugu',notes:''},lines:[{variantId:'750-single',quantity:2}],orderRef:'RT-ORD-20261118-ABCDEF'};
const basket={lines:[{variantId:'750-single',quantity:2,label:'Single bottle',detail:'750 ml',lineKobo:130000}],totalKobo:130000,unpriced:[]};
const payment={status:'paid',reference:'RT-PAY-20261118-ABCDEFGH',amountKobo:130000,channel:'card',test:false,paidAt:'2026-11-18T10:00:00Z',metadata,basket};
const formatted=receipt.paymentReceipt(payment);assert.equal(formatted.to[0],'buyer@example.com');assert(formatted.text.includes('1300.00'));assert(formatted.text.includes(payment.reference));assert(!formatted.html.includes('<script>'));assert(formatted.html.includes('&lt;script&gt;'));
assert((await receipt.deliverPaymentReceipt(payment,config)).ok);assert.equal(emails.at(-1).headers['Idempotency-Key'],`payment-receipt/${payment.reference}`);assert.deepEqual(emails.at(-1).body.to[0],'buyer@example.com');assert.equal(emails.at(-1).body.from,'orders@example.com');assert(Buffer.from(emails.at(-1).body.attachments[0].content,"base64").equals(pdf.receiptPdf(payment)));assert.equal(Buffer.from(emails.at(-1).body.attachments[0].content,"base64").subarray(0,8).toString(),"%PDF-1.4");
await receipt.deliverPaymentReceipt(payment,config);assert.equal(JSON.stringify(emails[0].body),JSON.stringify(emails[1].body));
const test=receipt.paymentReceipt({...payment,test:true});assert(test.subject.startsWith('TEST'));assert(test.text.includes('no money was charged'));assert(test.html.includes('not proof of payment'));
assert.equal((await receipt.deliverPaymentReceipt({...payment,status:'pending'},config)).ok,false);
assert.equal((await receipt.deliverPaymentReceipt(payment,{kind:'unconfigured'})).ok,false);
responseOk=false;assert.equal((await receipt.deliverPaymentReceipt(payment,config)).ok,false);responseOk=true;
const dev={kind:'dev-file',path:'/tmp/demo/enquiries.jsonl'};assert((await receipt.deliverPaymentReceipt(payment,dev)).ok);assert((await receipt.deliverPaymentReceipt(payment,dev)).ok);assert.equal(files.size,1);
const complete=load('lib/server/payments/complete.ts',{'server-only':{},'@/lib/server/payments/order':{basketSchema:{safeParse:()=>({success:true})},naira,priceBasket:()=>basket},'@/lib/server/payments/config':{getPaymentConfig:()=>({kind:'unavailable'})},'@/lib/server/payments/paystack':{verifyTransaction:async()=>{}},'@/lib/server/payments/test-gateway':{readTestToken:()=>null},'@/lib/server/enquiries/deliver':{deliverEnquiry:async()=>{merchantCalls++;await Promise.resolve();return merchantOk?{ok:true}:{ok:false,reason:'mock failure'}}},'@/lib/server/env':{getDeliveryConfig:()=>config},'@/lib/enquiry':{MIXED_PRODUCTS:'mixed'},'@/content/commerce':{variantById:()=>({product:'750ml-glass-bottle',unit:'bottles',bottles:1})},'@/lib/server/payments/receipt':receipt});
const before=emails.length;
assert.deepEqual(await Promise.all([complete.notifyPaidOrder(payment),complete.notifyPaidOrder(payment)]),[true,true]);assert.equal(merchantCalls,1);assert.equal(emails.length,before+1);await complete.notifyPaidOrder(payment);assert.equal(emails.length,before+1);
const retry={...payment,reference:'RT-PAY-20261118-ABCDEFGI'};responseOk=false;assert.equal(await complete.notifyPaidOrder(retry),false);const merchantBefore=merchantCalls;responseOk=true;assert.equal(await complete.notifyPaidOrder(retry),true);assert.equal(merchantCalls,merchantBefore);
const retryMerchant={...payment,reference:'RT-PAY-20261118-ABCDEFGJ'};merchantOk=false;assert.equal(await complete.notifyPaidOrder(retryMerchant),false);const emailBefore=emails.length;merchantOk=true;assert.equal(await complete.notifyPaidOrder(retryMerchant),true);assert.equal(emails.length,emailBefore);
const calls=emails.length;assert.equal(await complete.notifyPaidOrder({...payment,status:'failed'}),false);assert.equal(emails.length,calls);
console.log('PASS customer recipient, itemisation/amount, HTML escaping, test labels, stable idempotency payload, local preview, provider failure, concurrent confirmations, independent channel retries and no failed/pending receipts (mock delivery only).');

mkdirSync("docs/verification/payment-receipts",{recursive:true});
writeFileSync("docs/verification/payment-receipts/receipt-preview.html",receipt.paymentReceipt({...payment,metadata:{...metadata,customer:{...metadata.customer,name:"Demo Customer"}}}).html);

const previewPdf=pdf.receiptPdf({...payment,metadata:{...metadata,customer:{...metadata.customer,name:"Demo Customer"}}});
assert(previewPdf.includes(Buffer.from("NGN 1300.00")));
mkdirSync("docs/verification/receipt-download-prefill",{recursive:true});
writeFileSync("docs/verification/receipt-download-prefill/receipt-download.pdf",previewPdf);
