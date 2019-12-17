
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

//inspired by https://github.com/huextrat/Taskist

//https://mediatemple.net/blog/tips/carousels-dont-have-to-be-complicated/
const listsSelector = () => `
<style>
	.lists-selector {
		padding-top: 5px;
		padding-bottom: 5px;
		margin-bottom: 5px;
		display: flex;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;

		scroll-snap-points-x: repeat(50px);
		scroll-snap-type: mandatory;
		scroll-behavior: smooth;

		/* https://codepen.io/matthewbeta/pen/fzoHI */
		background-image:
			linear-gradient(to right, var(--main-theme-background-color), var(--main-theme-background-color)),
			linear-gradient(to right, var(--main-theme-background-color), var(--main-theme-background-color)),
			linear-gradient(to right, rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0)),
			linear-gradient(to left, rgba(0, 0, 0, 0.25), transparent);
		background-position: left center, right center, left center, right center;
		background-repeat: no-repeat;
		background-color: var(--main-theme-background-color);
		background-size: 100px 100%, 100px 100%, 20px 100%, 20px 100%;
		background-attachment: local, local, scroll, scroll;
	}
	.lists-selector::-webkit-scrollbar {
		display: none;
	}
	.lists-selector > div {
		/* make sure the width is honored */
		flex-shrink: 0;
		width: 300px;
		max-width: 25%;
		height: auto;
		padding: 0;
		text-align: center;
	}
	.lists-selector > div > .btn {
		height: 100%;
		width: 100%;
	}
	// .lists-selector:after {
	// 	background-image: linear-gradient(
	// 		to right,
	// 		transparent 0,
	// 		var(--main-theme-background-color) 90%
	// 	);
	// 	margin-left: -300px;
	// 	width: 300px;
	// 	content: '';
	// 	z-index: 1;
	// 	pointer-events: none;
	// }
	.selector-item  + .selector-item  {
		margin-left: 10px;
	}
	.selector-item .btn {
		opacity: 1;
	}
	.selector-item .btn:not(.selected) {
		//opacity: .5;
		pointer-events: unset !important;
		color: var(--main-theme-background-color);
	}
</style>
<div class="lists-selector">
	<div class="selector-item">
		<a class="waves-effect waves-light btn red selected">Red</a>
	</div>
	<div class="selector-item">
		<a class="waves-effect waves-light btn blue disabled">Blue</a>
	</div>
	<div class="selector-item">
		<a class="waves-effect waves-light btn orange disabled">Orange</a>
	</div>
	<div class="selector-item">
		<a class="waves-effect waves-light btn green disabled">Green</a>
	</div>
	<div class="selector-item">
		<a class="waves-effect waves-light btn purple disabled">Purple</a>
	</div>
</div>
`;


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
				${listsSelector()}
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
		const listsSelectorEl = el.querySelector('.lists-selector');

		listsSelectorEl.onclick = (event) => {
			const isListItem = event.target.tagName.toLowerCase() === 'a';

			if(isListItem){
				const listItemParent = event.target.closest('.lists-selector');
				const {
					clientWidth,
					scrollWidth,
					scrollLeft,
					offsetLeft: parentOffsetLeft
				} = listItemParent;
				const {
					offsetLeft: childOffsetLeft
				} = event.target;
				const dims = {
					offsetLeft:  childOffsetLeft - parentOffsetLeft,
					clientWidth,
					scrollWidth,
					scrollLeft
				};
				if(dims.offsetLeft > scrollWidth / 2){
					listItemParent.scrollLeft = dims.offsetLeft;
				} else {
					listItemParent.scrollLeft = 0;
				}

				Array.from(el.querySelectorAll('.selector-item a'))
					.forEach(btn => {
						btn.classList.remove('selected');
						btn.classList.add('disabled')
					});
				event.target.classList.add('selected');
				event.target.classList.remove('disabled');

				//console.log(event.target.innerHTML);
			}
		};

		var deleteConfirmModalEl;
		var deleteConfirmModalInstance;

		var deleteState;
		deleteConfirm.onclick = (event) => {
			const isCancel = event.target.outerHTML.includes('>Cancel<');
			const isConfirm = event.target.outerHTML.includes('>Okay<');
			const isButton = event.target.tagName.toLowerCase() === 'i' || event.target.className.includes('btn-flat');

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
				<li class="collection-item" data-key="${key}" tabIndex=10>
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
		//textBox.focus();
		//textBox.click();

		el.classList.remove('loading');

		setTimeout(() => el.classList.remove('transition'), 500)
	});

	NodeList.prototype.forEach = backupNodeListForEach;
}

export default notesModule;
