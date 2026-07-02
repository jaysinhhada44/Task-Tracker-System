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


exports.attendanceList = async (req, res) => {

    try {
        const companyid = req.user.companyid
        const timezone = req.user.timezone || "UTC";

        const { memberid, date, month, year, page = 1, limit = 10, search } = req.query

        const filter = { companyid: new mongoose.Types.ObjectId(companyid) }

        if (memberid) { filter.userid = new mongoose.Types.ObjectId(memberid) }

        if (date) { filter.date = date }

        if (month && year) {
            const startDate = new Date(year, month - 1, 1)
            const endDate = new Date(year, month, 0, 23, 59, 59)
            filter.loginTime = { $gte: startDate, $lte: endDate }
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
                    $or: [{ "member.firstname": { $regex: search, $options: "i" } },
                    { "member.lastname": { $regex: search, $options: "i" } }]
                }
            })
        }

        pipeline.push(
            {
                $project: {
                    date: 1,
                    loginTime: 1,
                    logoutTime: 1,
                    totalWorkMinutes: 1,
                    totalBreakMinutes: 1,
                    netWorkMinutes: 1,
                    isWorking: 1,
                    isOnBreak: 1,
                    breaks: 1,
                    member: {
                        _id: "$member._id",
                        firstname: "$member.firstname",
                        lastname: "$member.lastname",
                        email: "$member.email",
                        designation: "$member.designation"
                    }
                }
            },
            { $sort: { loginTime: -1 } },
            { $skip: (Number(page) - 1) * Number(limit) },
            { $limit: Number(limit) }

        )

        const [attendance, total] = await Promise.all([
            Attendance.aggregate(pipeline),
            Attendance.countDocuments(filter)
        ])

        // 🔥 FORMAT RESPONSE
        const formatted = attendance.map(item => ({
            ...item,
            loginTime: formatDate(item.loginTime, timezone),
            logoutTime: formatDate(item.logoutTime, timezone)
        }));

        return responseManager.onSuccess(
            "Attendance fetched successfully",
            {
                attendance: formatted,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            },
            res
        );

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }

}