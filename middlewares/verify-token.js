const jwt = require('jsonwebtoken');
const getToken = require('../jwt/get-token');

const verifyToken = (req, res, next) => {
    
    if (!req.headers.authorization) {
        res.status(401).json({message: 'Access denied'})
        return
    }

    const token = getToken(req);

    if (!token) {
        res.status(401).json('Access denied');
        return
    }

    try {
        const verified = jwt.verify(token,"TranquilLlama$42JumpS3cure");
        req.user = verified

        next();

    } catch (err) {
        res.status(400).json({message: 'Invalid token '})
    }

}

module.exports = verifyToken;

