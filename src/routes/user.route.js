import { Router } from "express";
import { updateProfile, deleteProfile, getUsers, deleteUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlware.js";

const router = Router()

router.route("/update-profile").post(verifyJWT, upload.single("profilePicture"), updateProfile)
router.route("/delete-profile").delete(verifyJWT, deleteProfile)
router.route("/delete-user/:userId").delete(verifyJWT, deleteUser)
router.route("/getusers").get(verifyJWT, getUsers)

export default router;