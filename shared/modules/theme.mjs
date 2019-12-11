// https://www.w3.org/wiki/Dynamic_style_-_manipulating_CSS_with_JavaScript

const safeFn = (fn, fallback) => {
	try{
		return fn();
	} catch(e) {
		return fallback;
	}
};

var metaThemeColorEl = document.querySelector("meta[name=theme-color]");

const lightColor = safeFn(() =>
	document.querySelector("meta[name=light-theme-color]").content,
	metaThemeColorEl.content || 'white'
);
const darkColor = safeFn(() =>
	document.querySelector("meta[name=dark-theme-color]").content,
	metaThemeColorEl.content || '#363238'
);


function changeStyleVariable(name, value){
    document.documentElement.style.setProperty('--' + name, value);
}

function toggleDark(){
    var _themeColor;
    const darkEnabled = window.localStorage.getItem('themeDark') === "true";
    window.localStorage.setItem('themeDark', !darkEnabled);
    const loadingScreenEl = document.getElementById('loading-screen');
    if(loadingScreenEl){

        loadingScreenEl.classList.remove('hidden');
        document.body.style.overflow = "hidden";
        loadingScreenEl.style.background = !darkEnabled ? "#363238" : "white";
        //loadingScreenEl.style.color = "white";
        //loadingScreenEl.style.fill = "white";
    }

    setTimeout(() => {
        if(!darkEnabled){
            window.Editor && window.Editor.setOption("theme", "bespin");
            window.Editor && window.Editor.setOption("mode", "javascript");
            document.body.style.backgroundColor = "#363238";
            document.querySelector(":root").classList.add("dark-enabled");
            _themeColor = darkColor;
        } else {
            window.Editor && window.Editor.setOption("theme", "default");
            document.body.style.backgroundColor = "white";
            document.querySelector(":root").classList.remove("dark-enabled");
            _themeColor = lightColor;
        }
        metaThemeColorEl.setAttribute("content", _themeColor);

        setTimeout(() => {
            document.body.style.overflow = "auto";
            if(loadingScreenEl){
                loadingScreenEl.classList.add('hidden');
                loadingScreenEl.style.background = undefined;
                //loadingScreenEl.style.color = undefined;
                //loadingScreenEl.style.fill = undefined;
            }
        }, 1000);

    }, 500);

}

function theme({
    themeColor
} = {}){
    var _themeColor;

    //const preferDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    //TODO: use this if themeDark is undefined ^^^
    const darkEnabled = window.localStorage.getItem('themeDark') === "true";

    if(darkEnabled){
        window.Editor && window.Editor.setOption("theme", "bespin");
        document.body.style.backgroundColor = "#363238";
        document.querySelector(":root").classList.add("dark-enabled");
        _themeColor = darkColor;
    } else {
        window.Editor && window.Editor.setOption("theme", "");
        _themeColor = lightColor;
    }

    metaThemeColorEl.setAttribute("content", _themeColor);
    console.log(`--- main color should be: ${_themeColor}`);
    //changeStyleVariable('main-theme-color', mainColor);


    return {
        toggleDark
    }
}

export default theme;
