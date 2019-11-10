const notes = [`
user icon and dropdown menu, responsive
`, `
terminal should be popover and resizeable
`, `
scrollbar should not be over header
`, `
automatic Dark Mode (also themes).
`, `
automatic service worker
`, `
user menu module
`, `
app loading spinner / overlay
`, `
DONE: basic user menu with html/css
`, `
DONE: placeholders for lazyloaded sections/modules
`, `
DONE: responsive with breakpoints and different layouts for mobile, tablet, and phone
`, `
DONE: I want to use this to play around with things like
    <a href="https://github.com/soulwire/sketch.js/blob/master/examples/particles.html">using sketch.js particle system to simulate traffic patterns</a>
. (see <a href="../traffic/">Traffic Simulator</a></a>)
`];

function notesModule(){
    //OMG danger!!!
    const backupNodeListForEach = NodeList.prototype.forEach;
    NodeList.prototype.forEach = Array.prototype.forEach;

    document.querySelectorAll('notes-section').forEach((el) => {
        el.classList.add('transition');
        el.innerHTML = `
            <div class="section">
                <h5>Notes</h5>
                <p>
                    This template will be used by any app I create.
                    This will be a part of application hub.
                    Here is a running list of what is currently left to do (and what has been done).
                </p>
                <form></form>
            </div>
        `;
        const form = el.querySelector('.section form');

        notes.forEach(notesText => {
            var para = document.createElement("p");
            para.innerHTML = `
                <label>
                    <input type="checkbox"${ notesText.includes('DONE:') ? ' checked="checked"' : ''}/>
                    <span>
                        ${notesText.replace('DONE: ', '')}
                    </span>
                </label>
            `;
            form.appendChild(para);
        });

        el.classList.remove('loading');

        setTimeout(() => el.classList.remove('transition'), 500)
    });

    NodeList.prototype.forEach = backupNodeListForEach;
}

export default notesModule;
