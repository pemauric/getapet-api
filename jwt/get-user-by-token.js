const jwt = require("jsonwebtoken");

const User = require("../models/User");

const getUserByToken = async (token) => {
    
    if (!token) {
        res.status(401).json('Access denied');
        return
    }
    
    const decoded = jwt.verify(token, "TranquilLlama$42JumpS3cure");

    const UserId = decoded._id

    const user = await User.findOne({id: UserId});

    return user;
}

module.exports = getUserByToken;