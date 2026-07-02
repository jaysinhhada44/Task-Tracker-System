const Leave = require('../../models/leave.model')
const responseManager = require('../../utilities/response.manager')
const member = require('../../models/member.model')
const notification = require('../../utilities/helper')

exports.createLeave = async (req, res) => {
    try {
        const { leaveid, leaveType, reason, fromDate, toDate, status } = req.body
        const companyid = req.user.companyid

        if (!leaveType || !reason || !fromDate || !toDate) {
            return responseManager.badrequest({ message: 'Please fill all required fields.' }, res)
        }

        const totalDays = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1

        if (leaveid) {

            const leave = await Leave.findOne({ _id: leaveid, companyid: req.user.companyid, isDeleted: false })

            if (!leave) {
                return responseManager.badrequest({ message: 'Leave not found.' }, res)
            }

            const updatedLeave = await Leave.findByIdAndUpdate(
                leaveid,
                { leaveType, reason, fromDate, toDate, totalDays, status },
                { new: true, runValidators: true }
            )
            return responseManager.onSuccess('Leave updated successfully', updatedLeave, res)
        }

        const leave = await Leave.create({
            companyid: req.user.companyid,
            userid: req.user.userid,
            leaveType,
            reason,
            fromDate,
            toDate,
            totalDays
        })

        try {
            await notification.notify({
                companyid: req.user.companyid,
                userid: req.user.userid,
                title: "Leave Request",
                message: `${member.firstname} ${member.firstname} requested leave.`,
                type: "leave_request",
                referenceid: leave._id
            });
        } catch (error) {
            console.error(error)
            return responseManager.onError(error, res)
        }

        return responseManager.onSuccess('Leave applied successfully', leave, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}