if(!self.define){let i,e={};const l=(l,s)=>(l=new URL(l+".js",s).href,e[l]||new Promise((e=>{if("document"in self){const i=document.createElement("script");i.src=l,i.onload=e,document.head.appendChild(i)}else i=l,importScripts(l),e()})).then((()=>{let i=e[l];if(!i)throw new Error(`Module ${l} didn’t register its module`);return i})));self.define=(s,r)=>{const n=i||("document"in self?document.currentScript.src:"")||location.href;if(e[n])return;let c={};const u=i=>l(i,n),d={module:{uri:n},exports:c,require:u};e[n]=Promise.all(s.map((i=>d[i]||u(i)))).then((i=>(r(...i),c)))}}define(["./workbox-881009fd"],(function(i){"use strict";i.setCacheNameDetails({prefix:"wpc-edit"}),self.addEventListener("message",(i=>{i.data&&"SKIP_WAITING"===i.data.type&&self.skipWaiting()})),i.precacheAndRoute([{url:"/wpcedit/css/264.a002cfb3.css",revision:null},{url:"/wpcedit/css/57.0b045f02.css",revision:null},{url:"/wpcedit/css/app.5cdf9c4e.css",revision:null},{url:"/wpcedit/img/0.366423c7.svg",revision:null},{url:"/wpcedit/img/1.6644a630.svg",revision:null},{url:"/wpcedit/img/2.cecd72cf.svg",revision:null},{url:"/wpcedit/img/3.b4455c5b.svg",revision:null},{url:"/wpcedit/img/check.30560711.svg",revision:null},{url:"/wpcedit/img/checksum.278f9eb3.svg",revision:null},{url:"/wpcedit/img/close.c0d2b892.svg",revision:null},{url:"/wpcedit/img/close.e12385bf.svg",revision:null},{url:"/wpcedit/img/double-left.ac39994b.svg",revision:null},{url:"/wpcedit/img/double-right.24962106.svg",revision:null},{url:"/wpcedit/img/down.18d69707.svg",revision:null},{url:"/wpcedit/img/down.e4c7276a.svg",revision:null},{url:"/wpcedit/img/file-drop-arrow.38932680.svg",revision:null},{url:"/wpcedit/img/file-drop-bg.14f5f094.svg",revision:null},{url:"/wpcedit/img/file-drop-decoration.55d2d00c.svg",revision:null},{url:"/wpcedit/img/file-drop-plate.59ab7446.svg",revision:null},{url:"/wpcedit/img/fullframe.81ab3349.svg",revision:null},{url:"/wpcedit/img/hex.a0766c7a.svg",revision:null},{url:"/wpcedit/img/info.9c44e9ad.svg",revision:null},{url:"/wpcedit/img/left.90125b7d.svg",revision:null},{url:"/wpcedit/img/left.e8735363.svg",revision:null},{url:"/wpcedit/img/right.130dfca3.svg",revision:null},{url:"/wpcedit/img/right.23c38753.svg",revision:null},{url:"/wpcedit/img/settings.a2c48285.svg",revision:null},{url:"/wpcedit/img/sprites.7f6e2b2d.svg",revision:null},{url:"/wpcedit/img/up.86d23f2d.svg",revision:null},{url:"/wpcedit/img/up.f6cb93cd.svg",revision:null},{url:"/wpcedit/img/warning2.3422025f.svg",revision:null},{url:"/wpcedit/index.html",revision:"01719cdcd1679dde7292681fe6351a07"},{url:"/wpcedit/js/264.10fb16b8.js",revision:null},{url:"/wpcedit/js/57.a3925071.js",revision:null},{url:"/wpcedit/js/app.2a3473d5.js",revision:null},{url:"/wpcedit/js/chunk-vendors.b478531f.js",revision:null},{url:"/wpcedit/manifest.json",revision:"6a2fbeca2698b871a6c875bb857ba070"},{url:"/wpcedit/robots.txt",revision:"b6216d61c03e6ce0c9aea6ca7808f7ca"}],{})}));
//# sourceMappingURL=service-worker.js.map
