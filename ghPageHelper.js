window.ghPageHelper = (function () {

  //usage: appendChildLinks('#projects', 'crosshj', 'baseFolder') 
  function appendChildLinks(rootSelector, username, baseFolder) {
    const site = document.location.origin;
    const source = `https://github.com/${username}`;
    const root = document.location.pathname;

    fetch(`https://api.github.com/repos/${username}${root}contents${baseFolder ? `/${baseFolder}` : ''}?ref=gh-pages`)
      .then(res => res.json())
      .then(json => {
        console.table(json);

        const rootEl = document.querySelector(rootSelector);
        var ul = document.createElement('ul');
        json
          .filter(x => x.type==='dir')
          .forEach(j => {
          const li = document.createElement('li');
          li.textContent = j.name;
          [{ source }, { site }].forEach(base => {
            const a = document.createElement('a');
            a.className = base.site ? 'demo' : 'source'
            a.href = 'https://' + (base.site || base.source) + root + (base.source ? 'tree/gh-pages/' : '') + j.path;
            a.textContent = base.site ? '[demo]' : '[source]';
            li.appendChild(a);
          });

          ul.appendChild(li);
        });
        rootEl.appendChild(ul);
      })
  }

  var helper = { appendChildLinks };
  return helper;

}());