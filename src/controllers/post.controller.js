
import Post from "../models/post.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asycHandler.js";
import { uploadFileOnCloudinary, deleteFileFromCloudinary }  from "../utils/cloudinary.js"


const createPost = asyncHandler( async (req, res) => {
    
    const fileLocalPath = req?.file?.path

    if (!req.user.isAdmin) {
        throw new ApiError (403, "Only admin can create the Post")
    }

    if (!req.body.title || !req.body.content) {
        throw new ApiError (400, "PLease provide all the required fields")
    }

    const isTitleExist = await Post.findOne({
        "title": req.body.title
    })

    if (isTitleExist) {
        throw new ApiError(409, "Post with the same title exist")
    }

    const response = await  uploadFileOnCloudinary(fileLocalPath)

    const slug = req.body.title
        .split(" ")
        .join("-")
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, "")

    const newPost = new Post({
        ...req.body,
        slug,
        userId: req.user._id,
        blogPost: response?.url || "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png"
    })

    const savedPost = await newPost.save()

    return res 
    .status(200)
    .json(
        new ApiResponse (
            200, 
            savedPost,
            "Post created successfully"
        )
    )
})

const getPosts = asyncHandler (async (req, res) => {

    const startIndex = parseInt(req.query.startIndex)||0;
    const limit = parseInt(req.query.limit)||9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const posts = await Post.find({
        ...(req.query.userId && { userId: req.query.userId }),
        ...(req.query.category && { category: req.query.category }),
        ...(req.query.slug && { slug: req.query.slug }),
        ...(req.query.postId && { _id: req.query.postId }),
        ...(req.query.searchTerm && {
            $or: [
                { title: { $regex: req.query.searchTerm, $options: 'i' } },
                { content: { $regex: req.query.searchTerm, $options: 'i' } }
            ]
        })
    })
    .sort({ updatedAt: sortDirection })
    .skip(startIndex)
    .limit(limit)

    const totalPosts = await Post.countDocuments();

    const now = new Date()

    const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth()-1,
        now.getDate()
    )
    
    const lastMonthPosts = await Post.countDocuments({
        createdAt: { $gte: oneMonthAgo }
    })
    return res 
    .status(200)
    .json(
        new ApiResponse (
            200, 
            {
                posts, totalPosts, lastMonthPosts
            },
            "all the posts"
        )
    )
})

const deletePost = asyncHandler (async (req, res) => {

    if (!req.user.isAdmin || req.user._id != req.params.userId) {
        throw new ApiError (
            403,
            "You are not allowed"
        )
    }

    const post = await Post.findById(req.params.postId)

    if (!post) {
        throw new ApiError (404, "Post not found")
    }

    await deleteFileFromCloudinary(post.blogPost)

    const deletedPost = await Post.findByIdAndDelete(req.params.postId)

    if (!deletedPost) {
        throw new ApiError (
            500, "Please try again"
        )
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Post deleted successfully"
        )
    )
})

const updatePost = asyncHandler (async (req, res) => {

    if (!req.user.isAdmin || req.user._id != req.params.userId) {
        throw new ApiError(403, "You can't edit it")
    }    

    const oldPost = await Post.findById(req.params.postId)

    const updatedPost = await Post.findByIdAndUpdate(
        req.params.postId,
        {
            $set : {
                title: req.body.title || oldPost.title,
                content: req.body.content || oldPost.content,
                category: req.body.category || oldPost.category,
            }
        }, 
        { new:true }
    )

    if (!updatedPost) {
        throw new ApiError(500, "Post not updated, please try again")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse (
            200,
            updatedPost,
            "Post updated successfully"
        )
    )
})

const updatePostImage = asyncHandler (async (req, res) => {
    //get the post id and user id 
    //validate the user 
    //get the image's required details
    //updated the database 
    
    if (!req.user.isAdmin || req.user._id != req.params.userId) {
        throw new ApiError(403, "You can't edit it")
    }    

    const oldPost = await Post.findById(req.params.postId)

    const fileLocalPath = req?.file?.path

    let response = ""
    if (fileLocalPath) {
        response = await  uploadFileOnCloudinary(fileLocalPath)
        await deleteFileFromCloudinary(oldPost.blogPost)
    }

    const updatedPost = await Post.findByIdAndUpdate(
        req.params.postId,
        {
            $set : {
                title: req.body.title || oldPost.title,
                content: req.body.content || oldPost.content,
                category: req.body.category || oldPost.category,
                blogPost: response?.url || oldPost.blogPost
            }
        }, 
        { new:true }
    )

    if (!updatedPost) {
        throw new ApiError(500, "Post not updated, please try again")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse (
            200,
            updatedPost,
            "Image updated successfully"
        )
    )
    
})

export {
    createPost,
    getPosts,
    deletePost,
    updatePost,
    updatePostImage
}