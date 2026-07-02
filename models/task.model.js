const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    companyid: {
        type: mongoose.Schema.Types.ObjectId
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "Member",
        required: true
    },
    bucketid: {
        type: mongoose.Types.ObjectId,
        // ref: "Bucket"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "User"
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    priority: {
        type: String,
        // enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        // enum: ["todo", "in_progress", "completed"],
        default: "todo"
    },
    attachmentRequired: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: Date,
        default: Date.now
    },
    dueTime: {
        type: String
    },
    workStartedAt: {
        type: Date,
        default: null
    },
    workCompletedAt: {
        type: Date,
        default: null
    },
    totalWorkedMinutes: {
        type: Number,
        default: 0
    },
    recurringTask: {
        type: Boolean,
        default: false
    },
    recurringType: {
        type: String,
        default: 'Daily'
    },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema)





// const mongoose = require('mongoose')

// const todoSchema = new mongoose.Schema({
//     text: {
//         type: String,
//         required: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     }
// })

// const taskSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         default: ''
//     },
//     description: {
//         type: String,
//         default: ''
//     },
//     status: {
//         type: String,
//         enum: ["todo", "inprogress", "done"],
//         default: "todo"
//     },
//     createdBy: {
//         type: mongoose.Types.ObjectId,
//         // ref: 'User'
//     },
//     assignedTo: {
//         type: mongoose.Schema.Types.ObjectId,
//         // ref: "User"
//     },
//     duDate: {
//         type: Date,
//         required: true
//     },
//     todoChecklist: [todoSchema],
//     progress: {
//         type: Number,
//         default: 0
//     }
// }, { timestamps: true, strict: true })

// module.exports = mongoose.model('Task', taskSchema)