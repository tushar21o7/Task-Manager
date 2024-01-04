import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
       type: String,
       required: [true, 'Please provide title'],
       maxLength: [20, 'Max length of title exceeded']
    },
    content: {
        type: String,
        required: [true, 'Content field cant be empty'],
        maxLength: [100, 'Max length of content exceeded']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

export const Task = mongoose.model('Task', taskSchema);