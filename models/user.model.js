const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    companyid: {
        type: mongoose.Schema.Types.ObjectId
    },
    companyname: {
        type: String,
        // required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    phoneno: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        // enum: ['admin', 'manager', 'team leader', 'employee'],
        default: 'admin',
        required: true
    },
    // roleid:{
    //     type: mongoose.Types.ObjectId,
    //     required: true
    // },
    img: {
        type: String,
        default: ''
    },
    companywebsite: {
        type: String,
        default: ''
    },
    industry: {
        type: String,
        default: ''
    },
    attendanceAllowed: {
        type: Boolean,
        default: true
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
    }
}, { timestamps: true, strict: true })

module.exports = mongoose.model('User', userSchema)