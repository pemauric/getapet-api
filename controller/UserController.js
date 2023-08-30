const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createUserToken = require('../jwt/create-user-token');
const getToken = require('../jwt/get-token');


function validateField(res, fieldName, fieldValue, errorMessage) {
    if (!fieldValue) {
        res.status(422).json({ message: errorMessage });
        return false;
    }
    return true;
}

module.exports = class UserController {

    static async register (req, res) {
        
        const { name, email, password, phone, confirmpassword } = req.body;

        function validatePasswordMatch(fieldPassword, fieldConfirmPassword) {
            if(fieldPassword !== fieldConfirmPassword){
                res.status(422).json({ message: 'Passwords must match password confirmation' });
                return false;
            }
            return true;
        }
        
        if (
            !validateField(res, 'Name', name, 'Name is required!') ||
            !validateField(res, 'E-mail', email, 'E-mail is required!') ||
            !validateField(res, 'Password', password, 'Password is required!') ||
            !validateField(res, 'Password Confirmation', confirmpassword, 'Password Confirmation is required!') ||
            !validatePasswordMatch(password, confirmpassword) ||
            !validateField(res, 'Phone', phone, 'Phone is required!') 
        ) {
            return;
        }

        const userExists = await User.findOne({email : email})

        if (userExists) {
            res.status(422).json({ message: 'User exist'});
            return
        }

        const salt = await bcrypt.genSalt(14)

        const passwordHash = await bcrypt.hash(password,salt)

        const user = new User ({
            name,
            email,
            phone,
            password: passwordHash
        })

        try {
            
            const newUser = await user.save()
            
            await createUserToken(newUser, req, res)

            
        }catch (err) {
            res.status(500).json({message: 'Error creating user: ' + err})
        }
    }

    static async login(req, res) {
        const { email, password } = req.body

        if (
            !validateField(res, 'E-mail', email, 'E-mail is required!') ||
            !validateField(res, 'Password', password, 'Password is required!')
        ) {
            return;
        }

        const user = await User.findOne({email: email})

        if (!user) {
            res.status(422).json({message: 'User not exist'})
            return;
        }

        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            res.status(422).json({
                message: 'Incorrect password'
            })
            return
        }

        await createUserToken(user, req, res);
    }

    static async checkUser(req, res) {
        let currentUser

        if(req.headers.authorization) {

            const token = getToken(req)
            const decoded = jwt.verify(token, 'TranquilLlama$42JumpS3cure')

            currentUser = await User.findById(decoded.id)

            currentUser.password = undefined

        } else {
            currentUser = null
        }

        res.status(200).send(currentUser)
    }
};