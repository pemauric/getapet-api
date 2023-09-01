const Pet = require("../models/Pet");
const User = require("../models/User");
const getToken = require('../jwt/get-token');
const getUserByToken = require('../jwt/get-user-by-token');


const validateField = (res, fieldName, fieldValue, errorMessage) => {
    if (!fieldValue) {
        res.status(422).json({ message: errorMessage });
        return true
    }
    return false
}

module.exports = class PetController {

    static async create(req, res) {
        
        
        const { name, age, weight, color, description} = req.body;
        const  image  = req.files
        const available = true

        if (
            validateField(res, "Name", name, "Name is required") ||
            validateField(res, "Age", age, "Age is required") ||
            validateField(res, "Color", color, "Color is required") ||
            validateField(res, "Description", description, "Description is required") ||
            validateField(res, "Weight", weight, "Weight is required") 
        ) {
            return;
        } 
        
        if (image.length === 0) {
            res.status(422).json({ message: 'Image is required' });
            return true
        }


        const token = await getToken(req)
        const user = await getUserByToken(token)

        const pet = new Pet({
            name: name,
            age: age, 
            weight: weight,
            color: color,
            available: available,
            image: [],
            user: {
                _id: user._id,
                image:user.image,
                name: user.name,
                phone: user.phone
            },
        })

        image.map((image) => {
            pet.image.push(image.filename)
        })

        try {
            const newPet = await pet.save()
            
            res.status(201).json({message: "Pet created successfully", Pet: newPet})
        } catch (error) {
            
            res.status(500).json({message: 'Error creating user: ' + error})
        }
        
    }
    static async getAll(req, res) {
        const pets = await Pet.find().sort("-createdAt")

        res.status(200).json({pets: pets})
    }


}
