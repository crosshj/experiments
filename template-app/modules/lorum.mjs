const lorumText = [`
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
dolore magna aliqua. Interdum posuere lorem ipsum dolor sit. Et magnis dis parturient montes. Lobortis
scelerisque fermentum dui faucibus in ornare. Tristique senectus et netus et. Cras semper auctor neque
vitae. Et netus et malesuada fames ac turpis egestas integer. Cras pulvinar mattis nunc sed blandit libero.
Et molestie ac feugiat sed lectus vestibulum. Massa vitae tortor condimentum lacinia quis vel eros.
Tincidunt ornare massa eget egestas purus viverra accumsan in. Sit amet commodo nulla facilisi nullam
vehicula. Mauris sit amet massa vitae tortor condimentum lacinia. Sed euismod nisi porta lorem mollis
aliquam ut. Vitae suscipit tellus mauris a. Euismod in pellentesque massa placerat duis ultricies lacus sed
turpis.
`, `
Eu augue ut lectus arcu bibendum at. Arcu bibendum at varius vel pharetra. Vitae ultricies leo integer
malesuada nunc vel. Neque egestas congue quisque egestas diam in. Imperdiet dui accumsan sit amet nulla
facilisi morbi tempus iaculis. Vulputate ut pharetra sit amet aliquam id diam. Suspendisse in est ante in
nibh mauris cursus mattis molestie. Nibh cras pulvinar mattis nunc. Mattis aliquam faucibus purus in massa
tempor nec feugiat. Sit amet cursus sit amet dictum sit. Aliquet lectus proin nibh nisl condimentum id.
Ultrices mi tempus imperdiet nulla malesuada pellentesque. Venenatis lectus magna fringilla urna porttitor
rhoncus dolor. Adipiscing enim eu turpis egestas. Lectus mauris ultrices eros in cursus. Cursus metus
aliquam eleifend mi in nulla posuere sollicitudin aliquam.
`, `
Sed augue lacus viverra vitae congue eu consequat. Pretium viverra suspendisse potenti nullam ac tortor
vitae purus faucibus. Urna cursus eget nunc scelerisque viverra mauris. Venenatis urna cursus eget nunc
scelerisque. Eget velit aliquet sagittis id consectetur purus ut faucibus pulvinar. Amet cursus sit amet
dictum sit amet justo donec. Venenatis tellus in metus vulputate eu scelerisque. Morbi tincidunt augue
interdum velit euismod in pellentesque massa placerat. Nec tincidunt praesent semper feugiat nibh. Praesent
elementum facilisis leo vel. Quis commodo odio aenean sed adipiscing diam. Aliquet porttitor lacus luctus
accumsan tortor posuere ac. Odio ut sem nulla pharetra diam sit. Rhoncus mattis rhoncus urna neque viverra
justo. Quam elementum pulvinar etiam non. Curabitur vitae nunc sed velit dignissim. Suspendisse interdum
consectetur libero id faucibus nisl tincidunt. Erat pellentesque adipiscing commodo elit at imperdiet.
`, `
Risus pretium quam vulputate dignissim suspendisse in. Donec adipiscing tristique risus nec feugiat in
fermentum. Tempus urna et pharetra pharetra massa massa ultricies mi. Adipiscing enim eu turpis egestas
pretium aenean pharetra. Vitae proin sagittis nisl rhoncus mattis rhoncus. Mauris pellentesque pulvinar
pellentesque habitant morbi tristique. Quis auctor elit sed vulputate. Amet porttitor eget dolor morbi non
arcu risus. Nullam ac tortor vitae purus faucibus ornare. Natoque penatibus et magnis dis parturient montes
nascetur ridiculus mus. Eget velit aliquet sagittis id consectetur purus ut faucibus. Mauris a diam maecenas
sed enim. Semper quis lectus nulla at. Quis viverra nibh cras pulvinar mattis nunc sed blandit libero.
Ornare lectus sit amet est placerat in egestas erat imperdiet. Turpis massa sed elementum tempus egestas sed
sed risus. Fusce ut placerat orci nulla pellentesque dignissim enim. Nisl vel pretium lectus quam. At auctor
urna nunc id cursus. Aliquam sem et tortor consequat id porta nibh.
`, `
Magna etiam tempor orci eu lobortis. Eget magna fermentum iaculis eu non diam phasellus vestibulum. Semper
eget duis at tellus at. Quisque sagittis purus sit amet volutpat consequat. Vel pretium lectus quam id leo
in. Senectus et netus et malesuada fames ac. Nisi porta lorem mollis aliquam ut. Scelerisque fermentum dui
faucibus in ornare. Id diam maecenas ultricies mi. Viverra mauris in aliquam sem fringilla ut morbi
tincidunt augue. Lobortis feugiat vivamus at augue eget arcu dictum varius duis. Vitae congue mauris rhoncus
aenean. Pellentesque id nibh tortor id aliquet lectus.
`];

function loremIpsumfy(){
    //OMG danger!!!
    const backupNodeListForEach = NodeList.prototype.forEach;
    NodeList.prototype.forEach = Array.prototype.forEach;

    document.querySelectorAll('lorum-section').forEach((el) => {
        el.innerHTML = `
            <div class="section"></div>
        `;
        const section = el.querySelector('.section');

        var header = document.createElement("h5");
        header.innerHTML = 'Lorum';
        section.appendChild(header);

        lorumText.forEach(loText => {
            var para = document.createElement("p");
            var node = document.createTextNode(loText);
            para.appendChild(node);
            section.appendChild(para);
        });

        el.classList.remove('loading');
    });

    NodeList.prototype.forEach = backupNodeListForEach;
}

export default loremIpsumfy;
