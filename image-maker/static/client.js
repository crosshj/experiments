


function receiveMessage(event){
  console.log('Event from child:', event);
}
window.addEventListener("message", receiveMessage, false);
