const Book = require('../models/book');
const fs = require('fs');    //gestionnaire de fichier de Node


//créer un book
exports.createBook = (req, res, next) => {
  if (!req.file){return res.status(400).json({message:'Mettre une image'})}
  else {
  const thingBook = JSON.parse(req.body.book);
  //supprime les id par sécurité
  delete thingBook._id;
  delete thingBook._userId;
  //création de notre book avec le modèle
  const book = new Book({
      ...thingBook,
      //on remet l'id
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  //on enregistre le book dans la base de donnée
  book.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( {error})})
}
};
 

//récupérer un livre
exports.getOneBook = (req, res, next) => {
  //on cherche le livre voulu grâce à l'id de la requête
  Book.findOne({_id:req.params.id}).then(
    (book) => {
      //puis on renvoie le livre 
      res.status(200).json(book);
    }
  ).catch( 
        (error) =>res.status(404).json(error)
    );
};


//modification d'un livre
exports.modifyBook = (req, res, next) => {
  let img;
  //si il y a une image, alors notre variable prend la valeur 1
  if (!req.file){img = 0}
  else {img = 1};
  console.log(img);
  const thingBook = req.file ? {
      //si il y a un fichier, alors on recupère les caracteristiques du livre puis on change l'url de l'image
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  }
  //sinon on recupere juste les caracteristiques du livre directement
  : { ...req.body };
  //par securité on supprime encore l'id
  delete thingBook._userId;
  Book.findOne({_id: req.params.id})
      .then((thing) => {
          //on verifie que l'utilisateur est celui qui a crée le livre de base
          if (thing.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              //si il y a une image alors on recupere son nom est on la supprime
              if (img == 1 ) {
                const filename = thing.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}` , (err => {
                  if (err) console.log(err);
                  else {console.log("Image supprimé")}}))
              }
              else {console.log("Pas d'image")};
              //on met donc à jour le livre grâce a 'updateOne'
              Book.updateOne({ _id: req.params.id}, { ...thingBook, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};


//suppression d'un livre
exports.deleteBook = (req, res, next) => {
  //on retrouve le livre voulu grâce à l'id
  Book.findOne({ _id: req.params.id})
      .then(thing => {
          //vérification que l'utilisateur est le créateur du livre
          if (thing.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              //on récupère le nom de l'image en enlevant le début de l'url puis on la supprime grâce a fs.unlink
              const filename = thing.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  //une fois l'image supprimer, on supprime le reste du livre de la base de donnée
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};


//récuperer tous les livres
exports.getAllBooks = (req, res, next) => {
  //on recupère directement tous les livres avec find() puis on les renvoie en réponse au front
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};


//récuperer les livres les mieux notés
exports.getBestRating = (req, res, next) => {
  //on récupère tout les livres
  Book.find().then(
    (books => { 
      let array = [];
      //on créé un tableaux avec un index et la note pour chaque livre
      for (let x=0 ; x< books.length ; x++){                     
        array.push([x , books[x].averageRating])                    
      };
      //on trie le tableau par note décroissante
      array.sort(function(a, b){                                
        return b[1] - a[1];
    }); 
     //on garde une copie des 3 premières notes
     let goodArray = array.slice(0,3); 
     //on créé le tableau avec les 3 meilleurs books
     let arrayBooks = [];
     for (let x=0 ; x< 3 ; x++){     
      let book = books[goodArray[x][0]];
      arrayBooks.push(book);               
    };
    //on renvoie notre tableau avec les 3 meilleurs livres 
    res.status(200).json(arrayBooks);

  })
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};






//notations d'un livre
exports.newRating = (req,res,next) => {
  //on change le rate.rating en rate.grade pour correspondre au model
  const rate = req.body;
  rate.grade = rate.rating;
  delete rate.rating;
  //on trouve le livre concerné
  Book.findOne({_id: req.params.id})
  //puis on ajoute le tableau rate au tableau rating qui comporte toutes les notes
  .then(() => {
      Book.updateOne({ _id: req.params.id}, { $push : {ratings : rate}},)
      //une fois que le livre est mis a jour on peut calculer la note moyenne grâce a toutes les notes à jour
      .then (()=>{Book.findOne({_id: req.params.id})
          .then((thing) => {
            let bookFinal = thing;
            let averageRatingNum = 0;
            let num =0;
            const length = thing.ratings.length;
            const test = thing.ratings
            //on calcule la moyenne des notes en les additionnant toutes puis en les divisant par le nombre de note (length)
              for (let x=0 ; x< length ; x++){
                averageRatingNum += test[x].grade;
              };
              averageRatingNum /= length;
              //puis on arrondi a deux chiffres après la virgule
              num = Math.round(averageRatingNum * 100) / 100
        
              bookFinal.averageRating = num;
              //on met a jour la note moyenne du livre 
              Book.updateOne({ _id: req.params.id}, {   averageRating :  num } )
                    .then (()=> 
                          Book.findOne({_id:req.params.id})
                          // puis on renvoie le livre mis a jour au front
                          .then((thing) => {res.status(200).json(thing);})) 
                          .catch(error => {console.log(error);})
                    .catch(error => {console.log(error);});
      })
    })
      .catch((error) => {console.log(error);});
  })
  .catch((error) => {
    return res.status(400).json({ error });
  });
}
