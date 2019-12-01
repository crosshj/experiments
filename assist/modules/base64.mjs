
function notesModule(){
    //OMG danger!!!
    const backupNodeListForEach = NodeList.prototype.forEach;
    NodeList.prototype.forEach = Array.prototype.forEach;

    document.querySelectorAll('base64-section').forEach((el) => {
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
                <h5>base64</h5>
								<textarea rows=28 style="${taStyle}"></textarea>
						</div>
						<div class="flex-row center" style="${butRowStyle}">
							<a class="encode-button btn waves-effect waves-light">encode</a>
							<a class="decode-button btn waves-effect waves-light">decode</a>
							<a class="copy-button btn waves-effect waves-light">copy</a>
							<a class="paste-button btn waves-effect waves-light">paste</a>
						</div>
				`;

				const textBox = el.querySelector('textarea');
				const encodeButton = el.querySelector('.encode-button');
				const decodeButton = el.querySelector('.decode-button');
				const copyButton = el.querySelector('.copy-button');
				const pasteButton = el.querySelector('.paste-button');

				const decodeButtonDisabler = () => {
					var disableDecode = false;
					try {
						atob(textBox.value);
					} catch(e) {
						disableDecode = true;
					}

					if(disableDecode || !textBox.value.trim()){
						decodeButton.classList.add('disabled');
					} else {
						decodeButton.classList.remove('disabled');
					}
				};
				const encodeButtonDisabler = () => {
					if(!textBox.value.trim()){
						encodeButton.classList.add('disabled');
					} else {
						encodeButton.classList.remove('disabled');
					}
				};
				const copyButtonDisabler = () => {
					if(!textBox.value.trim()){
						copyButton.classList.add('disabled');
					} else {
						copyButton.classList.remove('disabled');
					}
				};

				const buttonDisabler = () => {
					//console.log({ value: textBox.value })
					encodeButtonDisabler();
					copyButtonDisabler();
					decodeButtonDisabler();
				};

				textBox.oninput = () => {
					buttonDisabler();
				};

				if(navigator.clipboard){
					copyButton.onclick = (e) => {
						navigator.clipboard.writeText(textBox.value)
							.then(() => {
								M.toast({html: 'Text copied to clipboard!'});
							})
							.catch(err => {
								M.toast({html: 'Error copying text!', classes: 'error'});
								console.error('Could not copy text: ', err);
							});
						e.preventDefault();
						return false;
					};
					pasteButton.onclick = (e) => {
						navigator.clipboard.readText()
							.then(text => {
								if(textBox.value){
									textBox.value += '\n\n'
								}
								textBox.value += text;
								buttonDisabler();
							})
							.catch(err => {
								M.toast({html: 'Error pasting text!', classes: 'error'});
								console.error('Could not paste text: ', err);
							});
						e.preventDefault();
						return false;
					};
				} else {
					copyButton.style.display = 'none';
					pasteButton.style.display = 'none';
				}

				encodeButton.onclick = (e) => {
					try {
						textBox.value = btoa(textBox.value).replace(/==$/, '');
						buttonDisabler();
					} catch(err) {
						M.toast({html: 'Error encoding text!', classes: 'error'});
						console.error('Could not encode text: ', err);
					}
					e.preventDefault();
					return false;
				};
				decodeButton.onclick = (e) => {
					try {
						textBox.value = atob(textBox.value);
						buttonDisabler();
					} catch(err) {
						M.toast({html: 'Error decoding text!', classes: 'error'});
						console.error('Could not decode text: ', err);
					}
					e.preventDefault();
					return false;
				};

				buttonDisabler();
				textBox.focus();

        el.classList.remove('loading');

        setTimeout(() => el.classList.remove('transition'), 500)
    });

    NodeList.prototype.forEach = backupNodeListForEach;
}

export default notesModule;
