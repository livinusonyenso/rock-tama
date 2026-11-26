export function distributorDashboardJourneys(){
 const base={kind:"functional",page:"accountLogin",viewports:["mobile","desktop"]};
 const login=[{clearCookies:true},{navigate:"/account/login"},{waitFor:"document.querySelector('[data-demo-login]')?.disabled===false"},{type:{selector:"#auth-email",text:"demo@example.com"}},{type:{selector:"#auth-password",text:"anything-works"}},{click:"[data-demo-login]"},{waitFor:"location.pathname==='/account/dashboard' && !!document.querySelector('#dashboard-overview')"}];
 const panel=(section,id)=>[
  {click:`main nav[aria-label="Dashboard"] a[href="/account/dashboard/${section}"]`},
  {waitFor:`location.pathname==='/account/dashboard/${section}' && !!document.querySelector('#${id}')`},
 ];
 return [
 {...base,name:"dashboard-layout",selector:"main",viewports:["small","mobile","tablet","laptop","large","desktop"],actions:login,expect:[{name:"demo overview shows a responsive sidebar and exactly one panel",js:"document.querySelector('h1').textContent.includes('demo') && document.querySelectorAll('main nav[aria-label=Dashboard] a').length===4 && document.querySelectorAll('[data-dashboard-panel]').length===1 && !document.querySelector('#sample-orders,#account-profile') && document.querySelector('main').textContent.includes('No real account') && [...document.querySelectorAll('main a,main button')].filter(e=>e.checkVisibility()).every(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.left>=-1&&r.right<=innerWidth+1})"}]},
 {...base,name:"dashboard-refresh",actions:[...login,{navigate:"/account/dashboard/profile"},{waitFor:"!!document.querySelector('#account-profile')"},{navigate:"/account"},{waitFor:"location.pathname==='/account/dashboard'"},...panel("profile","account-profile")],expect:[{name:"demo cookie keeps profile after reload and routes account icon destination",js:"document.querySelector('#account-profile').textContent.includes('demo@example.com') && !document.cookie.includes('rocktama-distributor-demo')"}]},
 {...base,name:"dashboard-logout",actions:[...login,...panel("profile","account-profile"),{click:"main form button[type=submit]"},{waitFor:"location.pathname==='/account/login'"},{navigate:"/account/dashboard/profile"},{waitFor:"location.pathname==='/account/login'"}],expect:[{name:"logout clears preview session; direct dashboard visit returns to login",js:"!!document.querySelector('#auth-email') && !document.querySelector('#account-profile')"}]},
 {...base,name:"dashboard-sample-details",actions:[
  ...login,{evaluate:"window.demoSidebar=document.querySelector('main aside');true"},
  ...panel("orders","sample-orders"),{click:"#sample-orders summary"},
  {evaluate:"window.demoOrderOpened=document.querySelector('#sample-orders details').open && document.querySelector('#sample-orders details').textContent.includes('No payment, shipment or delivery');true"},
  ...panel("profile","account-profile"),
  {waitFor:"!document.querySelector('#sample-orders,#dashboard-overview')"},
  ...panel("orders","sample-orders"),
 ],expect:[{name:"sample orders render on their own route and reset when the panel is left",js:"window.demoOrderOpened && window.demoSidebar===document.querySelector('main aside') && document.querySelectorAll('#sample-orders li').length===3 && !document.querySelector('#sample-orders details').open && document.querySelectorAll('[data-dashboard-panel]').length===1"}]},
 {...base,name:"dashboard-basket",actions:[...login,{evaluate:"localStorage.setItem('rocktama.basket.v1',JSON.stringify([{variantId:'750-single',quantity:3}]));window.dispatchEvent(new Event('rocktama:basket'));true"},{waitFor:"document.querySelector('[data-dashboard-basket]').textContent==='3'"}],expect:[{name:"basket statistic uses actual browser selections",js:"document.querySelector('[data-dashboard-basket]').textContent==='3'"}]},
 {...base,name:"dashboard-any-credentials",actions:[{clearCookies:true},{navigate:"/account/login"},{waitFor:"document.querySelector('[data-demo-login]')?.disabled===false"},{type:{selector:"#auth-email",text:"different@example.net"}},{type:{selector:"#auth-password",text:"x"}},{click:"[data-demo-login]"},{waitFor:"location.pathname==='/account/dashboard' && !!document.querySelector('#dashboard-overview')"},...panel("profile","account-profile")],expect:[{name:"another email and one-character password also open the demo",js:"document.querySelector('#account-profile').textContent.includes('different@example.net')"}]},
 ];
}
