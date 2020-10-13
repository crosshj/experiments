/*
https://stackoverflow.com/questions/490908/paste-an-image-from-clipboard-using-javascript/4400761
https://stackoverflow.com/questions/8578136/how-to-read-a-file-on-paste-event-in-html5

# arrange/pack images
https://github.com/jakesgordon/bin-packing

# metadata
# EXIF
https://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/
https://github.com/exif-js/exif-js
# steganography
https://github.com/petereigenschink/steganography.js/
*/
const pretty = async (thing) => await prism('javascript', JSON.stringify(thing, null, 2));

document.onpaste = async function(event){
  event.preventDefault();
  const clipData = (event.clipboardData || event.originalEvent.clipboardData);
  var items = Array.from(clipData.items);
  await pretty({ items });
  const length = items.length

  if(!length){
    console.log('no item length');
    console.log(clipData.getData('File') || 'get File data')
    console.log(clipData.getData('Text') || 'get Text data')
    if (clipData.clipboardData.files[0]) {
      console.log(clipData.files[0].getAsFile() || 'files get as file');
    }
    if (clipData.clipboardData.items[0]) {
      console.log(clipData.items[0].getAsFile() || 'items get as file');
    }
    const webkitEntry = clipData.webkitGetAsEntry();
    if(webkitEntry){
      console.log('entry');
      console.log(webkitEntry || 'webkitEntry');
    }
    return;
  }

  for (var i=0; i < length; i++) {
    var item = items[i];
    if (item.kind === 'file') {
      console.log('file');
      var blob = item.getAsFile();
      var reader = new FileReader();
      reader.onload = function(event){
        //console.log(event.target.result)
        const img = document.createElement('img');
        img.src = event.target.result;
        document.body.appendChild(img);
      }; // data url!
      reader.readAsDataURL(blob);
      continue;
    }
    if (item.kind === 'string') {
      console.log('string');
      item.getAsString(console.log);
      continue;
    }
    //pasting files
    const webkitEntry = item.webkitGetAsEntry();
    if(webkitEntry){
      console.log('entry');
      console.log(webkitEntry);
      continue;
    }
    await pretty({ kind: item.kind || 'no kind', item: item || 'no item?' })
  }
}

console.info('paste a thing');
(async () => {
  await appendUrls('./paste-image.css');
})();