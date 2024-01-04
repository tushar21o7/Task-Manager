import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import StatusCodes from 'http-status-codes';

const generateAccessAndRefreshToken = async (userId) => {
   try {
       const user = await User.findById(userId);
       const accessToken = user.generateAccessToken();
       const refreshToken = user.generateRefreshToken();

       user.refreshToken = refreshToken;
       await user.save({validateBeforeSave: false});
       
       return {accessToken, refreshToken};

   } catch (error) {
       console.log(error);
       throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Something went wrong while generating tokens');
   }
}

const registerUser = asyncHandler( async (req, res) => {
    const {username, email, password} = req.body;

    if([username, email, password].some((field) => field?.trim() === "")) {
       throw new ApiError(StatusCodes.BAD_REQUEST, 'All fields are required');
    }

    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })

    if(existedUser) {
       throw new ApiError(StatusCodes.BAD_REQUEST, 'User with same email or username already exists');
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email, password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser) {
       throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Something went wrong while registering');
    }

    res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.OK, createdUser, 'User registered successfully!'));
})

const loginUser = asyncHandler( async (req, res) => {
    const { username, email, password } = req.body;

    if(!username && !email) {
       throw new ApiError(StatusCodes.BAD_REQUEST, 'All fields are required');
    }

    const user = await User.findOne({$or: [{email}, {username}]});
    if(!user) {
       throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid user credentials');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) {
       throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid user credentials');
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(StatusCodes.OK)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json( 
        new ApiResponse(
            StatusCodes.Ok,
            { user: loggedInUser, accessToken, refreshToken },
            'User logged in successfully'
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findOneAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        { 
            new: true 
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out'));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized request');
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token')
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token is expired or used')
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(StatusCodes.OK)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', newRefreshToken, options)
        .json(
            new ApiResponse(
                StatusCodes.OK, 
                {accessToken, refreshToken: newRefreshToken},
                'Access token refreshed'
            )
        )
    } catch (error) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, error?.message || 'Invalid refresh token');
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    generateAccessAndRefreshToken,
    refreshAccessToken
}