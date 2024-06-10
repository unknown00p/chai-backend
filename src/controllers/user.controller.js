import { User } from "../models/user.models.js";
import { apiErrorrs } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asynceHandler.js";
import { deleteFileFromCloudinary, uploadFileToCloudinary } from "../utils/cloudinary.js";
import { apiResponce } from "../utils/apiResponce.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const genrateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId)

    const accessToken = await user.genrateAccessToken()
    const refreshToken = await user.genrateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
}

const registerUser = asyncHandler(async (req, res) => {
    // Get userDetails from frontend ---
    // validation ---
    // check if user already exits ---
    // check for images, check for avtars ---
    // upload images and avtar on cloudinary ---
    // create user object - create entry in db ---
    // remove password and refresh token from responce ---
    // check if we got userDetails successfully from db ---
    // send response back to frontend ---


    const { fullname, username, email, password } = req.body

    if ([fullname, username, email, password,].some((feild) => feild?.trim() === "")) {
        throw new apiErrorrs(404, 'please fill all the required parameters')
    }

    const existedUserWithUsername = await User.findOne({ username })

    if (existedUserWithUsername) {
        throw new apiErrorrs(409, 'User with the same username already exists')
    }

    const existedUserWithEmail = await User.findOne({ email })

    if (existedUserWithEmail) {
        throw new apiErrorrs(409, 'User with the same email already exists')
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new apiErrorrs(400, 'avatar is required')
    }

    // console.log('req.files value ',req.files);
    // console.log("avatar in local File ",avatarLocalPath);
    // console.log("coverImage in local File ",coverImageLocalPath);

    const avatar = await uploadFileToCloudinary(avatarLocalPath)
    const coverImage = await uploadFileToCloudinary(coverImageLocalPath)
    // console.log("returend avatar from cloudinary ", avatar);
    // console.log("returend coverImage from cloudinary ", coverImage);

    if (!avatar) {
        throw new apiErrorrs(400, 'avatar is required')
    }

    const user = await User.create({
        username,
        fullname,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if (!createdUser) {
        throw new apiErrorrs(500, 'something went wrong while creating the user')
    }

    // const {refreshToken,accessToken} = await genrateAccessAndRefreshToken(createdUser._id)

    return res
        .status(201)
        // .cookie("accessToken", accessToken)
        // .cookie("refreshToken", refreshToken)
        .json(
            new apiResponce(200, createdUser, "user registered successfully")
        )


})

const loginUser = asyncHandler(async (req, res) => {
    // get userData from frontend
    // check if the we got all required Data from user or not -- if not throw an error
    // check if the user in database exist or not -- if not throw an error
    // check the password
    // get the matched user from dataBase
    // give the user access and refresh token
    // return the user

    const { email, password } = req.body

    if (!email) {
        throw new apiErrorrs(400, "Email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new apiErrorrs(404, "user does not exists please register")
    }

    const currectPassword = await user.isPasswordCorrect(password)

    if (!currectPassword) {
        throw new apiErrorrs(401, "Incorect password")
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user._id)
    // const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // const removePasswordAndRefreshToken = user
    const UpdatedLoggedInUser = Object.assign(user, { password: "", refreshToken: "" })

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponce(
                200,
                {
                    user: UpdatedLoggedInUser,
                    accessToken,
                    refreshToken
                },
                "user logged in succesfully"
            )
        )



})

const logoutUser = asyncHandler(async (req, res) => {
    // const userId = await req.user._id
    // console.log(userId);
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponce(200, {}, "User logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const IncomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
        // console.log(req.cookies);

        if (!IncomingRefreshToken) {
            throw new apiErrorrs(401, "User unauthorized token dosnt match")
        }

        const verifyedToken = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (!verifyedToken) {
            throw new apiErrorrs(401, "User unauthorized token dosnt match")
        }

        const user = await User.findById(verifyedToken._id)

        // console.log("refreshToken in dataBase ", user);

        if (IncomingRefreshToken !== user?.refreshToken) {
            throw new apiErrorrs(401, "provided refreshToken does not match")
        }

        const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(user._id)

        // console.log("access token ",accessToken);
        // console.log("refresh token ",refreshToken);
        // console.log(user);

        const options = {
            httpOnly: true,
            secure: true
        }

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new apiResponce(200, {
                    refreshToken,
                    refreshToken
                },
                    "accessToken refreshed Successfully"
                )
            )


    } catch (error) {
        throw new apiErrorrs(401, "unauthorized")
    }
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body

    const user = await User.findById(req.user?._id)
    console.log(user);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    console.log("check if the password is correct: ", isPasswordCorrect);


    if (!isPasswordCorrect) {
        throw new apiErrorrs(400, "incorrect password does not match")
    }

    if (newPassword !== confirmPassword) {
        throw new apiErrorrs(400, "password does not match")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    console.log(user.password);

    res
        .status(200)
        .json(
            new apiResponce(200, {}, "password changed successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await req.user
    if (!user) {
        throw new apiErrorrs(401, "user not found")
    }

    res
        .status(200)
        .json(
            new apiResponce(200,
                {
                    currentUser: user
                },
                "got the current user Successfully"
            )
        )
})

const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    console.log(fullname, email);

    if (!(fullname || email)) {
        throw new apiErrorrs(400, "all feilds are required")
    }

    const userId = req.user?._id

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!user) {
        throw new apiErrorrs(404, "user not found")
    }

    res
        .status(200)
        .json(
            new apiResponce(200, {
                user: user
            }, "profile updated successfully")
        )
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file.path

    if (!avatarLocalPath) {
        throw new apiErrorrs(400, "avatar is required")
    }

    const retriveId = req.user.coverImage.split("/",).pop().split(".")[0]

    console.log("avatarLocalpath: ", avatarLocalPath);

    const getAvatarFromCloudinary = await uploadFileToCloudinary(avatarLocalPath)

    const userWithUpdatedAvatar = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: getAvatarFromCloudinary.url
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    await deleteFileFromCloudinary(retriveId)

    res
        .status(200)
        .json(
            new apiResponce(200, { userWithUpdatedAvatar }, "avatar got updated succesfully")
        )

})

const updateCoverImage = asyncHandler(async (req, res) => {
    const localCoverImagePath = req.file?.path

    if (!localCoverImagePath) {
        throw new apiErrorrs(
            400,
            "cover image is required"
        )
    }
    const retriveId = req.user.coverImage.split("/",).pop().split(".")[0]

    const uploadedOnClodinary = await uploadFileToCloudinary(localCoverImagePath)

    // console.log("reqested user: ",retriveId);

    if (!uploadedOnClodinary) {
        throw new apiErrorrs(
            500,
            "Failed to upload cover image to cloudinary"
        )
    }

    const userWithCoverImageChanged = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: uploadedOnClodinary.url
            }
        },
        {
            new: true
        }
    ).select(
        "-password -refreshToken"
    )

    await deleteFileFromCloudinary(retriveId)

    res
        .status(200)
        .json(
            new apiResponce(200, { userWithCoverImageChanged }, "cover image got updated succesfully")
        )


})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.query

    if (!username?.trim()) {
        throw new apiErrorrs(200,
            "username is required"
        )
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribeTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                subscribeToCount: {
                    $size: "$subscribeTo"
                },

                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscribe"] },
                        then: true,
                        else: false
                    }

                }
            },
        },
        {
            $project: {
                username: 1,
                email: 1,
                fullname: 1,
                avatar: 1,
                coverImage: 1,
                subscribers: 1,
                subscribeTo: 1,
                subscriberCount: 1,
                subscribeToCount: 1,
                isSubscribed: 1
            }
        }
    ])


    if (!channel?.length) {
        throw new apiErrorrs(404,
            "channel not found"
        )
    }

    console.log(channel);

    return res
        .status(200)
        .json(
            new apiResponce(200,
                { channel: channel[0] },
                "channel fetched successfully"
            )
        )

})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        avatar: 1,
                                        fullname: 1,
                                        username: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if (!user?.length) {
        throw new apiErrorrs(404,
            "No watch history found"
        )
    }

   return res
    .status(200)
    .json(
        new apiResponce(200,
            {
                user: user[0].watchHistory
            },
            "Watch history fetched successfully"
        )
    )
})


export { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateUserProfile, updateUserAvatar, updateCoverImage, getUserChannelProfile,getWatchHistory }