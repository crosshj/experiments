const fs = require("fs");
const path = require("path");

const getAllFiles = function(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
      if(['node_modules', '.git'].includes(file)){
        return;
      }
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      } else {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    })
    return arrayOfFiles;
};

let root; // previously used root folder
const tree = ({ dialog, win }) => async (req, res) => {
    let options = {
      buttonLabel : "Select folder",
      properties: ['openDirectory']
     }
     if(root){
      options.defaultPath = root;
     }
     const {
       canceled, filePaths
     } = await dialog.showOpenDialog(win, options);

     if(canceled){
      return res.json({
        error: 'folder pick was canceled',
        root: '',
        files: []
      });
     }

     const selectedPath = filePaths[0];
     const allFiles = getAllFiles(selectedPath);
     root = selectedPath.split('\\').slice(0, -1).join('\\');
     res.json({
       root,
       files: allFiles.map(x => x.replace(root+'\\', ''))
     });
  }

  module.exports = tree;
