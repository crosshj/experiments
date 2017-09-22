(function (){
var foo = window.open("about:blank", "newWindowName", null, false);

setTimeout(()=>{
	var deev = foo.document.createElement('div')
	deev.innerHTML=`
		<img alt="" class="avatar width-full rounded-0" height="230" src="https://avatars0.githubusercontent.com/u/1816471?v=4&amp;s=460" width="230">
		<p>This demo, the parent window drives</p>
	`;
	foo.document.body.appendChild(deev);
	foo.document.title = "drive-window-child";
},1);

var scree = foo.document.createElement('script');
scree.text=`
	var deev = document.createElement('div');
	deev.innerHTML=\`
		<img alt="" class="avatar width-full rounded-2" height="130" width="130" src="https://avatars0.githubusercontent.com/u/1816471?v=4&amp;s=460" width="230">
		<p>This demo, the parent window drives</p>
	\`;
	document.body.appendChild(deev);
	fetch(\`\${document.querySelectorAll('img')[0].src}\`)
		.then((res)=>{
			if(!res){ return console.log("res not defined"); }
			console.log("res: ", res);
		})
		.catch(err => console.log("some error", err))
`;
foo.document.body.appendChild(scree);

(new Array(10).fill())
	.map((x, i)=>{
		setTimeout(()=>{
			var n = foo.document.createElement('p');
			n.innerText=i + "  ---WOooo";
			foo.document.body.appendChild(n);
		},i*200)
	});
foo.focus();
})(); 
