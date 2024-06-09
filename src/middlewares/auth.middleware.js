import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynceHandler.js";
import { User } from "../models/user.models.js";
import { apiErrorrs } from "../utils/apiErrors.js";

const verifyJwt = asyncHandler(async (req, res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new apiErrorrs(401,"Unauthorization request")
        }
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(verified._id).select("-password -refreshToken")
        if (!user) {
            throw new apiErrorrs(401, "Invalid accessToken")
        }
        
        req.user = user

        next()

    } catch (error) {
        throw new apiErrorrs(401, error?.message || 'invalid access token')
    }
})

export{verifyJwt}