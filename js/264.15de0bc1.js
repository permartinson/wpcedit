"use strict";(self["webpackChunkwpc_edit"]=self["webpackChunkwpc_edit"]||[]).push([[264],{8256:function(e,t,r){r.d(t,{Z:function(){return c}});var n=r(3396);const i={class:"dmd-container"},a={ref:"dmd",class:"dmd",width:"256",height:"64"};function s(e,t,r,s,d,o){return(0,n.wg)(),(0,n.iD)("div",i,[(0,n._)("canvas",a,null,512)])}var d={name:"ListDmd",props:{image:Uint8Array,index:Number},data(){return{isDrawn:!1}},methods:{drawImage(){const e=2,t=4096,r=this.$refs.dmd,n=r.getContext("2d");for(let i=0;i<t;i++){const t=i%128*e,r=Math.floor(i/128)*e,a=this.getDotValue(this.image,i);n.beginPath(),n.rect(t,r,e,e),n.fillStyle=`rgba(250, 136, 2, ${255*a})`,n.fill()}},getDotValue(e,t){const r=128,n=t%r,i=Math.floor(t/8),a=n%8,s=(255&e[i])>>a&1;return s}},mounted(){this.drawImage()}},o=r(89);const l=(0,o.Z)(d,[["render",s],["__scopeId","data-v-06fb11e9"]]);var c=l},8264:function(e,t,r){r.r(t),r.d(t,{default:function(){return m}});var n=r(3396);const i={class:"list-item-inner"};function a(e,t,r,a,s,d){const o=(0,n.up)("ListDmd");return(0,n.wg)(),(0,n.iD)("div",{class:"list-item-sprite",onClick:t[0]||(t[0]=t=>e.$emit("open",{index:r.index,tableIndex:r.tableIndex})),ref:"target"},[(0,n._)("div",i,[a.dmdIsVisible?((0,n.wg)(),(0,n.j4)(o,{key:0,index:r.index,table:r.tableIndex,image:r.image,worker:r.worker},null,8,["index","table","image","worker"])):(0,n.kq)("",!0)])],512)}var s=r(8256),d=r(466),o=r(4870),l={name:"SpriteItem",props:{image:Uint8Array,index:Number,tableIndex:Number,worker:Worker},components:{ListDmd:s.Z},data(){return{isDrawn:!1}},setup(){const e=(0,o.iH)(null),t=(0,o.iH)(!1);return(0,d.S1d)(e,(([{isIntersecting:e}])=>{0==t.value&&(t.value=e,stop())}),{rootMargin:"200px",threshold:0}),{target:e,dmdIsVisible:t}}},c=r(89);const u=(0,c.Z)(l,[["render",a],["__scopeId","data-v-5547145e"]]);var m=u}}]);
//# sourceMappingURL=264.15de0bc1.js.map