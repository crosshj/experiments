
const express = require('express');
const reload = require('reload');
const path = require('path');
const expressLess = require('express-less');

const fractalroute = require('./routes/fractal');
const choproute = require('./routes/chop');

const port = 3133;

const app = express();
app.set('port', process.env.PORT || port);

app.use('/components', express.static('components'));
app.use('/static', express.static('static'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '.', 'index.htm'));
});

app.use('/css', expressLess(__dirname + '/css', { cache: true }));

app.use('/fractal', fractalroute);
app.use('/chop', choproute);

reload(app, {
	verbose: true,
});

app.listen(port, () => {
	console.log(`--- image-maker server running on http://localhost:${app.get('port')}`);
});
