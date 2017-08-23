(function(){

  var userStory;

  var ui = {
    usButton: document.getElementById('submit'),
    nounInput: document.getElementById('x-noun'),
    actionInput: document.getElementById('x-action'),
    valueInput: document.getElementById('x-value'),
    output: document.getElementById('userstory'),
    outputContainer: document.getElementById('output'),
    inputContainer: document.getElementById('input'),
    moreButton: document.getElementById('more'),
    back: document.getElementById('back')
  };

  var templates = {
    success: document.getElementById('card-success')
  }

  function generateUserStory(e) {
    e.preventDefault();
    var noun = ui.nounInput.value || 'user';
    var action = ui.actionInput.value || 'order a widget';
    var value = ui.valueInput.value || 'a really cool thing';
    userStory = 'As a ' + noun + ',<br/> I want to ' + action + ',<br/> so there is ' + value;
    ui.output.innerHTML = userStory;
    ui.outputContainer.classList.add('fade-in');
    ui.inputContainer.classList.add('slide-down');
    return false;
  }

  function resetResult () {
    ui.outputContainer.classList.add('slide-up');
  }

  function resetPage(e) {
    if (this.classList.contains('slide-up')) {
      ui.outputContainer.classList.remove('slide-up');
      ui.outputContainer.classList.remove('fade-in');
      ui.nounInput.focus();
      ui.actionInput.value = '';
      ui.valueInput.value = '';
    }
  }

  function clearFocus() {
    this.value = '';
  }

  ui.usButton.addEventListener('click', generateUserStory, false);

  ui.moreButton.addEventListener('click', resetResult, false);

  ui.outputContainer.addEventListener('transitionend', resetPage, false);

  ui.nounInput.addEventListener('focus', clearFocus, false);

  ui.actionInput.addEventListener('focus', clearFocus, false);
  
  ui.valueInput.addEventListener('focus', clearFocus, false);

})();