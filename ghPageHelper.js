window.ghPageHelper = (function () {

  //usage: appendChildLinks('#projects', 'crosshj', 'baseFolder') 
  function appendChildLinks(rootSelector, username, baseFolder) {
    const site = document.location.origin;
    const source = `https://github.com/${username}`;
    const root = document.location.pathname.split('/')[1];
    var folder = document.location.pathname.split(`/${root}/`)[1].replace(/\/$/,'');

    fetch(`https://api.github.com/repos/${username}/${root}/contents/${baseFolder ? `${baseFolder}/` : ''}${folder}?ref=gh-pages`)
      .then(res => res.json())
      .then(json => {
        console.table(json);

        const rootEl = document.querySelector(rootSelector);
        const header = document.createElement('h1');
        header.innerText = `${root}/${folder}`;
        rootEl.appendChild(header);
        var ul = document.createElement('ul');
        json
          .filter(x => x.type==='dir')
          .forEach(j => {
          const li = document.createElement('li');
          li.textContent = j.name;
          [{ source }, { site }].forEach(base => {
            const a = document.createElement('a');
            a.className = base.site ? 'demo' : 'source'
            a.href = `${base.site || base.source}/${root}/${base.source ? 'tree/gh-pages/' : ''}${j.path}`;
            a.textContent = base.site ? '[demo]' : '[source]';
            li.appendChild(a);
          });

          ul.appendChild(li);
        });
        rootEl.appendChild(ul);
      });

    // append CSS
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = `
      body {
        font-family: monospace;
        font-size: smaller;
      }
      
      #projects {
        width: 100%;
        margin: 0px auto;
      }
      
      #projects ul {
        list-style-type: none;
        padding-left: 0px;
      }
      
      #projects li {
        margin-bottom: 10px;
        padding-bottom: 5px;
        padding-left: 5px;
      }
      
      #projects li:hover {
        background-color: aquamarine;
        cursor: default;
      }
      
      #projects li a {
        float: right;
        margin: 0px 5px;
        text-decoration: none;
      }
      
      #projects li a:hover {
        background-color: black;
        color: white;
        text-decoration: none;
      }
      
      
      @media (min-width:320px) {
        /* smartphones, portrait iPhone, portrait 480x320 phones (Android) */
        #projects {
          font-size: small;
          width: 90%;
        }
      }
      @media (min-width:480px) {
        /* smartphones, Android phones, landscape iPhone */
        #projects {
          width: 70%;
          font-size: large;
        }
      }
      @media (min-width:600px) {
        /* portrait tablets, portrait iPad, e-readers (Nook/Kindle), landscape 800x480 phones (Android) */
        #projects {
          width: 60%;
        }
      }
      @media (min-width:801px) {
        /* tablet, landscape iPad, lo-res laptops ands desktops */
        #projects {
          width: 45%;
          font-size: larger;
        }
      }
      @media (min-width:1025px) { /* big landscape tablets, laptops, and desktops */ }
      @media (min-width:1281px) { /* hi-res laptops and desktops */ }
    `;
    document.body.appendChild(css);
  }

  var helper = { appendChildLinks };
  return helper;

}());
