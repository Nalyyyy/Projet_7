const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multerSharp = require('../middleware/multer-sharp');
const stuffCtrl = require('../controllers/stuff');
const sharp = require ('sharp');


router.get('/' , stuffCtrl.getAllBooks);
router.post('/', auth , multerSharp , stuffCtrl.createBook);
router.get('/bestrating', stuffCtrl.getBestRating);
router.get('/:id' , stuffCtrl.getOneBook);
router.put('/:id', auth , multerSharp , stuffCtrl.modifyBook);
router.delete('/:id', auth , stuffCtrl.deleteBook);
// router.post('/:id/rating', auth , stuffCtrl.newRating ,  stuffCtrl.newAverageRating );
router.post('/:id/rating', auth , stuffCtrl.newRating );

module.exports = router;