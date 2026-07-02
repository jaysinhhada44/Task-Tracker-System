const Role = require('../../models/role.model')
const responseManager = require('../../utilities/response.manager')

exports.rolesList = async (req, res) => {
    try {

        const userid = req.user.userid
        const { page = 1, limit = 10 } = req.query

        const filter = { companyid: req.user.companyid, isDeleted: false }

        const skip = (Number(page) - 1) * Number(limit)

        const [roles, total] = await Promise.all([
            Role.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Role.countDocuments(filter)
        ])

        return responseManager.onSuccess('Roles fetched successfully',
            {
                roles,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            }, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}


// const Role = require('../../models/role.model')
// const responseManager = require('../../utilities/response.manager')

// exports.rolesList = async (req, res) => {
//     try {

//         const { search } = req.query
//         const userid = req.user.userid

//         let filter = { createdBy: userid }

//         if (search) {
//             filter.rolename = { $regex: search, $options: 'i' }
//         }

//         const roles = await Role.find(filter).sort({ createdAt: -1 })

//         return responseManager.onSuccess("Roles fetched successfully", roles, res)

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }