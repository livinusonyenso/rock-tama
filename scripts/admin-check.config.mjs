/** Admin portal journeys (D-128): sign-in, protection, session, dashboard content and demo-data consistency. */
export function adminJourneys(){
 const base={kind:"functional",page:"admin-login",viewports:["mobile","desktop"]};
 const demo={email:"admin@rocktama.demo",password:"RockTama-Demo-2026"};
 const signOutFirst=[{clearCookies:true},{navigate:"/auth/admin"},{waitFor:"!!document.querySelector('form[aria-label=\"Admin sign in\"]')"}];
 const fill=(email,password)=>[{type:{selector:"#admin-email",text:email}},{type:{selector:"#admin-password",text:password}},{click:'form[aria-label="Admin sign in"] button[type="submit"]'}];
 const signIn=[...signOutFirst,...fill(demo.email,demo.password),{waitFor:"location.pathname==='/admin' && !!document.querySelector('[data-kpi]')"}];
 // Each journey gets its own client address so the sign-in rate limit (5 / 15 min per client) can't couple journeys.
 const own=list=>list.map((j,i)=>({...j,headers:{"x-forwarded-for":`198.51.101.${i+1}`}}));
 return own([
  {...base,name:"admin-protected",actions:[{clearCookies:true},{navigate:"/admin"},{waitFor:"location.pathname==='/auth/admin'"}],expect:[
   {name:"/admin without a session redirects to the sign-in page (no admin HTML served)",js:"location.pathname==='/auth/admin' && !document.querySelector('[data-kpi]')"},
   {name:"server answers /admin with a redirect, not a 200",server:async({baseUrl})=>{const r=await fetch(`${baseUrl}/admin`,{redirect:"manual"});return r.status>=300&&r.status<400&&(r.headers.get("location")??"").endsWith("/auth/admin")}},
   {name:"sign-in page: no storefront header/footer, demo login shown (staging/dev only), noindex",js:"!document.querySelector('body > header, body > footer, aside[aria-label=\"Store information\"]') && !!document.querySelector('[data-demo-login]') && document.querySelector('meta[name=robots]')?.content.includes('noindex')"},
  ]},
  {...base,name:"admin-login-wrong",actions:[...signOutFirst,...fill(demo.email,"not-the-password"),{waitFor:"!!document.querySelector('[role=alert]')"}],expect:[
   {name:"wrong password: one generic message, stays on sign-in, email kept",js:"/Incorrect email or password/.test(document.querySelector('[role=alert]').textContent) && location.pathname==='/auth/admin' && document.querySelector('#admin-email').value==='admin@rocktama.demo'"},
  ]},
  {...base,name:"admin-forged-cookie",actions:[{clearCookies:true},{evaluate:"document.cookie='rt_admin=eyJlbWFpbCI6ImEiLCJleHBpcmVzIjo5OTk5OTk5OTk5OTk5fQ.forged; path=/';true"},{navigate:"/admin"},{waitFor:"location.pathname==='/auth/admin'"}],expect:[
   {name:"a forged session cookie is rejected (redirected to sign-in)",js:"location.pathname==='/auth/admin'"},
  ]},
  {...base,name:"admin-dashboard",viewports:["mobile","tablet","desktop"],actions:[...signIn],expect:[
   {name:"full sidebar from 768px (tablet and desktop); compact strip only on phones (D-129)",js:"(()=>{const side=document.querySelector('aside[aria-label=\"Admin navigation\"]').checkVisibility();const strip=document.querySelector('nav[aria-label^=\"Admin navigation (compact)\"]').checkVisibility();return innerWidth>=768?(side&&!strip):(!side&&strip);})()"},
   {name:"demo login opens the dashboard; demo data is labelled; no storefront chrome",js:"/Demo data/.test(document.querySelector('[data-demo-notice]').textContent) && !document.querySelector('body > header, body > footer') && document.querySelector('h1').textContent==='Rock Tama Admin'"},
   {name:"design sections present: 5 KPIs, sales chart, 4 channels, 5 recent orders, 3 low-stock alerts, 3 top products, quick actions",js:"document.querySelectorAll('[data-kpi]').length===5 && !!document.querySelector('[data-sales-chart] svg') && document.querySelectorAll('[data-channel]').length===4 && document.querySelectorAll('[data-order]').length===5 && document.querySelectorAll('section[aria-labelledby=stock-heading] li').length===3 && document.querySelectorAll('[data-top-product]').length===3 && !!document.querySelector('#actions-heading')"},
   {name:"demo figures are internally consistent: total sales = chart total = top-product revenue; channel orders add up to total orders",js:"(()=>{const n=s=>Number(s.replace(/[^0-9]/g,''));const sales=n(document.querySelector('[data-kpi=sales] p:nth-of-type(2)').textContent);const chart=n(document.querySelector('[data-chart-total]').textContent);const top=[...document.querySelectorAll('[data-top-product] .font-serif')].reduce((a,e)=>a+n(e.textContent),0);const orders=n(document.querySelector('[data-kpi=orders] p:nth-of-type(2)').textContent);const ch=[...document.querySelectorAll('[data-channel]')].reduce((a,e)=>a+n(e.querySelector('title').textContent.split(':')[1].split('orders')[0]),0);return sales===chart && sales===top && ch===orders;})()"},
   {name:"only the dashboard is a link; unbuilt sections say Coming soon (no dead links)",js:"(()=>{const a=document.querySelector('aside[aria-label=\"Admin navigation\"]');return !a||(a.querySelectorAll('a').length===2 && a.querySelectorAll('[data-coming-soon]').length===8);})() && ![...document.querySelectorAll('main a')].some(l=>!l.getAttribute('href')||l.getAttribute('href')==='#')"},
  ]},
  {...base,name:"admin-chart-toggle",viewports:["desktop"],actions:[...signIn,{click:'[aria-label="Measure"] button:nth-child(2)'},{waitFor:"document.querySelector('[data-chart-total]').textContent==='1,248'"},{evaluate:"document.querySelector('[data-sales-chart] svg').scrollIntoView({block:'center',behavior:'instant'});true"},{evaluate:"(()=>{const r=document.querySelector('[data-sales-chart] svg').getBoundingClientRect();window.__pt={x:Math.round(r.left+r.width*0.5),y:Math.round(r.top+r.height*0.5)};return true})()"}],expect:[
   {name:"Orders toggle switches the single series (total 1,248 orders, one y-axis)",js:"document.querySelector('[aria-label=\"Measure\"] button:nth-child(2)').getAttribute('aria-pressed')==='true' && !/₦/.test([...document.querySelectorAll('[data-sales-chart] svg text')].map(t=>t.textContent).join(''))"},
  ]},
  {...base,name:"admin-chart-keyboard",viewports:["desktop"],actions:[...signIn,{evaluate:"document.querySelector('[data-sales-chart] svg').focus();true"},{press:"ArrowLeft"},{waitFor:"!!document.querySelector('[data-chart-tooltip]')"}],expect:[
   {name:"keyboard reads the chart: arrow key shows the day's value in a tooltip",js:"/29 Mar/.test(document.querySelector('[data-chart-tooltip]').textContent) && /₦/.test(document.querySelector('[data-chart-tooltip]').textContent)"},
  ]},
  {...base,name:"admin-logout",actions:[...signIn,{click:'form button[type="submit"]:has(svg)'},{waitFor:"location.pathname==='/auth/admin'"},{navigate:"/admin"},{waitFor:"location.pathname==='/auth/admin'"}],expect:[
   {name:"Log out ends the session: /admin redirects to sign-in again",js:"location.pathname==='/auth/admin' && !!document.querySelector('form[aria-label=\"Admin sign in\"]')"},
  ]},
  {...base,name:"admin-login-when-signed-in",actions:[...signIn,{navigate:"/auth/admin"},{waitFor:"location.pathname==='/admin'"}],expect:[
   {name:"opening the sign-in page while signed in goes straight to the dashboard",js:"location.pathname==='/admin' && !!document.querySelector('[data-kpi]')"},
  ]},
 ]);
}
