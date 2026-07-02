const Leave = require('../../models/leave.model')
const responseManager = require('../../utilities/response.manager')
const mongoose = require('mongoose')

exports.leaveList = async (req, res) => {

    try {

        const companyid = req.user.companyid

        const { memberid, status, leaveType, fromDate, toDate, page = 1, limit = 10, search } = req.query

        const filter = { companyid: new mongoose.Types.ObjectId(companyid) }

        if (memberid) { filter.userid = new mongoose.Types.ObjectId(memberid) }

        if (status) { filter.status = status }

        if (leaveType) { filter.leaveType = leaveType }

        if (fromDate && toDate) {
            filter.fromDate = { $gte: new Date(fromDate), $lte: new Date(toDate) }
        }
        const pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: "members",
                    localField: "userid",
                    foreignField: "_id",
                    as: "member"
                }
            },
            { $unwind: { path: "$member", preserveNullAndEmptyArrays: true } }
        ]
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "member.firstname": { $regex: search, $options: "i" } },
                        { "member.lastname": { $regex: search, $options: "i" } },
                        { reason: { $regex: search, $options: "i" } }
                    ]
                }
            })
        }
        pipeline.push(
            {
                $project: {
                    leaveType: 1,
                    reason: 1,
                    fromDate: 1,
                    toDate: 1,
                    totalDays: 1,
                    status: 1,
                    remarks: 1,
                    approvedDate: 1,
                    createdAt: 1,
                    member: {
                        _id: "$member._id",
                        firstname: "$member.firstname",
                        lastname: "$member.lastname",
                        email: "$member.email",
                        designation: "$member.designation"
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: (Number(page) - 1) * Number(limit) },
            { $limit: Number(limit) }
        )

        const [leaves, total] = await Promise.all([
            Leave.aggregate(pipeline),
            Leave.countDocuments(filter)
        ])

        return responseManager.onSuccess(
            "Leave list fetched successfully",
            {
                leaves,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit))
            }, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }

}









// const Leave = require('../../models/leave.model')
// const responseManager = require('../../utilities/response.manager')

// exports.leaveList = async (req, res) => {
//     try {
//         const companyid = req.user.companyid

//         const leaves = await Leave.aggregate([
//             {
//                 $match: filter
//             },
//             {
//                 $lookup: {
//                     from: 'members',
//                     localField: 'userid',
//                     foreignField: '_id',
//                     as: 'member'
//                 }
//             },
//             {
//                 $unwind: { path: '$member', preserveNullAndEmptyArrays: true }
//             },
//             {
//                 $project: {
//                     leaveType: 1,
//                     reason: 1,
//                     fromDate: 1,
//                     toDate: 1,
//                     totalDays: 1,
//                     status: 1,
//                     createdAt: 1,
//                     member: {
//                         _id: '$member._id',
//                         firstname: '$member.firstname',
//                         lastname: '$member.lastname'

//                     }
//                 }
//             },
//             {
//                 $sort: { createdAt: -1 }
//             }
//         ])

//         return responseManager.onSuccess('Leave list fetched successfully', leaves, res)

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }