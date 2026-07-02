const Member = require('../../models/member.model')
const Bucket = require('../../models/bucket.model')
const responseManager = require('../../utilities/response.manager')
const helper = require('../../utilities/helper')
const Role = require('../../models/role.model')

exports.createMember = async (req, res) => {
    try {

        const { memberid, firstname, lastname, phoneno, designation, email, password, roleid, img, } = req.body
        const userid = req.user.userid
        const companyid = req.user.companyid

        // if (!firstname || !lastname || !phoneno || !email || !password || !roleid) {
        //     return responseManager.badrequest({ message: "Please enter all required fields" }, res)
        // }

        if (memberid) {
            const existingMember = await Member.findById({ _id: memberid, companyid: req.user.companyid })

            if (!existingMember) {
                return responseManager.badrequest({ message: "Member not found" }, res)
            }

            const duplicateMember = await Member.findOne({
                _id: { $ne: memberid },
                companyid: req.user.companyid,
                $or: [{ email }, { phoneno }]
            })

            if (duplicateMember) {
                return responseManager.badrequest({ message: "Email or phone number already exists" }, res)
            }

            const updateData = { firstname, lastname, phoneno, email, designation, roleid, img }

            if (password && password.trim() !== "") {
                updateData.password = await helper.passwordEncryptor(password);
            }

            const updatedMember = await Member.findByIdAndUpdate({ _id: memberid, companyid: req.user.companyid }, { $set: updateData }, { new: true, runValidators: true })

            return responseManager.onSuccess('Member updated successfully!', updatedMember, res)

        } else {

            const existingMember = await Member.findOne({ companyid: req.user.companyid, $or: [{ email }, { phoneno }] })

            if (existingMember) {
                return responseManager.badrequest({ message: "Member already exist..." }, res)
            }

            const passwordEncryptor = await helper.passwordEncryptor(password)

            // const newMember = {
            //   firstname,
            //   lastname,
            //   phoneno,
            //   email,
            //   password: hashedPassword
            // }

            const addMember = await Member.create({
                firstname,
                lastname,
                img,
                phoneno,
                email,
                password: passwordEncryptor,
                designation,
                roleid,
                createdBy: userid,
                companyid
            })

            return responseManager.onSuccess('New Member Added Successfully!', addMember, res)

        }

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}