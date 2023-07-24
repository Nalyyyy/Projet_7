const express = require ('express');
const bodyParser = require ('body-parser')
const mongoose = require('mongoose');
const rateLimit = require ('express-rate-limit');

//on créer notre app express
const app = express();

const path = require('path');
const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');

//limite le nombre de requêtes
const limiter = rateLimit({
  //on règle le limiter sur 15 min
	windowMs: 15 * 60 * 1000, 
	// Limite chaque IP à 100 requêtes toutes les 15 mins
  max: 200, 
  message : 'Trop de requêtes'
});

//on se connecte a la base de données
mongoose.connect('mongodb+srv://Naly:taofiasco@p7.2gmbuyd.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//on utilise nos middlewares et nos routes 
app.use(bodyParser.json());
app.use('/api/', limiter)
app.use('/api/books', stuffRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app ;