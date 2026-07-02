const Member = require('../../models/member.model')
const responseManager = require('../../utilities/response.manager')

exports.searchMember = async (req, res) => {
    try {
        const { search = '', roleid, page = 1, limit = 50 } = req.query

        const matchStage = { isDeleted: false, companyid: req.user.companyid }

        if (roleid) {
            matchStage.roleid = roleid
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'roleid',
                    foreignField: '_id',
                    as: 'role'
                }
            },
            { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } }
        ]

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { firstname: { $regex: search, $options: 'i' } },
                        { lastname: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { phoneno: { $regex: search, $options: 'i' } },
                        { 'role.rolename': { $regex: search, $options: 'i' } }
                    ]
                }
            })
        }
        pipeline.push({
            $project: {
                _id: 1,
                firstname: 1,
                lastname: 1,
                img: 1,
                designation: 1,
                roleid: { _id: '$role._id', rolename: '$role.rolename' },
                email: 1,
                phoneno: 1,
                createdBy: 1,
                isActive: 1,
                isVerified: 1,
                isDeleted: 1
            }
        })
        pipeline.push({
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                ],
                total: [{ $count: 'count' }]
            }
        })
        const result = await Member.aggregate(pipeline)


        return responseManager.onSuccess('Members fetched successfully', {
            members: result[0].data,
            total: result[0].total[0]?.count || 0
        }, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}


// const Member = require('../../models/member.model')
// const responseManager = require('../../utilities/response.manager')

// exports.searchMember = async (req, res) => {
//     try {

//         const { search } = req.query

//         let filter = { isDeleted: false }

//         if (search) {
//             filter.$or = [
//                 { firstname: { $regex: search, $options: 'i' } },
//                 { lastname: { $regex: search, $options: 'i' } },
//                 { email: { $regex: search, $options: 'i' } },
//                 { phoneno: { $regex: search, $options: 'i' } }
//             ]
//         }

//         const members = await Member.find(filter)
//             .select('-password')
//             .sort({ createdAt: -1 })
//             .lean()

//         return responseManager.onSuccess('Search completed successfully!', members, res)

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }