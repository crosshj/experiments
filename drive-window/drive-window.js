
var foo = window.open("about:blank", "_blank");

var pee = foo.document.createElement('p')
pee.innerText="This demo, the parent window drives";
foo.document.body.appendChild(pee);

var scree = foo.document.createElement('script');
scree.text=`
	fetch("${document.querySelectorAll('img')[0].src}")
		.then((res)=>{
			if(!res){ return console.log("res not defined"); }
			console.log("res: ", res);
		})
		.catch(err => console.log("some error", err))
`;
foo.document.body.appendChild(scree);

(new Array(100).fill())
	.map((x, i)=>{
		setTimeout(()=>{
			var n = foo.document.createElement('p');
			n.innerText=i + "  ---WOooo";
			foo.document.body.appendChild(n);
		},i*200)
	});
foo.focus();
