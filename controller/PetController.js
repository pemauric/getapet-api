const Pet = require("../models/Pet");
const User = require("../models/User");
const getToken = require('../jwt/get-token');
const getUserByToken = require('../jwt/get-user-by-token');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId


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
            return 
        }

        const token = getToken(req);

        const user = await getUserByToken(token);

        //const user = await getUserByToken(token);
        
        //console.log(user._id)
        
        const pet = new Pet({
            name: name,
            age: age,
            description: description,
            weight: weight,
            color: color,
            available: available,
            image: [],
            user: {
                id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        })
        
        image.map((image) => {
            pet.image.push(image.filename)
        })
    
        try {
            const newPet = await pet.save()
    
            res.status(201).json({
                message: 'Pet cadastrado com sucesso!',
                newPet: newPet,
            })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }
    
    static async getAll(req, res) {
        const pets = await Pet.find().sort("-createdAt")

        res.status(200).json({pets: pets})
    }

    static async getAllUserPets (req, res){
        
        const token = getToken(req);
        
        const user = await getUserByToken(token)

        const pets = await Pet.find({'user.id': user._id}).sort("-createdAt")

        res.status(200).json({pets: pets})
    }

    static async getAllUserAdoptions (req, res) {
        const token = getToken(req)
        const user = await getUserByToken(token)

        console.log(user.name)

        const pet = await Pet.find({'adopter._id': user._id})

        res.status(200).json({pet})
    }

    static async getPetById (req, res) {
        const {id} = req.params

        if(!ObjectId.isValid(id)) {
            res.status(422).json({message: 'ID is not a valid'})
            return
        }
        
        const pet = await Pet.findOne({_id: id})

        if (!pet) {
            res.status(404).json({message: 'Pet not exist'})
            return
        }

        res.status(200).json({ pet })
    }

    static async deletePetById (req, res) {
        
        const { id } = req.params

        if (!ObjectId.isValid(id)) {
            res.status(422).json({message: 'ID is not a valid'})
            return
        }
        const pet = await Pet.findById(id)

        if (!pet) {
            res.status(404).json({message: 'Pet not exist'})
            return
        }

        //console.log(pet)

        const token = getToken(req)

        const user = await getUserByToken(token)

        console.log(user)

        const petUserId = pet.user.id.toString()
        const UserId = user._id.toString()

        console.log(petUserId)
        
        if(petUserId !== UserId) {
            res.status(422).json({message: 'There was a problem processing your request, please try again later'})
            return
        }

        await Pet.findByIdAndRemove(id)

        res.status(200).json({message: 'Pet removed successfully'})
    }

    static async editPetById(req, res){
        const id = req.params.id
        const {name, age, weight, color, description} = req.body
        const image = req.files
        const available = true

        const updatePet = {}

        const token = getToken(req)

        const user = await getUserByToken(token)

        const currentPet = await Pet.findOne({_id: id})

        //console.log(currentPet)

        if(!currentPet){
            res.status(422).json({ message: 'Pet not exists' });
            return;
        }

        const userId = user._id.toString()
        
        const petUserId = currentPet.user.id.toString()

        if (userId !== petUserId) {
            res.status(422).json('There was a problem processing your request, please try again later')
            return
        }

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
            res.status(422).json({ message: 'Images is required' });
            return 
        }

        updatePet.name = name;
        updatePet.age = age;
        updatePet.weight = weight;
        updatePet.color = color;
        updatePet.description = description;

        updatePet.image = []
        
        image.map((image) => {
            updatePet.image.push(image.filename)
        })

        await Pet.findByIdAndUpdate(id, updatePet)

        res.status(200).json({message: 'Pet updated successfully '})
    }



}



