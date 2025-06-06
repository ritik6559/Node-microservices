const logger = require('../utils/logger');

const authenticatedRequest = (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if(!userId){
        logger.error("User ID is missing");
        return res.status(401).json({
            success: false,
            message: 'Not logged in'
        });
    }

    req.user = {userId};

    next();
}

module.exports = {authenticatedRequest};
