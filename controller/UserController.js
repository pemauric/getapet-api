const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createUserToken = require('../jwt/create-user-token');
const getToken = require('../jwt/get-token');
const getUserByToken = require('../jwt/get-user-by-token');


function validateField(res, fieldName, fieldValue, errorMessage) {
    if (!fieldValue) {
        res.status(422).json({ message: errorMessage });
        return true
    }
    return false
}

function validatePasswordMatch(res, fieldPassword, fieldConfirmPassword) {
    if(fieldPassword !== fieldConfirmPassword){
        res.status(422).json({ message: 'Passwords must match password confirmation' });
        return true
    }
    return false;
}

module.exports = class UserController {

    static async register (req, res) {
        
        const { name, email, password, phone, confirmpassword } = req.body;
        
        if (
            validateField(res, 'Name', name, 'Name is required!') ||
            validateField(res, 'E-mail', email, 'E-mail is required!') ||
            validateField(res, 'Password', password, 'Password is required!') ||
            validateField(res, 'Password Confirmation', confirmpassword, 'Password Confirmation is required!') ||
            validatePasswordMatch(res, password, confirmpassword) ||
            validateField(res, 'Phone', phone, 'Phone is required!') 
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
            !validateField(res, 'E-mail', email, 'E-mail is required!') &&
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

            currentUser = await User.findById(decoded.id).select('-password')

        } else {
            currentUser = null
            res.status(422).json({message: 'undefined'})
        }

        res.status(200).send({user: currentUser})
    }

    static async getUserById(req, res) {
        const id = req.params.id

        const user = await User.findById(id).select('-password')

        if (!user) {
            res.status(422).json({message: 'User not exists'})
            return
        }

        res.status(200).json({ user })

    }
    
    static async editUser (req, res) {
        const id = req.params.id

        const token = getToken(req)

        const user = await getUserByToken(token) 

        const { name, email, password, confirmpassword, phone} = req.body

        let image = ''

        if(req.file) {
            user.image = req.file.filename
        }

        if (
            validateField(res, 'Name', name, 'Name is required!') ||
            validateField(res, 'Email', email, 'Email is required!') ||
            validateField(res, 'Password', password, 'Password is required!') ||
            validateField(res, 'Password Confirmation', confirmpassword, 'Password Confirmation is required!') ||
            validateField(res, 'Phone', phone, 'Phone is required!') 
        ) {
            return;
        }

        const emailExists = await User.exists({ email: email })

        if (emailExists) {
            res.status(422).json({ message: 'This email already exists' })
            return
        }
        
        if (password === confirmpassword && password !== null) {
            const salt = await bcrypt.genSalt(14)
            const passwordHash = await bcrypt.hash(password,salt)
            
            user.password = passwordHash
        }
    
        user.name = name 
        user.email = email
        user.phone = phone

        //console.log(user)

        try {
            await User.findOneAndUpdate(
                {_id: user._id},
                {$set: user},
                {new: true},
            )

            res.status(200).json({ message: 'User updated successfully' })
        
        } catch (error) {   
            res.status(500).json({ message: '' + error})
            return
        }

        //res.status(200).json({user: user})

    }



};