const mongoose = require('mongoose')

const memberSchema = new mongoose.Schema({
    companyid:{
        type: mongoose.Schema.Types.ObjectId
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default: ''
    },
    designation: {
        type: String,
        required: true
    },
    roleid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    email: {
        type: String,
        required: true
    },
    phoneno: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model('Member', memberSchema)