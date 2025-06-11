const express = require('express');
const multer = require('multer');

const { uploadMedia } = require('../controllers/media.controller')
const { authenticateRequest } = require("../middlewares/auth-middleware");
const logger = require("../utils/logger");
const {route} = require("express/lib/application");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
}).single("file");

router.post('/upload', authenticateRequest, (req, res, next) => {
    upload(req, res, function (err){
        if( err instanceof multer.MulterError ) {
            logger.error('Multer error: ' + err.message)
            return res.status(400).json({
                message: "Multer error while uploading",
                error: err.message,
                status: err.stack,
            });
        } else if(err){
            logger.error('Unknown error: ' + err.message)
            return res.status(400).json({
                message: "Unknown error while uploading",
                error: err.message,
                status: err.stack,
            });
        }

        if ( !req.file ) {
            return res.status(400).json({
                message: "No file found",
            })
        }

        next();
    })
}, uploadMedia);

module.exports = router;
