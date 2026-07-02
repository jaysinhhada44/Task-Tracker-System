const Member = require('../../models/member.model')
const Role = require('../../models/role.model')
const Bucket = require('../../models/bucket.model')
const Task = require('../../models/task.model')
const Attendance = require('../../models/attendance.model')
const responseManager = require('../../utilities/response.manager')

exports.adminDashboard = async (req, res) => {

    try {

        const companyid = req.user.companyid

        const today = new Date().toISOString().split('T')[0]

        const [
            totalMembers, totalRoles, totalBuckets, totalTasks,

            completedTasks, pendingTasks, cancelledTasks,

            presentMembers, workingMembers, onBreakMembers,

            recentMembers, recentTasks, recentRoles, recentBuckets

        ] = await Promise.all([

            Member.countDocuments({ companyid, isDeleted: false }),

            Role.countDocuments({ companyid, isDeleted: false }),

            Bucket.countDocuments({ companyid, isDeleted: false }),

            Task.countDocuments({ companyid }),

            Task.countDocuments({ companyid, status: "completed" }),

            Task.countDocuments({ companyid, status: { $in: ["todo", "in_progress"] } }),

            Task.countDocuments({ companyid, status: "cancelled" }),

            Attendance.countDocuments({ companyid, date: today }),

            Attendance.countDocuments({ companyid, date: today, isWorking: true }),

            Attendance.countDocuments({ companyid, date: today, isOnBreak: true }),

            Member.find({ companyid, isDeleted: false })
                .select("firstname lastname designation roleid")
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),

            Task.find({ companyid })
                .select("title description status priority dueDate")
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),

            Role.find({ companyid, isDeleted: false })
                .select("rolename")
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),

            Bucket.find({ companyid, isDeleted: false })
                .select("bucketname")
                .sort({ createdAt: -1 })
                .limit(20)
                .lean()
        ])

        return responseManager.onSuccess(
            "Admin dashboard fetched successfully",
            {
                statistics: { totalMembers, totalRoles, totalBuckets, totalTasks, completedTasks, pendingTasks, cancelledTasks,
                    attendance: {
                        presentMembers, absentMembers: totalMembers - presentMembers,
                        workingMembers, onBreakMembers
                    }
                }, recentMembers, recentTasks, recentRoles, recentBuckets }, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }

}