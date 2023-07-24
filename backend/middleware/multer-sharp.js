const multer = require("multer")
const SharpMulter  =  require("sharp-multer");



//redimensionne les images et change le nom.
const storage =  SharpMulter ({
    //on choisit la destination de l'image
    destination:(req, file, callback) =>callback(null, "images"),
    //on choisi l'extension , la qualité, la taille et le nom de l'image
    imageOptions:{
        fileFormat: "webp",
        quality: 50,
        resize:  { width:  750, height:  750, resizeMode:  "contain"  }},
    //on change le nom de l'image
    filename: (req, file, callback) => {
      //on récupère le nom puis on supprime les espaces
      const name = req.split(' ').join('_');
      // on renvoie le nom avec en plus un timestamp et le format webp 
      return (null, name + Date.now()  + '.' + file.fileFormat);
      },
    });


module.exports = multer({storage: storage}).single('image');