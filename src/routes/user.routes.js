import { Router } from "express";
import { changePassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateCoverImage, updateUserAvatar, updateUserProfile } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    },
    {
        name: 'coverImage',
        maxCount: 1
    }
]),registerUser)

router.route('/login').post(loginUser)

// authenticated routing
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/genrateRefreshToken").post(refreshAccessToken)
router.route('/changePassword').post(verifyJwt,changePassword)
router.route('/currentUser').post(verifyJwt,getCurrentUser)
router.route('/updateUserProfile').post(verifyJwt,updateUserProfile)
router.route('/updateUserProfile').post(verifyJwt,updateUserProfile)
router.route("/updateUserAvatar").post(upload.single("avatar"),verifyJwt,updateUserAvatar)
router.route("/updateCoverImage").post(upload.single("coverImage"),verifyJwt,updateCoverImage)
router.route("/getUserChannelProfile").post(verifyJwt,getUserChannelProfile)
router.route("/getWatchHistory").post(verifyJwt,getWatchHistory)

export default router