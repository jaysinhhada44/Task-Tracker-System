const Attendance = require('../../models/attendance.model')
const responseManager = require('../../utilities/response.manager')
const mongoose = require('mongoose')

const formatDate = (date, timezone = "UTC") => {
    if (!date) return null;

    return new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(new Date(date));
};

exports.getAttendance = async (req, res) => {

    try {
        const { attendanceid } = req.body
        const timezone = req.user.timezone || "UTC";

        if (!attendanceid) {
            return responseManager.badrequest({ message: "Please enter attendanceid" }, res)
        }

        const attendance = await Attendance.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(attendanceid),
                    companyid: new mongoose.Types.ObjectId(req.user.companyid)
                }
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
                $lookup: {
                    from: "users",
                    localField: "userid",
                    foreignField: "_id",
                    as: "users"
                }
            },
            {
                $unwind: { path: "$users", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    date: 1,
                    loginTime: 1,
                    logoutTime: 1,
                    totalWorkMinutes: 1,
                    totalBreakMinutes: 1,
                    netWorkMinutes: 1,
                    breaks: 1,
                    isWorking: 1,
                    isOnBreak: 1,
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

        if (!attendance.length) {
            return responseManager.badrequest({ message: "Attendance not found" }, res)
        }

        const data = attendance[0];

        // 🔥 FIX ADDED
        data.loginTime = formatDate(data.loginTime, timezone);
        data.logoutTime = formatDate(data.logoutTime, timezone);

        return responseManager.onSuccess("Attendance fetched successfully", attendance[0], res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }

}