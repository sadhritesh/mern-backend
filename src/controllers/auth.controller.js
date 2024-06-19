import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asycHandler.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    domain:"https://sadh-blog-app.netlify.app",
    sameSite:'none'
}

const generateAccessAndRefreshToken = async (userId) => {

    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refershToken = await user.generateRefreshToken();

    user.refershToken = refershToken;

    await user.save()

    return {
        accessToken,
        refershToken
    }
}

const signUp = asyncHandler ( async(req, res, next) => {
    //get the user's details from the body 
    //validate the details 
    //register the user 
    //res with success msg.

    const { username, email, password } = req.body 

    if (
        [username, email, password].some((field) => field === undefined || field.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = await User.findOne (
        {
            $or: [ { username }, { email }]
        }
    )
    console.log(existedUser);

    if (existedUser) {
        throw new ApiError(409, "username or email already used")
    }

    const user = await User.create({
        username,
        email,
        password
    })

    const createdUser = await User.findById(user._id)?.select("-password")

    if (!createdUser) {
        throw new ApiError(500, "server failed while creating user, please try agin")
    }

    return res 
    .status(201)
    .json(
        new ApiResponse(201, createdUser, "user created successfully")
    )
})

const signIn = asyncHandler (async (req, res, next) => {
    //get the details from the req->body
    //validate the details 
    //query the db 
    //if user exist with the email, compare the password 
    //generate refesh and acces token 
    //return the response with user details and set the cookies 

    const { email, password } = req.body 

    if (!email || !password) {
        throw new ApiError(400, "all fields are required")
    }

    const user = await User.findOne({
        email
    })

    if (!user) {
        throw new ApiError(404, "no user found with email")
    }

    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
        throw new ApiError(401, "incorrect password")
    }

    const { accessToken, refershToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    return res 
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refershToken, cookieOptions)
    .json(
        new ApiResponse(
            200,
            {...loggedInUser, accessToken, refershToken},
            "user logged in successfully"
        )
    )

})

const signOut = asyncHandler (async (req, res) => {
    //clear the cookies 
    return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse (
            200,
            {},
            "User logged out successfully !"
        )
    )
})

export {
    signUp,
    signIn,
    signOut
}