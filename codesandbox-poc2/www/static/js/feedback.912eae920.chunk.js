(this.csbJsonP=this.csbJsonP||[]).push([[28],{"./src/app/pages/common/Modals/FeedbackModal/Feedback.tsx":function(e,n,t){"use strict";t.r(n);var a=t("../../node_modules/@babel/runtime/regenerator/index.js"),r=t.n(a),o=t("../../node_modules/@babel/runtime/helpers/asyncToGenerator.js"),s=t.n(o),i=t("../../node_modules/@babel/runtime/helpers/slicedToArray.js"),c=t.n(i),u=t("../../node_modules/@babel/runtime/helpers/taggedTemplateLiteral.js"),d=t.n(u),l=t("../../node_modules/styled-components/dist/styled-components.browser.esm.js"),m=t("../@styled-system/css/dist/index.js"),p=t.n(m),b=t("../common/lib/version.js"),f=t.n(b),h=t("../common/lib/utils/keycodes.js"),w=t("./src/app/overmind/index.ts"),y=function(){var e=s()(r.a.mark((function e(n){var a,o,s,i,c,u,d,l,m;return r.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a=n.feedback,o=n.emoji,s=n.sandboxId,i=n.username,c=n.email,u=n.version,d=n.browser,e.next=3,Promise.all([t.e(49),t.e(15)]).then(t.bind(null,"./src/app/overmind/utils/setAirtable.ts"));case 3:return l=e.sent,m=l.default.base("appzdQFPct2p9gFZi"),e.abrupt("return",new Promise((function(e,n){m("feedback").create({feedback:a,emoji:o,sandboxId:s,username:i,email:c,url:window.location.pathname,version:u,browser:d},(function(t){t&&(console.error(t),n()),e()}))})));case 6:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),v=function(e){var n=e.feedback,t=e.sandboxId,a=e.username,r=e.email,o=e.version,s=e.browser;return fetch("https://s2973.sse.codesandbox.io/inbound-message",{method:"POST",body:JSON.stringify({name:a,email:r,body:n+"\n\nSandbox: https://codesandbox.io/s/"+t+"\nVersion: "+o+"\nBrowser: "+s}),headers:{"Content-Type":"application/json",Accept:"*/*"}})},g=t("../components/lib/index.js"),k=t("../../node_modules/react/index.js"),x=t.n(k),j=function(){var e=window.navigator.userAgent.toLowerCase();switch(!0){case e.includes("edge"):return"edge";case e.includes("edg"):return"chromium based edge (dev or canary)";case e.includes("opr")&&!!window.opr:return"opera";case e.includes("chrome")&&!!window.chrome:return"chrome";case e.includes("trident"):return"ie";case e.includes("firefox"):return"firefox";case e.includes("brave"):return"brave";case e.includes("safari"):return"safari";default:return"other"}},_=t("./src/app/pages/common/Modals/Common/Alert.tsx");function E(){var e=d()(["",""]);return E=function(){return e},e}function S(){var e=d()(["",""]);return S=function(){return e},e}function T(){var e=d()(["",""]);return T=function(){return e},e}t.d(n,"Feedback",(function(){return F}));var C=Object(l.default)(g.Button).withConfig({displayName:"Feedback___StyledButton",componentId:"sc-17hzsti-0"})(T(),(function(e){return e._css})),O=Object(l.default)(g.Button).withConfig({displayName:"Feedback___StyledButton2",componentId:"sc-17hzsti-1"})(S(),(function(e){return e._css2})),B=Object(l.default)(g.Button).withConfig({displayName:"Feedback___StyledButton3",componentId:"sc-17hzsti-2"})(E(),(function(e){return e._css3})),F=function(e){var n=e.id,t=e.user,a=Object(w.c)().actions,o=a.notificationAdded,i=a.modalClosed,u=Object(k.useState)((t||{}).email),d=c()(u,2),l=d[0],m=d[1],b=Object(k.useState)(null),E=c()(b,2),S=E[0],T=E[1],F=Object(k.useState)(""),I=c()(F,2),z=I[0],A=I[1],P=Object(k.useState)(!1),L=c()(P,2),N=L[0],J=L[1],M=function(e){e.keyCode===h.ESC&&i()};Object(k.useEffect)((function(){return window.addEventListener("keydown",M),function(){return window.removeEventListener("keydown",M)}}),[]);var q=function(e){({email:m,feedback:A}[e.target.name]||function(){})(e.target.value)},D=function(){var e=s()(r.a.mark((function e(a){var s;return r.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a.preventDefault(),s={sandboxId:n||"",feedback:z,emoji:S,username:(t||{}).username,email:l,version:f.a,browser:j()},J(!0),e.prev=3,e.next=6,y(s);case 6:return e.next=8,v(s);case 8:T(null),A(""),J(!1),i(),o({notificationType:"success",title:"Thanks for your feedback!"}),e.next=19;break;case 15:e.prev=15,e.t0=e.catch(3),o({notificationType:"error",title:"Something went wrong while sending feedback"}),J(!1);case 19:case"end":return e.stop()}}),e,null,[[3,15]])})));return function(n){return e.apply(this,arguments)}}();return x.a.createElement(_.a,{title:"Submit Feedback"},x.a.createElement(g.Element,{marginTop:4},x.a.createElement("form",{onSubmit:D},x.a.createElement(g.Textarea,{autosize:!0,minRows:3,name:"feedback",onChange:q,placeholder:"What are your thoughts?",required:!0,value:z}),!t&&x.a.createElement(g.Element,{marginTop:2,marginBottom:4},x.a.createElement(g.Input,{name:"email",onChange:q,placeholder:"Email if you wish to be contacted",type:"email",value:l})),x.a.createElement(g.Stack,{gap:2,align:"center",marginTop:2,marginBottom:4},x.a.createElement(C,{variant:"happy"===S?"primary":"secondary",onClick:function(){return T("happy")},_css:p()({width:"auto"})},x.a.createElement(g.Text,{size:4,as:"span","aria-label":"happy",role:"img"},"\ud83d\ude0a")),x.a.createElement(O,{variant:"sad"===S?"primary":"secondary",onClick:function(){return T("sad")},_css2:p()({width:"auto"})},x.a.createElement(g.Text,{size:4,as:"span","aria-label":"sad",role:"img"},"\ud83d\ude1e"))),x.a.createElement(g.Stack,{justify:"flex-end"},x.a.createElement(B,{type:"submit",disabled:N||!z.trim(),_css3:p()({width:"auto"})},N?"Sending...":"Submit")))))}}}]);
//# sourceMappingURL=feedback.912eae920.chunk.js.map