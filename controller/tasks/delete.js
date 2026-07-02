const Task = require('../../models/task.model')
const responseManager = require('../../utilities/response.manager')

exports.deleteTask = async (req, res) => {
    try {
        const { taskid } = req.body
        const userid = req.user.userid

        if (!taskid) {
            return responseManager.badrequest({ message: "Please enter Id..." }, res)
        }

        const deleteTask = await Task.findOneAndDelete({
            _id: taskid,
            companyid: req.user.companyid
        })

        if (!deleteTask) {
            return responseManager.badrequest({ message: "Task not found or not authorized" }, res)
        }

        return responseManager.onSuccess('Task removed successfully', deleteTask, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}