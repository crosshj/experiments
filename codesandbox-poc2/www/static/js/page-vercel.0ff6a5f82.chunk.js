(this.csbJsonP=this.csbJsonP||[]).push([[43],{"./src/app/pages/PreviewAuth/index.tsx":function(e,n,t){"use strict";t.r(n);var o=t("../../node_modules/@babel/runtime/helpers/slicedToArray.js"),a=t.n(o),c=t("../../node_modules/react/index.js"),r=t.n(c),i=t("./src/app/overmind/index.ts"),s=t("../../node_modules/react-router/esm/react-router.js"),l=t("../common/lib/components/flex/Centered.js"),u=t.n(l),d=t("../common/lib/components/flex/Fullscreen.js"),m=t.n(d),p=t("../common/lib/utils/url-generator.js"),g=t("./src/app/components/Title.ts");n.default=Object(s.o)((function(e){var n=Object(i.c)(),t=n.state,o=n.actions.genericPageMounted,l=n.effects,d=r.a.useState(),b=a()(d,2),f=b[0],h=b[1];return Object(c.useEffect)((function(){o()}),[o]),Object(c.useEffect)((function(){if(t.hasLogIn){h(null);var n=e.match.params.id.split("-"),o=a()(n,2),c=o[0],r=o[1];l.api.getSandbox(c).then((function(e){var n=Object(p.frameUrl)(e,"",{port:r?Number.parseInt(r,10):void 0}),t=new URL(n).origin;window.addEventListener("message",(function n(o){o.data&&"request-preview-secret"===o.data.$type&&(o.source.postMessage({$type:"preview-secret",previewSecret:e.previewSecret},t),window.removeEventListener("message",n))}))})).catch((function(e){h("We couldn't find the sandbox")}))}}),[l.api,e.match.params.id,t.hasLogIn]),t.hasLogIn?r.a.createElement(m.a,{style:{height:"100vh"}},r.a.createElement(u.a,{horizontal:!0,vertical:!0},r.a.createElement(g.a,null,f?"Error: "+f:"Fetching Sandbox"))):r.a.createElement(s.c,{to:Object(p.signInPageUrl)(location.pathname)})}))},"./src/app/pages/VercelAuth/index.js":function(e,n,t){"use strict";t.r(n);var o=t("../../node_modules/@babel/runtime/helpers/slicedToArray.js"),a=t.n(o),c=t("../../node_modules/react/index.js"),r=t.n(c),i=t("../common/lib/components/flex/Centered.js"),s=t.n(i),l=t("../common/lib/utils/url-generator.js"),u=t("./src/app/components/Title.ts");n.default=function(){var e=Object(c.useState)(null),n=a()(e,2),t=n[0],o=n[1],i=Object(c.useState)(null),d=a()(i,1)[0],m=Object(c.useState)(null),p=a()(m,2),g=p[0],b=p[1];Object(c.useEffect)((function(){if(document.location.search.match(/\?code=(.*)/)){var e=document.location.search.match(/\?code=(.*)/),n=a()(e,2),t=(n[0],n[1]);return window.opener?void(window.opener.location.origin===window.location.origin&&window.opener.postMessage({type:"signin",data:{code:t}},Object(l.protocolAndHost)())):void o("/")}b("no message received")}),[]);return r.a.createElement(s.a,{horizontal:!0,vertical:!0},r.a.createElement(u.a,null,t?(document.location.href=Object(l.newSandboxUrl)(),"Redirecting to sandbox page"):g?"Something went wrong while signing in: ".concat(g):d?"Signing in...":null==d?(setTimeout((function(){document.location.href=Object(l.signInUrl)()}),2e3),"Redirecting to sign in page..."):"Hey"))}}}]);
//# sourceMappingURL=page-vercel.0ff6a5f82.chunk.js.map