const Task = require('../../models/task.model')
const responseManager = require('../../utilities/response.manager')

exports.getontask = async (req, res) => {
    try {
        const { taskid } = req.body
        const userid = req.user.userid

        if (!taskid) {
            return responseManager.badrequest({ message: "Please enter Id..." }, res)
        }

        const task = await Task.findById({ _id: taskid, companyid: req.user.companyid }).lean()

        if (!task) {
            return responseManager.badrequest({ message: "Task not found" }, res)
        }

        const minutes = task.totalWorkedMinutes || 0

        const response = {
            ...task,
            workDuration: minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : "0m",
            isRunning: task.status === "in_progress",
            progress: task.status === "completed" ? 100 : task.status === "in_progress" ? 50 : 0 
        }

        return responseManager.onSuccess("Task fetched", response, res)

    } catch (error) {
        console.error(error)
        return responseManager.onError(error, res)
    }
}