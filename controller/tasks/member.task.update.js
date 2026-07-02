const Task = require('../../models/task.model')
const responseManager = require('../../utilities/response.manager')

exports.updatebyMember = async (req, res) => {
    try {
        const { taskid, status } = req.body
        const userid = req.user.userid

        if (!taskid) {
            return responseManager.badrequest({ message: "Please enter Task id..." }, res)
        }

        if (!status) {
            return responseManager.badrequest({ message: "Status is required" }, res)
        }

        const task = await Task.findById({ _id: taskid, assignedTo: userid, companyid: req.user.companyid })

        if (!task) {
            return responseManager.badrequest({ message: "Task not found or not assigned to you" }, res)
        }

        const updatedTask = await Task.findByIdAndUpdate(
            { _id: taskid, assignedTo: userid, companyid: req.user.companyid  },
            { $set: { status } },
            { new: true, runValidators: true }
        )

        return responseManager.onSuccess('Task status updated successfully!', updatedTask, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}