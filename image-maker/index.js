
const express = require('express');
const reload = require('reload');
const path = require('path');
const expressLess = require('express-less');

const pngroute = require('./routes/png');

const port = 3133;

const app = express();
app.set('port', process.env.PORT || port);

app.use('/components', express.static('components'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '.', 'index.htm'));
});

app.use('/css', expressLess(__dirname + '/css', { cache: true }));

app.use('/png', pngroute);

reload(app, {
	verbose: true,
});

app.listen(port, () => {
	console.log(`--- image-maker server running on http://localhost:${app.get('port')}`);
});
