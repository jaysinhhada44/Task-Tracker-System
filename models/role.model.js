const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
    companyid: {
        type: mongoose.Schema.Types.ObjectId
    },
    rolename: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId
    },
    updatedBy: {
        type: mongoose.Types.ObjectId
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Role', roleSchema)