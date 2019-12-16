
// simple UUID - https://gist.github.com/jed/982883
function newUUID(){
	function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}
	return b();
}

// https://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    {
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

class Storage {
	constructor(){
		this.create = this.create.bind(this);
		this.read = this.read.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
	}
	create(item){
		const index = JSON.parse(localStorage.getItem('notes-index')) || [];
		let uuid;
		while(!uuid){
			const _uuid = newUUID();
			if(!index.find(x => x === _uuid)){
				uuid = _uuid;
			}
		}
		index.push(uuid);
		localStorage.setItem('notes-index', JSON.stringify(index));
		localStorage.setItem(`notes-${uuid}`, JSON.stringify(item));
		return uuid;
	}
	read(key){
		if(key){
			let item = localStorage.getItem(`notes-${key}`);
			try {
				item = JSON.parse(item);
			} catch(e){}
			return item;
		}
		const index = JSON.parse(localStorage.getItem('notes-index')) || [];
		const items = index.reduce((all, one) => {
			let item = localStorage.getItem(`notes-${one}`);
			try {
				item = JSON.parse(item);
			} catch(e){}
			all.push({
				key: one, item
			});
			return all;
		}, []);
		return items;
	}
	update(key, item){
		localStorage.setItem(`notes-${key}`, JSON.stringify(item));
	}
	delete(key){
		let index = JSON.parse(localStorage.getItem('notes-index')) || [];
		index = index.filter(x => x !== key);
		localStorage.setItem('notes-index', JSON.stringify(index));
		localStorage.removeItem(`notes-${key}`);
	}
}


function notesModule() {
	const storage = new Storage();

	//OMG danger!!!
	const backupNodeListForEach = NodeList.prototype.forEach;
	NodeList.prototype.forEach = Array.prototype.forEach;

	document.querySelectorAll('notes-section').forEach((el) => {
		el.classList.add('transition');
		const taStyle = `
					height: unset;
					resize: none;
					background: rgba(255, 255, 255, 0.1);
					text-align: left;
					color: inherit;
					padding: 10px;
				`.replace(/\t|\n/g, '');

		const butRowStyle = `
					justify-content: space-evenly;
					padding-top: 15px;
					padding-bottom: 15px;
				`.replace(/\t|\n/g, '');

		el.innerHTML = `
			<div class="section">
				<h5>notes</h5>
				<ul id="notes-list" class="collection"></ul>
				<textarea rows=8 style="${taStyle}" spellcheck="false"></textarea>
			</div>

			<div id="modal-delete-confirm" class="modal">
				<div class="modal-content">
					<h4>Delete Note</h4>
					<p>Sure you want to do this?</p>
				</div>
				<div class="modal-footer">
					<a href="#!" class="modal-close waves-effect waves-red btn-flat">Cancel</a>
					<a href="#!" class="modal-close waves-effect waves-green btn-flat">Okay</a>
				</div>
			</div>

			<div class="flex-row center" style="${butRowStyle}">
				<a class="add-button btn waves-effect waves-light">add</a>
			</div>
		`;

		const textBox = el.querySelector('textarea');
		const notesList = el.querySelector('#notes-list');
		const addButton = el.querySelector('.add-button');
		const deleteConfirm = el.querySelector('#modal-delete-confirm');

		var deleteConfirmModalEl;
		var deleteConfirmModalInstance;

		var deleteState;
		deleteConfirm.onclick = (event) => {
			const isCancel = event.target.outerHTML.includes('>Cancel<');
			const isConfirm = event.target.outerHTML.includes('>Okay<');
			const isButton = event.target.tagName.toLowerCase() === 'i';

			if(!isButton){
				return true;
			}

			if(isCancel){
				deleteState = undefined;
			}
			if(deleteState && isConfirm){
				storage.delete(deleteState.noteKey);
				notesList.removeChild(deleteState.parent);
				deleteState = undefined;
			}
		};

		notesList.onclick = (event) => {
			const isButton = event.target.tagName.toLowerCase() === 'i';
			const isDelete = event.target.outerHTML.includes('>clear<');
			const isEdit = event.target.outerHTML.includes('>edit<');
			const isEditConfirm = event.target.outerHTML.includes('>check<');
			const isEditCancel = event.target.outerHTML.includes('>not_interested<');

			if(!isButton){
				return true;
			}
			//console.log(event.target);

			if(isDelete){
				const parent = event.target.closest('li');
				deleteState = {
					parent,
					noteKey: parent.dataset.key
				};

				deleteConfirmModalEl = deleteConfirmModalEl || el.querySelector('#modal-delete-confirm');
				deleteConfirmModalInstance = deleteConfirmModalInstance || M.Modal.init(deleteConfirmModalEl);
				deleteConfirmModalInstance.open();
			}
			if(isEdit){
				const parent = event.target.closest('li');
				parent.style.background = "rgba(255, 255, 255, 0.1)";
				parent.querySelector('.actions:not(.edit)').classList.add('hidden');
				parent.querySelector('.actions.edit').classList.remove('hidden');
				parent.querySelector('span').setAttribute("contenteditable", true);
				parent.querySelector('span').focus();
				setEndOfContenteditable(parent.querySelector('span'));
			}
			if(isEditConfirm){
				const parent = event.target.closest('li');
				const noteKey = parent.dataset.key;
				parent.style.background = "";
				const newText = parent.querySelector('span').innerHTML;
				parent.querySelector('.actions:not(.edit)').classList.remove('hidden');
				parent.querySelector('.actions.edit').classList.add('hidden');
				parent.querySelector('span').setAttribute("contenteditable", false);
				storage.update(noteKey, newText);
			}
			if(isEditCancel){
				const parent = event.target.closest('li');
				const noteKey = parent.dataset.key;
				parent.style.background = "";
				parent.querySelector('.actions:not(.edit)').classList.remove('hidden');
				parent.querySelector('.actions.edit').classList.add('hidden');
				parent.querySelector('span').setAttribute("contenteditable", false);
				parent.querySelector('span').innerHTML = storage.read(noteKey);
			}
		};

		const addNote = ({ item, key }) => {
			notesList.innerHTML += `
				<li class="collection-item" data-key="${key}">
					<span>${item}</span>
					<div class="actions">
						<i class="material-icons">edit</i>
						<i class="material-icons">clear</i>
					</div>
					<div class="actions edit hidden">
						<i class="material-icons">not_interested</i>
						<i class="material-icons">check</i>
					</div>
				</li>
			`;
		};

		const addButtonDisabler = () => {
			if (!textBox.value.trim()) {
				addButton.classList.add('disabled');
			} else {
				addButton.classList.remove('disabled');
			}
		};

		const buttonDisabler = () => {
			//console.log({ value: textBox.value })
			addButtonDisabler();
		};

		// shift enter for adding on desktop
		textBox.onkeyup = (event) => {
			if (event.keyCode == 13 && event.shiftKey) {
				addButton.onclick(event);
			}
		};
		textBox.oninput = (event) => {
			buttonDisabler();
		};

		textBox.onchange = () => {
			buttonDisabler();
		};

		addButton.onclick = (e) => {
			try {
				const key = storage.create(textBox.value);
				addNote({ key, item: textBox.value });
				textBox.value = '';
				buttonDisabler();
				textBox.focus();
			} catch (err) {
				M.toast({ html: 'Error encoding text!', classes: 'error' });
				console.error('Could not add text: ', err);
			}
			e.preventDefault();
			return false;
		};

		const allNotes = storage.read();
		allNotes.forEach(addNote);

		buttonDisabler();
		textBox.focus();
		textBox.click();

		el.classList.remove('loading');

		setTimeout(() => el.classList.remove('transition'), 500)
	});

	NodeList.prototype.forEach = backupNodeListForEach;
}

export default notesModule;
