const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
    companyid: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        // index: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        // index: true
    },
    leaveType: {
        type: String,
        // enum: ['Casual', 'Sick', 'Paid', 'Half Day', 'Work From Home'],
        // required: true
    },
    reason: {
        type: String,
        // required: true
    },
    fromDate: {
        type: Date,
        // required: true
    },
    toDate: {
        type: Date,
        // required: true
    },
    totalDays: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        // enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId
    },
    approvedDate: {
        type: Date
    },
    remarks: {
        type: String,
        default: ''
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Leave', leaveSchema)