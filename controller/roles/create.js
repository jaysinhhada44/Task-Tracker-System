const Role = require('../../models/role.model');
const responseManager = require('../../utilities/response.manager');

exports.createRole = async (req, res) => {
    try {

        const { roleid, rolename } = req.body
        const userid = req.user.userid
        const companyid = req.user.companyid

        if (roleid) {

            const existRole = await Role.findById(roleid)

            if (!existRole) {
                return responseManager.badrequest({ message: "Role not found" }, res)
            }

            const duplicateRole = await Role.findOne({ rolename, companyid: req.user.companyid, _id: { $ne: roleid } })

            if (duplicateRole) {
                return responseManager.badrequest({ message: "Role already exist" }, res)
            }

            const updateRole = await Role.findByIdAndUpdate(
                { _id: roleid, companyid: req.user.companyid }, 
                { rolename }, 
                { new: true, runValidators: true }
            )

            return responseManager.onSuccess('Role updated successfully', updateRole, res)
        } else {

            const existingRole = await Role.findOne({ rolename, companyid: req.user.companyid })

            if (existingRole) {
                return responseManager.badrequest({ message: "Role already exist..." }, res)
            }

            const role = await Role.create({ rolename, createdBy: userid, companyid })

            return responseManager.onSuccess('Role created successfully', role, res)
        }

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}





// exports.createRole = async (req, res) => {
//     try {
//         const { rolename } = req.body

//         if (!rolename) {
//             return responseManager.badrequest({ message: "Please enter rolename" }, res)
//         }

//         const existRole = await Role.findOne({ name: rolename }).lean()

//         if (existRole) {
//             return responseManager.badrequest({ message: "Role already exist" }, res)
//         }

//         const role = await Role.create({ name: rolename })

//         return responseManager.onSuccess(
//             "Role created successfully", role, res)

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }