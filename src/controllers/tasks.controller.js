import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";
import { StatusCodes } from "http-status-codes";

const getAllTasks = asyncHandler( async (req, res) => {
    const tasks = await Task.find({createdBy: req.user._id});
    res.status(200).json({tasks});
})

const getTask = asyncHandler( async (req, res) => {
    const {
       user: {_id: userId},
       params: {id: taskId}
    } = req;
    const task = await Task.findOne({
        createdBy: userId,
        _id: taskId
    })

    if(!task) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `No task with id ${taskId}`);
    }

    res
    .status(StatusCodes.OK)
    .json(
        new ApiResponse(
            StatusCodes.OK,
            task,
            'Success'
        )
    )
})

const createTask = asyncHandler( async (req, res) => {
    req.body.createdBy = req.user._id;
    const task = await Task.create(req.body);
    res.status(200).json({task});
})

const updateTask = asyncHandler( async (req, res) => {
    const {
       body: {title, content},
       params: {id: taskId},
       user: {_id: userId}
    } = req;

    if (title === '' || content === '') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Title or content fields cant be empty');
    }

    const task = await Task.findByIdAndUpdate(
        { 
            _id: taskId, createdBy: userId 
        },
        req.body,
        { 
            new: true, runValidators: true 
        }
    )

    if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, `No job with id ${taskId}`);
    }
    
    res
    .status(StatusCodes.OK)
    .json(
        new ApiResponse(StatusCodes.OK, task, 'Task updated sucessfully')
    )
})

const deleteTask = asyncHandler( async (req, res) => {
    const {
       user: {_id: userId},
       params: {id: taskId}
    } = req;

    const task = await Task.deleteOne({
        createdBy: userId,
        _id: taskId
    })

    if(!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, `No task with id ${taskId}`);
    }

    res.status(StatusCodes.OK).send();
})

export {
    getAllTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask
}