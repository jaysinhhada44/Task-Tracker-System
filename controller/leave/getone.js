const Leave = require('../../models/leave.model')
const responseManager = require('../../utilities/response.manager')
const mongoose = require('mongoose')

exports.getLeave = async (req, res) => {

    try {

        const { leaveid } = req.body

        if (!leaveid) {
            return responseManager.badrequest({ message: "Please enter leave id" }, res)
        }

        const leave = await Leave.aggregate([
            {
                $match: { _id: leaveid, companyid: companyid, isDeleted: false }
            },
            {
                $lookup: {
                    from: "members",
                    localField: "userid",
                    foreignField: "_id",
                    as: "member"
                }
            },
            {
                $unwind: { path: "$member", preserveNullAndEmptyArrays: true }
            },
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
            }
        ])

        if (!leave.length) {
            return responseManager.badrequest({ message: "Leave not found" }, res)
        }

        return responseManager.onSuccess("Leave fetched successfully", leave[0], res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }

}









// const Leave = require('../../models/leave.model')
// const responseManager = require('../../utilities/response.manager')

// exports.getLeave = async (req, res) => {
//     try {
//         const { leaveid } = req.body

//         if (!leaveid) {
//             return responseManager.badrequest({ message: "Please enter leave id" }, res)
//         }

//         const leave = await Leave.aggregate([
//             {
//                 $match: { _id: leaveid, companyid: req.user.companyid }
//             },
//             {
//                 $lookup: {
//                     from: "leaves",
//                     localField: "userid",
//                     foreignField: "_id",
//                     as: "leave"
//                 }
//             },
//             {
//                 $unwind: { path: "$member", preserveNullAndEmptyArrays: true }
//             }
//         ])

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }