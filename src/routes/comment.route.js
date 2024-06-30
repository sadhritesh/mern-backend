import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  editComment,
  getPostComments,
  getcomments,
  likeComment,
} from '../controllers/comment.controller.js';

const router = express.Router();

router.post('/create', verifyJWT, createComment);
router.get('/getPostComments/:postId', getPostComments);
router.put('/likeComment/:commentId', verifyJWT, likeComment);
router.put('/editComment/:commentId', verifyJWT, editComment);
router.delete('/deleteComment/:commentId', verifyJWT, deleteComment);
router.get('/getcomments', verifyJWT, getcomments);

export default router;