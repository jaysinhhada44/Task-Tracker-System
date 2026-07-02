const mongoose = require('mongoose')

const bucketSchema = new mongoose.Schema({
    companyid: {
        type: mongoose.Schema.Types.ObjectId
    },
    bucketname: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model('Bucket', bucketSchema)