const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = class UserController {

    static async register (req, res) {
        
        const { name, email, password, phone, confirmpassword } = req.body;

        function validateField(fieldName, fieldValue, errorMessage) {
            if (!fieldValue) {
                res.status(422).json({ message: errorMessage });
                return false;
            }
            return true;
        }

        function validatePasswordMatch(fieldPassword, fieldConfirmPassword) {
            if(fieldPassword !== fieldConfirmPassword){
                res.status(422).json({ message: 'Passwords must match password confirmation' });
                return false;
            }
            return true;
        }
        
        if (
            !validateField('Name', name, 'Name is required!') ||
            !validateField('E-mail', email, 'E-mail is required!') ||
            !validateField('Password', password, 'Password is required!') ||
            !validateField('Password Confirmation', confirmpassword, 'Password Confirmation is required!') ||
            !validatePasswordMatch(password, confirmpassword) ||
            !validateField('Phone', phone, 'Phone is required!') 
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
            password: passwordHash,
            phone
        })

        try {
            const newUser = await user.save()
            res.status(201).json({ message: 'User created with successfully', newUser});
            
        }catch (err) {
            res.status(500).json({message: 'Error creating user'})
        }

    
    }
};
