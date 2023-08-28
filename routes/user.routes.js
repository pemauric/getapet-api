const router  = require('express').Router();

const UserController = require('../controller/UserController');

router.post('/register', UserController.register)

module.exports = router