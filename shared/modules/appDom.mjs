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
    Loading((loadingError, loading) => {
        getHtml((domError, dom) => {
            callback(null, {
                loading, dom,
                error: {
                    loading: loadingError,
                    dom: domError
                }
            });
        });
    });
}

export default AppDom;
