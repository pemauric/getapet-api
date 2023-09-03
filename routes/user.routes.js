const router  = require('express').Router();

const { verify } = require('jsonwebtoken');
const UserController = require('../controller/UserController');

const verifyToken = require('../middlewares/verify-token');

const { imageUpload } = require('../middlewares/image-upload');

router.post('/register', UserController.register)
router.get('/checkuser', UserController.checkUser)
router.post('/login', UserController.login)
router.get('/:id', UserController.getUserById)
router.patch('/edit/:id', verifyToken, imageUpload.single('image'), UserController.editUser)

module.exports = router