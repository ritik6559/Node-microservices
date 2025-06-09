const logger = require('../utils/logger');
const Post = require("../models/Post");
const {validateCreatePost} = require("../utils/validation");

const invalidatePostCache = async (req, input) => {

    const cachedKey = `post:${input}`;
    await req.redisClient.del(cachedKey);

    const keys = await req.redisClient.keys("posts:*");

    if(keys.length > 0){
        await req.redisClient.redis.del(keys);
    }
}

const createPost = async (req, res) => {
    logger.info("Create post endpoint hit");
    try {
        const { error } = validateCreatePost(req.body);

        if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { content, mediaIds } = req.body;

        const newlyCreatedPost = new Post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || [],
        });

        await newlyCreatedPost.save();

        await invalidatePostCache(req, newlyCreatedPost._id);

        logger.info("Post created successfully", newlyCreatedPost);

        res.status(201).json({
            success: true,
            message: "Post created successfully",
        });
    } catch (e) {
        logger.error("Error creating post", error);
        res.status(500).json({
            success: false,
            message: "Error creating post",
        });
    }
}

const getAllPosts = async (req, res) => {
    try{

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = ( page - 1 ) * limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cacheKey);

        if( cachedPosts ){
            return res.json(JSON.parse(cachedPosts));
        }

        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const totalNoOfPosts = await Post.countDocuments();

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalNoOfPosts / limit),
            totalPosts: totalNoOfPosts
        }

        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result))

        res.json(result);
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
        const postId = parseInt(req.params.id);
        const cachekey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cachekey);

        if (cachedPost) {
            return res.json(JSON.parse(cachedPost));
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }

        await req.redisClient.setex(
            cachedPost,
            3600,
            JSON.stringify(post)
        );

        res.json(post);
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
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId,
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }

        await invalidatePostCache(req, req.params.id);

        res.json({
            message: "Post deleted successfully",
        });
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
