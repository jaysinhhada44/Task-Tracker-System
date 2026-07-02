const mongoose = require("mongoose");
const Attendance = require("../../models/attendance.model");
const responseManager = require("../../utilities/response.manager");
const notification = require("../../utilities/helper");

// FORMAT SECONDS
const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// FORMAT RESPONSE (FIXED)
const attendanceResponse = (attendance, timezone = "UTC") => {
    const data = attendance.toObject();

    // 🔥 FIX 1: timezone conversion (GLOBAL SUPPORT)
    const formatDate = (date, timezone) => {
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

    // Remove logoutTime if not present
    if (!data.logoutTime) delete data.logoutTime;

    // 🔥 FIX 2: add formatted times (global)
    data.loginTime = formatDate(data.loginTime);
    data.logoutTime = formatDate(data.logoutTime);


    data.totalWorkedTime = formatTime(data.totalWorkedSeconds || 0);
    data.totalBreakTime = formatTime(data.totalBreakSeconds || 0);

    return data;
};

// MAIN CONTROLLER
exports.attendanceAction = async (req, res) => {
    try {
        const { action } = req.body;

        const userid = req.user.userid;
        const companyid = req.user.companyid;

        // 🔥 FIX 3: timezone support from user
        const timezone = req.user.timezone || "UTC";

        const today = new Date().toISOString().split("T")[0];

        let attendance = await Attendance.findOne({
            userid,
            companyid,
            date: today,
        });

        switch (action) {

            // START WORK
            case "start": {
                if (attendance?.isWorking) {
                    return responseManager.badrequest(
                        { message: "Attendance already started." },
                        res
                    );
                }

                if (!attendance) {
                    attendance = await Attendance.create({
                        userid,
                        companyid,
                        date: today,
                        loginTime: new Date(),
                        isWorking: true,
                        isOnBreak: false,
                        totalWorkedSeconds: 0,
                        totalBreakSeconds: 0,
                    });
                } else {
                    attendance.loginTime = new Date();
                    attendance.isWorking = true;
                    attendance.isOnBreak = false;
                    attendance.currentBreakStart = undefined;
                    attendance.totalWorkedSeconds = 0;
                    attendance.totalBreakSeconds = 0;
                    attendance.logoutTime = undefined;

                    await attendance.save();
                }

                await notification.notify({
                    companyid,
                    userid,
                    title: "Attendance",
                    message: "You have punched in successfully.",
                    type: "attendance",
                    referenceid: attendance._id,
                });

                return responseManager.onSuccess(
                    "Attendance started successfully.",
                    attendanceResponse(attendance, timezone),
                    res
                );
            }

            // START BREAK
            case "breakstart": {
                if (!attendance)
                    return responseManager.badrequest(
                        { message: "Attendance not found." },
                        res
                    );

                if (!attendance.isWorking)
                    return responseManager.badrequest(
                        { message: "Work not started." },
                        res
                    );

                if (attendance.isOnBreak)
                    return responseManager.badrequest(
                        { message: "Break already started." },
                        res
                    );

                attendance.currentBreakStart = new Date();
                attendance.isOnBreak = true;

                await attendance.save();

                return responseManager.onSuccess(
                    "Break started successfully.",
                    attendanceResponse(attendance, timezone),
                    res
                );
            }

            // END BREAK
            case "breakend": {
                if (!attendance)
                    return responseManager.badrequest(
                        { message: "Attendance not found." },
                        res
                    );

                if (!attendance.isOnBreak)
                    return responseManager.badrequest(
                        { message: "Break not started." },
                        res
                    );

                attendance.totalBreakSeconds += Math.floor(
                    (Date.now() - attendance.currentBreakStart.getTime()) / 1000
                );

                attendance.currentBreakStart = undefined;
                attendance.isOnBreak = false;

                await attendance.save();

                return responseManager.onSuccess(
                    "Break ended successfully.",
                    attendanceResponse(attendance, timezone),
                    res
                );
            }
            
            // END WORK
            case "end": {
                if (!attendance)
                    return responseManager.badrequest(
                        { message: "Attendance not found." },
                        res
                    );

                if (!attendance.isWorking)
                    return responseManager.badrequest(
                        { message: "Attendance already ended." },
                        res
                    );

                if (attendance.isOnBreak) {
                    attendance.totalBreakSeconds += Math.floor(
                        (Date.now() - attendance.currentBreakStart.getTime()) / 1000
                    );

                    attendance.currentBreakStart = undefined;
                    attendance.isOnBreak = false;
                }

                attendance.logoutTime = new Date();

                const totalSeconds = Math.floor(
                    (attendance.logoutTime.getTime() -
                        attendance.loginTime.getTime()) /
                    1000
                );

                attendance.totalWorkedSeconds =
                    totalSeconds - attendance.totalBreakSeconds;

                attendance.isWorking = false;

                await attendance.save();

                await notification.notify({
                    companyid,
                    userid,
                    title: "Attendance",
                    message: "You have punched out successfully.",
                    type: "attendance",
                    referenceid: attendance._id,
                });

                return responseManager.onSuccess(
                    "Attendance ended successfully.",
                    attendanceResponse(attendance, timezone),
                    res
                );
            }

            default:
                return responseManager.badrequest(
                    { message: "Invalid action." },
                    res
                );
        }
    } catch (error) {
        console.error(error);
        return responseManager.onError(error, res);
    }
};