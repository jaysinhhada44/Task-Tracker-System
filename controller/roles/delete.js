const Role = require('../../models/role.model')
const responseManager = require('../../utilities/response.manager')
const mongoose = require('mongoose')

exports.removeRole = async (req, res) => {
    try {
        const { roleid } = req.body
        const userid = req.user.userid

        if (!mongoose.Types.ObjectId.isValid(roleid)) {
            return responseManager.badrequest({ message: "Invalid role id" }, res)
        }

        const deleteRole = await Role.findByIdAndDelete({ _id: roleid, companyid: req.user.companyid })

        if (!deleteRole) {
            return responseManager.badrequest({ message: "Role not found." }, res)
        }

        return responseManager.onSuccess('Role removed successfully', deleteRole, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}