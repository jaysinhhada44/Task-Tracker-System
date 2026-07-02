const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
    companyid: {
        type: mongoose.Schema.Types.ObjectId
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId
    },
    title: {
        type: String
    },
    message: {
        type: String
    },
    type: {
        type: String
    },
    referenceid: {
        type: mongoose.Schema.Types.ObjectId
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("Notification", notificationSchema)