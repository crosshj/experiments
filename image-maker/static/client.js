function receiveMessage(event){
  const image = document.getElementById('main_image');

  if (event.data === 'chopinit'){
    setupFullScreen();  
    return chopListener(event, image);
  }

  fractalListener(event, image);
}
window.addEventListener("message", receiveMessage, false);

function chopListener(event, image, width, height){
  // ./chop?width=1232&height=1014
  image.src = "./chop?" +
  "width=" + (width || window.screen.width) + "&" +
  "height=" + (height || window.screen.height);
  image.className = 'loading';
  image.onload = function (e){
    e.target.className = '';
  }
  return;
}

function fractalListener(event, image){
  //./png?mag=348040563.5232469&panx=1.9854872904239196&pany=-0.000014568622124230988&width=1920&height=1080
  if(event.data === 'fractalinit'){
    image.src = "./fractal?" +
      "mag=348040563.5232469&" + //"mag=374606.88409205293&" +
      "panx=1.9854867732428236&" +//"panx=1.77402235874246&" +
      "pany=-0.000014568622124230988&" +//"pany=-0.005048224154787757&" +
      "width=" + document.body.scrollWidth + "&" +
      "height=" + document.body.scrollHeight;
    return;
  }

  const newVals = {
    mag: Number(image.src.match(/mag=([^&]*)/)[1]),
    panx: Number(image.src.match(/panx=([^&]*)/)[1]),
    pany: Number(image.src.match(/pany=([^&]*)/)[1])
  };
  var panAmount = 0.1 * (600/newVals.mag);
  var magAmount = 100 * (newVals.mag/600);
  if(event.data === 'north'){
    newVals.pany = newVals.pany + panAmount;
  }
  if(event.data === 'south'){
    newVals.pany = newVals.pany - panAmount;
  }
  if(event.data === 'east'){
    newVals.panx = newVals.panx - panAmount;
  }
  if(event.data === 'west'){
    newVals.panx = newVals.panx + panAmount;
  }
  if(event.data === 'plus'){
    newVals.mag = newVals.mag + magAmount;
    newVals.panx = newVals.panx - panAmount*1.25;
    newVals.pany = newVals.pany - panAmount*1.25;
  }
  if(event.data === 'minus'){
    newVals.mag = newVals.mag - magAmount;
    newVals.panx = newVals.panx + panAmount*1.75;
    newVals.pany = newVals.pany + panAmount*1.75;
  }
  const newSrc = `./fractal?mag=${newVals.mag}&panx=${newVals.panx}&pany=${newVals.pany}&` +
    "width=" + document.body.scrollWidth + "&" +
    "height=" + document.body.scrollHeight;
  //console.log({newVals, newSrc});
  image.src = newSrc;
  //console.log('Event from child:', event.data);
}

function setupFullScreen(){
  //console.log('--- setup fullscreen');
  var mainImage = document.getElementById("main_image");
  var fullscreenDiv = document.getElementById("wrapper");

  function fullScreenChangeHandler(event){
    //console.log(event);
  }

  ['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange', 'MSFullscreenChange']
    .forEach(event => {
      document.addEventListener(event, fullScreenChangeHandler);
    });

  function isFullScreen(){
    return document.webkitIsFullScreen || document.isFullScreen; // OR other vendor prefixed fullscreen boolean
  }

  function goFullscreen(fullscreenDiv){
    var fullscreenFunc = fullscreenDiv.requestFullscreen;
    if (!fullscreenFunc) {
      ['mozRequestFullScreen', 'msRequestFullscreen', 'webkitRequestFullScreen']
        .forEach(function (req) {
          fullscreenFunc = fullscreenFunc || fullscreenDiv[req];
        });
    }
    fullscreenFunc && fullscreenFunc.call(fullscreenDiv);
  }

  function exitFullscreen(){
    document.exitFullscreen && document.exitFullscreen();
    document.webkitExitFullscreen && document.webkitExitFullscreen();
  }

  function imgClickHandler() {
    //chopListener(null, mainImage, window.screen.width, window.screen.height);
    isFullScreen() ? exitFullscreen() : goFullscreen.call(null, fullscreenDiv);
  }

  mainImage.addEventListener('click', imgClickHandler);
}
