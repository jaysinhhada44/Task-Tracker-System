const Leave = require('../../models/leave.model')
const responseManager = require('../../utilities/response.manager')

exports.deleteLeave = async (req, res) => {
    try {
        const { leaveid } = req.body

        if (!leaveid) {
            return responseManager.badrequest({ message: "Please enter leaveid" }, res)
        }

        const leave = await Leave.findOne({ _id: leaveid, compmayid: req.user.compmayid, isDeleted: false })

        if (!leave) {
            return responseManager.badrequest({ message: "Leave not found" }, res)
        }

        await Attendance.findByIdAndDelete(leaveid)

        return responseManager.onSuccess("Attendance deleted successfully", {}, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}