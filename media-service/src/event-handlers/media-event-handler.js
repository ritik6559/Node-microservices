const logger = require('../utils/logger');
const Media = require("../models/Media");
const {deleteMediaFromCloudinary} = require("../utils/cloudinary");

const handlePostDeleted = async (event) => {
    console.log(event);
    const { postId, mediaIds } = event;
    try{

        const mediaToDelete = await Media.find({_id: {$in: mediaIds}});

        for ( let media of mediaToDelete ){
            await deleteMediaFromCloudinary(media.publicId);
            await Media.deleteOne({_id: media._id})

            logger.info('Media deleted from DB', media);
        }

        logger.info('Media deleted from cloudinary', postId);

    } catch (error) {
        logger.error('Error handling post deleted event', error);
    }
}

module.exports = {
    handlePostDeleted
}
