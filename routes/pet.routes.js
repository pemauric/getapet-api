const router = require('express').Router();

const PetController = require('../controller/PetController');
const { imageUpload } = require('../middlewares/image-upload');

const verifyToken = require('../middlewares/verify-token');


router.get('/mypets', verifyToken, PetController.getAllUserPets)

router.get('/', PetController.getAll)

router.get('/myadoptions', 
verifyToken, 
PetController.getAllUserAdoptions
)
router.get('/:id', PetController.getPetById)

router.post('/create', verifyToken, imageUpload.array('image'), PetController.create);

router.delete('/remove/:id', verifyToken, PetController.deletePetById);

router.patch('/edit/:id', 
verifyToken, 
imageUpload.array('image'), 
PetController.editPetById
);

module.exports = router;

