const Task = require('../../models/task.model')
const responseManager = require('../../utilities/response.manager')

exports.userDashboard = async (req, res) => {
    try {

        const userid = req.user.userid
        const companyid = req.user.companyid

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const [assignedTasks, completedTasks, pendingTasks, cancelledTasks, upcomingTasks, todayWork] = await Promise.all([

            Task.countDocuments({ assignedTo: userid, companyid }),

            Task.countDocuments({ assignedTo: userid, companyid, status: 'completed' }),

            Task.countDocuments({
                assignedTo: userid,
                companyid,
                status: { $in: ['todo', 'in_progress'] }
            }),

            Task.countDocuments({
                assignedTo: userid,
                companyid,
                status: 'cancelled'
            }),

            Task.find({
                assignedTo: userid,
                companyid,
                status: { $in: ['todo', 'in_progress'] }
            })
                .select('title description priority status dueDate')
                .sort({ dueDate: 1 })
                .limit(10),
        ]) 

        Task.aggregate([
            {
                $match: { assignedTo: userid, companyid }
            },
            {
                $project: {
                    title: 1,
                    totalWorkedMinutes: 1,
                    status: 1,
                    workStartedAt: 1,
                    workCompletedAt: 1,
                    isTodayWork: {
                        $cond: [
                            {
                                $or: [
                                    {
                                        $and: [
                                            { $gte: ["$workStartedAt", startOfDay] },
                                            { $lte: ["$workStartedAt", endOfDay] }
                                        ]
                                    },
                                    {
                                        $and: [
                                            { $gte: ["$workCompletedAt", startOfDay] },
                                            { $lte: ["$workCompletedAt", endOfDay] }
                                        ]
                                    }
                                ]
                            },
                            true,
                            false
                        ]
                    }
                }
            },
            {
                $match: { isTodayWork: true }
            },
            {
                $group: {
                    _id: null,
                    totalMinutes: { $sum: "$totalWorkedMinutes" },
                    tasks: {
                        $push: { title: "$title", minutes: "$totalWorkedMinutes", status: "$status" }
                    }
                }
            }
        ])
        const totalMinutes = todayWork?.[0]?.totalMinutes || 0
        const taskBreakdown = todayWork?.[0]?.tasks || []

        return responseManager.onSuccess(
            'Dashboard fetched successfully',
            {
                assignedTasks,
                completedTasks,
                pendingTasks,
                cancelledTasks,
                upcomingTasks,
                todaySummary: {
                    totalMinutes,
                    totalHours: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
                    tasks: taskBreakdown
                }
            }, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}










// const Task = require('../../models/task.model')
// const responseManager = require('../../utilities/response.manager')
// const mongoose = require('mongoose')

// exports.userDashboard = async (req, res) => {
//     try {

//         const userid = new mongoose.Types.ObjectId(req.user.userid)

//         const [ assignedTasks, completedTasks, pendingTasks, cancelledTasks, upcomingTasks] = await Promise.all([

//             Task.countDocuments({ assignedTo: userid, companyid: req.user.companyid }),

//             Task.countDocuments({ assignedTo: userid, companyid: req.user.companyid, status: 'completed' }),

//             Task.countDocuments({ assignedTo: userid, companyid: req.user.companyid, status: { $in: ['todo', 'in_progress'] } }),

//             Task.countDocuments({ assignedTo: userid, companyid: req.user.companyid, status: 'cancelled' }),

//             Task.find({ assignedTo: userid, companyid: req.user.companyid, status: { $in: ['todo', 'in_progress'] } })
//                 .select('title description priority status dueDate')
//                 .sort({ dueDate: 1 })
//                 .limit(10)
//         ])

//         return responseManager.onSuccess(
//             'Dashboard fetched successfully',
//             { assignedTasks, completedTasks, pendingTasks, cancelledTasks, upcomingTasks }, res)

//     } catch (error) {
//         console.error(error)
//         return responseManager.onError(error, res)
//     }
// }