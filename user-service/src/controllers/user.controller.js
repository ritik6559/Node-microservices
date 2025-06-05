const logger = require('../utils/logger');
const {validateRegistration} = require("../utils/validation");
const User = require('../models/User');
const generateTokens = require("../utils/generate-token");

const registerUser = async (req, res) => {
    logger.info('Registration endpoint hit...')
    try{

        const { error } = validateRegistration(req.body);

        if(error){
            logger.warn('Validation error', error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { email, password, username } = req.body;

        let existingUser = await User.findOne({
            $or: [
                {email},
                {username}
            ]
        });

        if(existingUser){
            logger.warn('User already exists');
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        let newUser = await User.create({
            username,
            email,
            password
        });

        logger.info('User created', newUser._id);

        const { accessToken, refreshToken } = await generateTokens(newUser);

        res.status(200).json({
            success: true,
            message: 'User created successfully',
            accessToken,
            refreshToken,
        });
    } catch (e) {
        logger.error('Error creating user', e);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        })
    }
}

module.exports = {
    registerUser,
}
