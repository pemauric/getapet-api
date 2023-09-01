const router = require('express').Router();

const PetController = require('../controller/PetController');
const { imageUpload } = require('../middlewares/image-upload');

const verifyToken = require('../middlewares/verify-token');

router.post('/create', verifyToken, imageUpload.array('image'), PetController.create);
router.get('/', PetController.getAll)

module.exports = router;

