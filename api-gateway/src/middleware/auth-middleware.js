import logger from "../utils/logger";
import app from "express-http-proxy/lib/mockHTTP";
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.error(`Invalid token: ${token}`);
        return res.status(401).send({
            message: 'Invalid token',
            success: false,
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.error(`Invalid token: ${token}`);
            return res.status(401).json({
                message: 'Invalid token',
                success: false,
            })
        } else {
            req.user = decoded;
        }
    });

    next();
}

module.exports = validateToken
