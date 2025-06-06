const express = require('express');

const { createPost, deletePost, getAllPosts, getPostById } = require('../controllers/post.controller')
const { authenticatedRequest } = require('../middleware/auth.middleware')

const router = express.Router();

router.use(authenticatedRequest);

router.post("/create-post", createPost);
router.get("/all-posts", getAllPosts);
router.get("/:id", getPostById);
router.delete("/:id", deletePost);

module.exports = router;
