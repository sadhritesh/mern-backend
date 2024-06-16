
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asycHandler.js";
import { uploadFileOnCloudinary }  from "../utils/cloudinary.js"


const updateProfile = asyncHandler( async(req, res) => {

    const { username, email, password } = req.body 
    const fileLocalPath = req?.file?.path

    console.log(fileLocalPath);

    const alreadyUsedEmail = await User.findOne({
        email: email
    })

    if (alreadyUsedEmail) {
        if (req.user.email !== email) {
            throw new ApiError(409, "User already exist")
        }
    }
    
    const response = await  uploadFileOnCloudinary(fileLocalPath)

    const user = await User.findById(req.user._id)

    user.username = username || req.user.username 
    user.email = email || req.user.email 
    user.password = password || req.user.password 
    user.profilePicture = response?.url || req.user.profilePicture

    await user.save()

    const updatedUser = await User.findById(req.user._id).select("-password -refreshToken")

    return res
    .json(
        new ApiResponse(
            200,
            updatedUser,
            "User details updated successfully"
        )
    )

})

const deleteProfile = asyncHandler (async (req, res) => {

    const loggedInUser = req.user 
    const userId = loggedInUser._id

    const deletedUser = await User.findByIdAndDelete(userId)

    if (!deletedUser) {
        throw new ApiError (500, "Error occured, please try agin !")
    }

    return res
    .json(
        new ApiResponse (
            200,
            {},
            "User deleted successfully !"
        )
    )
})

const getUsers = async (req, res, next) => {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to see all users'));
    }
    try {
      const startIndex = parseInt(req.query.startIndex) || 0;
      const limit = parseInt(req.query.limit) || 9;
      const sortDirection = req.query.sort === 'asc' ? 1 : -1;
  
      const users = await User.find()
        .sort({ createdAt: sortDirection })
        .skip(startIndex)
        .limit(limit);
  
      const usersWithoutPassword = users.map((user) => {
        const { password, ...rest } = user._doc;
        return rest;
      });
  
      const totalUsers = await User.countDocuments();
  
      const now = new Date();
  
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      const lastMonthUsers = await User.countDocuments({
        createdAt: { $gte: oneMonthAgo },
      });
  
      res.status(200).json({
        users: usersWithoutPassword,
        totalUsers,
        lastMonthUsers,
      });
    } catch (error) {
      next(error);
    }
  };

  const deleteUser = async (req, res, next) => {
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
      return next(errorHandler(403, 'You are not allowed to delete this user'));
    }
    try {
      await User.findByIdAndDelete(req.params.userId);
      res.status(200).json('User has been deleted');
    } catch (error) {
      next(error);
    }
  };

export {
    updateProfile,
    deleteProfile,
    getUsers,
    deleteUser
}