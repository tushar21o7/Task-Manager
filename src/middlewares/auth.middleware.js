import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import StatusCodes from 'http-status-codes';

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
        if(!token) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized request');
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid access token');
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, error?.message || 'Invalid access token');
    }
})