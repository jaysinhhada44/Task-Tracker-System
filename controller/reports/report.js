const mongoose = require("mongoose");
const Report = require("../../models/report.model");
const Attendance = require("../../models/attendance.model");
const Task = require("../../models/task.model");
const Leave = require("../../models/leave.model");
const Member = require("../../models/member.model");
const Bucket = require("../../models/bucket.model");

const responseManager = require("../../utilities/response.manager");

exports.report = async (req, res) => {

    try {

        const companyid = new mongoose.Types.ObjectId(req.user.companyid);

        const generatedBy = new mongoose.Types.ObjectId(req.user.userid);

        const generatedByType = req.user.role === "admin" ? "User" : "Member";

        const { reportType, memberid, bucketid, priority, status, fromDate, toDate, exportType = "pdf" } = req.body;

        if (!reportType) {
            return responseManager.badrequest({ message: "Please select report type" }, res);
        }

        const filter = { companyid: new mongoose.Types.ObjectId(companyid) }

        if (memberid) { filter.userid = new mongoose.Types.ObjectId(memberid); }

        if (bucketid) { filter.bucketid = new mongoose.Types.ObjectId(bucketid); }

        if (priority) { filter.priority = priority; }

        if (status) { filter.status = status; }

        if (fromDate && toDate) {
            filter.date = {
                $gte: fromDate,
                $lte: toDate
            };
        }

        let reportData = {};

        switch (reportType) {

            case "attendance": {

                const [totalAttendance, present, working, onBreak, attendance] = await Promise.all([

                    Attendance.countDocuments(filter),

                    Attendance.countDocuments({
                        ...filter,
                        logoutTime: { $ne: null }
                    }),

                    Attendance.countDocuments({
                        ...filter,
                        isWorking: true
                    }),

                    Attendance.countDocuments({
                        ...filter,
                        isOnBreak: true
                    }),

                    Attendance.find(filter)
                        .populate("userid", "firstname lastname designation email")
                        .lean()
                ]);

                reportData = { totalAttendance, present, working, onBreak, attendance };

                break;
            }

            case "task": {

                const taskFilter = { ...filter };

                delete taskFilter.userid;

                const [totalTasks, completed, pending, inProgress, cancelled, tasks] = await Promise.all([

                    Task.countDocuments(taskFilter),

                    Task.countDocuments({
                        ...taskFilter,
                        status: "completed"
                    }),

                    Task.countDocuments({
                        ...taskFilter,
                        status: "todo"
                    }),

                    Task.countDocuments({
                        ...taskFilter,
                        status: "in_progress"
                    }),

                    Task.countDocuments({
                        ...taskFilter,
                        status: "cancelled"
                    }),

                    Task.find(taskFilter)
                        .populate("assignedTo", "firstname lastname email")
                        .populate("bucketid", "bucketname")
                        .lean()
                ]);

                reportData = { totalTasks, completed, pending, inProgress, cancelled, tasks };

                break;
            }

            case "leave": {

                const leaveFilter = { ...filter };

                delete leaveFilter.bucketid;

                const [totalLeaves, approved, pending, rejected, leaves] = await Promise.all([

                    Leave.countDocuments(leaveFilter),

                    Leave.countDocuments({
                        ...leaveFilter,
                        status: "approved"
                    }),

                    Leave.countDocuments({
                        ...leaveFilter,
                        status: "pending"
                    }),

                    Leave.countDocuments({
                        ...leaveFilter,
                        status: "rejected"
                    }),

                    Leave.find(leaveFilter)
                        .populate("userid", "firstname lastname")
                        .lean()
                ]);

                reportData = { totalLeaves, approved, pending, rejected, leaves };

                break;
            }

            case "member": {

                const memberFilter = { companyid };

                const [totalMembers, members] = await Promise.all([

                    Member.countDocuments(memberFilter),

                    Member.find(memberFilter)
                        .select("firstname lastname designation email phoneno")
                        .lean()
                ]);

                reportData = { totalMembers, members };

                break;
            }

            case "bucket": {

                const bucketFilter = { companyid };

                const [totalBuckets, buckets] = await Promise.all([

                    Bucket.countDocuments(bucketFilter),

                    Bucket.find(bucketFilter).lean()
                ]);

                reportData = { totalBuckets, buckets };

                break;
            }

            case "dashboard": {

                const [totalMembers, totalBuckets, totalTasks, completedTasks, pendingTasks, cancelledTasks, presentMembers, workingMembers, onBreakMembers] = await Promise.all([

                    Member.countDocuments({ companyid }),

                    Bucket.countDocuments({ companyid }),

                    Task.countDocuments({ companyid }),

                    Task.countDocuments({
                        companyid,
                        status: "completed"
                    }),

                    Task.countDocuments({
                        companyid,
                        status: {
                            $in: ["todo", "in_progress"]
                        }
                    }),

                    Task.countDocuments({
                        companyid,
                        status: "cancelled"
                    }),

                    Attendance.countDocuments({
                        companyid,
                        logoutTime: { $ne: null }
                    }),

                    Attendance.countDocuments({
                        companyid,
                        isWorking: true
                    }),

                    Attendance.countDocuments({
                        companyid,
                        isOnBreak: true
                    })
                ]);

                reportData = {

                    statistics: {
                        totalMembers,
                        totalBuckets,
                        totalTasks,
                        completedTasks,
                        pendingTasks,
                        cancelledTasks,
                        attendance: {

                            presentMembers,
                            workingMembers,
                            onBreakMembers
                        }
                    },

                    charts: {
                        taskStatus: {
                            completed: completedTasks,
                            pending: pendingTasks,
                            cancelled: cancelledTasks
                        },

                        attendance: {
                            present: presentMembers,
                            working: workingMembers,
                            break: onBreakMembers
                        }
                    }
                };
                break;
            }

            case "all": {

                const attendanceFilter = { ...filter };
                const taskFilter = { ...filter };
                const leaveFilter = { ...filter };
                const memberFilter = { companyid };
                const bucketFilter = { companyid };
                delete taskFilter.userid;
                delete taskFilter.date;
                delete leaveFilter.bucketid;
                delete leaveFilter.date;

                const [
                    totalAttendance,
                    present,
                    working,
                    onBreak,
                    attendance,
                    totalTasks,
                    completed,
                    pending,
                    inProgress,
                    cancelled,
                    tasks,
                    totalLeaves,
                    approved,
                    leavePending,
                    rejected,
                    leaves,
                    totalMembers,
                    members,
                    totalBuckets,
                    buckets,
                    dashboardTotalMembers,
                    dashboardTotalBuckets,
                    dashboardTotalTasks,
                    dashboardCompleted,
                    dashboardPending,
                    dashboardCancelled,
                    dashboardPresent,
                    dashboardWorking,
                    dashboardBreak] = await Promise.all([

                    Attendance.countDocuments(attendanceFilter),

                    Attendance.countDocuments({
                        ...attendanceFilter,
                        logoutTime: { $ne: null }
                    }),

                    Attendance.countDocuments({
                        ...attendanceFilter,
                        isWorking: true
                    }),

                    Attendance.countDocuments({
                        ...attendanceFilter,
                        isOnBreak: true
                    }),

                    Attendance.find(attendanceFilter)
                        .populate("userid", "firstname lastname designation")
                        .lean(),

                    Task.countDocuments(taskFilter),

                    Task.countDocuments({
                        ...taskFilter,
                        status: "completed"
                    }),

                    Task.countDocuments({
                        ...taskFilter,
                        status: "todo"
                    }),

                    Task.countDocuments({
                        ...taskFilter,
                        status: "in_progress"
                    }),

                    Task.countDocuments({
                        ...taskFilter,
                        status: "cancelled"
                    }),

                    Task.find(taskFilter)
                        .populate("assignedTo", "firstname lastname")
                        .populate("bucketid", "bucketname")
                        .lean(),

                    Leave.countDocuments(leaveFilter),

                    Leave.countDocuments({
                        ...leaveFilter,
                        status: "approved"
                    }),

                    Leave.countDocuments({
                        ...leaveFilter,
                        status: "pending"
                    }),

                    Leave.countDocuments({
                        ...leaveFilter,
                        status: "rejected"
                    }),

                    Leave.find(leaveFilter)
                        .populate("userid", "firstname lastname")
                        .lean(),

                    Member.countDocuments(memberFilter),

                    Member.find(memberFilter)
                        .select("firstname lastname roleid designation email")
                        .lean(),

                    Bucket.countDocuments(bucketFilter),

                    Bucket.find(bucketFilter).lean(),

                    // Dashboard
                    Member.countDocuments({ companyid }),

                    Bucket.countDocuments({ companyid }),

                    Task.countDocuments({ companyid }),

                    Task.countDocuments({
                        companyid,
                        status: "completed"
                    }),

                    Task.countDocuments({
                        companyid,
                        status: { $in: ["todo", "in_progress"] }
                    }),

                    Task.countDocuments({
                        companyid,
                        status: "cancelled"
                    }),

                    Attendance.countDocuments({
                        companyid,
                        logoutTime: { $ne: null }
                    }),

                    Attendance.countDocuments({
                        companyid,
                        isWorking: true
                    }),

                    Attendance.countDocuments({
                        companyid,
                        isOnBreak: true
                    })
                ]);

                reportData = {
                    attendance: {
                        summary: {
                            totalAttendance,
                            present,
                            working,
                            onBreak
                        },
                        records: attendance
                    },
                    task: {
                        summary: {
                            totalTasks,
                            completed,
                            pending,
                            inProgress,
                            cancelled
                        },
                        records: tasks
                    },
                    leave: {
                        summary: {
                            totalLeaves,
                            approved,
                            pending: leavePending,
                            rejected
                        },
                        records: leaves
                    },
                    member: {
                        summary: {
                            totalMembers
                        },
                        records: members
                    },
                    bucket: {
                        summary: {
                            totalBuckets
                        },
                        records: buckets
                    },

                    dashboard: {
                        statistics: {
                            totalMembers: dashboardTotalMembers,
                            totalBuckets: dashboardTotalBuckets,
                            totalTasks: dashboardTotalTasks,
                            completedTasks: dashboardCompleted,
                            pendingTasks: dashboardPending,
                            cancelledTasks: dashboardCancelled,
                            attendance: {
                                presentMembers: dashboardPresent,
                                workingMembers: dashboardWorking,
                                onBreakMembers: dashboardBreak
                            }
                        },

                        charts: {
                            taskStatus: [
                                { name: "Completed", value: dashboardCompleted },
                                { name: "Pending", value: dashboardPending },
                                { name: "Cancelled", value: dashboardCancelled }
                            ],
                            attendance: [
                                { name: "Present", value: dashboardPresent },
                                { name: "Working", value: dashboardWorking },
                                { name: "Break", value: dashboardBreak }
                            ]
                        }
                    }
                };

                break;
            }

            default:

                return responseManager.badrequest({ message: "Invalid report type" }, res);

        }

        const savedReport = await Report.create({
            companyid,
            generatedBy,
            generatedByType,
            reportType,
            fromDate: fromDate || null,
            toDate: toDate || null,
            filters: {
                memberid: memberid || null,
                bucketid: bucketid || null,
                priority: priority || "",
                status: status || ""
            },
            exportType,
            reportData
        });

        return responseManager.onSuccess(`${reportType} report generated successfully`, { report: reportData, reportHistoryId: savedReport._id }, res);

    }
    catch (error) {
        console.error(error);
        return responseManager.onError(error, res);
    }
};