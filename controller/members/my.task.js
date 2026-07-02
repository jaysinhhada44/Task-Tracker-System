const Task = require('../../models/task.model')
const responseManager = require('../../utilities/response.manager')
const mongoose = require('mongoose')

exports.assignedTask = async (req, res) => {
    try {

        const userid = new mongoose.Types.ObjectId(req.user.userid)

        const tasks = await Task.aggregate([
            {
                $match: {
                    assignedTo: userid
                }
            },

            {
                $lookup: {
                    from: 'buckets',
                    localField: 'bucketid',
                    foreignField: '_id',
                    as: 'bucket'
                }
            },

            {
                $unwind: {
                    path: '$bucket',
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: 'members',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'assignedMember'
                }
            },

            {
                $unwind: {
                    path: '$assignedMember',
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdUser'
                }
            },

            {
                $unwind: {
                    path: '$createdUser',
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: 'members',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdMember'
                }
            },

            {
                $unwind: {
                    path: '$createdMember',
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $project: {
                    title: 1,
                    description: 1,
                    priority: 1,
                    status: 1,
                    dueDate: 1,
                    dueTime: 1,
                    recurringTask: 1,
                    recurringType: 1,
                    createdAt: 1,

                    bucket: {
                        _id: '$bucket._id',
                        bucketname: '$bucket.bucketname'
                    },
                    assignedMember: {
                        _id: '$assignedMember._id',
                        firstname: '$assignedMember.firstname',
                        lastname: '$assignedMember.lastname',
                        email: '$assignedMember.email'
                    },
                    createdUser: {
                        _id: '$createdUser._id',
                        firstname: '$createdUser.firstname',
                        lastname: '$createdUser.lastname',
                        email: '$createdUser.email'
                    },
                    createdMember: {
                        _id: '$createdMember._id',
                        firstname: '$createdMember.firstname',
                        lastname: '$createdMember.lastname',
                        email: '$createdMember.email'
                    }
                }
            },

            {
                $sort: {
                    createdAt: -1
                }
            }
        ])

        return responseManager.onSuccess(
            'Tasks fetched successfully',
            tasks,
            res
        )

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}









// const Task = require('../../models/task.model')
// const responseManager = require('../../utilities/response.manager')

// exports.assignedTask = async (req, res) => {
//     try {
//         const userid = req.user.userid

//         const tasks = await Task.find({ assignedTo: userid })
//             .populate('bucketid', 'bucketname')
//             .populate('assignedTo', 'firstname lastname')
//             .populate('createdBy', 'firstname lastname')
//             .sort({ createdAt: -1 })
//             .lean()

//         return responseManager.onSuccess(
//             "Tasks fetched successfully", tasks, res)

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }