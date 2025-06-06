const logger = require('../utils/logger');
const {validateRegistration, validateLogin} = require("../utils/validation");
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken')
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

const loginUser = async (req, res) => {
    logger.info("Login endpoint hit...");
    try {
        const { error } = validateLogin(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            logger.warn("Invalid user");
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            logger.warn("Invalid password");
            return res.status(400).json({
                success: false,
                message: "Invalid password",
            });
        }
        const { accessToken, refreshToken } = await generateTokens(user);

        res.json({
            accessToken,
            refreshToken,
            userId: user._id,
        });
    } catch (e) {
        logger.error("Login error occurred", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const refreshToken = async (req, res) => {
    logger.info("Create refresh token endpoint hit...");
    try{
        const {  refreshToken } = req.body;

        if (!refreshToken) {
            logger.warn("No refresh token");
            return res.status(400).json({
                success: false,
                message: "Invalid password",
            });
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            logger.warn("Invalid or expired refresh token");

            return res.status(401).json({
                success: false,
                message: `Invalid or expired refresh token`,
            });
        }

        const user = await User.findById(storedToken.user);

        if (!user) {
            logger.warn("User not found");

            return res.status(401).json({
                success: false,
                message: `User not found`,
            });
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await generateTokens(user);

        await RefreshToken.deleteOne({ _id: storedToken._id });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

    } catch (e) {
        logger.error("Create refresh token error occurred", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

const logout = async (req, res) => {
    logger.info("Logout endpoint hit...");
    try{
        const { refreshToken } = req.body;

        if (!refreshToken) {
            logger.warn("Refresh token missing");
            return res.status(400).json({
                success: false,
                message: "Refresh token missing",
            });
        }

        const storedToken = await RefreshToken.findOneAndDelete({
            token: refreshToken,
        });

        if (!storedToken) {
            logger.warn("Invalid refresh token provided");
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        logger.info("Refresh token deleted for logout");

        res.json({
            success: true,
            message: "Logged out successfully!",
        });
    } catch (e) {
        logger.error("Logout error occurred", e);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logout,
}
