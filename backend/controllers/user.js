const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

//création d'un compte utilisateur
exports.signup = (req, res, next) => {
    //on vérifie si le mot de passe contient au moins 5 caractères  et si le mail contient un arobase 
    if (req.body.password != '' & req.body.password.length > 4 & req.body.email.indexOf('@') != -1 ){    
    //on hache le mot de passe 
    bcrypt.hash(req.body.password, 10)
        //puis on créer notre utilisateur avec le modèle user
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        //on enregistre ensuite l'utilisateur dans la base de données
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error })); }
    else {res.status(400).json({message : 'Veuillez renseigner un mot de passe de minimum 5 caractères ou une adresse mail valide !'})}
  };


//connexion d'un utilisateur sur son compte
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }

            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }else {
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign(
                                { userId: user._id },
                                'token',
                                { expiresIn: '24h' }
                                )
                        });
                    }    
                })
                .catch(error => res.status(500).json( {error} ));  
        })
        .catch(error => res.status(500).json({ error }));
 };