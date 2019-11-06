function changeStyleVariable(name, value){
    document.documentElement.style.setProperty('--' + name, value);
}

function theme({
    mainColor
}){
    console.log(`--- main color should be: ${mainColor}`);
    changeStyleVariable('main-theme-color', mainColor);
}

export default theme;
