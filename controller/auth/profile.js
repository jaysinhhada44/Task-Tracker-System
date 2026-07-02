const User = require('../../models/user.model')
const Member = require('../../models/member.model')
const Role = require('../../models/role.model')
const mongoose = require('mongoose')
const responseManager = require('../../utilities/response.manager')
const helper = require('../../utilities/helper')
const { saveToCloud, pdfUpload } = require('../../utilities/cloudinary')


exports.updatedProfile = async (req, res) => {
    try {
        const userid = req.user.userid
        const { firstname, lastname, email, phoneno, password, role, designation, companywebsite, industry, attendanceAllowed } = req.body
        const companyid = req.user.userid

        const user = await User.findById({ _id: userid, companyid: req.user.companyid })
        if (!user) {
            return responseManager.badrequest({ message: 'User not found' }, res)
        }

        if (firstname !== undefined) user.firstname = firstname
        if (lastname !== undefined) user.lastname = lastname
        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userid }, companyid: req.user.companyid })
            if (existingEmail) {
                return responseManager.badrequest({ message: 'Email already in use' }, res)
            }
            user.email = email
        }
        if (phoneno !== undefined) user.phoneno = phoneno
        if (role !== undefined) user.role = role
        if (designation !== undefined) user.designation = designation
        // if (companyname !== undefined) user.companyname = companyname
        if (companywebsite !== undefined) user.companywebsite = companywebsite
        if (industry !== undefined) user.industry = industry
        if (attendanceAllowed !== undefined) user.attendanceAllowed = attendanceAllowed
        // if (password) {
        //     user.password = await helper.passwordEncryptor(password)
        // }

        await user.save()

        const updatedUser = await User.findById({ _id: userid, companyid: req.user.companyid }).select('-password')

        return responseManager.onSuccess('Profile updated successfully', updatedUser, res)

        // const getUser = await User.findById(id).select('-password')

        // if (!getUser) {
        //     return responseManager.badrequest({ message: "User doesn't exist.." }, res)
        // }

        // return responseManager.onSuccess('User Profile', getUser, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}

exports.profile = async (req, res) => {
    try {
        const userid = req.user.userid;
        let user = await User.findById(userid).select('-password').lean()

        if (!user) {
            user = await Member.findById(userid)
                .select('-password')
                .populate('roleid', 'rolename')
                .lean()
        }

        if (!user) {
            return responseManager.badrequest({ message: "Invalid Username and Password" }, res)
        }

        return responseManager.onSuccess('Profile fetched successfully', user, res);

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res);
    }
}

exports.uploadFile = async (req, res) => {
    try {

        if ((!req.file && !req.files) || (req.files && req.files.length === 0)) {
            return responseManager.badrequest({ message: "Please upload a file" }, res)
        }

        if (req.file) {
            let resourceType = "auto"
            let parentFolder = ""
            if (["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)) {
                resourceType = "image"
                parentFolder = "images"
            }

            else if (req.file.mimetype === "application/pdf") {
                resourceType = "raw"
                parentFolder = "catalogs"
            } 

            else {
                return responseManager.badrequest({ message: "Unsupported file type." }, res)
            }

            const uploadedFile = await saveToCloud(req.file, "crud-app", parentFolder, "uploads", resourceType)

            return responseManager.onSuccess("File uploaded successfully!", uploadedFile, res)
        }
    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}