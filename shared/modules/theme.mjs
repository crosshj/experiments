// https://www.w3.org/wiki/Dynamic_style_-_manipulating_CSS_with_JavaScript

var metaThemeColorEl = document.querySelector("meta[name=theme-color]");

const lightColor = document.querySelector("meta[name=light-theme-color]").content;
const darkColor = document.querySelector("meta[name=dark-theme-color]").content;


function changeStyleVariable(name, value){
    document.documentElement.style.setProperty('--' + name, value);
}

function toggleDark(){
    var _themeColor;
    const darkEnabled = window.localStorage.getItem('themeDark') === "true";
    window.localStorage.setItem('themeDark', !darkEnabled);


    if(!darkEnabled){
        document.body.style.backgroundColor = "#363238";
        document.querySelector(":root").classList.add("dark-enabled");
        _themeColor = darkColor;
    } else {
        document.body.style.backgroundColor = "white";
        document.querySelector(":root").classList.remove("dark-enabled");
        _themeColor = lightColor;
    }
    metaThemeColorEl.setAttribute("content", _themeColor);
}

function theme({
    themeColor
} = {}){
    var _themeColor;

    //const preferDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    //TODO: use this if themeDark is undefined ^^^
    const darkEnabled = window.localStorage.getItem('themeDark') === "true";

    if(darkEnabled){
        document.body.style.backgroundColor = "#363238";
        document.querySelector(":root").classList.add("dark-enabled");
        _themeColor = darkColor;
    } else {
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
