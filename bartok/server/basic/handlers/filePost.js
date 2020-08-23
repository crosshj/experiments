const fs = require("fs");
const path = require("path");

const file = ({ dialog, win }) =>
    async (req, res) => {
        try {
            const _path = (req.params || {})['0'];
            const lastChar = (_path || '').slice(-1);

            if(!_path){
                res.redirect('/file/');
                return;
            }
            if(_path === '/'){
                res.send(style + 'TODO: browse for a file!');
                return;
            }

            const resolvedPath = path.resolve(_path.slice(1));
            console.log({ _path: resolvedPath });

            const isDirectory = (p) => {
                return fs.existsSync(p)
                    && fs.lstatSync(p).isDirectory();
            };

            const fileExists = p => fs.existsSync(p);

            if(!fileExists(resolvedPath)){
                res.json({ error: 'file create not implemented'})
                return;
            }

            if (isDirectory(resolvedPath) && lastChar !== '/') {
                res.json({ error: 'directory creation not implemented'})
                return;
            }

            const writeStream = fs.createWriteStream(resolvedPath);
            req.pipe(writeStream);
            req.on('end', function () {
                res.json({ success: true });
            });
            writeStream.on('error', function (err) {
                //TODO: does request end when this happens?
                // how does the writestream error get sent to client?
                console.log(err);
            });

        } catch(e){
            console.log('error occured');
            console.log(e);
            res.send(e);
        }
    };

module.exports = file;
