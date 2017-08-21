


function receiveMessage(event){
  const image = document.getElementById('main_image');
  const newVals = {
    mag: Number(image.src.match(/mag=([^&]*)/)[1]),
    panx: Number(image.src.match(/panx=([^&]*)/)[1]),
    pany: Number(image.src.match(/pany=([^&]*)/)[1])
  };
  if(event.data === 'north'){
    newVals.pany = newVals.pany - 0.1;
  }
  if(event.data === 'south'){
    newVals.pany = newVals.pany + 0.1;
  }
  if(event.data === 'east'){
    newVals.panx = newVals.panx + 0.1;
  }
  if(event.data === 'west'){
    newVals.panx = newVals.panx - 0.1;
  }
  if(event.data === 'plus'){
    newVals.mag = newVals.mag + 100;
  }
  if(event.data === 'minus'){
    newVals.mag = newVals.mag - 100;
  }
  const newSrc = `./png?mag=${newVals.mag}&panx=${newVals.panx}&pany=${newVals.pany}` + '';
  //console.log({newVals, newSrc});
  image.src = newSrc;
  //console.log('Event from child:', event.data);
}
window.addEventListener("message", receiveMessage, false);
