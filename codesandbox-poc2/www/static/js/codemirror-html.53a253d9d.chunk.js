(this.csbJsonP=this.csbJsonP||[]).push([[19],{"../../node_modules/codemirror/mode/htmlmixed/htmlmixed.js":function(t,e,n){!function(t){"use strict";var e={script:[["lang",/(javascript|babel)/i,"javascript"],["type",/^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i,"javascript"],["type",/./,"text/plain"],[null,null,"javascript"]],style:[["lang",/^css$/i,"css"],["type",/^(text\/)?(x-)?(stylesheet|css)$/i,"css"],["type",/./,"text/plain"],[null,null,"css"]]},n={};function a(t,e){var a=t.match(function(t){var e=n[t];return e||(n[t]=new RegExp("\\s+"+t+"\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*"))}(e));return a?/^\s*(.*?)\s*$/.exec(a[2])[1]:""}function l(t,e){return new RegExp((e?"^":"")+"</s*"+t+"s*>","i")}function o(t,e){for(var n in t)for(var a=e[n]||(e[n]=[]),l=t[n],o=l.length-1;o>=0;o--)a.unshift(l[o])}t.defineMode("htmlmixed",(function(n,r){var c=t.getMode(n,{name:"xml",htmlMode:!0,multilineTagIndentFactor:r.multilineTagIndentFactor,multilineTagIndentPastTag:r.multilineTagIndentPastTag}),i={},s=r&&r.tags,u=r&&r.scriptTypes;if(o(e,i),s&&o(s,i),u)for(var m=u.length-1;m>=0;m--)i.script.unshift(["type",u[m].matches,u[m].mode]);function d(e,o){var r,s=c.token(e,o.htmlState),u=/\btag\b/.test(s);if(u&&!/[<>\s\/]/.test(e.current())&&(r=o.htmlState.tagName&&o.htmlState.tagName.toLowerCase())&&i.hasOwnProperty(r))o.inTag=r+" ";else if(o.inTag&&u&&/>$/.test(e.current())){var m=/^([\S]+) (.*)/.exec(o.inTag);o.inTag=null;var h=">"==e.current()&&function(t,e){for(var n=0;n<t.length;n++){var l=t[n];if(!l[0]||l[1].test(a(e,l[0])))return l[2]}}(i[m[1]],m[2]),g=t.getMode(n,h),p=l(m[1],!0),f=l(m[1],!1);o.token=function(t,e){return t.match(p,!1)?(e.token=d,e.localState=e.localMode=null,null):function(t,e,n){var a=t.current(),l=a.search(e);return l>-1?t.backUp(a.length-l):a.match(/<\/?$/)&&(t.backUp(a.length),t.match(e,!1)||t.match(a)),n}(t,f,e.localMode.token(t,e.localState))},o.localMode=g,o.localState=t.startState(g,c.indent(o.htmlState,""))}else o.inTag&&(o.inTag+=e.current(),e.eol()&&(o.inTag+=" "));return s}return{startState:function(){return{token:d,inTag:null,localMode:null,localState:null,htmlState:t.startState(c)}},copyState:function(e){var n;return e.localState&&(n=t.copyState(e.localMode,e.localState)),{token:e.token,inTag:e.inTag,localMode:e.localMode,localState:n,htmlState:t.copyState(c,e.htmlState)}},token:function(t,e){return e.token(t,e)},indent:function(e,n,a){return!e.localMode||/^\s*<\//.test(n)?c.indent(e.htmlState,n):e.localMode.indent?e.localMode.indent(e.localState,n,a):t.Pass},innerMode:function(t){return{state:t.localState||t.htmlState,mode:t.localMode||c}}}}),"xml","javascript","css"),t.defineMIME("text/html","htmlmixed")}(n("../../node_modules/codemirror/lib/codemirror.js"),n("../../node_modules/codemirror/mode/xml/xml.js"),n("../../node_modules/codemirror/mode/javascript/javascript.js"),n("../../node_modules/codemirror/mode/css/css.js"))}}]);
//# sourceMappingURL=codemirror-html.53a253d9d.chunk.js.map