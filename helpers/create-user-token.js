const jwt = require('jsonwebtoken');

const createUserToken = async (user, req, res ) => {
    const token = jwt.sign({
        name : user.name,
        id : user._id
    }, "TranquilLlama$42JumpS3cure");

    res.status(200).json({
        message: 'Token created successfully', 
        token: token, 
        userId: user._id
    });
};

module.exports = createUserToken