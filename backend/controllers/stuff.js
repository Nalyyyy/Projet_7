const { log } = require('console');
const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  console.log(req.body.book);
  const thingBook = JSON.parse(req.body.book);
  delete thingBook._id;
  // delete thingBook._userId;
  console.log(thingBook);
  const book = new Book({
      ...thingBook,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  console.log(req.auth.userId);
  console.log(book);
  book.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( {error})})
};
 


exports.getOneBook = (req, res, next) => {
  console.log(req.params.id);
  Book.findOne({
  }).then(
    (thing) => {
      res.status(200).json(thing);
    }
  ).catch( 
        (error) =>res.status(404).json(error)
    );
};

exports.modifyBook = (req, res, next) => {
  const thingBook = req.file ? {
      ...JSON.parse(req.body.thing),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete thingBook._userId;
  Book.findOne({_id: req.params.id})
      .then((thing) => {
          if (thing.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Book.updateOne({ _id: req.params.id}, { ...thingBook, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};



exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(thing => {
          if (thing.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = thing.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
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


exports.getAllBooks = (req, res, next) => {
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

exports.getBestRating = (req, res, next) => {
  Book.find().then(
    (books => { 
      let array = [];

      //je créé un tableaux avec un index et la note
      for (let x=0 ; x< books.length ; x++){                     
        array.push([x , books[x].averageRating])                    
      };

      //je trie le tableau par note décroissante
      array.sort(function(a, b){                                
        return b[1] - a[1];
    }); 

     //je garde une copie des 3 premières notes
     let goodArray = array.slice(0,3); 

     //je créé mon tableau avec mes 3 meilleurs books
     let arrayBooks = [];
     for (let x=0 ; x< 3 ; x++){     
      let book = books[goodArray[x][0]];
      arrayBooks.push(book);               
    };

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



exports.newRating = (req,res,next) => {


  const rate = req.body;
  rate.grade = rate.rating;
  delete rate.rating;


  Book.findOne({_id: req.params.id})
  .then(() => {
      Book.updateOne({ _id: req.params.id}, { $push : {ratings : rate}},)
              .then(() =>   res.status(200).json({message : 'ok', _id :'10'}))
              .catch(error =>  res.status(401).json({ error }));
              next()
  })
  .catch((error) => {
      res.status(400).json({ error });
  });
  
}

exports.newAverageRating = (req,res,next) => {

  

  Book.findOne({_id: req.params.id})
  .then((thing) => {
    
    // console.log(thing);
    console.log('ok');
    let bookFinal = thing;
    let averageRatingNum = 0;
    let num =0;
    const length = thing.ratings.length;
    const test = thing.ratings
 
      for (let x=0 ; x< length ; x++){
        averageRatingNum += test[x].grade;
      };

      console.log(averageRatingNum);
      averageRatingNum /= length;
      num = Math.round(averageRatingNum * 100) / 100 //arrondi a deux chiffres après la virgule
      console.log(req.params.id);

      bookFinal.averageRating = num;
      // console.log(bookFinal);


      Book.updateOne({ _id: req.params.id}, {   averageRating :  num } )


      res.status(201).json({message: req.params.id , _id:'23'})

            //  .catch (error => res.status(401).json('error'))
              
  })


  Book.findOne({_id: req.params.id})
  .then((thing) => { return res.status(200).json(thing);})
  // .catch((error) => {res.status(404).json({error: error});});
}







exports.newRating = (req,res,next) => {


  const rate = req.body;
  rate.grade = rate.rating;
  delete rate.rating;


  Book.findOne({_id: req.params.id})
  .then(() => {
      Book.updateOne({ _id: req.params.id}, { $push : {ratings : rate}},)
              // .then(() =>   res.status(200).json({message : 'ok', _id :'10'}))
              .catch(error =>  res.status(401).json({ error }));
              // next()
  })
  .catch((error) => {
      res.status(400).json({ error });
  });

  
  Book.findOne({_id: req.params.id})
  .then((thing) => {
    
    // console.log(thing);
    console.log('ok');
    let bookFinal = thing;
    let averageRatingNum = 0;
    let num =0;
    const length = thing.ratings.length;
    const test = thing.ratings
 
      for (let x=0 ; x< length ; x++){
        averageRatingNum += test[x].grade;
      };

      console.log(averageRatingNum);
      averageRatingNum /= length;
      num = Math.round(averageRatingNum * 100) / 100 //arrondi a deux chiffres après la virgule
      console.log(req.params.id);

      bookFinal.averageRating = num;
      // console.log(bookFinal);
      // console.log(req);

      Book.updateOne({ _id: req.params.id}, {   averageRating :  num } )
            // .then(() =>  res.status(200).json({message:'ok'}))
            .then (()=> this.getOneBook(req)  )
            .catch(error =>  res.status(401).json({ error }));

            //  .catch (error => res.status(401).json('error'))
              
  


})}
