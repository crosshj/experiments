import Loading from '../../shared/modules/loading.mjs';

function getHtml(callback){
    fetch('./app.html')
        .then(r => r.text())
        .then(htmlText => {
            document.body.innerHTML += htmlText;
            callback();
        })
}

function AppDom(callback){
    Loading(() => {
        getHtml(() => {
            callback();
        });
    });
}

export default AppDom;
