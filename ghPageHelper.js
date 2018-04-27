window.ghPageHelper = (function () {

  function rejectStatusError(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }  

  //https://stackoverflow.com/a/16427747
  function lsTest() {
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  //https://stackoverflow.com/a/7616484
  function hashCode(stringToHash = '') {
    var hash = 0, i, chr;
    if (stringToHash.length === 0) return hash;
    for (i = 0; i < stringToHash.length; i++) {
      chr = stringToHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  //adapted from: https://www.sitepoint.com/cache-fetched-ajax-requests/
  const fetchCached = (url, options = {}) => {
    if (!lsTest()) {
      return fetch(url, options);
    }

    const expiry = typeof options.expireSeconds === 'number'
      ? options.expireSeconds
      : 5 * 60; // 5 min default

    const cacheKey = url;
    const cached = localStorage.getItem(cacheKey);
    // TODO: maybe add when cached to item itself to make viewing easier
    const whenCached = localStorage.getItem(cacheKey + ':ts');
    const cacheToken = localStorage.getItem('session_hash');

    let age = whenCached
      ? (Date.now() - whenCached) / 1000
      : expiry;

    if (cached && age < expiry) {
      let response = new Response(new Blob([cached]));
      return Promise.resolve(response);
    }

    localStorage.removeItem(cacheKey);
    localStorage.removeItem(cacheKey + ':ts');

    const fetchPromise = fetch(url, options)
      .then(rejectStatusError)
      .then(response => {
        let ct = response.headers.get('Content-Type');
        // only cache text and json
        if (!ct || !(ct.match(/application\/json/i) || ct.match(/text\//i))) {
          return response;
        }
        response.clone().text()
          .then(content => {
            //TODO: don't cache when response has json.error in body?
            localStorage.setItem(cacheKey, content);
            localStorage.setItem(cacheKey + ':ts', Date.now());
          });
        return response;
      });
    /*
      NOTE: perhaps this promise could be saved and given to subsequent and immediate
      fetch's of same url  as a form of debounce?
    */
    return fetchPromise;
  };
  
  
  //usage: appendChildLinks('#projects', 'crosshj', 'baseFolder') 
  function appendChildLinks(rootSelector, username, baseFolder) {
    const site = document.location.origin;
    const source = `https://github.com/${username}`;
    const root = document.location.pathname.split('/')[1];
    var folder = document.location.pathname.split(`/${root}/`)[1].replace(/\/$/,'');

    fetchCached(`https://api.github.com/repos/${username}/${root}/contents/${baseFolder ? `${baseFolder}/` : ''}${folder}?ref=gh-pages`)
      .then(res => res.json())
      .then(json => {
        console.table(json);

        const rootEl = document.querySelector(rootSelector);
        const header = document.createElement('h1');
        header.innerText = `${root}/${folder}`;
        rootEl.appendChild(header);
        var ul = document.createElement('ul');
        json
          .filter(x => x.type==='dir' && x.name !== '_layouts' && x.name !== 'assets')
          .forEach(j => {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.textContent = j.name;
          li.appendChild(span);
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

      a.source {
          display: none;
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
    // ^^^ fix this, may not need
    css.innerHTML = `
      li > span {
          min-width: 175px;
          display: inline-block;
      }
    `;
    document.body.appendChild(css);
  }

  var helper = { appendChildLinks };
  return helper;

}());
