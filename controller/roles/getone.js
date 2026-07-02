const Role = require('../../models/role.model')
const responseManager = require('../../utilities/response.manager')

exports.oneRole = async (req, res) => {
    try {
        const { roleid } = req.body
        const userid = req.user.userid

        if(!roleid){
            return responseManager.badrequest({ message: "Please enter Id..."}, res)
        }

        const roles = await Role.findById({ _id: roleid, companyid: req.user.companyid })

        if (!roles) {
            return responseManager.badrequest({ message: "Role not found" }, res)
        }

        return responseManager.onSuccess("Role fetched", roles, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}