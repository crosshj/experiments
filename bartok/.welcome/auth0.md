<!-- no-select -->

Auth0 SPA authorization
=======================

- the goal is to get authorization working from client-only
- that much works, but IDP API calls still need a backend

<button id="login">Click to Login</button>

<pre id="user">user loading...</pre>
<pre id="repos">repos loading...</pre>
<pre id="files">files loading...</pre>

<style>
  .hidden { display: none; }
  #container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #login {
    background: transparent;
    font-size: 1em;
    color: inherit;
    padding: 10px 20px;
    border: 1px solid;
  }
  #login:hover {
    background: #666;
    color: white;
  }
</style>

<script>
  let auth0;
  const loginButton = document.getElementById('login');
  const userInfo = document.getElementById('user');
  const reposInfo = document.getElementById('repos');
  const filesInfo = document.getElementById('files');
  
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "https://cdn.auth0.com/js/auth0-spa-js/1.7/auth0-spa-js.production.js";
  s.onload = auth0AttachedCb;
  document.head.appendChild(s);
  
  const delay = time => new Promise(r=>setTimeout(r, time));
  
  async function User(){
    const user = await auth0.getUser();
    if(!user) {
      loginButton.style.display = "block";
      [userInfo, reposInfo, filesInfo]
        .forEach(x => x.classList.add('hidden'));
    }
    if(user){
      userInfo.innerHTML = JSON.stringify(user, null, 2);
    }
  }
  async function Repos(){
    await delay(1000);
    reposInfo.innerHTML = '[ repos from backend ]';
  }
  async function Files(){
    await delay(1000);
    filesInfo.innerHTML = '[ files from backend ]';
  }
  
  function auth0AttachedCb(){
    (async () => {
      loginButton.classList.add('hidden');
      try{
        auth0 = await createAuth0Client({
          domain: 'crosshj.auth0.com',
          client_id: 'LJ3RP61zaDixMQXCYMXAR54ahWHImW3p',
          redirect_uri: 'http://localhost:3000/bartok'
        });
        await User();
        await Repos();
        await Files();
      } catch(e){
        console.error(e);
      }

      loginButton
        .addEventListener('click', async (e) => {
          if(!auth0){ return console.log('no auth0 client'); }
          e.preventDefault();
          await auth0.loginWithPopup();
          //await auth0.loginWithRedirect({
          //  redirect_uri: 'http://localhost:3000/bartok'
          //})
          await User();
          await Repos();
          await Files();
        });

    })();
  }
</script>