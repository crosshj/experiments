
// simple UUID - https://gist.github.com/jed/982883
function newUUID(){
	function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}
	return b();
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
	read(){
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
	update(key){
		console.log(`PLEASE UPDATE: ${key}`);
	}
	delete(key){
		console.log(`PLEASE DELETE: ${key}`);
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
			<div class="flex-row center" style="${butRowStyle}">
				<a class="add-button btn waves-effect waves-light">add</a>
			</div>
		`;

		const textBox = el.querySelector('textarea');
		const notesList = el.querySelector('#notes-list');
		const addButton = el.querySelector('.add-button');

		notesList.onclick = (event) => {
			console.log(event.target);
			const isDelete = event.target.outerHTML.includes('>clear<');
			if(isDelete){
				const parent = event.target.closest('li');
				const noteKey = parent.dataset.key;
				storage.delete(noteKey);
				notesList.removeChild(parent);
			}
		};

		const addNote = ({ item, key }) => {
			notesList.innerHTML += `
				<li class="collection-item" data-key="${key}">
					<span>${item}</span>
					<i class="material-icons">clear</i>
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

		textBox.oninput = () => {
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
