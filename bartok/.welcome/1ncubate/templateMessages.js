/*
when a template is loaded, it asks if there is a parent and says it is done loading
the parent can say yes and give it data which it can use to do whatever it wants
this speaks to the idea of template being used to serve "virtual" data that is provided it by some host

<iframe src="/{service}/.templates/d3-graph.html"></iframe>
(iframe will ask parent for the data)

the alternative:
create untracked file which will be handled by template then
<iframe src="/{service}/untracked?/example.json"></iframe>
*/
const deps = [
  '../shared.styl'
];

const createIframe = (url) => {
  return new Promise((resolve, reject) => {
    const ifrmContainer = document.createElement('div');
    ifrmContainer.classList.add("loading");
    ifrmContainer.classList.add('iframe-container');

    const ifrm = document.createElement('iframe');
    const id = Math.random().toString().replace('.', '');
    ifrm.setAttribute('id', id);
    ifrm.setAttribute('src', url);
    ifrm.addEventListener("load", function(e){
      var that = this;
      try {
        if(!ifrm.contentDocument) throw new Error('iframe fail');
        //ack message the iframe before removing the loading
        //ifrmContainer.classList.remove('loading');
      } catch(err) {
        console.trace(err);
        ifrmContainer.classList.remove('loading');
        ifrmContainer.classList.add('error');
      }
    });
    ifrm.addEventListener("error", () => {
      console.log('error');
    });

    ifrmContainer.appendChild(ifrm)
    document.body.appendChild(ifrmContainer);
    resolve(ifrmContainer);
  });
};

const recieveMessage = (timeout=10000) => {
  return new Promise((resolve, reject) => {
    const listener = (event) => {
      window.removeEventListener("message", listener);
      resolve(event.data);
    };
    window.addEventListener("message", listener, false);
    setTimeout(() => {
      window.removeEventListener("message", listener);
      reject('receive message timed out');
    }, timeout);
  });
};

const createGraph = async (graphObject) => {
  const graph = await createIframe('../.templates/d3-graph.html/::preview::/?message=true&chrome=false');
  graph.style.width = '100%'
  graph.style.height =  "32em";

  console.info('TODO: graph should refresh on resize and basic config options should/could be provided');
  try {
    message = await recieveMessage();
    graph.querySelector('iframe').contentWindow.postMessage(graphObject, "*");
    (async()=>{
      await delay(500);
      graph.classList.remove('loading');
    })()
  } catch(e){
    message = e;
  }
  return graph;
}

(async() => {
  await appendUrls(deps);
  const exampleGraph = {
    nodes: [
      {id: 'foo',   name:"foo",    radius:20,  color: "red",    fx: 340, fy: 60},
      {id: 'bar',   name:"bar",    radius:20,  color: "white",  fx: 300, fy: 180},
      {id: 'baz',   name:"baz",    radius:20,  color: "black",  fx: 400, fy: 250},
      {id: 'blank', name:"ittie",       radius:10,  color: "green",  fx: 540, fy: 180},
      {id: 'big',   name:"biggie", radius:100, color: "yellow", fx: 600, fy: 360},
    ],
    links: [
      {source:'foo',target:'bar',weight:1},
      {source:'bar',target:'baz',weight:1},
    ]
  };
  // ^^^ why can't JSON.stringify output json that looks JUST like this?? [irritating]
  const graph = await createGraph(exampleGraph);
  await prism('json', JSON.stringify(exampleGraph));
})()
