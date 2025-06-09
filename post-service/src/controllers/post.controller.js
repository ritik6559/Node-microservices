const logger = require('../utils/logger');
const Post = require("../models/Post");

const createPost = async (req, res) => {
    try{

        const {content, mediaIds} = req.body;

        const newPost = new Post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || [],
        });

        await newPost.save();

        logger.info("Post created successfully.", JSON.stringify(newPost));

        res.status(201).json({
            success: true,
            message: "post created successfully",
            newPost
        });

    } catch (e) {
        logger.error('Error creating post', e);
        return res.status(500).json({
            success: false,
            message: 'Error creating post',
        })
    }
}

const getAllPosts = async (req, res) => {
    try{

    } catch (e) {
        logger.error('Error fetching all posts', e);
        return res.status(500).json({
            success: false,
            message: 'Error fetching all posts',
        })
    }
}

const getPostById = async (req, res) => {
    try{

    } catch (e) {
        logger.error('Error getting post', e);
        return res.status(500).json({
            success: false,
            message: 'Error getting post',
        })
    }
}

const deletePost = async (req, res) => {
    try{

    } catch (e) {
        logger.error('Error deleting post', e);
        return res.status(500).json({
            success: false,
            message: 'Error deleting post',
        })
    }
}

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
}
