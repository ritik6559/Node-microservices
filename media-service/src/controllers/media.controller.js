const logger = require('../utils/logger');
const Media = require("../models/Media");
const uploadMediaToCloudinary = require('../utils/cloudinary')

const uploadMedia = async (req, res) => {
    logger.info('Uploading media...');
    try{

        if( !req.file ){
            logger.error('No file found');
            return res.status(400).send({
                message: 'No file found',
                success: false
            })
        }

        const { originalname, mimetype, buffer } = req.file;
        const userId = req.user.userId;

        logger.info('Uploading file...', JSON.stringify({ originalname, mimetype, buffer }));

        const cloudinaryResult = await uploadMediaToCloudinary(req.file);

        logger.info(
            `Cloudinary upload successfully. Public Id: - ${cloudinaryResult.public_id}`
        );

        const newMedia = new Media({
            public_id: cloudinaryResult.public_id,
            originalName: originalname,
            mimeType: mimetype,
            url: cloudinaryResult.secure_url,
            userId: userId,
        });

        await newMedia.save();

        res.status(201).json({
            success: true,
            mediaId: newMedia._id,
            url: newMedia.url,
            message: "Media upload is successfully",
        });
    } catch (error) {
        logger.error("Error creating media", error);
        res.status(500).json({
            success: false,
            message: "Error creating media",
        });
    }
}

module.exports = {
    uploadMedia
};
