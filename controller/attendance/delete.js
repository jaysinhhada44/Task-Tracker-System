const Attendance = require('../../models/attendance.model')
const responseManager = require('../../utilities/response.manager')

exports.deleteAttendance = async (req, res) => {

    try {

        const { attendanceid } = req.body

        if (!attendanceid) {
            return responseManager.badrequest({ message: "Please enter attendance id" }, res)
        }

        const attendance = await Attendance.findOne({ _id: attendanceid, companyid: req.user.companyid })

        if (!attendance) {
            return responseManager.badrequest({ message: "Attendance not found" }, res)
        }

        await Attendance.findByIdAndDelete(attendanceid)

        return responseManager.onSuccess("Attendance deleted successfully", {}, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }

}