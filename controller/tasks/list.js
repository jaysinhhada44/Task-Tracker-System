const Task = require('../../models/task.model')
const responseManager = require('../../utilities/response.manager')
const mongoose = require('mongoose')

exports.tasksList = async (req, res) => {
    try {

        const companyid = req.user.companyid

        const { status, priority, assignedTo, search } = req.query

        const filter = { companyid: new mongoose.Types.ObjectId(companyid) }

        if (status) { filter.status = status }

        if (priority) { filter.priority = priority }

        if (assignedTo) { filter.assignedTo = assignedTo }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' }}, 
                { description: { $regex: search, $options: 'i' }}
            ]}

        const [tasks, total] = await Promise.all([

            Task.aggregate([

                { $match: filter },

                // Assigned Member
                {
                    $lookup: {
                        from: 'members',
                        localField: 'assignedTo',
                        foreignField: '_id',
                        as: 'assignedMember'
                    }
                },

                { $unwind: { path: '$assignedMember', preserveNullAndEmptyArrays: true } },

                // Bucket
                {
                    $lookup: {
                        from: 'buckets',
                        localField: 'bucketid',
                        foreignField: '_id',
                        as: 'bucket'
                    }
                },

                { $unwind: { path: '$bucket', preserveNullAndEmptyArrays: true } },

                // Creator User (Admin)
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'creatorUser'
                    }
                },

                { $unwind: { path: '$creatorUser', preserveNullAndEmptyArrays: true } },

                // Creator Member (Manager)
                {
                    $lookup: {
                        from: 'members',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'creatorMember'
                    }
                },

                { $unwind: { path: '$creatorMember', preserveNullAndEmptyArrays: true } },

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
                        attachmentRequired: 1,
                        createdAt: 1,
                        assignedAt: 1,
                        totalWorkedMinutes: 1,
                        workStartedAt: 1,
                        workCompletedAt: 1,

                        workDuration: {
                            $concat: [
                                { $toString: { $floor: { $divide: [ { $ifNull: ["$totalWorkedMinutes", 0] }, 60] } } }, "h ",
                                { $toString: { $mod: [ { $ifNull: ["$totalWorkedMinutes", 0] }, 60] } }, "m",
                            ]
                        },

                        isRunning: { $eq: ["$status", "in_progress"] },

                        progress: {
                            $cond: [
                                { $eq: ["$status", "completed"] },
                                 100,
                                { $cond: [ { $eq: ["$status", "in_progress"] }, 50, 0] }
                            ]
                        },

                        assignedTo: {
                            _id: '$assignedMember._id',
                            firstname: '$assignedMember.firstname',
                            lastname: '$assignedMember.lastname',
                            email: '$assignedMember.email'
                        },

                        bucket: { _id: '$bucket._id', bucketname: '$bucket.bucketname' },

                        createdBy: { _id: { $ifNull: [ '$creatorUser._id', '$creatorMember._id'] },

                            firstname: { $ifNull: [ '$creatorUser.firstname', '$creatorMember.firstname'] },

                            lastname: { $ifNull: ['$creatorUser.lastname', '$creatorMember.lastname'] },

                            email: { $ifNull: [ '$creatorUser.email', '$creatorMember.email'] }
                        }
                    }
                },
                { $sort: { createdAt: -1 } }, { $skip: 0 }, { $limit: 10 }
            ]),
            Task.countDocuments(filter)
        ])

        return responseManager.onSuccess("Tasks fetched successfully",{ tasks, total }, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}










// const Task = require('../../models/task.model')
// const responseManager = require('../../utilities/response.manager')

// exports.tasksList = async (req, res) => {
//     try {
//         // const { id } = req.body
//         const createdBy = req.user.userid

//         if (!createdBy) {
//             return responseManager.badrequest({ message: "Unauthorized user" }, res)
//         }

//         const { status, priority, assignedTo, search } = req.query

//         const filter = { createdBy }

//         if (status) filter.status = status

//         if (priority) filter.priority = priority

//         if (assignedTo) filter.assignedTo = assignedTo

//         if (search) {
//             filter.$or =
//                 [{ title: { $regex: search, $options: "i" } },
//                 { description: { $regex: search, $options: "i" } }]
//         }

//         const [tasks, total] = await Promise.all([
//             Task.aggregate([

//                 {
//                     $match: filter
//                 },

//                 {
//                     $lookup: {
//                         from: 'members',
//                         localField: 'assignedTo',
//                         foreignField: '_id',
//                         as: 'assignedTo'
//                     }
//                 },

//                 {
//                     $unwind: {
//                         path: '$assignedTo',
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },

//                 {
//                     $lookup: {
//                         from: 'buckets',
//                         localField: 'bucketid',
//                         foreignField: '_id',
//                         as: 'bucket'
//                     }
//                 },

//                 {
//                     $unwind: {
//                         path: '$bucket',
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },

//                 {
//                     $lookup: {
//                         from: 'users',
//                         localField: 'createdBy',
//                         foreignField: '_id',
//                         as: 'createdBy'
//                     }
//                 },

//                 {
//                     $unwind: {
//                         path: '$createdBy',
//                         preserveNullAndEmptyArrays: true
//                     }
//                 },

//                 {
//                     $project: {
//                         title: 1,
//                         description: 1,
//                         priority: 1,
//                         status: 1,
//                         dueDate: 1,
//                         dueTime: 1,
//                         recurringTask: 1,
//                         recurringType: 1,
//                         attachmentRequired: 1,
//                         createdAt: 1,

//                         assignedTo: {
//                             _id: '$assignedTo._id',
//                             firstname: '$assignedTo.firstname',
//                             lastname: '$assignedTo.lastname',
//                             email: '$assignedTo.email'
//                         },

//                         bucket: {
//                             _id: '$bucket._id',
//                             bucketname: '$bucket.bucketname'
//                         },

//                         createdBy: {
//                             _id: '$createdBy._id',
//                             firstname: '$createdBy.firstname',
//                             lastname: '$createdBy.lastname',
//                             email: '$createdBy.email'
//                         }
//                     }
//                 },
                
//                 { $sort: { createdAt: -1 } }, { $skip: 0 }, { $limit: 10 }]), Task.countDocuments(filter)])

//         return responseManager.onSuccess("Tasks fetched successfully", { tasks, total }, res)

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }