import { Router } from "express";
import { createPost, getPosts, deletePost, updatePost, updatePostImage } from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlware.js";

const router = Router()

router.route("/create-post").post(verifyJWT, upload.single("blogPost"), createPost)
router.route("/getposts").get(getPosts)
router.route("/deletepost/:postId/:userId").delete(verifyJWT, deletePost)
router.route("/update-post/:postId/:userId").put(verifyJWT,upload.single("blogPost"), updatePost)
router.route("/update-post-image/:postId/:userId").put(verifyJWT,upload.single("blogPost"), updatePostImage)

export default router

