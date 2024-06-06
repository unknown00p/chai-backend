import { User } from "../models/user.models.js";
import { apiErrorrs } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asynceHandler.js";
import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import { apiResponce } from "../utils/apiResponce.js";

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

    if ([fullname, username, email, password,].some((feild) => feild ?.trim() === "")) {
        throw new apiErrorrs( 404,'please fill all the required parameters' )
    }

    const existedUserWithUsername = await User.findOne({username})

    if (existedUserWithUsername) {
        throw new apiErrorrs(409, 'User with the same username already exists')
    }

    const existedUserWithEmail= await User.findOne({email})

    if (existedUserWithEmail) {
        throw new apiErrorrs(409, 'User with the same email already exists')
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new apiErrorrs(400, 'avatar is required')
    }

    console.log('req.files value ',req.files);
    console.log("avatar in local File ",avatarLocalPath);
    console.log("coverImage in local File ",coverImageLocalPath);

    const avatar = await uploadFileToCloudinary(avatarLocalPath)
    const coverImage = await uploadFileToCloudinary(coverImageLocalPath)
    console.log("returend avatar from cloudinary ", avatar);
    console.log("returend coverImage from cloudinary ", coverImage);


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

    return res.status(201).json(
        new apiResponce(200,createdUser, "user registered successfully")
    )


})

export { registerUser }