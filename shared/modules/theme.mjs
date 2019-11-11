// https://www.w3.org/wiki/Dynamic_style_-_manipulating_CSS_with_JavaScript

function changeStyleVariable(name, value){
    document.documentElement.style.setProperty('--' + name, value);
}

function theme({
    mainColor
}){
    console.log(`--- main color should be: ${mainColor}`);
    //changeStyleVariable('main-theme-color', mainColor);
    document.querySelector(':root').classList.add('dark-enabled');
}

export default theme;
