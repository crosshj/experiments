/*
  https://developer.chrome.com/apps/offline_storage#managing_quota

  https://demo.agektmr.com/storage/


  https://gist.github.com/wilsonpage/01d2eb139959c79e0d9a
  https://localforage.github.io/localForage/


  https://love2dev.com/blog/what-is-the-service-worker-cache-storage-limit/
  https://blog.teamtreehouse.com/building-an-html5-text-editor-with-the-filesystem-apis

*/



// query
let queryCallback = (used, granted) => 
  console.log('we are using', used, 'bytes of', granted/1024/1024/1024, 'gigabytes');
navigator.webkitTemporaryStorage
  .queryUsageAndQuota( queryCallback, console.error );




// query Storage API
if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate()
    .then(function(estimate){
        console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes.`);
    });
}


// requestQuota - probably does not work on temporary storage
let newQuotaInBytes = 1e+7;
let quotaCallback = console.log;
let errorCallback = console.error;
navigator.webkitTemporaryStorage
  .requestQuota(newQuotaInBytes,quotaCallback,errorCallback);