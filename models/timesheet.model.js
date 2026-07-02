const mongoose = require('mongoose')

const timesheetSchema = new mongoose.Schema({
    companyid: {
        type: mongoose.Schema.Types.ObjectId
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true })

module.exports = mongoose.model(Timesheet, timesheetSchema)