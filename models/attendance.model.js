const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
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
    date: {
        type: String,
        // required: true
    },
    loginTime: {
        type: Date,
        default: null
    },
    logoutTime: {
        type: Date,
        default: null
    },
    isWorking: {
        type: Boolean,
        default: false
    },
    isOnBreak: {
        type: Boolean,
        default: false
    },
    currentBreakStart: {
        type: Date,
        default: null
    },
    totalWorkedSeconds: {
        type: Number,
        default: 0
    },
    totalBreakSeconds: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

// One attendance record per employee per day
attendanceSchema.index({ companyid: 1, userid: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("Attendance", attendanceSchema)